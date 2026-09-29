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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1 inline-block">
              Creator Proof Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Digital Ownership Workspace</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/register"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Register New Content
            </Link>

            <Link
              href="/verify"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-slate-500" />
              Verify
            </Link>
          </div>
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/dashboard/register"
            className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 shadow-xs transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Register Content</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Upload file, compute SHA-256 hash, and anchor to blockchain.</p>
          </Link>

          <Link
            href="/dashboard/content"
            className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 shadow-xs transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">My Content</h3>
            <p className="text-xs text-slate-500 leading-relaxed">View registered content items, QR codes, and certificates.</p>
          </Link>

          <Link
            href="/verify"
            className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 shadow-xs transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Public Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Inspect content authenticity via Content ID or file upload.</p>
          </Link>
        </div>

        {/* Content Records Summary Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Registered Content Records</h3>
            <Link
              href="/dashboard/content"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3 px-3">Content ID</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">SHA-256 Hash</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 animate-pulse">
                      Loading records...
                    </td>
                  </tr>
                ) : recentWorks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No works registered yet.
                    </td>
                  </tr>
                ) : (
                  recentWorks.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">
                        {item.contentId}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                        {truncateHash(item.sha256Hash, 6, 6)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/verify/${item.contentId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition-colors border border-indigo-100"
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
