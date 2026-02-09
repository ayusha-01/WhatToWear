import { useState } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/auth/login', formData);
            login(res.data, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl z-10 transition-all duration-300 hover:shadow-primary/10 hover:border-slate-700 relative">
                <Link to="/" className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </Link>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 mt-2">Log in to your account.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
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

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-blue-400 font-medium transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`}
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
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-blue-400 font-medium transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
