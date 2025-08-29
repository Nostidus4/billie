import FormField from "@components/FormField";
import TextInput from "@components/FormInputs/TextInput";
import { Button } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const Login = () => {
  const { control } = useForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200">
      <div className="flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-3xl p-8 md:p-12 gap-8 max-w-3xl w-full">
        {/* Form Section */}
        <div className="flex-1 w-full max-w-md">
          <div className="mb-8">
            <p className="text-3xl font-bold text-green-700 mb-2">
              Welcome to BILLIE!
            </p>
            <p className="font-light text-gray-500 text-base">
              Please sign in to your account and start the adventure
            </p>
          </div>
          <form className="flex flex-col gap-6">
            <FormField
              name={"userNameOrEmail"}
              label={"Username or Email"}
              control={control}
              Component={TextInput}
              placeholder={"John.doe"}
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
            <Link to={"/dashboard"}>
              <Button
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(90deg, #43A047 0%, #A5D6A7 100%)",
                  borderRadius: 9999,
                  fontWeight: 600,
                  fontSize: "1rem",
                  paddingY: 1.2,
                  marginTop: 2,
                  boxShadow: 3,
                  textTransform: "none",
                  ":hover": {
                    background:
                      "linear-gradient(90deg, #A5D6A7 0%, #43A047 100%)",
                  },
                }}
                fullWidth
              >Sign In</Button>
            </Link>
          </form>
          <p className="mt-6 text-center text-gray-600">
            New on our platform?{" "}
            <Link
              to={"/signup"}
              className="text-green-600 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
        {/* Image Section */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <img
            src="Login_SignUp.jpg"
            alt="Login Illustration"
            className="w-64 h-64 object-cover rounded-2xl shadow-lg border border-green-100"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
