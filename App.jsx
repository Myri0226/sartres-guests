import React, { useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const GUESTS = ["Sartre", "Cioran", "Beckett", "Moon Jae", "AIS"];
const SONGS = [
  { title: "Who Am I", guest: "Moon Jae" },
  { title: "Take Me Away", guest: "Baritone" },
  { title: "Paper Crown", guest: "Baritone" },
  { title: "My Dear Dear", guest: "Baritone" },
  { title: "Batuta", guest: "Baritone" },
];

export default function App() {
  const [tab, setTab] = useState("ais");
  const [oneInput, setOneInput] = useState("");
  const [oneAnswer, setOneAnswer] = useState("");
  const [debateTopic, setDebateTopic] = useState("");
  const [debate, setDebate] = useState([]);
  const [transInput, setTransInput] = useState("");
  const [transAnswer, setTransAnswer] = useState("");
  const [singerStatus, setSingerStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const callFn = async (fn, body) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res;
  };

  const askGuide = async () => {
    if (!oneInput.trim()) return;
    setLoading(true);
    setOneAnswer("");
    try {
      const res = await callFn("hyper-translator", { text: oneInput, target: "ro" });
      const data = await res.json();
      setOneAnswer(data.translated || data.original || "AIS ascultă...");
    } catch (e) {
      setOneAnswer("AIS nu a putut răspunde acum. Încearcă din nou.");
    }
    setLoading(false);
  };

  const startDebate = async () => {
    if (!debateTopic.trim()) return;
    setLoading(true);
    setDebate([]);
    try {
      const res = await callFn("hyper-table", { topic: debateTopic });
      const data = await res.json();
      setDebate(Array.isArray(data) ? data : data.debate || []);
    } catch (e) {
      setDebate([{ speaker: "Sartre", text: "Masa nu s-a putut aduna acum." }]);
    }
    setLoading(false);
  };

  const translate = async () => {
    if (!transInput.trim()) return;
    setLoading(true);
    try {
      const res = await callFn("hyper-translator", { text: transInput, target: "ro" });
      const data = await res.json();
      setTransAnswer(data.translated || "");
    } catch (e) {
      setTransAnswer("Traducerea nu a mers acum.");
    }
    setLoading(false);
  };

  // REPARAT: Play intelege MP3, nu mai cere JSON
  const playSinger = async (song) => {
    setSingerStatus(`Cântă acum: ${song.title}...`);
    try {
      if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); }
      const res = await callFn("hyper-singer", { song: song.title, guest: song.guest });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        setCurrentAudio(audio);
        audio.play();
        setSingerStatus(`Acum cântă: ${song.title} - RYONG`);
        return;
      }
      // Daca nu e audio, e eroare JSON
      const data = await res.json();
      setSingerStatus(data.error || "Singerul nu a putut cânta acum.");
    } catch (e) {
      setSingerStatus("Singerul nu a putut cânta acum. Încearcă din nou.");
    }
  };

  const boxStyle = {
    background: "#fff",
    border: "1px solid #e5e0d5",
    borderRadius: 16,
    padding: 16,
    maxWidth: "100%",
    overflow: "hidden",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#f7f3ea", minHeight: "100vh", padding: 16, boxSizing: "border-box", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 4 }}>Sartre's Guests · Art's Caffe</h1>
      <p style={{ textAlign: "center", marginTop: 0, fontStyle: "italic" }}>No gossip. Only ideas</p>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setTab("ais")}>AIS 1-on-1</button>
        <button onClick={() => setTab("debate")}>Full Table Debate</button>
        <button onClick={() => setTab("translate")}>Translator</button>
        <button onClick={() => setTab("songs")}>Songs / Baritone</button>
      </div>

      {tab === "ais" && (
        <div style={boxStyle}>
          <h3>AIS te ascultă</h3>
          <input value={oneInput} onChange={(e) => setOneInput(e.target.value)} placeholder="Scrie-i lui AIS..." style={{ width: "100%", padding: 10, boxSizing: "border-box" }} />
          <button onClick={askGuide} style={{ marginTop: 8 }}>Trimite</button>
          {loading && <p>...</p>}
          {oneAnswer && <p>{oneAnswer}</p>}
        </div>
      )}

      {tab === "debate" && (
        <div style={boxStyle}>
          <h3>Full Table Debate</h3>
          <input value={debateTopic} onChange={(e) => setDebateTopic(e.target.value)} placeholder="Despre ce dezbatem?" style={{ width: "100%", padding: 10, boxSizing: "border-box" }} />
          <button onClick={startDebate} style={{ marginTop: 8 }}>Start Debate</button>
          {loading && <p>Masa se adună...</p>}
          {debate.map((d, i) => (
            <p key={i}><b>{d.speaker}:</b> {d.text}</p>
          ))}
        </div>
      )}

      {tab === "translate" && (
        <div style={boxStyle}>
          <h3>Translator</h3>
          <input value={transInput} onChange={(e) => setTransInput(e.target.value)} placeholder="Scrie aici..." style={{ width: "100%", padding: 10, boxSizing: "border-box" }} />
          <button onClick={translate} style={{ marginTop: 8 }}>Translate</button>
          {transAnswer && <p>{transAnswer}</p>}
        </div>
      )}

      {tab === "songs" && (
        <div style={boxStyle}>
          <h3>Songs · Baritone RYONG</h3>
          <p>Apasă Play. Acum cântă MP3, nu mai dă eroare ID3.</p>
          {SONGS.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee", gap: 8 }}>
              <span><b>{s.title}</b> — {s.guest}</span>
              <button onClick={() => playSinger(s)}>▶ Play</button>
            </div>
          ))}
          {singerStatus && <p style={{ marginTop: 12 }}>{singerStatus}</p>}
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 20 }}>Sartre · Cioran · Beckett · Moon Jae · AIS</p>
    </div>
  );
}
