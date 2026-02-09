import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PostView from './pages/PostView';
import Inbox from './pages/Inbox';
import OAuthSuccess from './pages/OAuthSuccess';
import ForgotPassword from './pages/ForgotPassword';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');

      socket.on('connect', () => {
        console.log("Socket Connected!", socket.id);
        socket.emit('joinUser', user._id);
        console.log("Emaining joinUser for:", user._id);
      });

      socket.on('connect_error', (err) => {
        console.log("Socket Connection Error:", err);
      });

      socket.on('notification', (data) => {
        console.log("Notification received:", data);
        toast.success(data.message, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        });
      });

      return () => socket.disconnect();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/post/:postId" element={<PostView />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
