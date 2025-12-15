import { useForm } from "react-hook-form";
import CustomInputField from "../common-components/custom-form-field/CustomInputField";
import CustomPasswordField from "../common-components/custom-form-field/CustomPasswordField";
import { useNavigate } from "react-router-dom";
import { toasty } from "../../utils/toasty.util";
import { TOAST_MESSAGE } from "../../constants/message.constant";
import axios, { AxiosError, type AxiosResponse } from "axios";
import OTPModal from "./Otp";
import { useState } from "react";
import type { ApiSuccessResponse, ApiUserResponse } from "../../types/axios.type";

type SignUpForm = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const Signup = () => {

    const navigate = useNavigate();
    const [optModal, setOtpModal] = useState({
        open: false,
        email: ''
    });


    const { control, handleSubmit, formState: { errors }, getValues } = useForm<SignUpForm>({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: ""
        },
        mode: "onBlur"
    });


    const openOtpModal = async (data: SignUpForm) => {

        try {

            const response: AxiosResponse<ApiSuccessResponse> = await axios.get(`http://localhost:3000/auth/email-exist`, {
                params: {
                    email: data.email
                }
            })

            if (response.data.success) {
                setOtpModal({
                    open: true,
                    email: data.email
                });
            }

        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }

    };


    const onSubmit = async () => {
        try {

            setOtpModal({
                open: false,
                email: ""
            })

            const payload = {
                firstName: getValues('firstName'),
                lastName: getValues('lastName'),
                email: getValues('email'),
                password: getValues('password')
            }

            const response: AxiosResponse<ApiUserResponse> = await axios.post('http://localhost:3000/auth/register', payload);
            toasty.success(response.data.message);

        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }
    };
    return (
        <>
            <div className="container-fluid">
                <div className="row min-vh-100">

                    {/* LEFT SIDE */}
                    <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-secondary text-white p-5">
                        <img
                            src="/images/logo.svg"
                            alt="Logo"
                            className="img-fluid mb-4"
                            style={{ maxWidth: "180px" }}
                        />

                        <h2 className="fw-bold">Join Us!</h2>
                        <p className="text-center mt-2">
                            Talk, text and stay in the moment.
                        </p>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-md-6 d-flex justify-content-center align-items-center bg-light">
                        <div className="card shadow-lg p-4 w-75">
                            <h3 className="text-center mb-3 fw-bold">Create an Account</h3>
                            <p className="text-center text-muted mb-4">
                                Talk, text and stay in the moment.
                            </p>

                            <form onSubmit={handleSubmit(openOtpModal)}>
                                <div className="row g-3 mb-3">

                                    <div className="col-6">
                                        <label className="form-label fw-semibold">First Name *</label>
                                        <CustomInputField<SignUpForm>
                                            name="firstName"
                                            control={control}
                                            rules={{ required: "First name is required" }}
                                            placeholder="Enter first name"
                                            className="form-control"
                                        />
                                        {errors.firstName && (
                                            <div className="invalid-feedback d-block">
                                                {errors.firstName.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-6">
                                        <label className="form-label fw-semibold">Last Name *</label>
                                        <CustomInputField<SignUpForm>
                                            name="lastName"
                                            control={control}
                                            rules={{ required: "Last name is required" }}
                                            placeholder="Enter last name"
                                            className="form-control"
                                        />
                                        {errors.lastName && (
                                            <div className="invalid-feedback d-block">
                                                {errors.lastName.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Email *</label>
                                        <CustomInputField<SignUpForm>
                                            name="email"
                                            type="email"
                                            control={control}
                                            rules={{ required: "Email is required" }}
                                            placeholder="Enter your email"
                                            className="form-control"
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback d-block">
                                                {errors.email.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-6">
                                        <label className="form-label fw-semibold">Password *</label>
                                        <CustomPasswordField<SignUpForm>
                                            name="password"
                                            control={control}
                                            rules={{ required: "Password is required" }}
                                            placeholder="Enter your password"
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-6">
                                        <label className="form-label fw-semibold">Confirm Password *</label>
                                        <CustomPasswordField<SignUpForm>
                                            name="confirmPassword"
                                            control={control}
                                            rules={{
                                                required: "Confirm password is required",
                                                validate: (value) =>
                                                    value === getValues("password") || "Passwords do not match",
                                            }}
                                            placeholder="Enter confirm password"
                                        />
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback d-block">
                                                {errors.confirmPassword.message}
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                                    Sign Up
                                </button>

                                <p className="text-center mt-3 mb-0 text-muted">
                                    Already have an account?{" "}
                                    <span className="text-primary fw-semibold" onClick={() => navigate('/login')}>Login</span>
                                </p>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            <OTPModal email={optModal.email} showModal={optModal.open} onClose={() => setOtpModal({
                open: false,
                email: ''
            })} onSubmit={onSubmit} />
        </>
    );

};

export default Signup;
