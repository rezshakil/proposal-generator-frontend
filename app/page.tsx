"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      org_id: fd.get("org_id"),
      type: fd.get("type") || "proposal",
      client: {
        industry: fd.get("industry"),
        goals: fd.get("goals"),
        product: fd.get("product"),
        budget: fd.get("budget"),
        timeline: fd.get("timeline")
      },
      user_email: fd.get("email")
    };

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL as string,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Proposal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" placeholder="Your Email" className="w-full" required />
        <input name="org_id" placeholder="Org ID" className="w-full" required />
        <input name="industry" placeholder="Client Industry" className="w-full" required />
        <input name="goals" placeholder="Client Goals" className="w-full" required />
        <input name="product" placeholder="Product/Service" className="w-full" required />
        <input name="budget" placeholder="Budget" className="w-full" />
        <input name="timeline" placeholder="Timeline" className="w-full" />
        <select name="type" className="w-full">
          <option value="proposal">Proposal</option>
          <option value="deck">Pitch Deck</option>
          <option value="both">Both</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">❌ {error}</p>}
      {result && (
        <div className="mt-6 border p-4 rounded bg-white">
          <h2 className="font-semibold mb-2">Result</h2>
          {result.doc_url && (
            <p>
              <a href={result.doc_url} target="_blank" className="text-blue-600 underline">
                Open Proposal
              </a>
            </p>
          )}
          {result.deck_url && (
            <p>
              <a href={result.deck_url} target="_blank" className="text-blue-600 underline">
                Open Deck
              </a>
            </p>
          )}
          {result.message && <p>{result.message}</p>}
        </div>
      )}
    </main>
  );
}
