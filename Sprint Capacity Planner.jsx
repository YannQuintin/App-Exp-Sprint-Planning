import { useState, useMemo, useRef, useEffect } from "react";

const DISCIPLINES = ["Back-end", "AdminUI", "Android", "iOS", "QA"];
const DS = { "Back-end": "BE", AdminUI: "AUI", Android: "And", iOS: "iOS", QA: "QA" };
const V = { deepBlue: "#003DA5", turquoise: "#00BCD4", teal: "#00D4C8", white: "#FFFFFF", light: "#F5F7FA", mid: "#E2E8F0", dark: "#334155", red: "#DC2626", amber: "#F59E0B", green: "#16A34A", confirmRed: "#B91C1C" };

let _id = 500;
const uid = () => ++_id;
const personDiscs = (p) => (Array.isArray(p.disciplines) ? p.disciplines : p.discipline ? [p.discipline] : []);
const hasDiscipline = (p, d) => personDiscs(p).includes(d);
const discLabel = (p) => personDiscs(p).map((d) => DS[d] || d).join("/");

const STORAGE_KEY = "sprint-planner-v4";
function saveState(sprints, current, supportTaskTypes) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ sprints, current, supportTaskTypes, _id })); } catch (e) {} }
function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const d = JSON.parse(raw); if (d._id) _id = d._id; return d; } } catch (e) {} return null; }

const DEFAULT_SUPPORT_TYPES = [
  { id: "st1", name: "Release management", defaultPts: 2 },
  { id: "st2", name: "Regression", defaultPts: 2 },
  { id: "st3", name: "Refinement", defaultPts: 1 },
  { id: "st4", name: "Support Onboarding", defaultPts: 1 },
];

// Compute support points per person from supportAssignments
function computeSupportByPerson(supportAssignments) {
  const map = {};
  (supportAssignments || []).forEach((a) => {
    if (a.assignee) map[a.assignee] = (map[a.assignee] || 0) + (a.pts || 0);
  });
  return map;
}

const MOCK_HISTORY = [
  { id: "s817", name: "Sprint 8.17", status: "completed", confirmedAt: "2026-03-03T14:32:00",
    team: [
      { id: 101, name: "Anze", disciplines: ["Android"], totalDays: 10 },
      { id: 102, name: "Zoran", disciplines: ["Android"], totalDays: 10 },
      { id: 103, name: "Haba", disciplines: ["iOS"], totalDays: 10 },
      { id: 104, name: "Giorgio", disciplines: ["iOS"], totalDays: 8 },
      { id: 105, name: "Luka", disciplines: ["iOS"], totalDays: 10 },
      { id: 106, name: "Corina", disciplines: ["Back-end"], totalDays: 10 },
      { id: 107, name: "Ivona", disciplines: ["Back-end", "AdminUI"], totalDays: 10 },
      { id: 108, name: "Anna", disciplines: ["QA"], totalDays: 10 },
      { id: 109, name: "Diana", disciplines: ["QA"], totalDays: 10 },
    ],
    supportAssignments: [
      { id: "sa1", taskTypeId: "st1", taskName: "Release management", assignee: "Anze", pts: 2 },
      { id: "sa2", taskTypeId: "st2", taskName: "Regression", assignee: "Anna", pts: 2 },
      { id: "sa3", taskTypeId: "st3", taskName: "Refinement", assignee: "Corina", pts: 1 },
      { id: "sa4", taskTypeId: "st3", taskName: "Refinement", assignee: "Haba", pts: 1 },
      { id: "sa5", taskTypeId: "st4", taskName: "Support Onboarding", assignee: "Diana", pts: 1 },
    ],
    epics: ["Support", "Fix the Basics", "Search 2.0", "Onboarding"],
    tickets: [
      { id: 201, key: "NUT-72893", title: "Search results ranking improvement", epic: "Search 2.0", disciplines: { "Back-end": { enabled: true, assignee: "Corina", pts: 3 }, Android: { enabled: true, assignee: "Anze", pts: 2 }, iOS: { enabled: true, assignee: "Haba", pts: 2 }, QA: { enabled: true, assignee: "Anna", pts: 1 } } },
      { id: 202, key: "NUT-72894", title: "Search filters UI component", epic: "Search 2.0", disciplines: { Android: { enabled: true, assignee: "Zoran", pts: 3 }, iOS: { enabled: true, assignee: "Giorgio", pts: 3 }, QA: { enabled: true, assignee: "Diana", pts: 1 } } },
      { id: 203, key: "NUT-72900", title: "Onboarding 3 sessions to 14 days spike", epic: "Onboarding", disciplines: { "Back-end": { enabled: true, assignee: "Ivona", pts: 2 } } },
      { id: 204, key: "NUT-71200", title: "Fix recipe filter logic", epic: "Fix the Basics", disciplines: { AdminUI: { enabled: true, assignee: "Ivona", pts: 3 }, Android: { enabled: true, assignee: "Anze", pts: 2 }, iOS: { enabled: true, assignee: "Luka", pts: 2 }, QA: { enabled: true, assignee: "Anna", pts: 2 } } },
      { id: 205, key: "NUT-71201", title: "Fix profile photo cropping", epic: "Fix the Basics", disciplines: { Android: { enabled: true, assignee: "Zoran", pts: 1 }, iOS: { enabled: true, assignee: "Giorgio", pts: 1 }, QA: { enabled: true, assignee: "Diana", pts: 1 } } },
      { id: 206, key: "NUT-72895", title: "Search autocomplete BE endpoint", epic: "Search 2.0", disciplines: { "Back-end": { enabled: true, assignee: "Corina", pts: 3 }, QA: { enabled: true, assignee: "Diana", pts: 2 } } },
    ],
  },
  { id: "s818", name: "Sprint 8.18", status: "completed", confirmedAt: "2026-03-17T15:10:00",
    team: [
      { id: 101, name: "Anze", disciplines: ["Android"], totalDays: 10 },
      { id: 102, name: "Zoran", disciplines: ["Android"], totalDays: 10 },
      { id: 103, name: "Haba", disciplines: ["iOS"], totalDays: 10 },
      { id: 104, name: "Giorgio", disciplines: ["iOS"], totalDays: 10 },
      { id: 105, name: "Luka", disciplines: ["iOS"], totalDays: 10 },
      { id: 106, name: "Corina", disciplines: ["Back-end"], totalDays: 10 },
      { id: 107, name: "Ivona", disciplines: ["Back-end", "AdminUI"], totalDays: 5 },
      { id: 108, name: "Anna", disciplines: ["QA"], totalDays: 10 },
      { id: 109, name: "Diana", disciplines: ["QA"], totalDays: 10 },
    ],
    supportAssignments: [
      { id: "sa6", taskTypeId: "st1", taskName: "Release management", assignee: "Zoran", pts: 2 },
      { id: "sa7", taskTypeId: "st2", taskName: "Regression", assignee: "Diana", pts: 2 },
      { id: "sa8", taskTypeId: "st3", taskName: "Refinement", assignee: "Corina", pts: 1 },
      { id: "sa9", taskTypeId: "st3", taskName: "Refinement", assignee: "Haba", pts: 1 },
      { id: "sa10", taskTypeId: "st4", taskName: "Support Onboarding", assignee: "Anna", pts: 1 },
    ],
    epics: ["Support", "Fix the Basics", "Newsletter", "Community Feed"],
    tickets: [
      { id: 301, key: "NUT-73084", title: "Newsletter % discount change", epic: "Newsletter", disciplines: { "Back-end": { enabled: true, assignee: "Corina", pts: 4 }, Android: { enabled: true, assignee: "Anze", pts: 2 }, iOS: { enabled: true, assignee: "Haba", pts: 2 }, QA: { enabled: true, assignee: "Anna", pts: 2 } } },
      { id: 302, key: "PLA-5493", title: "Profile/community feed speed", epic: "Community Feed", disciplines: { "Back-end": { enabled: true, assignee: "Corina", pts: 2 }, Android: { enabled: true, assignee: "Zoran", pts: 3 }, iOS: { enabled: true, assignee: "Giorgio", pts: 3 }, QA: { enabled: true, assignee: "Diana", pts: 2 } } },
      { id: 303, key: "NUT-72283", title: "Add CTA to countdown banner", epic: "Fix the Basics", disciplines: { Android: { enabled: true, assignee: "Anze", pts: 2 }, iOS: { enabled: true, assignee: "Giorgio", pts: 2 }, QA: { enabled: true, assignee: "Anna", pts: 1 } } },
      { id: 304, key: "NUT-71300", title: "Fix duplicate community pages", epic: "Fix the Basics", disciplines: { AdminUI: { enabled: true, assignee: "Ivona", pts: 3 }, Android: { enabled: true, assignee: "Zoran", pts: 1 }, iOS: { enabled: true, assignee: "Luka", pts: 3 }, QA: { enabled: true, assignee: "Diana", pts: 2 } } },
      { id: 305, key: "NUT-73058", title: "Add Robots to Floor care (prep)", epic: "Fix the Basics", disciplines: { iOS: { enabled: true, assignee: "Haba", pts: 4 } } },
      { id: 306, key: "NUT-72981", title: "Category deeplinks shop", epic: "Fix the Basics", disciplines: { Android: { enabled: true, assignee: "Anze", pts: 2 }, iOS: { enabled: true, assignee: "Giorgio", pts: 3 } } },
    ],
  },
];

const DEFAULT_TEAM = [
  { id: 1, name: "Anze", disciplines: ["Android"], totalDays: 10 },
  { id: 2, name: "Zoran", disciplines: ["Android"], totalDays: 10 },
  { id: 3, name: "Haba", disciplines: ["iOS"], totalDays: 10 },
  { id: 4, name: "Giorgio", disciplines: ["iOS"], totalDays: 10 },
  { id: 5, name: "Luka", disciplines: ["iOS"], totalDays: 10 },
  { id: 6, name: "Corina", disciplines: ["Back-end"], totalDays: 10 },
  { id: 7, name: "Ivona", disciplines: ["Back-end", "AdminUI"], totalDays: 10 },
  { id: 8, name: "Anna", disciplines: ["QA"], totalDays: 10 },
  { id: 9, name: "Diana", disciplines: ["QA"], totalDays: 10 },
];

function computeAssigned(team, tickets) {
  const map = {};
  team.forEach((p) => (map[p.name] = 0));
  tickets.forEach((t) => {
    DISCIPLINES.forEach((d) => {
      const disc = t.disciplines?.[d];
      if (disc?.enabled && disc.assignee && map[disc.assignee] !== undefined) map[disc.assignee] += disc.pts || 0;
    });
  });
  return map;
}

function computeDiscSummary(team, assignedByPerson, supportByPerson) {
  const s = {};
  DISCIPLINES.forEach((d) => {
    const members = team.filter((p) => hasDiscipline(p, d));
    s[d] = {
      count: members.length,
      available: members.reduce((a, p) => a + Math.max(0, p.totalDays - (supportByPerson[p.name] || 0)), 0),
      assigned: members.reduce((a, p) => a + (assignedByPerson[p.name] || 0), 0),
    };
  });
  return s;
}

function computeEpicBreakdown(tickets) {
  const map = {};
  tickets.forEach((t) => {
    const tag = t.epic || "Untagged";
    if (!map[tag]) map[tag] = 0;
    DISCIPLINES.forEach((d) => { if (t.disciplines?.[d]?.enabled) map[tag] += t.disciplines[d].pts || 0; });
  });
  return Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
}

function Bar({ used, total, h = 14, label = true }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const rem = total - used;
  const color = rem < 0 ? V.red : pct >= 90 ? V.red : pct >= 70 ? V.amber : V.green;
  return (
    <div style={{ height: h, background: V.mid, borderRadius: h / 2, overflow: "hidden", position: "relative", minWidth: 50 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: h / 2, transition: "width 0.3s" }} />
      {label && <span style={{ position: "absolute", top: 0, left: 5, lineHeight: `${h}px`, fontSize: 9, fontWeight: 600, color: pct > 35 ? "#fff" : V.dark }}>{used}/{total}</span>}
    </div>
  );
}

function DisciplineCards({ discSummary }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {DISCIPLINES.map((d) => {
        const s = discSummary[d];
        if (s.count === 0) return null;
        const rem = s.available - s.assigned;
        return (
          <div key={d} style={{ flex: 1, minWidth: 110, background: "#fff", borderRadius: 8, padding: "6px 8px", borderTop: `3px solid ${V.turquoise}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: V.deepBlue }}>{d}</div>
            <div style={{ fontSize: 8, color: "#64748B" }}>{s.count} people / {s.available}pts avail</div>
            <Bar used={s.assigned} total={s.available} h={10} />
            <div style={{ fontSize: 9, fontWeight: 600, textAlign: "right", color: rem < 0 ? V.red : V.dark }}>{rem} left</div>
          </div>
        );
      })}
    </div>
  );
}

function EpicBreakdownPanel({ tickets, totalAvail }) {
  const breakdown = computeEpicBreakdown(tickets);
  const totalAssigned = breakdown.reduce((s, [, v]) => s + v, 0);
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: `1px solid ${V.mid}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue, marginBottom: 6 }}>Capacity by EPIC</div>
      {breakdown.length === 0 && <div style={{ fontSize: 10, color: "#94A3B8" }}>No tickets yet</div>}
      {breakdown.map(([epic, pts]) => {
        const pct = totalAvail > 0 ? ((pts / totalAvail) * 100).toFixed(0) : 0;
        return (
          <div key={epic} style={{ marginBottom: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 1 }}>
              <span style={{ fontWeight: 600 }}>{epic}</span>
              <span style={{ color: "#64748B" }}>{pts}pts ({pct}%)</span>
            </div>
            <div style={{ height: 8, background: V.mid, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: V.turquoise, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
      {breakdown.length > 0 && (
        <div style={{ borderTop: `1px solid ${V.mid}`, marginTop: 6, paddingTop: 4, fontSize: 10, color: "#64748B" }}>
          {totalAvail - totalAssigned > 0 ? `${totalAvail - totalAssigned}pts (${((1 - totalAssigned / totalAvail) * 100).toFixed(0)}%) unallocated`
            : totalAssigned > totalAvail ? `Over by ${totalAssigned - totalAvail}pts` : "Fully allocated"}
        </div>
      )}
    </div>
  );
}

function Celebration({ sprintName, onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const t1 = setTimeout(() => setPhase(1), 100); const t2 = setTimeout(() => setPhase(2), 1200); const t3 = setTimeout(() => onDone(), 3200); return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }; }, []);
  const particles = Array.from({ length: 24 }, (_, i) => ({ left: `${Math.random() * 100}%`, delay: `${Math.random() * 0.8}s`, color: [V.deepBlue, V.turquoise, V.teal, V.amber, V.green][i % 5], size: 6 + Math.random() * 10 }));
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: phase >= 1 ? "rgba(0,61,165,0.92)" : "rgba(0,61,165,0)", transition: "background 0.6s ease" }}>
      {phase >= 1 && particles.map((p, i) => (<div key={i} style={{ position: "absolute", top: "-20px", left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: phase >= 2 ? 0 : 1, animation: `confetti-fall 2s ${p.delay} ease-out forwards` }} />))}
      <div style={{ textAlign: "center", color: "#fff", transform: phase >= 1 ? "scale(1)" : "scale(0.5)", opacity: phase >= 1 ? 1 : 0, transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>Sprint Planned!</div>
        <div style={{ fontSize: 20, opacity: 0.9 }}>{sprintName} is locked and ready to go</div>
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 12 }}>Transitioning to sprint view...</div>
      </div>
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}

function CarryOverModal({ previousSprint, onConfirm, onSkip }) {
  const [selected, setSelected] = useState({});
  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const selectAll = () => { const ids = {}; previousSprint.tickets.forEach((t) => { ids[t.id] = true; }); setSelected(ids); };
  const selectedTickets = previousSprint.tickets.filter((t) => selected[t.id]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 680, maxHeight: "85vh", overflow: "auto", padding: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: V.deepBlue, marginBottom: 4 }}>Carry Over Tickets</div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>Select tickets from <strong>{previousSprint.name}</strong> to bring into the new sprint.</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={selectAll} style={{ fontSize: 10, background: V.light, border: `1px solid ${V.mid}`, borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>Select All</button>
          <button onClick={() => setSelected({})} style={{ fontSize: 10, background: V.light, border: `1px solid ${V.mid}`, borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>Clear</button>
          <span style={{ fontSize: 11, color: V.deepBlue, fontWeight: 600, marginLeft: "auto" }}>{selectedTickets.length} selected</span>
        </div>
        <div style={{ border: `1px solid ${V.mid}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 90px 50px", padding: "6px 10px", background: V.deepBlue, color: "#fff", fontSize: 10, fontWeight: 600 }}>
            <div></div><div>Jira</div><div>Title</div><div>EPIC</div><div>Pts</div>
          </div>
          {previousSprint.tickets.map((t, i) => {
            const totalPts = DISCIPLINES.reduce((s, d) => s + (t.disciplines?.[d]?.enabled ? t.disciplines[d].pts || 0 : 0), 0);
            const isSel = !!selected[t.id];
            return (
              <div key={t.id} onClick={() => toggle(t.id)} style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 90px 50px", padding: "5px 10px", fontSize: 10, cursor: "pointer", borderBottom: `1px solid ${V.light}`, background: isSel ? `${V.turquoise}12` : i % 2 ? V.light : "#fff" }}>
                <div><input type="checkbox" checked={isSel} readOnly style={{ cursor: "pointer" }} /></div>
                <div style={{ fontWeight: 600, color: V.deepBlue }}>{t.key}</div>
                <div>{t.title}</div>
                <div>{t.epic || "-"}</div>
                <div style={{ fontWeight: 700, textAlign: "center" }}>{totalPts}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button onClick={onSkip} style={{ background: V.light, color: V.dark, border: `1px solid ${V.mid}`, borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer" }}>Start Empty</button>
          <button onClick={() => onConfirm(selectedTickets)} disabled={selectedTickets.length === 0} style={{ background: selectedTickets.length > 0 ? V.deepBlue : "#CBD5E1", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: selectedTickets.length > 0 ? "pointer" : "not-allowed" }}>
            Carry Over {selectedTickets.length} Ticket{selectedTickets.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportTaskTypeManager({ types, onUpdate, onClose }) {
  const [newName, setNewName] = useState("");
  const [newPts, setNewPts] = useState(2);
  const addType = () => {
    if (!newName.trim()) return;
    onUpdate([...types, { id: `st_${uid()}`, name: newName.trim(), defaultPts: newPts }]);
    setNewName(""); setNewPts(2);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 910, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 440, maxHeight: "80vh", overflow: "auto", padding: 24, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>x</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: V.deepBlue, marginBottom: 4 }}>Support Task Types</div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>Manage the recurring support tasks your team handles each sprint. Default points can be overridden per sprint.</div>
        <div style={{ border: `1px solid ${V.mid}`, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px", padding: "6px 10px", background: V.deepBlue, color: "#fff", fontSize: 10, fontWeight: 600 }}>
            <div>Task Name</div><div>Default Pts</div><div></div>
          </div>
          {types.map((t, i) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px", padding: "5px 10px", fontSize: 11, borderBottom: `1px solid ${V.light}`, background: i % 2 ? V.light : "#fff", alignItems: "center" }}>
              <input value={t.name} onChange={(e) => onUpdate(types.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} style={{ fontSize: 11, padding: 2, border: `1px solid ${V.mid}`, borderRadius: 3, background: "transparent" }} />
              <input type="number" value={t.defaultPts} min={0} max={10} onChange={(e) => onUpdate(types.map((x) => x.id === t.id ? { ...x, defaultPts: Number(e.target.value) } : x))} style={{ width: 40, fontSize: 10, textAlign: "center", padding: 2, border: `1px solid ${V.mid}`, borderRadius: 3 }} />
              <button onClick={() => onUpdate(types.filter((x) => x.id !== t.id))} style={{ fontSize: 9, color: V.red, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `2px solid ${V.mid}`, paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue, marginBottom: 6 }}>Add Task Type</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Task name" onKeyDown={(e) => e.key === "Enter" && addType()} style={{ fontSize: 11, padding: 4, border: `1px solid ${V.mid}`, borderRadius: 4, flex: 1 }} />
            <label style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}>Pts:<input type="number" value={newPts} min={0} max={10} onChange={(e) => setNewPts(Number(e.target.value))} style={{ width: 36, fontSize: 10, textAlign: "center" }} /></label>
            <button onClick={addType} style={{ background: V.deepBlue, color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportTaskPanel({ supportAssignments, supportTaskTypes, team, onChange, onManageTypes, readOnly }) {
  const supportByPerson = computeSupportByPerson(supportAssignments);
  const totalSupportPts = (supportAssignments || []).reduce((s, a) => s + (a.pts || 0), 0);

  const addAssignment = (typeId) => {
    const t = supportTaskTypes.find((x) => x.id === typeId);
    if (!t) return;
    onChange([...(supportAssignments || []), { id: `sa_${uid()}`, taskTypeId: t.id, taskName: t.name, assignee: "", pts: t.defaultPts }]);
  };
  const updateAssignment = (id, field, value) => onChange((supportAssignments || []).map((a) => a.id === id ? { ...a, [field]: value } : a));
  const removeAssignment = (id) => onChange((supportAssignments || []).filter((a) => a.id !== id));

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: `1px solid ${V.mid}`, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue }}>Support Tasks</span>
          <span style={{ fontSize: 10, color: "#64748B", marginLeft: 8 }}>{totalSupportPts}pts reserved</span>
        </div>
        {!readOnly && (
          <button onClick={onManageTypes} style={{ fontSize: 9, color: V.deepBlue, background: "none", border: `1px solid ${V.deepBlue}`, borderRadius: 3, padding: "1px 6px", cursor: "pointer" }}>Manage Types</button>
        )}
      </div>
      {(supportAssignments || []).length === 0 && !readOnly && (
        <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 6 }}>No support tasks assigned yet. Add from the types below.</div>
      )}
      {(supportAssignments || []).map((a) => (
        <div key={a.id} style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4, padding: "3px 6px", background: `${V.amber}10`, borderRadius: 5, border: `1px solid ${V.amber}30` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: V.dark, flex: 1, minWidth: 100 }}>{a.taskName}</span>
          {readOnly ? (
            <>
              <span style={{ fontSize: 10, color: V.deepBlue, fontWeight: 600, minWidth: 60 }}>{a.assignee || "Unassigned"}</span>
              <span style={{ fontSize: 10, color: "#64748B", fontWeight: 700, minWidth: 30, textAlign: "center" }}>{a.pts}pts</span>
            </>
          ) : (
            <>
              <select value={a.assignee} onChange={(e) => updateAssignment(a.id, "assignee", e.target.value)} style={{ fontSize: 9, padding: 1, borderRadius: 3, border: `1px solid ${V.mid}`, minWidth: 70 }}>
                <option value="">-- assign --</option>
                {team.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <input type="number" value={a.pts} min={0} max={10} onChange={(e) => updateAssignment(a.id, "pts", Number(e.target.value))} style={{ width: 30, fontSize: 9, padding: 1, border: `1px solid ${V.mid}`, borderRadius: 3, textAlign: "center" }} />
              <span style={{ fontSize: 8, color: "#94A3B8" }}>pts</span>
              <button onClick={() => removeAssignment(a.id)} style={{ background: "none", border: "none", color: V.red, cursor: "pointer", fontSize: 10, padding: 0 }}>x</button>
            </>
          )}
        </div>
      ))}
      {!readOnly && supportTaskTypes.length > 0 && (
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 6, borderTop: `1px solid ${V.mid}`, paddingTop: 6 }}>
          <span style={{ fontSize: 9, color: "#64748B", marginRight: 4, lineHeight: "22px" }}>Add:</span>
          {supportTaskTypes.map((t) => (
            <button key={t.id} onClick={() => addAssignment(t.id)} style={{ fontSize: 9, background: V.light, border: `1px solid ${V.mid}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: V.dark }}>
              + {t.name} ({t.defaultPts}pts)
            </button>
          ))}
        </div>
      )}
      {!readOnly && Object.keys(supportByPerson).length > 0 && (
        <div style={{ borderTop: `1px solid ${V.mid}`, marginTop: 6, paddingTop: 5 }}>
          <div style={{ fontSize: 9, color: "#64748B", marginBottom: 3 }}>Support load per person:</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(supportByPerson).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([name, pts]) => (
              <span key={name} style={{ fontSize: 9, background: `${V.amber}20`, padding: "1px 6px", borderRadius: 8, color: V.dark }}>{name}: {pts}pts</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamManager({ team, onUpdate, onClose }) {
  const [addName, setAddName] = useState("");
  const [addDiscs, setAddDiscs] = useState(["Android"]);
  const [editingId, setEditingId] = useState(null);

  const toggleAddDisc = (d) => setAddDiscs((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const togglePersonDisc = (id, d) => {
    onUpdate(team.map((p) => {
      if (p.id !== id) return p;
      const cur = personDiscs(p);
      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
      return { ...p, disciplines: next.length > 0 ? next : cur };
    }));
  };
  const updatePerson = (id, field, value) => onUpdate(team.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  const removePerson = (id) => { if (team.length <= 1) return; onUpdate(team.filter((p) => p.id !== id)); };
  const addPerson = () => {
    if (!addName.trim() || addDiscs.length === 0) return;
    onUpdate([...team, { id: uid(), name: addName.trim(), disciplines: [...addDiscs], totalDays: 10 }]);
    setAddName("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 560, maxHeight: "85vh", overflow: "auto", padding: 24, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>x</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: V.deepBlue, marginBottom: 4 }}>Manage Team</div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>Add, edit, or remove members. A person can belong to multiple disciplines.</div>
        <div style={{ border: `1px solid ${V.mid}`, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 55px 60px", padding: "6px 10px", background: V.deepBlue, color: "#fff", fontSize: 10, fontWeight: 600 }}>
            <div>Name</div><div>Disciplines</div><div>Days</div><div></div>
          </div>
          {team.map((p, i) => {
            const discs = personDiscs(p);
            const isEdit = editingId === p.id;
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 55px 60px", padding: "5px 10px", fontSize: 11, borderBottom: `1px solid ${V.light}`, background: i % 2 ? V.light : "#fff", alignItems: "center" }}>
                {isEdit ? (
                  <>
                    <input value={p.name} onChange={(e) => updatePerson(p.id, "name", e.target.value)} style={{ fontSize: 11, padding: 2, border: `1px solid ${V.mid}`, borderRadius: 3 }} />
                    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {DISCIPLINES.map((d) => (
                        <label key={d} style={{ fontSize: 8, display: "flex", alignItems: "center", gap: 1, cursor: "pointer", color: discs.includes(d) ? V.deepBlue : "#94A3B8" }}>
                          <input type="checkbox" checked={discs.includes(d)} onChange={() => togglePersonDisc(p.id, d)} style={{ width: 10, height: 10 }} />{DS[d]}
                        </label>
                      ))}
                    </div>
                    <input type="number" value={p.totalDays} min={0} max={10} onChange={(e) => updatePerson(p.id, "totalDays", Number(e.target.value))} style={{ width: 36, fontSize: 10, textAlign: "center" }} />
                    <button onClick={() => setEditingId(null)} style={{ fontSize: 10, color: V.green, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Done</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, color: V.dark }}>{p.name}</span>
                    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {discs.map((d) => (<span key={d} style={{ fontSize: 8, background: `${V.turquoise}20`, color: V.deepBlue, padding: "0 4px", borderRadius: 6 }}>{DS[d]}</span>))}
                    </div>
                    <span style={{ fontSize: 10, textAlign: "center", color: "#64748B" }}>{p.totalDays}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setEditingId(p.id)} style={{ fontSize: 9, color: V.turquoise, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => removePerson(p.id)} style={{ fontSize: 9, color: V.red, background: "none", border: "none", cursor: "pointer" }}>Del</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: `2px solid ${V.mid}`, paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue, marginBottom: 6 }}>Add Team Member</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Name" onKeyDown={(e) => e.key === "Enter" && addPerson()} style={{ fontSize: 11, padding: 4, border: `1px solid ${V.mid}`, borderRadius: 4, width: 120 }} />
            <div style={{ display: "flex", gap: 3 }}>
              {DISCIPLINES.map((d) => (
                <label key={d} style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", padding: "2px 4px", borderRadius: 4, background: addDiscs.includes(d) ? `${V.turquoise}20` : V.light, border: `1px solid ${addDiscs.includes(d) ? V.turquoise : "transparent"}` }}>
                  <input type="checkbox" checked={addDiscs.includes(d)} onChange={() => toggleAddDisc(d)} style={{ width: 10, height: 10 }} />{DS[d]}
                </label>
              ))}
            </div>
            <button onClick={addPerson} style={{ background: V.deepBlue, color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HolidayManager({ team, onApply }) {
  const [holidays, setHolidays] = useState([]);
  const [open, setOpen] = useState(false);
  const addH = () => setHolidays((p) => [...p, { id: uid(), name: "", from: "", to: "", days: 0 }]);
  const updH = (id, f, v) => setHolidays((p) => p.map((h) => (h.id === id ? { ...h, [f]: v } : h)));
  const delH = (id) => setHolidays((p) => p.filter((h) => h.id !== id));
  const apply = () => { const m = {}; holidays.forEach((h) => { if (h.name && h.days > 0) m[h.name] = (m[h.name] || 0) + h.days; }); onApply(m); };
  if (!open) return <button onClick={() => setOpen(true)} style={{ fontSize: 10, color: V.turquoise, background: "none", border: `1px solid ${V.turquoise}`, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>Manage Leave</button>;
  return (
    <div style={{ background: "#fff", border: `1px solid ${V.mid}`, borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue }}>Leave / Holidays</span>
        <button onClick={() => setOpen(false)} style={{ fontSize: 10, cursor: "pointer", background: "none", border: "none", color: "#94A3B8" }}>Close</button>
      </div>
      {holidays.map((h) => (
        <div key={h.id} style={{ display: "flex", gap: 4, marginBottom: 3, alignItems: "center", fontSize: 10 }}>
          <select value={h.name} onChange={(e) => updH(h.id, "name", e.target.value)} style={{ fontSize: 10, width: 80 }}><option value="">--</option>{team.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}</select>
          <input type="date" value={h.from} onChange={(e) => updH(h.id, "from", e.target.value)} style={{ fontSize: 10, width: 100 }} />
          <input type="date" value={h.to} onChange={(e) => updH(h.id, "to", e.target.value)} style={{ fontSize: 10, width: 100 }} />
          <label>Days:<input type="number" value={h.days} min={0} max={10} onChange={(e) => updH(h.id, "days", Number(e.target.value))} style={{ width: 30, fontSize: 10 }} /></label>
          <button onClick={() => delH(h.id)} style={{ color: V.red, background: "none", border: "none", cursor: "pointer" }}>x</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button onClick={addH} style={{ fontSize: 10, background: V.light, border: `1px solid ${V.mid}`, borderRadius: 3, padding: "2px 6px", cursor: "pointer" }}>+ Add</button>
        <button onClick={apply} style={{ fontSize: 10, background: V.teal, color: "#fff", border: "none", borderRadius: 3, padding: "2px 8px", cursor: "pointer" }}>Apply</button>
      </div>
    </div>
  );
}

function TicketRow({ ticket: t, team, epics, onUpdate, onRemove, onDragStart, onDragOver, onDrop, isDragTarget }) {
  const setF = (f, v) => onUpdate({ ...t, [f]: v });
  const setD = (disc, field, val) => {
    const u = { ...t, disciplines: { ...t.disciplines, [disc]: { ...t.disciplines[disc], [field]: val } } };
    if (field === "enabled" && !val) u.disciplines[disc] = { enabled: false, assignee: "", pts: 0 };
    if (field === "enabled" && val) u.disciplines[disc] = { ...u.disciplines[disc], enabled: true };
    onUpdate(u);
  };
  const totalPts = DISCIPLINES.reduce((s, d) => s + (t.disciplines?.[d]?.enabled ? t.disciplines[d].pts || 0 : 0), 0);
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
      style={{ background: "#fff", border: `1px solid ${isDragTarget ? V.turquoise : V.mid}`, borderTop: isDragTarget ? `2px solid ${V.turquoise}` : undefined, borderRadius: 6, padding: "7px 9px", marginBottom: 4, cursor: "grab" }}>
      <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}>
        <span style={{ cursor: "grab", color: "#94A3B8", fontSize: 12, userSelect: "none" }}>&#9776;</span>
        <input value={t.key} onChange={(e) => setF("key", e.target.value)} placeholder="NUT-..." style={{ width: 68, fontSize: 10, padding: 3, border: `1px solid ${V.mid}`, borderRadius: 3 }} />
        <input value={t.title} onChange={(e) => setF("title", e.target.value)} placeholder="Ticket title" style={{ flex: 1, fontSize: 10, padding: 3, border: `1px solid ${V.mid}`, borderRadius: 3 }} />
        <select value={t.epic} onChange={(e) => setF("epic", e.target.value)} style={{ fontSize: 10, padding: 3, borderRadius: 3, minWidth: 80, border: `1px solid ${V.mid}` }}>
          <option value="">-- epic --</option>
          {epics.map((ep) => <option key={ep}>{ep}</option>)}
        </select>
        <span style={{ fontSize: 10, fontWeight: 700, color: V.deepBlue, minWidth: 35, textAlign: "right" }}>{totalPts}pts</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: V.red, cursor: "pointer", fontSize: 12, padding: 0 }}>x</button>
      </div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {DISCIPLINES.map((d) => {
          const disc = t.disciplines?.[d] || { enabled: false, assignee: "", pts: 0 };
          const members = team.filter((p) => hasDiscipline(p, d));
          if (members.length === 0 && !disc.enabled) return null;
          return (
            <div key={d} style={{ display: "flex", gap: 3, alignItems: "center", padding: "2px 5px", background: disc.enabled ? `${V.turquoise}15` : V.light, borderRadius: 4, border: `1px solid ${disc.enabled ? V.turquoise : "transparent"}` }}>
              <label style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", color: disc.enabled ? V.deepBlue : "#94A3B8", fontWeight: 600 }}>
                <input type="checkbox" checked={disc.enabled} onChange={(e) => setD(d, "enabled", e.target.checked)} style={{ width: 11, height: 11 }} />{DS[d]}
              </label>
              {disc.enabled && (
                <>
                  <select value={disc.assignee} onChange={(e) => setD(d, "assignee", e.target.value)} style={{ fontSize: 9, padding: 1, borderRadius: 3, border: `1px solid ${V.mid}`, minWidth: 55 }}>
                    <option value="">--</option>
                    {members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  <input type="number" value={disc.pts} min={0} onChange={(e) => setD(d, "pts", Number(e.target.value))} style={{ width: 28, fontSize: 9, padding: 1, border: `1px solid ${V.mid}`, borderRadius: 3, textAlign: "center" }} />
                  <span style={{ fontSize: 8, color: "#94A3B8" }}>pts</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PersonSprintView({ person, tickets, supportAssignments, assignedPts, supportPts, available, onClose }) {
  const myTickets = tickets.filter((t) => DISCIPLINES.some((d) => t.disciplines?.[d]?.enabled && t.disciplines[d].assignee === person.name));
  const mySupportTasks = (supportAssignments || []).filter((a) => a.assignee === person.name);
  const netAvailable = Math.max(0, available - supportPts);
  const printRef = useRef();
  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>${person.name} - Sprint Plan</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#334155}h1{color:#003DA5;font-size:20px}h2{color:#003DA5;font-size:14px;margin-top:16px}.meta{color:#64748B;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#003DA5;color:#fff;padding:6px 8px;text-align:left}td{padding:5px 8px;border-bottom:1px solid #E2E8F0}.summary{display:flex;gap:24px;margin:12px 0}.stat{text-align:center}.stat-val{font-size:22px;font-weight:800;color:#003DA5}.stat-label{font-size:10px;color:#64748B}.support-tag{background:#FEF3C7;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:4px}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 600, maxHeight: "85vh", overflow: "auto", padding: 24, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>x</button>
        <button onClick={handlePrint} style={{ position: "absolute", top: 12, right: 44, background: V.deepBlue, color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>Export PDF</button>
        <div ref={printRef}>
          <h1 style={{ color: V.deepBlue, fontSize: 18, margin: 0 }}>{person.name} - Sprint Plan</h1>
          <div className="meta" style={{ color: "#64748B", fontSize: 11, marginBottom: 12 }}>{discLabel(person)} | {person.totalDays}d capacity | {supportPts}d support reserved</div>
          <div className="summary" style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            {[["Total Days", person.totalDays, V.dark], ["Support", supportPts, V.amber], ["Available", netAvailable, V.deepBlue], ["Assigned", assignedPts, V.turquoise], ["Remaining", netAvailable - assignedPts, netAvailable - assignedPts < 0 ? V.red : V.green]].map(([l, v, c]) => (
              <div key={l} className="stat" style={{ textAlign: "center" }}><div className="stat-val" style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div><div className="stat-label" style={{ fontSize: 9, color: "#64748B" }}>{l}</div></div>
            ))}
          </div>
          <Bar used={assignedPts} total={netAvailable} h={16} />
          {mySupportTasks.length > 0 && (
            <>
              <h2 style={{ color: V.deepBlue, fontSize: 13, marginTop: 16 }}>Support Tasks ({mySupportTasks.length})</h2>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {mySupportTasks.map((a) => (
                  <span key={a.id} className="support-tag" style={{ background: `${V.amber}20`, padding: "3px 10px", borderRadius: 6, fontSize: 11, color: V.dark }}>{a.taskName} ({a.pts}pts)</span>
                ))}
              </div>
            </>
          )}
          <h2 style={{ color: V.deepBlue, fontSize: 13, marginTop: 16 }}>Assigned Tickets ({myTickets.length})</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 6 }}>
            <thead><tr style={{ background: V.deepBlue, color: "#fff" }}><th style={{ padding: "5px 8px", textAlign: "left" }}>Jira</th><th style={{ padding: "5px 8px", textAlign: "left" }}>Title</th><th style={{ padding: "5px 8px", textAlign: "left" }}>EPIC</th><th style={{ padding: "5px 8px", textAlign: "center" }}>My Pts</th></tr></thead>
            <tbody>
              {myTickets.map((t) => {
                const myPts = DISCIPLINES.reduce((s, d) => (t.disciplines?.[d]?.assignee === person.name ? s + (t.disciplines[d].pts || 0) : s), 0);
                return (<tr key={t.id} style={{ borderBottom: `1px solid ${V.mid}` }}><td style={{ padding: "4px 8px", fontWeight: 600, color: V.deepBlue }}>{t.key}</td><td style={{ padding: "4px 8px" }}>{t.title}</td><td style={{ padding: "4px 8px" }}>{t.epic || "-"}</td><td style={{ padding: "4px 8px", textAlign: "center", fontWeight: 700 }}>{myPts}</td></tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SprintPlannedView({ sprint, supportTaskTypes, onEdit, onViewPerson }) {
  const supportByPerson = useMemo(() => computeSupportByPerson(sprint.supportAssignments), [sprint]);
  const assignedByPerson = useMemo(() => computeAssigned(sprint.team, sprint.tickets), [sprint]);
  const discSummary = useMemo(() => computeDiscSummary(sprint.team, assignedByPerson, supportByPerson), [sprint, assignedByPerson, supportByPerson]);
  const totalAvail = sprint.team.reduce((s, p) => s + Math.max(0, p.totalDays - (supportByPerson[p.name] || 0)), 0);
  const totalAssigned = Object.values(assignedByPerson).reduce((s, v) => s + v, 0);
  const totalSupport = (sprint.supportAssignments || []).reduce((s, a) => s + (a.pts || 0), 0);
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${V.deepBlue}, ${V.turquoise})`, color: "#fff", padding: "16px 20px", borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>Sprint Planned</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{sprint.name}</div>
            {sprint.confirmedAt && <div style={{ fontSize: 10, opacity: 0.7 }}>Confirmed {new Date(sprint.confirmedAt).toLocaleString()}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{totalAssigned}<span style={{ fontSize: 13, fontWeight: 400 }}> / {totalAvail} pts</span></div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{sprint.tickets.length} tickets | {sprint.team.length} people | {totalSupport}pts support</div>
          </div>
        </div>
        {onEdit && <button onClick={onEdit} style={{ marginTop: 8, background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>Edit Allocation</button>}
      </div>
      <DisciplineCards discSummary={discSummary} />
      <div style={{ marginTop: 12 }}>
        <SupportTaskPanel supportAssignments={sprint.supportAssignments} supportTaskTypes={supportTaskTypes} team={sprint.team} onChange={() => {}} onManageTypes={() => {}} readOnly={true} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.deepBlue, marginBottom: 8 }}>Team Allocation</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {sprint.team.map((p) => {
              const supPts = supportByPerson[p.name] || 0;
              const avail = Math.max(0, p.totalDays - supPts);
              const assigned = assignedByPerson[p.name] || 0;
              const rem = avail - assigned;
              const myT = sprint.tickets.filter((t) => DISCIPLINES.some((d) => t.disciplines?.[d]?.assignee === p.name));
              return (
                <div key={p.id} onClick={() => onViewPerson && onViewPerson(p)} style={{ background: "#fff", border: `1px solid ${rem < 0 ? V.red : V.mid}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,61,165,0.15)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: V.deepBlue }}>{p.name}</span>
                    <span style={{ fontSize: 7, background: V.light, padding: "1px 4px", borderRadius: 6, color: V.dark }}>{discLabel(p)}</span>
                  </div>
                  {supPts > 0 && <div style={{ fontSize: 8, color: V.amber }}>{supPts}pts support</div>}
                  <Bar used={assigned} total={avail} h={12} />
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 3 }}>{myT.length} tickets | {assigned}/{avail}pts</div>
                  <div style={{ fontSize: 10, fontWeight: 700, textAlign: "right", color: rem < 0 ? V.red : rem === 0 ? V.green : V.dark }}>{rem < 0 ? `OVER ${Math.abs(rem)}` : `${rem} left`}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.deepBlue, marginTop: 16, marginBottom: 8 }}>Tickets ({sprint.tickets.length})</div>
          <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${V.mid}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 90px 50px 1fr", padding: "6px 10px", background: V.deepBlue, color: "#fff", fontSize: 10, fontWeight: 600 }}>
              <div>#</div><div>Jira</div><div>Title</div><div>EPIC</div><div>Pts</div><div>Assignees</div>
            </div>
            {sprint.tickets.map((t, i) => {
              const totalPts = DISCIPLINES.reduce((s, d) => s + (t.disciplines?.[d]?.enabled ? t.disciplines[d].pts || 0 : 0), 0);
              const assignees = DISCIPLINES.filter((d) => t.disciplines?.[d]?.enabled && t.disciplines[d].assignee).map((d) => `${t.disciplines[d].assignee} (${DS[d]}:${t.disciplines[d].pts})`);
              return (
                <div key={t.id} style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 90px 50px 1fr", padding: "5px 10px", fontSize: 10, borderBottom: `1px solid ${V.light}`, background: i % 2 ? V.light : "#fff" }}>
                  <div style={{ color: "#94A3B8" }}>{i + 1}</div>
                  <div style={{ fontWeight: 600, color: V.deepBlue }}>{t.key}</div><div>{t.title}</div><div>{t.epic || "-"}</div>
                  <div style={{ fontWeight: 700, textAlign: "center" }}>{totalPts}</div>
                  <div style={{ color: "#64748B", fontSize: 9 }}>{assignees.join(", ")}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div><EpicBreakdownPanel tickets={sprint.tickets} totalAvail={totalAvail} /></div>
      </div>
    </div>
  );
}

export default function SprintCapacityPlanner() {
  const saved = useMemo(() => loadState(), []);
  const [supportTaskTypes, setSupportTaskTypes] = useState(saved?.supportTaskTypes || DEFAULT_SUPPORT_TYPES);
  const [sprints, setSprints] = useState(saved?.sprints || MOCK_HISTORY);
  const [currentSprint, setCurrentSprint] = useState(saved?.current || {
    id: "s819", name: "Sprint 8.19", status: "planning", confirmedAt: null,
    team: JSON.parse(JSON.stringify(DEFAULT_TEAM)),
    epics: ["Support", "Fix the Basics"],
    supportAssignments: DEFAULT_SUPPORT_TYPES.map((t) => ({ id: `sa_${uid()}`, taskTypeId: t.id, taskName: t.name, assignee: "", pts: t.defaultPts })),
    tickets: [],
  });
  const [view, setView] = useState(currentSprint.status === "completed" ? "planned" : "planning");
  const [historySprint, setHistorySprint] = useState(null);
  const [personView, setPersonView] = useState(null);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [showSupportTypeManager, setShowSupportTypeManager] = useState(false);
  const [showCarryOver, setShowCarryOver] = useState(false);
  const [pendingNewSprint, setPendingNewSprint] = useState(null);
  const [newEpic, setNewEpic] = useState("");
  const [filterDisc, setFilterDisc] = useState("All");
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => { saveState(sprints, currentSprint, supportTaskTypes); }, [sprints, currentSprint, supportTaskTypes]);

  const cs = currentSprint;
  const supportByPerson = useMemo(() => computeSupportByPerson(cs.supportAssignments), [cs.supportAssignments]);
  const assignedByPerson = useMemo(() => computeAssigned(cs.team, cs.tickets), [cs.team, cs.tickets]);
  const discSummary = useMemo(() => computeDiscSummary(cs.team, assignedByPerson, supportByPerson), [cs.team, assignedByPerson, supportByPerson]);
  const totalAvail = cs.team.reduce((s, p) => s + Math.max(0, p.totalDays - (supportByPerson[p.name] || 0)), 0);
  const totalAssigned = Object.values(assignedByPerson).reduce((s, v) => s + v, 0);
  const totalRemaining = totalAvail - totalAssigned;
  const totalSupportPts = (cs.supportAssignments || []).reduce((s, a) => s + (a.pts || 0), 0);
  const overAlloc = cs.team.filter((p) => {
    const supPts = supportByPerson[p.name] || 0;
    const avail = Math.max(0, p.totalDays - supPts);
    return (assignedByPerson[p.name] || 0) > avail;
  });
  const unassignedTickets = cs.tickets.filter((t) => !DISCIPLINES.some((d) => t.disciplines?.[d]?.enabled && t.disciplines[d].assignee));
  const untaggedTickets = cs.tickets.filter((t) => !t.epic);
  const unassignedSupport = (cs.supportAssignments || []).filter((a) => !a.assignee);
  const canConfirm = cs.tickets.length > 0 && overAlloc.length === 0 && unassignedTickets.length === 0 && unassignedSupport.length === 0;

  const updateCS = (fn) => setCurrentSprint((prev) => fn({ ...prev }));
  const confirmSprint = () => setView("celebrating");
  const onCelebrationDone = () => { setCurrentSprint((prev) => ({ ...prev, status: "completed", confirmedAt: new Date().toISOString() })); setView("planned"); };
  const editAllocation = () => setView("planning");

  const startNewSprint = () => {
    const archived = { ...currentSprint };
    const nextNum = parseInt(cs.name.replace(/[^\d]/g, "")) + 1 || 820;
    setPendingNewSprint({
      archived,
      newSprint: {
        id: `s${nextNum}`, name: `Sprint 8.${nextNum - 800}`, status: "planning", confirmedAt: null,
        team: JSON.parse(JSON.stringify(cs.team.map((p) => ({ ...p, totalDays: 10 })))),
        epics: [...cs.epics],
        supportAssignments: supportTaskTypes.map((t) => ({ id: `sa_${uid()}`, taskTypeId: t.id, taskName: t.name, assignee: "", pts: t.defaultPts })),
        tickets: [],
      },
    });
    setShowCarryOver(true);
  };
  const finalizeNewSprint = (carryOverTickets) => {
    if (!pendingNewSprint) return;
    setSprints((prev) => [...prev, pendingNewSprint.archived]);
    setCurrentSprint({ ...pendingNewSprint.newSprint, tickets: carryOverTickets.map((t) => ({ ...JSON.parse(JSON.stringify(t)), id: uid() })) });
    setPendingNewSprint(null); setShowCarryOver(false); setView("planning");
  };
  const skipCarryOver = () => {
    if (!pendingNewSprint) return;
    setSprints((prev) => [...prev, pendingNewSprint.archived]);
    setCurrentSprint(pendingNewSprint.newSprint);
    setPendingNewSprint(null); setShowCarryOver(false); setView("planning");
  };

  const addTicket = () => updateCS((s) => {
    s.tickets = [...s.tickets, { id: uid(), key: "", title: "", epic: "", disciplines: Object.fromEntries(DISCIPLINES.map((d) => [d, { enabled: false, assignee: "", pts: 0 }])) }];
    return s;
  });

  const handleDrop = (dropIdx) => {
    if (dragIdx === null || dragIdx === dropIdx) return;
    updateCS((s) => {
      const tickets = [...s.tickets];
      const [moved] = tickets.splice(dragIdx, 1);
      tickets.splice(dropIdx, 0, moved);
      s.tickets = tickets;
      return s;
    });
    setDragIdx(null); setDragOverIdx(null);
  };

  const filteredTeam = filterDisc === "All" ? cs.team : cs.team.filter((p) => hasDiscipline(p, filterDisc));

  const handleViewPerson = (p, sprintData) => {
    const sp = sprintData || cs;
    const sByP = computeSupportByPerson(sp.supportAssignments);
    setPersonView({ person: p, sprint: sp, supportPts: sByP[p.name] || 0 });
  };

  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", background: V.light, minHeight: "100vh" }}>
      {view === "celebrating" && <Celebration sprintName={cs.name} onDone={onCelebrationDone} />}
      {showCarryOver && pendingNewSprint && <CarryOverModal previousSprint={currentSprint} onConfirm={finalizeNewSprint} onSkip={skipCarryOver} />}
      {showTeamManager && <TeamManager team={cs.team} onUpdate={(t) => updateCS((s) => { s.team = t; return s; })} onClose={() => setShowTeamManager(false)} />}
      {showSupportTypeManager && <SupportTaskTypeManager types={supportTaskTypes} onUpdate={setSupportTaskTypes} onClose={() => setShowSupportTypeManager(false)} />}
      {personView && (
        <PersonSprintView
          person={personView.person}
          tickets={personView.sprint.tickets}
          supportAssignments={personView.sprint.supportAssignments}
          assignedPts={computeAssigned(personView.sprint.team, personView.sprint.tickets)[personView.person.name] || 0}
          supportPts={personView.supportPts}
          available={personView.person.totalDays}
          onClose={() => setPersonView(null)}
        />
      )}

      <div style={{ background: V.deepBlue, padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginRight: 12 }}>Sprint Planner</span>
          <button onClick={() => setView(cs.status === "completed" ? "planned" : "planning")} style={{ background: (view === "planning" || view === "planned") ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
            {cs.name} {cs.status === "completed" ? "(Planned)" : "(Current)"}
          </button>
          {sprints.length > 0 && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>|</span>}
          {sprints.map((s) => (
            <button key={s.id} onClick={() => { setHistorySprint(s); setView("history"); }} style={{ background: view === "history" && historySprint?.id === s.id ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>{s.name}</button>
          ))}
        </div>
        {cs.status === "completed" && <button onClick={startNewSprint} style={{ background: V.teal, color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ New Sprint</button>}
      </div>

      <div style={{ padding: 20 }}>
        {view === "history" && historySprint && <SprintPlannedView sprint={historySprint} supportTaskTypes={supportTaskTypes} onViewPerson={(p) => handleViewPerson(p, historySprint)} />}
        {view === "planned" && <SprintPlannedView sprint={currentSprint} supportTaskTypes={supportTaskTypes} onEdit={editAllocation} onViewPerson={(p) => handleViewPerson(p, currentSprint)} />}
        {view === "planning" && (
          <>
            <div style={{ background: V.deepBlue, color: "#fff", padding: "12px 18px", borderRadius: 10, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6 }}>Planning</div>
                <input value={cs.name} onChange={(e) => updateCS((s) => { s.name = e.target.value; return s; })} style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 16, fontWeight: 700, outline: "none", width: 160 }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{totalAssigned}<span style={{ fontSize: 12, fontWeight: 400 }}> / {totalAvail} pts</span></div>
                <div style={{ fontSize: 10, color: totalRemaining < 0 ? "#FCA5A5" : "#A5F3FC" }}>{totalRemaining >= 0 ? `${totalRemaining} pts remaining` : `Over by ${Math.abs(totalRemaining)}`}</div>
                <div style={{ fontSize: 9, opacity: 0.6 }}>{totalSupportPts}pts reserved for support</div>
              </div>
            </div>

            {overAlloc.length > 0 && (
              <div style={{ background: "#FEF2F2", border: `1px solid ${V.red}`, borderRadius: 6, padding: "6px 12px", marginBottom: 10, fontSize: 11, color: V.red }}>
                <strong>Over-allocated:</strong> {overAlloc.map((p) => { const supPts = supportByPerson[p.name] || 0; const avail = Math.max(0, p.totalDays - supPts); return `${p.name} (${assignedByPerson[p.name]}/${avail})`; }).join(", ")}
              </div>
            )}

            <DisciplineCards discSummary={discSummary} />

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 200px", gap: 14, marginTop: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: V.deepBlue }}>Team ({cs.team.length})</span>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <button onClick={() => setShowTeamManager(true)} style={{ fontSize: 9, color: V.deepBlue, background: "none", border: `1px solid ${V.deepBlue}`, borderRadius: 3, padding: "1px 6px", cursor: "pointer" }}>Manage</button>
                    <select value={filterDisc} onChange={(e) => setFilterDisc(e.target.value)} style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, border: `1px solid ${V.mid}` }}>
                      <option>All</option>
                      {DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <HolidayManager team={cs.team} onApply={(dayMap) => updateCS((s) => { s.team = s.team.map((p) => ({ ...p, totalDays: Math.max(0, 10 - (dayMap[p.name] || 0)) })); return s; })} />
                <div style={{ marginTop: 6 }}>
                  <SupportTaskPanel
                    supportAssignments={cs.supportAssignments}
                    supportTaskTypes={supportTaskTypes}
                    team={cs.team}
                    onChange={(sa) => updateCS((s) => { s.supportAssignments = sa; return s; })}
                    onManageTypes={() => setShowSupportTypeManager(true)}
                    readOnly={false}
                  />
                </div>
                {filteredTeam.map((p) => {
                  const supPts = supportByPerson[p.name] || 0;
                  const avail = Math.max(0, p.totalDays - supPts);
                  const assigned = assignedByPerson[p.name] || 0;
                  const rem = avail - assigned;
                  return (
                    <div key={p.id} style={{ background: "#fff", border: `1px solid ${rem < 0 ? V.red : V.mid}`, borderRadius: 6, padding: "5px 8px", marginBottom: 4, cursor: "pointer" }} onClick={() => handleViewPerson(p)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: 11, color: V.deepBlue }}>{p.name}</span>
                        <span style={{ fontSize: 7, background: V.light, padding: "1px 4px", borderRadius: 5, color: V.dark }}>{discLabel(p)}</span>
                      </div>
                      <div style={{ fontSize: 9, color: "#64748B" }}>{p.totalDays}d{supPts > 0 ? ` - ${supPts}d sup` : ""} = {avail}pts</div>
                      <Bar used={assigned} total={avail} h={10} />
                      <div style={{ fontSize: 10, fontWeight: 700, textAlign: "right", color: rem < 0 ? V.red : rem === 0 ? V.green : V.dark }}>{rem < 0 ? `OVER ${Math.abs(rem)}` : `${rem} left`}</div>
                    </div>
                  );
                })}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: V.deepBlue }}>Tickets ({cs.tickets.length})</span>
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <input value={newEpic} onChange={(e) => setNewEpic(e.target.value)} placeholder="New EPIC" onKeyDown={(e) => { if (e.key === "Enter" && newEpic.trim() && !cs.epics.includes(newEpic.trim())) { updateCS((s) => { s.epics = [...s.epics, newEpic.trim()]; return s; }); setNewEpic(""); } }} style={{ fontSize: 9, padding: 2, border: `1px solid ${V.mid}`, borderRadius: 3, width: 80 }} />
                    <button onClick={() => { if (newEpic.trim() && !cs.epics.includes(newEpic.trim())) { updateCS((s) => { s.epics = [...s.epics, newEpic.trim()]; return s; }); setNewEpic(""); } }} style={{ fontSize: 9, background: V.light, border: `1px solid ${V.mid}`, borderRadius: 3, padding: "2px 5px", cursor: "pointer" }}>+ EPIC</button>
                  </div>
                </div>
                {cs.epics.length > 0 && (
                  <div style={{ display: "flex", gap: 3, marginBottom: 6, flexWrap: "wrap" }}>
                    {cs.epics.map((ep) => (
                      <span key={ep} style={{ fontSize: 9, background: `${V.turquoise}20`, color: V.deepBlue, padding: "1px 7px", borderRadius: 10, display: "flex", alignItems: "center", gap: 3 }}>
                        {ep}<button onClick={() => updateCS((s) => { s.epics = s.epics.filter((e) => e !== ep); return s; })} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 9, padding: 0 }}>x</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ maxHeight: "calc(100vh - 380px)", overflowY: "auto", paddingRight: 4 }}>
                  {cs.tickets.map((t, idx) => (
                    <TicketRow key={t.id} ticket={t} team={cs.team} epics={cs.epics}
                      onUpdate={(u) => updateCS((s) => { s.tickets = s.tickets.map((x, i) => (i === idx ? u : x)); return s; })}
                      onRemove={() => updateCS((s) => { s.tickets = s.tickets.filter((_, i) => i !== idx); return s; })}
                      onDragStart={(e) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; }}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                      onDrop={() => handleDrop(idx)}
                      isDragTarget={dragOverIdx === idx && dragIdx !== idx} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <button onClick={addTicket} style={{ background: V.teal, color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add Ticket</button>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    {untaggedTickets.length > 0 && <span style={{ fontSize: 9, color: V.amber }}>({untaggedTickets.length} untagged)</span>}
                    {unassignedTickets.length > 0 && <span style={{ fontSize: 9, color: V.amber }}>({unassignedTickets.length} unassigned)</span>}
                    {unassignedSupport.length > 0 && <span style={{ fontSize: 9, color: V.amber }}>({unassignedSupport.length} support unassigned)</span>}
                    <button onClick={confirmSprint} disabled={!canConfirm} style={{ background: canConfirm ? V.confirmRed : "#CBD5E1", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontSize: 13, fontWeight: 800, cursor: canConfirm ? "pointer" : "not-allowed", boxShadow: canConfirm ? "0 2px 8px rgba(185,28,28,0.3)" : "none", textTransform: "uppercase", letterSpacing: 0.5 }}
                      onMouseEnter={(e) => { if (canConfirm) e.currentTarget.style.background = "#991B1B"; }}
                      onMouseLeave={(e) => { if (canConfirm) e.currentTarget.style.background = V.confirmRed; }}>
                      Planning Done
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <EpicBreakdownPanel tickets={cs.tickets} totalAvail={totalAvail} />
                <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: `1px solid ${V.mid}`, marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue, marginBottom: 5 }}>Discipline Load</div>
                  {DISCIPLINES.map((d) => { const s = discSummary[d]; if (s.count === 0) return null; const pct = s.available > 0 ? ((s.assigned / s.available) * 100).toFixed(0) : 0; return (<div key={d} style={{ marginBottom: 4 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><span style={{ fontWeight: 600 }}>{d}</span><span style={{ color: "#64748B" }}>{s.assigned}/{s.available} ({pct}%)</span></div><Bar used={s.assigned} total={s.available} h={8} label={false} /></div>); })}
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: `1px solid ${V.mid}`, marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: V.deepBlue, marginBottom: 5 }}>Individual Load</div>
                  {cs.team.map((p) => { const supPts = supportByPerson[p.name] || 0; const avail = Math.max(0, p.totalDays - supPts); const assigned = assignedByPerson[p.name] || 0; return (<div key={p.id} style={{ marginBottom: 3 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}><span>{p.name}</span><span style={{ color: assigned > avail ? V.red : "#64748B" }}>{assigned}/{avail}</span></div><Bar used={assigned} total={avail} h={6} label={false} /></div>); })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
