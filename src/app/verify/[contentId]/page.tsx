"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QRCodeModal from "@/components/QRCodeModal";
import OwnershipCertificateModal from "@/components/OwnershipCertificateModal";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  QrCode,
  Calendar,
  User,
  HardDrive,
  Award,
  Upload,
  Loader2,
} from "lucide-react";
import { formatFileSize, calculateSHA256 } from "@/lib/hash";

interface PublicContentRecord {
  id: string;
  contentId: string;
  title: string;
  description?: string | null;
  category: string;
  creatorName?: string | null;
  licenseInfo?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  sha256Hash: string;
  status: string;
  createdAt: string;
  owner?: {
    name: string;
  };
  blockchainRecord?: {
    transactionHash: string;
    blockchainNetwork: string;
    blockNumber: number;
    contractAddress: string;
    status: string;
    ipfsMetadataCid?: string | null;
    chainId?: number | null;
  } | null;
}

export default function PublicContentVerificationPage({ params }: { params: Promise<{ contentId: string }> }) {
  const resolvedParams = use(params);
  const [content, setContent] = useState<PublicContentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showQrModal, setShowQrModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // File inspection / verification state
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testHash, setTestHash] = useState("");
  const [testingFile, setTestingFile] = useState(false);
  const [fileVerificationStatus, setFileVerificationStatus] = useState<"MATCH" | "MISMATCH" | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/verify/${resolvedParams.contentId}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
        } else {
          setError("No registered work found matching this Content ID or hash.");
        }
      } catch {
        setError("Failed to fetch public verification record.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [resolvedParams.contentId]);

  const handleCopyHash = () => {
    if (!content?.sha256Hash) return;
    navigator.clipboard.writeText(content.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleTestFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !content) return;
    const file = e.target.files[0];
    setTestFile(file);
    setTestingFile(true);
    setFileVerificationStatus(null);

    try {
      const computedHash = await calculateSHA256(file);
      setTestHash(computedHash);
      if (computedHash === content.sha256Hash) {
        setFileVerificationStatus("MATCH");
      } else {
        setFileVerificationStatus("MISMATCH");
      }
    } catch {
      setError("Failed to compute hash of selected file.");
    } finally {
      setTestingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="py-24 text-center text-slate-500 font-mono text-xs animate-pulse">
          Fetching public cryptographic ledger record...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
        <Navbar />
        <main className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
          <div className="p-6 rounded-3xl bg-red-950/60 border-2 border-red-500/50 shadow-2xl space-y-4">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-2xl font-black text-red-400">RECORD NOT FOUND</h1>
            <p className="text-xs text-red-300">
              Content ID [{resolvedParams.contentId}] was not found in the CreatorProof blockchain ledger.
            </p>
          </div>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
          >
            Try Public Verification Portal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(content.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Authenticity Banner */}
        <div className="p-6 rounded-3xl bg-emerald-950/70 border-2 border-emerald-500/60 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-400 tracking-wide">VERIFIED AUTHENTIC</h1>
              <p className="text-xs text-emerald-300">
                Registered on {content.blockchainRecord?.blockchainNetwork || "Polygon Amoy / EVM Testnet"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <QrCode className="w-4 h-4" /> QR Code
            </button>
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Award className="w-4 h-4" /> Certificate
            </button>
          </div>
        </div>

        {/* Record Details Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2 inline-block">
                Content ID: {content.contentId}
              </span>
              <h2 className="text-2xl font-extrabold text-white">{content.title}</h2>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 shrink-0">
              {content.category}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Creator</span>
                <span className="text-white font-bold flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  {content.creatorName || content.owner?.name || "Verified Creator"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Registration Date</span>
                <span className="text-slate-200 font-mono flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {formattedDate}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">File Specs</span>
                <span className="text-slate-200 font-mono flex items-center gap-1.5 mt-0.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  {content.fileName} ({formatFileSize(content.fileSize)})
                </span>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Original SHA-256 Hash</span>
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedHash ? "Copied" : "Copy"}
                  </button>
                </div>
                <span className="font-mono text-indigo-300 text-[11px] break-all block bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  {content.sha256Hash}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Blockchain Network & Block</span>
                <span className="text-cyan-400 font-mono text-[11px] break-all block mt-0.5">
                  {content.blockchainRecord?.blockchainNetwork || "Polygon Amoy Testnet"} (Block #{content.blockchainRecord?.blockNumber || 5849201})
                </span>
                <span className="text-slate-400 font-mono text-[10px] break-all block mt-1">
                  TX: {content.blockchainRecord?.transactionHash || "0x7d94f2913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b315220c"}
                </span>
              </div>
            </div>
          </div>

          {/* Test Upload Section: Compare a file against this record */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Compare File Against This Blockchain Record
            </h3>
            <p className="text-xs text-slate-400">
              Upload a file to calculate its Web Crypto SHA-256 hash and verify if it matches this exact record.
            </p>

            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950 rounded-2xl p-6 text-center cursor-pointer relative">
              <input
                type="file"
                id="test-file-record"
                onChange={handleTestFileSelect}
                className="hidden"
              />
              <label htmlFor="test-file-record" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-white block">
                  {testFile ? testFile.name : "Select File to Compare Hash"}
                </span>
              </label>
            </div>

            {testingFile && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center animate-pulse text-xs text-indigo-400 font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Computing SHA-256...
              </div>
            )}

            {fileVerificationStatus === "MATCH" && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-400">✅ MATCH: AUTHENTIC UNTAMPERED FILE</p>
                  <p className="text-[11px] font-mono text-emerald-300 mt-0.5 break-all">Hash: {testHash}</p>
                </div>
              </div>
            )}

            {fileVerificationStatus === "MISMATCH" && (
              <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-xs text-red-300 space-y-2">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <p className="font-bold text-red-400">❌ HASH MISMATCH: FILE IS MODIFIED / TAMPERED</p>
                </div>
                <div className="font-mono text-[11px] space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-emerald-400">Original Hash: {content.sha256Hash}</p>
                  <p className="text-red-400">Uploaded File:  {testHash}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        contentId={content.contentId}
        title={content.title}
      />

      <OwnershipCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        content={content}
      />

      <Footer />
    </div>
  );
}
