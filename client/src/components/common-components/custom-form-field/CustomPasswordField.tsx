import { Controller } from "react-hook-form";
import type { Control, FieldValues, FieldPath, RegisterOptions } from "react-hook-form";
import CustomPassword from "../custom-tags/CustomPassword";

interface ControlledPasswordProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    rules?: RegisterOptions<T>;
    placeholder?: string;
    className?: string;
}

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
            rules={rules}
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
