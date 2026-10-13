import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { hairReferences, getService } from "../data";
import type { HairReference } from "../types";
import type { BookingStarter } from "./KernHeader";

type LookbookFilter = "all" | HairReference["category"];

const filters: { label: string; value: LookbookFilter }[] = [
  { label: "Все", value: "all" },
  { label: "Короткие", value: "short" },
  { label: "Средняя длина", value: "medium" },
  { label: "Длинные", value: "long" },
  { label: "Борода", value: "beard" },
];

const tilePositions = [
  "0% 0%",
  "50% 0%",
  "100% 0%",
  "0% 100%",
  "50% 100%",
  "100% 100%",
];

export function HairReferenceImage({
  reference,
  className = "",
}: {
  reference: HairReference;
  className?: string;
}) {
  const style: CSSProperties = { backgroundPosition: tilePositions[reference.imageIndex] };
  return (
    <span
      aria-hidden="true"
      className={"kern-reference-image " + className}
      style={style}
    />
  );
}

function referenceServiceName(reference: HairReference): string {
  return getService(reference.serviceId)?.name ?? "Стрижка";
}

export function LookbookSection({ onBook }: { onBook: BookingStarter }) {
  const [filter, setFilter] = useState<LookbookFilter>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const visibleReferences = useMemo(
    () => filter === "all" ? hairReferences : hairReferences.filter((reference) => reference.category === filter),
    [filter],
  );
  const activeReference = activeIndex === null ? undefined : visibleReferences[activeIndex];
  const lightboxOpen = activeIndex !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [lightboxOpen]);

  const closeLightbox = () => dialogRef.current?.close();

  const handleLightboxKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight" && visibleReferences.length > 1) {
      event.preventDefault();
      setActiveIndex((current) => current === null ? 0 : (current + 1) % visibleReferences.length);
    }
    if (event.key === "ArrowLeft" && visibleReferences.length > 1) {
      event.preventDefault();
      setActiveIndex((current) => current === null ? 0 : (current - 1 + visibleReferences.length) % visibleReferences.length);
    }
  };

  const bookFromLightbox = () => {
    if (!activeReference) return;
    const reference = activeReference;
    const opener = triggerRef.current;
    closeLightbox();
    window.setTimeout(() => {
      if (opener) onBook({ serviceId: reference.serviceId }, opener);
    }, 0);
  };

  return (
    <section className="kern-section kern-lookbook" id="lookbook" aria-labelledby="kern-lookbook-title">
      <div className="kern-section__heading">
        <div>
          <p className="kern-eyebrow kern-eyebrow--dark"><span /> Референсы</p>
          <h2 id="kern-lookbook-title">Найди свою<br /><em>форму.</em></h2>
        </div>
        <p className="kern-section__aside">Референсы стрижек для выбора образа. Открой карточку, чтобы рассмотреть форму и детали.</p>
      </div>
      <div className="kern-filter-row" role="group" aria-label="Фильтр референсов стрижек">
        {filters.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={filter === item.value ? "is-active" : ""}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {visibleReferences.length > 0 ? (
        <div className="kern-lookbook-grid" aria-live="polite">
          {visibleReferences.map((reference, index) => (
            <article className="kern-look-card" key={reference.id}>
              <button
                aria-label={"Открыть референс: " + reference.title}
                className="kern-look-card__image-button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveIndex(index);
                }}
                type="button"
              >
                <HairReferenceImage className="kern-look-card__image" reference={reference} />
                <span className="kern-look-card__open" aria-hidden="true">↗</span>
              </button>
              <div className="kern-look-card__meta">
                <h3>{reference.title}</h3>
                <span>{reference.category === "beard" ? "Борода" : reference.category === "long" ? "Длинные волосы" : "Стрижка"}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="kern-empty-state">В этой группе пока нет референсов.</p>
      )}

      <dialog
        ref={dialogRef}
        className="kern-lightbox"
        data-lookbook-dialog
        aria-label="Просмотр референса"
        onClose={() => {
          setActiveIndex(null);
          window.requestAnimationFrame(() => triggerRef.current?.focus());
        }}
        onKeyDown={handleLightboxKey}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeLightbox();
        }}
      >
        {activeReference && (
          <div className="kern-lightbox__layout">
            <HairReferenceImage className="kern-lightbox__image" reference={activeReference} />
            <div className="kern-lightbox__info">
              <div className="kern-lightbox__top">
                <span>Референс {String(activeIndex! + 1).padStart(2, "0")} / {String(visibleReferences.length).padStart(2, "0")}</span>
                <button className="kern-icon-button" type="button" aria-label="Закрыть просмотр" onClick={closeLightbox}>×</button>
              </div>
              <p className="kern-eyebrow"><span /> Референс стрижки</p>
              <h2>{activeReference.title}</h2>
              <p>{activeReference.description}</p>
              <a className="kern-lightbox__service" href="#services" onClick={closeLightbox}>
                Услуга: {referenceServiceName(activeReference)} <span aria-hidden="true">↓</span>
              </a>
              <div className="kern-lightbox__actions">
                <button className="kern-button kern-button--accent" type="button" onClick={bookFromLightbox}>
                  Записаться на похожую форму <span aria-hidden="true">↗</span>
                </button>
                <div>
                  <button className="kern-icon-button" type="button" aria-label="Предыдущий референс" onClick={() => setActiveIndex((activeIndex! - 1 + visibleReferences.length) % visibleReferences.length)}>←</button>
                  <button className="kern-icon-button" type="button" aria-label="Следующий референс" onClick={() => setActiveIndex((activeIndex! + 1) % visibleReferences.length)}>→</button>
                </div>
              </div>
              <span className="kern-lightbox__hint">Для навигации также используй ← и →</span>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
