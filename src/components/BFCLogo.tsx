import type { SVGProps } from 'react'

interface BFCLogoProps extends SVGProps<SVGSVGElement> {
  size?: number
  showText?: boolean
  variant?: 'gold' | 'dark' | 'light'
}

export default function BFCLogo({
  size = 40,
  showText = true,
  variant = 'gold',
  ...props
}: BFCLogoProps) {
  const gold = variant === 'gold' ? '#C9A96E' : variant === 'dark' ? '#1C1C1E' : '#FFFFFF'
  const goldLight = variant === 'gold' ? '#E8DCC0' : variant === 'dark' ? '#6B6B6B' : '#FFFFFF'
  const textColor = variant === 'gold' ? '#1C1C1E' : variant === 'dark' ? '#1C1C1E' : '#FFFFFF'

  if (!showText) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="24" cy="24" r="23" stroke={gold} strokeWidth="1.5" />
        {[0, 1, 2, 3, 4, 5].map(i => {
          const y = 8 + i * 6.4
          return (
            <ellipse
              key={i}
              cx="24"
              cy={y}
              rx={22 - Math.abs(y - 24) * 0.85}
              ry="3.2"
              stroke={i === 2 || i === 3 ? gold : goldLight}
              strokeWidth="1.2"
              fill="none"
            />
          )
        })}
      </svg>
    )
  }

  const width = size * 4.2
  const height = size * 1.15
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Globe mark */}
      <g transform={`translate(${size * 0.08}, ${height / 2 - size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} stroke={gold} strokeWidth={size / 32} />
        {[0, 1, 2, 3, 4, 5].map(i => {
          const y = size * 0.17 + i * (size * 0.133)
          const rx = (size / 2 - 2) - Math.abs(y - size / 2) * 0.85
          return (
            <ellipse
              key={i}
              cx={size / 2}
              cy={y}
              rx={rx}
              ry={size * 0.067}
              stroke={i === 2 || i === 3 ? gold : goldLight}
              strokeWidth={size / 40}
              fill="none"
            />
          )
        })}
      </g>

      {/* Wordmark */}
      <g transform={`translate(${size * 1.1}, 0)`}>
        <text
          x="0"
          y={height * 0.48}
          fill={textColor}
          fontFamily="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
          fontSize={size * 0.58}
          fontWeight="600"
          letterSpacing={size * 0.02}
        >
          BFC
        </text>
        <text
          x="0"
          y={height * 0.72}
          fill={textColor}
          fontFamily="'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
          fontSize={size * 0.16}
          fontWeight="500"
          letterSpacing={size * 0.025}
          opacity="0.72"
        >
          THE BUND FINANCE CENTRE
        </text>
        <text
          x="0"
          y={height * 0.92}
          fill={textColor}
          fontFamily="var(--font-display), 'Songti SC', STSong, serif"
          fontSize={size * 0.18}
          fontWeight="500"
          letterSpacing={size * 0.06}
          opacity="0.82"
        >
          外滩金融中心
        </text>
      </g>
    </svg>
  )
}
