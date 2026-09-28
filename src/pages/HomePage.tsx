import { Link } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";
import { projects } from "../content/projects";

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__topline">
          <span>Independent creative developer</span>
          <span className="availability"><i /> Independent practice · 2026</span>
        </div>
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="hero__eyebrow">Web · Product · 3D</p>
            <h1 id="hero-heading">Web experiences<br />with a point<br />of <span>view.</span></h1>
            <div className="hero__intro">
              <p>Creative direction and engineering for brands that want to feel unmistakably themselves.</p>
              <a href="#work" className="text-link">Explore selected work <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero__visual" aria-label="Original architectural study for Casa Marea">
            <img src="/images/casa-marea.webp" alt="An original architectural study of a stone coastal retreat above a Mediterranean cove" fetchPriority="high" />
            <div className="hero__image-border" />
            <div className="hero__image-caption"><span>CONCEPT / CASA MAREA</span><span>MEDITERRANEAN COAST</span></div>
            <Link to="/work/casa-marea" className="hero__project-stamp"><span>DISCOVER</span><b>↗</b></Link>
          </div>
        </div>
        <div className="hero__baseline"><span>Design that earns its detail.</span><span>Scroll to see the work <b aria-hidden="true">↓</b></span></div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Selected work <span>— 2026</span></p>
            <h2 id="work-heading">Different problems.<br /><em>Different worlds.</em></h2>
          </div>
          <p className="section-aside">Independent concept projects exploring the meeting point of identity, interface, and code.</p>
        </div>

        <div className="project-grid">
          <ProjectCard project={projects[0]} variant="wide" />
          <ProjectCard project={projects[1]} variant="half" />
          <ProjectCard project={projects[2]} variant="half" />
        </div>
      </section>

      <section className="capabilities-section" aria-labelledby="capabilities-heading">
        <Reveal className="capabilities-section__intro">
          <p className="section-index">What I bring</p>
          <h2 id="capabilities-heading">A small studio,<br /><em>in one person.</em></h2>
          <p>From the first visual idea to the last interaction: considered work, carried through.</p>
        </Reveal>
        <div className="capabilities-list">
          <Reveal className="capability-row" delay={60}><span className="capability-row__number">01</span><h3>Art direction<br className="desktop-only" /> & identity</h3><p>Finding the visual language that makes a brand feel like no one else.</p><span className="capability-row__glyph" aria-hidden="true">◷</span></Reveal>
          <Reveal className="capability-row" delay={120}><span className="capability-row__number">02</span><h3>Websites<br className="desktop-only" /> & storytelling</h3><p>Image-led, editorial, and interactive sites that give good work room.</p><span className="capability-row__glyph" aria-hidden="true">↗</span></Reveal>
          <Reveal className="capability-row" delay={180}><span className="capability-row__number">03</span><h3>Product<br className="desktop-only" /> & interface</h3><p>Thoughtful product surfaces for people who have real work to do.</p><span className="capability-row__glyph" aria-hidden="true">⌘</span></Reveal>
          <Reveal className="capability-row" delay={240}><span className="capability-row__number">04</span><h3>Creative<br className="desktop-only" /> development</h3><p>Motion, 3D, and the technical detail behind the moments people notice.</p><span className="capability-row__glyph" aria-hidden="true">◎</span></Reveal>
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-heading">
        <Reveal className="about-section__marker"><span className="about-section__dot" /><span>Independent by choice</span></Reveal>
        <div className="about-section__body">
          <p className="section-index">A little about the practice</p>
          <h2 id="about-heading">The best work happens<br />when <em>design and code<br />sit at the same table.</em></h2>
          <div className="about-section__bottom">
            <p>I work end to end: ask better questions, shape a clear visual idea, and build the real thing with care. One point of contact from the first sketch to the last pull request.</p>
            <div className="expertise-tags"><span>Creative direction</span><span>Interactive web</span><span>3D & WebGL</span><span>React & TypeScript</span><span>Product design</span></div>
          </div>
        </div>
        <div className="about-section__index" aria-hidden="true">A<span>/</span>01</div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-heading">
        <Reveal>
          <p className="section-index">Next, together</p>
          <h2 id="contact-heading">Have something<br />worth <em>looking closer at?</em></h2>
          <p className="contact-section__note">Good projects start with a good conversation.</p>
          <p className="contact-signoff">Let’s work together.</p>
        </Reveal>
        <span className="contact-section__orb" aria-hidden="true" />
      </section>
    </div>
  );
}
