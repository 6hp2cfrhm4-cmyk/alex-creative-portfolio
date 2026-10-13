import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingDialog } from "./BookingDialog";
import { GalleryDialog } from "./GalleryDialog";
import { VeloraHeader } from "./VeloraHeader";
import { faqs, formatDuration, formatPrice, gallery, galleryCategories, masters, serviceCategories, services } from "./content";

type BookingIntent = { open: boolean; serviceId?: string; masterId?: string };

export default function VeloraPage() {
  const [booking, setBooking] = useState<BookingIntent>({ open: false });
  const [serviceFilter, setServiceFilter] = useState("cut");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const changes = [
      { selector: 'meta[name="description"]', content: "VELORA BEAUTY HOUSE — демонстрационный проект сайта премиального салона красоты. Выберите услугу и пройдите демо-запись." },
      { selector: 'meta[name="theme-color"]', content: "#281f1b" },
      { selector: 'meta[name="robots"]', content: "noindex, nofollow" },
      { selector: 'meta[property="og:title"]', content: "VELORA BEAUTY HOUSE — красота становится состоянием" },
      { selector: 'meta[property="og:description"]', content: "Демонстрационный сайт салона: услуги, команда и запись только в браузере." },
      { selector: 'meta[property="og:image"]', content: "/images/velora-hero.jpg" },
    ];
    const snapshots = changes.map(({ selector, content }) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      const created = !element;
      if (!element) {
        element = document.createElement("meta");
        const match = selector.match(/\[(name|property)="([^"]+)"\]/);
        if (match) element.setAttribute(match[1], match[2]);
        document.head.append(element);
      }
      const before = element.getAttribute("content");
      element.setAttribute("content", content);
      return { element, before, created };
    });
    document.title = "VELORA BEAUTY HOUSE — сайт салона красоты";
    document.documentElement.lang = "ru";
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      for (const { element, before, created } of snapshots) {
        if (created) element.remove();
        else if (before === null) element.removeAttribute("content");
        else element.setAttribute("content", before);
      }
    };
  }, []);

  const openBooking = useCallback((serviceId?: string, masterId?: string) => {
    setBooking({ open: true, serviceId, masterId });
  }, []);
  const closeBooking = useCallback(() => setBooking({ open: false }), []);
  const visibleServices = useMemo(() => services.filter((service) => service.category === serviceFilter), [serviceFilter]);
  const visibleGallery = useMemo(() => gallery.map((item, index) => ({ item, index })).filter(({ item }) => galleryFilter === "all" || item.category === galleryFilter), [galleryFilter]);
  const selectedGallery = galleryIndex === null ? null : gallery[galleryIndex] ?? null;
  const moveGallery = useCallback((direction: -1 | 1) => {
    setGalleryIndex((index) => index === null ? null : (index + direction + gallery.length) % gallery.length);
  }, []);

  return (
    <div className="velora-page">
      <a className="velora-skip-link" href="#velora-main">К содержимому</a>
      <VeloraHeader onBooking={() => openBooking()} />

      <main id="velora-main">
        <section className="velora-hero" id="top" aria-labelledby="velora-title">
          <img className="velora-hero__image" src="/images/velora-hero.jpg" alt="Спокойная сцена укладки в салоне в мягком вечернем свете" fetchPriority="high" decoding="async" sizes="100vw" />
          <div className="velora-hero__shade" />
          <div className="velora-hero__content">
            <p className="velora-kicker velora-hero__kicker">Пространство красоты и заботы</p>
            <h1 id="velora-title"><span>VELORA</span><span className="velora-hero__house">BEAUTY HOUSE</span></h1>
            <p className="velora-hero__promise">Место, где красота становится<br className="velora-desktop-break" /> вашим состоянием.</p>
            <div className="velora-hero__actions"><button className="velora-button velora-button--light" type="button" onClick={() => openBooking()}>Записаться <span aria-hidden="true">↗</span></button><a className="velora-hero__secondary" href="#services">Услуги и цены <span aria-hidden="true">↓</span></a></div>
          </div>
          <div className="velora-hero__caption"><span>Волосы · цвет · руки</span><span>Иллюстративный образ, созданный для концепта</span></div>
          <span className="velora-hero__side-note" aria-hidden="true">БЕРЕЖНО К СЕБЕ</span>
        </section>

        <section className="velora-intro velora-section" id="about" aria-labelledby="velora-about-title">
          <div className="velora-intro__copy">
            <p className="velora-kicker">О салоне · идея</p>
            <h2 id="velora-about-title">Не менять себя.<br /><em>Тонко подчеркнуть.</em></h2>
            <p className="velora-intro__lead">VELORA — место для перемен, в которых вы всё ещё узнаёте себя.</p>
            <p className="velora-intro__body">Мы представляем салон, где сначала слушают, а потом предлагают. Здесь мастерство видно в нюансах: в точной форме, чистом цвете и времени, которое не нужно заполнять разговорами.</p>
            <a className="velora-underlined-link" href="#visit">Как проходит визит <span aria-hidden="true">↘</span></a>
          </div>
          <figure className="velora-intro__image">
            <img src="/images/velora-color-study.jpg" alt="Иллюстративный кадр: мастер работает с каштановыми волосами" loading="lazy" decoding="async" sizes="(max-width: 760px) 92vw, 42vw" />
            <figcaption><span>Тепло рук. Точность взгляда.</span><span>Кадр создан для демонстрации</span></figcaption>
          </figure>
          <span className="velora-intro__ornament" aria-hidden="true">V</span>
        </section>

        <section className="velora-services velora-section" id="services" aria-labelledby="velora-services-title">
          <div className="velora-section-heading velora-services__heading">
            <div><p className="velora-kicker">Услуги и ориентировочная стоимость</p><h2 id="velora-services-title">Ваш ритуал<br /><em>в своём темпе.</em></h2></div>
            <p>Начните с того, что хочется изменить. Мастер уточнит детали до начала процедуры.</p>
          </div>
          <div className="velora-service-tabs" role="tablist" aria-label="Категории услуг">
            {serviceCategories.map((category) => <button type="button" role="tab" key={category.id} aria-selected={serviceFilter === category.id} aria-controls="velora-service-list" onClick={() => setServiceFilter(category.id)}>{category.label}<span>{String(services.filter((service) => service.category === category.id).length).padStart(2, "0")}</span></button>)}
          </div>
          <div id="velora-service-list" className="velora-service-list" role="tabpanel" aria-label={serviceCategories.find((category) => category.id === serviceFilter)?.label}>
            {visibleServices.map((service, index) => <article className="velora-service-row" key={service.id}>
              <span className="velora-service-row__number">{String(index + 1).padStart(2, "0")}</span>
              <div className="velora-service-row__copy"><h3>{service.name}</h3><p>{service.description}</p></div>
              <span className="velora-service-row__duration">{formatDuration(service.duration)}</span>
              <span className="velora-service-row__price">от {formatPrice(service.price)}</span>
              <button className="velora-service-row__book" type="button" onClick={() => openBooking(service.id)} aria-label={`Выбрать услугу «${service.name}» и записаться`}>Выбрать <span aria-hidden="true">↗</span></button>
            </article>)}
          </div>
          <p className="velora-demo-prices"><span aria-hidden="true">✳</span> Цены и длительность приведены для демонстрации. Итоговая стоимость зависит от запроса и согласуется до услуги.</p>
        </section>

        <section className="velora-masters velora-section" id="masters" aria-labelledby="velora-masters-title">
          <div className="velora-section-heading"><div><p className="velora-kicker">Команда · демонстрационные профили</p><h2 id="velora-masters-title">У каждого мастера<br /><em>свой почерк.</em></h2></div><p>Вымышленные профили для концепта. Можно сразу выбрать специалиста в форме записи.</p></div>
          <div className="velora-masters__grid">{masters.map((master, index) => <article className={`velora-master velora-master--${index + 1}`} key={master.id}>
            <button className="velora-master__portrait" type="button" onClick={() => openBooking(undefined, master.id)} aria-label={`Выбрать мастера ${master.name} для записи`}>
              <img src={master.image} alt={master.imageAlt} loading="lazy" decoding="async" sizes="(max-width: 680px) 88vw, (max-width: 1000px) 44vw, 23vw" /><span className="velora-master__book">К мастеру <b aria-hidden="true">↗</b></span>
            </button>
            <div className="velora-master__meta"><div><h3>{master.name}</h3><p>{master.role}</p></div><span>{String(index + 1).padStart(2, "0")}</span></div>
            <p className="velora-master__statement">{master.statement}</p>
            <div className="velora-master__tags">{master.specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}</div>
          </article>)}</div>
          <p className="velora-masters__note">Все имена, портреты и специализации — вымышленные демонстрационные материалы.</p>
        </section>

        <section className="velora-gallery velora-section" id="gallery" aria-labelledby="velora-gallery-title">
          <div className="velora-section-heading velora-gallery__heading"><div><p className="velora-kicker">Визуальные ориентиры · не клиентское портфолио</p><h2 id="velora-gallery-title">Красота —<br /><em>в нюансах.</em></h2></div><p>Редакционные образы показывают настроение концепта. Они не выдают себя за работы реального салона.</p></div>
          <div className="velora-gallery__filters" aria-label="Фильтр галереи">
            {galleryCategories.map((category) => <button type="button" key={category.id} aria-pressed={galleryFilter === category.id} className={galleryFilter === category.id ? "is-active" : ""} onClick={() => setGalleryFilter(category.id)}>{category.label}</button>)}
          </div>
          <div className="velora-gallery__grid">{visibleGallery.map(({ item, index }) => <figure className="velora-gallery__item" key={item.image}>
            <button type="button" onClick={() => setGalleryIndex(index)} aria-label={`Открыть изображение: ${item.caption}`}><img src={item.image} alt={item.alt} loading="lazy" decoding="async" sizes="(max-width: 640px) 90vw, 40vw" /><span aria-hidden="true">↗</span></button>
            <figcaption><span>{item.caption}</span><span>{String(index + 1).padStart(2, "0")}</span></figcaption>
          </figure>)}</div>
        </section>

        <section className="velora-visit velora-section" id="visit" aria-labelledby="velora-visit-title">
          <div className="velora-visit__opening"><p className="velora-kicker">Без спешки, от первого слова</p><h2 id="velora-visit-title">Визит начинается<br /><em>с внимания.</em></h2><p>Несколько простых шагов. Ни одного решения за вас.</p></div>
          <ol className="velora-visit__steps">
            <li><span>01</span><div><h3>Сначала разговор</h3><p>Вы рассказываете, чего хочется и что важно сохранить. Мастер уточняет привычки и пожелания.</p></div></li>
            <li><span>02</span><div><h3>План вместе</h3><p>Обсуждаем форму, оттенок, время и стоимость до того, как начать.</p></div></li>
            <li><span>03</span><div><h3>Время для себя</h3><p>Спокойная процедура и рекомендации, которые легко повторить дома.</p></div></li>
          </ol>
        </section>

        <section className="velora-faq velora-section" aria-labelledby="velora-faq-title">
          <div className="velora-faq__intro"><p className="velora-kicker">Перед первым визитом</p><h2 id="velora-faq-title">Хорошо,<br /><em>когда всё ясно.</em></h2><p>Несколько ответов на вопросы, которые обычно возникают заранее.</p></div>
          <div className="velora-faq__list">{faqs.map((faq, index) => <article className={`velora-faq__item${openFaq === index ? " is-open" : ""}`} key={faq.question}>
            <h3><button type="button" aria-expanded={openFaq === index} aria-controls={`velora-faq-answer-${index}`} onClick={() => setOpenFaq((value) => value === index ? null : index)}><span>{faq.question}</span><span className="velora-faq__toggle" aria-hidden="true">{openFaq === index ? "−" : "+"}</span></button></h3>
            <div id={`velora-faq-answer-${index}`} className="velora-faq__answer" hidden={openFaq !== index}><p>{faq.answer}</p></div>
          </article>)}</div>
        </section>
      </main>

      <footer className="velora-footer" id="contacts">
        <div className="velora-footer__top"><div><p className="velora-kicker">VELORA BEAUTY HOUSE</p><h2>Время<br /><em>почувствовать себя.</em></h2></div><button className="velora-button velora-button--light" type="button" onClick={() => openBooking()}>Попробовать демо-запись <span aria-hidden="true">↗</span></button></div>
        <div className="velora-footer__bottom"><span>Демонстрационный проект.</span><span>Данные для связи подключаются перед запуском.</span><a href="#top">Наверх ↑</a></div>
      </footer>

      <button className={`velora-sticky-booking${booking.open ? " is-hidden" : ""}`} type="button" aria-hidden={booking.open} tabIndex={booking.open ? -1 : 0} onClick={() => openBooking()}>Записаться <span aria-hidden="true">↗</span></button>

      <BookingDialog open={booking.open} initialServiceId={booking.serviceId} initialMasterId={booking.masterId} onClose={closeBooking} />
      <GalleryDialog item={selectedGallery} index={galleryIndex ?? 0} count={gallery.length} onClose={() => setGalleryIndex(null)} onMove={moveGallery} />
    </div>
  );
}
