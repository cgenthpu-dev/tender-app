import React, { useState, useEffect } from "react";
import {
    Folder,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    RefreshCw,
} from "lucide-react";
import {
    fetchDashboardData,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../services/api";

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        id: null,
        name: "",
        description: "",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) =>
        setCategoryForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryForm.name) return;

        try {
            if (categoryForm.id) {
                // Update
                const updated = await updateCategory(categoryForm.id, categoryForm);
                setCategories((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
            } else {
                // Create
                const newCat = await createCategory(categoryForm);
                setCategories((prev) => [...prev, newCat]);
            }
            resetForm();
        } catch (err) {
            console.error("Failed to save category", err);
            alert("Failed to save category");
        }
    };

    const handleEdit = (cat) => {
        setCategoryForm(cat);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Failed to delete category", err);
            alert(err.message || "Failed to delete category");
        }
    };

    const resetForm = () => {
        setCategoryForm({ id: null, name: "", description: "" });
        setIsEditing(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        T&C Categories
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage categories for Terms & Conditions.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? "Edit Category" : "Add New Category"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={categoryForm.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Payment Terms"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={categoryForm.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Optional description..."
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
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No categories found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <Folder className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1">{cat.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">
                                        {cat.description || "No description provided."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCategories;
