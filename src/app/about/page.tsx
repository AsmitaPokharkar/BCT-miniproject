"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Cpu,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Search,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Blockchain Authenticity Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">About CreatorProof</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            CreatorProof uses cryptographic SHA-256 hashing and immutable blockchain technology to create tamper-evident ownership records for digital content.
          </p>
        </div>

        {/* Section 1: Problem */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">The Problem</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In the digital age, original creative content—such as artwork, photography, audio master files, and documents—can be trivially copied, redistributed, or tampered with. Digital creators often struggle to prove that their work existed at a specific point in time or that a particular file is the unaltered original work created by them. Traditional copyright registrations are slow, centralized, and expensive for digital-first creators.
          </p>
        </section>

        {/* Section 2: Solution */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">The Solution</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            CreatorProof provides a fast, decentralized, and mathematically indisputable system for digital ownership. By combining client-side cryptographic SHA-256 hashing with smart contracts deployed on an EVM blockchain, creators can anchor an unalterable proof-of-existence and ownership record in seconds. Anyone can later verify the authenticity of a file by simply re-calculating its hash and comparing it with the on-chain record.
          </p>
        </section>

        {/* Section 3: Why Blockchain */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Why Blockchain?</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A standard centralized database can be modified, wiped, or shut down by a single authority. A blockchain ledger is:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Immutable</span>
              <span className="text-slate-400">Once recorded in a block, the transaction cannot be modified or deleted.</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Timestamped</span>
              <span className="text-slate-400">Block consensus provides cryptographic proof of existence at a specific time.</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Publicly Auditable</span>
              <span className="text-slate-400">Anyone can independently inspect the smart contract and transaction hash.</span>
            </div>
          </ul>
        </section>

        {/* Section 4: How SHA-256 Works */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">How SHA-256 Hashing Works</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            SHA-256 (Secure Hash Algorithm 256-bit) is a industry-standard cryptographic hash function. It takes any digital file of any size and produces a fixed 64-character hexadecimal fingerprint.
          </p>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>Original File</span>
              <span className="text-indigo-400">SHA-256 Fingerprint (64 chars)</span>
            </div>
            <p className="text-slate-300">
              &quot;MasterArtwork.png&quot; → <span className="text-indigo-300">8a73f91c2e7f29a18a73f91c2e7f29a18a73f91c2e7f29a18a73f91c2e7f29a1</span>
            </p>
            <p className="text-slate-400 text-[11px] font-sans">
              <strong className="text-amber-400">Avalanche Effect:</strong> If even a single byte or pixel in the file is modified, the resulting SHA-256 hash changes completely.
            </p>
          </div>
        </section>

        {/* Section 5: How Verification Works */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">How Verification Works</h2>
          </div>
          <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-white">File Upload:</strong> The user uploads a file or enters a Content ID in the verification portal.
            </li>
            <li>
              <strong className="text-white">Hash Computation:</strong> The browser calculates the Web Crypto SHA-256 digest of the uploaded file.
            </li>
            <li>
              <strong className="text-white">Ledger Comparison:</strong> The system fetches the original SHA-256 hash registered on the blockchain for that Content ID.
            </li>
            <li>
              <strong className="text-white">Result Display:</strong> If the computed hash matches the blockchain hash, it displays <span className="text-emerald-400 font-bold">✅ VERIFIED AUTHENTIC</span>. If the hashes differ by even one character, it displays <span className="text-red-400 font-bold">❌ CONTENT MODIFIED</span>.
            </li>
          </ol>
        </section>

        {/* Call to action */}
        <div className="text-center pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
          >
            Register Your Work <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 transition-colors"
          >
            <Search className="w-4 h-4 text-cyan-400" /> Verify Existing Content
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
