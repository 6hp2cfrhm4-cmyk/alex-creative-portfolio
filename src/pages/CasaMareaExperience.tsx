import { Link } from "react-router-dom";
import { ProjectArtwork } from "../components/ProjectArtwork";
import { Reveal } from "../components/Reveal";
import type { Project } from "../content/projects";

export function CasaMareaExperience({ project, nextProject }: { project: Project; nextProject: Project }) {
  return (
    <article className="case-study marea-case-study" aria-labelledby="marea-title">
      <div className="marea-context">
        <Link to="/#work" className="marea-context__back">← All work</Link>
        <p>01 / 03 <span>Independent concept · 2026</span></p>
        <span className="marea-context__disclosure">Fictional hospitality identity, created for this portfolio</span>
      </div>

      <header className="marea-masthead">
        <a className="marea-wordmark" href="#marea-home" aria-label="Casa Marea, back to top">casa <em>marea</em></a>
        <nav aria-label="Casa Marea sections">
          <a href="#marea-place">The house</a>
          <a href="#marea-courtyard">The courtyard</a>
          <a href="#marea-notes">Design notes</a>
        </nav>
      </header>

      <section className="marea-hero" id="marea-home" aria-labelledby="marea-title">
        <img
          src="/images/casa-marea.webp"
          alt="Sunlit limestone terraces descend through pine trees toward a quiet Mediterranean cove."
          decoding="async"
        />
        <div className="marea-hero__shade" />
        <div className="marea-hero__content">
          <p className="marea-kicker">A fictional retreat · Mediterranean coast</p>
          <h1 id="marea-title">A slower kind<br />of stay.</h1>
          <p className="marea-hero__intro">Between the pines and the water,<br />the day finds its own pace.</p>
          <a className="marea-enter" href="#marea-place">Discover the house <span aria-hidden="true">↓</span></a>
        </div>
        <p className="marea-hero__side-note">Stone / shade / sea</p>
        <span className="marea-hero__index">Casa Marea <b>—</b> 01</span>
      </section>

      <section className="marea-place" id="marea-place">
        <Reveal className="marea-place__label"><span>01 — The setting</span><span>A study in quiet architecture</span></Reveal>
        <div className="marea-place__body">
          <Reveal>
            <h2>Set into the coast.<br /><em>Open to the day.</em></h2>
          </Reveal>
          <Reveal className="marea-place__copy" delay={100}>
            <p>Casa Marea is imagined as a house shaped by what is already here: pale stone, pine shade, salt air and a long view across the cove.</p>
            <p>The identity leaves space around those details. It lets the landscape set the tone before the interface says another word.</p>
            <a href="#marea-courtyard">Walk through the house <span aria-hidden="true">↘</span></a>
          </Reveal>
        </div>
        <div className="marea-material-line" aria-label="Casa Marea material palette">
          <span><i className="marea-material-line__stone" /> Limestone</span>
          <span><i className="marea-material-line__pine" /> Pine shade</span>
          <span><i className="marea-material-line__water" /> Deep water</span>
          <span className="marea-material-line__note">A palette taken from the coast</span>
        </div>
      </section>

      <section className="marea-courtyard" id="marea-courtyard" aria-labelledby="marea-courtyard-title">
        <div className="marea-courtyard__image">
          <img
            src="/images/casa-marea-courtyard.webp"
            alt="An olive tree shades a limestone courtyard beside a narrow reflecting pool."
            loading="lazy"
            decoding="async"
          />
          <span>Scene 02 / The shaded court</span>
        </div>
        <Reveal className="marea-courtyard__caption">
          <p className="marea-kicker">The courtyard</p>
          <h2 id="marea-courtyard-title">A room<br />without a roof.</h2>
          <p>Olive leaves break the light over limestone and still water. The courtyard is the quiet center of the house: open to the air, held by the walls around it.</p>
          <span className="marea-courtyard__marker">A pause in the day <i aria-hidden="true" /></span>
        </Reveal>
      </section>

      <section className="marea-day" aria-labelledby="marea-day-title">
        <div className="marea-day__heading">
          <p className="marea-kicker">02 — A day at the house</p>
          <h2 id="marea-day-title">Nothing to<br /><em>keep up with.</em></h2>
        </div>
        <ol className="marea-day__list">
          <li><span>Morning</span><p>A path through pine shade, with the water appearing between the trees.</p></li>
          <li><span>Midday</span><p>Cool stone inside; a long view back to the edge of the cove.</p></li>
          <li><span>Evening</span><p>The courtyard holds the last light after the sun leaves the terrace.</p></li>
        </ol>
      </section>

      <section className="marea-statement">
        <p className="marea-kicker">The point of view</p>
        <p className="marea-statement__line">Less to plan.<br /><em>More to notice.</em></p>
        <span>CASA MAREA / A FICTIONAL PLACE, DRAWN FROM THE LANDSCAPE</span>
      </section>

      <section className="marea-notes" id="marea-notes" aria-labelledby="marea-notes-title">
        <div className="marea-notes__heading">
          <p className="marea-kicker">03 — The design study</p>
          <h2 id="marea-notes-title">A place with a point of view.</h2>
          <p>Casa Marea is an independent concept project. The identity, story and imagery are fictional and made for this portfolio.</p>
        </div>
        <div className="marea-notes__grid">
          <Reveal><span>Brief</span><p>{project.challenge}</p></Reveal>
          <Reveal delay={80}><span>Direction</span><p>{project.direction}</p></Reveal>
          <Reveal delay={150}><span>Interaction</span><p>{project.interaction}</p></Reveal>
        </div>
        <div className="marea-notes__outcome">
          <span>Outcome</span>
          <p>{project.outcome}</p>
        </div>
        <dl className="marea-project-meta">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Scope</dt><dd>{project.disciplines.join(" · ")}</dd></div>
          <div><dt>Tools</dt><dd>{project.tools.join(" · ")}</dd></div>
        </dl>
      </section>

      <Link className={"next-project next-project--" + nextProject.theme} to={"/work/" + nextProject.slug}>
        <div><span>Next project <b aria-hidden="true">↗</b></span><p>{nextProject.name}</p><small>{nextProject.shortDescription}</small></div>
        <div className="next-project__art"><ProjectArtwork slug={nextProject.slug} compact /></div>
      </Link>
    </article>
  );
}
