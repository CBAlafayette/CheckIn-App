import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  AlertTriangle,
  Gauge,
  Droplet,
  Zap,
  CircleHelp,
  Plus,
  CheckCircle2,
  Clock,
  Car,
  User,
  ClipboardList,
  ShieldAlert,
  Quote,
  Trash2,
  Printer,
  Eye,
  Wind,
  Ear,
  Waves,
  ChevronDown,
  ChevronUp,
  Coffee,
  Truck,
  Search,
  FileText,
  Mic,
  Square,
  Sparkles,
  Loader2,
  Copy,
  ClipboardCheck,
  Wrench,
  Target,
  Moon,
  CalendarClock,
  CloudSun,
  ShieldCheck,
  Activity,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');`;

const CATEGORIES = [
  { id: "noise", label: "Noise", icon: Volume2, color: "#2E4057" },
  { id: "warning_light", label: "Warning Light", icon: AlertTriangle, color: "#C1443C" },
  { id: "performance", label: "Performance", icon: Gauge, color: "#8A5A2E" },
  { id: "fluid_leak", label: "Fluid Leak", icon: Droplet, color: "#2E6E7A" },
  { id: "electrical", label: "Electrical", icon: Zap, color: "#8A6D1F" },
  { id: "other", label: "Other", icon: CircleHelp, color: "#5A5F66" },
];

const FREQUENCIES = ["Constant", "Intermittent", "Only once", "Getting worse"];
const TIMES_OF_DAY = ["Morning", "Midday", "Evening", "No pattern"];
const SENSES = [
  { id: "see", label: "See", icon: Eye, prompt: "Indicator lights or dash messages?" },
  { id: "smell", label: "Smell", icon: Wind, prompt: "Smoke, vapors, or fumes?" },
  { id: "hear", label: "Hear", icon: Ear, prompt: "Any noises?" },
  { id: "feel", label: "Feel", icon: Waves, prompt: "Any vibrations?" },
];

const PROMISE_TIMES = [
  { code: "4", label: "Same Day Diag" },
  { code: "5", label: "Promise Time/Date Repair" },
  { code: "7", label: "Okay to Roll Over" },
];

const SEVERITIES = [
  { id: "routine", label: "Routine", dot: "#4C7A4C" },
  { id: "concerning", label: "Concerning", dot: "#B8871F" },
  { id: "safety", label: "Safety Issue", dot: "#C1443C" },
];

function genRO() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `RO-${n}`;
}
function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function emptySenses() {
  return { see: "", smell: "", hear: "", feel: "" };
}

export default function CheckInSync() {
  const [roNumber] = useState(genRO());
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [vehicle, setVehicle] = useState({ year: "", make: "", model: "", mileage: "" });

  // Personal inquiry (once per visit)
  const [personalOpen, setPersonalOpen] = useState(true);
  const [personal, setPersonal] = useState({
    primaryDriver: "",
    dailyUse: "",
    usualShop: "",
    longTermPlans: "",
    extendedWarranty: "unknown",
    warrantyDisclosure: "unknown", // "accept" | "decline" | "unknown"
    goalsExpectations: "",
    overnightOk: "unknown",
    promiseTimeCode: "",
    promiseDateTime: "",
  });

  // Additional items (once per visit)
  const [additional, setAdditional] = useState({
    courtesyInspection: "unknown",
    dviMentioned: false,
    shuttle: "unknown",
    beverage: "",
  });

  const [concerns, setConcerns] = useState([]);
  const [justSyncedId, setJustSyncedId] = useState(null);

  const [category, setCategory] = useState("noise");
  const [description, setDescription] = useState("");
  const [customerWords, setCustomerWords] = useState("");
  const [isCurrent, setIsCurrent] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [condition, setCondition] = useState("");
  const [roadConditions, setRoadConditions] = useState("");
  const [senses, setSenses] = useState(emptySenses());
  const [modified, setModified] = useState("");
  const [modificationDetail, setModificationDetail] = useState("");
  const [severity, setSeverity] = useState("routine");

  // Quick capture (voice or pasted text -> auto-summarized)
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const [justFilled, setJustFilled] = useState(false);
  const recognitionRef = useRef(null);
  const speechSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const descRef = useRef(null);

  function setSense(id, val) {
    setSenses((prev) => ({ ...prev, [id]: val }));
  }

  function resetConcernForm() {
    setCategory("noise");
    setDescription("");
    setCustomerWords("");
    setIsCurrent("");
    setDuration("");
    setFrequency("");
    setTimeOfDay("");
    setCondition("");
    setRoadConditions("");
    setSenses(emptySenses());
    setModified("");
    setModificationDetail("");
    setSeverity("routine");
    if (descRef.current) descRef.current.focus();
  }

  function addConcern() {
    if (!description.trim()) {
      if (descRef.current) descRef.current.focus();
      return;
    }
    const id = Date.now();
    const newConcern = {
      id,
      category,
      description: description.trim(),
      customerWords: customerWords.trim(),
      isCurrent,
      duration: duration.trim(),
      frequency,
      timeOfDay,
      condition: condition.trim(),
      roadConditions: roadConditions.trim(),
      senses: { ...senses },
      modified,
      modificationDetail: modificationDetail.trim(),
      severity,
      time: nowTime(),
    };
    setConcerns((prev) => [...prev, newConcern]);
    setJustSyncedId(id);
    setTimeout(() => setJustSyncedId((cur) => (cur === id ? null : cur)), 1400);
    resetConcernForm();
  }

  function removeConcern(id) {
    setConcerns((prev) => prev.filter((c) => c.id !== id));
  }

  const [copied, setCopied] = useState(false);
  const [copiedConcernId, setCopiedConcernId] = useState(null);
  const [copiedVisitNotes, setCopiedVisitNotes] = useState(false);

  // Plain, sentence-style text for a single "Customer Concern" field — no headers, brackets, or ALL CAPS tags.
  function buildConcernSentence(c) {
    const parts = [];
    parts.push(c.description.replace(/\.$/, ""));

    const detailBits = [];
    if (c.isCurrent === "yes") detailBits.push("currently happening");
    else if (c.isCurrent === "no") detailBits.push("not currently happening");
    if (c.duration) detailBits.push(`going on for ${c.duration}`);
    if (c.frequency) detailBits.push(c.frequency.toLowerCase());
    if (c.condition) detailBits.push(c.condition.toLowerCase());
    if (c.timeOfDay) detailBits.push(c.timeOfDay.toLowerCase());
    if (c.roadConditions) detailBits.push(c.roadConditions.toLowerCase());
    if (detailBits.length) parts[0] += ` — ${detailBits.join(", ")}`;
    parts[0] += ".";

    const senseParts = SENSES.filter((s) => c.senses[s.id]).map((s) => `${s.label.toLowerCase()}: ${c.senses[s.id]}`);
    if (senseParts.length) parts.push(senseParts.join("; ") + ".");

    if (c.modified === "yes") parts.push(`Vehicle has modifications${c.modificationDetail ? `: ${c.modificationDetail}` : ""}.`);

    if (c.customerWords) parts.push(`Customer's words: "${c.customerWords}"`);

    if (c.severity === "safety") parts.push("Flagged as a safety concern.");
    else if (c.severity === "concerning") parts.push("Advisor flagged this as worth a closer look.");

    return parts.join(" ");
  }

  function buildConcernText(c) {
    return buildConcernSentence(c);
  }

  const [manualCopyText, setManualCopyText] = useState(null);
  const manualCopyRef = useRef(null);

  useEffect(() => {
    if (manualCopyText !== null && manualCopyRef.current) {
      manualCopyRef.current.focus();
      manualCopyRef.current.select();
    }
  }, [manualCopyText]);

  async function copyText(text, onDone) {
    // The artifact preview can silently block clipboard access (same sandbox
    // restriction as the microphone) even when the browser API reports success.
    // So always surface a visible, pre-selected fallback box alongside the
    // "Copied" confirmation — that guarantees the advisor can get the text
    // out one way or another.
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        // ignore — manual fallback box below covers this either way
      }
      document.body.removeChild(ta);
    }
    onDone();
    setManualCopyText(text);
  }

  function copyConcern(c) {
    copyText(buildConcernText(c), () => {
      setCopiedConcernId(c.id);
      setTimeout(() => setCopiedConcernId((cur) => (cur === c.id ? null : cur)), 2000);
    });
  }

  // All concerns as clean prose, one per line — meant for Tekmetric's single Customer Concern field.
  function buildTekmetricText() {
    if (concerns.length === 0) return "";
    return concerns.map((c) => buildConcernSentence(c)).join("\n\n");
  }

  // Visit notes (personal inquiry + additional items) — separate from Customer Concern,
  // since these usually belong in a different Tekmetric field (customer/RO notes).
  function buildVisitNotesText() {
    const lines = [];
    if (personal.primaryDriver) lines.push(`Primary driver: ${personal.primaryDriver}`);
    if (personal.dailyUse) lines.push(`Daily use: ${personal.dailyUse}`);
    if (personal.usualShop) lines.push(`Usually serviced at: ${personal.usualShop}`);
    if (personal.longTermPlans) lines.push(`Long-term plans: ${personal.longTermPlans}`);
    if (personal.goalsExpectations) lines.push(`Goals & expectations for this visit: ${personal.goalsExpectations}`);
    if (personal.extendedWarranty !== "unknown") {
      lines.push(`Extended warranty: ${personal.extendedWarranty === "yes" ? "Yes" : "No"}`);
      if (personal.extendedWarranty === "yes" && personal.warrantyDisclosure !== "unknown") {
        lines.push(
          `Diag/labor responsibility if warranty doesn't cover repairs — customer ${
            personal.warrantyDisclosure === "accept" ? "accepted" : "declined"
          } this disclosure`
        );
      }
    }
    if (personal.overnightOk !== "unknown") lines.push(`OK to keep vehicle overnight pending authorization/parts: ${personal.overnightOk === "yes" ? "Yes" : "No"}`);
    if (personal.promiseTimeCode) {
      const pt = PROMISE_TIMES.find((p) => p.code === personal.promiseTimeCode);
      lines.push(`Promise time: ${pt ? `${pt.code} - ${pt.label}` : personal.promiseTimeCode}${personal.promiseDateTime ? ` (${personal.promiseDateTime})` : ""}`);
    }
    if (additional.courtesyInspection !== "unknown") lines.push(`Courtesy inspection: ${additional.courtesyInspection === "yes" ? "Yes" : "No"}`);
    if (additional.dviMentioned) lines.push("DVI process explained: Yes");
    if (additional.shuttle !== "unknown") lines.push(`Shuttle: ${additional.shuttle === "yes" ? "Yes" : "No"}`);
    if (additional.beverage) lines.push(`Beverage: ${additional.beverage}`);
    return lines.join("\n");
  }

  function copyVisitNotes() {
    const text = buildVisitNotesText();
    if (!text) return;
    copyText(text, () => {
      setCopiedVisitNotes(true);
      setTimeout(() => setCopiedVisitNotes(false), 2000);
    });
  }

  async function copyForTekmetric() {
    const text = buildTekmetricText();
    copyText(text, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function startRecording() {
    setCaptureError("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setCaptureError("Voice capture isn't supported in this browser — type or paste below instead.");
      return;
    }
    try {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      let finalText = transcript ? transcript + " " : "";

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += chunk + " ";
          } else {
            interim += chunk;
          }
        }
        setTranscript(finalText + interim);
      };
      recognition.onerror = (event) => {
        setCaptureError(
          event.error === "not-allowed"
            ? "Microphone access was blocked. Type or paste what the customer said instead."
            : "Voice capture stopped unexpectedly — type or paste instead."
        );
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      setCaptureError("Couldn't start voice capture. Type or paste what the customer said instead.");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  }

  async function summarizeTranscript() {
    if (!transcript.trim()) return;
    setIsSummarizing(true);
    setCaptureError("");
    try {
      const categoryIds = CATEGORIES.map((c) => c.id).join(", ");
      const freqOptions = FREQUENCIES.join(", ");
      const timeOptions = TIMES_OF_DAY.join(", ");

      // Access code (only enforced when ACCESS_CODE is set on the server).
      let accessCode = "";
      try { accessCode = sessionStorage.getItem("accessCode") || ""; } catch (e) {}
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are helping an auto repair service advisor turn a customer's spoken check-in conversation into a structured intake record. Read the transcript and extract fields. The conversation may cover BOTH the vehicle's mechanical problem AND general questions about the customer/vehicle use — extract whichever is actually present, leave the rest as empty strings. Respond with ONLY raw JSON, no markdown fences, no preamble, matching exactly this shape:

{
  "category": one of [${categoryIds}] (best fit for the mechanical concern, if any),
  "description": a short, technician-facing summary of the problem (plain, factual, no fluff; empty string if no mechanical concern was mentioned),
  "customerWords": the most telling short quote or paraphrase capturing how the customer described the problem, in their own words as spoken (empty string if none),
  "isCurrent": "yes" if the customer said the problem is happening right now / currently active, "no" if they said it's not currently happening, else "",
  "duration": how long they've experienced the problem, as stated (empty string if not mentioned),
  "frequency": one of [${freqOptions}] if it clearly matches, else empty string,
  "timeOfDay": one of [${timeOptions}] if it clearly matches, else empty string,
  "condition": what they were doing when the problem happens/started (empty string if not mentioned),
  "roadConditions": the type of road, weather, or driving conditions mentioned (empty string if not mentioned),
  "senses": { "see": string or "", "smell": string or "", "hear": string or "", "feel": string or "" } — fill only senses actually mentioned about the mechanical problem,
  "modified": "yes" if the customer mentioned any vehicle modification (deleted emissions, tuned, engine swap, etc.), "no" if they said there are none, else "",
  "modificationDetail": what modification was mentioned, if any (empty string if none),
  "severity": one of "routine", "concerning", "safety" (use "safety" only if there's a real safety implication like brakes, steering, smoke, or a red warning light),
  "primaryDriver": who mainly drives the vehicle, as stated (empty string if not mentioned),
  "dailyUse": how they use the vehicle day to day, as stated (empty string if not mentioned),
  "usualShop": where they usually get it serviced, as stated (empty string if not mentioned),
  "longTermPlans": their long-term plans for the vehicle, as stated (empty string if not mentioned),
  "goalsExpectations": what the customer said they want out of this visit (a diagnosis only, a same-day fix, just an estimate, etc.), empty string if not mentioned,
  "extendedWarranty": "yes", "no", or "" if they didn't say whether they have an extended warranty,
  "courtesyInspection": "yes" if the customer agreed to a courtesy inspection, "no" if declined, else "",
  "dviMentioned": true if the advisor explained the Digital Vehicle Inspection process to the customer, else false,
  "shuttle": "yes" if the customer agreed to the courtesy shuttle, "no" if declined, else "",
  "beverage": what drink the customer asked for, if any (empty string if not mentioned or declined)
}

Transcript:
"""${transcript.trim()}"""`,
            },
          ],
        }),
      });
      if (response.status === 401) {
        const entered = window.prompt("Enter the shop access code:");
        try { sessionStorage.setItem("accessCode", entered || ""); } catch (e) {}
        throw new Error("Access code needed — click Summarize again");
      }
      const data = await response.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      if (!textBlock) throw new Error("No response");
      const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      setCategory(CATEGORIES.some((c) => c.id === parsed.category) ? parsed.category : "other");
      setDescription(parsed.description || "");
      setCustomerWords(parsed.customerWords || "");
      setIsCurrent(parsed.isCurrent === "yes" || parsed.isCurrent === "no" ? parsed.isCurrent : "");
      setDuration(parsed.duration || "");
      setFrequency(FREQUENCIES.includes(parsed.frequency) ? parsed.frequency : "");
      setTimeOfDay(TIMES_OF_DAY.includes(parsed.timeOfDay) ? parsed.timeOfDay : "");
      setCondition(parsed.condition || "");
      setRoadConditions(parsed.roadConditions || "");
      setSenses({
        see: parsed.senses?.see || "",
        smell: parsed.senses?.smell || "",
        hear: parsed.senses?.hear || "",
        feel: parsed.senses?.feel || "",
      });
      setModified(parsed.modified === "yes" || parsed.modified === "no" ? parsed.modified : "");
      setModificationDetail(parsed.modificationDetail || "");
      setSeverity(["routine", "concerning", "safety"].includes(parsed.severity) ? parsed.severity : "routine");

      // Merge personal inquiry: only fill fields the transcript actually answered,
      // and don't clobber anything the advisor already typed in manually.
      // Note: warranty disclosure accept/decline, overnight authorization, and promise
      // time are intentionally NOT auto-filled — those are deliberate advisor/customer
      // decisions, not something to infer from a transcript.
      setPersonal((prev) => ({
        ...prev,
        primaryDriver: prev.primaryDriver || parsed.primaryDriver || "",
        dailyUse: prev.dailyUse || parsed.dailyUse || "",
        usualShop: prev.usualShop || parsed.usualShop || "",
        longTermPlans: prev.longTermPlans || parsed.longTermPlans || "",
        goalsExpectations: prev.goalsExpectations || parsed.goalsExpectations || "",
        extendedWarranty:
          prev.extendedWarranty !== "unknown"
            ? prev.extendedWarranty
            : parsed.extendedWarranty === "yes" || parsed.extendedWarranty === "no"
            ? parsed.extendedWarranty
            : "unknown",
      }));
      const personalFilled =
        parsed.primaryDriver || parsed.dailyUse || parsed.usualShop || parsed.longTermPlans || parsed.extendedWarranty || parsed.goalsExpectations;
      if (personalFilled) setPersonalOpen(true);

      // Merge additional items the same way: fill blanks only, never overwrite
      // something the advisor already set by hand.
      setAdditional((prev) => ({
        courtesyInspection:
          prev.courtesyInspection !== "unknown"
            ? prev.courtesyInspection
            : parsed.courtesyInspection === "yes" || parsed.courtesyInspection === "no"
            ? parsed.courtesyInspection
            : "unknown",
        dviMentioned: prev.dviMentioned || !!parsed.dviMentioned,
        shuttle:
          prev.shuttle !== "unknown"
            ? prev.shuttle
            : parsed.shuttle === "yes" || parsed.shuttle === "no"
            ? parsed.shuttle
            : "unknown",
        beverage: prev.beverage || parsed.beverage || "",
      }));

      setJustFilled(true);
      setTimeout(() => setJustFilled(false), 2000);
      if (descRef.current) descRef.current.focus();
    } catch (err) {
      setCaptureError("Couldn't summarize that — try again, or fill the fields in below manually.");
    } finally {
      setIsSummarizing(false);
    }
  }

  const vehicleLabel =
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle not entered";

  const activeSenseCount = Object.values(senses).filter((v) => v.trim()).length;

  const yesNoBtn = (value, current, onClick, label) => (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded text-xs font-semibold border"
      style={{
        borderColor: current === value ? "#E8A33D" : "#D8D2C4",
        background: current === value ? "#FCF0DC" : "#fff",
        color: current === value ? "#8A5A2E" : "#5A5F66",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#EFEBE2",
        minHeight: "100%",
        color: "#23272B",
      }}
    >
      <style>{`
        ${FONT_IMPORT}
        .cba-display { font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.01em; }
        .cba-mono { font-family: 'JetBrains Mono', monospace; }
        .concern-enter { animation: slideIn 0.4s ease-out; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .sync-pulse { animation: pulseGlow 1.4s ease-out; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(76,122,76,0.45); }
          70% { box-shadow: 0 0 0 10px rgba(76,122,76,0); }
          100% { box-shadow: 0 0 0 0 rgba(76,122,76,0); }
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(232,163,61,0.35);
          border-color: #E8A33D !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .concern-enter, .sync-pulse { animation: none; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{ background: "#1C2126" }}
        className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <div
            style={{ background: "#E8A33D" }}
            className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
          >
            <ClipboardList size={20} color="#1C2126" strokeWidth={2.5} />
          </div>
          <div>
            <div className="cba-display text-white text-xl leading-none" style={{ fontWeight: 600 }}>
              CHECK-IN &rarr; REPAIR ORDER
            </div>
            <div className="text-xs" style={{ color: "#8A93A0" }}>
              Built around your Mechanical &amp; Personal Inquiry check-in questions
            </div>
          </div>
        </div>
        <div
          className="cba-mono px-3 py-1.5 rounded text-sm"
          style={{ background: "#2E4057", color: "#F7F4EF" }}
        >
          {roNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* LEFT: Check-in form */}
        <div className="p-5 lg:border-r" style={{ borderColor: "#D8D2C4" }}>
          <div className="cba-display text-lg mb-3" style={{ color: "#1C2126", fontWeight: 600 }}>
            CUSTOMER &amp; VEHICLE
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Customer name</label>
              <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Jane Thibodeaux" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Phone</label>
              <input type="text" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="(337) 555-0142" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Year</label>
              <input type="text" value={vehicle.year} onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                placeholder="2019" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Mileage</label>
              <input type="text" value={vehicle.mileage} onChange={(e) => setVehicle({ ...vehicle, mileage: e.target.value })}
                placeholder="87,412" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Make</label>
              <input type="text" value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                placeholder="Toyota" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Model</label>
              <input type="text" value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                placeholder="4Runner" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>
          </div>

          {/* Quick Capture: voice or pasted text -> auto-fill everything below */}
          <div className="mb-5 p-3 rounded-lg" style={{ background: "#EEF1F4", border: "1px solid #D8DEE6" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="cba-display text-sm flex items-center gap-1.5" style={{ color: "#2E4057", fontWeight: 600 }}>
                <Sparkles size={14} />
                QUICK CAPTURE
              </div>
              {speechSupported ? (
                isRecording ? (
                  <button onClick={stopRecording}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
                    style={{ background: "#C1443C", color: "#fff" }}>
                    <Square size={11} fill="#fff" /> Stop
                  </button>
                ) : (
                  <button onClick={startRecording}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
                    style={{ background: "#2E4057", color: "#fff" }}>
                    <Mic size={12} /> Record
                  </button>
                )
              ) : null}
            </div>

            <div className="text-xs mb-2" style={{ color: "#5A5F66" }}>
              Record the check-in conversation once, then Summarize fills in Personal Inquiry above and the concern fields below.
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                speechSupported
                  ? "Hit Record and let the conversation happen naturally — problem, driver, daily use, whatever comes up. Or type/paste it here."
                  : "Voice capture isn't supported in this browser — type or paste the conversation here (the problem, who drives it, daily use — whatever came up)."
              }
              rows={3}
              className="w-full px-3 py-2 rounded border text-sm bg-white mb-2"
              style={{ borderColor: isRecording ? "#C1443C" : "#D8D2C4" }}
            />

            {isRecording && (
              <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "#C1443C" }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: "#C1443C", display: "inline-block" }} className="sync-pulse" />
                Listening...
              </div>
            )}
            {captureError && (
              <div className="text-xs mb-2" style={{ color: "#C1443C" }}>{captureError}</div>
            )}
            {justFilled && (
              <div className="flex items-center gap-1.5 text-xs mb-2 font-semibold" style={{ color: "#4C7A4C" }}>
                <CheckCircle2 size={12} /> Personal Inquiry and concern fields filled in — check them over before adding
              </div>
            )}

            <button
              onClick={summarizeTranscript}
              disabled={!transcript.trim() || isSummarizing}
              className="w-full flex items-center justify-center gap-2 py-2 rounded font-semibold text-xs"
              style={{
                background: !transcript.trim() || isSummarizing ? "#B8C0CC" : "#E8A33D",
                color: !transcript.trim() || isSummarizing ? "#fff" : "#1C2126",
                cursor: !transcript.trim() || isSummarizing ? "default" : "pointer",
              }}
            >
              {isSummarizing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Summarizing...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Summarize into concern + personal inquiry
                </>
              )}
            </button>
          </div>

          {/* Personal Inquiry - collapsible, once per visit */}
          <button
            onClick={() => setPersonalOpen((o) => !o)}
            className="w-full flex items-center justify-between py-2 mb-2 border-t border-b"
            style={{ borderColor: "#D8D2C4" }}
          >
            <span className="cba-display text-base" style={{ color: "#1C2126", fontWeight: 600 }}>
              PERSONAL INQUIRY <span className="text-xs font-normal" style={{ color: "#8A93A0", fontFamily: "'Inter', sans-serif" }}>(once per visit)</span>
            </span>
            {personalOpen ? <ChevronUp size={16} color="#5A5F66" /> : <ChevronDown size={16} color="#5A5F66" />}
          </button>
          {personalOpen && (
            <div className="mb-5 flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Who is the primary driver?</label>
                <input type="text" value={personal.primaryDriver} onChange={(e) => setPersonal({ ...personal, primaryDriver: e.target.value })}
                  placeholder="Self, spouse, teenage driver..." className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>How do they use the vehicle daily?</label>
                <input type="text" value={personal.dailyUse} onChange={(e) => setPersonal({ ...personal, dailyUse: e.target.value })}
                  placeholder="Commute, towing, short trips, road trips..." className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Where do they usually take it for service?</label>
                <input type="text" value={personal.usualShop} onChange={(e) => setPersonal({ ...personal, usualShop: e.target.value })}
                  placeholder="Dealer, us, another local shop..." className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Long-term plans for the vehicle?</label>
                <input type="text" value={personal.longTermPlans} onChange={(e) => setPersonal({ ...personal, longTermPlans: e.target.value })}
                  placeholder="Keep for years, trade in soon, pass to kid..." className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1 flex items-center gap-1" style={{ color: "#5A5F66" }}>
                  <Target size={13} /> Goals &amp; expectations for this visit?
                </label>
                <input type="text" value={personal.goalsExpectations} onChange={(e) => setPersonal({ ...personal, goalsExpectations: e.target.value })}
                  placeholder="Just a diagnosis, fix today if possible, get a quote..." className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium" style={{ color: "#5A5F66" }}>Extended warranty?</label>
                  <div className="flex gap-1.5">
                    {yesNoBtn("yes", personal.extendedWarranty, () => setPersonal({ ...personal, extendedWarranty: "yes" }), "Yes")}
                    {yesNoBtn("no", personal.extendedWarranty, () => setPersonal({ ...personal, extendedWarranty: "no" }), "No")}
                  </div>
                </div>
                {personal.extendedWarranty === "yes" && (
                  <div className="mt-2 p-2.5 rounded" style={{ background: "#FCF0DC", border: "1px solid #E8A33D" }}>
                    <div className="flex items-start gap-1.5 text-xs mb-2" style={{ color: "#8A5A2E" }}>
                      <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                      <span>If the warranty doesn't cover the repairs, customer is responsible for all diag/labor.</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPersonal({ ...personal, warrantyDisclosure: "accept" })}
                        className="flex-1 py-1.5 rounded text-xs font-semibold border"
                        style={{ borderColor: personal.warrantyDisclosure === "accept" ? "#4C7A4C" : "#D8D2C4", background: personal.warrantyDisclosure === "accept" ? "#E9F1E9" : "#fff", color: personal.warrantyDisclosure === "accept" ? "#4C7A4C" : "#5A5F66" }}>
                        Accept
                      </button>
                      <button onClick={() => setPersonal({ ...personal, warrantyDisclosure: "decline" })}
                        className="flex-1 py-1.5 rounded text-xs font-semibold border"
                        style={{ borderColor: personal.warrantyDisclosure === "decline" ? "#C1443C" : "#D8D2C4", background: personal.warrantyDisclosure === "decline" ? "#FBE4E1" : "#fff", color: personal.warrantyDisclosure === "decline" ? "#C1443C" : "#5A5F66" }}>
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium flex items-center gap-1" style={{ color: "#5A5F66" }}>
                  <Moon size={13} /> OK to keep vehicle overnight pending authorization/parts?
                </label>
                <div className="flex gap-1.5">
                  {yesNoBtn("yes", personal.overnightOk, () => setPersonal({ ...personal, overnightOk: "yes" }), "Yes")}
                  {yesNoBtn("no", personal.overnightOk, () => setPersonal({ ...personal, overnightOk: "no" }), "No")}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5 flex items-center gap-1" style={{ color: "#5A5F66" }}>
                  <CalendarClock size={13} /> Promise time
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PROMISE_TIMES.map((p) => {
                    const active = personal.promiseTimeCode === p.code;
                    return (
                      <button key={p.code} onClick={() => setPersonal({ ...personal, promiseTimeCode: active ? "" : p.code })}
                        className="px-2.5 py-1.5 rounded text-xs border font-medium"
                        style={{ borderColor: active ? "#E8A33D" : "#D8D2C4", background: active ? "#FCF0DC" : "#fff", color: active ? "#8A5A2E" : "#5A5F66" }}>
                        {p.code} — {p.label}
                      </button>
                    );
                  })}
                </div>
                {personal.promiseTimeCode === "5" && (
                  <input type="text" value={personal.promiseDateTime} onChange={(e) => setPersonal({ ...personal, promiseDateTime: e.target.value })}
                    placeholder="Promise date/time, e.g. Thursday 3pm" className="w-full px-3 py-2 rounded border text-sm bg-white" style={{ borderColor: "#D8D2C4" }} />
                )}
              </div>
            </div>
          )}

          {/* Additional items */}
          <div className="mb-5 p-3 rounded-lg" style={{ background: "#F7F4EF", border: "1px solid #E5E0D5" }}>
            <div className="cba-display text-sm mb-2" style={{ color: "#1C2126", fontWeight: 600 }}>ADDITIONAL ITEMS</div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: "#5A5F66" }}><Search size={13} /> Courtesy inspection?</span>
                <div className="flex gap-1.5">
                  {yesNoBtn("yes", additional.courtesyInspection, () => setAdditional({ ...additional, courtesyInspection: "yes" }), "Yes")}
                  {yesNoBtn("no", additional.courtesyInspection, () => setAdditional({ ...additional, courtesyInspection: "no" }), "No")}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: "#5A5F66" }}><FileText size={13} /> DVI process explained?</span>
                <button
                  onClick={() => setAdditional({ ...additional, dviMentioned: !additional.dviMentioned })}
                  className="px-2.5 py-1 rounded text-xs font-semibold border"
                  style={{
                    borderColor: additional.dviMentioned ? "#4C7A4C" : "#D8D2C4",
                    background: additional.dviMentioned ? "#E9F1E9" : "#fff",
                    color: additional.dviMentioned ? "#4C7A4C" : "#5A5F66",
                  }}
                >
                  {additional.dviMentioned ? "Explained ✓" : "Mark done"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: "#5A5F66" }}><Truck size={13} /> Courtesy shuttle?</span>
                <div className="flex gap-1.5">
                  {yesNoBtn("yes", additional.shuttle, () => setAdditional({ ...additional, shuttle: "yes" }), "Yes")}
                  {yesNoBtn("no", additional.shuttle, () => setAdditional({ ...additional, shuttle: "no" }), "No")}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs flex items-center gap-1.5 flex-shrink-0" style={{ color: "#5A5F66" }}><Coffee size={13} /> Beverage</span>
                <input type="text" value={additional.beverage} onChange={(e) => setAdditional({ ...additional, beverage: e.target.value })}
                  placeholder="Coffee, water, soda, none" className="px-2 py-1 rounded border text-xs bg-white text-right" style={{ borderColor: "#D8D2C4", width: "140px" }} />
              </div>
            </div>
          </div>

          <div className="cba-display text-lg mb-3" style={{ color: "#1C2126", fontWeight: 600 }}>
            LOG A CONCERN
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.id;
              return (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center justify-center gap-1 py-2 rounded border text-xs font-medium transition"
                  style={{ borderColor: active ? cat.color : "#D8D2C4", background: active ? cat.color : "#fff", color: active ? "#fff" : "#5A5F66" }}>
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Description for the technician</label>
          <textarea ref={descRef} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grinding noise from front left when braking below 15mph" rows={2}
            className="w-full px-3 py-2 rounded border text-sm bg-white mb-3" style={{ borderColor: "#D8D2C4" }} />

          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>
            Customer's exact words <span style={{ fontWeight: 400 }}>(optional, but techs like it)</span>
          </label>
          <div className="relative mb-4">
            <Quote size={13} className="absolute left-3 top-2.5" style={{ color: "#B8AF9E" }} />
            <input type="text" value={customerWords} onChange={(e) => setCustomerWords(e.target.value)}
              placeholder='"It sounds like metal on metal when I stop"'
              className="w-full pl-8 pr-3 py-2 rounded border text-sm bg-white italic" style={{ borderColor: "#D8D2C4" }} />
          </div>

          {/* Mechanical Inquiry block */}
          <div className="mb-4 p-3 rounded-lg" style={{ background: "#F7F4EF", border: "1px solid #E5E0D5" }}>
            <div className="cba-display text-sm mb-2" style={{ color: "#1C2126", fontWeight: 600 }}>MECHANICAL INQUIRY</div>

            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-semibold flex items-center gap-1" style={{ color: "#8A5A2E" }}>
                <Activity size={12} /> Is it happening right now?
              </label>
              <div className="flex gap-1.5">
                {yesNoBtn("yes", isCurrent, () => setIsCurrent(isCurrent === "yes" ? "" : "yes"), "Yes")}
                {yesNoBtn("no", isCurrent, () => setIsCurrent(isCurrent === "no" ? "" : "no"), "No")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "#8A5A2E" }}>DURATION — how long?</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                  placeholder="2 weeks, since Tuesday..." className="w-full px-2.5 py-1.5 rounded border text-xs bg-white" style={{ borderColor: "#D8D2C4" }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "#8A5A2E" }}>FREQUENCY — how often?</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border text-xs bg-white" style={{ borderColor: "#D8D2C4" }}>
                  <option value="">Select...</option>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-2.5">
              <label className="text-[11px] font-semibold block mb-1" style={{ color: "#8A5A2E" }}>TIME — what time of day?</label>
              <div className="flex flex-wrap gap-1.5">
                {TIMES_OF_DAY.map((t) => {
                  const active = timeOfDay === t;
                  return (
                    <button key={t} onClick={() => setTimeOfDay(active ? "" : t)}
                      className="px-2.5 py-1 rounded-full text-[11px] border"
                      style={{ borderColor: active ? "#E8A33D" : "#D8D2C4", background: active ? "#FCF0DC" : "#fff", color: active ? "#8A5A2E" : "#5A5F66", fontWeight: active ? 600 : 500 }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-2.5">
              <label className="text-[11px] font-semibold block mb-1" style={{ color: "#8A5A2E" }}>CONDITION — what were they doing when it started?</label>
              <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)}
                placeholder="Accelerating from a stop, on the highway..." className="w-full px-2.5 py-1.5 rounded border text-xs bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>

            <div className="mb-2.5">
              <label className="text-[11px] font-semibold block mb-1 flex items-center gap-1" style={{ color: "#8A5A2E" }}>
                <CloudSun size={12} /> ROAD / WEATHER / DRIVING CONDITIONS
              </label>
              <input type="text" value={roadConditions} onChange={(e) => setRoadConditions(e.target.value)}
                placeholder="Highway, rain, gravel, city stop-and-go..." className="w-full px-2.5 py-1.5 rounded border text-xs bg-white" style={{ borderColor: "#D8D2C4" }} />
            </div>

            <div className="mb-2.5">
              <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "#8A5A2E" }}>SENSES</label>
              <div className="flex flex-col gap-1.5">
                {SENSES.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-medium flex-shrink-0" style={{ color: "#5A5F66", width: "62px" }}>
                        <Icon size={12} /> {s.label}
                      </div>
                      <input type="text" value={senses[s.id]} onChange={(e) => setSense(s.id, e.target.value)}
                        placeholder={s.prompt} className="flex-1 px-2 py-1 rounded border text-xs bg-white" style={{ borderColor: "#D8D2C4" }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold flex items-center gap-1" style={{ color: "#8A5A2E" }}>
                  <Wrench size={12} /> Any modifications? (deleted, tuned, engine swap, etc.)
                </label>
                <div className="flex gap-1.5">
                  {yesNoBtn("yes", modified, () => setModified(modified === "yes" ? "" : "yes"), "Yes")}
                  {yesNoBtn("no", modified, () => setModified(modified === "no" ? "" : "no"), "No")}
                </div>
              </div>
              {modified === "yes" && (
                <input type="text" value={modificationDetail} onChange={(e) => setModificationDetail(e.target.value)}
                  placeholder="What was modified..." className="w-full px-2.5 py-1.5 rounded border text-xs bg-white" style={{ borderColor: "#D8D2C4" }} />
              )}
            </div>
          </div>

          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5F66" }}>Severity</label>
          <div className="flex gap-2 mb-5">
            {SEVERITIES.map((sev) => {
              const active = severity === sev.id;
              return (
                <button key={sev.id} onClick={() => setSeverity(sev.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold"
                  style={{ borderColor: active ? sev.dot : "#D8D2C4", background: "#fff", color: active ? "#23272B" : "#5A5F66", boxShadow: active ? `inset 0 0 0 1px ${sev.dot}` : "none" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: sev.dot, display: "inline-block" }} />
                  {sev.label}
                </button>
              );
            })}
          </div>

          <button onClick={addConcern}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm"
            style={{ background: "#1C2126", color: "#fff" }}>
            <Plus size={16} />
            Add concern to repair order
          </button>
        </div>

        {/* RIGHT: Repair order (synced view) */}
        <div className="p-5" style={{ background: "#FAF8F3" }}>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px dashed #B8AF9E", background: "#fff" }}>
            <div className="p-4" style={{ background: "#2E4057" }}>
              <div className="flex items-center justify-between">
                <div className="cba-display text-white text-lg" style={{ fontWeight: 600 }}>REPAIR ORDER</div>
                <div className="cba-mono text-xs px-2 py-1 rounded" style={{ background: "#1C2126", color: "#E8A33D" }}>{roNumber}</div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs flex-wrap" style={{ color: "#C7CDD6" }}>
                <span className="flex items-center gap-1"><User size={12} /> {customer.name || "—"}</span>
                <span className="flex items-center gap-1"><Car size={12} /> {vehicleLabel}{vehicle.mileage ? ` · ${vehicle.mileage} mi` : ""}</span>
              </div>
            </div>

            {/* Visit notes strip: personal inquiry + additional items, synced too */}
            {(personal.primaryDriver || personal.dailyUse || personal.usualShop || personal.longTermPlans || personal.goalsExpectations || personal.overnightOk !== "unknown" || personal.promiseTimeCode || additional.beverage || additional.dviMentioned || additional.courtesyInspection !== "unknown" || additional.shuttle !== "unknown") && (
              <div className="px-4 pt-3 pb-1 text-xs" style={{ borderBottom: "1px solid #EFEBE2" }}>
                <div className="cba-display mb-1.5" style={{ color: "#8A93A0", fontWeight: 600, letterSpacing: "0.03em" }}>VISIT NOTES</div>
                <div className="flex flex-col gap-1 mb-2" style={{ color: "#5A5F66" }}>
                  {personal.primaryDriver && <div>Primary driver: <span style={{ color: "#23272B" }}>{personal.primaryDriver}</span></div>}
                  {personal.dailyUse && <div>Daily use: <span style={{ color: "#23272B" }}>{personal.dailyUse}</span></div>}
                  {personal.usualShop && <div>Usually serviced at: <span style={{ color: "#23272B" }}>{personal.usualShop}</span></div>}
                  {personal.longTermPlans && <div>Long-term plans: <span style={{ color: "#23272B" }}>{personal.longTermPlans}</span></div>}
                  {personal.goalsExpectations && <div>Goals &amp; expectations: <span style={{ color: "#23272B" }}>{personal.goalsExpectations}</span></div>}
                  {personal.extendedWarranty !== "unknown" && (
                    <div>
                      Extended warranty: <span style={{ color: "#23272B" }}>{personal.extendedWarranty === "yes" ? "Yes" : "No"}</span>
                      {personal.extendedWarranty === "yes" && personal.warrantyDisclosure !== "unknown" && (
                        <span style={{ color: personal.warrantyDisclosure === "accept" ? "#4C7A4C" : "#C1443C" }}>
                          {" "}· diag/labor disclosure {personal.warrantyDisclosure === "accept" ? "accepted" : "declined"}
                        </span>
                      )}
                    </div>
                  )}
                  {personal.overnightOk !== "unknown" && <div>Overnight OK: <span style={{ color: "#23272B" }}>{personal.overnightOk === "yes" ? "Yes" : "No"}</span></div>}
                  {personal.promiseTimeCode && (
                    <div>
                      Promise time: <span style={{ color: "#23272B" }}>
                        {personal.promiseTimeCode} — {PROMISE_TIMES.find((p) => p.code === personal.promiseTimeCode)?.label}
                        {personal.promiseDateTime ? ` (${personal.promiseDateTime})` : ""}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {additional.courtesyInspection !== "unknown" && (
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#EEF1F4", color: "#2E4057" }}>Courtesy inspection: {additional.courtesyInspection === "yes" ? "Yes" : "No"}</span>
                  )}
                  {additional.dviMentioned && <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#E9F1E9", color: "#4C7A4C" }}>DVI explained</span>}
                  {additional.shuttle !== "unknown" && (
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#EEF1F4", color: "#2E4057" }}>Shuttle: {additional.shuttle === "yes" ? "Yes" : "No"}</span>
                  )}
                  {additional.beverage && <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#FCF0DC", color: "#8A5A2E" }}>Beverage: {additional.beverage}</span>}
                </div>
              </div>
            )}

            <div className="p-4">
              {concerns.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <ClipboardList size={28} className="mx-auto mb-2" style={{ color: "#D8D2C4" }} />
                  <div className="text-sm" style={{ color: "#8A93A0" }}>
                    Concerns logged on the left will land here in real time — this is exactly what the technician sees.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {concerns.map((c, idx) => {
                    const cat = CATEGORIES.find((x) => x.id === c.category);
                    const Icon = cat.icon;
                    const synced = justSyncedId === c.id;
                    const senseEntries = SENSES.filter((s) => c.senses[s.id]);
                    return (
                      <div key={c.id} className={`concern-enter ${synced ? "sync-pulse" : ""} rounded-lg p-3 relative`}
                        style={{ border: `1px solid #E5E0D5`, background: "#FDFCF9" }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cat.color + "1A" }}>
                              <Icon size={14} color={cat.color} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold cba-display" style={{ color: "#1C2126", letterSpacing: "0.02em" }}>
                                  {idx + 1}. {cat.label.toUpperCase()}
                                </span>
                                {c.severity === "safety" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#FBE4E1", color: "#C1443C" }}>
                                    <ShieldAlert size={10} /> SAFETY
                                  </span>
                                )}
                              </div>
                              <div className="text-sm mt-0.5" style={{ color: "#23272B" }}>{c.description}</div>
                              {c.customerWords && (
                                <div className="text-xs italic mt-1 flex items-start gap-1" style={{ color: "#8A5A2E" }}>
                                  <Quote size={10} className="mt-0.5 flex-shrink-0" />{c.customerWords}
                                </div>
                              )}

                              {(c.isCurrent || c.duration || c.frequency || c.timeOfDay || c.condition || c.roadConditions) && (
                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2 text-[11px]" style={{ color: "#5A5F66" }}>
                                  {c.isCurrent && <div><span style={{ fontWeight: 600, color: "#8A5A2E" }}>Currently happening:</span> {c.isCurrent === "yes" ? "Yes" : "No"}</div>}
                                  {c.duration && <div><span style={{ fontWeight: 600, color: "#8A5A2E" }}>Duration:</span> {c.duration}</div>}
                                  {c.frequency && <div><span style={{ fontWeight: 600, color: "#8A5A2E" }}>Frequency:</span> {c.frequency}</div>}
                                  {c.timeOfDay && <div><span style={{ fontWeight: 600, color: "#8A5A2E" }}>Time:</span> {c.timeOfDay}</div>}
                                  {c.condition && <div className="col-span-2"><span style={{ fontWeight: 600, color: "#8A5A2E" }}>Condition:</span> {c.condition}</div>}
                                  {c.roadConditions && <div className="col-span-2"><span style={{ fontWeight: 600, color: "#8A5A2E" }}>Road/weather:</span> {c.roadConditions}</div>}
                                </div>
                              )}

                              {senseEntries.length > 0 && (
                                <div className="flex flex-col gap-0.5 mt-1.5">
                                  {senseEntries.map((s) => {
                                    const SIcon = s.icon;
                                    return (
                                      <div key={s.id} className="flex items-center gap-1 text-[11px]" style={{ color: "#2E4057" }}>
                                        <SIcon size={10} /> <span style={{ fontWeight: 600 }}>{s.label}:</span> {c.senses[s.id]}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {c.modified === "yes" && (
                                <div className="flex items-center gap-1 text-[11px] mt-1.5" style={{ color: "#8A5A2E" }}>
                                  <Wrench size={10} /> <span style={{ fontWeight: 600 }}>Modified:</span> {c.modificationDetail || "Yes"}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="flex items-center gap-1 text-[10px]" style={{ color: "#8A93A0" }}><Clock size={10} /> Logged {c.time}</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#4C7A4C" }}><CheckCircle2 size={11} /> Synced to RO</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button onClick={() => copyConcern(c)}
                              className="p-1 rounded hover:opacity-70"
                              style={{ color: copiedConcernId === c.id ? "#4C7A4C" : "#8A93A0" }}
                              aria-label="Copy this concern for Tekmetric">
                              {copiedConcernId === c.id ? <ClipboardCheck size={14} /> : <Copy size={13} />}
                            </button>
                            <button onClick={() => removeConcern(c.id)} className="p-1 rounded hover:opacity-70" style={{ color: "#B8AF9E" }} aria-label="Remove concern">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {concerns.length > 0 && (
              <div className="px-4 pb-4 flex flex-col gap-2">
                <button onClick={copyForTekmetric}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-xs"
                  style={{ background: copied ? "#4C7A4C" : "#2E4057", color: "#fff" }}>
                  {copied ? (
                    <>
                      <ClipboardCheck size={14} /> Copied — paste into Customer Concern
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy customer concern
                    </>
                  )}
                </button>
                {(personal.primaryDriver || personal.dailyUse || personal.usualShop || personal.longTermPlans || additional.beverage || additional.dviMentioned || additional.courtesyInspection !== "unknown" || additional.shuttle !== "unknown") && (
                  <button onClick={copyVisitNotes}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded border text-xs font-semibold"
                    style={{ borderColor: copiedVisitNotes ? "#4C7A4C" : "#D8D2C4", color: copiedVisitNotes ? "#4C7A4C" : "#5A5F66" }}>
                    {copiedVisitNotes ? (
                      <>
                        <ClipboardCheck size={13} /> Copied — paste into notes
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy visit notes <span style={{ fontWeight: 400 }}>(separate field)</span>
                      </>
                    )}
                  </button>
                )}
                <button onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded border text-xs font-semibold"
                  style={{ borderColor: "#D8D2C4", color: "#5A5F66" }}>
                  <Printer size={13} />
                  Print / export repair order
                </button>

                {manualCopyText !== null && (
                  <div className="mt-1 p-2.5 rounded-lg" style={{ background: "#FCF0DC", border: "1px solid #E8A33D" }}>
                    <div className="text-xs font-semibold mb-1.5" style={{ color: "#8A5A2E" }}>
                      If paste comes up empty: tap inside the box below, select all, and copy manually.
                    </div>
                    <textarea
                      ref={manualCopyRef}
                      readOnly
                      value={manualCopyText}
                      onFocus={(e) => e.target.select()}
                      rows={4}
                      className="w-full px-2 py-1.5 rounded border text-xs bg-white"
                      style={{ borderColor: "#E8A33D", fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <button
                      onClick={() => {
                        if (manualCopyRef.current) {
                          manualCopyRef.current.focus();
                          manualCopyRef.current.select();
                        }
                      }}
                      className="mt-1.5 text-xs font-semibold"
                      style={{ color: "#8A5A2E" }}
                    >
                      Tap to select all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs mt-3 text-center" style={{ color: "#8A93A0" }}>
            {concerns.length} concern{concerns.length !== 1 ? "s" : ""} on this RO · nothing here gets dropped before the tech sees it
          </div>
        </div>
      </div>
    </div>
  );
}
