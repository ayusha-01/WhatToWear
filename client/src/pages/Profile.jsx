import { useState, useEffect } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Settings, Grid, Bookmark, MapPin, User as UserIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editFile, setEditFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    useEffect(() => {
        if (activeTab === 'saved' && currentUser && currentUser.username === username) {
            fetchSavedPosts();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/users/${username}`);
            setProfile(res.data.user);
            setPosts(res.data.posts);
            if (currentUser && res.data.user.followers.includes(currentUser._id)) {
                setIsFollowing(true);
            }
            if (currentUser && currentUser.username === username) {
                setEditBio(res.data.user.bio || '');
                setEditUsername(res.data.user.username || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('bio', editBio);
        formData.append('username', editUsername);
        if (editFile) {
            formData.append('profilePic', editFile);
        }

        try {
            const res = await axios.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(prev => ({ ...prev, ...res.data }));
            setShowEditModal(false);
            toast.success('Profile updated!');
            // If username changed, redirect new URL or notify
            if (username !== res.data.username) {
                window.location.href = `/profile/${res.data.username}`;
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUploading(false);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const res = await axios.get('/users/saved');
            setSavedPosts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await axios.put(`/users/${profile._id}/unfollow`);
                setIsFollowing(false);
                setProfile(prev => ({ ...prev, followers: prev.followers.slice(0, -1) })); // Optimistic update
            } else {
                await axios.put(`/users/${profile._id}/follow`);
                setIsFollowing(true);
                setProfile(prev => ({ ...prev, followers: [...prev.followers, currentUser._id] }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;
    if (!profile) return <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">User not found</div>;

    return (
        <div className="min-h-screen bg-background text-slate-100 pb-20">
            {/* Navbar Spacer */}
            <div className="h-16"></div>

            <div className="max-w-4xl mx-auto px-4">
                <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Feed
                </Link>

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex-shrink-0">
                        {profile.profilePic ? (
                            <img src={profile.profilePic} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-4xl font-bold text-slate-500">
                                {username[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <h1 className="text-2xl font-bold">{profile.username}</h1>
                            {currentUser && currentUser.username === username ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                currentUser && (
                                    <button
                                        onClick={handleFollow}
                                        className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFollowing ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-primary text-white hover:bg-sky-600'}`}
                                    >
                                        {isFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                )
                            )}
                        </div>

                        <div className="flex justify-center md:justify-start gap-8 text-sm">
                            <div className="text-center md:text-left">
                                <span className="font-bold text-lg block md:inline md:mr-1">{posts.length}</span>
                                <span className="text-slate-400">posts</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="font-bold text-lg block md:inline md:mr-1">{profile.followers?.length || 0}</span>
                                <span className="text-slate-400">followers</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="font-bold text-lg block md:inline md:mr-1">{profile.following?.length || 0}</span>
                                <span className="text-slate-400">following</span>
                            </div>
                        </div>

                        {profile.bio && <p className="text-slate-300 max-w-md">{profile.bio}</p>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-slate-800 flex justify-center gap-12 mb-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex items-center gap-2 py-4 text-sm font-medium border-t-2 transition-colors ${activeTab === 'posts' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <Grid className="w-4 h-4" /> POSTS
                    </button>
                    {currentUser && currentUser.username === username && (
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex items-center gap-2 py-4 text-sm font-medium border-t-2 transition-colors ${activeTab === 'saved' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            <Bookmark className="w-4 h-4" /> SAVED
                        </button>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
                    {(activeTab === 'posts' ? posts : savedPosts).map((post) => (
                        <Link to={`/post/${post._id}`} key={post._id} className="aspect-square relative group overflow-hidden bg-slate-800">
                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                <div className="flex items-center gap-1">
                                    <span className="text-lg">{post.likes.length}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {(activeTab === 'posts' ? posts : savedPosts).length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No posts to show yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full relative">
                        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditFile(e.target.files[0])}
                                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Username"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                                    placeholder="Tell us about yourself..."
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-bold flex justify-center items-center"
                                >
                                    {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
