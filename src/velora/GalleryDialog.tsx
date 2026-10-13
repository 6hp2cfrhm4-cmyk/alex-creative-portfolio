import { useEffect, useRef } from "react";
import type { gallery } from "./content";

type GalleryItem = (typeof gallery)[number];

export function GalleryDialog({
  item,
  index,
  count,
  onClose,
  onMove,
}: {
  item: GalleryItem | null;
  index: number;
  count: number;
  onClose: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const open = item !== null;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      closeButton.current?.focus();
    } else if (!open && element.open) {
      element.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); onMove(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); onMove(1); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onMove]);

  return (
    <dialog
      ref={dialog}
      className="velora-lightbox"
      aria-labelledby="velora-lightbox-caption"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialog.current) onClose(); }}
    >
      {item && <div className="velora-lightbox__inner">
        <div className="velora-lightbox__topline"><span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span><button ref={closeButton} type="button" className="velora-lightbox__close" onClick={onClose}>Закрыть <span aria-hidden="true">×</span></button></div>
        <div className="velora-lightbox__image-wrap"><img src={item.image} alt={item.alt} /></div>
        <div className="velora-lightbox__bottomline"><h2 id="velora-lightbox-caption">{item.caption}</h2><div className="velora-lightbox__controls"><button type="button" onClick={() => onMove(-1)} aria-label="Предыдущее изображение">←</button><button type="button" onClick={() => onMove(1)} aria-label="Следующее изображение">→</button></div></div>
      </div>}
    </dialog>
  );
}
