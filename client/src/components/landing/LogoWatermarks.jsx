import React from 'react'

/**
 * Decorative floating logo watermarks scattered across the page.
 */
export default function LogoWatermarks({ src }) {
  const positions = [
    { top: '5%', left: '3%', size: 180, rotate: -15, opacity: 0.18, delay: 0, float: 'float-1' },
    { top: '8%', right: '4%', left: 'auto', size: 140, rotate: 12, opacity: 0.16, delay: 0.4, float: 'float-2' },
    { top: '25%', left: '-3%', right: 'auto', size: 160, rotate: -10, opacity: 0.15, delay: 0.8, float: 'float-3' },
    { top: '30%', right: '-2%', left: 'auto', size: 150, rotate: 8, opacity: 0.15, delay: 0.2, float: 'float-1' },
    { top: '55%', left: '2%', right: 'auto', size: 170, rotate: 5, opacity: 0.16, delay: 0.6, float: 'float-2' },
    { top: '60%', right: '1%', left: 'auto', size: 140, rotate: -8, opacity: 0.15, delay: 1, float: 'float-3' },
    { bottom: '20%', left: '4%', right: 'auto', size: 160, rotate: -12, opacity: 0.17, delay: 0.3, float: 'float-1' },
    { bottom: '25%', right: '3%', left: 'auto', size: 180, rotate: 10, opacity: 0.18, delay: 0.7, float: 'float-2' },
    { bottom: '5%', left: '25%', right: 'auto', size: 120, rotate: 6, opacity: 0.14, delay: 0.5, float: 'float-3' },
    { top: '42%', right: '20%', left: 'auto', size: 100, rotate: -6, opacity: 0.12, delay: 0.9, float: 'float-1' },
    { top: '75%', left: '15%', right: 'auto', size: 110, rotate: 4, opacity: 0.13, delay: 0.1, float: 'float-2' },
  ]

  return (
    <div
      className="logo-watermarks"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      {positions.map((pos, i) => {
        const { size, rotate, opacity, delay, float, ...place } = pos
        return (
          <div
            key={i}
            className="logo-watermark"
            style={{
              position: 'absolute',
              ...place,
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <img
              src={src}
              alt=""
              className={`logo-watermark-img ${float}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity,
                animationDelay: `${delay}s`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
