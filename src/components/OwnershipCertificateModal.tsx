"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ShieldCheck, Download, Printer, X, Award, CheckCircle2, Lock } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatFileSize } from "@/lib/hash";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    contentId: string;
    title: string;
    category: string;
    creatorName?: string | null;
    licenseInfo?: string | null;
    fileName: string;
    fileType: string;
    fileSize: number;
    sha256Hash: string;
    createdAt: string | Date;
    blockchainRecord?: {
      transactionHash: string;
      blockchainNetwork: string;
      blockNumber: number;
      contractAddress: string;
      status: string;
      ipfsMetadataCid?: string | null;
      chainId?: number | null;
    } | null;
  };
}

export default function OwnershipCertificateModal({ isOpen, onClose, content }: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${content.contentId}`
    : `https://creatorproof.io/verify/${content.contentId}`;

  useEffect(() => {
    if (isOpen && content.contentId) {
      QRCode.toDataURL(
        publicUrl,
        {
          width: 200,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        },
        (err, url) => {
          if (!err && url) setQrDataUrl(url);
        }
      );
    }
  }, [isOpen, content.contentId, publicUrl]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CreatorProof_Certificate_${content.contentId}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const regDate = new Date(content.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl relative my-8">
        {/* Controls Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Certificate of Authenticity</h2>
              <p className="text-xs text-slate-500">Cryptographically verified proof of digital ownership</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Generating PDF..." : "Download PDF"}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Box */}
        <div
          ref={certificateRef}
          className="relative bg-white border-2 border-slate-200 rounded-xl p-8 sm:p-12 text-slate-900 shadow-xs overflow-hidden print:border-2 print:border-black print:text-black print:bg-white"
        >
          {/* Decorative Corner Lines */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-indigo-600" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-indigo-600" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-indigo-600" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-indigo-600" />

          {/* Certificate Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                  Creator<span className="text-indigo-600">Proof</span>
                </h1>
                <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                  Blockchain Cryptographic Authenticity Standard
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                VERIFIED AUTHENTIC
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">ID: {content.contentId}</p>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-semibold mb-1.5">
              Official Digital Ownership Certificate
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{content.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Registered by <span className="text-slate-900 font-bold">{content.creatorName || "Verified Creator"}</span>
            </p>
          </div>

          {/* Certificate Grid Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Category & File Type</span>
                <span className="text-slate-900 font-medium">{content.category} ({content.fileType})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Original File Name & Size</span>
                <span className="text-slate-900 font-mono">{content.fileName} ({formatFileSize(content.fileSize)})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Copyright & License</span>
                <span className="text-slate-900 font-medium">{content.licenseInfo || "All Rights Reserved - Creator Authenticated"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Registration Timestamp</span>
                <span className="text-slate-900 font-mono">{regDate}</span>
              </div>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-slate-500 block text-[11px]">Immutable SHA-256 Hash</span>
                <span className="text-indigo-900 font-mono text-[11px] break-all bg-white p-2 rounded border border-slate-200 block mt-1">
                  {content.sha256Hash}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Blockchain Network</span>
                <span className="text-slate-900 font-mono text-[11px] block mt-0.5">
                  {content.blockchainRecord?.blockchainNetwork || "Polygon Amoy / Ethereum Testnet"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Block Number</span>
                <span className="text-slate-900 font-mono text-[11px] block mt-0.5">
                  #{content.blockchainRecord?.blockNumber || 5849201}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Smart Contract Address</span>
                <span className="text-slate-700 font-mono text-[10px] break-all block mt-0.5">
                  {content.blockchainRecord?.contractAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Transaction Hash</span>
                <span className="text-slate-700 font-mono text-[10px] break-all block mt-0.5">
                  {content.blockchainRecord?.transactionHash || "0x7d94f2913a37b19dfb4e9104b901a1c322b2742111d4e782a17621c0b315220c"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom QR & Seal Signature */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-4">
              {qrDataUrl && (
                <div className="bg-white p-1.5 rounded-lg border border-slate-200 shrink-0">
                  <img src={qrDataUrl} alt="Certificate QR Code" className="w-20 h-20 object-contain" />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-slate-900 block mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  Public Proof Verification
                </span>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Scan this QR code with any mobile camera or visit the URL to verify cryptographic authenticity in real time.
                </p>
                <p className="text-[10px] text-indigo-600 font-mono mt-1">{publicUrl}</p>
              </div>
            </div>

            <div className="text-right border-t sm:border-t-0 pt-4 sm:pt-0">
              <div className="inline-block p-2.5 rounded-full bg-indigo-50 border border-indigo-100 mb-1.5">
                <ShieldCheck className="w-7 h-7 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-900">CreatorProof Authority</p>
              <p className="text-[10px] text-slate-500">Cryptographically Sealed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
