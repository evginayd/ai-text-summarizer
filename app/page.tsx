"use client";

import { useState } from "react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setSummary("");
    setCopied(false);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok) {
        setSummary(`📰 ${data.headline}\n\n${data.shortSummary}`);
      } else {
        setSummary("❌ Error: " + data.error);
      }
    } catch (err) {
      setSummary("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 border border-gray-300">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
          AI Text Summarizer
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Paste your text below and get a concise summary instantly.
        </p>

        {/* Input Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 p-4 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none text-gray-900 placeholder-gray-600"
          placeholder="Paste your text here..."
        />

        {/* Button */}
        <button
          onClick={handleSummarize}
          disabled={loading || !text.trim()}
          className="w-full mt-4 bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Summarizing..." : "Summarize"}
        </button>

        {/* Result Box */}
        <div className="mt-6 p-4 bg-gray-200 rounded-xl text-gray-900 relative min-h-[100px]">
          {summary ? (
            <>
              <p className="whitespace-pre-line">{summary}</p>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-6 w-6" />
                )}
              </button>
            </>
          ) : (
            <p className="italic text-gray-600">Summary will appear here...</p>
          )}
        </div>
      </div>
    </main>
  );
}
