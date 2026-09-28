import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="section-index">That page went somewhere else.</p>
      <h1>Not here.<br /><em>Not this time.</em></h1>
      <Link className="contact-cta" to="/">Back to the work <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
