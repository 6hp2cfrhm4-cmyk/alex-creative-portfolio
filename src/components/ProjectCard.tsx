import { Link } from "react-router-dom";
import type { Project } from "../content/projects";
import { ProjectArtwork } from "./ProjectArtwork";
import { Reveal } from "./Reveal";

export function ProjectCard({ project, variant }: { project: Project; variant: "wide" | "half" }) {
  return (
    <Reveal className={`project-card project-card--${variant} project-card--${project.theme}`}>
      <Link className="project-card__link" to={`/work/${project.slug}`} aria-label={`View the ${project.name} case study`}>
        <div className="project-card__art">
          <ProjectArtwork slug={project.slug} compact />
          <span className="project-card__index">{project.index}</span>
          <span className="project-card__visit" aria-hidden="true">↗</span>
        </div>
        <div className="project-card__meta">
          <div>
            <h3>{project.name}</h3>
            <p>{project.shortDescription}</p>
          </div>
          <span className="project-card__category">{project.category}</span>
        </div>
      </Link>
    </Reveal>
  );
}
