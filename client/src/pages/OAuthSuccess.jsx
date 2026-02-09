import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Fetch user data with this token
            axios.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                login(res.data, token); // This updates context and sets local storage
                navigate('/');
            }).catch(err => {
                console.error("OAuth Login Failed", err);
                navigate('/login');
            });
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <h1 className="text-xl">Logging you in...</h1>
        </div>
    );
};

export default OAuthSuccess;
