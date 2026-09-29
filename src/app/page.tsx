"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Search,
  Upload,
  ArrowRight,
  Zap,
  Lock,
  CheckCircle2,
  FileText,
  Key,
} from "lucide-react";
import { calculateSHA256, formatFileSize } from "@/lib/hash";

export default function LandingPage() {
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [demoHash, setDemoHash] = useState<string>("");
  const [calculating, setCalculating] = useState(false);

  const handleDemoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processDemoFile(e.target.files[0]);
    }
  };

  const processDemoFile = async (file: File) => {
    setDemoFile(file);
    setCalculating(true);
    try {
      const hash = await calculateSHA256(file);
      setDemoHash(hash);
    } catch (err) {
      console.error("Hash calculation error:", err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Digital Content Ownership</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Prove Your <span className="text-indigo-600">Digital Ownership.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                CreatorProof creates tamper-evident proof of ownership for digital content using browser cryptographic hashing and immutable blockchain timestamping.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/dashboard/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  <Lock className="w-4 h-4" />
                  Register Your Work
                </Link>

                <Link
                  href="/verify"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 shadow-xs transition-all"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  Verify Content
                </Link>
              </div>
            </div>

            {/* Right Minimal Elegant Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Verified Digital Proof</span>
                      <span className="text-[11px] font-mono text-slate-400 block">ID: CP-ART-984210</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Content Title</span>
                    <span className="font-semibold text-slate-800">Cybernetic Canvas #42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Creator</span>
                    <span className="font-medium text-slate-800">Elena Rostova</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ledger Status</span>
                    <span className="font-mono text-indigo-600 font-medium">Polygon Amoy Testnet</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 font-mono text-[11px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-medium">SHA-256 Fingerprint</span>
                  <span className="text-indigo-900 break-all block">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHA-256 Upload Section */}
      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Verify a file instantly</h2>
              </div>
              <p className="text-xs text-slate-500">
                Calculate a SHA-256 fingerprint locally in your browser.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Web Crypto API
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50/50 rounded-xl p-8 text-center transition-colors cursor-pointer group">
            <input
              type="file"
              id="hero-demo-file"
              onChange={handleDemoFileSelect}
              className="hidden"
            />
            <label htmlFor="hero-demo-file" className="cursor-pointer block space-y-2">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto group-hover:scale-105 transition-transform" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Click to select file for SHA-256 hashing
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Images, Artwork, Audio, Video, PDFs & Documents
                </span>
              </div>
            </label>
          </div>

          {calculating && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center animate-pulse text-xs text-indigo-700 font-mono">
              Computing Web Crypto SHA-256 hash...
            </div>
          )}

          {demoFile && demoHash && !calculating && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 truncate max-w-xs">{demoFile.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">{formatFileSize(demoFile.size)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Calculated SHA-256 Hash:</span>
                <span className="text-indigo-900 font-mono text-[11px] break-all block bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                  {demoHash}
                </span>
              </div>
              <div className="pt-1 text-right">
                <Link
                  href="/dashboard/register"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Register this Hash on Blockchain <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Verification Protocol</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How CreatorProof Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Process Step 01 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 relative">
            <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
              01
            </span>
            <h3 className="text-sm font-bold text-slate-900">Upload</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload digital media or documents directly inside your browser.
            </p>
          </div>

          {/* Process Step 02 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 relative">
            <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
              02
            </span>
            <h3 className="text-sm font-bold text-slate-900">Generate Proof</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculate a unique SHA-256 cryptographic fingerprint locally.
            </p>
          </div>

          {/* Process Step 03 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 relative">
            <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
              03
            </span>
            <h3 className="text-sm font-bold text-slate-900">Register</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anchor the Content ID and hash permanently to the blockchain ledger.
            </p>
          </div>

          {/* Process Step 04 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 relative">
            <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
              04
            </span>
            <h3 className="text-sm font-bold text-slate-900">Verify</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anyone can check authenticity via Content ID or file upload.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
