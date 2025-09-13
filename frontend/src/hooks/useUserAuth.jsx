import { UserContext } from "@context/UserContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";


export const useUserAuth = () => {  
  const { user, updateUser, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ fetch user nếu chưa có user và có token
    const token = localStorage.getItem("token");
    if (user || !token) return;

    let isMounted = true;
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
        
        if(isMounted && response.data) {
          updateUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if(isMounted) {
          localStorage.removeItem("token"); // Clear invalid token
          clearUser();
          navigate("/login");
        }
      }
    };
    
    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array để tránh infinite loop
};