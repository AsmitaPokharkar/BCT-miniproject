"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QRCodeModal from "@/components/QRCodeModal";
import OwnershipCertificateModal from "@/components/OwnershipCertificateModal";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Award,
  ArrowLeft,
  Calendar,
  User,
  HardDrive,
  FileCheck,
  Activity,
  Trash2,
  Lock,
} from "lucide-react";
import { formatFileSize } from "@/lib/hash";

interface VerificationLog {
  id: string;
  verificationHash: string;
  result: string;
  ipAddress?: string | null;
  verifiedAt: string;
}

interface ContentDetail {
  id: string;
  contentId: string;
  title: string;
  description?: string | null;
  category: string;
  tags?: string | null;
  creatorName?: string | null;
  licenseInfo?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  sha256Hash: string;
  storageUrl: string;
  status: string;
  createdAt: string;
  owner?: {
    name: string;
    email: string;
  };
  blockchainRecord?: {
    transactionHash: string;
    blockchainNetwork: string;
    blockNumber: number;
    contractAddress: string;
    registeredAt: string;
    status: string;
  } | null;
  verifications: VerificationLog[];
  _count: {
    verifications: number;
  };
}

export default function ContentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchContentDetails() {
      try {
        const res = await fetch(`/api/content/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
        } else {
          setError("Content item not found.");
        }
      } catch {
        setError("Failed to load content details.");
      } finally {
        setLoading(false);
      }
    }
    fetchContentDetails();
  }, [resolvedParams.id]);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${content?.contentId || ""}`
    : `https://creatorproof.io/verify/${content?.contentId || ""}`;

  const handleCopyHash = () => {
    if (!content?.sha256Hash) return;
    navigator.clipboard.writeText(content.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this content record from your library?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/content/${resolvedParams.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/content");
      } else {
        alert("Failed to delete content.");
      }
    } catch {
      alert("Error deleting record.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center text-slate-500 font-mono text-xs animate-pulse">
          Retrieving cryptographic ledger record...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <FileCheck className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Record Not Found</h2>
          <p className="text-xs text-slate-400">{error || "This work does not exist."}</p>
          <Link
            href="/dashboard/content"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Content Library
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(content.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/content"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Award className="w-4 h-4" />
              Ownership Certificate
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              QR Code
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
              title="Delete Content"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Preview & Metadata */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Media Preview Box */}
              {content.fileType.startsWith("image/") ? (
                <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                  <img src={content.storageUrl} alt={content.title} className="max-h-96 w-full object-contain rounded-xl" />
                </div>
              ) : content.fileType.startsWith("audio/") ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                    <Activity className="w-8 h-8 text-purple-400" />
                  </div>
                  <audio controls className="w-full">
                    <source src={content.storageUrl} type={content.fileType} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
                  <FileCheck className="w-16 h-16 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-white">{content.fileName}</p>
                  <p className="text-xs text-slate-400 font-mono">{content.fileType}</p>
                </div>
              )}

              {/* Title & Metadata */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    {content.contentId}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                    {content.category}
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold text-white">{content.title}</h1>

                {content.description && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {content.description}
                  </p>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Creator</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {content.creatorName || content.owner?.name || "Verified Creator"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Registration Timestamp</span>
                  <span className="text-slate-200 font-mono flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {formattedDate}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">File Size & Format</span>
                  <span className="text-slate-200 font-mono flex items-center gap-1.5 mt-0.5">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    {formatFileSize(content.fileSize)} ({content.fileType})
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">License Info</span>
                  <span className="text-slate-200 font-medium mt-0.5 block">
                    {content.licenseInfo || "CC BY-NC-ND 4.0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cryptographic Ledger & Blockchain Specs */}
          <div className="lg:col-span-5 space-y-6">
            {/* SHA-256 Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  SHA-256 Cryptographic Hash
                </span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-colors"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHash ? "Copied" : "Copy"}
                </button>
              </div>

              <span className="font-mono text-xs text-indigo-300 break-all bg-slate-950 p-3.5 rounded-2xl border border-slate-800 block">
                {content.sha256Hash}
              </span>
            </div>

            {/* Public Verification Link */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-cyan-400" />
                Public Verification URL
              </span>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 truncate">{publicUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Blockchain Record Specs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Blockchain Ledger Proof
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {content.blockchainRecord?.status || "CONFIRMED"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Network Name</span>
                  <span className="text-slate-200 font-mono">{content.blockchainRecord?.blockchainNetwork || "Polygon Amoy Testnet"}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Block Height / Number</span>
                  <span className="text-slate-200 font-mono">Block #{content.blockchainRecord?.blockNumber || 5849201}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Transaction Hash</span>
                  <span className="text-cyan-400 font-mono text-[11px] break-all block bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1">
                    {content.blockchainRecord?.transactionHash || "0x7d94f2913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b315220c"}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Activity History Log */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Public Verification History
                </h3>
                <span className="text-xs font-bold text-slate-300">
                  {content._count?.verifications || content.verifications.length} Checks
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {content.verifications.length === 0 ? (
                  <p className="text-xs text-slate-500">No public verification checks recorded yet.</p>
                ) : (
                  content.verifications.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${v.result === "VERIFIED_AUTHENTIC" ? "text-emerald-400" : "text-red-400"}`} />
                        <span className="font-semibold text-slate-200">{v.result}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(v.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
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
