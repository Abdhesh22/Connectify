import React, { useState } from "react";
import Chat from "./Chat";
import Participant from "./Participant";
import JoinRequest from "./JoinRequest";
import ParticipantWidget from "./ParticipantWidget";
import { connectSocket } from "../../../socket";
import { useParams } from "react-router-dom";
import { useNotificationSound } from "../../common-components/Notification/UseNotificationSound";
import { useStore } from "../../provider/store.hooks";
import { toasty } from "../../../utils/toasty.util";


type RequestPeople = {
    userId: string,
    _id: string,
    name: string
}

type ParticipantPeople = {
    joinRequestId: string,
    userId: string,
    name: string,
    isHost: string,
    mic: boolean,
    camera: boolean,
    participantId: string
}

type RoomProps = {
    isHost: boolean;
    handleLeaveRoom: () => void
}

type ParticipantLeavePayload = {
    token: string;
    name: string;
    participantId: string;
}

type TabType = "participants" | "requests";


const Room: React.FC<RoomProps> = ({ isHost, handleLeaveRoom }) => {

    const [activeTab, setActiveTab] = useState<TabType>("participants");
    const playJoinSound = useNotificationSound("/sounds/join-request.mp3");
    const playLeaveSound = useNotificationSound("/sounds/participant-leave.mp3")

    const { store } = useStore();

    const { token } = useParams<{ token: string }>();
    const [control, setControl] = useState({
        mic: false,
        camera: false,
        screenShare: false,
        options: false,
        leave: false,
        chat: true,
        people: false
    })

    const [leavedParticipant, setLeavedParticipant] = useState<ParticipantLeavePayload>();
    const [acceptedRequest, setAcceptedRequest] = useState<ParticipantPeople>();
    const [joinRequests, setJoinRequests] = useState<RequestPeople[]>([]);
    const [requestCount, setRequestCount] = useState(0);
    const socket = connectSocket();

    socket.emit("join-room", {
        roomId: token,
        isHost: isHost,
    });

    socket.on("join-request", (data: RequestPeople) => {
        if (control.people) {
            if (activeTab == 'requests') {
                setJoinRequests([data]);
            }
        } else {
            setRequestCount(prev => prev + 1);
        }
        playJoinSound();
    });

    socket.on("admit-participant", (data: ParticipantPeople) => {
        if (control.people && activeTab == 'requests') {
            setAcceptedRequest(data);
        }
    });

    socket.on("participant-leave", (data: ParticipantLeavePayload) => {
        setLeavedParticipant(data);
        playLeaveSound();
    });


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
                        chat: true
                    }
                })
                break;
            case 'people':
                setRequestCount(0);
                setJoinRequests([]);
                setControl(prev => {
                    return {
                        ...prev,
                        people: true,
                        chat: false
                    }
                })
                break;
            case "leave":
                handleLeaveRoom();

        }
    }


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/room/${token}`);
            toasty.success("Link Copied!")
        } catch {
            toasty.error("Failed to copy");
        }
    };

    return (
        <>
            <div className="meet-root">

                {/* Top header */}
                <header className="meet-header">
                    <div className="meet-header-left">
                        <div className="meet-logo-circle">
                            {store?.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="meet-info" onClick={handleCopy}>
                            <div className="meet-subtitle">
                                <span className="meeting-code"> {token}</span>
                                <i
                                    role="button"
                                    aria-label="Copy meeting link"
                                    className={`bi bi-clipboard`}
                                />
                            </div>
                        </div>
                    </div>


                </header>

                {/* Main content */}
                <main className="meet-main">
                    {/* Video section */}
                    <section className="meet-stage">
                        <div className={`participant-grid ${control.chat || control.people ? "right-panel-open" : ""}`}>
                            <ParticipantWidget />
                        </div>
                        {/* Bottom controls */}
                        <div className="meet-controls">

                            {/* LEFT SIDE */}
                            <div className="meet-controls-left">
                                <span className="meet-participant-count">

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
                                    <span className="icon-wrapper">
                                        <i className={`bi ${control.people ? "bi-people" : "bi-people-fill"}`}></i>
                                        {requestCount > 0 && (
                                            <span className="icon-badge">{requestCount}</span>
                                        )}
                                    </span>
                                </button>

                            </div>

                        </div >
                    </section >

                    {control.people &&
                        <div className="people-panel">
                            <div className="people-header">
                                <div className="people-title">People</div>
                                {isHost && (
                                    <div className="people-tabs">
                                        <button
                                            onClick={() => setActiveTab("participants")}
                                            className={activeTab === "participants" ? "active" : ""}
                                        >
                                            Participants
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("requests")}
                                            className={activeTab === "requests" ? "active" : ""}
                                        >
                                            Requests
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!isHost && <Participant leavedParticipant={leavedParticipant} />}
                            {isHost && activeTab === "participants" && <Participant leavedParticipant={leavedParticipant} />}
                            {isHost && activeTab === "requests" && <JoinRequest joinRequests={joinRequests} acceptedRequest={acceptedRequest} />}
                        </div>
                    }
                    {control.chat && <Chat />}
                </main >
            </div >
        </>
    );
};

export default Room;
