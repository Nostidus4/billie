import { TextField } from "@mui/material";
import React from "react";

const TextInput = ({ onChange, value, name, type = "text", placeholder, fullWidth}) => {
  return (
    <TextField
      placeholder={placeholder}
      slotProps={{ input: { className: "h-10 px-3 py-2" }, htmlInput: {className : "!p-0"} }}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth={fullWidth}
    />
  );
};

export default TextInput;
