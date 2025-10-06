import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

export default function HardcoverSearch({ initialQuery = "" }) {
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState({ url: "", status: "", ctype: "" });
  const [mock, setMock] = useState(false);
  const debounced = useRef();

  useEffect(() => {
    clearTimeout(debounced.current);
    if (!q.trim()) { setResults([]); setErr(""); setInfo({url:"",status:"",ctype:""}); return; }

    debounced.current = setTimeout(async () => {
      const query = q.trim();

      // MOCK mode: prove the search bar + list render correctly
      if (mock) {
        setLoading(true);
        setErr("");
        setInfo({ url: "(mock)", status: "200", ctype: "application/json" });
        setTimeout(() => {
          setResults([
            { id: "1", title: `Mock result for "${query}" #1`, author_names: ["Demo Author"], release_year: 2000, rating: 4.2, users_count: 123 },
            { id: "2", title: `Mock result for "${query}" #2`, author_names: ["Another Author"], release_year: 2010, rating: 4.0, users_count: 45 },
          ]);
          setLoading(false);
        }, 250);
        return;
      }

      // REAL call
      setLoading(true);
      setErr("");
      const url = `${API_BASE}/books?q=${encodeURIComponent(query)}`;
      try {
        const res = await fetch(url);
        const ctype = res.headers.get("content-type") || "";
        setInfo({ url, status: String(res.status), ctype });

        if (!ctype.includes("application/json")) {
          const txt = await res.text();
          throw new Error(
            `Expected JSON but got ${ctype || "unknown"} (status ${res.status}). Head: ${txt.slice(0, 200)}`
          );
        }

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `API error ${res.status}`);
        }

        const data = await res.json();
        setResults(data.items || []);
      } catch (e) {
        setErr(e.message || "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounced.current);
  }, [q, mock]);

  return (
    <div style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, flex: 1 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books by title, author, or ISBN…"
            style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </form>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <input type="checkbox" checked={mock} onChange={e => setMock(e.target.checked)} />
          Mock
        </label>
      </div>

      {/* tiny debug panel */}
      <div style={{ fontSize: 12, color: "#555", whiteSpace: "pre-wrap" }}>
        <div><strong>API_BASE:</strong> {API_BASE}</div>
        {info.url && <div><strong>Fetch:</strong> {info.url}</div>}
        {info.status && <div><strong>Status:</strong> {info.status} <strong>Type:</strong> {info.ctype}</div>}
      </div>

      {loading && <div style={{ marginTop: 12 }}>Searching…</div>}
      {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {results.map((b) => (
          <li key={b.id || b.slug} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ fontWeight: 600 }}>{b.title}</div>
            <div style={{ color: "#555" }}>
              {(b.author_names && b.author_names.join(", ")) || "Unknown"}
              {b.release_year ? ` • ${b.release_year}` : ""}
            </div>
            {b.rating != null && (
              <div style={{ fontSize: 12, color: "#777" }}>
                Rating: {b.rating} • Saved by {b.users_count ?? 0} users
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
