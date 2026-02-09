import { useState, useEffect } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, Plus, User as UserIcon, Heart, Bookmark, MapPin, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState('posts'); // 'posts' or 'users'
    const [filters, setFilters] = useState({ venue: '', location: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [filters]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.venue) params.append('venue', filters.venue);
            if (filters.location) params.append('location', filters.location);

            const res = await axios.get(`/posts?${params.toString()}`);
            setPosts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchMode === 'posts') {
            setFilters({ ...filters, venue: searchTerm });
        } else {
            // Search Users
            setLoading(true);
            try {
                const res = await axios.get(`/users/search?q=${searchTerm}`);
                setUsers(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Clear users when switching back to posts
    useEffect(() => {
        if (searchMode === 'posts') {
            setUsers([]);
            fetchPosts();
        } else {
            setPosts([]);
        }
    }, [searchMode]);

    const handleLike = async (postId) => {
        if (!user) return navigate('/login');
        try {
            const res = await axios.put(`/posts/${postId}/like`);
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: res.data } : post
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (postId) => {
        if (!user) return navigate('/login');
        try {
            const res = await axios.put(`/posts/${postId}/save`);
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, savedBy: res.data } : post
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const [showShareModal, setShowShareModal] = useState(false);
    const [postToShare, setPostToShare] = useState(null);
    const [mutuals, setMutuals] = useState([]);
    const [shareLoading, setShareLoading] = useState(false);

    const handleShareClick = async (post) => {
        if (!user) return navigate('/login');
        setPostToShare(post);
        setShareLoading(true);
        setShowShareModal(true);
        try {
            const res = await axios.get('/messages/mutuals');
            setMutuals(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setShareLoading(false);
        }
    };

    const handleSendPost = async (recipientId) => {
        try {
            await axios.post('/messages', {
                recipientId,
                postId: postToShare._id,
                text: 'Check out this outfit!' // Default message
            });
            setShowShareModal(false);
            // Optional: Show success toast
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-slate-100 relative">
            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold mb-4">Share to...</h3>

                        {shareLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : mutuals.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                No mutual followers found. <br /> Follow people back to message them!
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {mutuals.map(friend => (
                                    <button
                                        key={friend._id}
                                        onClick={() => handleSendPost(friend._id)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                                            {friend.profilePic ? (
                                                <img src={friend.profilePic} alt={friend.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{friend.username}</p>
                                            <p className="text-xs text-slate-500">Send post</p>
                                        </div>
                                        <div className="ml-auto bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                                            Send
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="border-b border-slate-800 p-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                    <Link to="/" className="text-xl font-bold text-primary shrink-0">
                        What To Wear
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
                        <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700">
                            <button
                                onClick={() => setSearchMode('posts')}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${searchMode === 'posts' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Outfits
                            </button>
                            <button
                                onClick={() => setSearchMode('users')}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${searchMode === 'users' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                People
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder={searchMode === 'posts' ? "Search venues..." : "Find users..."}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {user ? (
                            <>
                                <Link to="/create-post" className="flex items-center gap-2 bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post</span>
                                </Link>
                                <div className="relative group">
                                    <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold text-slate-300">{user.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </button>
                                    {/* Dropdown */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                                        <div className="p-2">
                                            <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-2">
                                                @{user.username}
                                            </div>
                                            <Link to={`/profile/${user.username}`} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Profile</Link>
                                            <Link to="/inbox" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Inbox</Link>

                                            <button
                                                onClick={toggleTheme}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between"
                                            >
                                                <span>Theme</span>
                                                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                            </button>

                                            <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Log Out</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Log In</Link>
                                <Link to="/register" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Filters (Only show for Posts) */}
                {searchMode === 'posts' && (
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
                        {['All', 'Concert', 'Beach', 'Wedding', 'Office', 'Festival', 'Date Night'].map((venue) => (
                            <button
                                key={venue}
                                onClick={() => setFilters({ ...filters, venue: venue === 'All' ? '' : venue })}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${(venue === 'All' && !filters.venue) || filters.venue === venue
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                {venue}
                            </button>
                        ))}
                    </div>
                )}

                {/* Feed */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : searchMode === 'users' && users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map(userResult => (
                            <Link to={`/profile/${userResult.username}`} key={userResult._id} className="bg-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:bg-slate-750 transition-colors border border-slate-700 hover:border-slate-600">
                                <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden shrink-0">
                                    {userResult.profilePic ? (
                                        <img src={userResult.profilePic} alt={userResult.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-8 h-8 text-slate-400 m-auto mt-4" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{userResult.username}</h3>
                                    <p className="text-sm text-slate-400">{userResult.followers.length} followers</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : posts.length === 0 && searchMode === 'posts' ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-300">No outfits found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your filters or be the first to post!</p>
                    </div>
                ) : users.length === 0 && searchMode === 'users' ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-300">No users found</h3>
                        <p className="text-slate-500 mt-2">Try searching for a different username.</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {posts.map((post) => (
                            <div key={post._id} className="break-inside-avoid bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all group">
                                <Link to={`/post/${post._id}`} className="block relative">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.caption}
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-white font-medium truncate">{post.caption}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                                            <MapPin className="w-3 h-3" /> {post.venue} {post.location && `• ${post.location}`}
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center justify-between">
                                        <Link to={`/profile/${post.user?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                                {post.user?.profilePic ? (
                                                    <img src={post.user.profilePic} alt={post.user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-4 h-4 text-slate-400 m-auto mt-2" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{post.user?.username}</span>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className="flex items-center gap-1 group/like"
                                        >
                                            <Heart
                                                className={`w-5 h-5 transition-colors ${user && post.likes.includes(user._id) ? 'fill-red-500 text-red-500' : 'text-slate-500 group-hover/like:text-red-400'}`}
                                            />
                                            <span className="text-xs text-slate-500">{post.likes.length}</span>
                                        </button>

                                        {/* Share Button (New) */}
                                        <button
                                            onClick={() => handleShareClick(post)}
                                            className="group/share"
                                        >
                                            <svg className="w-5 h-5 text-slate-500 group-hover/share:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="18" cy="5" r="3"></circle>
                                                <circle cx="6" cy="12" r="3"></circle>
                                                <circle cx="18" cy="19" r="3"></circle>
                                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => handleSave(post._id)}
                                            className="group/save"
                                        >
                                            <Bookmark
                                                className={`w-5 h-5 transition-colors ${user && post.savedBy.includes(user._id) ? 'fill-primary text-primary' : 'text-slate-500 group-hover/save:text-primary'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
