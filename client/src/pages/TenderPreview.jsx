import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Printer, Edit, Check, Plus, Save } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { paginateContent } from '../utils/pagination';

// Reusable Layout Component for the Triple Border & Pagination
const PageLayout = ({ children, pageNumber, totalPages, contentId, savedHtml, isEditable, onContentChange }) => (
    <div className="a4-page">
        {/* 1. Outer Line (1px) */}
        <div className="border-outer">
            {/* 2. Middle Line (3px) */}
            <div className="border-middle">
                {/* 3. Inner Line (1px) + Content Padding */}
                <div className="border-inner">

                    {/* Page Content */}
                    {isEditable ? (
                        <div className="h-full -mx-4 -my-2"> {/* Negative margin to fit editor nicely */}
                            <RichTextEditor
                                initialValue={savedHtml || ""}
                                onChange={(content) => onContentChange(pageNumber, content)}
                            />
                        </div>
                    ) : (
                        savedHtml !== undefined ? (
                            <div
                                id={contentId}
                                className="page-content"
                                dangerouslySetInnerHTML={{ __html: savedHtml }}
                            />
                        ) : (
                            <div id={contentId} className="page-content">
                                {children}
                            </div>
                        )
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

    // NEW: Single string for all terms content (for continuous editing)
    const [termsHtml, setTermsHtml] = useState("");

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

                        // Reconstruct termsHtml from saved pages (3 onwards)
                        let combinedHtml = "";
                        Object.keys(savedDoc.pages).forEach(pageNum => {
                            if (parseInt(pageNum) >= 3) {
                                combinedHtml += savedDoc.pages[pageNum];
                            }
                        });
                        setTermsHtml(combinedHtml);

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

    // Initial Pagination Logic (Runs once to generate initial HTML if not saved)
    useEffect(() => {
        if (categories.length === 0 || terms.length === 0) return;
        if (termsHtml) return; // If we already have HTML (from save or edit), don't overwrite

        // Generate initial HTML string from data
        let initialHtml = "";

        // Static Intro
        initialHtml += `
            <div class="mt-4 mb-8">
                <h4 class="text-lg font-bold uppercase mb-4 mt-6">SECTION 2: GENERAL REQUIREMENTS</h4>
                <div class="text-justify text-md space-y-4 px-2 leading-relaxed">
                    <p><strong>2.1 Digital Signature:</strong> <span style="font-weight: normal">Bids must be digitally signed by an authorized representative of the bidding firm using a valid Class-II or Class-III Digital Signature Certificate (DSC).</span></p>
                    <p><strong>2.2 Documentation:</strong> <span style="font-weight: normal">Bidders are required to upload scanned copies of all necessary documents as specified in this bid document. All uploaded documents must be clear, legible, and duly signed and stamped by the authorized signatory.</span></p>
                </div>
            </div>
        `;

        const grouped = getTermsByCategory();
        categories.forEach((cat, catIndex) => {
            const catTerms = grouped[cat.id];
            if (!catTerms || catTerms.length === 0) return;

            initialHtml += `<h4 class="text-lg font-bold uppercase mb-4 mt-6">SECTION ${catIndex + 3}: ${cat.name.toUpperCase()}</h4>`;

            catTerms.forEach((term, termIndex) => {
                const titlePrefix = `${catIndex + 3}.${termIndex + 1} ${term.title}: `;

                let description = term.description;
                if (data && data.variables) {
                    Object.keys(data.variables).forEach(key => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        description = description.replace(regex, data.variables[key] || `{{${key}}}`);
                    });
                }

                initialHtml += `
                    <div class="mb-3 pl-2 text-justify leading-relaxed">
                        <p><strong>${titlePrefix}</strong> <span style="font-weight: normal">${description}</span></p>
                    </div>
                `;
            });
        });

        setTermsHtml(initialHtml);

    }, [categories, terms, termsHtml, data]);

    // Initial Pagination
    useEffect(() => {
        if (termsHtml && paginatedTerms.length === 0) {
            const pages = paginateContent(termsHtml);
            setPaginatedTerms(pages);
        }
    }, [termsHtml]);


    // Calculate total pages
    const termsPageCount = paginatedTerms.length > 0 ? paginatedTerms.length : 1;
    const totalPages = 2 + termsPageCount + extraPages.length;

    const handlePrint = () => {
        window.print();
    };

    const toggleEditMode = () => {
        if (!isEditable) {
            // Entering Edit Mode
            // We need to ensure termsHtml is up to date. 
            // If we were just viewing, termsHtml is already the source of truth.
            // But we also need to save Page 1 & 2 current state.
            const current = saveCurrentContent();
            setSavedContent(prev => ({ ...prev, ...current }));
        } else {
            // Exiting Edit Mode
            // termsHtml is already updated via onChange.
            // We need to re-paginate (handled by useEffect).
        }
        setIsEditable(!isEditable);
    };

    // Save current DOM content (Only for Page 1 & 2 now, as Terms are in termsHtml)
    const saveCurrentContent = () => {
        const newSavedContent = { ...savedContent };
        for (let i = 1; i <= 2; i++) {
            const el = document.getElementById(`page-content-${i}`);
            if (el) newSavedContent[i] = el.innerHTML;
        }
        return newSavedContent;
    };

    const handleContentChange = (pageNum, content) => {
        // If it's Page 1 or 2, update savedContent
        if (pageNum <= 2) {
            setSavedContent(prev => ({
                ...prev,
                [pageNum]: content
            }));
        } else {
            // If it's the Terms Editor (we'll pass a special ID or just handle it)
            // Actually, for the single editor, we'll pass a specific handler.
        }
    };

    const handleTermsChange = (content) => {
        setTermsHtml(content);
    };

    const handleAddPage = () => {
        setExtraPages([...extraPages, { id: Date.now() }]);
    };

    const handleSaveClick = () => {
        setSaveName("");
        setIsSaveModalOpen(true);
    };

    const confirmSave = async (e) => {
        e.preventDefault();
        if (!saveName.trim()) return;

        // Prepare pages for saving
        const currentPages = { ...savedContent };

        // Update Page 1 & 2 from DOM if not in edit mode
        if (!isEditable) {
            for (let i = 1; i <= 2; i++) {
                const el = document.getElementById(`page-content-${i}`);
                if (el) currentPages[i] = el.innerHTML;
            }
        }

        // Use current paginated terms (preserving any manual edits)
        paginatedTerms.forEach((html, idx) => {
            currentPages[3 + idx] = html;
        });

        try {
            const payload = {
                tenderId: id,
                name: saveName,
                pages: currentPages,
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
        /* ... (Styles remain same) ... */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        .doc-font { font-family: 'Montserrat', sans-serif; }
        .a4-page { background-color: white; width: 210mm; height: 297mm; padding: 10mm; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); box-sizing: border-box; position: relative; margin: 0 auto; }
        .border-outer { border: 1px solid #006400; height: 100%; padding: 1px; box-sizing: border-box; }
        .border-middle { border: 3px solid #006400; height: 100%; padding: 1px; box-sizing: border-box; }
        .border-inner { border: 1px solid #006400; height: 100%; padding: 32px; box-sizing: border-box; position: relative; display: flex; flex-direction: column; }
        .page-content { flex-grow: 1; }
        .page-footer { position: absolute; bottom: 15px; right: 32px; text-align: right; font-size: 10pt; font-weight: 600; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
        .summary-table th, .summary-table td { border: 1px solid black; padding: 8px 12px; vertical-align: top; font-size: 10pt; }
        .summary-table th { background-color: #f0f0f0; font-weight: 700; text-align: left; }
        @media print {
          @page { size: A4; margin: 0; }
          body { background-color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .a4-page { box-shadow: none; margin: 0 auto; width: 210mm; height: 297mm; page-break-after: always; padding: 10mm; overflow: hidden; }
        }
        ${isEditable ? `.a4-page { outline: 2px dashed #3b82f6; outline-offset: 4px; }` : ''}
      `}</style>

            {/* Toolbar */}
            <div className="no-print flex gap-4 sticky top-4 z-50 bg-white/80 backdrop-blur p-2 rounded-lg shadow-sm border border-gray-200">
                <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors font-sans">
                    <Printer size={20} /> Print / Save as PDF
                </button>
                <button onClick={handleSaveClick} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors font-sans">
                    <Save size={20} /> Save Version
                </button>
                <button onClick={toggleEditMode} className={`flex items-center gap-2 px-4 py-2 rounded shadow transition-colors font-sans ${isEditable ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                    {isEditable ? <Check size={20} /> : <Edit size={20} />}
                    {isEditable ? 'Finish Editing' : 'Edit Document'}
                </button>
            </div>

            {/* Save Modal (Same as before) */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Save className="w-5 h-5 text-indigo-600" /> Save Document Version</h3>
                        <form onSubmit={confirmSave}>
                            <input type="text" autoFocus value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Version Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6" required />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save Version</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- PAGE 1 & 2 (Separate Editors) --- */}
            {[1, 2].map(pageNum => (
                <div key={pageNum} className="doc-font text-black leading-snug">
                    <PageLayout
                        pageNumber={pageNum}
                        totalPages={totalPages}
                        contentId={`page-content-${pageNum}`}
                        savedHtml={savedContent[pageNum]}
                        isEditable={isEditable}
                        onContentChange={handleContentChange}
                    >
                        {/* Initial Content for Page 1 & 2 (Only rendered if savedHtml is empty) */}
                        {pageNum === 1 && (
                            <div className="h-full flex flex-col pt-16 text-center">
                                <h2 className="text-xl font-bold">Himachal Pradesh University,</h2>
                                <h3 className="text-lg font-bold">(NAAC Accredited ‘A’ Grade University)</h3>
                                <h3 className="text-lg font-bold">“{data.name_of_department}”</h3>
                                <div className="my-8 flex justify-center"><img src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg" alt="HPU Logo" className="h-40 w-auto object-contain" /></div>
                                <h1 className="text-2xl font-bold my-6 px-8">Bid Document for<br /><span className="text-xl font-normal block mt-2">{data.procurement_title}</span><br />for<br /><span className="text-xl font-normal block mt-2">{data.name_of_department}</span></h1>
                                <div className="mt-8 text-lg"><p className="mb-2"><strong>Website:</strong> <a href="https://www.hpuniv.ac.in" className="text-blue-800 underline">https://www.hpuniv.ac.in</a></p><p><strong>E-mail:</strong> {data.email_of_department}</p></div>
                            </div>
                        )}
                        {pageNum === 2 && (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold uppercase underline mb-4 text-center">SUMMARY</h3>
                                    <table className="summary-table">
                                        <thead><tr><th style={{ width: '10%' }}>Sr. No.</th><th style={{ width: '30%' }}>Description</th><th style={{ width: '60%' }}>Details</th></tr></thead>
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
                                                <tr key={index}><td>{index + 1}.</td><td>{item.label}</td><td>{item.value}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p className="font-bold text-sm mt-4 border p-2 bg-gray-50">Note: The terms and conditions specified in this tender document shall prevail over the terms and conditions available on the GeM portal in case of any conflict.</p>
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold uppercase underline mb-4 text-center">SECTION 1: INSTRUCTIONS FOR BIDDERS</h3>
                                    <div className="text-justify text-md space-y-4 px-2">
                                        <p><strong>1.1 Bid Submission:</strong> Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids, including technical and financial components, must be submitted exclusively online through the GeM portal (gem.gov.in) before the specified deadline. Physical or offline bids will not be accepted.</p>
                                        <p><strong>1.2 Governing Terms:</strong> This bid process will be governed by the General Terms and Conditions (GTC) of GeM in addition to the Additional Terms and Conditions (ATC) specified in this document. In case of any conflict, the terms specified in this document will prevail.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </PageLayout>
                </div>
            ))}

            {/* --- TERMS SECTION (Single Editor vs Paginated Preview) --- */}
            {/* --- TERMS SECTION (Paginated Pages) --- */}
            {paginatedTerms.map((pageContent, index) => {
                const pageNum = 3 + index;
                return (
                    <div key={`terms-page-${index}`} className="doc-font text-black leading-snug">
                        <PageLayout
                            pageNumber={pageNum}
                            totalPages={totalPages}
                            contentId={`page-content-${pageNum}`}
                            savedHtml={pageContent}
                            isEditable={isEditable}
                            onContentChange={(pNum, content) => {
                                // Update the specific page in paginatedTerms
                                const newTerms = [...paginatedTerms];
                                newTerms[index] = content;
                                setPaginatedTerms(newTerms);

                                // Also update the main termsHtml to keep it somewhat in sync (optional but good for safety)
                                // setTermsHtml(newTerms.join('')); 
                            }}
                        >
                            {/* Fallback if savedHtml is somehow empty */}
                        </PageLayout>
                    </div>
                );
            })}

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
                            isEditable={isEditable}
                            onContentChange={handleContentChange}
                        >
                            <div className="h-full p-4">
                                <h3 className="text-lg font-bold mb-4">New Page {pageNum}</h3>
                                <p>Start typing your content here...</p>
                            </div>
                        </PageLayout>
                    </div>
                );
            })}

            {/* Add Page Button - Only visible in Edit Mode */}
            {isEditable && (
                <div className="no-print w-full flex justify-center pb-12">
                    <button type="button" onClick={handleAddPage} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 font-sans text-lg">
                        <Plus size={24} /> Add New Page
                    </button>
                </div>
            )}

        </div>
    );
};

export default TenderPreview;
