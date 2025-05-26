"use client";

import React, { useState } from "react";
import { UploadIcon, DownloadIcon, CheckIcon, DocumentIcon } from "./icons";

export default function PDFConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setConverted(false);
    setDownloadUrl(null);
  };

  const handleConvert = () => {
    if (!file) return;

    setConverting(true);
    // Simulate conversion process
    setTimeout(() => {
      setConverting(false);
      setConverted(true);

      // Create a dummy PDF blob for download
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Converted: ${file.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000208 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
304
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    }, 3000);
  };

  const handleDownload = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.split('.')[0]}_converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <UploadIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold ml-3 text-slate-800">Upload Document</h3>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".doc,.docx,.txt,.jpg,.png"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <UploadIcon className="w-6 h-6" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-2">Drop files here or click to browse</p>
            <p className="text-slate-500 text-sm">Supports: DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
          </label>

          {file && (
            <div className="mt-6 p-4 bg-white rounded-xl shadow-md border border-slate-200">
              <div className="flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Convert Section */}
      {file && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <DocumentIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold ml-3 text-slate-800">Convert to PDF</h3>
          </div>

          {!converted ? (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl font-bold transform hover:scale-105"
            >
              {converting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Converting...
                </>
              ) : (
                <>
                  <DocumentIcon className="w-5 h-5 mr-3" />
                  Convert to PDF
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-green-600 mb-4">Conversion Complete!</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}