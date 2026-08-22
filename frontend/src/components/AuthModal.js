import React, { useState } from 'react';
import { FaGoogle, FaEye, FaEyeSlash, FaBolt } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import './AuthModal.css';
import { API_BASE_URL } from '../utils/api';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // "Real" Google Login Hook
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                // Fetch User Info from Google
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                // Send to backend
                const res = await fetch(`${API_BASE_URL}/api/auth/google-access-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Google login failed");

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (onSuccess) onSuccess(data.user);
                onClose();

            } catch (err) {
                console.error('Google Login Error:', err);
                setError(err.message || 'Google Sign-In Failed');
            } finally {
                setLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Popup Error:', errorResponse);
            const errStr = JSON.stringify(errorResponse || {});
            if (errStr.includes('popup_closed') || errorResponse?.error === 'popup_closed_by_user') {
                setError('Google Login popup was closed. Please try again or use Demo Login.');
            } else {
                setError('Google OAuth Domain Notice: Please ensure your deployed link is added to Authorized JavaScript Origins in Google Cloud Console. You can also use Quick Demo Login below!');
            }
            setLoading(false);
        }
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const performAuth = async (emailVal, passwordVal, nameVal = '') => {
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = isLogin
            ? { email: emailVal.trim(), password: passwordVal }
            : { name: nameVal.trim(), email: emailVal.trim(), password: passwordVal };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Authentication failed');
            }

            // Save token to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (onSuccess) onSuccess(data.user);
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await performAuth(formData.email, formData.password, formData.name);
    };

    // Quick One-Click Demo Login for Interviewer
    const handleQuickDemoLogin = async () => {
        setIsLogin(true);
        setFormData({ name: 'Demo Interviewer', email: 'demo', password: 'demo2026' });
        await performAuth('demo', 'demo2026', 'Demo Interviewer');
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal-content">
                <button className="auth-close-btn" onClick={onClose}>×</button>

                <div className="auth-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Login to continue your analysis' : 'Join to start analyzing resumes'}</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Alex Johnson"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>{isLogin ? 'Email Address or Username' : 'Email Address'}</label>
                        <input
                            type="text"
                            name="email"
                            placeholder={isLogin ? "demo or name@company.com" : "name@company.com"}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group password-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In & Analyze' : 'Sign Up & Analyze')}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR EASY ACCESS</span>
                </div>

                <div className="auth-options">
                    <button
                        type="button"
                        className="demo-auth-btn"
                        onClick={handleQuickDemoLogin}
                        disabled={loading}
                    >
                        <FaBolt className="demo-bolt-icon" />
                        <span>Instant Demo Login</span>
                    </button>

                    <button
                        type="button"
                        className="google-auth-btn"
                        onClick={() => googleLogin()}
                        disabled={loading}
                    >
                        <FaGoogle className="google-icon" />
                        <span>Continue with Google</span>
                    </button>
                </div>


                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="auth-switch-btn"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;

