# Alex / Creative development

An art-directed developer portfolio for a freelance creative developer working across identity, interactive web, product interfaces, and real-time 3D.

![Portfolio preview](public/og-preview.svg)

## What is here

The site is a small, fully client-side React experience with six independent concept projects:

- **Casa Marea** — a fictional boutique-hotel identity with its own image-led landing page, in-page navigation, and editorial case-study notes.
- **AER** — a headphone product launch with a procedural Three.js configurator, drag rotation, material finishes, loading fallback, and a mobile camera treatment.
- **Relay** — an illustrative studio operations product with separate overview, projects, and team views, a workload chart, and week/month controls.
- **SOMA / Ritual Spa** — a fictional Russian spa concept with one scroll-driven procedural 3D story, a ritual catalog, concept gallery, gift preview, specialists, FAQ, and local-only demo booking.
- **VELORA Beauty House** — a fictional Russian salon concept with editorial service catalog, illustrative team and gallery, and a browser-only demo booking flow.
- **KERN / BARBER CLUB** — a fictional Russian barbershop with an image-led editorial page, service and barber selection, haircut matching, a reference gallery, and local-only demo booking.

The concepts are fictional and labelled as such. Interface figures are illustrative; the site does not imply real clients, revenue, conversions, or live product data.

## Highlights

- A dedicated Casa Marea brand page that tells a complete visual story and then explains the concept, design direction, interaction, role, and outcome.
- Distinct visual language for each case study instead of a repeated card template.
- Route-level lazy loading for the homepage and case studies.
- AER's configurator and SOMA's scroll scene are route-lazy-loaded; the homepage and non-3D project pages do not load WebGL code.
- Original Casa Marea architectural imagery generated for this project and stored locally in `public/images/` as optimized WebP assets.
- SOMA's two generated campaign visuals are stored locally as optimized WebP files and explicitly labeled as concept imagery, not as photographs of a real location.
- SOMA uses one persistent procedural Three.js scene for five reversible scroll phases. The module loads after the DOM hero, draws only while the scene is visible and progress changes, and falls back to an SVG poster if WebGL is unavailable.
- SOMA keeps the scroll-driven story on desktop and tablet. Phones below 700 px and reduced-motion settings show a static composition with the full story transcript. A motion control is available in the page navigation.
- The SOMA booking adapter stores only anonymous date/time/service/duration/specialist slot records in `localStorage`; names and contact fields stay in component memory, are cleared after confirmation, and are never transmitted.
- KERN's generated barber and haircut visuals are local optimized WebP assets; its booking flow checks service length against each fictional barber's schedule and only stores anonymous slot details.
- Responsive layouts for desktop, tablet, and mobile, including a deliberately simplified mobile product framing and section navigation inside the Relay dashboard.
- Keyboard-visible focus states, semantic landmarks, skip link, descriptive image alt text, and `prefers-reduced-motion` support.
- Motion is used for reveal, hover, navigation, and direct manipulation rather than as decoration over static content.

## Stack

- React 19 + TypeScript
- Vite 8
- React Router
- Three.js (procedural AER and SOMA product models)
- CSS with local design tokens, shared component styles, and page-specific style sheets
- Google Fonts: Sora, DM Sans, Instrument Serif, Oswald, Manrope

## Run locally

Use Node.js 20.19 or newer in the 20.x line, or 22.12 or newer. These versions meet the Vite 8 engine requirement.

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. To build and preview the production output:

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
  booking/          SOMA's local demonstration booking adapter
  components/       Shared shell, artwork, dashboard, booking flow, reveals
  content/          Typed case-study and SOMA service content
  kern/             KERN service catalog, barbers, booking logic, and page components
  pages/            Homepage, case studies, standalone brand routes, not-found route
  styles/           Portfolio tokens and page-specific visual systems
  three/            Lazy-loaded AER and SOMA WebGL experiences
  velora/           VELORA content, page, dialogs, and demo booking logic
tests/kern/         KERN style-matching and scheduling logic tests
scripts/            Local browser E2E checks for KERN and VELORA
public/
  images/           Local Casa Marea and generated concept assets
  favicon.svg       Portfolio site icon
  kern-favicon.svg  KERN site icon
  og-preview.svg    Social preview artwork
screenshots/        Desktop and mobile QA captures
```

## Routes

- `/` — portfolio home, selected projects, capabilities, about, and contact sections.
- `/work/casa-marea` — the bespoke Casa Marea landing page and design study.
- `/work/aer` — the AER product story and procedural 3D configurator.
- `/work/relay` — the Relay dashboard concept with interactive Overview, Projects, and Team views.
- `/work/soma` — the standalone Russian SOMA experience; it does not use the portfolio navigation or footer.
- `/velora` — the standalone Russian VELORA salon concept and browser-only booking demonstration.
- `/kern` and `/work/kern` — the standalone Russian KERN barbershop concept and browser-only booking demonstration.

## SOMA route

The page is fictional showcase work. Prices and staff are illustrative; it has no real address, live availability, CRM, payment provider, or backend.

- The product form is built from `src/content/soma.ts`; the 3D bottle, ceramic cap, label texture, lighting, soft shadows, and leaf meshes are procedural in `src/three/SomaScrollScene.tsx`.
- `src/pages/SomaExperiencePage.tsx` maps native document scroll to one normalized progress value. Camera distance, product position/scale/rotation, key light, and scene background interpolate across five keyframes. Scrolling backward follows the same values in reverse.
- The booking interface is in `src/components/SomaBooking.tsx`; `src/booking/soma-booking.ts` is the replaceable `BookingAdapter`. Demo slots are deterministic, skip past dates and Sundays, check service/specialist compatibility and duration overlap, and prevent a second local reservation for the same specialist/time.
- The only persisted booking data is an anonymous slot record under `soma-demo-slots-v1`. Contact fields are not submitted, stored, or logged.
- The certificate action only changes its preview. It never creates an order or accepts payment.
- `prefers-reduced-motion`, phones below 700 px, and WebGL context failure keep the page accessible with its static composition and full story transcript. Tablets keep the scroll story with lower-detail rendering.
- Inactive scroll chapters are `inert`, so hidden CTA links do not enter the keyboard tab order. The 701–820 px tablet layout keeps all five scroll phases active.
- The interior and treatment visuals are generated concept images; captions and alt text identify them as visualizations. They are not presented as photos of an existing spa.
- The implementation used the installed `frontend-design` and `ui-taste` skills, including `new-work` and `craft`, plus the built-in `imagegen` skill for five-phase storyboard art direction and two concept visuals. No dedicated Three.js/WebGL or browser-testing skill was installed, so the scene uses the repository's existing Three.js dependency and browser checks are recorded separately.

### Replacing the concept content

- Change services, demo prices, specialists, and FAQ copy in `src/content/soma.ts`.
- Change the SOMA wordmark texture in `makeLabelTexture()` in `src/three/SomaScrollScene.tsx`; the site wordmark and page copy are in `src/pages/SomaExperiencePage.tsx`.
- Replace the concept gallery images at `public/images/soma-interior.webp` and `public/images/soma-touch.webp`, keeping captions clear about whether they show a real place.
- To connect a real booking system, replace `localDemoBookingAdapter` behind the `BookingAdapter` interface. Add server-side availability, privacy, consent, and error handling before sending any contact information. The current adapter is intentionally local-only.

The UI review used `frontend-design`, `ui-taste` (`new-work`, `craft`, `polish`), and `imagegen`. No separate Three.js/WebGL or browser skill was available in the installed workspace skill inventory.

## Architecture notes

The typed project model supplies the home index, route-level case studies, and next-project navigation. The shared case-study route uses project-specific content and artwork; Casa Marea has a bespoke landing page, AER loads its dedicated `HeadphoneExperience` module, and SOMA loads its persistent scroll scene and shared Three.js chunk only on their respective routes. Project presentation stays out of the shared site shell.

Relay keeps its interaction surface local to the prototype. Its section navigation changes between overview, project list, and team capacity views; the week/month selector updates the workload chart and the matching hours, capacity, and availability figures. Progress bars and sample metrics are illustrative and are not connected to a service.

Casa Marea uses anchored navigation, original local imagery, and a separate design-study section. Its desktop and mobile captures show the brand page; the Relay mobile capture is framed on its dashboard so the in-product navigation is visible.

## Performance notes

`npm run build` runs TypeScript checking and produces the production site. In the latest build, the AER configurator module is 10.64 kB minified (3.87 kB gzip), and the deferred Three.js chunk is 574.89 kB minified (145.24 kB gzip). Vite reports the Three.js chunk because it exceeds the 500 kB minified warning threshold. It is requested by the AER or SOMA experience when those routes load; the homepage, Casa Marea, Relay, VELORA, and KERN do not request it. The WebGL renderers cap device pixel ratio, request low-power contexts, pause while the document is hidden, and fall back to static product artwork if WebGL cannot initialize.

## Visual QA

The production preview was rendered at 1440 × 1000 desktop and 390 × 844 mobile viewports for the homepage and all three project routes. Responsive layout was measured at 17 widths from 320 to 1440 px across all four routes (68 route-width checks); the document and body widths matched each viewport with no horizontal overflow. The browser console had no errors on any route.

The mobile menu and Escape/focus return, Casa Marea section links, AER finish selection and drag rotation, and Relay section and week/month controls were exercised. The AER mobile capture is framed on its product view to show the procedural 3D model.

## Live demo

The portfolio's previously recorded Vercel URL is [alex-creative-portfolio.vercel.app](https://alex-creative-portfolio.vercel.app); its current contents were not verified. The SOMA route in this working tree was verified on the local production preview and was not deployed during this task.

To preview the site locally, use the commands in [Run locally](#run-locally).

## Screenshots

Screenshots were captured from the production preview at 1440 × 1000 desktop and 390 × 844 mobile viewports.

### Home

![Portfolio home at desktop width](screenshots/home-desktop.jpg)
![Portfolio home at mobile width](screenshots/home-mobile.jpg)

### Project pages

![Casa Marea brand landing page](screenshots/casa-marea.jpg)
![AER interactive product case study](screenshots/aer.jpg)
![Relay product dashboard case study](screenshots/relay.jpg)

<details>
<summary>Mobile project captures</summary>

![Casa Marea landing page at mobile width](screenshots/casa-marea-mobile.jpg)
![AER product configurator at mobile width](screenshots/aer-mobile.jpg)
![Relay dashboard and mobile section navigation](screenshots/relay-mobile.jpg)
</details>

`public/og-preview.svg` is a lightweight social preview. The original architectural assets used in the experience live in `public/images/casa-marea.webp` and `public/images/casa-marea-courtyard.webp`.

## VELORA BEAUTY HOUSE

Public demo: [alex-creative-portfolio.vercel.app/velora](https://alex-creative-portfolio.vercel.app/velora).

`/velora` is a separate Russian-language salon concept with a full responsive landing page and a browser-only demo booking flow. Its prices, people, hours, and images are fictional and labeled as demonstration material. The booking dialog filters specialists by service, builds deterministic times from service length and opening hours, validates contact fields, and reserves only an anonymous slot in `sessionStorage`. It does not submit a request or store contact details.

The VELORA catalog and master profiles are in `src/velora/content.ts`. Demo scheduling, validation, and the browser repository boundary live in `src/velora/booking-engine.mjs`; replace that adapter with a real server-backed provider before a salon launch. The visual direction and portfolio walkthrough are in [PORTFOLIO_NOTES.md](PORTFOLIO_NOTES.md). Generated images are compressed into `public/images/velora-*.jpg`.

### VELORA checks

```bash
npm run typecheck:velora
npm run test:velora
npm run dev
```

Open `http://localhost:5173/velora`. With the Vite server running and a local Chrome or Edge installed, `npm run test:e2e:velora` exercises the menu, filters, lightbox, booking flow, privacy boundary, and used-slot removal, then saves captures for 1440 × 900, 1280 × 800, 768 × 1024, 390 × 844, and 360 × 800 in `screenshots/`. Browser E2E uses Node 22 or newer.

Skills used: `frontend-design` shaped the art direction and visual hierarchy; `ui-taste` informed the new-work contract, implementation craft, and rendered critique; `imagegen` produced the original salon scene, hair/color studies, manicure detail, and four fictional master portraits.

## KERN / BARBER CLUB

KERN is a fictional barbershop concept. Its people, prices, schedules, haircut references, and generated imagery are demonstration content, not claims about a real business. `/kern` and `/work/kern` open the standalone Russian-language experience without the portfolio shell.

- The page is composed from `src/kern/KernBarberSite.tsx` and the focused components under `src/kern/components/`. Services, three fictional barbers, schedules, and six haircut references live in `src/kern/data.ts`; style matching is in `src/kern/styleFinder.ts`.
- The `BookingAdapter` contract and local demo implementation are in `src/kern/booking.ts`. The browser stores only date, time, barber ID, and service duration under `kern-demo-reservations-v1`. Names and phone numbers stay in the open form and are cleared with it. The confirmation states that no message was sent to a salon.
- The local availability rules skip closed days and elapsed times, match service eligibility and barber hours, and account for appointment duration. The adapter uses the browser's cross-tab lock when available and an in-page queue fallback; this is a prototype boundary, not a server booking guarantee.
- To connect a real booking system, replace the adapter with server-provided services and availability, then submit a booking with an idempotency key. The server must perform an atomic overlap check and reservation, and report authoritative confirmation or conflict before the UI claims a visit is booked. Add the business's notification and privacy workflows there.
- The concept photographs are generated and stored as optimized files at `public/images/kern-hero.webp`, `kern-barbers.webp`, and `kern-lookbook.webp`. Oswald and Manrope provide Cyrillic display and interface typography; their Google Fonts distribution uses the SIL Open Font License.
- The available `frontend-design`, `ui-taste`, and `imagegen` skills informed the art direction, interaction critique, and original concept imagery. No dedicated browser-testing skill was installed; `scripts/kern-e2e.mjs` uses the available local browser directly.

### KERN checks and local preview

```bash
npm run dev
npm run test
npm run test:e2e
```

Open `http://localhost:5173/work/kern`. `npm run test` covers deterministic style matching, barber schedules, service duration, overlap handling, and phone validation. `npm run test:e2e` opens a local Edge or Chrome browser, exercises keyboard navigation and the main booking path, checks privacy and slot persistence, reduced motion, console errors and missing local resources, and writes viewport captures at 1440 × 900, 1280 × 800, 768 × 1024, 390 × 844, and 360 × 800 plus a booking state into `screenshots/`.

The existing repository has no configured lint task. `npm run build` runs the full TypeScript check before creating the production bundle.

KERN is present in this local project working tree and has not been deployed. Existing public portfolio links do not imply that this concept is available on the deployed site.

### Adapting KERN for a real shop

- Replace services, prices, duration, barber bios, compatible services, and schedules in `src/kern/data.ts`.
- Replace the generated visual concepts under `public/images/` with business-approved photography and update captions and alt text to match the real images.
- Add the shop's approved name, address, opening details, and contact channels in `src/kern/components/KernFooter.tsx`; the current page deliberately has no fabricated contact details.
- Replace `LocalDemoBookingAdapter` with the real server adapter before advertising live availability. The current browser storage is not a shared schedule or a confirmed reservation.
