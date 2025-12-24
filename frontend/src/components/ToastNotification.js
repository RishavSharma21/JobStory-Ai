// ToastNotification.js - Modern toast notifications
import React, { useEffect } from 'react';
import './ToastNotification.css';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastNotification = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, toast.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [toast.isOpen, toast.duration, onClose]);

    if (!toast.isOpen) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <FaCheckCircle />;
            case 'error':
                return <FaExclamationTriangle />;
            case 'info':
            default:
                return <FaInfoCircle />;
        }
    };

    const getClassName = () => {
        return `toast-notification toast-${toast.type || 'info'}`;
    };

    return (
        <div className={getClassName()}>
            <div className="toast-icon">
                {getIcon()}
            </div>

            <div className="toast-content">
                {toast.title && <div className="toast-title">{toast.title}</div>}
                <div className="toast-message">{toast.message}</div>
                {toast.suggestion && (
                    <div className="toast-suggestion">
                        💡 {toast.suggestion}
                    </div>
                )}
            </div>

            <button className="toast-close" onClick={onClose}>
                <FaTimes />
            </button>
        </div>
    );
};

export default ToastNotification;
