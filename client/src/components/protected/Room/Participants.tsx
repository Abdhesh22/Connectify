import type React from "react";
import Camera from "../../common-components/custom-tags/Camera";

const Participant: React.FC = () => {

    const participants = [
        { id: 1, name: "Priya", initials: "PM", mic: false, camera: false },
        { id: 2, name: "Rohan", initials: "R", mic: true, camera: false },
        { id: 1, name: "Priya", initials: "PM", mic: false, camera: false },
        { id: 2, name: "Rohan", initials: "R", mic: true, camera: false },
    ];

    const visibleLimit = 25;
    const visibleParticipants = participants.slice(0, visibleLimit);
    const hiddenCount = participants.length - visibleLimit;

    const getGridClass = () => {
        if (participants.length === 1) return "grid-one";
        if (participants.length === 2) return "grid-two";
        return "grid-multi";
    };

    return (
        <div className={`participant-grid enhance-ui ${getGridClass()}`}>

            {visibleParticipants.map((user) => (
                <div className="video-tile modern-tile" key={user.id}>

                    {/* TILE MAIN CONTENT */}
                    <div className="video-content">
                        {!user.camera ? (
                            <div className="avatar-wrapper">
                                <span className="avatar-circle">{user.initials}</span>
                            </div>
                        ) : (
                            <div className="camera-container">
                                <Camera />
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="video-footer">
                        <div className="footer-left">
                            <span className="video-name">{user.name}</span>
                        </div>

                        <div className={`status-badge ${user.mic ? "mic-on" : "mic-off"}`}>
                            {user.mic ? "Mic On" : "Mic Off"}
                        </div>
                    </div>

                </div>
            ))}

            {hiddenCount > 0 && (
                <div className="video-tile modern-tile more-tile">
                    <div className="more-box">+{hiddenCount} more</div>
                </div>
            )}
        </div>
    );
};

export default Participant;