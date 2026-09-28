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

  return <RelayDashboard compact={compact} interactive={false} />;
}
