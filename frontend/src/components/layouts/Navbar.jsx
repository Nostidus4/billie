import React, { useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import { LuBell, LuSettings, LuUser } from 'react-icons/lu'
import SideMenu from '@components/layouts/SideMenu'

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false)

  return (
    <>
      {/* Main Navbar */}
      <div className='relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 shadow-lg shadow-green-200/50'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>
        
        <div className='relative flex items-center justify-between px-8 py-6'>
          {/* Left Section */}
          <div className='flex items-center gap-6'>
            <button 
              onClick={() => setOpenSideMenu(!openSideMenu)} 
              className='block lg:hidden text-white hover:text-green-100 transition-colors duration-200'
            >
              {
                openSideMenu ? <HiOutlineX className='text-2xl'/> : <HiOutlineMenu className='text-2xl'/>
              }
            </button>
            
            <div className='flex items-center gap-3'>
              <img src='/public/billie_logo.png' alt='Billie Logo' className='w-10 h-10 rounded-xl object-contain bg-white/20 p-1 backdrop-blur-sm' />
              <div>
                <h2 className='text-2xl font-bold text-white tracking-wide'>Billie</h2>
                <p className='text-sm text-white/80 -mt-1'>Personal Finance</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-4'>
            {/* Search Bar */}
            <div className='hidden md:flex items-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[300px]'>
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className='bg-transparent text-white placeholder-white/70 outline-none flex-1'
              />
              <div className='w-1 h-6 bg-white/30 mx-2'></div>
              <LuSettings className='text-white/70 text-lg' />
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-3'>
              <button className='p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm group'>
                <LuBell className='text-white text-xl group-hover:scale-110 transition-transform duration-200' />
              </button>
              
              <button className='p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm group'>
                <LuSettings className='text-white text-xl group-hover:scale-110 transition-transform duration-200' />
              </button>
              
              <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200 cursor-pointer'>
                <LuUser className='text-white text-lg' />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border Effect */}
        <div className='h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent'></div>
      </div>

      {/* Mobile Side Menu Overlay */}
      {
        openSideMenu && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden'>
            <div className='fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out'>
              <SideMenu activeMenu={activeMenu} />
            </div>
          </div>
        )
      }
    </>
  )
}

export default Navbar