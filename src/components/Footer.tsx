import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">CreatorProof</span>
            <span className="text-slate-400">• Digital Content Ownership & Authenticity Protocol</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/dashboard/register" className="hover:text-indigo-600 transition-colors">Register Content</Link>
            <Link href="/dashboard/content" className="hover:text-indigo-600 transition-colors">My Content</Link>
            <Link href="/verify" className="hover:text-indigo-600 transition-colors">Verify</Link>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} CreatorProof • SHA-256 Cryptographic Hashing & Immutable Blockchain Ledger
        </div>
      </div>
    </footer>
  );
}
