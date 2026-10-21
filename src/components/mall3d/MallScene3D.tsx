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
    camera.position.set(NORTH_SHIFT / 2 + 70, 210, 470)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.maxPolarAngle = Math.PI / 2.15
    controls.minDistance = 60
    controls.maxDistance = 560
    controls.target.set(NORTH_SHIFT / 2 + 70, 70, 20)

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

    // ===== BFC 外滩金融中心 · 程序化重建（参考真实建筑）=====
    // Foster+Partners + Heatherwick Studio，42 万㎡ / 8 栋楼：
    //   · 南端 180m 双子塔：玻璃幕墙 + 花岗岩框架 + 青铜冠带
    //   · 中央广场复星艺术中心「会跳舞的房子」：青铜基座架空 + 675 根金色流苏幕帘（三层、波浪底边）
    //   · 北侧较低楼群（写字楼/酒店）：石材+玻璃，呼应老外滩比例
    //   · 材质语言：高性能玻璃 + 手工花岗岩框 + 青铜嵌板
    const footprint = 100 * SCALE // 140
    const groundY = -2
    const podiumTop = levelY(maxLevel) + 2 // 商场裙楼顶（店铺所在）
    const towerH = (podiumTop - groundY) * 1.5 // 双子塔高度（远高于裙楼，读作「塔」）
    const southCx = 50 * SCALE
    const southCz = 50 * SCALE
    const northCx = 50 * SCALE + NORTH_SHIFT
    const northCz = 50 * SCALE

    // 材质：花岗岩 / 玻璃 / 青铜 / 深石
    const graniteMat = new THREE.MeshStandardMaterial({ color: 0x8c8578, roughness: 0.88, metalness: 0.06 })
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93b8cf,
      roughness: 0.12,
      metalness: 0.22,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    })
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.4, metalness: 0.95 })
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x2b2620, roughness: 0.9, metalness: 0.05 })

    // —— 花岗岩裙楼基座（双区，承载店铺）——
    for (const [cx, cz, g] of [[southCx, southCz, southGroup], [northCx, northCz, northGroup]] as const) {
      const podium = new THREE.Mesh(new THREE.BoxGeometry(footprint + 10, 2.5, footprint + 10), graniteMat)
      podium.position.set(cx, groundY + 1.25, cz)
      podium.receiveShadow = true
      g.add(podium)
    }

    // —— 南端双子塔 ——
    for (let t = 0; t < 2; t++) {
      const cx = southCx + (t === 0 ? -38 : 38) // 西塔 / 东塔
      const cz = southCz
      const tw = 60
      const td = 86
      const tower = new THREE.Mesh(new THREE.BoxGeometry(tw, towerH, td), glassMat)
      tower.position.set(cx, groundY + towerH / 2, cz)
      tower.renderOrder = 1
      southGroup.add(tower)
      // 花岗岩四角框架
      for (const [dx, dz] of [[-tw / 2, -td / 2], [tw / 2, -td / 2], [-tw / 2, td / 2], [tw / 2, td / 2]] as const) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(4.5, towerH, 4.5), graniteMat)
        col.position.set(cx + dx, groundY + towerH / 2, cz + dz)
        southGroup.add(col)
      }
      // 青铜冠带
      const crown = new THREE.Mesh(new THREE.BoxGeometry(tw + 5, 2.2, td + 5), bronzeMat)
      crown.position.set(cx, groundY + towerH, cz)
      southGroup.add(crown)
    }

    // —— 北侧楼群（写字楼/酒店，石材+玻璃）——
    {
      const cx = northCx
      const cz = northCz
      const bw = footprint * 0.46
      const bd = footprint * 0.92
      const bh = (podiumTop - groundY) * 1.25 // 低于双子塔
      for (const dx of [-footprint * 0.26, footprint * 0.26]) {
        const block = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), glassMat)
        block.position.set(cx + dx, groundY + bh / 2, cz)
        block.renderOrder = 1
        northGroup.add(block)
        for (const [fx, fz] of [[-bw / 2, -bd / 2], [bw / 2, -bd / 2], [-bw / 2, bd / 2], [bw / 2, bd / 2]] as const) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(4, bh, 4), graniteMat)
          col.position.set(cx + dx + fx, groundY + bh / 2, cz + fz)
          northGroup.add(col)
        }
        const crown = new THREE.Mesh(new THREE.BoxGeometry(bw + 4, 2, bd + 4), bronzeMat)
        crown.position.set(cx + dx, groundY + bh, cz)
        northGroup.add(crown)
      }
    }

    // —— 复星艺术中心「会跳舞的房子」（金色流苏幕帘）——
    // 真实特征：青铜基座架空于两柱（呼应中国戏台）、675 根金色流苏挂三层轨道、底边类正弦波浪。
    const rectPoint = (t: number, hw: number, hd: number) => {
      const per = 2 * (2 * hw + 2 * hd)
      const d = t * per
      if (d < 2 * hw) return { x: -hw + d, z: -hd }
      if (d < 2 * hw + 2 * hd) return { x: hw, z: -hd + (d - 2 * hw) }
      if (d < 4 * hw + 2 * hd) return { x: hw - (d - 2 * hw - 2 * hd), z: hd }
      return { x: -hw, z: hd - (d - 4 * hw - 2 * hd) }
    }
    const artCx = (southCx + northCx) / 2
    const artCz = 50 * SCALE - 44
    const artW = 40
    const artD = 28
    const artDeckY = 16 // 架空层高度（两柱撑起的「戏台」）
    const artCoreH = 30
    // 两根立柱（架空）
    for (const px of [-artW / 2 + 6, artW / 2 - 6]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(6, artDeckY, 6), darkStoneMat)
      pillar.position.set(artCx + px, groundY + artDeckY / 2, artCz)
      scene.add(pillar)
    }
    // 青铜核心体量
    const artCore = new THREE.Mesh(new THREE.BoxGeometry(artW * 0.72, artCoreH, artD * 0.72), bronzeMat)
    artCore.position.set(artCx, groundY + artDeckY + artCoreH / 2, artCz)
    scene.add(artCore)
    // 金色流苏幕帘（三层同心 · 波浪底边）
    const artTopY = groundY + artDeckY + artCoreH
    const tasselGeo = new THREE.CylinderGeometry(1.05, 1.05, 1, 8)
    for (const layer of [
      { off: 0, color: 0xd8b24a },
      { off: 2.8, color: 0xc9962c },
      { off: 5.6, color: 0xe8cb78 },
    ]) {
      const mat = new THREE.MeshStandardMaterial({ color: layer.color, metalness: 1, roughness: 0.33 })
      const NT = 64
      for (let i = 0; i < NT; i++) {
        const t = i / NT
        const p = rectPoint(t, artW / 2 + layer.off, artD / 2 + layer.off)
        const len = Math.max(10, 26 + 17 * Math.sin(t * Math.PI * 7)) // 类正弦波浪底边
        const tube = new THREE.Mesh(tasselGeo, mat)
        tube.scale.y = len
        tube.position.set(artCx + p.x, artTopY - len / 2, artCz + p.z)
        scene.add(tube)
      }
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
