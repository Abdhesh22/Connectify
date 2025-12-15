const Header = () => {
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
                    <i className="bi bi-person-circle fs-3 text-secondary"></i>
                </div>
            </div>
        </header>
    );
};

export default Header;