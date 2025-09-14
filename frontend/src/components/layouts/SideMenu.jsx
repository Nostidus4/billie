import React, { useContext } from 'react'
import { UserContext } from '@context/UserContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { SIDE_MENU_DATA } from '@utils/data';

const SideMenu = ({activeMenu}) => {
  const {user, clearUser} = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tự động detect active menu dựa trên URL hiện tại
  const getCurrentActiveMenu = () => {
    if (activeMenu) return activeMenu; // Ưu tiên prop nếu có
    
    const currentPath = location.pathname;
    const menuItem = SIDE_MENU_DATA.find(item => item.path === currentPath);
    return menuItem ? menuItem.label : null;
  };
  
  const currentActiveMenu = getCurrentActiveMenu();
  const handleClick = (route) => {
   if(route === "/logout") {
    handleLogout();
    return;
   } else {
    navigate(route);
   }
  }
  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate('/login');
  }
  
  return (
    <div className="w-80 h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl shadow-gray-200/50">

      {/* User Profile Section */}
      <div className="p-8 border-b border-gray-200/50">
        <div className="text-center">
          {user?.profileImageUrl ? (
            <img
              src={user?.profileImageUrl || ""}
              alt="Profile Image"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-green-200 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 border-4 border-green-200 shadow-lg">
              <span className="text-white font-bold text-3xl">
                {(user?.fullName || user?.userName)?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <h5 className="text-gray-800 font-bold text-xl mb-2">
            {(user?.fullName || user?.userName) || "User"}
          </h5>
          <p className="text-gray-500 text-base">
            {user?.email || ""}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-6">
        <h6 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Navigation</h6>
        <div className="space-y-2">
          {SIDE_MENU_DATA.map((item, index) => (
            <button
              key={`menu_${index}`}
              className={`w-full flex items-center gap-4 text-[15px] ${
                currentActiveMenu === item.label
                  ? "text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-200/50"
                  : "text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-md"
              } py-4 px-6 rounded-xl mb-2 transition-all duration-300 transform hover:scale-105`}
              onClick={() => handleClick(item.path)}
            >
              <span className="text-xl">
                {React.createElement(item.icon)}
              </span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default SideMenu