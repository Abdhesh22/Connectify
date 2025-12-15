import type React from "react";

const Landing: React.FC = () => {
    return (
        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center">

            <h2 className="fw-bold mb-2">Conversations made simple for everyone</h2>
            <p className="text-muted mb-4">
                Connect, share, and be present with your people — anytime, anywhere.
            </p>

            <button className="btn btn-primary btn-lg d-flex align-items-center gap-2 px-4 py-3">
                <i className="bi bi-plus-lg"></i>
                Create Room
            </button>

        </div>
    );
};

export default Landing;