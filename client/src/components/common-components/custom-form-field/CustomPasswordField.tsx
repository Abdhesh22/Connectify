import { Controller } from "react-hook-form";
import type {
    Control,
    FieldValues,
    FieldPath,
    RegisterOptions,
} from "react-hook-form";
import CustomPassword from "../custom-tags/CustomPassword";

interface ControlledPasswordProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    rules?: RegisterOptions<T>;
    placeholder?: string;
    className?: string;
}

const passwordRules = {
    required: "Password is required",
    minLength: {
        value: 8,
        message: "Password must be at least 8 characters",
    },
    validate: {
        hasUppercase: (v: string) =>
            /[A-Z]/.test(v) || "Must include at least one uppercase letter",
        hasLowercase: (v: string) =>
            /[a-z]/.test(v) || "Must include at least one lowercase letter",
        hasNumber: (v: string) =>
            /\d/.test(v) || "Must include at least one number",
        hasSpecialChar: (v: string) =>
            /[@$!%*?&#]/.test(v) ||
            "Must include at least one special character",
    },
};

const CustomPasswordField = <T extends FieldValues>({
    name,
    control,
    rules,
    placeholder,
    className = "",
}: ControlledPasswordProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...passwordRules, ...rules }} // allow override
            render={({ field }) => (
                <CustomPassword
                    {...field}
                    placeholder={placeholder}
                    className={className}
                />
            )}
        />
    );
};

export default CustomPasswordField;