import Modal from "./index";
import React from "react";

interface Prop {
    size: "sm" | "lg" | "xl";
    show: boolean;
    title?: string;
    onClose?: () => void;
    bodyJSX?: React.ReactNode;
    footerJSX?: React.ReactNode;
    closeText?: string;
}

const CentralModal: React.FC<Prop> = ({
    size,
    show,
    title,
    onClose,
    bodyJSX,
    footerJSX,
    closeText,
}) => {
    return (
        <Modal show={show} dialogClass={'modal-dialog-centered'} size={size}>
            <Modal.Header title={title} onClose={onClose} />
            <Modal.Body>
                {bodyJSX}
            </Modal.Body>
            <Modal.Footer onClose={onClose} closeText={closeText}>
                {footerJSX}
            </Modal.Footer>
        </Modal>
    );
};

export default CentralModal;