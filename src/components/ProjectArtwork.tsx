import { RelayDashboard } from "./RelayDashboard";

export function ProjectArtwork({ slug, compact = false }: { slug: string; compact?: boolean }) {
  if (slug === "casa-marea") {
    return (
      <img
        className="project-photo"
        src="/images/casa-marea.webp"
        alt="Stone terraces at Casa Marea overlook a quiet blue Mediterranean cove."
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (slug === "kern") {
    return (
      <img
        className="project-photo kern-project-photo"
        src="/images/kern-hero.webp"
        alt="Editorial reference image of a barber refining a short textured fade"
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (slug === "aer") {
    return (
      <div className="aer-artwork" role="img" aria-label="AER studio headphones rendered against a deep blue field">
        <div className="aer-artwork__grid" />
        <svg className="aer-artwork__headphones" viewBox="0 0 520 360" aria-hidden="true">
          <defs>
            <linearGradient id="earcup" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#dfe4e0" />
              <stop offset=".48" stopColor="#85929a" />
              <stop offset="1" stopColor="#35404a" />
            </linearGradient>
            <linearGradient id="band" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#eef2ed" />
              <stop offset="1" stopColor="#78858e" />
            </linearGradient>
            <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="15" />
            </filter>
          </defs>
          <ellipse cx="259" cy="287" rx="150" ry="25" fill="#070f18" opacity=".72" filter="url(#shadow)" />
          <path d="M131 202c-5-100 44-153 129-153s134 53 129 153" fill="none" stroke="#101924" strokeWidth="39" strokeLinecap="round" />
          <path d="M131 193c-3-88 41-132 129-132s132 44 129 132" fill="none" stroke="url(#band)" strokeWidth="19" strokeLinecap="round" />
          <path d="M133 166v63m254-63v63" stroke="#bac2c2" strokeWidth="12" strokeLinecap="round" />
          <g transform="translate(82 170) rotate(-7)">
            <rect x="0" y="0" width="102" height="134" rx="40" fill="#242f38" stroke="#a7b0b3" strokeWidth="4" />
            <rect x="10" y="9" width="82" height="116" rx="34" fill="url(#earcup)" />
            <rect x="19" y="19" width="64" height="96" rx="28" fill="#222d36" opacity=".78" />
            <path d="M20 31c12-13 38-19 57-10" stroke="#fff" strokeOpacity=".36" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(334 170) rotate(7)">
            <rect x="0" y="0" width="102" height="134" rx="40" fill="#242f38" stroke="#a7b0b3" strokeWidth="4" />
            <rect x="10" y="9" width="82" height="116" rx="34" fill="url(#earcup)" />
            <rect x="19" y="19" width="64" height="96" rx="28" fill="#222d36" opacity=".78" />
            <path d="M20 31c12-13 38-19 57-10" stroke="#fff" strokeOpacity=".36" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
          <path d="M125 255c28 22 58 31 93 31m177-31c-28 22-58 31-93 31" fill="none" stroke="#6a7780" strokeWidth="4" opacity=".8" />
        </svg>
        {!compact && <span className="aer-artwork__caption">AER / Studio 01</span>}
      </div>
    );
  }

  if (slug === "soma") {
    return (
      <div className="soma-card-art" role="img" aria-label="Concept artwork of a SOMA aromatherapy bottle among botanical stems">
        <svg viewBox="0 0 960 620" aria-hidden="true">
          <defs>
            <linearGradient id="somaCardGlass" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#9a9b78" />
              <stop offset=".45" stopColor="#66705a" />
              <stop offset="1" stopColor="#353f32" />
            </linearGradient>
            <linearGradient id="somaCardLight" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#fffdf2" stopOpacity=".9" />
              <stop offset="1" stopColor="#d9d1bd" />
            </linearGradient>
            <filter id="somaCardShadow" x="-40%" y="-50%" width="180%" height="200%">
              <feGaussianBlur stdDeviation="19" />
            </filter>
          </defs>
          <path d="M0 455C156 416 229 497 387 466s277-77 573 12v142H0Z" fill="#d4cbbc" />
          <ellipse cx="505" cy="517" rx="194" ry="24" fill="#454b3b" opacity=".28" filter="url(#somaCardShadow)" />
          <g fill="none" stroke="#55624c" strokeLinecap="round">
            <path d="M204 497c52-112 69-210 66-336" strokeWidth="4" />
            <path d="M744 500c-45-104-62-197-37-300" strokeWidth="4" />
            <path d="M261 358c-54-31-93-68-117-113m123 61c44-39 75-84 89-134m340 226c-50-41-79-88-91-146m111 101c49-38 80-74 100-120" strokeWidth="2.5" />
          </g>
          <g fill="#78826b">
            <ellipse cx="152" cy="234" rx="41" ry="13" transform="rotate(44 152 234)" />
            <ellipse cx="359" cy="270" rx="47" ry="14" transform="rotate(-53 359 270)" />
            <ellipse cx="600" cy="372" rx="44" ry="13" transform="rotate(38 600 372)" />
            <ellipse cx="832" cy="260" rx="46" ry="14" transform="rotate(-42 832 260)" />
            <ellipse cx="279" cy="321" rx="39" ry="12" transform="rotate(165 279 321)" />
          </g>
          <g transform="translate(0 15)">
            <path d="M404 433v-22c0-23 13-42 31-56l20-16v-36h101v36l20 16c18 14 31 33 31 56v22c0 20-15 36-35 36H439c-20 0-35-16-35-36Z" fill="url(#somaCardGlass)" stroke="#e8e0cf" strokeOpacity=".58" strokeWidth="2" />
            <path d="M442 339h127v87H442z" fill="url(#somaCardLight)" />
            <path d="M465 351h82v3h-82zm16 15h50v2h-50z" fill="#67705d" opacity=".55" />
            <text x="505" y="397" fill="#263029" fontFamily="Georgia,serif" fontSize="27" letterSpacing="5" textAnchor="middle">SOMA</text>
            <text x="505" y="414" fill="#596151" fontFamily="Arial,sans-serif" fontSize="7" letterSpacing="2" textAnchor="middle">RITUAL OIL · 01</text>
            <rect x="467" y="295" width="55" height="24" rx="2" fill="#9a805e" />
            <rect x="460" y="260" width="69" height="43" rx="7" fill="#d8cfbd" stroke="#f0eadc" strokeOpacity=".8" />
            <ellipse cx="494" cy="262" rx="34" ry="5" fill="#eee7d8" />
          </g>
        </svg>
        {!compact && <span className="soma-card-art__caption">SOMA / Botanical ritual</span>}
      </div>
    );
  }

  return <RelayDashboard compact={compact} interactive={false} />;
}
