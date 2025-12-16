import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { toasty } from "../../utils/toasty.util";
import { TOAST_MESSAGE } from "../../constants/message.constant";
import Modal from "../common-components/custom-tags/Modal";
import CustomInput from "../common-components/custom-tags/CustomInput";

type OTPModalProps = {
    showModal: boolean;
    onClose: () => void;
    onSubmit: (status: boolean, message: string) => void;
    email: string;
}

const OTPModal: React.FC<OTPModalProps> = ({
    showModal,
    onClose,
    onSubmit,
    email,
}) => {

    const [otp, setOtp] = useState("");
    const [resendTimer, setResendTimer] = useState(30);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!otp || otp.length !== 6) return;
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/verify-otp", {
                email,
                otp,
            });
            setLoading(false);
            onSubmit(data.success, data.message);
        } catch (error) {
            setLoading(false);
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }
    };

    const sendOtp = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/send-otp", {
                email,
            });

            if (data.success) {
                toasty.success(data.message || "OTP sent successfully!");
                setResendTimer(30);
            }
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err.response?.data?.message || TOAST_MESSAGE.ERROR);
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        if (showModal) {
            setOtp("");
            sendOtp();
        }
    }, [showModal]);

    useEffect(() => {
        if (!showModal || resendTimer <= 0) return;

        const timer = setTimeout(
            () => setResendTimer((prev) => prev - 1),
            1000
        );

        return () => clearTimeout(timer);
    }, [resendTimer, showModal]);

    return (
        <Modal show={showModal} dialogClass={'modal-dialog-centered'} size={'lg'}>
            <Modal.Header title={"Verify Email"} onClose={onClose} />
            <Modal.Body>
                <>
                    <p className="text-center text-muted mb-3">
                        We’ve sent a 6-digit OTP to <b>{email}</b>
                    </p>

                    <div className="d-flex justify-content-center">
                        <CustomInput
                            type="text"
                            className="form-control text-center fs-4 fw-bold"
                            style={{ letterSpacing: "8px", width: "220px" }}
                            placeholder="------"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>
                </>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-end gap-2 w-100">
                    <button
                        className="btn btn-outline-primary"
                        onClick={sendOtp}
                        disabled={resendTimer > 0 || loading}
                    >
                        {resendTimer > 0
                            ? `Resend in ${resendTimer}s`
                            : "Resend OTP"}
                    </button>

                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? "Verifying..." : "Submit OTP"}
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default OTPModal;