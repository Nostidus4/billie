import React from "react";
import { Controller } from "react-hook-form";

// eslint-disable-next-line no-unused-vars
const FormField = ({ control, label, name, Component, type, placeholder, fullWidth}) => {
  return (
    <div className="w-full">
      <p className="mb-1 font-bold text-sm text-dark-100">{label}</p>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, name, value = "" } }) => { 
          return (
            <Component
              onChange={onChange}
              value={value ?? ""} 
              name={name}
              control={control}
              type={type}
              placeholder={placeholder}
              fullWidth={fullWidth}
            />
          );
        }}
      />
    </div>
  );
};

export default FormField;
