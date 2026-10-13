import { useEffect, useRef, useState } from "react";
import type { BookingDraft } from "../types";

export type BookingStarter = (
  seed: Partial<Pick<BookingDraft, "serviceId" | "barberId">>,
  opener: HTMLElement,
) => void;

const links = [
  { label: "Главная", href: "#top" },
  { label: "Услуги", href: "#services" },
  { label: "Барберы", href: "#barbers" },
  { label: "Работы", href: "#lookbook" },
  { label: "Клуб", href: "#club" },
  { label: "Контакты", href: "#contacts" },
];

export function KernHeader({ onBook }: { onBook: BookingStarter }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const bookingButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 36));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const dialog = menuDialogRef.current;
    if (!dialog || !menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [menuOpen]);

  const closeMenu = () => {
    menuDialogRef.current?.close();
    setMenuOpen(false);
  };

  const openBookingFromMenu = () => {
    const opener = bookingButtonRef.current ?? menuButtonRef.current;
    closeMenu();
    window.setTimeout(() => {
      if (opener) onBook({}, opener);
    }, 0);
  };

  return (
    <>
      <header className={"kern-header" + (scrolled ? " is-scrolled" : "")}>
        <a className="kern-wordmark" href="#top" aria-label="KERN / BARBER CLUB — на главную">
          <span className="kern-wordmark__mark" aria-hidden="true">K</span>
          <span>KERN <i>/</i> BARBER CLUB</span>
        </a>
        <nav className="kern-header__nav" aria-label="Главная навигация">
          {links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
        <button
          ref={bookingButtonRef}
          className="kern-header__book"
          type="button"
          onClick={(event) => onBook({}, event.currentTarget)}
        >
          Записаться <span aria-hidden="true">↗</span>
        </button>
        <button
          ref={menuButtonRef}
          className="kern-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="kern-mobile-menu"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setMenuOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setMenuOpen(true);
            }
            if (event.key === " ") event.preventDefault();
          }}
          onKeyUp={(event) => {
            if (event.key === " ") setMenuOpen(true);
          }}
        >
          <span className="kern-menu-toggle__label">{menuOpen ? "Закрыть" : "Меню"}</span>
          <span className="kern-menu-toggle__icon" aria-hidden="true"><i /><i /></span>
        </button>
      </header>

      <dialog
        ref={menuDialogRef}
        className="kern-mobile-menu"
        id="kern-mobile-menu"
        aria-label="Меню KERN"
        onClose={() => {
          if (menuOpen) setMenuOpen(false);
        }}
      >
        <div className="kern-mobile-menu__top">
          <a className="kern-wordmark" href="#top" onClick={closeMenu}>
            <span className="kern-wordmark__mark" aria-hidden="true">K</span>
            <span>KERN <i>/</i> BARBER CLUB</span>
          </a>
          <button className="kern-mobile-menu__close" type="button" onClick={closeMenu}>Закрыть ×</button>
        </div>
        <nav aria-label="Мобильная навигация">
          {links.map((link, index) => (
            <a href={link.href} key={link.href} onClick={closeMenu}>
              <span>{link.label}</span><small>0{index + 1}</small>
            </a>
          ))}
        </nav>
        <button className="kern-button kern-button--accent" type="button" onClick={openBookingFromMenu}>
          Выбрать время <span aria-hidden="true">↗</span>
        </button>
        <p>Точная форма. Спокойный сервис.</p>
      </dialog>
    </>
  );
}
