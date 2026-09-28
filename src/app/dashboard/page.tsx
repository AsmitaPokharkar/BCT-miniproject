"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileCheck,
  CheckCircle2,
  Search,
  Plus,
  ExternalLink,
} from "lucide-react";
import { truncateHash } from "@/lib/hash";

interface RecentWork {
  id: string;
  contentId: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: number;
  sha256Hash: string;
  createdAt: string;
  blockchainRecord?: {
    transactionHash: string;
    blockNumber: number;
    status: string;
  } | null;
}

export default function DashboardPage() {
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const res = await fetch("/api/content");
        if (res.ok) {
          const data = await res.json();
          setRecentWorks(data.contents || []);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1 inline-block">
              Creator Proof Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Digital Ownership Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/register"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Register New Content
            </Link>

            <Link
              href="/verify"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              Verify
            </Link>
          </div>
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/dashboard/register"
            className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Register Content</h3>
            <p className="text-xs text-slate-400">Upload file, compute SHA-256 hash, and anchor to blockchain.</p>
          </Link>

          <Link
            href="/dashboard/content"
            className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">My Content</h3>
            <p className="text-xs text-slate-400">View registered content items, QR codes, and certificates.</p>
          </Link>

          <Link
            href="/verify"
            className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Public Verification</h3>
            <p className="text-xs text-slate-400">Inspect content authenticity via Content ID or file upload.</p>
          </Link>
        </div>

        {/* Content Records Summary Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Registered Content Records</h3>
            <Link
              href="/dashboard/content"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Content ID</th>
                  <th className="pb-3 px-3">Title</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">SHA-256 Hash</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 animate-pulse">
                      Loading records...
                    </td>
                  </tr>
                ) : recentWorks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No works registered yet.
                    </td>
                  </tr>
                ) : (
                  recentWorks.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">
                        {item.contentId}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">
                        {truncateHash(item.sha256Hash, 6, 6)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/verify/${item.contentId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold transition-colors"
                        >
                          Verify <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
