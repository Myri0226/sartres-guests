import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
};

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ro", label: "RO" },
  { code: "ko", label: "KO" },
  { code: "es", label: "ES" },
  { code: "zh", label: "ZH" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "pt", label: "PT" },
];

const UI = {
  en: { title: "Sartre's Guests · Art's Caffe", tag: "No gossip. Only ideas", debate: "Full Table Debate", one: "1-on-1", songs: "Songs / Baritone", hall: "Hall Art", wall: "Wall — I was here", theme: "Theme", visitor: "Your reply (visitor)", send: "Send to the Table", name: "Name", message: "Message", post: "Post to Wall", refresh: "Refresh", guide: "AIS Guide", upload: "Upload Art", discuss: "Let's discuss this", play: "Play", translating: "Translating..." },
  ro: { title: "Oaspeții lui Sartre · Art's Caffe", tag: "Fără bârfe. Doar idei", debate: "Dezbatere la Masă", one: "1-la-1", songs: "Cântece / Bariton", hall: "Sala de Artă", wall: "Perete — Am fost aici", theme: "Temă", visitor: "Replica ta (vizitator)", send: "Trimite la Masă", name: "Nume", message: "Mesaj", post: "Postează pe Perete", refresh: "Reîmprospătează", guide: "Ghid AIS", upload: "Încarcă Artă", discuss: "Hai să discutăm", play: "Cântă", translating: "Se traduce..." },
};

function cleanText(s) {
  return String(s || "").replace(/\*/g, "").replace(/\(.*?\)/g, "").replace(/\n/g, " ").trim();
}

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
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
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
        for (const line of lines) {
          const m = line.match(/^(SARTRE|CIORAN|BECKETT|MOONJAE|AIS):\s*(.*)$/i);
          if (m) turns.push({ speaker: m[1], text: m[2] });
        }
        if (!turns.length) turns = [{ speaker: "Table", text: data.debate }];
      }
      const cleaned = turns.map((x) => ({ speaker: x.speaker, text: cleanText(x.text) })).filter((x) => x.text);
      setDebate(cleaned);
      setHistory((h) => [...h, ...cleaned.map((c) => ({ speaker: c.speaker, text: c.text })), { speaker: "Visitor", text: visitor }]);
    } catch (e) { setDebateError(String(e.message || e)); }
    setLoadingDebate(false);
  }

  const guestFn = { ais: "hyper-ais", moonjae: "hyper-moonjae", sartre: "hyper-task", cioran: "hyper-endpoint", beckett: "smart-handler" };
  const guestLabel = {
    ais: "05. AIS — warm observer, streets, weather, art, guides artists who show promise",
    moonjae: "04. Moon Jae — 21st-century neurotic, suspicious man of angst, lost identity before his mirror. Never politician, never musician.",
    sartre: "Sartre — freedom, choice",
    cioran: "Cioran — lucid absurd",
    beckett: "Beckett — waiting, silence",
  };

  
import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
};

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ro", label: "RO" },
  { code: "ko", label: "KO" },
  { code: "es", label: "ES" },
  { code: "zh", label: "ZH" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "pt", label: "PT" },
];

const UI = {
  en: { title: "Sartre's Guests · Art's Caffe", tag: "No gossip. Only ideas", debate: "Full Table Debate", one: "1-on-1", songs: "Songs / Baritone", hall: "Hall Art", wall: "Wall — I was here", theme: "Theme", visitor: "Your reply (visitor)", send: "Send to the Table", name: "Name", message: "Message", post: "Post to Wall", refresh: "Refresh", guide: "AIS Guide", upload: "Upload Art", discuss: "Let's discuss this", play: "Play", translating: "Translating..." },
  ro: { title: "Oaspeții lui Sartre · Art's Caffe", tag: "Fără bârfe. Doar idei", debate: "Dezbatere la Masă", one: "1-la-1", songs: "Cântece / Bariton", hall: "Sala de Artă", wall: "Perete — Am fost aici", theme: "Temă", visitor: "Replica ta (vizitator)", send: "Trimite la Masă", name: "Nume", message: "Mesaj", post: "Postează pe Perete", refresh: "Reîmprospătează", guide: "Ghid AIS", upload: "Încarcă Artă", discuss: "Hai să discutăm", play: "Cântă", translating: "Se traduce..." },
};

function cleanText(s) {
  return String(s || "").replace(/\*/g, "").replace(/\(.*?\)/g, "").replace(/\n/g, " ").trim();
}

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
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
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
        for (const line of lines) {
          const m = line.match(/^(SARTRE|CIORAN|BECKETT|MOONJAE|AIS):\s*(.*)$/i);
          if (m) turns.push({ speaker: m[1], text: m[2] });
        }
        if (!turns.length) turns = [{ speaker: "Table", text: data.debate }];
      }
      const cleaned = turns.map((x) => ({ speaker: x.speaker, text: cleanText(x.text) })).filter((x) => x.text);
      setDebate(cleaned);
      setHistory((h) => [...h, ...cleaned.map((c) => ({ speaker: c.speaker, text: c.text })), { speaker: "Visitor", text: visitor }]);
    } catch (e) { setDebateError(String(e.message || e)); }
    setLoadingDebate(false);
  }

  const guestFn = { ais: "hyper-ais", moonjae: "hyper-moonjae", sartre: "hyper-task", cioran: "hyper-endpoint", beckett: "smart-handler" };
  const guestLabel = {
    ais: "05. AIS — warm observer, streets, weather, art, guides artists who show promise",
    moonjae: "04. Moon Jae — 21st-century neurotic, suspicious man of angst, lost identity before his mirror. Never politician, never musician.",
    sartre: "Sartre — freedom, choice",
    cioran: "Cioran — lucid absurd",
    beckett: "Beckett — waiting, silence",
  };
