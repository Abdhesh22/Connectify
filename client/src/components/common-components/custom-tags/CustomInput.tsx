import React from "react";
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
    type = "text",
    name,
    value,
    placeholder,
    onChange,
    error,
    className = "",
    ...rest
}) => {
    return (
        <input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={`form-control ${error ? "is-invalid" : ""} ${className}`}
            {...rest}
        />
    );
};

export default CustomInput;