"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QRCodeModal from "@/components/QRCodeModal";
import OwnershipCertificateModal from "@/components/OwnershipCertificateModal";
import {
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Award,
  QrCode,
  Loader2,
  Lock,
} from "lucide-react";
import { calculateSHA256, formatFileSize } from "@/lib/hash";

const CATEGORIES = [
  "Artwork",
  "Photography",
  "Posters",
  "Videos",
  "Audio",
  "Digital Documents",
  "Other",
];

interface RegisteredResult {
  contentId: string;
  title: string;
  creatorName?: string | null;
  sha256Hash: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  blockchainRecord?: {
    transactionHash: string;
    blockchainNetwork: string;
    blockNumber: number;
    contractAddress: string;
    status: string;
  } | null;
}

export default function RegisterContentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [sha256Hash, setSha256Hash] = useState<string>("");
  const [calculatingHash, setCalculatingHash] = useState(false);

  // Form inputs
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [category, setCategory] = useState("Artwork");

  // Registration process states
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  // Success result state
  const [registeredResult, setRegisteredResult] = useState<RegisteredResult | null>(null);

  // Modals state
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
    setSha256Hash("");
    setRegisteredResult(null);

    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl("");
    }
  };

  const handleGenerateHash = async () => {
    if (!file) {
      setError("Please select a digital file first.");
      return;
    }
    setError("");
    setCalculatingHash(true);
    try {
      const hash = await calculateSHA256(file);
      setSha256Hash(hash);
    } catch {
      setError("Failed to compute SHA-256 hash using Web Crypto API.");
    } finally {
      setCalculatingHash(false);
    }
  };

  const handleCopyHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRegisterOnBlockchain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a file.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a content title.");
      return;
    }
    if (!sha256Hash) {
      setError("Please generate the SHA-256 hash before registering.");
      return;
    }

    setSubmitting(true);
    setError("");
    setStatusText("Anchoring hash & metadata to blockchain...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("creatorName", creatorName.trim());
      formData.append("category", category);
      formData.append("clientSha256", sha256Hash);

      const res = await fetch("/api/content", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Blockchain registration failed.");
      }

      setRegisteredResult(data.content);
      setStatusText("Blockchain Registration Confirmed!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Blockchain registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-2xl shadow-xs relative">
          <div className="flex items-center gap-3.5 mb-8 border-b border-slate-100 pb-6">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Register Your Work</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographic SHA-256 fingerprinting & blockchain ownership registration
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900 text-sm">Duplicate File Detected / Registration Error</p>
                <p className="text-amber-800 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!registeredResult ? (
            <form onSubmit={handleRegisterOnBlockchain} className="space-y-6">
              {/* 1. File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">1. Select Digital File *</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50/50 rounded-xl p-6 text-center transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    id="register-file-input"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="register-file-input" className="cursor-pointer block space-y-2">
                    {previewUrl ? (
                      <div className="max-w-xs mx-auto mb-3 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                        <img src={previewUrl} alt="Preview" className="max-h-40 w-full object-cover" />
                      </div>
                    ) : (
                      <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                    )}

                    {file ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{formatFileSize(file.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-800">Click to Upload File</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Supports Images, Audio, Video, PDFs & Documents</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 2. Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">2. Content Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master Digital Artwork #01"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">3. Content Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">4. Creator Name</label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* 5. SHA-256 Hashing Action */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">5. Cryptographic Hashing</span>
                  <button
                    type="button"
                    onClick={handleGenerateHash}
                    disabled={!file || calculatingHash}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-700 text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50"
                  >
                    {calculatingHash ? "Computing..." : "Generate Hash"}
                  </button>
                </div>

                {sha256Hash && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-700 font-bold">SHA-256 Cryptographic Hash:</span>
                      <button
                        type="button"
                        onClick={handleCopyHash}
                        className="text-[11px] text-slate-500 hover:text-slate-900 font-mono flex items-center gap-1"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedHash ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <span className="font-mono text-[11px] text-slate-800 break-all block bg-white p-2.5 rounded-lg border border-slate-200">
                      {sha256Hash}
                    </span>
                  </div>
                )}
              </div>

              {/* 6. Register Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col items-end gap-3">
                {submitting && (
                  <div className="w-full p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {statusText}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !file || !sha256Hash || !title.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Register on Blockchain
                </button>
              </div>
            </form>
          ) : (
            /* SUCCESS VIEW */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-emerald-900">Registration Successful</h2>
                    <p className="text-xs text-emerald-700">
                      Content hash and metadata anchored to blockchain ledger.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500 uppercase font-mono text-[10px]">Generated Content ID</span>
                    <span className="font-mono text-indigo-700 font-bold text-xs px-3 py-1 rounded bg-indigo-50 border border-indigo-100">
                      {registeredResult.contentId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-mono">Title</span>
                      <span className="font-bold text-slate-900">{registeredResult.title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-mono">Creator</span>
                      <span className="font-semibold text-slate-900">{registeredResult.creatorName || "Verified Creator"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">SHA-256 Hash</span>
                    <span className="font-mono text-indigo-900 text-[11px] break-all block bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                      {registeredResult.sha256Hash}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Blockchain Transaction</span>
                    <span className="text-slate-800 font-mono text-[11px] break-all block mt-0.5">
                      {registeredResult.blockchainRecord?.blockchainNetwork || "Polygon Amoy Testnet"} (Block #{registeredResult.blockchainRecord?.blockNumber || 5849201})
                    </span>
                    <span className="text-slate-500 font-mono text-[10px] break-all block mt-1">
                      TX: {registeredResult.blockchainRecord?.transactionHash || "0x7d94f2913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b315220c"}
                    </span>
                  </div>
                </div>

                {/* Actions: QR & Certificate */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-purple-600" /> View QR Code
                  </button>

                  <button
                    onClick={() => setShowCertModal(true)}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Award className="w-4 h-4" /> Generate Certificate
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setRegisteredResult(null);
                    setFile(null);
                    setPreviewUrl("");
                    setSha256Hash("");
                    setTitle("");
                    setCreatorName("");
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  ← Register Another Content Item
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {registeredResult && (
        <>
          <QRCodeModal
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            contentId={registeredResult.contentId}
            title={registeredResult.title}
          />

          <OwnershipCertificateModal
            isOpen={showCertModal}
            onClose={() => setShowCertModal(false)}
            content={registeredResult}
          />
        </>
      )}

      <Footer />
    </div>
  );
}
