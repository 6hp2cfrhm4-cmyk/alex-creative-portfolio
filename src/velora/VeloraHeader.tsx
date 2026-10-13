import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "#services", label: "Услуги" },
  { href: "#masters", label: "Мастера" },
  { href: "#gallery", label: "Работы" },
  { href: "#about", label: "О салоне" },
  { href: "#contacts", label: "Контакты" },
];

export function VeloraHeader({ onBooking }: { onBooking: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    nav.current?.querySelector<HTMLElement>("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key !== "Tab") return;
      const focusable = nav.current?.querySelectorAll<HTMLElement>("a, button");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const startBooking = () => {
    closeMenu();
    onBooking();
  };

  return (
    <header className={`velora-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " menu-is-open" : ""}`}>
      <a className="velora-wordmark" href="#top" aria-label="VELORA — в начало страницы">
        <span className="velora-wordmark__mark" aria-hidden="true">V</span>
        <span className="velora-wordmark__name">VELORA<small>BEAUTY HOUSE</small></span>
      </a>

      <button
        ref={menuButton}
        className="velora-menu-toggle"
        type="button"
        aria-controls="velora-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span>{menuOpen ? "Закрыть" : "Меню"}</span>
        <span className={`velora-menu-toggle__icon${menuOpen ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span>
      </button>

      <nav ref={nav} id="velora-navigation" className={`velora-nav${menuOpen ? " is-open" : ""}`} aria-label="Основная навигация">
        {navItems.map((item) => <a href={item.href} key={item.href} onClick={closeMenu}>{item.label}</a>)}
        <button className="velora-nav__mobile-booking" type="button" onClick={startBooking}>Записаться <span aria-hidden="true">↗</span></button>
      </nav>

      <button className="velora-header__booking" type="button" onClick={onBooking}>Записаться <span aria-hidden="true">↗</span></button>
    </header>
  );
}
