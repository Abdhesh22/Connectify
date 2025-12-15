import { Controller } from "react-hook-form";
import type { Control, FieldValues, FieldPath, RegisterOptions } from "react-hook-form";
import CustomInput from "../custom-tags/CustomInput";

type ControlledInputProps<T extends FieldValues> = {
    name: FieldPath<T>;
    control: Control<T>;
    rules?: RegisterOptions<T>;
    placeholder?: string;
    type?: string;
    className?: string;
}

const CustomInputField = <T extends FieldValues>({
    name,
    control,
    rules,
    placeholder,
    type = "text",
    className = "",
}: ControlledInputProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <CustomInput
                    {...field}
                    type={type}
                    placeholder={placeholder}
                    error={fieldState.error?.message}
                    className={className}
                />
            )}
        />
    );
};

export default CustomInputField;