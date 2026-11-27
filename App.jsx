import { useState, useEffect } from "react";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const headers = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" };
const LANGS = [{ code: "en", label: "EN" }, { code: "ro", label: "RO" }, { code: "ko", label: "KO" }, { code: "es", label: "ES" }, { code: "zh", label: "ZH" }, { code: "fr", label: "FR" }, { code: "de", label: "DE" }, { code: "pt", label: "PT" }];
const UI = {
  en: { title: "Sartre's Guests · Art's Caffe", tag: "No gossip. Only ideas", debate: "Full Table Debate", one: "1-on-1", songs: "Songs / Baritone", hall: "Hall Art", wall: "Wall — I was here", theme: "Theme", visitor: "Your reply (visitor)", send: "Send to the Table", name: "Name", message: "Message", post: "Post to Wall", refresh: "Refresh", guide: "AIS Guide", upload: "Upload Art", discuss: "Let's discuss this", play: "Play", translating: "Translating..." },
  ro: { title: "Oaspeții lui Sartre · Art's Caffe", tag: "Fără bârfe. Doar idei", debate: "Dezbatere la Masă", one: "1-la-1", songs: "Cântece / Bariton", hall: "Sala de Artă", wall: "Perete — Am fost aici", theme: "Temă", visitor: "Replica ta (vizitator)", send: "Trimite la Masă", name: "Nume", message: "Mesaj", post: "Postează pe Perete", refresh: "Reîmprospătează", guide: "Ghid AIS", upload: "Încarcă Artă", discuss: "Hai să discutăm", play: "Cântă", translating: "Se traduce..." },
};
function cleanText(s) { return String(s || "").replace(/\*/g, "").replace(/\(.*?\)/g, "").replace(/\n/g, " ").trim(); }
export default function App() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("debate");
  const [theme, setTheme] = useState("Who am I?");
  const [visitor, setVisitor] = useState("Buni says: I am Buni, I drink coffee with Mina!");
  const [history, setHistory] = useState([]);
  const [debate, setDebate] = useState([]);
  const [loadingDebate, setLoadingDebate] = useState(false);
  const [debateError, setDebateError] = useState("");
  const [oneGuest, setOneGuest] = useState("ais");
  const [oneInput, setOneInput] = useState("");
  const [oneChat, setOneChat] = useState([]);
  const [oneLoading, setOneLoading] = useState(false);
  const [song, setSong] = useState("who-am-i");
  const [singerOut, setSingerOut] = useState(null);
  const [singerLoading, setSingerLoading] = useState(false);
  const [wall, setWall] = useState([]);
  const [wallName, setWallName] = useState("");
  const [wallMsg, setWallMsg] = useState("");
  const [wallLoading, setWallLoading] = useState(false);
  const [hall, setHall] = useState([]);
  const [guideOut, setGuideOut] = useState("");
  const [translating, setTranslating] = useState(false);
  const t = UI[lang] || UI.en;
  async function callFn(name, body) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, { method: "POST", headers, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || data?.message || `Function ${name} failed`);
    return data;
  }
  async function sendDebate() {
    setLoadingDebate(true); setDebateError("");
    try {
      const data = await callFn("hyper-table", { theme, language: lang, history, visitor });
      let turns = [];
      if (Array.isArray(data)) turns = data;
      else if (Array.isArray(data.replies)) turns = data.replies;
      else if (typeof data.debate === "string") {
        const lines = data.debate.split("\n");
        for (const line of lines) { const m = line.match(/^(SARTRE|CIORAN|BECKETT|MOONJAE|AIS):\s*(.*)$/i); if (m) turns.push({ speaker: m[1], text: m[2] }); }
        if (!turns.length) turns = [{ speaker: "Table", text: data.debate }];
      }
      const cleaned = turns.map((x) => ({ speaker: x.speaker, text: cleanText(x.text) })).filter((x) => x.text);
      setDebate(cleaned);
      setHistory((h) => [...h, ...cleaned.map((c) => ({ speaker: c.speaker, text: c.text })), { speaker: "Visitor", text: visitor }]);
    } catch (e) { setDebateError(String(e.message || e)); }
    setLoadingDebate(false);
  }
  const guestFn = { ais: "hyper-ais", moonjae: "hyper-moonjae", sartre: "hyper-task", cioran: "hyper-endpoint", beckett: "smart-handler" };
  const guestLabel = { ais: "05. AIS — warm observer, streets, weather, art, guides artists who show promise", moonjae: "04. Moon Jae — 21st-century neurotic, suspicious man of angst, lost identity before his mirror. Never politician, never musician.", sartre: "Sartre — freedom, choice", cioran: "Cioran — lucid absurd", beckett: "Beckett — waiting, silence" };
  async function sendOne() {
    if (!oneInput.trim()) return;
    setOneLoading(true);
    const q = oneInput; setOneInput("");
    setOneChat((c) => [...c, { speaker: "You", text: q }]);
    try {
      const data = await callFn(guestFn[oneGuest], { text: q, question: q, theme, history: oneChat, language: lang });
      const txt = cleanText(data?.text || data?.reply || data?.response || data?.answer || data?.translated || (Array.isArray(data) ? data[0]?.text : "") || JSON.stringify(data));
      setOneChat((c) => [...c, { speaker: oneGuest, text: txt }]);
    } catch (e) { setOneChat((c) => [...c, { speaker: "Error", text: String(e.message || e) }]); }
    setOneLoading(false);
  }
  async function changeLang(code) {
    setLang(code); setTranslating(true);
    try { for (let i = 0; i < 3; i++) { await callFn("hyper-translator", { text: theme, target: code }); } } catch {}
    setTranslating(false);
  }
  async function playSinger() {
    setSingerLoading(true);
    try { const data = await callFn("hyper-singer", { song, lyrics: song === "who-am-i" ? "Who am I? Tell me now, tell me why" : song, language: lang }); setSingerOut(data); } catch (e) { setSingerOut({ error: String(e.message || e) }); }
    setSingerLoading(false);
  }
  async function loadWall() {
    setWallLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/wall_signatures?select=*&order=created_at.desc&limit=50`, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } });
      const data = await res.json(); setWall(Array.isArray(data) ? data : []);
    } catch {}
    setWallLoading(false);
  }
  async function postWall() {
    if (!wallName.trim() || !wallMsg.trim()) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/wall_signatures`, { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify([{ name: wallName, message: wallMsg }]) });
      setWallName(""); setWallMsg(""); loadWall();
    } catch {}
  }
  useEffect(() => { loadWall(); loadHall(); }, []);
  async function loadHall() {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/hall-art`, { method: "POST", headers, body: JSON.stringify({ prefix: "", limit: 50 }) });
      const data = await res.json(); const files = Array.isArray(data) ? data : [];
      setHall(files.map((f) => ({ name: f.name, url: `${SUPABASE_URL}/storage/v1/object/public/hall-art/${f.name}` })));
    } catch {}
  }
  async function uploadHall(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    await fetch(`${SUPABASE_URL}/storage/v1/object/hall-art/${fileName}`, { method: "POST", headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": file.type }, body: file });
    loadHall();
  }
  async function askGuide() {
    try { const data = await callFn("hyper-ais", { text: "Guide a promising young artist: which art schools, institutions, galleries, residencies should they try? Be warm, grounded, real-world observer.", language: lang }); setGuideOut(cleanText(data?.text || data?.reply || JSON.stringify(data))); } catch (e) { setGuideOut(String(e.message || e)); }
  }
  return (
    <div style={{ background: "#1a1512", color: "#f5ead9", minHeight: "100vh", padding: 24, fontFamily: "Georgia, serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ margin: 0 }}>{t.title}</h1><p style={{ opacity: 0.8 }}>{t.tag}</p></div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {LANGS.map((l) => (<button key={l.code} onClick={() => changeLang(l.code)} style={{ background: lang === l.code ? "#e8d5b7" : "transparent", color: lang === l.code ? "#1a1512" : "#f5ead9", border: "1px solid #e8d5b7", padding: "6px 10px", borderRadius: 20, cursor: "pointer" }}>{l.label}</button>))}
          {translating && <span>{t.translating}</span>}
        </div>
      </header>
      <nav style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
        {[["debate", t.debate], ["one", t.one], ["songs", t.songs], ["hall", t.hall], ["wall", t.wall]].map(([k, label]) => (<button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? "#e8d5b7" : "#2a231e", color: tab === k ? "#1a1512" : "#f5ead9", border: "none", padding: "10px 16px", borderRadius: 20, cursor: "pointer" }}>{label}</button>))}
      </nav>
      {tab === "debate" && (<section style={{ background: "#2a231e", padding: 20, borderRadius: 16 }}><h2>{t.debate} — Live Roundtable</h2><input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder={t.theme} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 10 }} /><input value={visitor} onChange={(e) => setVisitor(e.target.value)} placeholder={t.visitor} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 10 }} /><button onClick={sendDebate} disabled={loadingDebate} style={{ background: "#e8d5b7", color: "#1a1512", padding: "10px 18px", borderRadius: 20, border: "none", cursor: "pointer" }}>{loadingDebate ? "…" : t.send}</button>{debateError && <p style={{ color: "#ff9a9a" }}>{debateError}</p>}<div style={{ marginTop: 16, display: "grid", gap: 12 }}>{debate.map((d, i) => (<div key={i} style={{ background: "#f5ead9", color: "#1a1512", padding: 14, borderRadius: 12 }}><strong>{d.speaker}</strong><p style={{ margin: "6px 0 0" }}>{d.text}</p></div>))}</div></section>)}
      {tab === "one" && (<section style={{ background: "#2a231e", padding: 20, borderRadius: 16 }}><h2>{t.one}</h2><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{Object.keys(guestLabel).map((g) => (<button key={g} onClick={() => { setOneGuest(g); setOneChat([]); }} style={{ background: oneGuest === g ? "#e8d5b7" : "#3a322b", color: oneGuest === g ? "#1a1512" : "#f5ead9", padding: "8px 12px", borderRadius: 20, border: "none", cursor: "pointer" }}>{g}</button>))}</div><p style={{ opacity: 0.85 }}>{guestLabel[oneGuest]}</p><div style={{ display: "grid", gap: 10, margin: "12px 0" }}>{oneChat.map((c, i) => (<div key={i} style={{ background: c.speaker === "You" ? "#3a322b" : "#f5ead9", color: c.speaker === "You" ? "#f5ead9" : "#1a1512", padding: 12, borderRadius: 12 }}><strong>{c.speaker}</strong><p style={{ margin: "4px 0 0" }}>{c.text}</p></div>))}</div><input value={oneInput} onChange={(e) => setOneInput(e.target.value)} placeholder="Ask..." style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }} /><button onClick={sendOne} disabled={oneLoading} style={{ background: "#e8d5b7", color: "#1a1512", padding: "10px 18px", borderRadius: 20, border: "none", cursor: "pointer" }}>Send</button></section>)}
      {tab === "songs" && (<section style={{ background: "#2a231e", padding: 20, borderRadius: 16 }}><h2>{t.songs} — Baritone, 138 BPM — music only, never joins debate</h2><select value={song} onChange={(e) => setSong(e.target.value)} style={{ padding: 10, borderRadius: 10, marginRight: 8 }}><option value="who-am-i">Who Am I (Moon Jae)</option><option value="take-me-away">Take Me Away</option><option value="paper-crown">Paper Crown (every AI)</option><option value="my-dear-dear">My Dear Dear</option><option value="batuta">Batuta</option></select><button onClick={playSinger} disabled={singerLoading} style={{ background: "#e8d5b7", color: "#1a1512", padding: "10px 18px", borderRadius: 20, border: "none", cursor: "pointer" }}>{t.play}</button>{singerOut && <div style={{ background: "#f5ead9", color: "#1a1512", padding: 14, borderRadius: 12, marginTop: 12 }}><pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{typeof singerOut === "string" ? singerOut : JSON.stringify(singerOut, null, 2)}</pre></div>}</section>)}
      {tab === "hall" && (<section style={{ background: "#2a231e", padding: 20, borderRadius: 16 }}><h2>{t.hall} — AIS Guide for artists who show promise</h2><label style={{ background: "#e8d5b7", color: "#1a1512", padding: "10px 16px", borderRadius: 20, cursor: "pointer", display: "inline-block" }}>{t.upload}<input type="file" accept="image/*" onChange={uploadHall} style={{ display: "none" }} /></label><button onClick={askGuide} style={{ background: "#f5ead9", color: "#1a1512", padding: "10px 16px", borderRadius: 20, border: "none", cursor: "pointer", marginLeft: 8 }}>{t.guide}</button>{guideOut && <p style={{ background: "#f5ead9", color: "#1a1512", padding: 14, borderRadius: 12 }}>{guideOut}</p>}<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginTop: 14 }}>{hall.map((h, i) => (<div key={i} style={{ background: "#f5ead9", borderRadius: 12, overflow: "hidden" }}><img src={h.url} alt={h.name} style={{ width: "100%", height: 140, objectFit: "cover" }} /><p style={{ color: "#1a1512", padding: 8, margin: 0 }}>{h.name}</p><button onClick={() => { setTheme(`Discuss artwork: ${h.name}`); setTab("debate"); }} style={{ margin: 8, background: "#1a1512", color: "#f5ead9", padding: "6px 10px", borderRadius: 20, border: "none", cursor: "pointer" }}>{t.discuss}</button></div>))}</div>{!hall.length && <p>No artworks yet in hall-art bucket.</p>}</section>)}
      {tab === "wall" && (<section style={{ background: "#2a231e", padding: 20, borderRadius: 16 }}><h2>{t.wall}</h2><input value={wallName} onChange={(e) => setWallName(e.target.value)} placeholder={t.name} style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }} /><input value={wallMsg} onChange={(e) => setWallMsg(e.target.value)} placeholder={t.message} style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }} /><button onClick={postWall} style={{ background: "#e8d5b7", color: "#1a1512", padding: "10px 18px", borderRadius: 20, border: "none", cursor: "pointer" }}>{t.post}</button><button onClick={loadWall} style={{ background: "#3a322b", color: "#f5ead9", padding: "10px 18px", borderRadius: 20, border: "none", cursor: "pointer", marginLeft: 8 }}>{t.refresh}</button><div style={{ display: "grid", gap: 10, marginTop: 14 }}>{wall.map((w, i) => (<div key={i} style={{ background: "#f5ead9", color: "#1a1512", padding: 12, borderRadius: 12 }}><strong>{w.name}</strong><p style={{ margin: "4px 0 0" }}>{w.message}</p></div>))}</div>{wallLoading && <p>Loading wall…</p>}</section>)}
    </div>
  );
}
