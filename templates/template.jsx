import React from "react";
import { Printer } from "lucide-react";

// Reusable Layout Component for the Triple Border & Pagination
const PageLayout = ({ children, pageNumber, totalPages }) => (
  <div className="a4-page">
    {/* 1. Outer Line (1px) */}
    <div className="border-outer">
      {/* 2. Middle Line (3px) */}
      <div className="border-middle">
        {/* 3. Inner Line (1px) + Content Padding */}
        <div className="border-inner">
          {/* Page Content */}
          <div className="page-content">{children}</div>

          {/* Pagination Footer */}
          <div className="page-footer">
            Page {pageNumber} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TenderDocument = ({ data }) => {
  // Default data structure if not provided (for preview/fallback)
  const tenderData = data || {
    name_of_department: "{{name_of_department}}",
    email_of_department: "{{email_of_department}}",
    procurement_title: "{{procurement_title}}",
    tender_title: "{{tender_title}}",
    quantity: "{{quantity}}",
    emd_value: "{{get value from the form}}",
    pbg_value: "{{get value from the form}}",
    emd_officer: "{{EMD_officer}}",
    bid_validity: "{{bid_validity}}",
  };

  const totalPages = 3;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8 font-serif print:bg-white print:p-0 print:gap-0">
      {typeof window !== "undefined" && (
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
          }
          .no-print {
            display: none !important;
          }
          .a4-page {
            box-shadow: none;
            margin: 0;
            width: 100%;
            height: 297mm;
            page-break-after: always;
            padding: 10mm; 
          }
          .flex-col {
            gap: 0 !important;
          }
        }
      `}</style>
      )}

      {/* Toolbar */}
      <div className="no-print flex gap-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors font-sans"
        >
          <Printer size={20} />
          Print / Save as PDF
        </button>
      </div>

      {/* --- PAGE 1: Header & Title Info --- */}
      <div className="doc-font text-black leading-snug">
        <PageLayout pageNumber={1} totalPages={totalPages}>
          <div className="h-full flex flex-col justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold">
                Himachal Pradesh University,
              </h2>
              <h3 className="text-lg font-bold">
                (NAAC Accredited ‘A’ Grade University)
              </h3>
              <h3 className="text-lg font-bold">“{tenderData.name_of_department}”</h3>

              <div className="my-12 flex justify-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg"
                  alt="HPU Logo"
                  className="h-48 w-auto object-contain"
                />
              </div>

              <h1 className="text-2xl font-bold mt-8 mb-8 px-8">
                Bid Document for
                <br />
                <span className="text-xl font-normal block mt-2">
                  {tenderData.procurement_title}
                </span>
                <br />
                for
                <br />
                <span className="text-xl font-normal block mt-2">
                  {tenderData.name_of_department}
                </span>
              </h1>

              <div className="mt-12 text-lg">
                <p className="mb-2">
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://www.hpuniv.ac.in"
                    className="text-blue-800 underline"
                  >
                    https://www.hpuniv.ac.in
                  </a>
                </p>
                <p>
                  <strong>E-mail:</strong> {tenderData.email_of_department}
                </p>
              </div>
            </div>
          </div>
        </PageLayout>
      </div>

      {/* --- PAGE 2: Summary & Instructions Part 1 --- */}
      <div className="doc-font text-black leading-snug">
        <PageLayout pageNumber={2} totalPages={totalPages}>
          {/* SUMMARY Section */}
          <div className="mb-4">
            <h3 className="text-lg font-bold uppercase underline mb-4 text-center">
              SUMMARY
            </h3>

            <table className="summary-table">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Sr. No.</th>
                  <th style={{ width: "30%" }}>Description</th>
                  <th style={{ width: "60%" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.</td>
                  <td>Item Description</td>
                  <td>{tenderData.tender_title}</td>
                </tr>
                <tr>
                  <td>2.</td>
                  <td>Quantity</td>
                  <td>{tenderData.quantity}</td>
                </tr>
                <tr>
                  <td>3.</td>
                  <td>Department</td>
                  <td>{tenderData.name_of_department}</td>
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
                  <td>{tenderData.emd_value}</td>
                </tr>
                <tr>
                  <td>8.</td>
                  <td>Performance Security</td>
                  <td>{tenderData.pbg_value}</td>
                </tr>
                <tr>
                  <td>9.</td>
                  <td>Pledge of EMD / PBG</td>
                  <td>
                    EMD and Performance Bank Guarantee (PBG) must be pledged
                    only in the name of: <strong>{tenderData.emd_officer}</strong>
                  </td>
                </tr>
                <tr>
                  <td>10.</td>
                  <td>Bid Validity</td>
                  <td>
                    {tenderData.bid_validity} days from the date of publication of
                    bid.
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="font-bold text-sm mt-4 border p-2 bg-gray-50">
              Note: The terms and conditions specified in this tender document
              shall prevail over the terms and conditions available on the GeM
              portal in case of any conflict.
            </p>
          </div>

          {/* SECTION I Part 1 */}
          <div className="mt-8">
            <h3 className="text-lg font-bold uppercase underline mb-4 text-center">
              SECTION I: INSTRUCTIONS FOR BIDDERS
            </h3>

            <div className="text-justify text-md space-y-4 px-2">
              <p>
                <strong>Bid Submission:</strong> Bidders must be registered on
                the Government e-Marketplace (GeM) portal. All bids, including
                technical and financial components, must be submitted
                exclusively online through the GeM portal (gem.gov.in) before
                the specified deadline. Physical or offline bids will not be
                accepted.
              </p>

              <p>
                <strong>Governing Terms:</strong> This bid process will be
                governed by the General Terms and Conditions (GTC) of GeM in
                addition to the Additional Terms and Conditions (ATC) specified
                in this document. In case of any conflict, the terms specified
                in this document will prevail.
              </p>
            </div>
          </div>
        </PageLayout>
      </div>

      {/* --- PAGE 3: Instructions Part 2 (Text continued naturally) --- */}
      <div className="doc-font text-black leading-snug">
        <PageLayout pageNumber={3} totalPages={totalPages}>
          <div className="mt-4">
            <div className="text-justify text-md space-y-4 px-2">
              <p>
                <strong>Digital Signature:</strong> Bids must be digitally
                signed by an authorized representative of the bidding firm using
                a valid Class-II or Class-III Digital Signature Certificate
                (DSC).
              </p>

              <p>
                <strong>Documentation:</strong> Bidders are required to upload
                scanned copies of all necessary documents as specified in this
                bid document. All uploaded documents must be clear, legible, and
                duly signed and stamped by the authorized signatory.
              </p>
            </div>
          </div>
        </PageLayout>
      </div>
    </div>
  );
};

export default TenderDocument;
