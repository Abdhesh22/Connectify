import type React from "react";
import CustomInputField from "../common-components/custom-form-field/CustomInputField";
import CustomPasswordField from "../common-components/custom-form-field/CustomPasswordField";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiUserResponse } from "../../types/axios.type";
import { TOAST_MESSAGE } from "../../constants/message.constant";
import { toasty } from "../../utils/toasty.util";

type LoginForm = {
    email: string;
    password: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        defaultValues: {
            email: "",
            password: ""
        },
        mode: "onBlur"
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response: AxiosResponse<ApiUserResponse> = await axios.post('/api/auth/login', data);
            console.log('resp: ', response);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }
    }

    return <>
        <div className="container-fluid">
            <div className="row min-vh-100">

                {/* LEFT SIDE */}
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-secondary  text-white p-5">
                    <img
                        src="/images/logo.svg"
                        alt="Logo"
                        className="img-fluid mb-4"
                        style={{ maxWidth: "180px" }}
                    />

                    <h2 className="fw-bold">Welcome Back!</h2>
                    <p className="text-center mt-2">
                        Talk, text and stay in the moment.
                    </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-md-6 d-flex justify-content-center align-items-center bg-light">
                    <div className="card shadow p-4 w-75">
                        <h3 className="text-center mb-3 fw-bold">Login</h3>

                        <form onSubmit={handleSubmit(onSubmit)}>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Email *</label>
                                <CustomInputField<LoginForm>
                                    name="email"
                                    type="email"
                                    control={control}
                                    rules={{ required: "Email is required" }}
                                    placeholder="Enter your email"
                                    className="form-control"
                                />
                                {errors.email && (
                                    <div className="invalid-feedback d-block">
                                        {errors.email?.message}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Password *</label>
                                <CustomPasswordField<LoginForm>
                                    name="password"
                                    control={control}
                                    rules={{ required: "Password is required" }}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <div className="invalid-feedback d-block">
                                        {errors.password?.message}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                                Login
                            </button>

                            <p className="text-center mt-3 mb-0 text-muted">
                                Don’t have an account?{" "}
                                <span className="text-primary fw-semibold" onClick={() => navigate('/')}>Sign Up</span>
                            </p>
                        </form>
                    </div>
                </div>

            </div>
        </div>


    </>
}

export default Login