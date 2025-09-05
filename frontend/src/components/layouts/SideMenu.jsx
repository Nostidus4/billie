import React, { useContext } from 'react'
import { UserContext } from '@context/UserContext'
import { useNavigate } from 'react-router-dom'
import { SIDE_MENU_DATA } from '@utils/data';


const SideMenu = ({activeMenu}) => {
  const {user, clearUser} = useContext(UserContext);
  const navigate = useNavigate();
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
    <div className="w-full h-full bg-gray-50 p-6">
      {/* User Profile Section */}
      <div className="mb-8">
        {user?.profileImageUrl ? (
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-green-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
            <span className="text-green-600 font-semibold text-xl">
              {user?.userName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        )}
        <h5 className="text-center text-gray-800 font-semibold text-lg">
          {user?.userName || "User"}
        </h5>
        <p className="text-center text-gray-500 text-sm mt-1">
          {user?.email || ""}
        </p>
      </div>

      {/* Side Menu Items */}
      <div className="space-y-2">
        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu === item.label
                ? "text-white bg-green-600"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
            } py-3 px-6 rounded-lg mb-3 transition-all duration-200`}
            onClick={() => handleClick(item.path)}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SideMenu