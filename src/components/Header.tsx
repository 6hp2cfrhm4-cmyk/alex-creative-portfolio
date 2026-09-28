import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const onHome = location.pathname === "/";
  const workHref = onHome ? "#work" : "/#work";
  const aboutHref = onHome ? "#about" : "/#about";
  const contactHref = onHome ? "#contact" : "/#contact";

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    if (menuOpen) menuButtonRef.current?.focus();
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="wordmark" to="/" aria-label="Alex, home">
          <span className="wordmark__symbol">A</span>
          <span>Alex<span className="wordmark__slash"> / </span>creative development</span>
        </Link>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className={`menu-toggle__icon${menuOpen ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="primary-navigation" className={`primary-nav${menuOpen ? " is-open" : ""}`} aria-label="Primary navigation">
          <a href={workHref} onClick={closeMenu}>Selected work</a>
          <a href={aboutHref} onClick={closeMenu}>About</a>
          <a className="primary-nav__contact" href={contactHref} onClick={closeMenu}>
            Contact <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
