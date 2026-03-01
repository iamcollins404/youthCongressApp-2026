import React from 'react'
import ylogo from '../../assets/images/ylogo.png'

function Navbar() {
  return (
    <div className="absolute w-full p-4 sm:p-6 z-50 justify-center">
      <a href="/" className="hover:scale-105 transition-transform duration-300">
        <img src={ylogo} alt="Youth Congress Logo" className="w-32 sm:w-48" />
      </a>
    </div>
  )
}

export default Navbar