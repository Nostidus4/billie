import React, { useContext } from 'react'
import { UserContext } from '@context/UserContext'
import { useUserAuth } from '@hooks/useUserAuth'
import Navbar from '@components/layouts/Navbar'
import SideMenu from '@components/layouts/SideMenu'

const DashBoardLayout = ({activeMenu, children}) => {
   const { user } = useContext(UserContext);
   
   // Fetch user data when component mounts
   useUserAuth();
   
  return (
    <div className=''>
      <Navbar activeMenu={activeMenu} />
      <div className='flex'>
        <div className='max-[1080px]:hidden'>
          <SideMenu activeMenu={activeMenu}/>
        </div>
        <div className='grow mx-5'>{children}</div>
      </div>
    </div>
  )
}

export default DashBoardLayout