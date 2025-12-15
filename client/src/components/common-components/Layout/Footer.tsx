import DayJsUtil from "../../../utils/day.util";

const Footer = () => {
    const year = DayJsUtil.currentYear();
    return (
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 border-top">
            <div className="col-md-4 d-flex align-items-center">
                <a
                    href="/"
                    className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1"
                    aria-label="Bootstrap"
                >
                    <svg className="bi" width="30" height="24" aria-hidden="true">
                        <use href="#bootstrap"></use>
                    </svg>
                </a>
                <span className="mb-3 mb-md-0 text-body-secondary">
                    © Connectify {year} Company, Inc
                </span>
            </div>
        </footer>
    );
};

export default Footer;