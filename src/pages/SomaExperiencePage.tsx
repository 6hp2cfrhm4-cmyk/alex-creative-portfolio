import { useEffect, useMemo, useRef, useState } from "react";
import { SomaBooking } from "../components/SomaBooking";
import { somaFaq, somaFilters, somaGiftValues, somaServices, somaSpecialists } from "../content/soma";

type SceneComponent = typeof import("../three/SomaScrollScene").SomaScrollScene;

const storyStops = [0, 0.22, 0.5, 0.76, 1];
const storyBackgrounds = ["#f3efe7", "#ded8cc", "#9da291", "#172421", "#f3efe7"];
const galleryItems = [
  { src: "/images/soma-interior.webp", alt: "Концептуальная визуализация тихой комнаты SOMA: известняковый умывальник, лён и ветвь оливы.", caption: "Тишина начинается с пространства" },
  { src: "/images/soma-touch.webp", alt: "Концептуальная визуализация ритуала: руки мастера распределяют масло по плечу; лицо гостя не показано.", caption: "Внимание к каждому прикосновению" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mixColor(from: string, to: string, progress: number): string {
  const left = from.match(/[\da-f]{2}/gi)?.map((item) => Number.parseInt(item, 16)) ?? [243, 239, 231];
  const right = to.match(/[\da-f]{2}/gi)?.map((item) => Number.parseInt(item, 16)) ?? left;
  const channels = left.map((channel, index) => Math.round(channel + ((right[index] ?? channel) - channel) * progress));
  return `rgb(${channels[0]} ${channels[1]} ${channels[2]})`;
}

function colorAt(progress: number): string {
  for (let index = 0; index < storyStops.length - 1; index += 1) {
    if (progress <= storyStops[index + 1]) {
      const local = (progress - storyStops[index]) / (storyStops[index + 1] - storyStops[index]);
      const eased = local * local * (3 - 2 * local);
      return mixColor(storyBackgrounds[index], storyBackgrounds[index + 1], clamp(eased, 0, 1));
    }
  }
  return storyBackgrounds[storyBackgrounds.length - 1];
}

function activeStoryPhase(progress: number): number {
  if (progress < 0.18) return 0;
  if (progress < 0.38) return 1;
  if (progress < 0.64) return 2;
  if (progress < 0.88) return 3;
  return 4;
}

function SomaPoster() {
  return (
    <svg className="soma-poster" viewBox="0 0 800 900" role="img" aria-label="Стилизованный флакон SOMA среди ветвей эвкалипта">
      <defs>
        <linearGradient id="somaPosterGlass" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#909279" />
          <stop offset=".48" stopColor="#65705a" />
          <stop offset="1" stopColor="#3c4939" />
        </linearGradient>
        <linearGradient id="somaPosterCap" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#eee8dc" />
          <stop offset="1" stopColor="#c9beab" />
        </linearGradient>
        <filter id="somaPosterBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
      </defs>
      <g fill="none" stroke="#596750" strokeLinecap="round" opacity=".83">
        <path d="M142 810c97-153 123-359 110-621" strokeWidth="8" />
        <path d="M224 561c-77-38-131-103-170-189m194 112c68-75 113-155 133-247M645 808c-89-145-121-330-100-562" strokeWidth="5" />
        <path d="M554 504c-76-55-116-118-131-194m139 97c69-49 120-113 151-190" strokeWidth="4" />
      </g>
      <g fill="#75816c" opacity=".9">
        <ellipse cx="95" cy="351" rx="82" ry="25" transform="rotate(42 95 351)" />
        <ellipse cx="397" cy="337" rx="89" ry="28" transform="rotate(-55 397 337)" />
        <ellipse cx="461" cy="424" rx="83" ry="27" transform="rotate(28 461 424)" />
        <ellipse cx="688" cy="303" rx="88" ry="28" transform="rotate(-42 688 303)" />
        <ellipse cx="185" cy="520" rx="81" ry="26" transform="rotate(-159 185 520)" />
        <ellipse cx="624" cy="621" rx="87" ry="27" transform="rotate(148 624 621)" />
      </g>
      <ellipse cx="407" cy="790" rx="202" ry="30" fill="#28342c" opacity=".2" filter="url(#somaPosterBlur)" />
      <path d="M285 742v-34c0-30 18-58 43-77l29-22v-45h101v45l29 22c25 19 43 47 43 77v34c0 27-21 49-49 49H334c-28 0-49-22-49-49Z" fill="url(#somaPosterGlass)" stroke="#e7e0d0" strokeOpacity=".55" strokeWidth="4" />
      <path d="M325 622h143v97H325z" fill="#e5dece" />
      <path d="M356 643h82v3h-82zm16 11h50v2h-50z" fill="#a0a18a" />
      <text x="396" y="682" fill="#364135" fontFamily="Georgia,serif" fontSize="26" letterSpacing="5" textAnchor="middle">SOMA</text>
      <text x="396" y="702" fill="#67705c" fontFamily="Arial,sans-serif" fontSize="7" letterSpacing="2" textAnchor="middle">BOTANICAL BODY OIL</text>
      <rect x="362" y="548" width="67" height="37" rx="3" fill="#a18468" />
      <rect x="352" y="489" width="87" height="69" rx="10" fill="url(#somaPosterCap)" />
      <ellipse cx="395.5" cy="493" rx="42" ry="7" fill="#f5eee2" />
      <path d="M309 578c17-11 27-13 43-14m102 14c-15-11-27-13-42-14" fill="none" stroke="#ffffff" strokeOpacity=".22" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function SomaHeader({ reducedMotion, isSmallScreen, onToggleMotion }: { reducedMotion: boolean; isSmallScreen: boolean; onToggleMotion: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const close = () => {
    setMenuOpen(false);
  };

  return (
    <header className="soma-header" id="soma-top">
      <a className="soma-wordmark" href="#top" onClick={close} aria-label="SOMA, наверх">
        <span className="soma-wordmark__name">SOMA</span>
        <span className="soma-wordmark__descriptor">RITUAL SPA</span>
      </a>
      <button ref={buttonRef} className="soma-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="soma-navigation" onClick={() => setMenuOpen((open) => !open)}>
        <span>{menuOpen ? "Закрыть" : "Меню"}</span><span aria-hidden="true">{menuOpen ? "×" : "＋"}</span>
      </button>
      <a className="soma-mobile-book" href="#booking" onClick={close}>Запись</a>
      <nav id="soma-navigation" className={`soma-nav${menuOpen ? " is-open" : ""}`} aria-label="Разделы SOMA">
        <a href="#rituals" onClick={close}>Ритуалы</a>
        <a href="#space" onClick={close}>Пространство</a>
        <a href="#approach" onClick={close}>Подход</a>
        <a href="#gifts" onClick={close}>Сертификаты</a>
        <a className="soma-nav__book" href="#booking" onClick={close}>Записаться <span aria-hidden="true">↗</span></a>
        <button className="soma-motion-toggle" type="button" aria-pressed={reducedMotion} disabled={isSmallScreen} onClick={onToggleMotion}>
          {isSmallScreen ? "На узком экране сцена статична" : reducedMotion ? "Включить движение" : "Упростить движение"}
        </button>
      </nav>
    </header>
  );
}

export default function SomaExperiencePage() {
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneMountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const storyIndexRef = useRef<HTMLSpanElement>(null);
  const [Scene, setScene] = useState<SceneComponent | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<(typeof somaFilters)[number]>(somaFilters[0]);
  const [bookingPreset, setBookingPreset] = useState<string | null>(null);
  const [bookingPresetKey, setBookingPresetKey] = useState(0);
  const [selectedGift, setSelectedGift] = useState<number>(somaGiftValues[1]);
  const [giftNotice, setGiftNotice] = useState(false);
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const galleryDialogRef = useRef<HTMLDialogElement>(null);
  const closeGalleryRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = motionOverride ?? systemReducedMotion;
  const staticStory = reducedMotion || isSmallScreen;
  const filteredServices = useMemo(() => selectedFilter === somaFilters[0]
    ? somaServices
    : somaServices.filter((item) => item.category === selectedFilter), [selectedFilter]);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = metaDescription?.content;
    document.title = "SOMA — Ритуалы возвращения к себе";
    document.documentElement.lang = "ru";
    if (metaDescription) metaDescription.content = "SOMA / Ritual Spa — концепт-страница тихих SPA-ритуалов с демонстрационной записью.";
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      if (metaDescription && previousDescription) metaDescription.content = previousDescription;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMedia = window.matchMedia("(max-width: 820px)");
    const smallScreenMedia = window.matchMedia("(max-width: 700px)");
    const update = () => {
      setSystemReducedMotion(media.matches);
      setIsCompact(compactMedia.matches);
      setIsSmallScreen(smallScreenMedia.matches);
    };
    update();
    media.addEventListener("change", update);
    compactMedia.addEventListener("change", update);
    smallScreenMedia.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      compactMedia.removeEventListener("change", update);
      smallScreenMedia.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const loadScene = () => {
      void import("../three/SomaScrollScene").then((module) => {
        if (!cancelled) setScene(() => module.SomaScrollScene);
      }).catch(() => {
        if (!cancelled) setSceneFailed(true);
      });
    };
    const idleWindow = window as Window & { requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number; cancelIdleCallback?: (id: number) => void };
    if (idleWindow.requestIdleCallback) idleId = idleWindow.requestIdleCallback(loadScene, { timeout: 1400 });
    else timeoutId = window.setTimeout(loadScene, 600);
    return () => {
      cancelled = true;
      if (idleId && idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const range = story.offsetHeight - stage.offsetHeight;
      const progress = !staticStory && range > 0 ? clamp(window.scrollY / range, 0, 1) : 0;
      progressRef.current = progress;
      const background = colorAt(progress);
      const dark = progress >= 0.55 && progress < 0.87;
      stage.style.backgroundColor = background;
      stage.style.setProperty("--soma-stage-ink", dark ? "#f0eee6" : "#202922");
      stage.style.setProperty("--story-progress", String(progress));
      stage.dataset.activePhase = String(activeStoryPhase(progress));
      story.querySelectorAll<HTMLElement>(".soma-story__chapter").forEach((chapter) => {
        const isActive = chapter.dataset.phase === String(activeStoryPhase(progress));
        chapter.setAttribute("aria-hidden", String(!isActive));
        chapter.inert = !isActive;
      });
      if (storyIndexRef.current) storyIndexRef.current.textContent = String(activeStoryPhase(progress) + 1).padStart(2, "0");
      window.dispatchEvent(new Event("soma:story-progress"));
      const shell = stage.closest<HTMLElement>(".soma-shell");
      shell?.style.setProperty("--soma-background", background);
      shell?.style.setProperty("--soma-ink", dark ? "#f0eee6" : "#202922");
    };
    const queueUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });
    window.addEventListener("orientationchange", queueUpdate, { passive: true });
    update();
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      window.removeEventListener("orientationchange", queueUpdate);
    };
  }, [staticStory]);

  useEffect(() => {
    const dialog = galleryDialogRef.current;
    if (!dialog) return;
    if (galleryIndex !== null && !dialog.open) {
      dialog.showModal();
      closeGalleryRef.current?.focus();
    } else if (galleryIndex === null && dialog.open) {
      dialog.close();
    }
  }, [galleryIndex]);

  const bookThisRitual = (serviceId: string) => {
    setBookingPreset(serviceId);
    setBookingPresetKey((value) => value + 1);
    document.getElementById("booking")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  };

  const moveGallery = (direction: -1 | 1) => {
    setGalleryIndex((current) => current === null ? null : (current + direction + galleryItems.length) % galleryItems.length);
  };

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage("Ссылка скопирована");
    } catch {
      setCopyMessage("Скопируйте адрес страницы из строки браузера");
    }
  };

  return (
    <div className="soma-shell" id="top">
      <a className="soma-skip-link" href="#soma-main">Перейти к содержимому</a>
      <SomaHeader reducedMotion={reducedMotion} isSmallScreen={isSmallScreen} onToggleMotion={() => setMotionOverride((current) => !(current ?? systemReducedMotion))} />

      <main id="soma-main">
        <section ref={storyRef} className={`soma-story${staticStory ? " soma-story--static" : ""}`} aria-label="История продукта, управляемая прокруткой">
          <div ref={stageRef} className="soma-story__stage" data-active-phase="0">
            <div ref={sceneMountRef} className={`soma-story__visual${sceneReady && !sceneFailed ? " is-rendered" : ""}`}>
              <SomaPoster />
              {Scene && !sceneFailed && <Scene
                progressRef={progressRef}
                lowDetail={isCompact || reducedMotion}
                onReady={() => setSceneReady(true)}
                onFailure={() => { setSceneFailed(true); setSceneReady(false); }}
                containerRef={sceneMountRef}
              />}
            </div>
            <div className="soma-story__grain" aria-hidden="true" />

            <div className="soma-story__copy" aria-live="off">
              <article className="soma-story__chapter" data-phase="0" aria-labelledby="soma-hero-heading">
                <p className="soma-kicker">Тихое пространство для вас</p>
                <h1 id="soma-hero-heading">Ритуалы<br />возвращения<br /><em>к себе.</em></h1>
                <p>У каждого прикосновения есть свой темп. Здесь его выбираете вы.</p>
                <a className="soma-button soma-button--dark" href="#rituals">Выбрать ритуал <span aria-hidden="true">↓</span></a>
              </article>
              <article className="soma-story__chapter" data-phase="1" aria-hidden="true" inert>
                <p className="soma-kicker">Внимание к настоящему</p>
                <h2>Искусство<br /><em>замедляться.</em></h2>
                <p>Не нужно никуда спешить. Только тёплый свет, спокойное дыхание и время, которое принадлежит вам.</p>
              </article>
              <article className="soma-story__chapter" data-phase="2" aria-hidden="true" inert>
                <p className="soma-kicker">Близость к природе</p>
                <h2>Прикосновение<br /><em>природы.</em></h2>
                <p>Стекло, керамика и простые растительные ароматы. Материалы, которым не нужно объяснять себя.</p>
                <ul><li>Нейтральные средства</li><li>Знакомые текстуры</li><li>Аромат — только если вам хочется</li></ul>
              </article>
              <article className="soma-story__chapter" data-phase="3" aria-hidden="true" inert>
                <p className="soma-kicker">Чуть глубже, чуть тише</p>
                <h2>Глубже.<br />Тише.<br /><em>Ближе.</em></h2>
                <p>Каждый шаг можно остановить или изменить — без объяснений.</p>
              </article>
              <article className="soma-story__chapter" data-phase="4" aria-hidden="true" inert>
                <p className="soma-kicker">Ваше время</p>
                <h2>Побудьте<br /><em>с собой.</em></h2>
                <p>Начните с ритуала, который откликается сегодня.</p>
                <a className="soma-button soma-button--light" href="#rituals">Найти свой ритуал <span aria-hidden="true">↓</span></a>
              </article>
            </div>

            <div className="soma-story__progress" aria-hidden="true"><span /></div>
            <div className="soma-story__index" aria-hidden="true"><span ref={storyIndexRef}>01</span><i />05</div>
            <p className="soma-story__fallback-note" hidden={!sceneFailed}>Статичная композиция: 3D-сцена недоступна в этом браузере.</p>
          </div>
          <ol className="soma-story__transcript" aria-label="Пять глав истории SOMA">
            <li><strong>Приглашение.</strong> Ритуалы возвращения к себе: время и темп выбираете вы.</li>
            <li><strong>Встреча.</strong> Искусство замедляться — без спешки и лишних слов.</li>
            <li><strong>Материал и природа.</strong> Стекло, керамика и растительные ароматы по желанию.</li>
            <li><strong>Погружение.</strong> Глубже. Тише. Ближе. Любой этап можно изменить.</li>
            <li><strong>Возвращение.</strong> Выберите свой ритуал и удобное время.</li>
          </ol>
        </section>

        <section className="soma-philosophy" id="approach" aria-labelledby="approach-heading">
          <div className="soma-section-aside"><span>01</span><span>Подход</span></div>
          <div className="soma-philosophy__copy">
            <p className="soma-kicker">Ничего доказывать не нужно</p>
            <h2 id="approach-heading">Здесь можно<br />быть <em>просто собой.</em></h2>
            <p>Мы начинаем с разговора: что вам нравится, к чему хочется прикоснуться, а чего сегодня лучше избежать. Ритуал можно менять по ходу — ваш комфорт важнее сценария.</p>
            <a className="soma-inline-link" href="#booking">Выбрать время <span aria-hidden="true">↗</span></a>
          </div>
          <div className="soma-philosophy__notes">
            <p><span>01</span> Можно попросить о тишине или о разговоре.</p>
            <p><span>02</span> Аромат и прикосновения — только с вашего согласия.</p>
            <p><span>03</span> Вы можете остановить ритуал в любой момент.</p>
          </div>
        </section>

        <section className="soma-rituals" id="rituals" aria-labelledby="rituals-heading">
          <div className="soma-section-heading">
            <div>
              <p className="soma-kicker">Время для тела и внимания</p>
              <h2 id="rituals-heading">Найдите свой<br /><em>ритуал.</em></h2>
            </div>
            <p>Это концептуальное меню. Выбирайте по настроению, длительности и тому, что сейчас комфортно.</p>
          </div>
          <div className="soma-filter-row" role="group" aria-label="Фильтр ритуалов">
            {somaFilters.map((filter) => (
              <button className={selectedFilter === filter ? "is-selected" : ""} type="button" key={filter} aria-pressed={selectedFilter === filter} onClick={() => setSelectedFilter(filter)}>{filter}</button>
            ))}
          </div>
          <div className="soma-service-list" aria-live="polite">
            {filteredServices.map((service, index) => (
              <article className="soma-service-row" key={service.id}>
                <span className="soma-service-row__index">{String(index + 1).padStart(2, "0")}</span>
                <div className="soma-service-row__main">
                  <p className="soma-service-row__category">{service.category}</p>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <small>{service.note}</small>
                </div>
                <div className="soma-service-row__details">
                  <span>{service.durationOptions.join(" / ")} мин</span>
                  <strong>от {Math.min(...Object.values(service.prices)).toLocaleString("ru-RU")} ₽</strong>
                </div>
                <button className="soma-service-row__choose" type="button" onClick={() => bookThisRitual(service.id)} aria-label={`Выбрать ритуал «${service.name}» для демо-записи`}>
                  Выбрать <span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
            {filteredServices.length === 0 && <p className="soma-empty">В этой категории пока нет ритуалов.</p>}
          </div>
          <p className="soma-demo-note">Цены и услуги — демонстрационные, указаны в рублях. Это не предложение к покупке.</p>
        </section>

        <section className="soma-space" id="space" aria-labelledby="space-heading">
          <div className="soma-space__heading">
            <p className="soma-kicker">Место для передышки</p>
            <h2 id="space-heading">Пусть пространство<br /><em>говорит тише.</em></h2>
          </div>
          <div className="soma-gallery">
            {galleryItems.map((item, index) => (
              <figure className={`soma-gallery__item soma-gallery__item--${index + 1}`} key={item.src}>
                <button type="button" className="soma-gallery__open" onClick={() => setGalleryIndex(index)} aria-label={`Открыть изображение: ${item.caption}`}>
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                  <span aria-hidden="true">↗</span>
                </button>
                <figcaption><span>{item.caption}</span><small>Концептуальная визуализация SOMA</small></figcaption>
              </figure>
            ))}
          </div>
          <p className="soma-space__disclaimer">Пространство и изображения созданы для концепта. Они не показывают реальную локацию.</p>
        </section>

        <section className="soma-specialists" aria-labelledby="specialists-heading">
          <div className="soma-specialists__intro">
            <p className="soma-kicker">Сначала — человек</p>
            <h2 id="specialists-heading">Рядом —<br /><em>внимательный мастер.</em></h2>
            <p>Здесь представлены вымышленные специалисты. В рабочем проекте карточки будут заполнены реальной командой и расписанием.</p>
          </div>
          <div className="soma-specialist-list">
            {somaSpecialists.map((specialist, index) => (
              <article className="soma-specialist" key={specialist.id}>
                <span className="soma-specialist__index">0{index + 1}</span>
                <div className="soma-specialist__monogram" aria-hidden="true">{specialist.name[0]}</div>
                <div><h3>{specialist.name}</h3><p className="soma-specialist__focus">{specialist.focus}</p><p>{specialist.bio}</p></div>
                <button className="soma-text-button" type="button" onClick={() => bookThisRitual(somaServices.find((item) => item.category === specialist.categories[0])?.id ?? somaServices[0].id)}>Выбрать время <span aria-hidden="true">↗</span></button>
              </article>
            ))}
          </div>
        </section>

        <section className="soma-method" aria-labelledby="method-heading">
          <div className="soma-section-aside"><span>02</span><span>Комфорт</span></div>
          <div className="soma-method__lead">
            <p className="soma-kicker">Уважение к вашим границам</p>
            <h2 id="method-heading">Комфорт —<br /><em>часть ритуала.</em></h2>
          </div>
          <div className="soma-method__body">
            <p>Перед визитом полезно сообщить о чувствительности к ароматам, особенностях кожи и любых ограничениях, которые могут повлиять на ваше самочувствие. При сомнениях сначала обсудите процедуру с лечащим специалистом.</p>
            <p>Макет не даёт медицинских рекомендаций и не обещает лечебных эффектов. Процедуры в реальном месте должны подбираться с учётом вашего состояния и согласия.</p>
          </div>
        </section>

        <section className="soma-gifts" id="gifts" aria-labelledby="gifts-heading">
          <div className="soma-gifts__copy">
            <p className="soma-kicker">Подарить время</p>
            <h2 id="gifts-heading">Небольшое<br /><em>напоминание о себе.</em></h2>
            <p>Выберите номинал и посмотрите концепт подарочной карточки. В этой демонстрации сертификат нельзя оплатить или отправить.</p>
            <fieldset className="soma-choice-set">
              <legend>Номинал сертификата</legend>
              <div className="soma-gift-values">
                {somaGiftValues.map((value) => (
                  <label className={`soma-gift-value${selectedGift === value ? " is-selected" : ""}`} key={value}>
                    <input type="radio" name="soma-gift-value" value={value} checked={selectedGift === value} onChange={() => { setSelectedGift(value); setGiftNotice(false); }} />
                    <span>{value.toLocaleString("ru-RU")} ₽</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="soma-button soma-button--dark" type="button" onClick={() => setGiftNotice(true)}>Демо-предпросмотр</button>
            {giftNotice && <p className="soma-gift-notice" role="status">Макет на {selectedGift.toLocaleString("ru-RU")} ₽ готов. Платёж не производится, сертификат не создаётся.</p>}
          </div>
          <div className="soma-gift-preview" aria-label={`Предварительный просмотр концепта сертификата на ${selectedGift.toLocaleString("ru-RU")} рублей`}>
            <div className="soma-gift-preview__top"><span>SOMA</span><span>RITUAL SPA</span></div>
            <p>Время<br />для себя.</p>
            <strong>{selectedGift.toLocaleString("ru-RU")} ₽</strong>
            <span className="soma-gift-preview__bottom">ПОДАРОЧНЫЙ СЕРТИФИКАТ · КОНЦЕПТ</span>
            <i aria-hidden="true" />
          </div>
        </section>

        <SomaBooking presetServiceId={bookingPreset} presetKey={bookingPresetKey} />

        <section className="soma-faq" aria-labelledby="faq-heading">
          <div>
            <p className="soma-kicker">До встречи</p>
            <h2 id="faq-heading">Частые<br /><em>вопросы.</em></h2>
          </div>
          <div className="soma-faq__list">
            {somaFaq.map((item, index) => (
              <article className="soma-faq__item" key={item.question}>
                <h3>
                  <button type="button" aria-expanded={openQuestion === index} aria-controls={`soma-faq-answer-${index}`} onClick={() => setOpenQuestion((current) => current === index ? null : index)}>
                    <span>{item.question}</span><i aria-hidden="true">{openQuestion === index ? "−" : "+"}</i>
                  </button>
                </h3>
                {openQuestion === index && <div id={`soma-faq-answer-${index}`} className="soma-faq__answer"><p>{item.answer}</p></div>}
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="soma-footer">
        <div className="soma-footer__main">
          <a className="soma-footer__wordmark" href="#top">SOMA<span>RITUAL SPA</span></a>
          <p>Время, которое принадлежит только вам.</p>
          <a className="soma-button soma-button--light" href="#booking">Посмотреть демо-запись <span aria-hidden="true">↗</span></a>
        </div>
        <div className="soma-footer__bottom">
          <span>Фиктивный бренд · концепт 2026</span>
          <span>Адрес и контакты не указаны: реальной локации нет</span>
          <button type="button" onClick={() => void copyPageLink()}>Поделиться <span aria-hidden="true">↗</span></button>
        </div>
        {copyMessage && <p className="soma-copy-status" role="status">{copyMessage}</p>}
      </footer>

      <dialog ref={galleryDialogRef} className="soma-lightbox" aria-label="Просмотр концептуальных изображений" onCancel={() => setGalleryIndex(null)} onClick={(event) => { if (event.target === event.currentTarget) setGalleryIndex(null); }}>
        {galleryIndex !== null && <>
          <button ref={closeGalleryRef} className="soma-lightbox__close" type="button" onClick={() => setGalleryIndex(null)} aria-label="Закрыть просмотр">×</button>
          <button className="soma-lightbox__previous" type="button" onClick={() => moveGallery(-1)} aria-label="Предыдущее изображение">←</button>
          <figure>
            <img src={galleryItems[galleryIndex].src} alt={galleryItems[galleryIndex].alt} />
            <figcaption>{galleryItems[galleryIndex].caption}<small>Концептуальная визуализация SOMA</small></figcaption>
          </figure>
          <button className="soma-lightbox__next" type="button" onClick={() => moveGallery(1)} aria-label="Следующее изображение">→</button>
        </>}
      </dialog>
    </div>
  );
}
