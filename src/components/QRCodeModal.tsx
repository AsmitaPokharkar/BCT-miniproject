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
            dark: "#0b0f19",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Verification QR Code</h3>
            <p className="text-xs text-slate-400 font-mono">Content ID: {contentId}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 font-medium line-clamp-1">{title}</p>

        {/* QR Display */}
        <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-4 shadow-inner border border-slate-200">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR Code for ${contentId}`} className="w-56 h-56 object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs animate-pulse">
              Generating Cryptographic QR...
            </div>
          )}
        </div>

        {/* Public Link Box */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-6 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-400 truncate">{publicUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0 px-2 py-1 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <a
            href={`/verify/${contentId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            Test Public URL
          </a>
        </div>
      </div>
    </div>
  );
}
