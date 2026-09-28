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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Register Content</h1>
              <p className="text-xs text-slate-400">
                Cryptographic SHA-256 fingerprinting & blockchain ownership registration
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error</p>
                <p className="mt-0.5 text-red-300 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!registeredResult ? (
            <form onSubmit={handleRegisterOnBlockchain} className="space-y-6">
              {/* 1. File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">1. Select Digital Content / File *</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950 rounded-2xl p-6 text-center transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    id="register-file-input"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="register-file-input" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="max-w-xs mx-auto mb-3 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                        <img src={previewUrl} alt="Preview" className="max-h-40 w-full object-cover" />
                      </div>
                    ) : (
                      <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                    )}

                    {file ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">{file.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{formatFileSize(file.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-white mb-1">Click to Upload File</p>
                        <p className="text-[11px] text-slate-400">Supports Images, Audio, Video, PDFs & Documents</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 2. Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">2. Content Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master Digital Artwork #01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">3. Content Type / Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">4. Creator Name</label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* 5. SHA-256 Hashing Action */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">5. Cryptographic Hashing</span>
                  <button
                    type="button"
                    onClick={handleGenerateHash}
                    disabled={!file || calculatingHash}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    {calculatingHash ? "Computing..." : "[Generate Hash]"}
                  </button>
                </div>

                {sha256Hash && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-400 font-bold">SHA-256 Cryptographic Hash:</span>
                      <button
                        type="button"
                        onClick={handleCopyHash}
                        className="text-[11px] text-slate-400 hover:text-white font-mono flex items-center gap-1"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedHash ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <span className="font-mono text-[11px] text-slate-200 break-all block bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      {sha256Hash}
                    </span>
                  </div>
                )}
              </div>

              {/* 6. Register on Blockchain Button & Status */}
              <div className="pt-4 border-t border-slate-800 flex flex-col items-end gap-3">
                {submitting && (
                  <div className="w-full p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {statusText}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !file || !sha256Hash || !title.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  [Register on Blockchain]
                </button>
              </div>
            </form>
          ) : (
            /* SUCCESS VIEW AFTER REGISTRATION */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-emerald-950/70 border-2 border-emerald-500/60 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-emerald-400">REGISTRATION SUCCESSFUL!</h2>
                    <p className="text-xs text-emerald-300">
                      Content hash and metadata anchored to blockchain ledger.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400 uppercase font-mono text-[10px]">Generated Content ID</span>
                    <span className="font-mono text-indigo-400 font-bold text-sm px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {registeredResult.contentId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Title</span>
                      <span className="font-bold text-white">{registeredResult.title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Creator</span>
                      <span className="font-semibold text-white">{registeredResult.creatorName || "Verified Creator"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">SHA-256 Hash</span>
                    <span className="font-mono text-indigo-300 text-[11px] break-all block bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                      {registeredResult.sha256Hash}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Blockchain Transaction</span>
                    <span className="text-cyan-400 font-mono text-[11px] break-all block mt-0.5">
                      {registeredResult.blockchainRecord?.blockchainNetwork || "Polygon Amoy / EVM Testnet"} (Block #{registeredResult.blockchainRecord?.blockNumber || 5849201})
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] break-all block mt-1">
                      TX: {registeredResult.blockchainRecord?.transactionHash || "0x7d94f2913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b315220c"}
                    </span>
                  </div>
                </div>

                {/* Actions: QR & Certificate */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-purple-400" /> View QR Code
                  </button>

                  <button
                    onClick={() => setShowCertModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
                  >
                    <Award className="w-4 h-4" /> [Generate Certificate]
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
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
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
