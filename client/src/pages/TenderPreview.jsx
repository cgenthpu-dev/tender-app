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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

    // State for dynamic pages
    const [extraPages, setExtraPages] = useState([]);
    // State to preserve edits when re-rendering
    const [savedContent, setSavedContent] = useState({});

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

                // 2. If savedId exists, fetch the saved document state
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

    const staticPagesCount = 3;
    const totalPages = staticPagesCount + extraPages.length;

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

        // Save static pages
        for (let i = 1; i <= staticPagesCount; i++) {
            const el = document.getElementById(`page-content-${i}`);
            if (el) newSavedContent[i] = el.innerHTML;
        }

        // Save extra pages
        extraPages.forEach((_, idx) => {
            const pageNum = staticPagesCount + 1 + idx;
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

    const handleSaveDocument = async () => {
        const name = prompt("Enter a name for this saved version (e.g., 'Draft 1'):");
        if (!name) return;

        const currentContent = saveCurrentContent();
        // Update state locally first
        setSavedContent(currentContent);

        try {
            const payload = {
                tenderId: id,
                name: name,
                pages: currentContent,
                extraPages: extraPages
            };

            await axios.post('http://localhost:5000/api/documents', payload);
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
          text-align: right;
          font-size: 10pt;
          font-weight: 600;
          margin-top: auto; 
          padding-top: 10px;
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
                    onClick={handleSaveDocument}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors font-sans"
                >
                    <Save size={20} />
                    Save
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
                                <tr>
                                    <td>1.</td>
                                    <td>Item Description</td>
                                    <td>{data.tender_title}</td>
                                </tr>
                                <tr>
                                    <td>2.</td>
                                    <td>Quantity</td>
                                    <td>{data.quantity}</td>
                                </tr>
                                <tr>
                                    <td>3.</td>
                                    <td>Department</td>
                                    <td>{data.name_of_department}</td>
                                </tr>
                                <tr>
                                    <td>4.</td>
                                    <td>Bid Start Date & Time</td>
                                    <td>[as mentioned in Gem Bid Document]</td>
                                </tr>
                                <tr>
                                    <td>5.</td>
                                    <td>Bid End Date & Time</td>
                                    <td>[as mentioned in Gem Bid Document]</td>
                                </tr>
                                <tr>
                                    <td>6.</td>
                                    <td>Pre-Bid Meeting</td>
                                    <td>[as mentioned in Gem Bid Document]</td>
                                </tr>
                                <tr>
                                    <td>7.</td>
                                    <td>Earnest Money Deposit (EMD)</td>
                                    <td>{data.emd_value}</td>
                                </tr>
                                <tr>
                                    <td>8.</td>
                                    <td>Performance Security</td>
                                    <td>{data.pbg_value}</td>
                                </tr>
                                <tr>
                                    <td>9.</td>
                                    <td>Pledge of EMD / PBG</td>
                                    <td>
                                        EMD and Performance Bank Guarantee (PBG) must be pledged only in the name of: <strong>{data.emd_officer}</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td>10.</td>
                                    <td>Bid Validity</td>
                                    <td>{data.bid_validity} days from the date of publication of bid.</td>
                                </tr>
                            </tbody>
                        </table>

                        <p className="font-bold text-sm mt-4 border p-2 bg-gray-50">
                            Note: The terms and conditions specified in this tender document shall prevail over the terms and conditions available on the GeM portal in case of any conflict.
                        </p>
                    </div>

                    {/* SECTION I Part 1 */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold uppercase underline mb-4 text-center">SECTION I: INSTRUCTIONS FOR BIDDERS</h3>

                        <div className="text-justify text-md space-y-4 px-2">
                            <p>
                                <strong>Bid Submission:</strong> Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids, including technical and financial components, must be submitted exclusively online through the GeM portal (gem.gov.in) before the specified deadline. Physical or offline bids will not be accepted.
                            </p>

                            <p>
                                <strong>Governing Terms:</strong> This bid process will be governed by the General Terms and Conditions (GTC) of GeM in addition to the Additional Terms and Conditions (ATC) specified in this document. In case of any conflict, the terms specified in this document will prevail.
                            </p>
                        </div>
                    </div>
                </PageLayout>
            </div>

            {/* --- PAGE 3: Instructions Part 2 (Text continued naturally) --- */}
            <div className="doc-font text-black leading-snug">
                <PageLayout
                    pageNumber={3}
                    totalPages={totalPages}
                    contentId="page-content-3"
                    savedHtml={savedContent[3]}
                >

                    <div className="mt-4">
                        <div className="text-justify text-md space-y-4 px-2">
                            <p>
                                <strong>Digital Signature:</strong> Bids must be digitally signed by an authorized representative of the bidding firm using a valid Class-II or Class-III Digital Signature Certificate (DSC).
                            </p>

                            <p>
                                <strong>Documentation:</strong> Bidders are required to upload scanned copies of all necessary documents as specified in this bid document. All uploaded documents must be clear, legible, and duly signed and stamped by the authorized signatory.
                            </p>
                        </div>
                    </div>
                </PageLayout>
            </div>

            {/* --- EXTRA PAGES --- */}
            {extraPages.map((page, index) => {
                const pageNum = staticPagesCount + 1 + index;
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
