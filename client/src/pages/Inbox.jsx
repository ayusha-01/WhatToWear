import { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import { Loader2, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Inbox = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get('/messages');
                setMessages(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    // Helper to group messages by conversation could be added later
    // For now, simple list of all sharing events

    return (
        <div className="min-h-screen bg-background text-slate-100">
            <nav className="border-b border-slate-800 p-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </Link>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        Inbox
                    </h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto p-4 md:p-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-300">No messages yet</h3>
                        <p className="text-slate-500 mt-2">Share outfits with friends to start chatting!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.sender._id === user._id;
                            const peer = isMe ? msg.recipient : msg.sender;

                            return (
                                <div key={msg._id} className={`flex gap-4 p-4 rounded-xl border ${isMe ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-800 border-slate-700'}`}>
                                    <div className="shrink-0">
                                        <Link to={`/profile/${msg.sender.username}`} className="block w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                            {msg.sender.profilePic ? (
                                                <img src={msg.sender.profilePic} alt={msg.sender.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                                            )}
                                        </Link>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link to={`/profile/${msg.sender.username}`} className="font-semibold text-white hover:underline">
                                                {msg.sender.username}
                                            </Link>
                                            <span className="text-xs text-slate-500">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-3">{msg.text}</p>

                                        {msg.post && (
                                            <Link to={`/post/${msg.post._id}`} className="block max-w-sm rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors group">
                                                <div className="aspect-[4/3] bg-slate-900 relative">
                                                    <img
                                                        src={msg.post.imageUrl}
                                                        alt="Shared outfit"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                                        <p className="text-xs text-white truncate font-medium">{msg.post.caption}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Inbox;
