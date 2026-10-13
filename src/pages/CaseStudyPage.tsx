import { lazy, Suspense, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ProjectArtwork } from "../components/ProjectArtwork";
import { Reveal } from "../components/Reveal";
import { RelayDashboard } from "../components/RelayDashboard";
import { getProject, projects } from "../content/projects";
import { CasaMareaExperience } from "./CasaMareaExperience";

const HeadphoneExperience = lazy(() =>
  import("../three/HeadphoneExperience").then(({ HeadphoneExperience: Experience }) => ({ default: Experience })),
);

function ArtworkContent({ slug }: { slug: string }) {
  if (slug === "aer") {
    return (
      <Suspense fallback={<div className="aer-module-fallback" role="status">Preparing the product view…</div>}>
        <HeadphoneExperience />
      </Suspense>
    );
  }
  if (slug === "relay") return <RelayDashboard />;
  return <ProjectArtwork slug={slug} />;
}

export default function CaseStudyPage() {
  const { slug } = useParams();
  const project = getProject(slug);

  useEffect(() => {
    if (!project) return;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = project.name + " — Alex, creative development";
    if (description) description.content = project.heroDescription;
    return () => {
      document.title = "Alex — Creative development";
      if (description && previousDescription) description.content = previousDescription;
    };
  }, [project]);

  if (!project) return <Navigate to="/not-found" replace />;
  if (project.slug === "kern") return <Navigate to="/kern" replace />;

  const next = projects.find((item) => item.slug === project.next)!;
  if (project.slug === "casa-marea") return <CasaMareaExperience project={project} nextProject={next} />;

  return (
    <article className={"case-study case-study--" + project.theme}>
      <section className="case-hero">
        <div className="case-hero__topline"><Link to="/#work">← All work</Link><span>{project.category}</span><span>{project.year}</span></div>
        <div className="case-hero__heading">
          <p className="section-index">Independent concept · {project.index}</p>
          <h1>{project.heroTitle}</h1>
          <p>{project.heroDescription}</p>
        </div>
        <div className="case-hero__art"><ArtworkContent slug={project.slug} /></div>
        <div className="case-hero__meta">
          <div><span>Role</span><p>{project.role}</p></div>
          <div><span>Scope</span><p>{project.disciplines.join(" · ")}</p></div>
          <div><span>Tools</span><p>{project.tools.join(" · ")}</p></div>
          <a href="#project-story" className="case-hero__scroll">Explore the project <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="project-story" className="case-intro">
        <Reveal className="case-intro__label"><span>01</span><span>The brief</span></Reveal>
        <Reveal className="case-intro__body"><p className="case-lead">{project.challenge}</p><p className="case-note">{project.note}</p></Reveal>
      </section>

      <section className="case-art-panel">
        <div className={"case-art-panel__graphic case-art-panel__graphic--" + project.theme}>
          <div className="case-art-panel__rule"><span>FIELD NOTE</span><span>07 / {project.name.toUpperCase()}</span></div>
          <p>{project.theme === "aer" ? "A form that rewards a closer look." : "The whole week, in one useful view."}</p>
          <span className="case-art-panel__index">{project.index} <b>/ 03</b></span>
        </div>
      </section>

      <section className="case-details">
        <Reveal className="case-details__item"><span className="case-details__number">02 / Direction</span><h2>A point of view,<br /><em>made useful.</em></h2><p>{project.direction}</p></Reveal>
        <Reveal className="case-details__item" delay={90}><span className="case-details__number">03 / Design system</span><h2>Every detail<br /><em>has a reason.</em></h2><p>{project.system}</p><div className={"case-swatch case-swatch--" + project.theme}><i /><i /><i /><i /><span>Surface, signal, depth, and detail.</span></div></Reveal>
        <Reveal className="case-details__item" delay={150}><span className="case-details__number">04 / Interaction</span><h2>More than<br /><em>a nice scroll.</em></h2><p>{project.interaction}</p></Reveal>
      </section>

      <section className={"case-outcome case-outcome--" + project.theme}>
        <Reveal><span className="case-details__number">05 / The result</span><p>{project.outcome}</p></Reveal>
      </section>

      <Link className={"next-project next-project--" + next.theme} to={"/work/" + next.slug}>
        <div><span>Next project <b aria-hidden="true">↗</b></span><p>{next.name}</p><small>{next.shortDescription}</small></div>
        <div className="next-project__art"><ProjectArtwork slug={next.slug} compact /></div>
      </Link>
    </article>
  );
}
