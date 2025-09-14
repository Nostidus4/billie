import FormField from "@components/FormField";
import TextInput from "@components/FormInputs/TextInput";
import { Alert, Button } from "@mui/material";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

import { UserContext } from "@context/UserContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {updateUser} = useContext(UserContext);
  
  const onSubmit = async (values) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      setIsSubmitting(true);
      const payload = {
        fullName: values.userName,
        email: values.email,
        password: values.password,
      };
      const { data } = await axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);
      if (data) {
        localStorage.setItem("token", data.token);
        updateUser(data.user);
        setSuccessMsg("Đăng ký thành công. Vui lòng đăng nhập.");
        setTimeout(() => navigate("/login", { replace: true }), 800);
      }
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      setErrorMsg(serverMessage || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200">
      <div className="flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-3xl p-8 md:p-12 gap-8 max-w-3xl w-full">
        {/* Form Section */}
        <div className="flex-1 w-full max-w-md">
          <div className="mb-8">
            <p className="text-3xl font-bold text-green-700 mb-2 flex items-center gap-2">
              Adventure starts here 
            </p>
            <p className="font-light text-gray-500 text-base">Make your app management easy and fun!</p>
          </div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              name={"userName"}
              label={"Username"}
              control={control}
              Component={TextInput}
              placeholder={"John.doe"}
              fullWidth
            />
            <FormField
              name={"email"}
              label={"Email"}
              control={control}
              Component={TextInput}
              type={"email"}
              placeholder={"John.doe@gmail.com"}
              fullWidth
            />
            <FormField
              name={"password"}
              label={"Password"}
              control={control}
              Component={TextInput}
              type={"password"}
              fullWidth
            />
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #43A047 0%, #A5D6A7 100%)",
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: "1rem",
                paddingY: 1.2,
                marginTop: 2,
                boxShadow: 3,
                textTransform: "none",
                ':hover': { background: "linear-gradient(90deg, #A5D6A7 0%, #43A047 100%)" }
              }}
              fullWidth
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
            {errorMsg ? (<Alert severity="error">{errorMsg}</Alert>) : null}
            {successMsg ? (<Alert severity="success">{successMsg}</Alert>) : null}
    
          </form>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to={"/login"} className="text-green-600 font-semibold hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
        {/* Image Section */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <img
            src="Login_SignUp.jpg"
            alt="Sign Up Illustration"
            className="w-64 h-64 object-cover rounded-2xl shadow-lg border border-green-100"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
