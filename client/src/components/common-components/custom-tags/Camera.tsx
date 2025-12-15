import React from "react";
import Webcam from "react-webcam";

interface Prop {
    className?: string
}

const Camera: React.FC<Prop> = ({ className }) => {
    return (
        <div className="camera-wrapper">
            <Webcam
                audio={false}
                mirrored={true}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: "user",
                }}
                className="camera-video"
            />
        </div>
    );
};


export default Camera;