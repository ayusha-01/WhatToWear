import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, Bookmark, MapPin, Trash2, ArrowLeft } from 'lucide-react';

const PostView = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/posts/${postId}`);
            setPost(res.data);
            setLikeCount(res.data.likes.length);
            if (currentUser) {
                setIsLiked(res.data.likes.includes(currentUser._id));
                setIsSaved(res.data.savedBy.includes(currentUser._id));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`/posts/${postId}`);
                navigate(`/profile/${currentUser.username}`);
            } catch (error) {
                console.error("Failed to delete post", error);
                alert("Failed to delete post");
            }
        }
    };

    const handleLike = async () => {
        if (!currentUser) return navigate('/login');
        try {
            await axios.put(`/posts/${postId}/like`);
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return navigate('/login');
        try {
            await axios.put(`/posts/${postId}/save`);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;
    if (!post) return <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">Post not found</div>;

    return (
        <div className="min-h-screen bg-background text-slate-100 pb-20 pt-24 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Feed
                </Link>

                <div className="grid md:grid-cols-2 gap-8 bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
                    <div className="aspect-[4/5] bg-black relative">
                        <img src={post.imageUrl} alt="" className="w-full h-full object-contain" />
                    </div>

                    <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <Link to={`/profile/${post.user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                    {post.user.profilePic ? (
                                        <img src={post.user.profilePic} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                            {post.user.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="font-semibold">{post.user.username}</span>
                            </Link>

                            {currentUser && currentUser._id === post.user._id && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                    title="Delete Post"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{post.venue}</span>
                                {post.location && <span>• {post.location}</span>}
                            </div>

                            {post.caption && <p className="text-lg">{post.caption}</p>}

                            {post.items && post.items.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Wearing</h3>
                                    <div className="space-y-2">
                                        {post.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <span>{item.name}</span>
                                                {item.purchaseLink && (
                                                    <a href={item.purchaseLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                                        Shop
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-700 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button onClick={handleLike} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
                                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                                    <span>{likeCount}</span>
                                </button>
                                <button onClick={handleSave} className={`transition-colors ${isSaved ? 'text-primary' : 'text-slate-400 hover:text-white'}`}>
                                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <span className="text-xs text-slate-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostView;
