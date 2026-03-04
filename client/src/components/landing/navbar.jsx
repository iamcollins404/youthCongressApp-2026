import React from 'react'
import ylogo from '../../assets/images/ylogo.png'

function Navbar() {
  return (
    <div className="absolute w-full p-2 sm:p-4 z-50 max-sm:flex max-sm:justify-center sm:flex sm:justify-center">
      <a href="/" className="hover:scale-105 transition-transform duration-300">
        <img src={ylogo} alt="Youth Congress Logo" className="logo-mobile-big w-32 sm:w-44 max-sm:block max-sm:mx-auto max-sm:mt-3" />
      </a>
    </div>
  )
}

export default Navbar