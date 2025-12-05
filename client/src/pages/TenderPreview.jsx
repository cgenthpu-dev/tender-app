import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Printer, Edit, Check, Plus, Save } from 'lucide-react';

// Reusable Layout Component for the Triple Border & Pagination
const PageLayout = ({ children, pageNumber, totalPages, contentId, savedHtml }) => (
    <div className="a4-page">
        {/* 1. Outer Line (1px) */}
        <div className="border-outer">
            {/* 2. Middle Line (3px) */}
            <div className="border-middle">
                {/* 3. Inner Line (1px) + Content Padding */}
                <div className="border-inner">

                    {/* Page Content */}
                    {savedHtml !== undefined ? (
                        <div
                            id={contentId}
                            className="page-content"
                            dangerouslySetInnerHTML={{ __html: savedHtml }}
                        />
                    ) : (
                        <div id={contentId} className="page-content">
                            {children}
                        </div>
                    )}

                    {/* Pagination Footer */}
                    <div className="page-footer">
                        Page {pageNumber} of {totalPages}
                    </div>

                </div>
            </div>
        </div>
    </div>
);

const TenderPreview = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const savedId = searchParams.get('savedId');

    const [data, setData] = useState(null);
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

    // State for dynamic pages
    const [extraPages, setExtraPages] = useState([]);
    // State to preserve edits when re-rendering
    const [savedContent, setSavedContent] = useState({});

    // Save Modal State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveName, setSaveName] = useState("");

    const [paginatedTerms, setPaginatedTerms] = useState([]);

    // Helper to group terms by category
    const getTermsByCategory = () => {
        const grouped = {};
        terms.forEach(term => {
            if (!grouped[term.categoryId]) {
                grouped[term.categoryId] = [];
            }
            grouped[term.categoryId].push(term);
        });
        return grouped;
    };

    useEffect(() => {
        if (!id) {
            console.error("No ID found in URL parameters");
            setError("Invalid URL: No Tender ID provided.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            console.log(`Fetching data for ID: ${id}`);
            try {
                // 1. Fetch original tender data
                const response = await axios.get(`http://localhost:5000/api/tenders/${id}`, { timeout: 5000 });
                console.log("Data fetched successfully:", response.data);
                const tender = response.data;

                // 2. Fetch Terms and Categories
                const dashboardResponse = await axios.get(`http://localhost:5000/api/dashboard-data`);
                const allTerms = dashboardResponse.data.terms || [];
                const allCategories = dashboardResponse.data.categories || [];

                // Filter selected terms
                const selectedTermIds = tender.selectedTermIds || [];
                const selectedTerms = allTerms.filter(term => selectedTermIds.includes(term.id));

                setTerms(selectedTerms);
                setCategories(allCategories);

                // Map API response to component state structure
                setData({
                    name_of_department: tender.departmentName || "N/A",
                    email_of_department: tender.departmentEmail || "N/A",
                    procurement_title: tender.tenderName || "N/A",
                    tender_title: tender.tenderName || "N/A",
                    quantity: tender.itemQuantity || "N/A",
                    emd_value: tender.emdRequired || "N/A",
                    pbg_value: tender.pbgRequired || "N/A",
                    emd_officer: tender.emdPledgeOfficer || "N/A",
                    bid_validity: tender.bidValidity || "N/A"
                });

                // 3. If savedId exists, fetch the saved document state
                if (savedId) {
                    console.log(`Fetching saved document: ${savedId}`);
                    const savedDocResponse = await axios.get(`http://localhost:5000/api/documents/${savedId}`);
                    const savedDoc = savedDocResponse.data;

                    if (savedDoc) {
                        setSavedContent(savedDoc.pages || {});
                        setExtraPages(savedDoc.extraPages || []);
                        console.log("Loaded saved document state");
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                const errorMsg = err.response?.data?.error || err.message || "Unknown error";
                setError(`Failed to load data: ${errorMsg}`);
                setLoading(false);
            }
        };

        fetchData();
    }, [id, savedId]);

    useEffect(() => {
        if (categories.length === 0 || terms.length === 0) return;

        const CHARS_PER_PAGE = 2200;
        const pages = [];
        let currentPage = [];
        let currentChars = 0;

        // Helper to split text at the nearest space
        const splitText = (text, limit) => {
            if (text.length <= limit) return [text, ""];
            let splitIndex = text.lastIndexOf(' ', limit);
            // If no space found or space is too far back (less than 70% of limit), force split at limit
            if (splitIndex === -1 || splitIndex < limit * 0.7) splitIndex = limit;
            return [text.substring(0, splitIndex), text.substring(splitIndex)];
        };

        // --- Static Intro for the First Terms Page (Section 2) ---
        const staticIntro = (
            <div key="static-intro" className="mt-4 mb-8">
                <h4 className="text-lg font-bold uppercase mb-4 mt-6">
                    SECTION 2: GENERAL REQUIREMENTS
                </h4>
                <div className="text-justify text-md space-y-4 px-2 leading-relaxed">
                    <p>
                        <strong>2.1 Digital Signature:</strong> <span style={{ fontWeight: 'normal' }}>Bids must be digitally signed by an authorized representative of the bidding firm using a valid Class-II or Class-III Digital Signature Certificate (DSC).</span>
                    </p>
                    <p>
                        <strong>2.2 Documentation:</strong> <span style={{ fontWeight: 'normal' }}>Bidders are required to upload scanned copies of all necessary documents as specified in this bid document. All uploaded documents must be clear, legible, and duly signed and stamped by the authorized signatory.</span>
                    </p>
                </div>
            </div>
        );
        currentPage.push(staticIntro);
        currentChars += 800; // Increased cost for header + content

        // --- Group and Paginate Terms ---
        const grouped = getTermsByCategory();

        categories.forEach((cat, catIndex) => {
            const catTerms = grouped[cat.id];
            if (!catTerms || catTerms.length === 0) return;

            // --- Category Header Logic ---
            const headerBlock = (
                <h4 key={`cat-${cat.id}`} className="text-lg font-bold uppercase mb-4 mt-6">
                    SECTION {catIndex + 3}: {cat.name.toUpperCase()}
                </h4>
            );
            const headerCost = 150;

            // Orphan Control: Ensure enough space for Header + Minimum Content (e.g. 300 chars)
            if (currentChars > CHARS_PER_PAGE - 600) {
                pages.push(currentPage);
                currentPage = [];
                currentChars = 0;
            }
            currentPage.push(headerBlock);
            currentChars += headerCost;

            // --- Terms Logic (with Splitting) ---
            catTerms.forEach((term, termIndex) => {
                let fullDesc = term.description || "";
                fullDesc = fullDesc.replace(/\s+/g, ' ').trim();

                const titlePrefix = `${catIndex + 3}.${termIndex + 1} ${term.title}: `;
                let isFirstChunk = true;

                while (fullDesc.length > 0 || isFirstChunk) {
                    const available = CHARS_PER_PAGE - currentChars;

                    // If very little space left, move to next page
                    if (available < 150) {
                        pages.push(currentPage);
                        currentPage = [];
                        currentChars = 0;
                        continue;
                    }

                    const costPrefix = isFirstChunk ? titlePrefix.length : 0;
                    const buffer = 10; // Minimal buffer to fill line
                    const maxDescChars = available - costPrefix - buffer;

                    if (maxDescChars <= 0) {
                        pages.push(currentPage);
                        currentPage = [];
                        currentChars = 0;
                        continue;
                    }

                    // Anti-Runt Logic: If splitting would leave a tiny chunk (< 100 chars) on the next page,
                    // and we are not at the start of a page, push the whole thing to the next page.
                    if (fullDesc.length > maxDescChars && (fullDesc.length - maxDescChars) < 100) {
                        if (currentChars > 500) {
                            pages.push(currentPage);
                            currentPage = [];
                            currentChars = 0;
                            continue;
                        }
                    }

                    let chunk = "";
                    let remaining = "";
                    let isSplit = false;

                    if (fullDesc.length <= maxDescChars) {
                        chunk = fullDesc;
                        remaining = "";
                    } else {
                        [chunk, remaining] = splitText(fullDesc, maxDescChars);
                        isSplit = true;
                    }

                    const content = (
                        <div
                            key={`${term.id}-${isFirstChunk ? 'start' : 'cont'}-${pages.length}`}
                            className={`${isSplit ? 'mb-0' : 'mb-3'} pl-2 text-justify leading-relaxed`}
                        >
                            <p>
                                {isFirstChunk && <strong>{titlePrefix}</strong>}
                                <span style={{ fontWeight: 'normal' }}>{chunk}</span>
                            </p>
                        </div>
                    );

                    currentPage.push(content);
                    currentChars += (costPrefix + chunk.length + buffer);

                    fullDesc = remaining.trim();
                    isFirstChunk = false;

                    if (!isSplit) break;
                }
            });
        });

        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        setPaginatedTerms(pages);

    }, [categories, terms]);

    // Calculate total pages: 2 static (Cover + Summary) + Dynamic Terms Pages + Extra Pages
    const termsPageCount = paginatedTerms.length > 0 ? paginatedTerms.length : 1; // At least 1 for the static intro if empty
    const totalPages = 2 + termsPageCount + extraPages.length;

    const handlePrint = () => {
        window.print();
    };

    const toggleEditMode = () => {
        const newMode = !isEditable;
        setIsEditable(newMode);
        document.designMode = newMode ? 'on' : 'off';
    };

    // Save current DOM content to state to prevent loss on re-render
    const saveCurrentContent = () => {
        const newSavedContent = { ...savedContent };

        // Save Page 1 & 2
        for (let i = 1; i <= 2; i++) {
            const el = document.getElementById(`page-content-${i}`);
            if (el) newSavedContent[i] = el.innerHTML;
        }

        // Save Terms Pages
        for (let i = 0; i < termsPageCount; i++) {
            const pageNum = 3 + i;
            const el = document.getElementById(`page-content-${pageNum}`);
            if (el) newSavedContent[pageNum] = el.innerHTML;
        }

        // Save Extra Pages
        extraPages.forEach((_, idx) => {
            const pageNum = 3 + termsPageCount + idx;
            const el = document.getElementById(`page-content-${pageNum}`);
            if (el) newSavedContent[pageNum] = el.innerHTML;
        });

        return newSavedContent;
    };

    const handleAddPage = () => {
        const currentContent = saveCurrentContent();
        setSavedContent(currentContent);
        setExtraPages([...extraPages, { id: Date.now() }]);
    };

    const handleSaveClick = () => {
        setSaveName(""); // Reset name
        setIsSaveModalOpen(true);
    };

    const confirmSave = async (e) => {
        e.preventDefault();
        if (!saveName.trim()) return;

        const currentContent = saveCurrentContent();
        // Update state locally first
        setSavedContent(currentContent);

        try {
            const payload = {
                tenderId: id,
                name: saveName,
                pages: currentContent,
                extraPages: extraPages
            };

            await axios.post('http://localhost:5000/api/documents', payload);
            setIsSaveModalOpen(false);
            alert("Document saved successfully!");
        } catch (err) {
            console.error("Error saving document:", err);
            alert("Failed to save document.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading document...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!data) return <div className="p-8 text-center">No data found.</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8 font-serif print:bg-white print:p-0 print:gap-0">
            <style>{`
        /* Importing Montserrat */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        /* Global Font */
        .doc-font {
          font-family: 'Montserrat', sans-serif;
        }

        /* --- A4 Page Setup --- */
        .a4-page {
          background-color: white;
          width: 210mm;
          height: 297mm; /* Fixed A4 Height */
          padding: 10mm; /* Outer whitespace margin for printer */
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          position: relative;
          margin: 0 auto; /* Center on screen */
        }

        /* --- Triple Border Logic (Tightened) --- */
        
        .border-outer {
          border: 1px solid #006400; /* Dark Green */
          height: 100%;
          padding: 1px; /* GAP REDUCED: 1px gap between outer and middle */
          box-sizing: border-box;
        }

        .border-middle {
          border: 3px solid #006400; /* Dark Green, Thick */
          height: 100%;
          padding: 1px; /* GAP REDUCED: 1px gap between middle and inner */
          box-sizing: border-box;
        }

        .border-inner {
          border: 1px solid #006400; /* Dark Green */
          height: 100%;
          padding: 32px; /* INTERNAL PADDING to prevent content overlap */
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Content Area (grows to push footer down) */
        .page-content {
          flex-grow: 1;
        }

        /* Footer Positioning */
        .page-footer {
          position: absolute;
          bottom: 15px;
          right: 32px; /* Matches border-inner padding */
          text-align: right;
          font-size: 10pt;
          font-weight: 600;
        }

        /* --- Table Styles --- */
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .summary-table th, .summary-table td {
          border: 1px solid black;
          padding: 8px 12px;
          vertical-align: top;
          font-size: 10pt;
        }
        .summary-table th {
          background-color: #f0f0f0;
          font-weight: 700;
          text-align: left;
        }

        /* --- Print Styles --- */
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .a4-page {
            box-shadow: none;
            margin: 0 auto; /* Center on paper */
            width: 210mm;   /* Force A4 width */
            height: 297mm;  /* Force A4 height */
            page-break-after: always;
            padding: 10mm;  /* Consistent padding */
            overflow: hidden; /* Prevent overflow */
          }
          .flex-col {
            gap: 0 !important;
          }
        }

        /* Highlight editable areas slightly when in edit mode */
        ${isEditable ? `
        .a4-page {
            outline: 2px dashed #3b82f6;
            outline-offset: 4px;
        }
        ` : ''}
      `}</style>

            {/* Toolbar */}
            <div className="no-print flex gap-4 sticky top-4 z-50 bg-white/80 backdrop-blur p-2 rounded-lg shadow-sm border border-gray-200">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors font-sans"
                >
                    <Printer size={20} />
                    Print / Save as PDF
                </button>

                <button
                    onClick={handleSaveClick}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors font-sans"
                >
                    <Save size={20} />
                    Save Version
                </button>

                <button
                    onClick={toggleEditMode}
                    className={`flex items-center gap-2 px-4 py-2 rounded shadow transition-colors font-sans ${isEditable
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {isEditable ? <Check size={20} /> : <Edit size={20} />}
                    {isEditable ? 'Finish Editing' : 'Edit Document'}
                </button>
            </div>

            {/* SAVE MODAL */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Save className="w-5 h-5 text-indigo-600" />
                            Save Document Version
                        </h3>
                        <form onSubmit={confirmSave}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Version Name
                            </label>
                            <input
                                type="text"
                                autoFocus
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="e.g. Draft 1, Final Review..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                required
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsSaveModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                >
                                    Save Version
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- PAGE 1: Header & Title Info --- */}
            <div className="doc-font text-black leading-snug">
                <PageLayout
                    pageNumber={1}
                    totalPages={totalPages}
                    contentId="page-content-1"
                    savedHtml={savedContent[1]}
                >
                    <div className="h-full flex flex-col pt-16">

                        <div className="text-center">
                            <h2 className="text-xl font-bold">Himachal Pradesh University,</h2>
                            <h3 className="text-lg font-bold">(NAAC Accredited ‘A’ Grade University)</h3>
                            <h3 className="text-lg font-bold">“{data.name_of_department}”</h3>

                            <div className="my-8 flex justify-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg"
                                    alt="HPU Logo"
                                    className="h-40 w-auto object-contain"
                                />
                            </div>

                            <h1 className="text-2xl font-bold my-6 px-8">
                                Bid Document for<br />
                                <span className="text-xl font-normal block mt-2">{data.procurement_title}</span>
                                <br />
                                for<br />
                                <span className="text-xl font-normal block mt-2">{data.name_of_department}</span>
                            </h1>

                            <div className="mt-8 text-lg">
                                <p className="mb-2"><strong>Website:</strong> <a href="https://www.hpuniv.ac.in" className="text-blue-800 underline">https://www.hpuniv.ac.in</a></p>
                                <p><strong>E-mail:</strong> {data.email_of_department}</p>
                            </div>
                        </div>

                    </div>
                </PageLayout>
            </div>

            {/* --- PAGE 2: Summary & Instructions Part 1 --- */}
            <div className="doc-font text-black leading-snug">
                <PageLayout
                    pageNumber={2}
                    totalPages={totalPages}
                    contentId="page-content-2"
                    savedHtml={savedContent[2]}
                >

                    {/* SUMMARY Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold uppercase underline mb-4 text-center">SUMMARY</h3>

                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>Sr. No.</th>
                                    <th style={{ width: '30%' }}>Description</th>
                                    <th style={{ width: '60%' }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: "Item Description", value: data.tender_title },
                                    { label: "Quantity", value: data.quantity },
                                    { label: "Department", value: data.name_of_department },
                                    { label: "Bid Start Date & Time", value: "[as mentioned in Gem Bid Document]" },
                                    { label: "Bid End Date & Time", value: "[as mentioned in Gem Bid Document]" },
                                    { label: "Pre-Bid Meeting", value: "[as mentioned in Gem Bid Document]" },
                                    { label: "Earnest Money Deposit (EMD)", value: data.emd_value },
                                    { label: "Performance Security", value: data.pbg_value },
                                    { label: "Pledge of EMD / PBG", value: <>EMD and Performance Bank Guarantee (PBG) must be pledged only in the name of: <strong>{data.emd_officer}</strong></> },
                                    { label: "Bid Validity", value: `${data.bid_validity} days from the date of publication of bid.` }
                                ].map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}.</td>
                                        <td>{item.label}</td>
                                        <td>{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="font-bold text-sm mt-4 border p-2 bg-gray-50">
                            Note: The terms and conditions specified in this tender document shall prevail over the terms and conditions available on the GeM portal in case of any conflict.
                        </p>
                    </div>

                    {/* SECTION I: INSTRUCTIONS FOR BIDDERS (Hardcoded + Dynamic) */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold uppercase underline mb-4 text-center">SECTION 1: INSTRUCTIONS FOR BIDDERS</h3>

                        <div className="text-justify text-md space-y-4 px-2">
                            <p>
                                <strong>1.1 Bid Submission:</strong> Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids, including technical and financial components, must be submitted exclusively online through the GeM portal (gem.gov.in) before the specified deadline. Physical or offline bids will not be accepted.
                            </p>

                            <p>
                                <strong>1.2 Governing Terms:</strong> This bid process will be governed by the General Terms and Conditions (GTC) of GeM in addition to the Additional Terms and Conditions (ATC) specified in this document. In case of any conflict, the terms specified in this document will prevail.
                            </p>
                        </div>
                    </div>
                </PageLayout>
            </div>

            {/* --- DYNAMIC TERMS PAGES (Page 3 onwards) --- */}
            {paginatedTerms.length > 0 ? (
                paginatedTerms.map((pageContent, index) => {
                    const pageNum = 3 + index;
                    return (
                        <div key={`terms-page-${index}`} className="doc-font text-black leading-snug">
                            <PageLayout
                                pageNumber={pageNum}
                                totalPages={totalPages}
                                contentId={`page-content-${pageNum}`}
                                savedHtml={savedContent[pageNum]}
                            >
                                {pageContent}
                            </PageLayout>
                        </div>
                    );
                })
            ) : (
                // Fallback if no terms (render empty Page 3)
                <div className="doc-font text-black leading-snug">
                    <PageLayout
                        pageNumber={3}
                        totalPages={totalPages}
                        contentId="page-content-3"
                        savedHtml={savedContent[3]}
                    >
                        <div className="p-4 text-center text-gray-500">No terms selected.</div>
                    </PageLayout>
                </div>
            )}

            {/* --- EXTRA PAGES --- */}
            {extraPages.map((page, index) => {
                const pageNum = 3 + termsPageCount + index;
                return (
                    <div key={page.id} className="doc-font text-black leading-snug">
                        <PageLayout
                            pageNumber={pageNum}
                            totalPages={totalPages}
                            contentId={`page-content-${pageNum}`}
                            savedHtml={savedContent[pageNum]}
                        >
                            <div className="h-full p-4">
                                <h3 className="text-lg font-bold mb-4">New Page {pageNum}</h3>
                                <p>Start typing your content here...</p>
                            </div>
                        </PageLayout>
                    </div>
                );
            })}

            {/* Add Page Button (Bottom Centered) */}
            {isEditable && (
                <div className="no-print w-full flex justify-center pb-12">
                    <button
                        type="button"
                        onClick={handleAddPage}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 font-sans text-lg"
                    >
                        <Plus size={24} />
                        Add New Page
                    </button>
                </div>
            )}

        </div>
    );
};

export default TenderPreview;
