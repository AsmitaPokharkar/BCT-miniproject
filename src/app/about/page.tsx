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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Blockchain Authenticity Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">About CreatorProof</h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            CreatorProof uses cryptographic SHA-256 hashing and immutable blockchain technology to create tamper-evident ownership records for digital content.
          </p>
        </div>

        {/* Section 1: Problem */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In the digital age, original creative content—such as artwork, photography, audio master files, and documents—can be trivially copied, redistributed, or tampered with. Digital creators often struggle to prove that their work existed at a specific point in time or that a particular file is the unaltered original work created by them. Traditional copyright registrations are slow, centralized, and expensive for digital-first creators.
          </p>
        </section>

        {/* Section 2: Solution */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">The Solution</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            CreatorProof provides a fast, decentralized, and mathematically indisputable system for digital ownership. By combining client-side cryptographic SHA-256 hashing with smart contracts deployed on an EVM blockchain, creators can anchor an unalterable proof-of-existence and ownership record in seconds. Anyone can later verify the authenticity of a file by simply re-calculating its hash and comparing it with the on-chain record.
          </p>
        </section>

        {/* Section 3: Why Blockchain */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Why Blockchain?</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A standard centralized database can be modified, wiped, or shut down by a single authority. A blockchain ledger is:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Immutable</span>
              <span className="text-slate-500 leading-relaxed">Once recorded in a block, the transaction cannot be modified or deleted.</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Timestamped</span>
              <span className="text-slate-500 leading-relaxed">Block consensus provides cryptographic proof of existence at a specific time.</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Publicly Auditable</span>
              <span className="text-slate-500 leading-relaxed">Anyone can independently inspect the smart contract and transaction hash.</span>
            </div>
          </div>
        </section>

        {/* Section 4: How SHA-256 Works */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">How SHA-256 Hashing Works</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            SHA-256 (Secure Hash Algorithm 256-bit) is an industry-standard cryptographic hash function. It takes any digital file of any size and produces a fixed 64-character hexadecimal fingerprint.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-200 pb-2">
              <span>Original File</span>
              <span className="text-indigo-700">SHA-256 Fingerprint (64 chars)</span>
            </div>
            <p className="text-slate-800">
              &quot;MasterArtwork.png&quot; → <span className="text-indigo-900">8a73f91c2e7f29a18a73f91c2e7f29a18a73f91c2e7f29a18a73f91c2e7f29a1</span>
            </p>
            <p className="text-slate-500 text-[11px] font-sans">
              <strong className="text-amber-700">Avalanche Effect:</strong> If even a single byte or pixel in the file is modified, the resulting SHA-256 hash changes completely.
            </p>
          </div>
        </section>

        {/* Section 5: How Verification Works */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">How Verification Works</h2>
          </div>
          <ol className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-slate-900">File Upload:</strong> The user uploads a file or enters a Content ID in the verification portal.
            </li>
            <li>
              <strong className="text-slate-900">Hash Computation:</strong> The browser calculates the Web Crypto SHA-256 digest of the uploaded file.
            </li>
            <li>
              <strong className="text-slate-900">Ledger Comparison:</strong> The system fetches the original SHA-256 hash registered on the blockchain for that Content ID.
            </li>
            <li>
              <strong className="text-slate-900">Result Display:</strong> If the computed hash matches the blockchain hash, it displays <span className="text-emerald-700 font-bold">VERIFIED AUTHENTIC</span>. If the hashes differ, it displays <span className="text-red-700 font-bold">CONTENT MODIFIED</span>.
            </li>
          </ol>
        </section>

        {/* Call to action */}
        <div className="text-center pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Register Your Work <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" /> Verify Existing Content
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
