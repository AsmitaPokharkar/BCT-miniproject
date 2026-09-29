"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download, X, Copy, Check, ExternalLink } from "lucide-react";

interface QRCodeModalProps {
  contentId: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ contentId, title, isOpen, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${contentId}`
    : `https://creatorproof.io/verify/${contentId}`;

  useEffect(() => {
    if (isOpen && contentId) {
      QRCode.toDataURL(
        publicUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, contentId, publicUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `CreatorProof_QR_${contentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Verification QR Code</h3>
            <p className="text-xs text-slate-500 font-mono">Content ID: {contentId}</p>
          </div>
        </div>

        <p className="text-xs text-slate-700 mb-4 font-medium line-clamp-1">{title}</p>

        {/* QR Display */}
        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-center mb-4 border border-slate-200">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR Code for ${contentId}`} className="w-52 h-52 object-contain" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs animate-pulse">
              Generating Cryptographic QR...
            </div>
          )}
        </div>

        {/* Public Link Box */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-600 truncate">{publicUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-800 font-medium shrink-0 px-2.5 py-1 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <a
            href={`/verify/${contentId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            Test Public URL
          </a>
        </div>
      </div>
    </div>
  );
}
