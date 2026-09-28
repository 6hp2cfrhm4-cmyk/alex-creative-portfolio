import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <p className="footer-note">Independent creative developer<br />Working across design and code.</p>
        <Link className="footer-contact" to="/#contact">
          Have a good problem?
          <span>Let’s talk <span aria-hidden="true">↗</span></span>
        </Link>
      </div>
      <div className="site-footer__bottom">
        <Link className="footer-mark" to="/" aria-label="Alex, back to top">A.</Link>
        <p>© {new Date().getFullYear()} Alex. Independent concept work.</p>
        <a href="#main-content" className="back-to-top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
