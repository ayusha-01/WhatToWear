import { useState, useEffect } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, User, Lock, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/register-init', { email: formData.email });
            setStep(2);
            setTimer(30);
            toast.success('Verification code sent!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error sending OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            await axios.post('/auth/register-init', { email: formData.email });
            setTimer(30);
            toast.success('Code resent successfully!');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error resending OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/verify-otp', { email: formData.email, otp: formData.otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/auth/register-complete', formData);
            login(res.data, res.data.token);
            navigate('/');
            toast.success('Welcome to What To Wear!');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl z-10 transition-all duration-300 hover:shadow-primary/10 hover:border-slate-700 relative">
                <Link to="/" className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </Link>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">
                        Join What To Wear
                    </h1>
                    <p className="text-slate-400 mt-2">Discover and share your style.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-sm text-slate-400">We sent a code to <span className="text-primary">{formData.email}</span></p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Verification Code</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="otp"
                                    required
                                    maxLength="6"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all tracking-widest text-center text-lg font-mono placeholder:text-slate-600"
                                    placeholder="000000"
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                        </button>

                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={timer > 0 || loading}
                                className="w-full text-sm text-primary hover:text-blue-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-500"
                            >
                                {timer > 0 ? (
                                    <>Resend code in {timer}s</>
                                ) : (
                                    <><RefreshCw className="w-4 h-4" /> Resend Code</>
                                )}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-500 hover:text-slate-300">
                                Change Email
                            </button>
                        </div>
                    </form>
                )}

                {
                    step === 3 && (
                        <form onSubmit={handleFinalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Choose Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                        placeholder="fashion_guru"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Set Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                            </button>
                        </form>
                    )
                }

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => {
                            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
                            console.log("Redirecting to:", url);
                            window.location.href = url;
                        }}
                        className="w-full bg-white text-slate-900 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
                        Log in
                    </Link>
                </div>
            </div >
        </div >
    );
};

export default Register;
