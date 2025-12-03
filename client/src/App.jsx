import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  Hash,
  Layers,
  ArrowRight,
  Database,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  ArrowLeft,
  AlertCircle,
  Tag,
  Folder,
  Building,
  Mail,
  Users,
  CheckSquare,
  Square,
  List,
  Eye,
  UserCheck,
  RefreshCw,
  Download,
} from "lucide-react";
import { Routes, Route } from "react-router-dom";
import TenderPreview from "./pages/TenderPreview";

function Dashboard() {
  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false); // New state for doc generation

  // API Base URL
  const API_URL = "http://localhost:5000/api";

  // --- STATE ---
  const [savedTenders, setSavedTenders] = useState([]);
  const [activeTender, setActiveTender] = useState(null);
  const [categories, setCategories] = useState([]);
  const [terms, setTerms] = useState([]);

  // Saved Docs State
  const [savedDocs, setSavedDocs] = useState([]);
  const [savedDocsLoading, setSavedDocsLoading] = useState(false);

  // ... (rest of form states)


  const [formData, setFormData] = useState({
    id: null,
    tenderCategory: "service",
    tenderType: "gem",
    departmentName: "Department of Physics, H.P. University",
    departmentEmail: "physicshpu@gmail.com",
    tenderInvitingAuthority: "",
    tenderName: "",
    tenderNo: "",
    itemQuantity: "",
    estimatedCost: "",
    bidValidity: "90",
    emdRequired: "",
    pbgRequired: "",
    emdPledgeOfficer:
      "Finance Officer, Himachal Pradesh University, Summerhill, Shimla - 171005",
    publishDate: "",
    isPreBidRequired: "no",
    preBidDate: "",
    bidStartDate: "",
    bidEndDate: "",
    offlineSubmissionDate: "",
    techEvalDate: "",
    selectedTermIds: [],
  });

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [termForm, setTermForm] = useState({
    id: null,
    categoryId: "",
    title: "",
    description: "",
  });

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  // --- 1. INITIAL LOAD (Fetch from MongoDB) ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dashboard-data`);
      if (!response.ok) throw new Error("Failed to connect to backend");
      const data = await response.json();

      setCategories(data.categories || []);
      setTerms(data.terms || []);
      setSavedTenders(data.tenders || []);
    } catch (error) {
      console.error("API Error:", error);
      console.warn("Backend unreachable.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS: Main Form ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTermSelection = (termId) => {
    setFormData((prev) => {
      const currentIds = prev.selectedTermIds || [];
      if (currentIds.includes(termId)) {
        return {
          ...prev,
          selectedTermIds: currentIds.filter((id) => id !== termId),
        };
      } else {
        return { ...prev, selectedTermIds: [...currentIds, termId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tenders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTender = await response.json();
        setSavedTenders((prev) => [newTender, ...prev]);
        setView("my-tenders");

        // Reset Form
        setFormData({
          id: null,
          tenderCategory: "service",
          tenderType: "gem",
          departmentName: "Department of Physics, H.P. University",
          departmentEmail: "physicshpu@gmail.com",
          tenderInvitingAuthority: "",
          tenderName: "",
          tenderNo: "",
          itemQuantity: "",
          estimatedCost: "",
          bidValidity: "90",
          emdRequired: "",
          pbgRequired: "",
          emdPledgeOfficer:
            "Finance Officer, Himachal Pradesh University, Summerhill, Shimla - 171005",
          publishDate: "",
          isPreBidRequired: "no",
          preBidDate: "",
          bidStartDate: "",
          bidEndDate: "",
          offlineSubmissionDate: "",
          techEvalDate: "",
          selectedTermIds: [],
        });
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save to MongoDB. Is server.js running?");
    } finally {
      setLoading(false);
    }
  };

  const viewTenderDetails = async (tender) => {
    setActiveTender(tender);
    setView("tender-details");

    // Fetch saved documents for this tender
    setSavedDocsLoading(true);
    try {
      const response = await fetch(`${API_URL}/tenders/${tender.id}/documents`);
      if (response.ok) {
        const docs = await response.json();
        setSavedDocs(docs);
      }
    } catch (err) {
      console.error("Failed to fetch saved docs", err);
    } finally {
      setSavedDocsLoading(false);
    }
  };

  // --- HANDLER: Document Generation ---
  const handleGenerateDocument = async () => {
    if (!activeTender) {
      alert("No tender selected");
      return;
    }
    // Open the preview in a new tab
    window.open(`/tender-preview/${activeTender.id}`, "_blank");
  };

  // --- HANDLERS: CRUD (Same as before) ---
  const handleCategoryChange = (e) =>
    setCategoryForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (response.ok) {
        const newCat = await response.json();
        setCategories((prev) => [...prev, newCat]);
        setCategoryForm({ id: null, name: "", description: "" });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteCategory = async (id) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTermChange = (e) =>
    setTermForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveTerm = async (e) => {
    e.preventDefault();
    if (!termForm.title) return;
    try {
      const payload = { ...termForm, categoryId: Number(termForm.categoryId) };
      const response = await fetch(`${API_URL}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newTerm = await response.json();
        setTerms((prev) => [...prev, newTerm]);
        setTermForm({ id: null, categoryId: "", title: "", description: "" });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteTerm = async (id) => {
    try {
      await fetch(`${API_URL}/terms/${id}`, { method: "DELETE" });
      setTerms((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const requestDelete = (id) => setDeleteConfirmId(id);
  const cancelDelete = () => setDeleteConfirmId(null);
  const editItem = (item, type) => {
    if (type === "cat") setCategoryForm(item);
    else setTermForm(item);
    setIsEditing(true);
    setDeleteConfirmId(null);
  };
  const cancelEdit = () => {
    setIsEditing(false);
    setTermForm({ id: null, categoryId: "", title: "", description: "" });
    setCategoryForm({ id: null, name: "", description: "" });
  };

  const getSelectionSummary = () => {
    return categories
      .map((cat) => ({
        name: cat.name,
        count: terms.filter(
          (t) =>
            t.categoryId === cat.id && formData.selectedTermIds.includes(t.id)
        ).length,
      }))
      .filter((item) => item.count > 0);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "Not Set";
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Tender Doc Maker
            </span>
            {loading && (
              <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setView("form")}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "form"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              Data Form
            </button>
            <button
              onClick={() => setView("my-tenders")}
              className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "my-tenders" || view === "tender-details"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <List className="w-4 h-4" /> My Tenders
            </button>
            <button
              onClick={() => setView("categories")}
              className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "categories"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Folder className="w-4 h-4" /> T&C Categories
            </button>
            <button
              onClick={() => setView("gem-master")}
              className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "gem-master"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Database className="w-4 h-4" /> GeM Master
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {view === "form" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  New Tender Entry
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Step 1: Fill details & Map T&Cs.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                      <Building className="w-5 h-5 text-blue-500" /> Department
                      Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Department Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="departmentName"
                          value={formData.departmentName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Department Email{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="email"
                            name="departmentEmail"
                            value={formData.departmentEmail}
                            onChange={handleChange}
                            className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tender Inviting Authority (TIA){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            name="tenderInvitingAuthority"
                            value={formData.tenderInvitingAuthority}
                            onChange={handleChange}
                            placeholder="e.g. Chairperson, Dept of Physics"
                            className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                      <Layers className="w-5 h-5 text-blue-500" />{" "}
                      Classification
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="tenderCategory"
                          value={formData.tenderCategory}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        >
                          <option value="service">Service</option>
                          <option value="product">Product</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="tenderType"
                          value={formData.tenderType}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        >
                          <option value="gem">GeM</option>
                          <option value="etender">E-Tender</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                      <Hash className="w-5 h-5 text-blue-500" /> General Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tender Name / Title{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="tenderName"
                          value={formData.tenderName}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. Procurement of furniture articles"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tender No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="tenderNo"
                          value={formData.tenderNo}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Estimated Cost (₹){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="estimatedCost"
                          value={formData.estimatedCost}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="itemQuantity"
                          value={formData.itemQuantity}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Bid Validity (Days){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="bidValidity"
                          value={formData.bidValidity}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                      <DollarSign className="w-5 h-5 text-blue-500" />{" "}
                      Financials
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          EMD Required <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emdRequired"
                          value={formData.emdRequired}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          PBG Required <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="pbgRequired"
                          value={formData.pbgRequired}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Pledge Officer <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emdPledgeOfficer"
                          value={formData.emdPledgeOfficer}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                      <Calendar className="w-5 h-5 text-blue-500" /> Dates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1">
                          Bid Start <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="bidStartDate"
                          value={formData.bidStartDate}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1">
                          Bid End <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="bidEndDate"
                          value={formData.bidEndDate}
                          onChange={handleChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                      Select Applicable T&Cs
                    </h2>
                    <p className="text-sm text-slate-500">
                      Select categories on the left, then check the clauses you
                      want to include.
                    </p>

                    <div className="flex flex-col md:flex-row border border-slate-300 rounded-lg overflow-hidden h-[500px]">
                      <div className="w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-300 overflow-y-auto">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategoryFilter(cat.id)}
                            className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-slate-100 transition-colors flex justify-between items-center ${activeCategoryFilter === cat.id
                              ? "bg-white text-blue-600 border-l-4 border-l-blue-600"
                              : "text-slate-600 hover:bg-slate-100"
                              }`}
                          >
                            {cat.name}
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                              {
                                terms.filter((t) => t.categoryId === cat.id)
                                  .length
                              }
                            </span>
                          </button>
                        ))}
                        {categories.length === 0 && (
                          <div className="p-4 text-xs text-slate-400">
                            No categories defined.
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-2/3 bg-white p-4 overflow-y-auto">
                        {!activeCategoryFilter ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Folder className="w-10 h-10 mb-2 opacity-50" />
                            <p>Select a category to view terms</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {terms.filter(
                              (t) => t.categoryId === activeCategoryFilter
                            ).length === 0 ? (
                              <p className="text-sm text-slate-400 italic">
                                No terms in this category.
                              </p>
                            ) : (
                              terms
                                .filter(
                                  (t) => t.categoryId === activeCategoryFilter
                                )
                                .map((term) => (
                                  <div
                                    key={term.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                                    onClick={() => toggleTermSelection(term.id)}
                                  >
                                    <div
                                      className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border transition-colors ${formData.selectedTermIds.includes(
                                        term.id
                                      )
                                        ? "bg-blue-600 border-blue-600"
                                        : "bg-white border-slate-300"
                                        }`}
                                    >
                                      {formData.selectedTermIds.includes(
                                        term.id
                                      ) && (
                                          <CheckSquare className="w-3.5 h-3.5 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                      <h4
                                        className={`text-sm font-bold ${formData.selectedTermIds.includes(
                                          term.id
                                        )
                                          ? "text-blue-800"
                                          : "text-slate-700"
                                          }`}
                                      >
                                        {term.title}
                                      </h4>
                                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                                        {term.description}
                                      </p>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                          Selection Breakdown
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {getSelectionSummary().length === 0 ? (
                            <span className="text-xs text-slate-400 italic">
                              No terms selected yet.
                            </span>
                          ) : (
                            getSelectionSummary().map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center bg-white px-2 py-1 rounded border border-slate-200 shadow-sm text-xs"
                              >
                                <span className="font-medium text-slate-700 mr-2">
                                  {item.name}:
                                </span>
                                <span className="font-bold text-blue-600">
                                  {item.count}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                        <span className="text-sm font-medium text-slate-700">
                          Total Terms Selected:
                        </span>
                        <span className="font-bold text-lg text-blue-700 bg-blue-100 px-3 py-0.5 rounded-full border border-blue-200">
                          {formData.selectedTermIds.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" /> Save Form Data
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {view === "my-tenders" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  My Tenders
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Manage and generate documents for saved entries.
                </p>
              </div>
              <button
                onClick={() => setView("form")}
                className="flex items-center gap-2 text-sm text-white font-medium bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create New
              </button>
            </div>

            {savedTenders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-700">
                  No tenders saved yet
                </h3>
                <p className="text-slate-500 text-sm">
                  Check your DB connection if you expected data here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {tender.tenderType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(tender.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">
                      {tender.tenderName || "Untitled Tender"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 font-mono">
                      {tender.tenderNo}
                    </p>

                    <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">TIA:</span>
                        <span className="font-medium text-slate-900 truncate max-w-[150px]">
                          {tender.tenderInvitingAuthority}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Est. Cost:</span>
                        <span className="font-medium text-slate-900">
                          ₹{tender.estimatedCost}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Terms Mapped:</span>
                        <span className="font-medium text-slate-900">
                          {tender.selectedTermIds?.length || 0} Clauses
                        </span>
                      </div>
                      <button
                        onClick={() => viewTenderDetails(tender)}
                        className="w-full mt-2 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-200 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-colors flex justify-center items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "tender-details" && activeTender && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setView("my-tenders")}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTender.tenderName}
                </h1>
                <p className="text-slate-500 text-sm font-mono">
                  {activeTender.tenderNo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" /> Organization
                    Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Department Name
                      </span>{" "}
                      {activeTender.departmentName}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Department Email
                      </span>{" "}
                      {activeTender.departmentEmail}
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Tender Inviting Authority
                      </span>{" "}
                      {activeTender.tenderInvitingAuthority}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Tender
                    Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div className="md:col-span-2">
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Tender Title
                      </span>{" "}
                      {activeTender.tenderName}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Reference No
                      </span>{" "}
                      {activeTender.tenderNo}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Category / Type
                      </span>{" "}
                      <span className="capitalize">
                        {activeTender.tenderCategory}
                      </span>{" "}
                      /{" "}
                      <span className="uppercase">
                        {activeTender.tenderType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Item Quantity
                      </span>{" "}
                      {activeTender.itemQuantity}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Estimated Cost
                      </span>{" "}
                      ₹{activeTender.estimatedCost}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Bid Validity
                      </span>{" "}
                      {activeTender.bidValidity} Days
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-500" /> Financial
                    Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        EMD Required
                      </span>{" "}
                      {activeTender.emdRequired}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        PBG Required
                      </span>{" "}
                      {activeTender.pbgRequired}
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Pledge Officer
                      </span>{" "}
                      {activeTender.emdPledgeOfficer}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Critical
                    Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Bid Start Date
                      </span>{" "}
                      {formatDateDisplay(activeTender.bidStartDate)}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Bid End Date
                      </span>{" "}
                      {formatDateDisplay(activeTender.bidEndDate)}
                    </div>
                    {activeTender.publishDate && (
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wider">
                          Publish Date
                        </span>{" "}
                        {formatDateDisplay(activeTender.publishDate)}
                      </div>
                    )}
                    {activeTender.offlineSubmissionDate && (
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wider">
                          Offline Submission
                        </span>{" "}
                        {formatDateDisplay(activeTender.offlineSubmissionDate)}
                      </div>
                    )}
                    {activeTender.techEvalDate && (
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wider">
                          Tech Bid Opening
                        </span>{" "}
                        {formatDateDisplay(activeTender.techEvalDate)}
                      </div>
                    )}

                    <div className="md:col-span-2 border-t pt-2 mt-2">
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Pre-Bid Meeting
                      </span>
                      {activeTender.isPreBidRequired === "yes"
                        ? `Required on ${formatDateDisplay(
                          activeTender.preBidDate
                        )}`
                        : "Not Required"}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                    Mapped Terms & Conditions
                  </h3>
                  {activeTender.selectedTermIds &&
                    activeTender.selectedTermIds.length > 0 ? (
                    <div className="space-y-4">
                      {activeTender.selectedTermIds.map((id) => {
                        const term = terms.find((t) => t.id === id);
                        if (!term) return null;
                        return (
                          <div
                            key={id}
                            className="p-3 bg-slate-50 rounded border border-slate-100"
                          >
                            <h4 className="font-bold text-slate-800 text-sm">
                              {term.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                              {term.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      No additional terms mapped.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                  <h3 className="font-bold text-blue-900 mb-2">Next Step</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Generate the final legal document using the template logic.
                  </p>
                  {/* GENERATE DOCUMENT BUTTON */}
                  <button
                    onClick={handleGenerateDocument}
                    disabled={genLoading}
                    className={`w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 ${genLoading ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                  >
                    {genLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Generate Document
                      </>
                    )}
                  </button>
                </div>

                {/* SAVED DOCUMENTS LIST */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Save className="w-4 h-4 text-blue-500" /> Saved Versions
                  </h3>

                  {savedDocsLoading ? (
                    <div className="text-center py-4 text-slate-500 text-sm">Loading saved versions...</div>
                  ) : savedDocs.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500">No saved versions yet.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Open the preview and click "Save" to create a version.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 hover:border-blue-300 transition-colors group"
                        >
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4>
                            <p className="text-xs text-slate-500">
                              {new Date(doc.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => window.open(`/tender-preview/${activeTender.id}?savedId=${doc.id}`, "_blank")}
                            className="text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "categories" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setView("form")}>
                <ArrowLeft />
              </button>
              <h1 className="text-2xl font-bold">Categories</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold mb-4">
                  {isEditing ? "Edit" : "Add"} Category
                </h2>
                <form onSubmit={saveCategory} className="space-y-4">
                  <input
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    className="w-full p-2 border rounded"
                    placeholder="Name"
                    required
                  />
                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                    className="w-full p-2 border rounded"
                    placeholder="Desc"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white p-2 rounded"
                    >
                      Save
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 border p-2 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="lg:col-span-2 space-y-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-4 border rounded flex justify-between"
                  >
                    <div>
                      <h3 className="font-bold">{c.name}</h3>
                      <p className="text-sm">{c.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editItem(c, "cat")}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDeleteCategory(c.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "gem-master" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setView("form")}>
                <ArrowLeft />
              </button>
              <h1 className="text-2xl font-bold">GeM Master</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold mb-4">
                  {isEditing ? "Edit" : "Add"} Term
                </h2>
                <form onSubmit={saveTerm} className="space-y-4">
                  <select
                    name="categoryId"
                    value={termForm.categoryId}
                    onChange={handleTermChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    name="title"
                    value={termForm.title}
                    onChange={handleTermChange}
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                    required
                  />
                  <textarea
                    name="description"
                    value={termForm.description}
                    onChange={handleTermChange}
                    className="w-full p-2 border rounded"
                    placeholder="Clause Text"
                    rows="4"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white p-2 rounded"
                    >
                      Save
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 border p-2 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {terms.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white p-4 border rounded relative group"
                  >
                    <span className="text-[10px] bg-slate-100 font-bold px-2 py-1 rounded uppercase">
                      {categories.find((c) => c.id === t.categoryId)?.name}
                    </span>
                    <h3 className="font-bold mt-2">{t.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                      {t.description}
                    </p>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-2">
                      <button onClick={() => editItem(t, "term")}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDeleteTerm(t.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tender-preview/:id" element={<TenderPreview />} />
    </Routes>
  );
}
