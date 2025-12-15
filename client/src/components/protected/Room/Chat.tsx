import type React from "react";

const Chat: React.FC = () => {
    return <aside className="chat-panel">
        <div className="chat-header">
            <div className="chat-title">In-call messages</div>
            <div className="chat-subtitle">Only people in the meeting can see them</div>
        </div>

        <div className="chat-messages">
            <div className="chat-message">
                <div className="chat-meta">
                    <span className="chat-author">You</span>
                    <span className="chat-time">18:40</span>
                </div>
                <div className="chat-bubble chat-bubble--me">
                    Hi everyone, can you see my screen?
                </div>
            </div>

            <div className="chat-message">
                <div className="chat-meta">
                    <span className="chat-author">Priya</span>
                    <span className="chat-time">18:41</span>
                </div>
                <div className="chat-bubble">
                    Yes, screen is visible and audio is clear 👍
                </div>
            </div>
        </div>

        <div className="chat-input-wrapper">
            <input
                className="chat-input"
                placeholder="Send a message to everyone"
            />
            <button className="chat-send-btn">Send</button>
        </div>
    </aside>
}

export default Chat;