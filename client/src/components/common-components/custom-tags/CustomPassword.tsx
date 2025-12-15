import React, { useState } from "react";

interface CustomPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const CustomPassword: React.FC<CustomPasswordProps> = ({
    className = "",
    ...props
}) => {
    const [show, setShow] = useState(false);

    return (
        <div className={`position-relative ${className}`}>
            <input
                {...props}
                type={show ? "text" : "password"}
                className="form-control pe-5"
            />

            <span
                className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer"
                onClick={() => setShow(!show)}
            >
                <i className={`bi bi-${show ? 'eye' : 'eye-slash'} fs-5`}></i>
            </span>
        </div>
    );
};

export default CustomPassword;