import axios, { AxiosError, type AxiosResponse } from "axios";
import { toasty } from "../../../utils/toasty.util";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../provider/store.hooks";
import { TOAST_MESSAGE } from "../../../constants/message.constant";

type logOutResponse = {
    message: string;
}

const Header = () => {

    const navigate = useNavigate();
    const { setStore } = useStore();

    const logOut = async () => {
        try {

            const response: AxiosResponse<logOutResponse> = await axios.post("/api/auth/logout");
            toasty.success(response.data.message);

            setStore(null);
            navigate("/login");

        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }
    }

    return (
        <header className="p-2 py-2">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-list fs-3 text-secondary" role="button"></i>
                    <div className="d-flex align-items-center">
                        <img
                            src="/images/logo.svg"
                            alt="Connectify Logo"
                            height="36"
                            className="me-2"
                        />
                        <div className="d-flex flex-column">
                            <span className="fw-bold fs-4 text-dark">Connectify</span>
                            <small className="text-muted">Talk, text and stay in the moment.</small>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    {/* <i className="bi bi-person-circle fs-3 text-secondary"></i> */}
                    <button className="btn btn-danger" onClick={() => logOut()}>Logout</button>
                </div>
            </div>
        </header>
    );
};

export default Header;