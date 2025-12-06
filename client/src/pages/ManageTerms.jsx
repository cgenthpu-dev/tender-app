import React, { useState, useEffect, useRef } from "react";
import {
    Database,
    Plus,
    Edit2,
    Trash2,
    Save,
    Search,
    Filter,
    RefreshCw,
} from "lucide-react";
import {
    fetchDashboardData,
    createTerm,
    updateTerm,
    deleteTerm,
} from "../services/api";

const ManageTerms = () => {
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [termForm, setTermForm] = useState({
        id: null,
        categoryId: "",
        title: "",
        description: "",
    });

    const formRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setCategories(data.categories || []);
            setTerms(data.terms || []);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) =>
        setTermForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termForm.title || !termForm.categoryId) return;

        try {
            const sanitizeDescription = (text) => {
                if (!text) return "";
                return text.replace(/<\/?(b|strong)[^>]*>/gi, "");
            };

            const payload = {
                ...termForm,
                description: sanitizeDescription(termForm.description),
                categoryId: Number(termForm.categoryId),
            };

            if (termForm.id) {
                // Update
                const updated = await updateTerm(termForm.id, payload);
                setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            } else {
                // Create
                const newTerm = await createTerm(payload);
                setTerms((prev) => [...prev, newTerm]);
            }
            resetForm();
        } catch (err) {
            console.error("Failed to save term", err);
            alert("Failed to save term");
        }
    };

    const handleEdit = (term) => {
        setTermForm(term);
        setIsEditing(true);
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this term?")) return;
        try {
            await deleteTerm(id);
            setTerms((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error("Failed to delete term", err);
            alert("Failed to delete term");
        }
    };

    const resetForm = () => {
        setTermForm({ id: null, categoryId: "", title: "", description: "" });
        setIsEditing(false);
    };

    const filteredTerms = terms.filter((term) => {
        const matchesCategory =
            activeCategoryFilter === null || term.categoryId === activeCategoryFilter;
        const matchesSearch =
            term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        T&C Creation Master
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Create and manage standard Terms & Conditions.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div
                        ref={formRef}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? "Edit Term" : "Add New Term"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="categoryId"
                                    value={termForm.categoryId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={termForm.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. 1.1 Scope of Work"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={termForm.description}
                                    onChange={handleChange}
                                    rows="6"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter the detailed term text..."
                                ></textarea>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditing ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            <button
                                onClick={() => setActiveCategoryFilter(null)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategoryFilter === null
                                        ? "bg-slate-800 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryFilter(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategoryFilter === cat.id
                                            ? "bg-slate-800 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search terms..."
                                className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : filteredTerms.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No terms found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTerms.map((term) => {
                                const catName =
                                    categories.find((c) => c.id === term.categoryId)?.name ||
                                    "Unknown";
                                return (
                                    <div
                                        key={term.id}
                                        className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 uppercase tracking-wide">
                                                {catName}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(term)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(term.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                                            {term.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm whitespace-pre-wrap">
                                            {term.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTerms;
