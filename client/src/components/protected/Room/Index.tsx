import React, { useState } from "react";
import Chat from "./Chat";
import People from "./People"
import Participant from "./Participants";


const Room: React.FC = () => {

    const [control, setControl] = useState({
        mic: false,
        camera: false,
        screenShare: false,
        options: false,
        leave: false,
        chat: false,
        people: false
    })

    const handleControl = (key: string) => {
        switch (key) {
            case 'mic':
                setControl(prev => {
                    return {
                        ...prev,
                        mic: !control.mic
                    }
                })
                break;
            case 'camera':
                setControl(prev => {
                    return {
                        ...prev,
                        camera: !control.camera
                    }
                })
                break;
            case 'screenShare':
                setControl(prev => {
                    return {
                        ...prev,
                        screenShare: !control.screenShare
                    }
                })
                break;
            case 'options':
                setControl(prev => {
                    return {
                        ...prev,
                        options: !control.options
                    }
                })
                break;
            case 'chat':
                setControl(prev => {
                    return {
                        ...prev,
                        people: false,
                        chat: !control.chat
                    }
                })
                break;
            case 'people':
                setControl(prev => {
                    return {
                        ...prev,
                        people: !control.people,
                        chat: false
                    }
                })
                break;
        }
    }

    return (
        <div className="meet-root">
            {/* Top header */}
            <header className="meet-header">
                <div className="meet-header-left">
                    <div className="meet-logo-circle">M</div>
                    <div>
                        <div className="meet-title">Team Standup</div>
                        <div className="meet-subtitle">Meeting code: abc-def-ghi</div>
                    </div>
                </div>

                <div className="meet-header-right">
                    <span className="meet-header-pill">18:42</span>
                    <span className="meet-header-pill">You</span>
                </div>
            </header>

            {/* Main content */}
            <main className="meet-main">
                {/* Video section */}
                <section className="meet-stage">
                    <div className={`participant-grid ${control.chat || control.people ? "right-panel-open" : ""}`}>
                        <Participant />
                    </div>
                    {/* Bottom controls */}
                    <div className="meet-controls">

                        {/* LEFT SIDE */}
                        <div className="meet-controls-left">
                            <span className="meet-participant-count">
                                4 participants
                            </span>
                        </div>

                        {/* CENTER CONTROLS */}
                        <div className="meet-controls-center">

                            {/* Mic */}
                            <button
                                className={`control-btn control-btn--circle ${control.mic ? "control-btn--active" : "control-btn--danger"}`}
                                onClick={() => handleControl("mic")}
                            >
                                <i className={`control-icon bi ${control.mic ? "bi-mic" : "bi-mic-mute"}`}></i>
                            </button>

                            {/* Camera */}
                            <button
                                className={`control-btn control-btn--circle ${control.camera ? "control-btn--active" : "control-btn--danger"}`}
                                onClick={() => handleControl("camera")}
                            >
                                <i className={`control-icon bi ${control.camera ? "bi-camera-video-fill" : "bi-camera-video-off-fill"}`}></i>
                            </button>

                            {/* Screen Share */}
                            <button
                                className={`control-btn control-btn--circle ${control.screenShare ? "control-btn--active" : "control-btn--danger"}`}
                                onClick={() => handleControl("screenShare")}
                            >
                                <i className={`control-icon bi ${control.screenShare ? "bi-tv" : "bi-tv-fill"}`}></i>
                            </button>

                            {/* More Options */}
                            <button
                                className="control-btn control-btn--circle control-btn--active"
                                onClick={() => handleControl("options")}
                            >
                                <i className="control-icon bi bi-three-dots"></i>
                            </button>

                            {/* End Call */}
                            <button
                                className="control-btn control-btn--circle control-btn--danger"
                                onClick={() => handleControl("leave")}
                            >
                                <i className="control-icon bi bi-telephone"></i>
                            </button>
                        </div>

                        {/* RIGHT CONTROLS */}
                        <div className="meet-controls-right">

                            {/* Chat Toggle */}
                            <button
                                className={`meet-right-btn ${control.chat ? "meet-right-btn--active" : ""}`}
                                onClick={() => handleControl("chat")}
                            >
                                <i className={`bi ${control.chat ? "bi-chat-left-fill" : "bi-chat-left-dots-fill"}`}></i>
                            </button>

                            {/* People Toggle */}
                            <button
                                className={`meet-right-btn ${control.people ? "meet-right-btn--active" : ""}`}
                                onClick={() => handleControl("people")}
                            >
                                <i className={`bi ${control.people ? "bi-people" : "bi-people-fill"}`}></i>
                            </button>

                        </div>

                    </div >
                </section >

                {/* Chat panel */}
                {control.people && <People />}
                {control.chat && <Chat />}
            </main >
        </div >
    );
};

export default Room;
