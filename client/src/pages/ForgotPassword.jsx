import { useState, useEffect } from 'react';
import axios from '../axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(0);

    // Timer Logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/forgot-password', { email });
            setStep(2);
            setTimeLeft(30); // 30s cooldown
            toast.success('OTP sent to your email!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return toast.error('Please enter a valid 6-digit OTP');

        setLoading(true);
        try {
            await axios.post('/auth/verify-reset-otp', { email, otp: otpValue });
            setStep(3);
            toast.success('OTP verified!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            await axios.post('/auth/reset-password', {
                email,
                otp: otp.join(''),
                password
            });
            toast.success('Password reset successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // OTP Input Handler
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Auto move to next input
        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl z-10 relative">
                <Link to="/login" className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-slate-400">
                        {step === 1 && "Enter your email to receive a code."}
                        {step === 2 && "Enter the code sent to your email."}
                        {step === 3 && "Create a new secure password."}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Code'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-4 text-center">
                                We sent a code to <span className="text-white">{email}</span>
                            </label>
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-lg text-center text-xl font-bold text-white focus:ring-2 focus:ring-primary outline-none"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const paste = e.clipboardData.getData('text').slice(0, 6).split('');
                                            const newOtp = [...otp];
                                            paste.forEach((char, i) => newOtp[i] = char);
                                            setOtp(newOtp);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                            {timeLeft > 0 ? (
                                <p className="text-sm text-slate-500">Resend code in {timeLeft}s</p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Resend Code
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify Code'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
