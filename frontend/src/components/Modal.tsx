import React, { useEffect } from "react";
import "./Modal.css";

interface ModalProps {
  title: string;
  body: string[];
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, body, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__title">{title}</div>
        <div className="modal__body">
          {body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </div>
  );
};