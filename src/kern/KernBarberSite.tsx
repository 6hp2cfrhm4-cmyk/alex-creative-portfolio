import { useEffect, useRef, useState } from "react";
import { BookingDialog } from "./components/BookingDialog";
import { BarberSection } from "./components/BarberSection";
import { KernFAQ } from "./components/KernFAQ";
import { KernFooter } from "./components/KernFooter";
import { KernHeader, type BookingStarter } from "./components/KernHeader";
import { KernHero } from "./components/KernHero";
import { KernClub, KernProcess } from "./components/KernStory";
import { LookbookSection } from "./components/LookbookSection";
import { ServiceList } from "./components/ServiceList";
import { StyleFinder } from "./components/StyleFinder";
import type { BookingDraft } from "./types";

export default function KernBarberSite() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSeed, setBookingSeed] = useState<Partial<BookingDraft>>({});
  const [bookingVersion, setBookingVersion] = useState(0);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    const previousBackground = document.body.style.background;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const oldDescription = description?.content;
    const oldOgTitle = ogTitle?.content;
    const oldOgDescription = ogDescription?.content;
    const oldOgImage = ogImage?.content;
    const oldThemeColor = themeColor?.content;
    const oldIcon = icon?.href;

    document.title = "KERN / BARBER CLUB — стрижка, которая держит форму";
    document.documentElement.lang = "ru";
    document.body.style.background = "#EFEDE6";
    document.body.classList.add("is-kern");
    if (description) description.content = "Барбершоп точной формы и спокойного сервиса. Услуги, барберы, референсы и демонстрационная онлайн-запись.";
    if (ogTitle) ogTitle.content = "KERN / BARBER CLUB — точная форма";
    if (ogDescription) ogDescription.content = "Выбери услугу, барбера и время. Демонстрационный сайт барбершопа.";
    if (ogImage) ogImage.content = "/images/kern-hero.webp";
    if (themeColor) themeColor.content = "#121313";
    if (icon) icon.href = "/kern-favicon.svg";
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      document.body.style.background = previousBackground;
      document.body.classList.remove("is-kern");
      if (description && oldDescription) description.content = oldDescription;
      if (ogTitle && oldOgTitle) ogTitle.content = oldOgTitle;
      if (ogDescription && oldOgDescription) ogDescription.content = oldOgDescription;
      if (ogImage && oldOgImage) ogImage.content = oldOgImage;
      if (themeColor && oldThemeColor) themeColor.content = oldThemeColor;
      if (icon && oldIcon) icon.href = oldIcon;
    };
  }, []);

  const openBooking: BookingStarter = (seed, opener) => {
    returnFocusRef.current = opener;
    setBookingSeed(seed);
    setBookingVersion((version) => version + 1);
    setBookingOpen(true);
  };

  return (
    <div className="kern-site">
      <a className="kern-skip-link" href="#kern-main">Перейти к содержанию</a>
      <KernHeader onBook={openBooking} />
      <main id="kern-main">
        <KernHero onBook={openBooking} />
        <div className="kern-quick-read" aria-label="О формате">
          <span>Цена до записи</span><i aria-hidden="true" />
          <span>Время под услугу</span><i aria-hidden="true" />
          <span>Барбер по задаче</span><i aria-hidden="true" />
        </div>
        <ServiceList onBook={openBooking} />
        <BarberSection onBook={openBooking} />
        <LookbookSection onBook={openBooking} />
        <StyleFinder onBook={openBooking} />
        <KernProcess />
        <KernClub />
        <KernFAQ />
        <KernFooter />
      </main>
      {bookingOpen && (
        <BookingDialog
          key={bookingVersion}
          onClose={() => setBookingOpen(false)}
          returnFocusRef={returnFocusRef}
          seed={bookingSeed}
        />
      )}
    </div>
  );
}
