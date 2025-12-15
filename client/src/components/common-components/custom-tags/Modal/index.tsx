import React from "react";

interface HeaderProp {
    title?: string;
    onClose?: () => void;
}

interface BodyProp {
    children?: React.ReactNode;
}

interface FooterProp {
    children?: React.ReactNode;
    onClose?: () => void;
    closeText?: string;
}

interface ModalProp {
    children?: React.ReactNode;
    size?: string;
    dialogClass?: string;
    show: boolean
}

const Header: React.FC<HeaderProp> = ({ title, onClose }) => {
    return (
        <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            {onClose && (
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                ></button>
            )}
        </div>
    );
};

const Body: React.FC<BodyProp> = ({ children }) => {
    return <div className="modal-body">{children}</div>;
};

const Footer: React.FC<FooterProp> = ({ children, onClose, closeText = "Close" }) => {
    return (
        <div className="modal-footer">
            {onClose && (
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    {closeText}
                </button>
            )}
            {children}
        </div>
    );
};

const Modal: React.FC<ModalProp> & {
    Header: typeof Header;
    Body: typeof Body;
    Footer: typeof Footer;
} = ({ children, dialogClass = "", size = "lg", show }) => {
    return (
        show && (<div className="modal d-block" tabIndex={-1}>
            <div className={`modal-dialog modal-${size} ${dialogClass}`}>
                <div className="modal-content">{children}</div>
            </div>
        </div>)
    );
};


Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;