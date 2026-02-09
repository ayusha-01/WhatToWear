import { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, Plus, ArrowLeft } from 'lucide-react';

const CreatePost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [formData, setFormData] = useState({
        venue: '',
        location: '',
        caption: '',
    });
    const [items, setItems] = useState([]); // Array of { name, category, purchaseLink }
    const [newItem, setNewItem] = useState({ name: '', category: '', purchaseLink: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const addItem = () => {
        if (newItem.name) {
            setItems([...items, newItem]);
            setNewItem({ name: '', category: '', purchaseLink: '' });
        }
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert('Please upload an image');

        setLoading(true);
        const data = new FormData();
        data.append('image', image);
        data.append('venue', formData.venue);
        data.append('location', formData.location);
        data.append('caption', formData.caption);
        data.append('items', JSON.stringify(items));

        try {
            await axios.post('/posts', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Error creating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background border-b border-slate-800">
            <nav className="border-b border-slate-800 p-4 sticky top-0 bg-slate-900/80 backdrop-blur-md z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">New Outfit</h1>
                    <div className="w-6" /> {/* Spacer */}
                </div>
            </nav>

            <div className="max-w-3xl mx-auto p-4">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Upload */}
                    <div>
                        <div className="relative aspect-[3/4] md:aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-700 hover:border-slate-500 transition-colors cursor-pointer group">
                            {preview ? (
                                <>
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setImage(null); setPreview(''); }}
                                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <Upload className="w-12 h-12 text-slate-500 group-hover:text-primary transition-colors mb-4" />
                                    <span className="text-slate-400 font-medium">Click to upload outfit</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Venue / Occasion</label>
                                <input
                                    type="text"
                                    name="venue"
                                    placeholder="e.g. Concert, Beach, Office"
                                    required
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Location (Optional)</label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Paris, New York"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Caption</label>
                                <textarea
                                    name="caption"
                                    rows="3"
                                    placeholder="Tell us about the look..."
                                    value={formData.caption}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-800/50">
                            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" /> Tag Items
                            </h3>

                            <div className="space-y-3 mb-4">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm bg-slate-800 p-2 rounded-lg">
                                        <div>
                                            <span className="font-medium text-white">{item.name}</span>
                                            <span className="text-slate-500 mx-2">•</span>
                                            <span className="text-slate-400">{item.category}</span>
                                        </div>
                                        <button type="button" onClick={() => removeItem(index)}>
                                            <X className="w-4 h-4 text-slate-500 hover:text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Category"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Link (Optional)"
                                        value={newItem.purchaseLink}
                                        onChange={(e) => setNewItem({ ...newItem, purchaseLink: e.target.value })}
                                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="w-full py-2 bg-slate-700 text-slate-200 text-sm rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Post Outfit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
