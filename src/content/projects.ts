export type ProjectSlug = "casa-marea" | "aer" | "relay";

export interface Project {
  slug: ProjectSlug;
  index: string;
  name: string;
  category: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  year: string;
  role: string;
  disciplines: string[];
  tools: string[];
  challenge: string;
  direction: string;
  system: string;
  interaction: string;
  outcome: string;
  note: string;
  next: ProjectSlug;
  theme: "marea" | "aer" | "relay";
}

export const projects: Project[] = [
  {
    slug: "casa-marea",
    index: "01",
    name: "Casa Marea",
    category: "Hospitality · Brand site",
    shortDescription: "A coastal retreat, told at the pace of the tide.",
    heroTitle: "A slower kind of stay.",
    heroDescription: "A fictional hospitality concept shaped around the quiet architecture of a Mediterranean cove.",
    year: "2026",
    role: "Art direction, design, development",
    disciplines: ["Brand website", "Editorial design", "Motion"],
    tools: ["React", "TypeScript", "CSS motion"],
    challenge: "Give a small coastal retreat a digital presence that feels as considered as the place itself, without turning the experience into a booking funnel.",
    direction: "The story follows a day at the house: arriving through the pines, opening toward the water, and ending in the stillness of the courtyard. Photography leads; copy leaves room to breathe.",
    system: "A restrained palette of salt, cypress, and deep water sits beside a high-contrast editorial serif. Wide image crops, fine rules, and generous margins make the architecture the loudest element.",
    interaction: "The story opens on the cove, cuts to a shaded courtyard, then moves into the design notes. The sequence is deliberately simple: let the architecture lead before the interface explains it.",
    outcome: "The concept brings the retreat's setting and design direction into one editorial route, supported by original imagery and a restrained visual system. It is a visual study, not a booking or property-information service.",
    note: "Independent concept project. Casa Marea is fictional; all imagery and content were created for this portfolio.",
    next: "aer",
    theme: "marea",
  },
  {
    slug: "aer",
    index: "02",
    name: "AER",
    category: "Product · Real-time 3D",
    shortDescription: "A product page you can turn in your hands.",
    heroTitle: "Sound, made physical.",
    heroDescription: "A fictional headphone launch built around material, fit, and a real-time product configurator.",
    year: "2026",
    role: "Product direction, interaction, development",
    disciplines: ["3D product story", "Configurator", "Motion"],
    tools: ["React", "Three.js", "TypeScript"],
    challenge: "Make a considered pair of headphones feel tangible online, while giving people an easy way to understand how finish and form change together.",
    direction: "The product is the interface. A dark listening-room canvas, precise technical notes, and a single floating model create a clear place to explore without surrounding the object with UI.",
    system: "Graphite, mineral, and cobalt finishes share one material system. Typography pairs a compact geometric display face with calm product copy and short, useful annotations.",
    interaction: "Drag to inspect the object, change its finish, and follow a restrained scroll sequence from silhouette to material detail. The 3D model is procedural, lazy-loaded, and capped at a modest device pixel ratio.",
    outcome: "The concept pairs a draggable procedural headphone model with a finish selector and concise product specifications. It has no purchase action or live commerce.",
    note: "Independent concept project. AER and the product are fictional; the 3D object is generated from original geometry in the browser.",
    next: "relay",
    theme: "aer",
  },
  {
    slug: "relay",
    index: "03",
    name: "Relay",
    category: "Digital product · SaaS",
    shortDescription: "A calmer operating view for small creative teams.",
    heroTitle: "A clearer way to move work.",
    heroDescription: "An illustrative product concept for studios balancing project delivery, team capacity, and the next decision.",
    year: "2026",
    role: "Product design, interface, development",
    disciplines: ["Dashboard", "Data visualization", "Interaction"],
    tools: ["React", "TypeScript", "CSS"],
    challenge: "Give a studio one useful view of work in motion. Typical project tools separate timeline, capacity, and blockers across places, making the daily review harder than it needs to be.",
    direction: "A dense but quiet workspace: clear navigation, one primary chart, a compact project queue, and an explicit signal for work that needs attention.",
    system: "The interface uses a paper-white canvas, ink typography, blue for active work, and coral only for items that need review. Spacing groups information before borders do.",
    interaction: "Switch between weekly and monthly views, move across Overview, Projects, and Team, and inspect the status of each workstream. The sample figures are illustrative and change with the selected view.",
    outcome: "The concept brings delivery, workload, and review status into one understandable surface. It is a functional prototype of the interface, not a connected project-management service.",
    note: "Independent concept project. Relay is fictional, and every number shown is illustrative interface data rather than a client result.",
    next: "casa-marea",
    theme: "relay",
  },
];

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
