import { useState } from "react";

type DashboardView = "Overview" | "Projects" | "Team";
type Period = "Week" | "Month";

interface WorkloadSample {
  hours: string;
  delivery: string;
  active: string;
  plannedPath: string;
  capacityPath: string;
  labels: string[];
}

interface Metric {
  label: string;
  value: string;
  detail: string;
}

interface ProjectSample {
  initial: string;
  name: string;
  detail: string;
  status: string;
  tone: "blue" | "peach" | "neutral";
  progress: number;
}

const samples: Record<Period, WorkloadSample> = {
  Week: {
    hours: "128 h",
    delivery: "82%",
    active: "08",
    plannedPath: "M12 102 C42 86 55 91 82 72 S126 72 147 50 S190 57 211 39 S250 48 273 27 S320 38 349 14",
    capacityPath: "M12 9 C64 9 83 11 119 9 S196 10 235 9 S311 9 349 9",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  Month: {
    hours: "486 h",
    delivery: "76%",
    active: "12",
    plannedPath: "M12 87 C42 102 58 63 83 75 S125 46 150 55 S190 40 214 51 S250 20 276 39 S320 29 349 14",
    capacityPath: "M12 9 C64 9 83 11 119 9 S196 10 235 9 S311 9 349 9",
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7"],
  },
};

const projects: ProjectSample[] = [
  { initial: "S", name: "Studio North", detail: "Brand system · Due 18 Oct", status: "In progress", tone: "blue", progress: 68 },
  { initial: "F", name: "Fieldwork", detail: "Digital launch · Due 22 Oct", status: "Review needed", tone: "peach", progress: 41 },
  { initial: "A", name: "Alder House", detail: "Commerce refresh · Due 28 Oct", status: "In progress", tone: "blue", progress: 57 },
  { initial: "C", name: "Common Thread", detail: "Editorial platform · Due 04 Nov", status: "In planning", tone: "neutral", progress: 24 },
];

const team = [
  { initials: "AM", name: "Alex Morgan", role: "Design & direction", week: 24, month: 98 },
  { initials: "NB", name: "Nia Bennett", role: "Product design", week: 20, month: 82 },
  { initials: "PS", name: "Parker Shaw", role: "Engineering", week: 26, month: 104 },
  { initials: "JL", name: "Jamie Lee", role: "Creative development", week: 18, month: 68 },
  { initials: "RD", name: "Rory Diaz", role: "Brand & content", week: 22, month: 78 },
  { initials: "MK", name: "Mina Kim", role: "Production", week: 18, month: 56 },
];

function getMetrics(view: DashboardView, period: Period, sample: WorkloadSample): Metric[] {
  if (view === "Projects") {
    return [
      { label: "Active projects", value: "08", detail: "Across three workstreams" },
      { label: "Needs review", value: "02", detail: "Decisions due this week" },
      { label: "On schedule", value: sample.delivery, detail: "Of current milestones" },
    ];
  }

  if (view === "Team") {
    const isWeek = period === "Week";
    return [
      { label: "Planned hours", value: sample.hours, detail: `Across 6 people this ${period.toLowerCase()}` },
      { label: "Booked capacity", value: isWeek ? "53%" : "47%", detail: "Of available team time" },
      { label: "Time available", value: isWeek ? "112 h" : "546 h", detail: `Unassigned this ${period.toLowerCase()}` },
    ];
  }

  return [
    { label: "Team hours", value: sample.hours, detail: "Across 6 active people" },
    { label: "On schedule", value: sample.delivery, detail: "Of current milestones" },
    { label: "In progress", value: sample.active, detail: "Across 3 workstreams" },
  ];
}

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="relay-metrics">
      {metrics.map((metric) => (
        <div className="relay-metric" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </div>
      ))}
    </div>
  );
}

function WorkloadPanel({
  sample,
  period,
  compact,
  interactive,
  onPeriodChange,
}: {
  sample: WorkloadSample;
  period: Period;
  compact: boolean;
  interactive: boolean;
  onPeriodChange: (period: Period) => void;
}) {
  return (
    <section className="relay-chart-panel" aria-labelledby={`relay-workload-${compact ? "small" : "large"}`}>
      <div className="relay-panel-heading">
        <div>
          <h4 id={`relay-workload-${compact ? "small" : "large"}`}>Workload</h4>
          <p>Planned hours against team capacity</p>
        </div>
        {interactive && (
          <div className="relay-period" role="group" aria-label="Workload date range">
            {(["Week", "Month"] as const).map((item) => (
              <button key={item} type="button" aria-pressed={period === item} onClick={() => onPeriodChange(item)}>
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relay-chart" aria-label={`${period} workload chart showing planned hours and team capacity`} role="img">
        <div className="relay-chart__grid"><i /><i /><i /><i /></div>
        <svg viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`relayFill-${compact ? "small" : "large"}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#4668d8" stopOpacity=".2" />
              <stop offset="1" stopColor="#4668d8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="relay-chart__fill" d={`${sample.plannedPath} L349 120 L12 120 Z`} fill={`url(#relayFill-${compact ? "small" : "large"})`} />
          <path className="relay-chart__capacity" d={sample.capacityPath} fill="none" stroke="#c4d0cc" strokeWidth="1.6" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <path className="relay-chart__line" d={sample.plannedPath} fill="none" stroke="#4164d4" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
          <circle cx="349" cy="14" r="4" fill="#fff" stroke="#4164d4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relay-chart__labels">{sample.labels.map((label) => <span key={label}>{label}</span>)}</div>
      </div>
      <div className="relay-chart-legend"><span><i /> Planned</span><span><i /> Capacity</span></div>
    </section>
  );
}

function ProjectRow({ project }: { project: ProjectSample }) {
  return (
    <div className="relay-project-row">
      <span className={`relay-project-mark relay-project-mark--${project.tone}`}>{project.initial}</span>
      <span>
        <strong>{project.name}</strong>
        <small>{project.detail}<span className="relay-project-mobile-status"> · {project.status}</span></small>
      </span>
      <span className={`relay-status relay-status--${project.tone}`}>{project.status}</span>
      <span className={`relay-row-progress relay-row-progress--${project.tone}`} role="progressbar" aria-label={`${project.name} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress}>
        <i style={{ width: `${project.progress}%` }} />
      </span>
    </div>
  );
}

function ProjectPulse({ onOpenProjects, interactive }: { onOpenProjects: () => void; interactive: boolean }) {
  return (
    <section className="relay-projects-panel" aria-labelledby="relay-project-pulse">
      <div className="relay-panel-heading">
        <div>
          <h4 id="relay-project-pulse">Project pulse</h4>
          <p>Work that needs a little attention</p>
        </div>
        {interactive ? (
          <button type="button" onClick={onOpenProjects}>View projects <span aria-hidden="true">↗</span></button>
        ) : (
          <span className="relay-view-projects">View projects <span aria-hidden="true">↗</span></span>
        )}
      </div>
      <ProjectRow project={projects[0]} />
      <ProjectRow project={projects[1]} />
    </section>
  );
}

function ProjectList() {
  return (
    <section className="relay-projects-panel relay-projects-panel--list" aria-labelledby="relay-project-list">
      <div className="relay-panel-heading">
        <div>
          <h4 id="relay-project-list">Active projects</h4>
          <p>Showing four priority projects of eight active</p>
        </div>
      </div>
      {projects.map((project) => <ProjectRow key={project.name} project={project} />)}
    </section>
  );
}

function TeamCapacity({ period }: { period: Period }) {
  const isWeek = period === "Week";
  const capacity = isWeek ? 40 : 172;

  return (
    <section className="relay-projects-panel relay-team-panel" aria-labelledby="relay-team-capacity">
      <div className="relay-panel-heading">
        <div>
          <h4 id="relay-team-capacity">Capacity by person</h4>
          <p>Planned hours against {isWeek ? "a 40-hour week" : "a 172-hour month"}</p>
        </div>
      </div>
      {team.map((person) => {
        const hours = person[isWeek ? "week" : "month"];
        const percentage = Math.round((hours / capacity) * 100);
        return (
          <div className="relay-project-row relay-team-row" key={person.name}>
            <span className="relay-project-mark relay-project-mark--blue">{person.initials}</span>
            <span>
              <strong>{person.name}</strong>
              <small>{person.role} · {hours} / {capacity} h</small>
            </span>
            <span className="relay-status relay-status--blue">{hours} / {capacity} h</span>
            <span className="relay-row-progress" role="meter" aria-label={`${person.name} planned capacity`} aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={hours}>
              <i style={{ width: `${percentage}%` }} />
            </span>
          </div>
        );
      })}
    </section>
  );
}

export function RelayDashboard({ compact = false, interactive = true }: { compact?: boolean; interactive?: boolean }) {
  const [view, setView] = useState<DashboardView>("Overview");
  const [period, setPeriod] = useState<Period>("Week");
  const sample = samples[period];
  const title = view === "Overview" ? "Studio overview" : view === "Projects" ? "Project pulse" : "Team capacity";
  const description = view === "Overview"
    ? "Here’s what’s moving across your studio."
    : view === "Projects"
      ? "Track the work, deadlines, and decisions in one place."
      : "See how planned work is spread across the team.";
  const navigation = (["Overview", "Projects", "Team"] as const).map((item) => {
    const content = <><span className={`relay-nav__glyph relay-nav__glyph--${item.toLowerCase()}`} aria-hidden="true" />{item}{item === "Projects" && <span className="relay-nav__count">8</span>}</>;
    return interactive ? (
      <button className={view === item ? "is-current" : ""} key={item} type="button" aria-current={view === item ? "page" : undefined} onClick={() => setView(item)}>{content}</button>
    ) : (
      <span className={`relay-nav__item${view === item ? " is-current" : ""}`} key={item}>{content}</span>
    );
  });

  return (
    <div className={`relay-dashboard${compact ? " relay-dashboard--compact" : ""}`}>
      <div className="relay-sidebar">
        <div className="relay-logo"><span>r</span> relay</div>
        <div className="relay-workspace"><span className="relay-workspace__avatar">N</span><span>Northline Studio</span><span aria-hidden="true">⌄</span></div>
        <p className="relay-nav-label">Workspace</p>
        {interactive ? <nav className="relay-nav" aria-label="Relay sections">{navigation}</nav> : <div className="relay-nav" aria-hidden="true">{navigation}</div>}
        <div className="relay-sidebar__bottom"><span className="relay-avatar">AM</span><span>Alex Morgan</span><span aria-hidden="true">···</span></div>
      </div>

      <div className="relay-main">
        <div className="relay-topbar">
          <div className="relay-breadcrumb">Workspace <span>/</span> {view}</div>
          <div className="relay-topbar__right"><span className="relay-preview-dot" aria-hidden="true" /> Preview data <span className="relay-topbar__avatar">AM</span></div>
        </div>
        {interactive && <nav className="relay-mobile-nav" aria-label="Relay sections">{navigation}</nav>}
        <div className="relay-content">
          <div className="relay-heading">
            <div>
              <p className="relay-overline">Monday, 12 October 2026</p>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            {interactive && view !== "Projects" && <button className="relay-add" type="button" onClick={() => setView("Projects")}><span aria-hidden="true">＋</span> Open projects</button>}
          </div>
          <MetricGrid metrics={getMetrics(view, period, sample)} />
          {view !== "Projects" && (
            <WorkloadPanel sample={sample} period={period} compact={compact} interactive={interactive} onPeriodChange={setPeriod} />
          )}
          {view === "Overview" && <ProjectPulse interactive={interactive} onOpenProjects={() => setView("Projects")} />}
          {view === "Projects" && <ProjectList />}
          {view === "Team" && <TeamCapacity period={period} />}
          <p className="relay-disclaimer">Illustrative concept data · not connected to a live workspace</p>
        </div>
      </div>
    </div>
  );
}
