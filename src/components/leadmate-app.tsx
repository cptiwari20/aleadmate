"use client";

import { DragEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { isFuture, isOverdue, nowIso, todayOffset } from "@/lib/date";
import { leadStore, settingsStore } from "@/lib/local-db";
import { createNote, sampleLeads } from "@/lib/sample-data";
import type { AppSettings, Lead, LeadStage } from "@/types/lead";
import { STAGES } from "@/types/lead";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  focusModeEnabled: false,
  hideValuesInFocus: true,
  aiProvider: "openrouter",
  aiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  aiModel: "openai/gpt-4o-mini",
  aiApiKey: "",
  defaultCurrency: "USD",
  syncEnabled: false,
  syncPlan: "",
  accountEmail: "",
  lastSyncAt: "",
};

const TEMPLATES = {
  first: {
    title: "First outreach",
    body: "Hi {{name}}, I noticed {{company}} may be exploring ways to improve growth. Would it be useful to compare notes this week?",
  },
  follow: {
    title: "Gentle follow-up",
    body: "Hi {{name}}, quick follow-up on our last note. Is this still useful to explore for {{company}}?",
  },
  proposal: {
    title: "Proposal follow-up",
    body: "Hi {{name}}, wanted to check whether the proposal answered the main questions. Happy to adjust scope or walk through options.",
  },
  recap: {
    title: "Meeting recap",
    body: "Hi {{name}}, thanks for the conversation. My read is that the next useful step is {{nextAction}}. Does that match your thinking?",
  },
  final: {
    title: "Final check-in",
    body: "Hi {{name}}, I do not want to crowd your inbox. Should I close the loop for now, or is there a better time to reconnect?",
  },
};

type Tool = {
  name: string;
  url: string;
  label: string;
  description: string;
  points: string[];
  logo?: string;
  logoSvg?: ReactNode;
};

const tools: Tool[] = [
  {
    name: "GrowthAssist",
    url: "https://growthasist.com",
    label: "growthasist.com",
    logo: "/assets/growthassist-logo.png",
    description:
      "LinkedIn personal brand growth system for founders, creators, consultants, and operators who want a consistent content and relationship engine.",
    points: ["Plan content themes", "Track posting rhythm", "Turn ideas into LinkedIn drafts", "Build a repeatable personal-brand pipeline"],
  },
  {
    name: "SmartDhandha",
    url: "https://smartdhandha.com",
    label: "smartdhandha.com",
    logoSvg: <SmartDhandhaLogo />,
    description:
      "Founder Cockpit for managing different tools, business workflows, and operating context from one organized command surface.",
    points: ["Manage founder tools", "Track operating workflows", "Keep business context in one place", "Reduce tool sprawl"],
  },
  {
    name: "Coffee to Business",
    url: "https://coffeetobusiness.com",
    label: "coffeetobusiness.com",
    description:
      "Trusted SaaS development partner on subscription for founders and teams who want steady product shipping without hiring a full in-house team.",
    points: ["Subscription SaaS development", "Product iteration support", "Founder-friendly delivery", "Reliable build partner"],
  },
  {
    name: "TechCream",
    url: "https://techcream.in",
    label: "techcream.in",
    description:
      "AI product development company helping founders design, build, and launch practical AI-enabled products and internal tools.",
    points: ["AI product strategy", "MVP design and build", "Automation and agents", "Launch-ready product systems"],
  },
];

type View = "today" | "inbox" | "pipeline" | "leads" | "templates" | "tools" | "settings";

export function LeadMateApp() {
  const [view, setView] = useState<View>("today");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "overdue" | "no-action">("all");
  const [toast, setToast] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [noteText, setNoteText] = useState("");
  const [syncEmail, setSyncEmail] = useState("");
  const [syncPassword, setSyncPassword] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function hydrate() {
      const [storedLeads, storedSettings] = await Promise.all([leadStore.get(), settingsStore.get()]);
      setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
      setLeads(storedLeads?.length ? storedLeads : sampleLeads());
      setHydrated(true);
    }

    hydrate().catch(() => {
      setLeads(sampleLeads());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme === "system" ? "light" : settings.theme;
    if (hydrated) void settingsStore.set(settings);
  }, [hydrated, settings]);

  useEffect(() => {
    if (hydrated && leads.length) void leadStore.set(leads);
  }, [hydrated, leads]);

  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setActiveLeadId(null);
        setCommandOpen(false);
        setSyncOpen(false);
      }
    }

    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, []);

  const activeLeads = useMemo(() => leads.filter((lead) => !lead.archived), [leads]);
  const dueLeads = useMemo(
    () => activeLeads.filter((lead) => lead.nextFollowUpAt && !["won", "lost"].includes(lead.stage) && !isFuture(lead.nextFollowUpAt)),
    [activeLeads],
  );
  const overdueLeads = useMemo(() => activeLeads.filter((lead) => lead.nextFollowUpAt && isOverdue(lead.nextFollowUpAt)), [activeLeads]);
  const noActionLeads = useMemo(() => activeLeads.filter((lead) => !lead.nextAction && !lead.nextFollowUpAt), [activeLeads]);
  const activeLead = activeLeadId ? leads.find((lead) => lead.id === activeLeadId) ?? null : null;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function upsertLead(nextLead: Lead) {
    setLeads((current) => current.map((lead) => (lead.id === nextLead.id ? { ...nextLead, updatedAt: nowIso() } : lead)));
  }

  function createLead(overrides: Partial<Lead> = {}) {
    const lead: Lead = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      name: "New lead",
      company: "",
      title: "",
      email: "",
      phone: "",
      source: "",
      stage: "inbox",
      value: 0,
      currency: settings.defaultCurrency,
      priority: "medium",
      tags: [],
      nextFollowUpAt: "",
      nextAction: "",
      notes: [],
      links: [],
      archived: false,
      ...overrides,
    };
    setLeads((current) => [lead, ...current]);
    setActiveLeadId(lead.id);
    showToast("Lead created");
  }

  function parsePastedLead() {
    if (!pasteText.trim()) {
      showToast("Paste some lead info first");
      return;
    }
    const parsed = parseLeadText(pasteText, settings.defaultCurrency);
    const duplicate = findDuplicate(parsed, leads);
    if (duplicate && !window.confirm(`Possible duplicate found: ${displayName(duplicate)}. Create anyway?`)) {
      setActiveLeadId(duplicate.id);
      return;
    }
    setLeads((current) => [parsed, ...current]);
    setActiveLeadId(parsed.id);
    setPasteText("");
    showToast("Lead parsed into Inbox");
  }

  function moveLead(id: string, stage: LeadStage) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              stage,
              nextFollowUpAt: ["won", "lost"].includes(stage) ? "" : lead.nextFollowUpAt,
              updatedAt: nowIso(),
            }
          : lead,
      ),
    );
    showToast(`Moved to ${stageName(stage)}`);
  }

  function completeFollowup(id: string) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              lastContactedAt: todayOffset(0),
              nextFollowUpAt: "",
              nextAction: "",
              notes: [...lead.notes, createNote("Marked follow-up as done.", "system")],
              updatedAt: nowIso(),
            }
          : lead,
      ),
    );
    showToast("Follow-up completed");
  }

  function updateActiveLead<K extends keyof Lead>(key: K, value: Lead[K]) {
    if (!activeLead) return;
    upsertLead({ ...activeLead, [key]: value });
  }

  function openDraft(lead: Lead) {
    setActiveLeadId(lead.id);
    setAiOutput(templateFor(lead, lead.stage === "proposal" ? "proposal" : "follow"));
  }

  async function copyText(value: string) {
    await navigator.clipboard?.writeText(value);
    showToast("Copied");
  }

  function registerOrLogin(mode: "registered" | "logged in") {
    if (!syncEmail.trim() || !syncPassword.trim()) {
      showToast("Enter email and password");
      return;
    }
    setSettings((current) => ({
      ...current,
      syncEnabled: true,
      syncPlan: "leadmate-sync-monthly",
      accountEmail: syncEmail,
      lastSyncAt: nowIso(),
    }));
    showToast(`Sync ${mode}`);
  }

  function syncNow() {
    if (!settings.syncEnabled) {
      setSyncOpen(true);
      showToast("Register or log in to sync");
      return;
    }
    setSettings((current) => ({ ...current, lastSyncAt: nowIso() }));
    showToast(`${leads.length} leads synced`);
  }

  function renderView() {
    if (view === "today") {
      const selected = filter === "overdue" ? overdueLeads : filter === "no-action" ? noActionLeads : dueLeads;
      const recent = [...activeLeads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
      return (
        <>
          <section className="stats-grid">
            <Stat number={dueLeads.length} label="Due today" />
            <Stat number={overdueLeads.length} label="Overdue" />
            <Stat number={noActionLeads.length} label="No next action" />
            <Stat number={activeLeads.filter((lead) => lead.priority === "high").length} label="High priority" />
          </section>
          <section className="grid-two">
            <Panel title="Action queue" subtitle="Follow-ups, overdue leads, and loose ends.">
              <div className="filter-row">
                <button className={`chip-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Due</button>
                <button className={`chip-button ${filter === "overdue" ? "active" : ""}`} onClick={() => setFilter("overdue")}>Overdue</button>
                <button className={`chip-button ${filter === "no-action" ? "active" : ""}`} onClick={() => setFilter("no-action")}>No action</button>
              </div>
              <LeadList leads={selected} onOpen={setActiveLeadId} onDraft={openDraft} onDone={completeFollowup} />
            </Panel>
            <Panel title="Recently active" subtitle="Useful when you need a quick memory refresh.">
              <div className="lead-list">
                {recent.map((lead) => (
                  <article className="lead-card" key={lead.id}>
                    <div className="lead-card-title">
                      <button onClick={() => setActiveLeadId(lead.id)}>{safeName(lead, settings)}</button>
                      <span className="pill">{stageName(lead.stage)}</span>
                    </div>
                    <div className="lead-card-sub">{lead.nextAction || lead.company || "No next action"}</div>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        </>
      );
    }

    if (view === "inbox") {
      const inboxLeads = activeLeads.filter((lead) => lead.stage === "inbox");
      return (
        <>
          <section className="hero-band">
            <div className="hero-copy">
              <img className="brand-lockup" src="/assets/leadmate-full.png" alt="LeadMate" />
              <div>
                <div className="page-kicker">Paste-first capture</div>
                <h1>Turn messy notes into clean lead cards.</h1>
              </div>
              <p>Paste a LinkedIn bio, email signature, WhatsApp note, or conference scribble. LeadMate structures what it can locally, then lets AI refine it if you add a key.</p>
              <div className="row">
                <button className="primary-button" onClick={parsePastedLead}>Parse pasted lead</button>
                <button className="ghost-button" onClick={() => showToast("CSV import is next in the migration")}>Import CSV</button>
              </div>
            </div>
            <div className="capture-box">
              <label htmlFor="paste-box">Messy lead info</label>
              <textarea id="paste-box" value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder="Met Priya from Stellar Labs. Marketing head. Interested in website redesign. Budget maybe 80k. Follow up next Tuesday. priya@stellarlabs.com" />
            </div>
          </section>
          <Panel title="Inbox leads" subtitle="Unprocessed leads waiting for triage.">
            <button className="ghost-button" onClick={() => createLead({ stage: "inbox" })}>Add to Inbox</button>
            <LeadList leads={inboxLeads} onOpen={setActiveLeadId} onDraft={openDraft} onDone={completeFollowup} />
          </Panel>
        </>
      );
    }

    if (view === "pipeline") {
      return (
        <section className="pipeline" aria-label="Sales pipeline">
          {STAGES.map((stage) => {
            const stageLeads = activeLeads.filter((lead) => lead.stage === stage.id);
            return (
              <div
                className="stage"
                key={stage.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  moveLead(event.dataTransfer.getData("text/plain"), stage.id);
                }}
              >
                <div className="stage-header">
                  <strong>{stage.name}</strong>
                  <span className="pill">{stageLeads.length}</span>
                </div>
                <div className="stage-body">
                  <LeadList leads={stageLeads} onOpen={setActiveLeadId} onDraft={openDraft} onDone={completeFollowup} draggable />
                  <button className="chip-button" onClick={() => createLead({ stage: stage.id })}>+ Add lead</button>
                </div>
              </div>
            );
          })}
        </section>
      );
    }

    if (view === "leads") {
      const rows = activeLeads.filter((lead) => searchLead(lead, search));
      return (
        <Panel title="All leads" subtitle="Search name, company, email, notes, tags, source, and next action.">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leads..." />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Lead</th><th>Stage</th><th>Follow-up</th><th>Value</th><th>Tags</th><th /></tr></thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id}>
                    <td><strong>{safeName(lead, settings)}</strong><div className="muted">{lead.company || lead.email}</div></td>
                    <td>{stageName(lead.stage)}</td>
                    <td>{lead.nextFollowUpAt || "Not set"}<div className="muted">{lead.nextAction}</div></td>
                    <td className="private">{formatValue(lead, settings)}</td>
                    <td><Tags lead={lead} /></td>
                    <td><button className="ghost-button" onClick={() => setActiveLeadId(lead.id)}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      );
    }

    if (view === "templates") {
      return (
        <Panel title="Message templates" subtitle="Fallback drafts that work even without AI.">
          <div className="lead-list">
            {Object.entries(TEMPLATES).map(([key, template]) => (
              <article className="lead-card" key={key}>
                <div className="lead-card-title"><strong>{template.title}</strong><span className="pill">{key}</span></div>
                <p className="muted">{template.body}</p>
                <div className="template-actions"><button className="ghost-button" onClick={() => copyText(template.body)}>Copy</button></div>
              </article>
            ))}
          </div>
        </Panel>
      );
    }

    if (view === "tools") {
      return (
        <>
          <section className="tools-hero">
            <div>
              <div className="page-kicker">TechCream product shelf</div>
              <h2>More tools for operators who want sharper daily systems.</h2>
              <p>LeadMate handles leads and follow-ups. These products cover adjacent founder workflows: personal brand growth, tool operations, subscription SaaS development, and AI product delivery.</p>
            </div>
          </section>
          <section className="tools-grid">
            {tools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} onCopy={copyText} />
            ))}
          </section>
        </>
      );
    }

    return (
      <section className="grid-two">
        <Panel title="Cloud sync" subtitle="Use LeadMate free on this browser, or sync leads across devices with an account for $5/month.">
          <div className={`sync-card ${settings.syncEnabled ? "is-active" : ""}`}>
            <div>
              <strong>{settings.syncEnabled ? "Sync active" : "Sync is off"}</strong>
              <p>{settings.syncEnabled ? `Signed in as ${settings.accountEmail}. Last sync: ${settings.lastSyncAt ? new Date(settings.lastSyncAt).toLocaleString() : "not synced yet"}.` : "Register or log in to back up leads and keep them available across browsers."}</p>
            </div>
            <div className="price-badge">$5<span>/mo</span></div>
          </div>
          <div className="row">
            <button className="primary-button" onClick={() => setSyncOpen(true)}>{settings.syncEnabled ? "Sync leads now" : "Register / login"}</button>
            <button className="ghost-button" onClick={() => setSettings((current) => ({ ...current, syncEnabled: false, syncPlan: "", lastSyncAt: "" }))}>Use local only</button>
          </div>
        </Panel>
        <Panel title="AI Mate" subtitle="Bring your own OpenAI-compatible key. Lead data is sent only when you click an AI action.">
          <SettingsInput label="AI endpoint" value={settings.aiEndpoint} onChange={(value) => setSettings((current) => ({ ...current, aiEndpoint: value }))} />
          <SettingsInput label="Model" value={settings.aiModel} onChange={(value) => setSettings((current) => ({ ...current, aiModel: value }))} />
          <SettingsInput label="API key" value={settings.aiApiKey} type="password" onChange={(value) => setSettings((current) => ({ ...current, aiApiKey: value }))} />
        </Panel>
      </section>
    );
  }

  return (
    <div className={`app-shell ${settings.focusModeEnabled ? "focus-mode" : ""}`}>
      <div className="layout">
        <aside className="sidebar">
          <div className="brand-row">
            <div className="brand-mark"><img src="/assets/leadmate-mark-white.png" alt="" /></div>
            <div>
              <div className="brand-name">LeadMate</div>
              <div className="brand-sub">Browser-first lead manager</div>
            </div>
          </div>
          <nav className="nav" aria-label="Primary">
            <NavButton active={view === "today"} label="Today" count={dueLeads.length} onClick={() => setView("today")} />
            <NavButton active={view === "inbox"} label="Inbox" count={activeLeads.filter((lead) => lead.stage === "inbox").length} onClick={() => setView("inbox")} />
            <NavButton active={view === "pipeline"} label="Pipeline" count={activeLeads.length} onClick={() => setView("pipeline")} />
            <NavButton active={view === "leads"} label="Leads" count={leads.length} onClick={() => setView("leads")} />
            <NavButton active={view === "templates"} label="Templates" count={Object.keys(TEMPLATES).length} onClick={() => setView("templates")} />
            <NavButton active={view === "tools"} label="More Tools" count={tools.length} onClick={() => setView("tools")} />
            <NavButton active={view === "settings"} label="Settings" onClick={() => setView("settings")} />
          </nav>
          <div className="sidebar-footer">
            <button className="primary-button" onClick={() => setSyncOpen(true)}>{settings.syncEnabled ? "Sync leads" : "Enable Sync"}</button>
            <button className="ghost-button" onClick={() => setSettings((current) => ({ ...current, focusModeEnabled: !current.focusModeEnabled }))}>{settings.focusModeEnabled ? "Exit Focus Mode" : "Focus Mode"}</button>
            <div className="privacy-strip">{syncStatusText(settings)}</div>
          </div>
        </aside>
        <main className="main">
          <div className="topbar">
            <div>
              <div className="page-kicker">{pageKicker(view)}</div>
              <h1>{pageTitle(view)}</h1>
            </div>
            <div className="top-actions">
              <button className="ghost-button" onClick={() => setSyncOpen(true)}>{settings.syncEnabled ? "Sync now" : "Sync"}</button>
              <button className="ghost-button" onClick={() => setCommandOpen(true)}>⌘K</button>
              <button className="ghost-button" onClick={() => exportCsv(leads, showToast)}>Export CSV</button>
              <button className="primary-button" onClick={() => createLead()}>New lead</button>
            </div>
          </div>
          {renderView()}
        </main>
      </div>
      {activeLead ? (
        <LeadDrawer
          lead={activeLead}
          settings={settings}
          aiOutput={aiOutput}
          noteText={noteText}
          onClose={() => setActiveLeadId(null)}
          onLeadChange={updateActiveLead}
          onAiOutputChange={setAiOutput}
          onNoteTextChange={setNoteText}
          onCopy={copyText}
          onSaveAiNote={() => {
            upsertLead({ ...activeLead, notes: [...activeLead.notes, createNote(aiOutput, "ai")] });
            showToast("Saved to notes");
          }}
          onAddNote={() => {
            if (!noteText.trim()) return;
            upsertLead({ ...activeLead, notes: [...activeLead.notes, createNote(noteText)] });
            setNoteText("");
            showToast("Note added");
          }}
          onAiAction={(kind) => {
            setAiOutput(localSuggestion(activeLead, kind));
            showToast("Used local fallback");
          }}
        />
      ) : null}
      {commandOpen ? (
        <CommandMenu
          onClose={() => setCommandOpen(false)}
          onAction={(nextView) => {
            setCommandOpen(false);
            if (nextView === "new") createLead();
            else if (nextView === "sync") setSyncOpen(true);
            else if (nextView === "focus") setSettings((current) => ({ ...current, focusModeEnabled: !current.focusModeEnabled }));
            else setView(nextView);
          }}
        />
      ) : null}
      {syncOpen ? (
        <SyncModal
          settings={settings}
          leadCount={leads.length}
          email={syncEmail}
          password={syncPassword}
          onEmailChange={setSyncEmail}
          onPasswordChange={setSyncPassword}
          onClose={() => setSyncOpen(false)}
          onRegister={() => registerOrLogin("registered")}
          onLogin={() => registerOrLogin("logged in")}
          onSyncNow={syncNow}
          onDisable={() => setSettings((current) => ({ ...current, syncEnabled: false, syncPlan: "", lastSyncAt: "" }))}
        />
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

function NavButton({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <span>{label}</span>
      <span className="nav-count">{count ?? ""}</span>
    </button>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title"><h2>{title}</h2><p>{subtitle}</p></div>
      </div>
      {children}
    </section>
  );
}

function Stat({ number, label }: { number: number; label: string }) {
  return <div className="stat"><strong>{number}</strong><span>{label}</span></div>;
}

function LeadList({ leads, onOpen, onDraft, onDone, draggable = false }: { leads: Lead[]; onOpen: (id: string) => void; onDraft: (lead: Lead) => void; onDone: (id: string) => void; draggable?: boolean }) {
  if (!leads.length) return <div className="empty-state"><strong>No leads here.</strong><p>Capture a lead, set a follow-up, or move a card into this stage.</p></div>;

  return (
    <div className="lead-list">
      {leads.map((lead) => (
        <article
          className="lead-card"
          draggable={draggable}
          key={lead.id}
          onDragStart={(event: DragEvent<HTMLElement>) => event.dataTransfer.setData("text/plain", lead.id)}
        >
          <div className="lead-card-title">
            <button onClick={() => onOpen(lead.id)}>{displayName(lead)}</button>
            <span className={`pill ${lead.priority}`}>{lead.priority}</span>
          </div>
          <div className="lead-card-sub">{lead.company || lead.title || lead.source || "No company yet"}</div>
          <div className="lead-meta">
            <span className="pill private">{formatValue(lead, DEFAULT_SETTINGS)}</span>
            <span className="pill">{followupLabel(lead)}</span>
          </div>
          <Tags lead={lead} />
          <div className="row">
            <button className="chip-button" onClick={() => onDraft(lead)}>Draft message</button>
            <button className="chip-button" onClick={() => onDone(lead.id)}>Done</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Tags({ lead }: { lead: Lead }) {
  return <div className="pill-row">{lead.tags.length ? lead.tags.map((tag) => <span className="pill" key={tag}>{tag}</span>) : <span className="pill">untagged</span>}</div>;
}

function LeadDrawer(props: {
  lead: Lead;
  settings: AppSettings;
  aiOutput: string;
  noteText: string;
  onClose: () => void;
  onLeadChange: <K extends keyof Lead>(key: K, value: Lead[K]) => void;
  onAiOutputChange: (value: string) => void;
  onNoteTextChange: (value: string) => void;
  onCopy: (value: string) => void;
  onSaveAiNote: () => void;
  onAddNote: () => void;
  onAiAction: (kind: "summary" | "next" | "draft") => void;
}) {
  const { lead, onClose, onLeadChange } = props;
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Lead details" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div>
              <div className="page-kicker">{stageName(lead.stage)}</div>
              <h2>{safeName(lead, props.settings)}</h2>
              <p className="muted">{[lead.title, lead.company].filter(Boolean).join(" · ")}</p>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="drawer-actions">
            <button className="ghost-button" onClick={() => props.onAiAction("summary")}>Summarize</button>
            <button className="ghost-button" onClick={() => props.onAiAction("next")}>Suggest action</button>
            <button className="primary-button" onClick={() => props.onAiAction("draft")}>Draft follow-up</button>
          </div>
        </div>
        <div className="drawer-content">
          <section className="drawer-panel">
            <h3>Lead details</h3>
            <div className="form-grid">
              <LeadInput label="Name" value={lead.name} onChange={(value) => onLeadChange("name", value)} />
              <LeadInput label="Company" value={lead.company ?? ""} onChange={(value) => onLeadChange("company", value)} />
              <LeadInput label="Title" value={lead.title ?? ""} onChange={(value) => onLeadChange("title", value)} />
              <LeadInput label="Email" value={lead.email ?? ""} onChange={(value) => onLeadChange("email", value)} privateField />
              <LeadInput label="Phone" value={lead.phone ?? ""} onChange={(value) => onLeadChange("phone", value)} privateField />
              <LeadInput label="Source" value={lead.source ?? ""} onChange={(value) => onLeadChange("source", value)} />
              <LeadInput label="Value" type="number" value={String(lead.value ?? 0)} onChange={(value) => onLeadChange("value", Number(value))} privateField />
              <div className="field">
                <label>Priority</label>
                <select value={lead.priority} onChange={(event) => onLeadChange("priority", event.target.value as Lead["priority"])}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label>Stage</label>
                <select value={lead.stage} onChange={(event) => onLeadChange("stage", event.target.value as LeadStage)}>
                  {STAGES.map((stage) => <option value={stage.id} key={stage.id}>{stage.name}</option>)}
                </select>
              </div>
              <LeadInput label="Next follow-up" type="date" value={lead.nextFollowUpAt ?? ""} onChange={(value) => onLeadChange("nextFollowUpAt", value)} />
              <LeadInput label="Next action" value={lead.nextAction ?? ""} onChange={(value) => onLeadChange("nextAction", value)} full />
              <LeadInput label="Tags" value={lead.tags.join(", ")} onChange={(value) => onLeadChange("tags", splitTags(value))} full />
            </div>
          </section>
          <section className="drawer-panel">
            <h3>AI Mate / Draft</h3>
            <textarea value={props.aiOutput} onChange={(event) => props.onAiOutputChange(event.target.value)} placeholder="AI output or template draft appears here." />
            <div className="row"><button className="ghost-button" onClick={() => props.onCopy(props.aiOutput)}>Copy</button><button className="ghost-button" onClick={props.onSaveAiNote}>Save to notes</button></div>
          </section>
          <section className="drawer-panel">
            <h3>Notes</h3>
            <textarea value={props.noteText} onChange={(event) => props.onNoteTextChange(event.target.value)} placeholder="Add a note..." />
            <button className="ghost-button" onClick={props.onAddNote}>Add note</button>
            <div className="lead-list">
              {lead.notes.length ? lead.notes.slice().reverse().map((note) => <div className="note" key={note.id}><div>{note.content}</div><small>{new Date(note.createdAt).toLocaleString()} · {note.type}</small></div>) : <p className="muted">No notes yet.</p>}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function LeadInput({ label, value, onChange, type = "text", full = false, privateField = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; full?: boolean; privateField?: boolean }) {
  return <div className={`field ${full ? "full" : ""} ${privateField ? "private" : ""}`}><label>{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SettingsInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className="field full"><label>{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function CommandMenu({ onClose, onAction }: { onClose: () => void; onAction: (action: View | "new" | "sync" | "focus") => void }) {
  const commands: Array<[string, View | "new" | "sync" | "focus", string]> = [
    ["New lead", "new", "Create a blank lead"],
    ["Go to Today", "today", "Open action queue"],
    ["Go to Pipeline", "pipeline", "Open Kanban"],
    ["Sync leads", "sync", "Register or log in for $5/month"],
    ["Toggle Focus Mode", "focus", "Hide sensitive fields"],
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Command menu" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header"><div className="panel-title"><h2>Command menu</h2><p>Jump, create, import, export, or toggle privacy mode.</p></div><button className="icon-button" onClick={onClose}>×</button></div>
        <div className="command-list">
          {commands.map(([label, action, hint]) => <button key={label} onClick={() => onAction(action)}><strong>{label}</strong><span className="muted">{hint}</span></button>)}
        </div>
      </section>
    </div>
  );
}

function SyncModal(props: {
  settings: AppSettings;
  leadCount: number;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onClose: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onSyncNow: () => void;
  onDisable: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={props.onClose}>
      <section className="modal-panel sync-modal" role="dialog" aria-modal="true" aria-label="LeadMate sync" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header"><div className="panel-title"><h2>Sync your leads</h2><p>LeadMate is free on this browser. Cloud sync keeps your leads backed up and available anywhere for $5/month.</p></div><button className="icon-button" onClick={props.onClose}>×</button></div>
        <div className="pricing-strip"><div><div className="sync-brand-row"><img src="/assets/leadmate-mark-green.png" alt="" /><strong>LeadMate Sync</strong></div><p>Backup, multi-device access, and account recovery.</p></div><div className="price-badge">$5<span>/mo</span></div></div>
        <div className="sync-benefits"><span>Private local app stays free</span><span>Cancel anytime</span><span>Export remains unlocked</span></div>
        {props.settings.syncEnabled ? (
          <>
            <div className="sync-card is-active"><div><strong>Ready to sync</strong><p>{props.leadCount} leads will be backed up for {props.settings.accountEmail}.</p></div><span className="pill high">Paid plan</span></div>
            <div className="row"><button className="primary-button" onClick={props.onSyncNow}>Sync leads now</button><button className="ghost-button" onClick={props.onDisable}>Turn off sync</button></div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <div className="field full"><label htmlFor="sync-email">Email</label><input id="sync-email" type="email" value={props.email} onChange={(event) => props.onEmailChange(event.target.value)} placeholder="you@company.com" /></div>
              <div className="field full"><label htmlFor="sync-password">Password</label><input id="sync-password" type="password" value={props.password} onChange={(event) => props.onPasswordChange(event.target.value)} placeholder="Create or enter password" /></div>
            </div>
            <div className="sync-note">This prototype stores account state locally. In production this will connect to billing and secure cloud storage before syncing lead data.</div>
            <div className="row"><button className="primary-button" onClick={props.onRegister}>Register and start $5/month</button><button className="ghost-button" onClick={props.onLogin}>Log in</button></div>
          </>
        )}
      </section>
    </div>
  );
}

function ToolCard({ tool, onCopy }: { tool: Tool; onCopy: (value: string) => void }) {
  return (
    <article className="tool-card">
      <div className={`tool-mark ${tool.logo || tool.logoSvg ? "image" : ""}`}>{tool.logoSvg ?? (tool.logo ? <img src={tool.logo} alt="" /> : tool.name.slice(0, 2).toUpperCase())}</div>
      <div className="tool-copy">
        <div className="lead-card-title"><strong>{tool.name}</strong><span className="pill">{tool.label}</span></div>
        <p>{tool.description}</p>
        <div className="tool-points">{tool.points.map((point) => <span key={point}>{point}</span>)}</div>
        <div className="row"><a className="primary-link" href={tool.url} target="_blank" rel="noreferrer">Open {tool.name}</a><button className="ghost-button" onClick={() => onCopy(tool.url)}>Copy link</button></div>
      </div>
    </article>
  );
}

function SmartDhandhaLogo() {
  return (
    <svg viewBox="0 0 500 360" role="img" aria-label="SmartDhandha logo">
      <rect width="500" height="360" fill="white" />
      <g transform="rotate(3 230 92)"><path d="M132 42H205C200 34 200 25 205 17C211 7 225 3 236 8C248 14 253 28 248 40C247 42 246 43 245 45H320V84C306 82 294 91 291 104C288 119 298 133 313 136C315 137 318 137 320 136V177H245C250 188 245 202 233 207C221 212 207 207 202 195C199 189 199 183 202 177H132V135C128 137 124 138 119 138C105 138 93 126 93 112C93 98 105 86 119 86C124 86 128 87 132 89V42Z" fill="#2E80E5" /></g>
      <g transform="rotate(3 355 103)"><path d="M285 47H332C329 61 338 75 352 78C367 81 381 71 384 57C385 53 385 50 384 47H431V93C438 89 447 89 455 93C467 99 472 113 466 125C461 137 446 142 434 136C433 136 432 135 431 134V181H385C389 175 389 167 386 160C381 148 367 143 355 148C343 153 338 167 343 179C343 180 344 181 344 181H285V136C280 137 274 136 269 133C257 127 252 113 258 101C263 89 278 84 290 90L285 47Z" fill="#2E80E5" /></g>
      <g transform="rotate(30 128 224)"><path d="M55 172H112C107 164 107 154 113 146C121 135 137 133 148 141C156 147 159 158 155 167C155 169 154 170 153 172H210V226C203 224 195 225 189 230C178 238 176 254 184 265C192 276 208 278 219 270C220 269 221 268 222 267V320H166C170 328 169 338 163 345C155 356 139 358 128 350C119 343 116 331 121 321C121 321 121 320 122 320H55V267C47 271 38 270 31 265C20 257 18 241 26 230C33 220 47 217 58 223L55 172Z" fill="black" /></g>
      <g transform="rotate(3 325 242)"><path d="M285 183H344C339 175 339 165 345 157C353 146 369 144 380 152C388 158 391 169 387 178C386 180 386 181 385 183H445V237C437 233 427 235 420 242C411 252 412 268 422 277C429 283 438 285 446 282V336H385C390 344 389 354 383 362C375 373 359 375 348 367C339 360 336 348 341 338C341 337 342 337 342 336H285V282C277 285 267 283 261 277C251 268 250 252 259 242C266 235 277 233 285 237V183Z" fill="#2E80E5" /></g>
    </svg>
  );
}

function parseLeadText(text: string, defaultCurrency: string): Lead {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const lower = text.toLowerCase();
  const valueMatch = text.match(/(?:₹|rs\.?|inr|\$|usd)?\s?(\d+(?:,\d{3})*(?:\.\d+)?)(\s?k)?/i);
  const value = valueMatch ? Number(valueMatch[1].replace(/,/g, "")) * (valueMatch[2] ? 1000 : 1) : 0;
  return {
    id: crypto.randomUUID(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    name: guessName(text, email),
    company: guessCompany(text),
    title: guessTitle(text),
    email,
    phone: text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] ?? "",
    website: text.match(/https?:\/\/[^\s]+|www\.[^\s]+/i)?.[0] ?? "",
    linkedinUrl: text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+/i)?.[0] ?? "",
    source: lower.includes("linkedin") ? "LinkedIn" : lower.includes("conference") || lower.includes("met") ? "Conversation" : "Manual paste",
    stage: "inbox",
    value,
    currency: text.includes("₹") || lower.includes("inr") || lower.includes("rs") ? "INR" : defaultCurrency,
    priority: lower.includes("hot") || lower.includes("urgent") || lower.includes("proposal") ? "high" : "medium",
    tags: ["website", "proposal", "warm", "budget", "linkedin", "agency", "startup"].filter((tag) => lower.includes(tag)),
    nextFollowUpAt: inferDate(lower),
    nextAction: inferNextAction(lower),
    notes: [createNote(text)],
    links: [],
    archived: false,
  };
}

function guessName(text: string, email: string) {
  const met = text.match(/\b(?:met|contact|lead)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (met) return met[1];
  return email ? email.split("@")[0].split(/[._-]/).map(capitalize).join(" ") : "";
}

function guessCompany(text: string) {
  return text.match(/\bfrom\s+([A-Z][A-Za-z0-9&.\s]{2,40})(?:\.|,|$)/)?.[1]?.trim() ?? "";
}

function guessTitle(text: string) {
  return ["founder", "ceo", "marketing head", "manager", "director", "owner", "lead", "consultant"].find((title) => text.toLowerCase().includes(title)) ?? "";
}

function inferDate(lower: string) {
  if (lower.includes("today")) return todayOffset(0);
  if (lower.includes("tomorrow")) return todayOffset(1);
  if (lower.includes("next week")) return todayOffset(7);
  return "";
}

function inferNextAction(lower: string) {
  if (lower.includes("proposal")) return "Follow up about proposal";
  if (lower.includes("case study")) return "Send relevant case study";
  if (lower.includes("budget")) return "Confirm budget and scope";
  if (lower.includes("interested")) return "Send discovery email";
  return "Send a thoughtful follow-up";
}

function findDuplicate(lead: Lead, leads: Lead[]) {
  return leads.find((item) => {
    const emailMatch = lead.email && item.email && lead.email.toLowerCase() === item.email.toLowerCase();
    const nameCompany = lead.name && lead.company && compact(lead.name + lead.company) === compact(item.name + item.company);
    return emailMatch || nameCompany;
  });
}

function exportCsv(leads: Lead[], toast: (message: string) => void) {
  const headers: Array<keyof Lead> = ["name", "company", "title", "email", "phone", "source", "stage", "value", "currency", "priority", "nextFollowUpAt", "nextAction"];
  const rows = leads.map((lead) => headers.map((key) => csvCell(String(lead[key] ?? ""))).join(","));
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leadmate-${todayOffset(0)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV exported");
}

function pageTitle(view: View) {
  return { today: "Today", inbox: "Inbox", pipeline: "Pipeline", leads: "Leads", templates: "Templates", tools: "More Tools", settings: "Settings" }[view];
}

function pageKicker(view: View) {
  return {
    today: "Who needs attention now",
    inbox: "Capture messy lead info",
    pipeline: "Move deals forward",
    leads: "Search and manage every lead",
    templates: "Reusable outreach starters",
    tools: "More products from TechCream",
    settings: "Privacy, AI, sync, and data controls",
  }[view];
}

function stageName(id: LeadStage) {
  return STAGES.find((stage) => stage.id === id)?.name ?? id;
}

function displayName(lead: Lead) {
  return lead.name || lead.company || lead.email || "Untitled lead";
}

function safeName(lead: Lead, settings: AppSettings) {
  if (!settings.focusModeEnabled) return displayName(lead);
  const base = displayName(lead);
  return base.includes(" ") ? `${base.split(" ")[0]} ${base.split(" ").at(-1)?.slice(0, 1)}.` : base;
}

function formatValue(lead: Lead, settings: AppSettings) {
  if (!lead.value) return "No value";
  if (settings.focusModeEnabled && settings.hideValuesInFocus) return "Value hidden";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: lead.currency || "USD", maximumFractionDigits: 0 }).format(lead.value);
}

function followupLabel(lead: Lead) {
  if (!lead.nextFollowUpAt) return "No follow-up";
  if (isOverdue(lead.nextFollowUpAt)) return `Overdue ${lead.nextFollowUpAt}`;
  if (lead.nextFollowUpAt === todayOffset(0)) return "Follow up today";
  return `Follow up ${lead.nextFollowUpAt}`;
}

function templateFor(lead: Lead, key: keyof typeof TEMPLATES) {
  return TEMPLATES[key].body
    .replaceAll("{{name}}", lead.name || "there")
    .replaceAll("{{company}}", lead.company || "your team")
    .replaceAll("{{nextAction}}", lead.nextAction || "set up the next conversation");
}

function localSuggestion(lead: Lead, type: "summary" | "next" | "draft") {
  if (type === "summary") return `${displayName(lead)} is a ${lead.priority} priority lead${lead.company ? ` from ${lead.company}` : ""}. Current stage is ${stageName(lead.stage)}. Next useful action: ${lead.nextAction || "send a thoughtful follow-up"}.`;
  if (type === "next") return lead.nextAction || "Send a thoughtful follow-up";
  return templateFor(lead, lead.stage === "proposal" ? "proposal" : "follow");
}

function syncStatusText(settings: AppSettings) {
  if (settings.syncEnabled) {
    const lastSync = settings.lastSyncAt ? new Date(settings.lastSyncAt).toLocaleString() : "not synced yet";
    return `Sync active for ${settings.accountEmail}. Last sync: ${lastSync}.`;
  }
  return "Local-first and free. Register or log in to sync leads across devices for $5/month.";
}

function searchLead(lead: Lead, search: string) {
  const query = search.toLowerCase().trim();
  if (!query) return true;
  return [lead.name, lead.company, lead.email, lead.phone, lead.source, lead.nextAction, lead.tags.join(" "), lead.notes.map((note) => note.content).join(" ")]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function splitTags(value: string) {
  return value.split(/[,#]/).map((tag) => tag.trim().toLowerCase()).filter(Boolean);
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function compact(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}
