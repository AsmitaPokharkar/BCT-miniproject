"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { calculateSHA256 } from "@/lib/hash";

interface ContentRecord {
  id: string;
  contentId: string;
  title: string;
  category: string;
  creatorName?: string | null;
  fileName: string;
  fileSize: number;
  sha256Hash: string;
  createdAt: string;
  owner?: {
    name: string;
  };
  blockchainRecord?: {
    transactionHash: string;
    blockchainNetwork: string;
    blockNumber: number;
    status: string;
  } | null;
}

export default function PublicVerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [contentIdInput, setContentIdInput] = useState("");
  const [currentFileHash, setCurrentFileHash] = useState("");
  const [calculatingHash, setCalculatingHash] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: "SUCCESS" | "FAILURE" | "NOT_FOUND";
    content?: ContentRecord | null;
    computedHash?: string;
    originalHash?: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
    setVerificationResult(null);
    setCalculatingHash(true);

    try {
      const hash = await calculateSHA256(selectedFile);
      setCurrentFileHash(hash);
    } catch {
      setError("Failed to compute Web Crypto SHA-256 hash.");
    } finally {
      setCalculatingHash(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !contentIdInput.trim()) {
      setError("Please enter a Content ID or upload a file to verify.");
      return;
    }

    setVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      let hashToVerify = currentFileHash;
      if (file && !hashToVerify) {
        hashToVerify = await calculateSHA256(file);
        setCurrentFileHash(hashToVerify);
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sha256Hash: hashToVerify,
          contentId: contentIdInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification request failed.");
      }

      if (!data.content) {
        setVerificationResult({
          status: "NOT_FOUND",
          computedHash: hashToVerify,
        });
      } else if (data.status === "VERIFIED_AUTHENTIC") {
        setVerificationResult({
          status: "SUCCESS",
          content: data.content,
          computedHash: hashToVerify || data.content.sha256Hash,
          originalHash: data.content.sha256Hash,
        });
      } else {
        setVerificationResult({
          status: "FAILURE",
          content: data.content,
          computedHash: hashToVerify,
          originalHash: data.content.sha256Hash,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Public Verification Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Content Authenticity Verification</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Compare file cryptographic hash against the blockchain record to detect tampering or unauthorized modification.
          </p>
        </div>

        {/* Verification Form Card */}
        <form onSubmit={handleVerify} className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input 1: Content ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">Option A: Enter Content ID</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={contentIdInput}
                  onChange={(e) => setContentIdInput(e.target.value)}
                  placeholder="e.g. CP-ART-2026-7F29A1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Input 2: Upload File */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">Option B: Upload Content / File</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950 rounded-xl p-4 text-center cursor-pointer relative">
                <input
                  type="file"
                  id="verify-file-input"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="verify-file-input" className="cursor-pointer block">
                  <Upload className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  {file ? (
                    <span className="text-xs font-bold text-white block truncate">{file.name}</span>
                  ) : (
                    <span className="text-xs text-slate-400 block">Click to select original or modified file</span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Current Computed Hash Display */}
          {(calculatingHash || currentFileHash) && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Computed Current File SHA-256 Hash:</span>
              {calculatingHash ? (
                <span className="text-xs font-mono text-indigo-400 animate-pulse">Calculating Web Crypto SHA-256...</span>
              ) : (
                <span className="text-xs font-mono text-indigo-300 break-all">{currentFileHash}</span>
              )}
            </div>
          )}

          {/* Verify Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={verifying || calculatingHash || (!file && !contentIdInput.trim())}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Hash...
                </>
              ) : (
                "[Verify]"
              )}
            </button>
          </div>
        </form>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* VERIFICATION RESULTS DISPLAY */}
        {verificationResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* SUCCESS BANNER */}
            {verificationResult.status === "SUCCESS" && (
              <div className="p-6 rounded-3xl bg-emerald-950/70 border-2 border-emerald-500/60 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-emerald-400">✅ VERIFIED AUTHENTIC</h2>
                    <p className="text-xs text-emerald-300">
                      Hash matches blockchain record. File is 100% authentic and untampered.
                    </p>
                  </div>
                </div>

                {verificationResult.content && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">CONTENT ID</span>
                        <span className="font-mono text-indigo-400 font-bold text-sm">{verificationResult.content.contentId}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                        {verificationResult.content.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Title</span>
                        <span className="font-bold text-white">{verificationResult.content.title}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Creator</span>
                        <span className="font-semibold text-white">{verificationResult.content.creatorName || verificationResult.content.owner?.name || "Verified Creator"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Registration Date</span>
                        <span className="font-mono">{new Date(verificationResult.content.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Blockchain Status</span>
                        <span className="font-mono text-emerald-400 font-bold">{verificationResult.content.blockchainRecord?.status || "CONFIRMED"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">SHA-256 Hash</span>
                      <span className="font-mono text-indigo-300 text-[11px] break-all block bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                        {verificationResult.content.sha256Hash}
                      </span>
                    </div>

                    {verificationResult.content.blockchainRecord?.transactionHash && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Transaction Hash</span>
                        <span className="font-mono text-cyan-400 text-[10px] break-all block">
                          {verificationResult.content.blockchainRecord.transactionHash}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/verify/${verificationResult.content.contentId}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        View Full Certificate & QR <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FAILURE / TAMPERED BANNER */}
            {verificationResult.status === "FAILURE" && (
              <div className="p-6 rounded-3xl bg-red-950/70 border-2 border-red-500/60 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-red-400">❌ VERIFICATION FAILED</h2>
                    <p className="text-xs text-red-300">
                      Content may have been modified. Current hash does not match the registered blockchain hash!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  {verificationResult.content && (
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-white font-bold">{verificationResult.content.title}</span>
                      <span className="font-mono text-indigo-400 text-xs font-semibold">{verificationResult.content.contentId}</span>
                    </div>
                  )}

                  <div className="space-y-2 font-mono">
                    <div>
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">Original Blockchain Registered Hash:</span>
                      <span className="text-emerald-300 text-[11px] break-all block bg-slate-900 p-2 rounded border border-emerald-500/30">
                        {verificationResult.originalHash}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-red-400 uppercase font-bold block">Current Uploaded File Hash:</span>
                      <span className="text-red-300 text-[11px] break-all block bg-slate-900 p-2 rounded border border-red-500/30">
                        {verificationResult.computedHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOT FOUND BANNER */}
            {verificationResult.status === "NOT_FOUND" && (
              <div className="p-6 rounded-3xl bg-amber-950/70 border-2 border-amber-500/60 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-amber-400">⚠️ NO REGISTRATION RECORD FOUND</h2>
                    <p className="text-xs text-amber-300">
                      No registered content matches this Content ID or cryptographic hash in the ledger.
                    </p>
                  </div>
                </div>

                {verificationResult.computedHash && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Computed File Hash:</span>
                    <span className="text-indigo-300 font-mono text-[11px] break-all">{verificationResult.computedHash}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
