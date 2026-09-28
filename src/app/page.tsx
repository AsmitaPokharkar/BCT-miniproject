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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Blockchain Content Authenticity Standard</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Prove Your <span className="text-indigo-400">Digital Ownership.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CreatorProof uses cryptographic hashing and blockchain technology to create tamper-evident records for digital content.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <Lock className="w-4 h-4" />
              Register Your Work
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-800 transition-all"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              Verify Content
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive SHA-256 Hash Tester */}
      <section className="py-10 max-w-3xl mx-auto px-4 w-full">
        <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Instant Browser SHA-256 Generator</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Web Crypto API
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Select any file below to compute its cryptographic hash locally in real time:
          </p>

          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950 rounded-2xl p-6 text-center transition-colors cursor-pointer group">
            <input
              type="file"
              id="hero-demo-file"
              onChange={handleDemoFileSelect}
              className="hidden"
            />
            <label htmlFor="hero-demo-file" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-200 block mb-1">
                Click to Select File for SHA-256 Hashing
              </span>
              <span className="text-[11px] text-slate-400">Images, Artwork, Audio, Video, PDFs & Documents</span>
            </label>
          </div>

          {calculating && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center animate-pulse text-xs text-indigo-400 font-mono">
              Computing Web Crypto SHA-256 hash...
            </div>
          )}

          {demoFile && demoHash && !calculating && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate max-w-[200px]">{demoFile.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{formatFileSize(demoFile.size)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Calculated SHA-256 Hash:</span>
                <span className="text-indigo-300 font-mono text-[11px] break-all block bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                  {demoHash}
                </span>
              </div>
              <div className="pt-2 text-right">
                <Link
                  href="/dashboard/register"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Register this Hash on Blockchain <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-indigo-400">Simple Verification Protocol</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">How It Works</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Upload</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your digital content file (image, audio, video, or document).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Hash</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a unique cryptographic SHA-256 fingerprint of the file.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Register on Blockchain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anchor the Content ID, hash, and metadata permanently on the blockchain.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="text-sm font-bold text-white">Verify</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anyone can check authenticity via public Content ID or file upload.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
