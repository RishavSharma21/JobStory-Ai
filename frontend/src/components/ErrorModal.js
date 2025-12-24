// ErrorModal.js - Beautiful error display component
import React from 'react';
import './ErrorModal.css';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ErrorModal = ({ isOpen, onClose, title, message, suggestion }) => {
    if (!isOpen) return null;

    return (
        <div className="error-modal-overlay" onClick={onClose}>
            <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="error-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="error-modal-icon">
                    <FaExclamationTriangle />
                </div>

                <h2 className="error-modal-title">{title || 'Validation Error'}</h2>

                <p className="error-modal-message">{message}</p>

                {suggestion && (
                    <div className="error-modal-suggestion">
                        <strong>💡 Tip:</strong> {suggestion}
                    </div>
                )}

                <button className="error-modal-button" onClick={onClose}>
                    Got it
                </button>
            </div>
        </div>
    );
};

export default ErrorModal;
