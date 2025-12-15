import React from "react";

const People: React.FC = () => {

    const participants = [
        { id: 1, name: "John Deo", isHost: true, mic: true, camera: false },
        { id: 2, name: "Sarah Lee", mic: false, camera: true },
        { id: 3, name: "Amit Kumar", mic: true, camera: true },
        { id: 4, name: "Priya Shah", mic: false, camera: false }
    ];

    return <div className="people-panel">

        {/* Header */}
        <div className="people-header">
            <div>
                <div className="people-title">People</div>
                <div className="people-subtitle">{participants.length} in the call</div>
            </div>
            <i className="bi bi-person-plus add-people-icon"></i>
        </div>

        {/* Participant List */}
        <div className="people-list">
            {participants.map((p) => (
                <div key={p.id} className="people-item">

                    <div className="people-item-left">
                        {/* Avatar */}
                        <div className="people-avatar">
                            {p.name.charAt(0)}
                        </div>

                        {/* Name + role */}
                        <div className="people-meta">
                            <div className="people-name">{p.name}</div>
                            {p.isHost && <span className="people-role">Host</span>}
                        </div>
                    </div>

                    {/* Status icons */}
                    <div className="people-status">
                        <i className={`bi ${p.mic ? "bi-mic-fill mic-on" : "bi-mic-mute-fill mic-off"}`}></i>
                        <i className={`bi ${p.camera ? "bi-camera-video-fill cam-on" : "bi-camera-video-off-fill cam-off"}`}></i>

                        {/* More (3 dots) */}
                        <i className="bi bi-three-dots people-more"></i>
                    </div>
                </div>
            ))}

        </div>
    </div>

}

export default People