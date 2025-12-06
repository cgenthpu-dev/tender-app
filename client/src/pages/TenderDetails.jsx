import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FileText,
    Calendar,
    DollarSign,
    ArrowLeft,
    Download,
    Trash2,
    RefreshCw,
    Eye,
} from "lucide-react";
import { fetchTender, fetchDocuments, deleteDocument } from "../services/api";

const TenderDetails = () => {
    const { id } = useParams();
    const [tender, setTender] = useState(null);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTenderDetails();
    }, [id]);

    const loadTenderDetails = async () => {
        setLoading(true);
        try {
            const tenderData = await fetchTender(id);
            setTender(tenderData);
            const docsData = await fetchDocuments(id);
            setDocs(docsData);
        } catch (error) {
            console.error("Failed to load tender details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm("Delete this saved version?")) return;
        try {
            await deleteDocument(docId);
            setDocs((prev) => prev.filter((d) => d.id !== docId));
        } catch (error) {
            console.error("Failed to delete document", error);
        }
    };

    const handleGenerate = () => {
        window.open(`/tender-preview/${id}`, "_blank");
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!tender) {
        return <div>Tender not found.</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to="/my-tenders"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {tender.tenderName}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {tender.departmentName} • {tender.tenderNo}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Tender Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Category
                                </label>
                                <p className="font-medium text-slate-800 capitalize">
                                    {tender.tenderCategory}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Type
                                </label>
                                <p className="font-medium text-slate-800 uppercase">
                                    {tender.tenderType}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Estimated Cost
                                </label>
                                <p className="font-medium text-slate-800 flex items-center gap-1">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    {Number(tender.estimatedCost).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Quantity
                                </label>
                                <p className="font-medium text-slate-800">
                                    {tender.itemQuantity}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    EMD Required
                                </label>
                                <p className="font-medium text-slate-800">
                                    {tender.emdRequired || "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    PBG Required
                                </label>
                                <p className="font-medium text-slate-800">
                                    {tender.pbgRequired || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" /> Critical Dates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Publish Date
                                </label>
                                <p className="font-medium text-slate-800">
                                    {new Date(tender.publishDate).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Bid End Date
                                </label>
                                <p className="font-medium text-slate-800">
                                    {new Date(tender.bidEndDate).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Tech Eval Date
                                </label>
                                <p className="font-medium text-slate-800">
                                    {new Date(tender.techEvalDate).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Actions</h3>
                        <button
                            onClick={handleGenerate}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
                        >
                            <FileText className="w-5 h-5" /> Generate Document
                        </button>
                        <Link
                            to={`/tenders/${tender.id}/edit`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                            Edit Tender Details
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">
                            Saved Versions
                        </h3>
                        {docs.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">
                                No saved documents yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {docs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white p-1.5 rounded border border-slate-200">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    {doc.name || "Untitled Version"}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteDoc(doc.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenderDetails;
