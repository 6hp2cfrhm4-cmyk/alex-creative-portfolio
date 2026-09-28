import { lazy, Suspense, useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

const HomePage = lazy(() => import("./pages/HomePage"));
const CaseStudyPage = lazy(() => import("./pages/CaseStudyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function SiteLayout() {
  const location = useLocation();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (location.hash) {
      const targetId = decodeURIComponent(location.hash.slice(1));
      const scrollToTarget = () => {
        const target = document.getElementById(targetId);
        if (!target) return false;

        target.scrollIntoView({
          behavior: reducedMotion ? "instant" : "smooth",
          block: "start",
        });

        return true;
      };

      if (scrollToTarget()) return;

      const observer = new MutationObserver(() => {
        if (scrollToTarget()) {
          observer.disconnect();
          window.clearTimeout(timeout);
        }
      });
      const timeout = window.setTimeout(() => observer.disconnect(), 5000);
      observer.observe(document.getElementById("main-content") ?? document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        window.clearTimeout(timeout);
      };
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content">
        <Suspense fallback={<div className="page-loading" role="status">Opening the project…</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/work/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
