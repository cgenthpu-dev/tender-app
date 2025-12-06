import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building,
    Mail,
    UserCheck,
    Layers,
    Hash,
    DollarSign,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Save,
    CheckSquare,
    Square,
    RefreshCw,
} from "lucide-react";
import {
    fetchDashboardData,
    createTender,
    updateTender,
} from "../services/api";

const CreateTender = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [terms, setTerms] = useState([]);
    const [showVariables, setShowVariables] = useState(false);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

    const VARIABLE_FIELDS = [
        { key: "scope_of_work", label: "Scope of Work" },
        { key: "experience_years", label: "Experience (Years)" },
        { key: "financial_years", label: "Financial Years (e.g., 2021-24)" },
        { key: "past_performance_percentage", label: "Past Performance (%)" },
        { key: "min_turnover", label: "Minimum Turnover" },
        { key: "emd_amount", label: "EMD Amount" },
        { key: "emd_amount_words", label: "EMD Amount (Words)" },
        { key: "emd_pledge_officer", label: "EMD Pledge Officer" },
        { key: "submission_officer", label: "Submission Officer" },
        { key: "emd_submission_days", label: "EMD Submission Days" },
        { key: "pbg_percentage", label: "PBG Percentage" },
        { key: "pbg_submission_days", label: "PBG Submission Days" },
        { key: "pbg_validity_period", label: "PBG Validity (Months)" },
        { key: "annexure_ref", label: "Annexure Reference" },
        { key: "stamp_paper_value", label: "Stamp Paper Value" },
        { key: "contract_signing_days", label: "Contract Signing Days" },
        { key: "delivery_days", label: "Delivery Timeline (Days)" },
        { key: "penalty_rate", label: "Penalty Rate (%)" },
        { key: "max_penalty", label: "Max Penalty (%)" },
        { key: "max_delay_weeks", label: "Max Delay (Weeks)" },
        { key: "warranty_years", label: "Warranty (Years)" },
        { key: "response_time_hours", label: "Response Time (Hours)" },
        { key: "uptime_guarantee", label: "Uptime Guarantee (%)" },
        { key: "service_penalty_1", label: "Service Penalty (1st Week)" },
        { key: "service_penalty_2", label: "Service Penalty (2nd Week+)" },
        { key: "max_service_delay_days", label: "Max Service Delay (Days)" },
        { key: "spare_parts_years", label: "Spare Parts Availability (Years)" },
        { key: "arbitrator_authority", label: "Arbitrator Authority" },
        { key: "court_jurisdiction", label: "Court Jurisdiction" },
    ];

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
        variables: {},
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariableChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            variables: { ...prev.variables, [name]: value },
        }));
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

        if (!showVariables) {
            setShowVariables(true);
            setFormData((prev) => ({
                ...prev,
                variables: {
                    ...prev.variables,
                    emd_amount: prev.emdRequired,
                    emd_pledge_officer: prev.emdPledgeOfficer,
                    scope_of_work: prev.tenderName,
                },
            }));
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setLoading(true);
        try {
            await createTender(formData);
            navigate("/my-tenders");
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save tender.");
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">New Tender Entry</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Step 1: Fill details & Map T&Cs.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className={showVariables ? "hidden" : "block"}>
                            {/* Department Details */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                                    <Building className="w-5 h-5 text-blue-500" /> Department Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Department Name <span className="text-red-500">*</span>
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
                                            Department Email <span className="text-red-500">*</span>
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
                                            Tender Inviting Authority (TIA) <span className="text-red-500">*</span>
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

                            {/* Classification */}
                            <div className="space-y-4 mt-8">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                                    <Layers className="w-5 h-5 text-blue-500" /> Classification
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

                            {/* General Details */}
                            <div className="space-y-4 mt-8">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                                    <Hash className="w-5 h-5 text-blue-500" /> General Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tender Name / Title <span className="text-red-500">*</span>
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
                                            Estimated Cost (₹) <span className="text-red-500">*</span>
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
                                            Bid Validity (Days) <span className="text-red-500">*</span>
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

                            {/* Financials */}
                            <div className="space-y-4 mt-8">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                                    <DollarSign className="w-5 h-5 text-blue-500" /> Financials
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            EMD Required (₹)
                                        </label>
                                        <input
                                            type="text"
                                            name="emdRequired"
                                            value={formData.emdRequired}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Leave blank if not applicable"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            PBG Required (%)
                                        </label>
                                        <input
                                            type="text"
                                            name="pbgRequired"
                                            value={formData.pbgRequired}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. 3%"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            EMD Pledge Officer
                                        </label>
                                        <input
                                            type="text"
                                            name="emdPledgeOfficer"
                                            value={formData.emdPledgeOfficer}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="space-y-4 mt-8">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                                    <Calendar className="w-5 h-5 text-blue-500" /> Critical Dates
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Publish Date/Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="publishDate"
                                            value={formData.publishDate}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Pre-Bid Meeting Required?
                                        </label>
                                        <select
                                            name="isPreBidRequired"
                                            value={formData.isPreBidRequired}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="no">No</option>
                                            <option value="yes">Yes</option>
                                        </select>
                                    </div>
                                    {formData.isPreBidRequired === "yes" && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Pre-Bid Meeting Date
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="preBidDate"
                                                value={formData.preBidDate}
                                                onChange={handleChange}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Bid Start Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="bidStartDate"
                                            value={formData.bidStartDate}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Bid End Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="bidEndDate"
                                            value={formData.bidEndDate}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Offline Submission End Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="offlineSubmissionDate"
                                            value={formData.offlineSubmissionDate}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tech Eval Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="techEvalDate"
                                            value={formData.techEvalDate}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Terms Selection */}
                            <div className="space-y-4 mt-8">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                                        <CheckSquare className="w-5 h-5 text-blue-500" /> Select Terms & Conditions
                                    </h2>
                                    <div className="text-sm text-slate-500">
                                        {formData.selectedTermIds.length} terms selected
                                    </div>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveCategoryFilter(null)}
                                        className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategoryFilter === null
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setActiveCategoryFilter(cat.id)}
                                            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategoryFilter === cat.id
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 border rounded-lg p-4 bg-slate-50">
                                    {categories
                                        .filter(
                                            (cat) =>
                                                activeCategoryFilter === null ||
                                                activeCategoryFilter === cat.id
                                        )
                                        .map((cat) => {
                                            const catTerms = terms.filter(
                                                (t) => t.categoryId === cat.id
                                            );
                                            if (catTerms.length === 0) return null;

                                            return (
                                                <div key={cat.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                                    <div className="bg-slate-100 px-4 py-2 font-medium text-slate-700 border-b border-slate-200 flex justify-between items-center">
                                                        <span>{cat.name}</span>
                                                        <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                                                            {catTerms.length}
                                                        </span>
                                                    </div>
                                                    <div className="divide-y divide-slate-100">
                                                        {catTerms.map((term) => {
                                                            const isSelected = formData.selectedTermIds.includes(
                                                                term.id
                                                            );
                                                            return (
                                                                <div
                                                                    key={term.id}
                                                                    onClick={() => toggleTermSelection(term.id)}
                                                                    className={`p-3 cursor-pointer transition-colors hover:bg-blue-50 flex items-start gap-3 ${isSelected ? "bg-blue-50/50" : ""
                                                                        }`}
                                                                >
                                                                    <div className="mt-0.5">
                                                                        {isSelected ? (
                                                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                                                        ) : (
                                                                            <Square className="w-5 h-5 text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm text-slate-800">
                                                                            {term.title}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                                            {term.description}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Selection Summary */}
                            {formData.selectedTermIds.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <h3 className="text-sm font-semibold text-blue-800 mb-2">
                                        Selection Summary
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {getSelectionSummary().map((item) => (
                                            <span
                                                key={item.name}
                                                className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200 shadow-sm"
                                            >
                                                {item.name}: <strong>{item.count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Variable Configuration Step */}
                        <div className={showVariables ? "block" : "hidden"}>
                            <div className="flex items-center gap-2 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowVariables(false)}
                                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Terms
                                </button>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Configure Variables
                                </h2>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    Please fill in the values for the variables used in the Terms & Conditions.
                                    These values will replace the placeholders in the final document.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {VARIABLE_FIELDS.map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {field.label}
                                        </label>
                                        <input
                                            type="text"
                                            name={field.key}
                                            value={formData.variables[field.key] || ""}
                                            onChange={handleVariableChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Enter ${field.label}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate("/my-tenders")}
                                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" /> Saving...
                                    </>
                                ) : showVariables ? (
                                    <>
                                        <Save className="w-5 h-5" /> Final Save & Generate
                                    </>
                                ) : (
                                    <>
                                        Next: Configure Details <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTender;
