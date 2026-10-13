import type { BookingStarter } from "./KernHeader";

export function KernHero({ onBook }: { onBook: BookingStarter }) {
  return (
    <section className="kern-hero" id="top" aria-labelledby="kern-hero-title">
      <img
        className="kern-hero__image"
        src="/images/kern-hero.webp"
        alt="Барбер расчёсывает текстурный верх короткой стрижки с точным переходом у виска"
        sizes="100vw"
        fetchPriority="high"
        decoding="async"
      />
      <div className="kern-hero__shade" aria-hidden="true" />
      <div className="kern-hero__content">
        <p className="kern-eyebrow"><span /> Форма и время. Продуманы.</p>
        <h1 id="kern-hero-title">СТРИЖКА.<br />КОТОРАЯ ДЕРЖИТ<br className="kern-hero__mobile-break" /> ФОРМУ.</h1>
        <p className="kern-hero__description">Барбершоп точной формы<br className="kern-desktop-break" /> и спокойного сервиса.</p>
        <div className="kern-hero__actions">
          <button
            className="kern-button kern-button--accent"
            type="button"
            onClick={(event) => onBook({}, event.currentTarget)}
          >
            Выбрать время <span aria-hidden="true">↗</span>
          </button>
          <a className="kern-hero__secondary" href="#lookbook">Смотреть работы <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div className="kern-hero__caption" aria-hidden="true">
        <span>ТЕКСТУРА / FADE / ФОРМА</span>
        <span>ДЕМО-КОНЦЕПТ · БЕЗ РЕАЛЬНОЙ ЛОКАЦИИ</span>
      </div>
      <a className="kern-hero__scroll" href="#services">Услуги <span aria-hidden="true">↓</span></a>
    </section>
  );
}
