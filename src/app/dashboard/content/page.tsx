"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface ContentItem {
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
    blockchainNetwork: string;
    status: string;
  } | null;
}

export default function ContentLibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLibrary() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);

        const res = await fetch(`/api/content?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.contents || []);
        }
      } catch (err) {
        console.error("Library load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1 inline-block">
              My Registered Content
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Content Records</h1>
          </div>

          <Link
            href="/dashboard/register"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            Register New Content
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Title or Content ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Content Records Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-500 animate-pulse text-xs font-mono">
              Loading content records...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No registered content found</p>
              <p className="text-xs text-slate-400">Click &quot;Register New Content&quot; to create your first blockchain record.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Content ID</th>
                  <th className="pb-3 px-3">Title</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Registration Date</th>
                  <th className="pb-3 px-3">Blockchain Status</th>
                  <th className="pb-3 px-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-indigo-400 font-bold">
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
                    <td className="py-3.5 px-3 text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.blockchainRecord?.status || "CONFIRMED"}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
