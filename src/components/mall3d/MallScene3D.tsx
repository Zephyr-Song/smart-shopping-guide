import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { Store } from '../../data/mockData'

export interface CategoryColor {
  name: string
  color: string
}

interface MallScene3DProps {
  stores: Store[]
  categories: CategoryColor[]
  zoneFilter?: 'all' | 'south' | 'north'
  /** 按层高过滤（null/undefined = 全部），跨南区/北区 */
  floorFilter?: number | null
  focusStoreId?: string | null
  resetSignal?: number
  onSelect?: (store: Store | null) => void
  onHover?: (store: Store | null) => void
}

/** 楼层字符串 → 数字层高（L4→4, B1→-1, S1-5F→5, N-L3-5F→5） */
function floorLevel(floor: string): number {
  const nums = floor.match(/\d+/g)?.map(Number) ?? [1]
  let level = nums[nums.length - 1]
  if (/B/i.test(floor)) level = -level
  return level
}

function zoneOf(store: Store): 'south' | 'north' {
  return store.id.toLowerCase().startsWith('s') ? 'south' : 'north'
}

const SCALE = 1.4 // 数据单位 → 世界单位
const FLOOR_H = 16 // 每层高度
const NORTH_SHIFT = 100 * SCALE + 48 // 北区整体右移，避免与南区重叠
const BOX_W = 9
const BOX_D = 9
const BOX_H = 12

/** 用 canvas 画一个文字标牌（程序化生成，不依赖任何外部素材） */
function makeLabelSprite(text: string): THREE.Sprite {
  const pad = 8
  const font = 28
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = `${font}px "PingFang SC", "Microsoft YaHei", sans-serif`
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2
  const h = font + pad * 2
  canvas.width = w
  canvas.height = h
  // 半透明底
  ctx.fillStyle = 'rgba(20,18,16,0.78)'
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, 8)
  ctx.fill()
  ctx.font = `${font}px "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, w / 2, h / 2 + 1)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  const scale = 0.12
  sprite.scale.set(w * scale, h * scale, 1)
  return sprite
}

function makeZoneLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const font = 44
  ctx.font = `bold ${font}px "PingFang SC", "Microsoft YaHei", sans-serif`
  const w = Math.ceil(ctx.measureText(text).width) + 32
  const h = font + 24
  canvas.width = w
  canvas.height = h
  ctx.font = `bold ${font}px "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.fillStyle = '#c9a96e'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, w / 2, h / 2 + 1)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  const scale = 0.16
  sprite.scale.set(w * scale, h * scale, 1)
  return sprite
}

export default function MallScene3D({
  stores,
  categories,
  zoneFilter = 'all',
  floorFilter,
  focusStoreId,
  onSelect,
  onHover,
  resetSignal,
}: MallScene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  const onHoverRef = useRef(onHover)
  onSelectRef.current = onSelect
  onHoverRef.current = onHover

  // 场景内可变状态用 ref 保存，避免重复构建
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    pickables: THREE.Mesh[]
    byId: Map<string, THREE.Mesh>
    southGroup: THREE.Group
    northGroup: THREE.Group
    hovered: THREE.Mesh | null
    selected: THREE.Mesh | null
    raf: number
    resizeObs: ResizeObserver
    defaultCam: THREE.Vector3
    defaultTarget: THREE.Vector3
    flyCam: THREE.Vector3 | null
    flyTarget: THREE.Vector3 | null
  } | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const colorMap = new Map(categories.map(c => [c.name, c.color]))
    const fallbackColor = '#9ca3af'

    // 楼层归一化：把最低层抬到地面以上，避免 B1/B2/B3 被埋进地下看不见/点不到。
    // 例：最低 B3(-3) → LEVEL_OFFSET=3，则 B3 落在 y=0 这一层，往上逐层递增。
    const allLevels = stores.map(s => floorLevel(s.floor))
    const minLevel = Math.min(...allLevels, 0)
    const maxLevel = Math.max(...allLevels, 1)
    const LEVEL_OFFSET = -minLevel
    const levelY = (level: number) => (level + LEVEL_OFFSET) * FLOOR_H

    // —— 渲染器 ——
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x14110e, 1)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.cursor = 'grab'

    // —— 场景 ——
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x14110e, 320, 620)

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      2000,
    )
    camera.position.set(NORTH_SHIFT / 2, 175, 380)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.maxPolarAngle = Math.PI / 2.15
    controls.minDistance = 60
    controls.maxDistance = 560
    controls.target.set(NORTH_SHIFT / 2, 58, 50 * SCALE - 70)

    // —— 灯光 ——
    scene.add(new THREE.AmbientLight(0xfff3e0, 0.55))
    const hemi = new THREE.HemisphereLight(0xfff0d0, 0x20242b, 0.6)
    scene.add(hemi)
    const key = new THREE.DirectionalLight(0xfff1d0, 1.15)
    key.position.set(160, 320, 220)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 50
    key.shadow.camera.far = 900
    key.shadow.camera.left = -300
    key.shadow.camera.right = 300
    key.shadow.camera.top = 300
    key.shadow.camera.bottom = -300
    scene.add(key)
    // 反向补光，避免背光面死黑
    const fill = new THREE.DirectionalLight(0x9fb8ff, 0.45)
    fill.position.set(-220, 140, -160)
    scene.add(fill)

    // —— 地面 ——
    const groundSize = NORTH_SHIFT + 100 * SCALE + 120
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(groundSize, groundSize),
      new THREE.MeshStandardMaterial({ color: 0x1d1a16, roughness: 0.95, metalness: 0.0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.set(NORTH_SHIFT / 2, -2, 50 * SCALE - 70)
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(groundSize, 60, 0x3a3329, 0x2a251e)
    grid.position.copy(ground.position)
    grid.position.y = -1.5
    scene.add(grid)

    // —— 双区 group ——
    const southGroup = new THREE.Group()
    const northGroup = new THREE.Group()
    scene.add(southGroup, northGroup)
    // 店名标签单独成组：远看隐藏、拉近才显示，避免 90 个标签糊成一片
    const labelGroup = new THREE.Group()
    scene.add(labelGroup)

    const pickables: THREE.Mesh[] = []
    const byId = new Map<string, THREE.Mesh>()
    const boxGeo = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D)
    const edgeGeo = new THREE.EdgesGeometry(boxGeo)
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })

    for (const store of stores) {
      const zone = zoneOf(store)
      const level = floorLevel(store.floor)
      const colorHex = colorMap.get(store.category) ?? fallbackColor
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.45,
        metalness: 0.25,
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 0.18,
      })
      const box = new THREE.Mesh(boxGeo, mat)
      box.castShadow = true
      box.receiveShadow = true
      // 描边增强体块感，避免「一坨色块」的粗糙观感
      box.add(new THREE.LineSegments(edgeGeo, edgeMat))

      const localX = store.x * SCALE
      const localZ = store.y * SCALE
      const worldX = zone === 'north' ? localX + NORTH_SHIFT : localX
      const worldZ = localZ
      const worldY = levelY(level) + BOX_H / 2
      box.position.set(worldX, worldY, worldZ)

      const label = makeLabelSprite(store.name)
      label.position.set(worldX, worldY + BOX_H / 2 + 4, worldZ)
      box.userData = { store, baseEmissive: 0.18, label }

      ;(zone === 'south' ? southGroup : northGroup).add(box)
      labelGroup.add(label)
      pickables.push(box)
      byId.set(store.id, box)
    }

    // —— 楼层底板（按区×层生成薄板）——
    const slabs: { zone: 'south' | 'north'; level: number }[] = []
    for (const store of stores) {
      const z = zoneOf(store)
      const l = floorLevel(store.floor)
      if (!slabs.some(s => s.zone === z && s.level === l)) slabs.push({ zone: z, level: l })
    }
    for (const s of slabs) {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(100 * SCALE, 1.2, 100 * SCALE),
        // 南区偏暖、北区偏冷，一眼区分两栋楼
        new THREE.MeshStandardMaterial({
          color: s.zone === 'south' ? 0x3a2c1e : 0x1e2c3a,
          roughness: 0.9,
          metalness: 0.05,
        }),
      )
      const cx = (s.zone === 'north' ? 50 * SCALE + NORTH_SHIFT : 50 * SCALE)
      slab.position.set(cx, levelY(s.level) - 0.6, 50 * SCALE)
      slab.receiveShadow = true
      ;(s.zone === 'south' ? southGroup : northGroup).add(slab)
    }

    // —— 楼体外壳：让每个区读起来像一栋楼，而非悬浮色块 ——
    const footprint = 100 * SCALE // 140
    const groundY = -2
    const roofY = levelY(maxLevel) + FLOOR_H + 2 // 顶楼之上留出屋顶高度
    const buildingH = roofY - groundY

    for (const zone of ['south', 'north'] as const) {
      const cx = zone === 'north' ? 50 * SCALE + NORTH_SHIFT : 50 * SCALE
      const cz = 50 * SCALE
      const g = zone === 'south' ? southGroup : northGroup

      // 玻璃幕墙外壳（半透明，罩住整栋楼，内部亮灯铺位仍清晰可见）
      const shell = new THREE.Mesh(
        new THREE.BoxGeometry(footprint, buildingH, footprint),
        new THREE.MeshStandardMaterial({
          color: 0x9fc8dc,
          roughness: 0.15,
          metalness: 0.15,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        }),
      )
      shell.position.set(cx, groundY + buildingH / 2, cz)
      shell.renderOrder = 2
      g.add(shell)

      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(footprint + 6, 2.5, footprint + 6),
        new THREE.MeshStandardMaterial({ color: 0x241f18, roughness: 0.8, metalness: 0.1 }),
      )
      roof.position.set(cx, roofY + 1, cz)
      roof.castShadow = true
      roof.receiveShadow = true
      g.add(roof)

      // 基座（裙楼）
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(footprint + 12, 3, footprint + 12),
        new THREE.MeshStandardMaterial({ color: 0x2a241c, roughness: 0.9, metalness: 0.05 }),
      )
      plinth.position.set(cx, groundY - 1.5, cz)
      plinth.receiveShadow = true
      g.add(plinth)

      // 四角立柱
      const colMat = new THREE.MeshStandardMaterial({ color: 0x4a4238, roughness: 0.5, metalness: 0.4 })
      const half = footprint / 2
      for (const [dx, dz] of [[-half, -half], [half, -half], [-half, half], [half, half]] as const) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(3, buildingH, 3), colMat)
        col.position.set(cx + dx, groundY + buildingH / 2, cz + dz)
        g.add(col)
      }
    }

    // —— BFC 外观致敬：南楼「金色竹幕」立面 + 双楼金色屋顶收边 ——
    // 复星艺术中心标志性的黄铜「流苏/竹幕」是 BFC 最强视觉记忆点；
    // 这里用程序化竖排黄铜圆柱在南楼临街两面复现这一意象（风格化致敬，非照片级还原）。
    const bambooGeo = new THREE.CylinderGeometry(1.2, 1.2, buildingH + 4, 10)
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1.0, roughness: 0.32 })
    const southCx = 50 * SCALE
    const southCz = 50 * SCALE
    const halfFoot = footprint / 2
    const N = 24
    const bambooOff = 3 // 竹幕外挂在玻璃立面之外
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const along = -halfFoot + t * footprint
      // 临街正面（z 负侧）
      const front = new THREE.Mesh(bambooGeo, bambooMat)
      front.position.set(southCx + along, groundY + buildingH / 2, southCz - halfFoot - bambooOff)
      southGroup.add(front)
      // 西侧立面（x 负侧）
      if (i > 0 && i < N) {
        const side = new THREE.Mesh(bambooGeo, bambooMat)
        side.position.set(southCx - halfFoot - bambooOff, groundY + buildingH / 2, southCz + along)
        southGroup.add(side)
      }
    }

    // 金色屋顶收边（双楼，呼应 BFC 暖金主调）
    const goldBandMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.9, roughness: 0.35 })
    for (const zone of ['south', 'north'] as const) {
      const cx = zone === 'north' ? 50 * SCALE + NORTH_SHIFT : 50 * SCALE
      const g = zone === 'south' ? southGroup : northGroup
      const band = new THREE.Mesh(new THREE.BoxGeometry(footprint + 4, 1.6, footprint + 4), goldBandMat)
      band.position.set(cx, roofY + 0.2, 50 * SCALE)
      g.add(band)
    }

    // —— 区名标牌 ——
    const topY = levelY(maxLevel) + 18
    const southLabel = makeZoneLabel('南区 South Retail')
    southLabel.position.set(50 * SCALE, topY, 50 * SCALE)
    southGroup.add(southLabel)
    const northLabel = makeZoneLabel('北区 North Retail')
    northLabel.position.set(50 * SCALE + NORTH_SHIFT, topY, 50 * SCALE)
    northGroup.add(northLabel)

    // —— 射线拾取 ——
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let downPos: { x: number; y: number } | null = null

    const setHover = (mesh: THREE.Mesh | null) => {
      const st = stateRef.current
      if (!st) return
      if (st.hovered === mesh) return
      if (st.hovered) {
        const m = st.hovered.material as THREE.MeshStandardMaterial
        m.emissiveIntensity = (st.hovered.userData.baseEmissive as number)
        ;(st.hovered.userData.label as THREE.Sprite).scale.multiplyScalar(1 / 1.25)
      }
      st.hovered = mesh
      if (mesh) {
        const m = mesh.material as THREE.MeshStandardMaterial
        m.emissiveIntensity = 0.55
        ;(mesh.userData.label as THREE.Sprite).scale.multiplyScalar(1.25)
        renderer.domElement.style.cursor = 'pointer'
      } else {
        renderer.domElement.style.cursor = 'grab'
      }
      const store = mesh?.userData.store as Store | undefined
      onHoverRef.current?.(store ?? null)
    }

    // 判断「有效可见」：Raycaster 不检查 visible，需手动排除被楼层/区域隐藏的方块
    const isEffectivelyVisible = (obj: THREE.Object3D): boolean => {
      let o: THREE.Object3D | null = obj
      while (o) {
        if (!o.visible) return false
        o = o.parent
      }
      return true
    }

    const pickAt = (clientX: number, clientY: number): THREE.Mesh | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(pickables, false).filter(h => isEffectivelyVisible(h.object))
      return (hits[0]?.object as THREE.Mesh) ?? null
    }

    const onPointerMove = (e: PointerEvent) => {
      const mesh = pickAt(e.clientX, e.clientY)
      setHover(mesh)
    }
    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY }
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!downPos) return
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y)
      downPos = null
      if (moved > 6) return // 拖拽旋转，不算点击
      const mesh = pickAt(e.clientX, e.clientY)
      const st = stateRef.current
      if (!st) return
      if (st.selected && st.selected !== mesh) {
        const m = st.selected.material as THREE.MeshStandardMaterial
        m.emissiveIntensity = (st.selected.userData.baseEmissive as number)
      }
      st.selected = mesh
      if (mesh) {
        const m = mesh.material as THREE.MeshStandardMaterial
        m.emissiveIntensity = 0.8
        onSelectRef.current?.(mesh.userData.store as Store)
      } else {
        onSelectRef.current?.(null)
      }
    }
    const onLeave = () => setHover(null)

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointerleave', onLeave)

    // —— resize ——
    const resizeObs = new ResizeObserver(() => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObs.observe(mount)

    // —— 渲染循环 ——
    const animate = () => {
      const st = stateRef.current
      if (!st) return
      // 平滑飞向目标：同时插值相机位置与注视点，到位后停止
      if (st.flyCam && st.flyTarget) {
        st.camera.position.lerp(st.flyCam, 0.1)
        st.controls.target.lerp(st.flyTarget, 0.14)
        if (st.camera.position.distanceTo(st.flyCam) < 2.5) {
          st.flyCam = null
          st.flyTarget = null
        }
      }
      st.controls.update()
      // 店名标签按相机距离显隐：远景只看楼宇，拉近后浮现店名（避免 90 个标签糊脸）
      labelGroup.visible = st.camera.position.distanceTo(st.controls.target) < 260
      st.renderer.render(st.scene, st.camera)
      st.raf = requestAnimationFrame(animate)
    }

    stateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      pickables,
      byId,
      southGroup,
      northGroup,
      hovered: null,
      selected: null,
      raf: 0,
      resizeObs,
      defaultCam: camera.position.clone(),
      defaultTarget: controls.target.clone(),
      flyCam: null,
      flyTarget: null,
    }
    stateRef.current.raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(stateRef.current?.raf ?? 0)
      resizeObs.disconnect()
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      controls.dispose()
      // 释放几何/材质
      scene.traverse(obj => {
        const any = obj as THREE.Mesh
        if (any.geometry && any.geometry !== boxGeo) any.geometry.dispose?.()
        const mat = (any as THREE.Mesh).material
        if (mat) {
          const mats = Array.isArray(mat) ? mat : [mat]
          for (const m of mats) {
            const sm = m as THREE.MeshStandardMaterial
            sm.map?.dispose?.()
            sm.dispose?.()
          }
        }
        if ((obj as THREE.Sprite).isSprite) {
          const sp = obj as THREE.Sprite
          ;(sp.material as THREE.SpriteMaterial).map?.dispose?.()
        }
      })
      boxGeo.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      stateRef.current = null
    }
    // 仅在挂载时构建一次；数据静态，无需随 props 重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 双区显隐
  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    st.southGroup.visible = zoneFilter === 'all' || zoneFilter === 'south'
    st.northGroup.visible = zoneFilter === 'all' || zoneFilter === 'north'
  }, [zoneFilter])

  // 楼层显隐：按层高（level）显隐店铺方块与标签，跨南区/北区；楼宇外壳保持完整
  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    const showAll = floorFilter == null
    st.byId.forEach(mesh => {
      const store = mesh.userData.store as Store
      const show = showAll || floorLevel(store.floor) === floorFilter
      mesh.visible = show
      const label = mesh.userData.label as THREE.Sprite
      if (label) label.visible = show
    })
  }, [floorFilter])

  // 聚焦某店铺：移动 target + 高亮
  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    if (st.selected && focusStoreId && st.byId.get(focusStoreId) !== st.selected) {
      const m = st.selected.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = (st.selected.userData.baseEmissive as number)
      st.selected = null
    }
    if (!focusStoreId) return
    const mesh = st.byId.get(focusStoreId)
    if (!mesh) return
    // 让相机平滑飞向该店铺：目标注视点取方块中心，相机停在斜上方 40/36/66 处
    st.flyTarget = mesh.position.clone()
    st.flyCam = mesh.position.clone().add(new THREE.Vector3(40, 38, 66))
    const m = mesh.material as THREE.MeshStandardMaterial
    m.emissiveIntensity = 0.8
    st.selected = mesh
  }, [focusStoreId])

  // 重置视角：恢复默认机位
  useEffect(() => {
    if (!resetSignal) return
    const st = stateRef.current
    if (!st) return
    st.flyCam = st.defaultCam.clone()
    st.flyTarget = st.defaultTarget.clone()
  }, [resetSignal])

  return <div ref={mountRef} className="absolute inset-0" />
}
