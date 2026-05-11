const STAGES = [
  { id: "inbox", name: "Inbox" },
  { id: "contacted", name: "Contacted" },
  { id: "interested", name: "Interested" },
  { id: "proposal", name: "Proposal" },
  { id: "won", name: "Won" },
  { id: "lost", name: "Lost" },
];

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

const sampleLeads = [
  {
    name: "Priya Kapoor",
    company: "Stellar Labs",
    title: "Marketing Head",
    email: "priya@stellarlabs.com",
    phone: "+91 98765 44120",
    source: "LinkedIn",
    stage: "proposal",
    value: 80000,
    currency: "INR",
    priority: "high",
    tags: ["website", "warm"],
    nextFollowUpAt: todayOffset(0),
    lastContactedAt: todayOffset(-3),
    nextAction: "Send pricing clarification",
    notes: [note("Met after a referral. Comparing a competitor quote and wants a clean redesign proposal.")],
    links: [{ id: crypto.randomUUID(), label: "Company site", url: "https://stellarlabs.example", createdAt: now() }],
    aiSummary: "Warm redesign lead with budget around INR 80,000. Needs pricing clarification today.",
    archived: false,
  },
  {
    name: "Sarah Chen",
    company: "Voltaic Studio",
    title: "Founder",
    email: "sarah@voltaic.example",
    source: "Conference",
    stage: "interested",
    value: 4200,
    currency: "USD",
    priority: "medium",
    tags: ["agency", "case-study"],
    nextFollowUpAt: todayOffset(1),
    nextAction: "Share a relevant case study",
    notes: [note("Asked for examples from service businesses with short sales cycles.")],
    links: [],
    archived: false,
  },
  {
    name: "Mike Rivera",
    company: "Nexum",
    title: "Operations Lead",
    email: "mike@nexum.example",
    source: "Website form",
    stage: "contacted",
    value: 12000,
    currency: "USD",
    priority: "low",
    tags: ["ops", "no-reply"],
    nextFollowUpAt: todayOffset(-2),
    nextAction: "Check if timing changed",
    notes: [note("Reached out last week. No response after initial discovery email.")],
    links: [],
    archived: false,
  },
];

const state = {
  view: "today",
  leads: [],
  settings: {
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
  },
  activeLeadId: null,
  search: "",
  filter: "all",
  toast: "",
  commandOpen: false,
  syncOpen: false,
};

const db = {
  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("leadmate-db", 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        database.createObjectStore("kv", { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async get(key) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("kv", "readonly");
      const request = tx.objectStore("kv").get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  },
  async set(key, value) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("kv", "readwrite");
      tx.objectStore("kv").put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};

function now() {
  return new Date().toISOString();
}

function todayOffset(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function note(content, type = "manual") {
  return { id: crypto.randomUUID(), content, type, createdAt: now() };
}

function normalizeLead(lead) {
  const createdAt = lead.createdAt || now();
  return {
    id: lead.id || crypto.randomUUID(),
    createdAt,
    updatedAt: now(),
    name: lead.name || "",
    company: lead.company || "",
    title: lead.title || "",
    email: lead.email || "",
    phone: lead.phone || "",
    website: lead.website || "",
    linkedinUrl: lead.linkedinUrl || "",
    source: lead.source || "",
    stage: lead.stage || "inbox",
    value: Number(lead.value) || 0,
    currency: lead.currency || state.settings.defaultCurrency,
    priority: lead.priority || "medium",
    tags: Array.isArray(lead.tags) ? lead.tags : splitTags(lead.tags),
    nextFollowUpAt: lead.nextFollowUpAt || "",
    lastContactedAt: lead.lastContactedAt || "",
    nextAction: lead.nextAction || "",
    notes: lead.notes || [],
    links: lead.links || [],
    aiSummary: lead.aiSummary || "",
    customFields: lead.customFields || {},
    archived: Boolean(lead.archived),
  };
}

function splitTags(value) {
  if (!value) return [];
  return String(value)
    .split(/[,#]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

async function save() {
  await db.set("leads", state.leads);
  await db.set("settings", state.settings);
}

async function init() {
  const [leads, settings] = await Promise.all([db.get("leads"), db.get("settings")]);
  if (settings) state.settings = { ...state.settings, ...settings };
  state.leads = Array.isArray(leads) && leads.length ? leads.map(normalizeLead) : sampleLeads.map(normalizeLead);
  document.documentElement.dataset.theme = state.settings.theme;
  bindGlobalShortcuts();
  render();
}

function bindGlobalShortcuts() {
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      state.commandOpen = true;
      render();
    }
    if (event.key === "Escape") {
      state.commandOpen = false;
      state.activeLeadId = null;
      render();
    }
  });
}

function render() {
  const app = document.querySelector("#app");
  app.className = `app-shell ${state.settings.focusModeEnabled ? "focus-mode" : ""}`;
  app.innerHTML = `
    <div class="layout">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar()}
        ${renderView()}
      </main>
    </div>
    ${state.activeLeadId ? renderDrawer() : ""}
    ${state.commandOpen ? renderCommandMenu() : ""}
    ${state.syncOpen ? renderSyncModal() : ""}
    ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
  `;
  bindEvents();
}

function renderSidebar() {
  const due = dueLeads().length;
  const inbox = filteredLeads({ stage: "inbox" }).length;
  return `
    <aside class="sidebar">
      <div class="brand-row">
        <div class="brand-mark"><img src="./assets/leadmate-mark-white.png" alt="" /></div>
        <div>
          <div class="brand-name">LeadMate</div>
          <div class="brand-sub">Browser-first lead manager</div>
        </div>
      </div>
      <nav class="nav" aria-label="Primary">
        ${navButton("today", "Today", due)}
        ${navButton("inbox", "Inbox", inbox)}
        ${navButton("pipeline", "Pipeline", activeLeads().length)}
        ${navButton("leads", "Leads", state.leads.length)}
        ${navButton("templates", "Templates", Object.keys(TEMPLATES).length)}
        ${navButton("tools", "More Tools", "4")}
        ${navButton("settings", "Settings", "")}
      </nav>
      <div class="sidebar-footer">
        <button class="primary-button" data-action="open-sync">${state.settings.syncEnabled ? "Sync leads" : "Enable Sync"}</button>
        <button class="ghost-button" data-action="toggle-focus">${state.settings.focusModeEnabled ? "Exit Focus Mode" : "Focus Mode"}</button>
        <div class="privacy-strip">${syncStatusText()}</div>
      </div>
    </aside>
  `;
}

function navButton(view, label, count) {
  return `<button class="${state.view === view ? "active" : ""}" data-view="${view}"><span>${label}</span><span class="nav-count">${count}</span></button>`;
}

function renderTopbar() {
  const label = {
    today: "Who needs attention now",
    inbox: "Capture messy lead info",
    pipeline: "Move deals forward",
    leads: "Search and manage every lead",
    templates: "Reusable outreach starters",
    tools: "More products from TechCream",
    settings: "Privacy, AI, sync, and data controls",
  }[state.view];
  return `
    <div class="topbar">
      <div>
        <div class="page-kicker">${label}</div>
        <h1>${pageTitle()}</h1>
      </div>
      <div class="top-actions">
        <button class="ghost-button" data-action="open-sync">${state.settings.syncEnabled ? "Sync now" : "Sync"}</button>
        <button class="ghost-button" data-action="open-command">⌘K</button>
        <button class="ghost-button" data-action="export-csv">Export CSV</button>
        <button class="primary-button" data-action="new-lead">New lead</button>
      </div>
    </div>
  `;
}

function pageTitle() {
  return {
    today: "Today",
    inbox: "Inbox",
    pipeline: "Pipeline",
    leads: "Leads",
    templates: "Templates",
    tools: "More Tools",
    settings: "Settings",
  }[state.view];
}

function renderView() {
  if (state.view === "today") return renderToday();
  if (state.view === "inbox") return renderInbox();
  if (state.view === "pipeline") return renderPipeline();
  if (state.view === "leads") return renderLeadsTable();
  if (state.view === "templates") return renderTemplates();
  if (state.view === "tools") return renderMoreTools();
  return renderSettings();
}

function renderToday() {
  const due = dueLeads();
  const overdue = activeLeads().filter((lead) => lead.nextFollowUpAt && isOverdue(lead.nextFollowUpAt));
  const noAction = activeLeads().filter((lead) => !lead.nextAction && !lead.nextFollowUpAt);
  const recent = activeLeads()
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const selected = state.filter === "overdue" ? overdue : state.filter === "no-action" ? noAction : due;
  return `
    <section class="stats-grid">
      ${stat(due.length, "Due today")}
      ${stat(overdue.length, "Overdue")}
      ${stat(noAction.length, "No next action")}
      ${stat(activeLeads().filter((lead) => lead.priority === "high").length, "High priority")}
    </section>
    <section class="grid-two">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><h2>Action queue</h2><p>Follow-ups, overdue leads, and loose ends.</p></div>
          <div class="filter-row">
            ${filterButton("all", "Due")}
            ${filterButton("overdue", "Overdue")}
            ${filterButton("no-action", "No action")}
          </div>
        </div>
        <div class="lead-list">${selected.length ? selected.map(renderLeadCard).join("") : empty("No follow-ups in this slice.", "Open Inbox to capture the next lead, or set a follow-up from any lead drawer.")}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title"><h2>Recently active</h2><p>Useful when you need a quick memory refresh.</p></div></div>
        <div class="lead-list">${recent.map(renderLeadCardCompact).join("")}</div>
      </div>
    </section>
  `;
}

function renderInbox() {
  const inboxLeads = filteredLeads({ stage: "inbox" });
  return `
    <section class="hero-band">
      <div class="hero-copy">
        <img class="brand-lockup" src="./assets/leadmate-full.png" alt="LeadMate" />
        <div>
          <div class="page-kicker">Paste-first capture</div>
          <h1>Turn messy notes into clean lead cards.</h1>
        </div>
        <p>Paste a LinkedIn bio, email signature, WhatsApp note, or conference scribble. LeadMate structures what it can locally, then lets AI refine it if you add a key.</p>
        <div class="row">
          <button class="primary-button" data-action="parse-paste">Parse pasted lead</button>
          <button class="ghost-button" data-action="import-csv">Import CSV</button>
          <input class="screen-reader-only" type="file" accept=".csv" id="csv-input" />
        </div>
      </div>
      <div class="capture-box">
        <label for="paste-box">Messy lead info</label>
        <textarea id="paste-box" placeholder="Met Priya from Stellar Labs. Marketing head. Interested in website redesign. Budget maybe 80k. Follow up next Tuesday. priya@stellarlabs.com"></textarea>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header">
        <div class="panel-title"><h2>Inbox leads</h2><p>Unprocessed leads waiting for triage.</p></div>
        <button class="ghost-button" data-stage-create="inbox">Add to Inbox</button>
      </div>
      <div class="lead-list">${inboxLeads.length ? inboxLeads.map(renderLeadCard).join("") : empty("Inbox is clear.", "Paste a lead above or import a CSV to start.")}</div>
    </section>
  `;
}

function renderPipeline() {
  return `
    <section class="pipeline" aria-label="Sales pipeline">
      ${STAGES.map((stage) => {
        const leads = filteredLeads({ stage: stage.id });
        return `
          <div class="stage" data-drop-stage="${stage.id}">
            <div class="stage-header">
              <strong>${stage.name}</strong>
              <span class="pill">${leads.length}</span>
            </div>
            <div class="stage-body">
              ${leads.map(renderLeadCard).join("")}
              <button class="chip-button" data-stage-create="${stage.id}">+ Add lead</button>
            </div>
          </div>
        `;
      }).join("")}
    </section>
  `;
}

function renderLeadsTable() {
  const leads = activeLeads().filter(matchesSearch);
  return `
    <section class="panel">
      <div class="panel-header">
        <div class="panel-title"><h2>All leads</h2><p>Search name, company, email, notes, tags, source, and next action.</p></div>
        <input id="search-input" value="${escapeAttr(state.search)}" placeholder="Search leads..." />
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Lead</th><th>Stage</th><th>Follow-up</th><th>Value</th><th>Tags</th><th></th></tr></thead>
          <tbody>
            ${leads.map((lead) => `
              <tr>
                <td><strong>${safeName(lead)}</strong><div class="muted">${escapeHtml(lead.company || lead.email || "")}</div></td>
                <td>${stageName(lead.stage)}</td>
                <td>${lead.nextFollowUpAt || "Not set"}<div class="muted">${escapeHtml(lead.nextAction || "")}</div></td>
                <td class="private">${formatValue(lead)}</td>
                <td>${renderTags(lead)}</td>
                <td><button class="ghost-button" data-open-lead="${lead.id}">Open</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTemplates() {
  return `
    <section class="panel">
      <div class="panel-header"><div class="panel-title"><h2>Message templates</h2><p>Fallback drafts that work even without AI.</p></div></div>
      <div class="lead-list">
        ${Object.entries(TEMPLATES).map(([key, template]) => `
          <article class="lead-card">
            <div class="lead-card-title"><strong>${template.title}</strong><span class="pill">${key}</span></div>
            <p class="muted">${escapeHtml(template.body)}</p>
            <div class="template-actions"><button class="ghost-button" data-copy-template="${key}">Copy</button></div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMoreTools() {
  return `
    <section class="tools-hero">
      <div>
        <div class="page-kicker">TechCream product shelf</div>
        <h2>More tools for operators who want sharper daily systems.</h2>
        <p>LeadMate handles leads and follow-ups. These products cover adjacent founder workflows: personal brand growth, tool operations, subscription SaaS development, and AI product delivery.</p>
      </div>
    </section>
    <section class="tools-grid">
      ${renderToolCard({
        name: "GrowthAssist",
        url: "https://growthasist.com",
        label: "growthasist.com",
        logo: "./assets/growthassist-logo.png",
        description: "LinkedIn personal brand growth system for founders, creators, consultants, and operators who want a consistent content and relationship engine.",
        points: ["Plan content themes", "Track posting rhythm", "Turn ideas into LinkedIn drafts", "Build a repeatable personal-brand pipeline"],
      })}
      ${renderToolCard({
        name: "SmartDhandha",
        url: "https://smartdhandha.com",
        label: "smartdhandha.com",
        logoSvg: smartDhandhaLogo(),
        description: "Founder Cockpit for managing different tools, business workflows, and operating context from one organized command surface.",
        points: ["Manage founder tools", "Track operating workflows", "Keep business context in one place", "Reduce tool sprawl"],
      })}
      ${renderToolCard({
        name: "Coffee to Business",
        url: "https://coffeetobusiness.com",
        label: "coffeetobusiness.com",
        description: "Trusted SaaS development partner on subscription for founders and teams who want steady product shipping without hiring a full in-house team.",
        points: ["Subscription SaaS development", "Product iteration support", "Founder-friendly delivery", "Reliable build partner"],
      })}
      ${renderToolCard({
        name: "TechCream",
        url: "https://techcream.in",
        label: "techcream.in",
        description: "AI product development company helping founders design, build, and launch practical AI-enabled products and internal tools.",
        points: ["AI product strategy", "MVP design and build", "Automation and agents", "Launch-ready product systems"],
      })}
    </section>
  `;
}

function renderToolCard(tool) {
  const logoMarkup = tool.logoSvg || (tool.logo ? `<img src="${tool.logo}" alt="" />` : escapeHtml(tool.name.slice(0, 2).toUpperCase()));
  return `
    <article class="tool-card">
      <div class="tool-mark ${tool.logo || tool.logoSvg ? "image" : ""}">${logoMarkup}</div>
      <div class="tool-copy">
        <div class="lead-card-title">
          <strong>${escapeHtml(tool.name)}</strong>
          <span class="pill">${escapeHtml(tool.label)}</span>
        </div>
        <p>${escapeHtml(tool.description)}</p>
        <div class="tool-points">
          ${tool.points.map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
        </div>
        <div class="row">
          <a class="primary-link" href="${tool.url}" target="_blank" rel="noreferrer">Open ${escapeHtml(tool.name)}</a>
          <button class="ghost-button" data-action="copy-tool-link" data-tool-url="${tool.url}">Copy link</button>
        </div>
      </div>
    </article>
  `;
}

function smartDhandhaLogo() {
  return `
    <svg viewBox="0 0 500 360" role="img" aria-label="SmartDhandha logo">
      <rect width="500" height="360" fill="white"></rect>
      <g transform="rotate(3 230 92)">
        <path d="M132 42H205C200 34 200 25 205 17C211 7 225 3 236 8C248 14 253 28 248 40C247 42 246 43 245 45H320V84C306 82 294 91 291 104C288 119 298 133 313 136C315 137 318 137 320 136V177H245C250 188 245 202 233 207C221 212 207 207 202 195C199 189 199 183 202 177H132V135C128 137 124 138 119 138C105 138 93 126 93 112C93 98 105 86 119 86C124 86 128 87 132 89V42Z" fill="#2E80E5"></path>
      </g>
      <g transform="rotate(3 355 103)">
        <path d="M285 47H332C329 61 338 75 352 78C367 81 381 71 384 57C385 53 385 50 384 47H431V93C438 89 447 89 455 93C467 99 472 113 466 125C461 137 446 142 434 136C433 136 432 135 431 134V181H385C389 175 389 167 386 160C381 148 367 143 355 148C343 153 338 167 343 179C343 180 344 181 344 181H285V136C280 137 274 136 269 133C257 127 252 113 258 101C263 89 278 84 290 90L285 47Z" fill="#2E80E5"></path>
      </g>
      <g transform="rotate(30 128 224)">
        <path d="M55 172H112C107 164 107 154 113 146C121 135 137 133 148 141C156 147 159 158 155 167C155 169 154 170 153 172H210V226C203 224 195 225 189 230C178 238 176 254 184 265C192 276 208 278 219 270C220 269 221 268 222 267V320H166C170 328 169 338 163 345C155 356 139 358 128 350C119 343 116 331 121 321C121 321 121 320 122 320H55V267C47 271 38 270 31 265C20 257 18 241 26 230C33 220 47 217 58 223L55 172Z" fill="black"></path>
      </g>
      <g transform="rotate(3 325 242)">
        <path d="M285 183H344C339 175 339 165 345 157C353 146 369 144 380 152C388 158 391 169 387 178C386 180 386 181 385 183H445V237C437 233 427 235 420 242C411 252 412 268 422 277C429 283 438 285 446 282V336H385C390 344 389 354 383 362C375 373 359 375 348 367C339 360 336 348 341 338C341 337 342 337 342 336H285V282C277 285 267 283 261 277C251 268 250 252 259 242C266 235 277 233 285 237V183Z" fill="#2E80E5"></path>
      </g>
    </svg>
  `;
}

function renderSettings() {
  return `
    <section class="grid-two">
      <div class="panel">
        <div class="panel-header"><div class="panel-title"><h2>Cloud sync</h2><p>Use LeadMate free on this browser, or sync leads across devices with an account for $5/month.</p></div></div>
        <div class="sync-card ${state.settings.syncEnabled ? "is-active" : ""}">
          <div>
            <strong>${state.settings.syncEnabled ? "Sync active" : "Sync is off"}</strong>
            <p>${state.settings.syncEnabled ? `Signed in as ${escapeHtml(state.settings.accountEmail)}. Last sync: ${state.settings.lastSyncAt ? new Date(state.settings.lastSyncAt).toLocaleString() : "not synced yet"}.` : "Register or log in to back up leads and keep them available across browsers."}</p>
          </div>
          <div class="price-badge">$5<span>/mo</span></div>
        </div>
        <div class="row"><button class="primary-button" data-action="open-sync">${state.settings.syncEnabled ? "Sync leads now" : "Register / login"}</button><button class="ghost-button" data-action="disable-sync">Use local only</button></div>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title"><h2>AI Mate</h2><p>Bring your own OpenAI-compatible key. Lead data is sent only when you click an AI action.</p></div></div>
        <div class="form-grid">
          ${field("AI endpoint", "aiEndpoint", state.settings.aiEndpoint)}
          ${field("Model", "aiModel", state.settings.aiModel)}
          ${field("API key", "aiApiKey", state.settings.aiApiKey, "password")}
          <div class="field"><label>Provider</label><select id="aiProvider"><option value="openrouter" ${state.settings.aiProvider === "openrouter" ? "selected" : ""}>OpenRouter</option><option value="openai-compatible" ${state.settings.aiProvider === "openai-compatible" ? "selected" : ""}>OpenAI-compatible</option></select></div>
        </div>
        <div class="row"><button class="primary-button" data-action="save-settings">Save settings</button><button class="ghost-button" data-action="clear-ai-key">Remove key</button></div>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title"><h2>Data controls</h2><p>Everything lives in this browser through IndexedDB.</p></div></div>
        <div class="lead-list">
          <button class="ghost-button" data-action="export-json">Export JSON</button>
          <button class="ghost-button" data-action="export-csv">Export CSV</button>
          <button class="ghost-button" data-action="load-samples">Reload sample data</button>
          <button class="ghost-button danger" data-action="clear-data">Clear local leads</button>
        </div>
      </div>
    </section>
  `;
}

function renderLeadCard(lead) {
  return `
    <article class="lead-card" draggable="true" data-lead-card="${lead.id}">
      <div class="lead-card-title">
        <button data-open-lead="${lead.id}">${safeName(lead)}</button>
        <span class="pill ${lead.priority}">${lead.priority}</span>
      </div>
      <div class="lead-card-sub">${escapeHtml(lead.company || lead.title || lead.source || "No company yet")}</div>
      <div class="lead-meta">
        <span class="pill private">${formatValue(lead)}</span>
        <span class="pill">${followupLabel(lead)}</span>
      </div>
      <div class="pill-row">${renderTags(lead)}</div>
      <div class="row">
        <button class="chip-button" data-draft="${lead.id}">Draft message</button>
        <button class="chip-button" data-done="${lead.id}">Done</button>
      </div>
    </article>
  `;
}

function renderLeadCardCompact(lead) {
  return `<article class="lead-card"><div class="lead-card-title"><button data-open-lead="${lead.id}">${safeName(lead)}</button><span class="pill">${stageName(lead.stage)}</span></div><div class="lead-card-sub">${escapeHtml(lead.nextAction || lead.company || "No next action")}</div></article>`;
}

function renderDrawer() {
  const lead = state.leads.find((item) => item.id === state.activeLeadId);
  if (!lead) return "";
  return `
    <div class="drawer-backdrop" data-action="close-drawer">
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Lead details" onclick="event.stopPropagation()">
        <div class="drawer-header">
          <div class="drawer-title-row">
            <div>
              <div class="page-kicker">${stageName(lead.stage)}</div>
              <h2>${safeName(lead)}</h2>
              <p class="muted">${escapeHtml([lead.title, lead.company].filter(Boolean).join(" · "))}</p>
            </div>
            <button class="icon-button" data-action="close-drawer" aria-label="Close">×</button>
          </div>
          <div class="drawer-actions">
            <button class="ghost-button" data-ai="summary">Summarize</button>
            <button class="ghost-button" data-ai="next">Suggest action</button>
            <button class="primary-button" data-ai="draft">Draft follow-up</button>
          </div>
        </div>
        <div class="drawer-content">
          <section class="drawer-panel">
            <h3>Lead details</h3>
            <div class="form-grid">
              ${leadField("Name", "name", lead.name)}
              ${leadField("Company", "company", lead.company)}
              ${leadField("Title", "title", lead.title)}
              ${leadField("Email", "email", lead.email, "email private")}
              ${leadField("Phone", "phone", lead.phone, "tel private")}
              ${leadField("Source", "source", lead.source)}
              ${leadField("Value", "value", lead.value, "number private")}
              <div class="field"><label>Priority</label><select data-lead-input="priority"><option value="low" ${lead.priority === "low" ? "selected" : ""}>Low</option><option value="medium" ${lead.priority === "medium" ? "selected" : ""}>Medium</option><option value="high" ${lead.priority === "high" ? "selected" : ""}>High</option></select></div>
              <div class="field"><label>Stage</label><select data-lead-input="stage">${STAGES.map((stage) => `<option value="${stage.id}" ${lead.stage === stage.id ? "selected" : ""}>${stage.name}</option>`).join("")}</select></div>
              ${leadField("Next follow-up", "nextFollowUpAt", lead.nextFollowUpAt, "date")}
              ${leadField("Next action", "nextAction", lead.nextAction, "text full")}
              ${leadField("Tags", "tags", lead.tags.join(", "), "text full")}
            </div>
          </section>
          <section class="drawer-panel">
            <h3>AI Mate / Draft</h3>
            <textarea id="ai-output" placeholder="AI output or template draft appears here."></textarea>
            <div class="row"><button class="ghost-button" data-action="copy-ai-output">Copy</button><button class="ghost-button" data-action="save-ai-note">Save to notes</button></div>
          </section>
          <section class="drawer-panel">
            <h3>Notes</h3>
            <textarea id="note-input" placeholder="Add a note..."></textarea>
            <button class="ghost-button" data-action="add-note">Add note</button>
            <div class="lead-list">${lead.notes.length ? lead.notes.slice().reverse().map((item) => `<div class="note"><div>${escapeHtml(item.content)}</div><small>${new Date(item.createdAt).toLocaleString()} · ${item.type}</small></div>`).join("") : `<p class="muted">No notes yet.</p>`}</div>
          </section>
        </div>
      </aside>
    </div>
  `;
}

function renderCommandMenu() {
  return `
    <div class="modal-backdrop" data-action="close-command">
      <section class="modal-panel" role="dialog" aria-modal="true" aria-label="Command menu" onclick="event.stopPropagation()">
        <div class="panel-header"><div class="panel-title"><h2>Command menu</h2><p>Jump, create, import, export, or toggle privacy mode.</p></div><button class="icon-button" data-action="close-command">×</button></div>
        <div class="command-list">
          ${command("New lead", "new-lead", "Create a blank lead")}
          ${command("Go to Today", "go-today", "Open action queue")}
          ${command("Go to Pipeline", "go-pipeline", "Open Kanban")}
          ${command("Import CSV", "import-csv", "Bring in spreadsheet leads")}
          ${command("Export CSV", "export-csv", "Take your data with you")}
          ${command("Sync leads", "open-sync", "Register or log in for $5/month")}
          ${command("Toggle Focus Mode", "toggle-focus", "Hide sensitive fields")}
        </div>
      </section>
    </div>
  `;
}

function renderSyncModal() {
  return `
    <div class="modal-backdrop" data-action="close-sync">
      <section class="modal-panel sync-modal" role="dialog" aria-modal="true" aria-label="LeadMate sync" onclick="event.stopPropagation()">
        <div class="panel-header">
          <div class="panel-title">
            <h2>Sync your leads</h2>
            <p>LeadMate is free on this browser. Cloud sync keeps your leads backed up and available anywhere for $5/month.</p>
          </div>
          <button class="icon-button" data-action="close-sync" aria-label="Close">×</button>
        </div>
        <div class="pricing-strip">
          <div>
            <div class="sync-brand-row">
              <img src="./assets/leadmate-mark-green.png" alt="" />
              <strong>LeadMate Sync</strong>
            </div>
            <p>Backup, multi-device access, and account recovery.</p>
          </div>
          <div class="price-badge">$5<span>/mo</span></div>
        </div>
        <div class="sync-benefits">
          <span>Private local app stays free</span>
          <span>Cancel anytime</span>
          <span>Export remains unlocked</span>
        </div>
        ${state.settings.syncEnabled ? renderSyncActive() : renderAuthForm()}
      </section>
    </div>
  `;
}

function renderAuthForm() {
  return `
    <div class="form-grid">
      <div class="field full"><label for="sync-email">Email</label><input id="sync-email" type="email" placeholder="you@company.com" /></div>
      <div class="field full"><label for="sync-password">Password</label><input id="sync-password" type="password" placeholder="Create or enter password" /></div>
    </div>
    <div class="sync-note">This prototype stores the account state locally. In production this would connect to billing and secure cloud storage before syncing any lead data.</div>
    <div class="row">
      <button class="primary-button" data-action="register-sync">Register and start $5/month</button>
      <button class="ghost-button" data-action="login-sync">Log in</button>
    </div>
  `;
}

function renderSyncActive() {
  return `
    <div class="sync-card is-active">
      <div>
        <strong>Ready to sync</strong>
        <p>${escapeHtml(state.leads.length)} leads will be backed up for ${escapeHtml(state.settings.accountEmail)}.</p>
      </div>
      <span class="pill high">Paid plan</span>
    </div>
    <div class="row">
      <button class="primary-button" data-action="sync-now">Sync leads now</button>
      <button class="ghost-button" data-action="disable-sync">Turn off sync</button>
    </div>
  `;
}

function command(label, action, hint) {
  return `<button data-action="${action}"><strong>${label}</strong><span class="muted">${hint}</span></button>`;
}

function stat(number, label) {
  return `<div class="stat"><strong>${number}</strong><span>${label}</span></div>`;
}

function filterButton(filter, label) {
  return `<button class="chip-button ${state.filter === filter ? "active" : ""}" data-filter="${filter}">${label}</button>`;
}

function field(label, id, value, type = "text") {
  return `<div class="field full"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${escapeAttr(value || "")}" /></div>`;
}

function leadField(label, key, value, options = "text") {
  const parts = options.split(" ");
  const type = parts[0];
  const full = parts.includes("full") ? " full" : "";
  const privateClass = parts.includes("private") ? " private" : "";
  return `<div class="field${full}${privateClass}"><label>${label}</label><input data-lead-input="${key}" type="${type}" value="${escapeAttr(value || "")}" /></div>`;
}

function empty(title, body) {
  return `<div class="empty-state"><strong>${title}</strong><p>${body}</p></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (event) => handleAction(event, el.dataset.action));
  });
  document.querySelectorAll("[data-open-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLeadId = button.dataset.openLead;
      render();
    });
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      render();
    });
  });
  document.querySelectorAll("[data-stage-create]").forEach((button) => {
    button.addEventListener("click", () => createLead({ stage: button.dataset.stageCreate }));
  });
  document.querySelectorAll("[data-draft]").forEach((button) => {
    button.addEventListener("click", () => openDraft(button.dataset.draft));
  });
  document.querySelectorAll("[data-done]").forEach((button) => {
    button.addEventListener("click", () => completeFollowup(button.dataset.done));
  });
  document.querySelectorAll("[data-copy-template]").forEach((button) => {
    button.addEventListener("click", () => copyText(TEMPLATES[button.dataset.copyTemplate].body));
  });
  document.querySelectorAll("[data-tool-url]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.toolUrl));
  });
  document.querySelectorAll("[data-lead-input]").forEach((input) => {
    input.addEventListener("change", () => updateActiveLead(input.dataset.leadInput, input.value));
  });
  document.querySelectorAll("[data-ai]").forEach((button) => {
    button.addEventListener("click", () => runAiAction(button.dataset.ai));
  });
  document.querySelectorAll("[data-lead-card]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.leadCard);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });
  document.querySelectorAll("[data-drop-stage]").forEach((stage) => {
    stage.addEventListener("dragover", (event) => {
      event.preventDefault();
      stage.classList.add("drag-over");
    });
    stage.addEventListener("dragleave", () => stage.classList.remove("drag-over"));
    stage.addEventListener("drop", (event) => {
      event.preventDefault();
      stage.classList.remove("drag-over");
      moveLead(event.dataTransfer.getData("text/plain"), stage.dataset.dropStage);
    });
  });
  const search = document.querySelector("#search-input");
  if (search) {
    search.addEventListener("input", () => {
      state.search = search.value;
      render();
    });
  }
  const csvInput = document.querySelector("#csv-input");
  if (csvInput) {
    csvInput.addEventListener("change", (event) => importCsv(event.target.files[0]));
  }
}

async function handleAction(event, action) {
  if (["close-drawer", "close-command", "close-sync"].includes(action)) {
    state.activeLeadId = null;
    state.commandOpen = false;
    state.syncOpen = false;
    render();
    return;
  }
  if (action === "open-command") state.commandOpen = true;
  if (action === "open-sync") state.syncOpen = true;
  if (action === "register-sync") registerOrLogin("registered");
  if (action === "login-sync") registerOrLogin("logged in");
  if (action === "sync-now") syncNow();
  if (action === "disable-sync") disableSync();
  if (action === "copy-tool-link") return;
  if (action === "new-lead") createLead();
  if (action === "go-today") state.view = "today";
  if (action === "go-pipeline") state.view = "pipeline";
  if (action === "toggle-focus") toggleFocus();
  if (action === "parse-paste") parsePastedLead();
  if (action === "import-csv") document.querySelector("#csv-input")?.click();
  if (action === "export-csv") exportCsv();
  if (action === "export-json") exportJson();
  if (action === "save-settings") saveSettings();
  if (action === "clear-ai-key") clearAiKey();
  if (action === "clear-data") clearData();
  if (action === "load-samples") loadSamples();
  if (action === "add-note") addNote();
  if (action === "copy-ai-output") copyText(document.querySelector("#ai-output")?.value || "");
  if (action === "save-ai-note") saveAiNote();
  if (action !== "open-sync") state.commandOpen = false;
  render();
}

async function createLead(overrides = {}) {
  const lead = normalizeLead({ name: "New lead", stage: "inbox", priority: "medium", tags: [], notes: [], links: [], archived: false, ...overrides });
  state.leads.unshift(lead);
  state.activeLeadId = lead.id;
  await save();
  toast("Lead created");
  render();
}

async function moveLead(id, stage) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  lead.stage = stage;
  lead.updatedAt = now();
  if (stage === "won" || stage === "lost") lead.nextFollowUpAt = "";
  await save();
  toast(`Moved to ${stageName(stage)}`);
  render();
}

async function updateActiveLead(key, value) {
  const lead = state.leads.find((item) => item.id === state.activeLeadId);
  if (!lead) return;
  lead[key] = key === "tags" ? splitTags(value) : key === "value" ? Number(value) : value;
  lead.updatedAt = now();
  await save();
}

async function completeFollowup(id) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  lead.lastContactedAt = todayOffset(0);
  lead.nextFollowUpAt = "";
  lead.nextAction = "";
  lead.notes.push(note("Marked follow-up as done.", "system"));
  lead.updatedAt = now();
  await save();
  toast("Follow-up completed");
  render();
}

function openDraft(id) {
  state.activeLeadId = id;
  render();
  setTimeout(() => {
    const output = document.querySelector("#ai-output");
    const lead = state.leads.find((item) => item.id === id);
    if (output && lead) output.value = templateFor(lead, "follow");
  });
}

function parsePastedLead() {
  const text = document.querySelector("#paste-box")?.value.trim();
  if (!text) {
    toast("Paste some lead info first");
    return;
  }
  const lead = normalizeLead(parseLeadText(text));
  const duplicate = findDuplicate(lead);
  if (duplicate && !confirm(`Possible duplicate found: ${safeName(duplicate)} — ${duplicate.company || "No company"}.\n\nCreate anyway?`)) {
    state.activeLeadId = duplicate.id;
    return;
  }
  state.leads.unshift(lead);
  state.activeLeadId = lead.id;
  save();
  toast("Lead parsed into Inbox");
}

function parseLeadText(text) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] || "";
  const website = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/i)?.[0] || "";
  const linkedinUrl = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+/i)?.[0] || "";
  const valueMatch = text.match(/(?:₹|rs\.?|inr|\$|usd)?\s?(\d+(?:,\d{3})*(?:\.\d+)?)(\s?k)?/i);
  const value = valueMatch ? Number(valueMatch[1].replace(/,/g, "")) * (valueMatch[2] ? 1000 : 1) : 0;
  const lower = text.toLowerCase();
  const company = guessCompany(text);
  const name = guessName(text, email, company);
  return {
    name,
    company,
    title: guessTitle(text),
    email,
    phone,
    website,
    linkedinUrl,
    source: lower.includes("linkedin") ? "LinkedIn" : lower.includes("conference") || lower.includes("met") ? "Conversation" : "Manual paste",
    stage: "inbox",
    value,
    currency: text.includes("₹") || lower.includes("inr") || lower.includes("rs") ? "INR" : state.settings.defaultCurrency,
    priority: lower.includes("hot") || lower.includes("urgent") || lower.includes("proposal") ? "high" : "medium",
    tags: inferTags(text),
    nextFollowUpAt: inferDate(text),
    nextAction: inferNextAction(text),
    notes: [note(text)],
    links: [],
    archived: false,
  };
}

function guessName(text, email, company) {
  const met = text.match(/\b(?:met|from|contact|lead)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (met && met[1] !== company) return met[1];
  if (email) return email.split("@")[0].split(/[._-]/).map(capitalize).join(" ");
  return "";
}

function guessCompany(text) {
  const from = text.match(/\bfrom\s+([A-Z][A-Za-z0-9&.\s]{2,40})(?:\.|,|$)/);
  if (from) return from[1].trim();
  const at = text.match(/\bat\s+([A-Z][A-Za-z0-9&.\s]{2,40})(?:\.|,|$)/);
  return at ? at[1].trim() : "";
}

function guessTitle(text) {
  const titles = ["founder", "ceo", "marketing head", "manager", "director", "owner", "lead", "consultant"];
  return titles.find((title) => text.toLowerCase().includes(title)) || "";
}

function inferTags(text) {
  const lower = text.toLowerCase();
  return ["website", "proposal", "warm", "budget", "linkedin", "agency", "startup"].filter((tag) => lower.includes(tag));
}

function inferDate(text) {
  const lower = text.toLowerCase();
  if (lower.includes("today")) return todayOffset(0);
  if (lower.includes("tomorrow")) return todayOffset(1);
  if (lower.includes("next week")) return todayOffset(7);
  if (lower.includes("next tuesday")) return nextWeekday(2);
  if (lower.includes("next monday")) return nextWeekday(1);
  if (lower.includes("next friday")) return nextWeekday(5);
  return "";
}

function nextWeekday(day) {
  const date = new Date();
  const diff = (day + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function inferNextAction(text) {
  const lower = text.toLowerCase();
  if (lower.includes("proposal")) return "Follow up about proposal";
  if (lower.includes("case study")) return "Send relevant case study";
  if (lower.includes("budget")) return "Confirm budget and scope";
  if (lower.includes("interested")) return "Send discovery email";
  return "Send a thoughtful follow-up";
}

function findDuplicate(lead) {
  return state.leads.find((item) => {
    const emailMatch = lead.email && item.email && lead.email.toLowerCase() === item.email.toLowerCase();
    const phoneMatch = lead.phone && item.phone && compact(lead.phone) === compact(item.phone);
    const nameCompany = lead.name && lead.company && compact(lead.name + lead.company) === compact(item.name + item.company);
    return emailMatch || phoneMatch || nameCompany;
  });
}

async function runAiAction(type) {
  const lead = state.leads.find((item) => item.id === state.activeLeadId);
  const output = document.querySelector("#ai-output");
  if (!lead || !output) return;
  if (!state.settings.aiApiKey) {
    output.value = type === "draft" ? templateFor(lead, lead.stage === "proposal" ? "proposal" : "follow") : localSuggestion(lead, type);
    toast("Used local fallback");
    return;
  }
  output.value = "Thinking...";
  try {
    const response = await fetch(state.settings.aiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.settings.aiApiKey}`,
        "HTTP-Referer": location.origin,
        "X-Title": "LeadMate",
      },
      body: JSON.stringify({
        model: state.settings.aiModel,
        messages: [
          { role: "system", content: "You are LeadMate, a concise sales follow-up assistant. Return practical, editable text." },
          { role: "user", content: aiPrompt(type, lead) },
        ],
      }),
    });
    const data = await response.json();
    output.value = data.choices?.[0]?.message?.content?.trim() || "No AI response returned.";
  } catch (error) {
    output.value = localSuggestion(lead, type);
    toast("AI call failed, used local fallback");
  }
}

function aiPrompt(type, lead) {
  const context = JSON.stringify({ ...lead, notes: lead.notes.map((item) => item.content) }, null, 2);
  if (type === "summary") return `Summarize this lead in one short paragraph:\n${context}`;
  if (type === "next") return `Suggest one next action for this lead. Keep it under 14 words:\n${context}`;
  return `Draft a concise follow-up message for this lead. Keep it warm and specific:\n${context}`;
}

function localSuggestion(lead, type) {
  if (type === "summary") return `${safeName(lead)} is a ${lead.priority} priority lead${lead.company ? ` from ${lead.company}` : ""}. Current stage is ${stageName(lead.stage)}. Next useful action: ${lead.nextAction || "send a thoughtful follow-up"}.`;
  if (type === "next") return lead.nextAction || inferNextAction(`${lead.stage} ${lead.notes.map((item) => item.content).join(" ")}`);
  return templateFor(lead, "follow");
}

function templateFor(lead, key) {
  return TEMPLATES[key].body
    .replaceAll("{{name}}", lead.name || "there")
    .replaceAll("{{company}}", lead.company || "your team")
    .replaceAll("{{nextAction}}", lead.nextAction || "set up the next conversation");
}

function addNote() {
  const lead = state.leads.find((item) => item.id === state.activeLeadId);
  const value = document.querySelector("#note-input")?.value.trim();
  if (!lead || !value) return;
  lead.notes.push(note(value));
  lead.updatedAt = now();
  save();
  toast("Note added");
}

function saveAiNote() {
  const lead = state.leads.find((item) => item.id === state.activeLeadId);
  const value = document.querySelector("#ai-output")?.value.trim();
  if (!lead || !value) return;
  lead.notes.push(note(value, "ai"));
  lead.updatedAt = now();
  save();
  toast("Saved to notes");
}

function saveSettings() {
  state.settings.aiEndpoint = document.querySelector("#aiEndpoint")?.value || state.settings.aiEndpoint;
  state.settings.aiModel = document.querySelector("#aiModel")?.value || state.settings.aiModel;
  state.settings.aiApiKey = document.querySelector("#aiApiKey")?.value || "";
  state.settings.aiProvider = document.querySelector("#aiProvider")?.value || state.settings.aiProvider;
  save();
  toast("Settings saved");
}

function syncStatusText() {
  if (state.settings.syncEnabled) {
    const lastSync = state.settings.lastSyncAt ? new Date(state.settings.lastSyncAt).toLocaleString() : "not synced yet";
    return `Sync active for ${escapeHtml(state.settings.accountEmail)}. Last sync: ${lastSync}.`;
  }
  return "Local-first and free. Register or log in to sync leads across devices for $5/month.";
}

async function registerOrLogin(mode) {
  const email = document.querySelector("#sync-email")?.value.trim();
  const password = document.querySelector("#sync-password")?.value.trim();
  if (!email || !password) {
    toast("Enter email and password");
    return;
  }
  state.settings.syncEnabled = true;
  state.settings.syncPlan = "leadmate-sync-monthly";
  state.settings.accountEmail = email;
  state.settings.lastSyncAt = now();
  await save();
  toast(`Sync ${mode}`);
}

async function syncNow() {
  if (!state.settings.syncEnabled) {
    state.syncOpen = true;
    toast("Register or log in to sync");
    return;
  }
  state.settings.lastSyncAt = now();
  await save();
  toast(`${state.leads.length} leads synced`);
}

async function disableSync() {
  state.settings.syncEnabled = false;
  state.settings.syncPlan = "";
  state.settings.lastSyncAt = "";
  await save();
  toast("Sync turned off");
}

function clearAiKey() {
  state.settings.aiApiKey = "";
  save();
  toast("AI key removed");
}

function toggleFocus() {
  state.settings.focusModeEnabled = !state.settings.focusModeEnabled;
  save();
  toast(state.settings.focusModeEnabled ? "Focus Mode on" : "Focus Mode off");
}

function activeLeads() {
  return state.leads.filter((lead) => !lead.archived);
}

function filteredLeads({ stage }) {
  return activeLeads().filter((lead) => lead.stage === stage);
}

function dueLeads() {
  return activeLeads().filter((lead) => lead.nextFollowUpAt && !["won", "lost"].includes(lead.stage) && !isFuture(lead.nextFollowUpAt));
}

function isFuture(date) {
  return date > todayOffset(0);
}

function isOverdue(date) {
  return date < todayOffset(0);
}

function matchesSearch(lead) {
  const query = state.search.toLowerCase().trim();
  if (!query) return true;
  const haystack = [
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.source,
    lead.nextAction,
    lead.tags.join(" "),
    lead.notes.map((item) => item.content).join(" "),
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function renderTags(lead) {
  return lead.tags.length ? lead.tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("") : `<span class="pill">untagged</span>`;
}

function followupLabel(lead) {
  if (!lead.nextFollowUpAt) return "No follow-up";
  if (isOverdue(lead.nextFollowUpAt)) return `Overdue ${lead.nextFollowUpAt}`;
  if (lead.nextFollowUpAt === todayOffset(0)) return "Follow up today";
  return `Follow up ${lead.nextFollowUpAt}`;
}

function stageName(id) {
  return STAGES.find((stage) => stage.id === id)?.name || id;
}

function safeName(lead) {
  if (!state.settings.focusModeEnabled) return escapeHtml(lead.name || lead.company || lead.email || "Untitled lead");
  const base = lead.name || lead.company || "Lead";
  const masked = base.includes(" ") ? `${base.split(" ")[0]} ${base.split(" ").at(-1).slice(0, 1)}.` : base;
  return escapeHtml(masked);
}

function formatValue(lead) {
  if (!lead.value) return "No value";
  if (state.settings.focusModeEnabled && state.settings.hideValuesInFocus) return "Value hidden";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: lead.currency || "USD", maximumFractionDigits: 0 }).format(lead.value);
}

function exportCsv() {
  const headers = ["name", "company", "title", "email", "phone", "source", "stage", "value", "currency", "priority", "tags", "nextFollowUpAt", "nextAction"];
  const rows = state.leads.map((lead) => headers.map((key) => csvCell(Array.isArray(lead[key]) ? lead[key].join(", ") : lead[key] || "")).join(","));
  download(`leadmate-${todayOffset(0)}.csv`, [headers.join(","), ...rows].join("\n"), "text/csv");
  toast("CSV exported");
}

function exportJson() {
  download(`leadmate-${todayOffset(0)}.json`, JSON.stringify({ leads: state.leads, settings: { ...state.settings, aiApiKey: "" } }, null, 2), "application/json");
  toast("JSON exported");
}

function importCsv(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const [headerLine, ...lines] = String(reader.result).split(/\r?\n/).filter(Boolean);
    const headers = parseCsvLine(headerLine).map((h) => h.trim());
    const imported = lines.map((line) => {
      const values = parseCsvLine(line);
      const raw = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
      return normalizeLead({ ...raw, stage: raw.stage || "inbox", tags: splitTags(raw.tags), notes: raw.notes ? [note(raw.notes)] : [] });
    });
    state.leads = [...imported, ...state.leads];
    await save();
    toast(`Imported ${imported.length} leads`);
    render();
  };
  reader.readAsText(file);
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function clearData() {
  if (!confirm("Clear all local leads from this browser?")) return;
  state.leads = [];
  save();
  toast("Local leads cleared");
}

function loadSamples() {
  state.leads = sampleLeads.map(normalizeLead);
  save();
  toast("Sample data loaded");
}

function copyText(value) {
  navigator.clipboard?.writeText(value);
  toast("Copied");
}

function toast(message) {
  state.toast = message;
  clearTimeout(window.__leadmateToast);
  window.__leadmateToast = setTimeout(() => {
    state.toast = "";
    render();
  }, 2200);
}

function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function compact(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

init();
