# Portfolio concept notes

## VELORA Beauty House — client walkthrough

VELORA is an editorial salon concept built around a full-bleed, warm salon portrait, oversized serif wordmark, and quiet coffee-and-paper palette. The landing page moves from philosophy to a filterable 14-service catalog, four fictional specialists, an illustrative gallery, visit steps, FAQ, and a contact-safe demo booking flow. The images, names, prices, and schedule are identified as fictional concept material.

### What to show

1. Open `/velora` at desktop width to show the immersive hero and the transition into its asymmetric editorial sections.
2. Filter the service list, then open a specialist profile into booking to show service/master compatibility.
3. Filter the gallery and use arrow keys and Escape in the image viewer.
4. On mobile, show the sticky booking action and complete a demo reservation. Repeat the same specialist/time to show that the anonymous slot is held only for the current browser session.

The booking flow does not send or persist names or phone numbers. Only the anonymous slot details are kept in `sessionStorage`; production use needs a real availability and booking provider, reviewed privacy/consent copy, and salon-approved contact and service data.

### Implementation map

- Page and metadata: `src/velora/VeloraPage.tsx`
- Typed illustrative services, masters, gallery, and FAQ: `src/velora/content.ts`
- Booking dialogs and local repository boundary: `src/velora/BookingDialog.tsx`, `src/velora/booking-engine.mjs`
- Visual system: `src/styles/velora.css`
- Generated concept imagery: `public/images/velora-*.jpg`

## SOMA / Ritual Spa — client walkthrough

### What makes the concept distinctive

SOMA is presented as a small editorial campaign rather than a template spa landing page. One procedural oil bottle carries the visual story: it turns toward the visitor, moves closer to reveal material, enters a forest-dark phase, and returns to a calm front view. Native page scroll controls that choreography, so it remains reversible and does not take control of the browser's scroll behavior.

The surrounding interface uses the same material vocabulary: mineral paper, limestone, eucalyptus, deep green, ceramic, and bronze. Service selection and booking stay in the document flow, away from the 3D overlay.

### A short client walkthrough

1. Open `/work/soma` and show the first bottle frame before the 3D chunk finishes loading.
2. Scroll through the five scene phases, then reverse direction to show that the same camera and product values run backward smoothly.
3. Open the reduced-motion control and resize to a phone. The pinned sequence becomes a static hero and a readable list of all five story beats.
4. Filter the ritual catalog, open both conceptual images in the lightbox, change the gift amount, and show that the preview never starts a payment.
5. Complete the demo booking, then try the same specialist and time again. The first action reserves only an anonymous local slot; the contact fields are not sent or persisted.

### Commercial adaptation

For a real spa, replace the fictional brand, generated visualizations, service/pricing data, specialist bios, and operating details with client-approved material. Keep health and contraindication copy reviewed by the business. Before offering real booking, implement and verify a backend availability source, booking confirmation, cancellation rules, data retention, consent, and the required privacy notices. The current page does not make or imply a real reservation or sale.

### Implementation map

- Page and scroll progress: `src/pages/SomaExperiencePage.tsx`
- Procedural Three.js scene: `src/three/SomaScrollScene.tsx`
- Ritual and specialist data: `src/content/soma.ts`
- Local demo booking flow and adapter boundary: `src/components/SomaBooking.tsx` and `src/booking/soma-booking.ts`
- SOMA visual system: `src/styles/soma.css`
- Generated conceptual visualizations: `public/images/soma-interior.webp` and `public/images/soma-touch.webp`

### SOMA verification record

- `npm run build` passes TypeScript checking and Vite production bundling. Vite still reports the shared Three.js chunk at 574.89 kB minified (145.24 kB gzip); it is route-lazy-loaded and is not part of the initial portfolio page load.
- The production preview loaded `/work/soma` directly with Russian metadata, one WebGL canvas, all eight rituals, and no browser console errors.
- Rendered checks covered 360 × 800, 390 × 844, 768 × 1024, and 1280 × 800. Document width matched the available layout width at every size. At 768 px the scroll story remains active with lower-detail tablet framing; phones below 700 px use a static composition.
- The five desktop story phases rendered in order and in reverse. `prefers-reduced-motion`, the page motion control, keyboard focus for inactive story chapters, and a simulated WebGL initialization failure were checked; the failure case keeps the poster, heading, and service catalog available.
- Browser interactions covered the mobile menu and Escape focus return, section navigation, ritual filters, both local gallery images and lightbox controls, certificate preview, FAQ disclosure, and the complete demo booking flow. The same specialist/time is rejected on repeat, the stored record contains only the anonymous slot, and tested contact details were not persisted.
- Final hero captures are in `screenshots/soma-360x800-final.png`, `screenshots/soma-390x844-final.png`, `screenshots/soma-768x1024-final.png`, and `screenshots/soma-1280x800-final.png`; the five scene captures are `screenshots/soma-phase-00.png` through `screenshots/soma-phase-04.png`.
- Frame rate was not benchmarked. This verifies the local production preview, not a public deployment.

#### Tablet animation visibility follow-up — 2026-10-13

- The initial 768 px preview had WebGL rendering but forced the story into a static mode. The viewport policy now keeps all five reversible scroll phases active from 701–820 px, with a reduced-detail renderer and a camera frame adjusted to keep the bottle beside the copy.
- Browser inspection at 768 × 1024 confirmed a non-empty WebGL canvas, a sticky story stage, phase changes from 0 through 4, and return to phase 0 when scrolling back. The phone layout at 390 × 844 remains static; `prefers-reduced-motion` also remains static.
- Tablet phase captures are `screenshots/soma-tablet-phase-00.png` through `screenshots/soma-tablet-phase-04.png`. Frame rate was not benchmarked.

## KERN / BARBER CLUB — client walkthrough

KERN is a fictional barbershop concept for people who want to choose a haircut, service, barber, and time without first calling the shop. The page carries a contemporary men's editorial direction: charcoal, bone, steel, and a restrained brass-orange; large Cyrillic Oswald headlines; practical Manrope labels; and original generated haircut imagery. It avoids stock barbershop cues and identifies its images and business details as concept material.

### What to show

1. Open `/work/kern` on desktop or `/kern` on a phone. The first screen makes the service, level of craft, and booking action visible immediately.
2. Filter the price list. Prices and minutes stay visible, and a service selection seeds the booking flow.
3. Compare three fictional barbers, each with a different specialty, service list, and schedule.
4. Browse the haircut references, use the filters and keyboard-operated lightbox, then answer the three style questions to see local rule-based recommendations.
5. Walk through a demo booking. Choose a service, barber, date, and time, review the visit, and try an invalid phone number. The confirmation says the message was not sent; the occupied anonymous slot stays unavailable after a reload.

### Parts to personalize in one day

With approved client materials ready, the visual identity and business data can be adapted quickly: wordmark and palette, service names and prices, time estimates, barber profiles, schedules, reference imagery, opening details, FAQ answers, and contact information. The content lives in a typed catalog rather than being repeated across UI components. Replace the generated images with client-approved photographs and keep captions accurate.

### Production boundary

The current booking is a browser prototype. Names and phone numbers remain in the open form; only date, time, barber ID, and service duration are saved locally. It cannot confirm an actual appointment or notify a business. A real launch needs a shared server-side availability source, atomic overlap protection, idempotent booking creation, confirmation and cancellation handling, notification delivery, and approved privacy and consent copy. Real location and contact details are intentionally absent from this fictional concept.

### Implementation map

- Page, metadata, and demo route: `src/kern/KernBarberSite.tsx`
- Service, barber, schedule, and reference catalog: `src/kern/data.ts`
- Availability, local demo adapter, and phone validation: `src/kern/booking.ts`
- Style matching: `src/kern/styleFinder.ts`
- Header, booking, services, team, lookbook, finder, story, FAQ, and footer: `src/kern/components/`
- Visual system: `src/styles/kern.css`
- Generated concept imagery: `public/images/kern-hero.webp`, `kern-barbers.webp`, and `kern-lookbook.webp`
- Logic and browser checks: `tests/kern/logic.test.ts` and `scripts/kern-e2e.mjs`

The KERN experience was shaped with the installed `frontend-design` and `ui-taste` skills and original visuals from `imagegen`. It has not been deployed.
