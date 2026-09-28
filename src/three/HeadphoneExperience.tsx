import { useEffect, useRef, useState } from "react";
import type { Mesh, MeshStandardMaterial, Object3D } from "three";

const finishes = [
  { id: "mineral", label: "Mineral", color: "#c7d1ce", shell: "#80918f" },
  { id: "graphite", label: "Graphite", color: "#535a60", shell: "#454d55" },
  { id: "cobalt", label: "Cobalt", color: "#5273d7", shell: "#304bb1" },
] as const;

type FinishId = typeof finishes[number]["id"];

function HeadphoneCanvas({ finish }: { finish: FinishId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<Mesh | null>(null);
  const accentRef = useRef<Mesh | null>(null);
  const scrollRef = useRef(0);
  const dragRef = useRef({ active: false, interacted: false, lastX: 0, lastY: 0, targetX: -0.09, targetY: -0.32 });
  const [renderStatus, setRenderStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    void import("three").then((THREE) => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const context = canvas.getContext("webgl2", { antialias: true, alpha: false, powerPreference: "low-power" })
        ?? canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "low-power" });
      if (!context) {
        setRenderStatus("fallback");
        return;
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#12191d");
      const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
      camera.position.set(0, 0.16, 8.8);
      const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false, powerPreference: "low-power" });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.matchMedia("(max-width: 760px)").matches ? 1.35 : 1.6);
      renderer.setPixelRatio(pixelRatio);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      const group = new THREE.Group();
      scene.add(group);

      const graphite = new THREE.MeshStandardMaterial({ color: "#29323a", roughness: 0.34, metalness: 0.72 });
      const bandMetal = new THREE.MeshStandardMaterial({ color: "#aab4b2", roughness: 0.24, metalness: 0.84 });
      const shell = new THREE.MeshStandardMaterial({ color: finishes[0].shell, roughness: 0.28, metalness: 0.48 });
      const cushion = new THREE.MeshStandardMaterial({ color: "#111518", roughness: 0.86, metalness: 0.04 });
      const subtle = new THREE.MeshStandardMaterial({ color: "#d8d5ca", roughness: 0.3, metalness: 0.66 });

      const bandPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.63, 0.28, 0.02),
        new THREE.Vector3(-1.51, 1.64, 0.04),
        new THREE.Vector3(-0.86, 2.12, 0.03),
        new THREE.Vector3(0, 2.27, 0),
        new THREE.Vector3(0.86, 2.12, 0.03),
        new THREE.Vector3(1.51, 1.64, 0.04),
        new THREE.Vector3(1.63, 0.28, 0.02),
      ]);
      const frame = new THREE.Mesh(new THREE.TubeGeometry(bandPath, 84, 0.14, 20, false), graphite);
      group.add(frame);

      const innerBand = new THREE.Mesh(new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.47, 0.54, -0.018), new THREE.Vector3(-1.35, 1.6, -0.02), new THREE.Vector3(-0.72, 1.99, -0.025), new THREE.Vector3(0, 2.1, -0.03), new THREE.Vector3(0.72, 1.99, -0.025), new THREE.Vector3(1.35, 1.6, -0.02), new THREE.Vector3(1.47, 0.54, -0.018),
        ]), 72, 0.054, 12, false), cushion);
      group.add(innerBand);

      const shells: Mesh[] = [];
      const sideDetails: Mesh[] = [];
      for (const side of [-1, 1]) {
        const cup = new THREE.Group();
        cup.position.set(side * 1.56, 0.19, 0);
        cup.rotation.y = side * -0.1;
        group.add(cup);

        const joint = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.38, 0.25), bandMetal);
        joint.position.y = 0.46;
        cup.add(joint);
        const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.31, 0.13), graphite);
        yoke.position.set(side * 0.045, 0.18, 0.02);
        cup.add(yoke);

        const shellMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.67, 0.36, 72, 1, false), shell);
        shellMesh.rotation.x = Math.PI / 2;
        cup.add(shellMesh);
        shells.push(shellMesh);

        const outerRim = new THREE.Mesh(new THREE.TorusGeometry(0.59, 0.06, 12, 64), subtle);
        outerRim.position.z = 0.19;
        cup.add(outerRim);

        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.57, 0.115, 64), graphite);
        core.rotation.x = Math.PI / 2;
        core.position.z = 0.21;
        cup.add(core);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.465, 0.04, 10, 64), bandMetal);
        ring.position.z = 0.285;
        cup.add(ring);

        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.43, 0.17, 48), cushion);
        inner.rotation.x = Math.PI / 2;
        inner.position.z = side * 0.37;
        cup.add(inner);

        for (let n = 0; n < 12; n += 1) {
          const angle = (n / 12) * Math.PI * 2;
          const port = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), graphite);
          port.position.set(Math.cos(angle) * 0.545, Math.sin(angle) * 0.545, 0.285);
          port.scale.set(1, 1, 0.3);
          cup.add(port);
        }

        const badge = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.018, 0.08), subtle);
        badge.position.set(0, -0.32, 0.279);
        cup.add(badge);
        const detail = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 14), subtle);
        detail.position.set(side * 0.43, -0.38, 0.25);
        cup.add(detail);
        sideDetails.push(detail);
      }

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 18),
        new THREE.MeshStandardMaterial({ color: "#182126", roughness: 0.94, metalness: 0.08 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.79;
      floor.position.z = -0.72;
      scene.add(floor);

      scene.add(new THREE.HemisphereLight("#c7d7e4", "#172024", 1.15));
      const key = new THREE.DirectionalLight("#fff1db", 3.1);
      key.position.set(-3.2, 4.4, 4.1);
      scene.add(key);
      const rim = new THREE.DirectionalLight("#6d8de0", 2.7);
      rim.position.set(3.6, 2.4, -2.4);
      scene.add(rim);
      const fill = new THREE.PointLight("#ffffff", 15, 9);
      fill.position.set(1.4, 0.6, 4.5);
      scene.add(fill);

      shellRef.current = shells[0];
      accentRef.current = sideDetails[0];
      const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);
        camera.aspect = width / height;
        camera.position.z = width < 560 ? 11.2 : 8.8;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        measureScroll();
      };
      const measureScroll = () => {
        const bounds = canvas.getBoundingClientRect();
        scrollRef.current = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      };
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      resize();

      let frameId = 0;
      let wasRunning = false;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const draw = (time: number) => {
        frameId = requestAnimationFrame(draw);
        const { targetX, targetY, interacted } = dragRef.current;
        const amplitude = reducedMotion.matches ? 0.018 : 0.045;
        const float = Math.sin(time * 0.00055) * amplitude;
        group.rotation.y += (targetY - group.rotation.y) * 0.06;
        group.rotation.x += (targetX - group.rotation.x) * 0.06;
        const scrollOffset = reducedMotion.matches ? 0 : scrollRef.current * 0.2;
        group.position.y += ((float + scrollOffset) - group.position.y) * 0.045;
        const scale = 1 - (reducedMotion.matches ? 0 : scrollRef.current * 0.06);
        group.scale.setScalar(scale);
        if (!dragRef.current.active && !interacted && !reducedMotion.matches) {
          const idleRotation = -0.32 + Math.sin(time * 0.00019) * 0.06;
          dragRef.current.targetY += (idleRotation - dragRef.current.targetY) * 0.006;
        }
        renderer.render(scene, camera);
      };
      const visibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(frameId);
          wasRunning = true;
        } else if (wasRunning) {
          wasRunning = false;
          frameId = requestAnimationFrame(draw);
        }
      };
      window.addEventListener("scroll", measureScroll, { passive: true });
      measureScroll();
      frameId = requestAnimationFrame(draw);
      document.addEventListener("visibilitychange", visibility);
      setRenderStatus("ready");

      dispose = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("scroll", measureScroll);
        observer.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        scene.traverse((object) => {
          const drawable = object as Object3D & { geometry?: { dispose?: () => void }; material?: MeshStandardMaterial | MeshStandardMaterial[] };
          if (drawable.geometry && typeof drawable.geometry.dispose === "function") drawable.geometry.dispose();
          if (drawable.material) {
            const material = drawable.material;
            if (Array.isArray(material)) material.forEach((item) => item.dispose());
            else if (material && typeof material.dispose === "function") material.dispose();
          }
        });
        renderer.dispose();
      };
    }).catch(() => {
      // The HTML product annotations remain usable if WebGL cannot initialize.
      if (!cancelled) setRenderStatus("fallback");
    });

    return () => {
      cancelled = true;
      dispose();
      shellRef.current = null;
      accentRef.current = null;
    };
  }, []);

  useEffect(() => {
    const finishData = finishes.find((item) => item.id === finish)!;
    if (shellRef.current?.material && !Array.isArray(shellRef.current.material) && "color" in shellRef.current.material) {
      (shellRef.current.material as MeshStandardMaterial).color.set(finishData.shell);
    }
    if (accentRef.current?.material && !Array.isArray(accentRef.current.material) && "color" in accentRef.current.material) {
      (accentRef.current.material as MeshStandardMaterial).color.set(finishData.color);
    }
  }, [finish]);

  return (
    <div
      className="aer-canvas-wrap"
      aria-busy={renderStatus === "loading"}
      onPointerDown={(event) => {
        dragRef.current.active = true;
        dragRef.current.interacted = true;
        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragRef.current.active) return;
        const dx = event.clientX - dragRef.current.lastX;
        const dy = event.clientY - dragRef.current.lastY;
        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;
        dragRef.current.targetY += dx * 0.008;
        dragRef.current.targetX = Math.max(-0.42, Math.min(0.42, dragRef.current.targetX + dy * 0.004));
      }}
      onPointerUp={() => { dragRef.current.active = false; }}
      onPointerCancel={() => { dragRef.current.active = false; }}
      onLostPointerCapture={() => { dragRef.current.active = false; }}
      onWheel={(event) => { dragRef.current.interacted = true; dragRef.current.targetY += event.deltaY * 0.0015; }}
      role="group"
      aria-label="Interactive AER Studio headphones. Drag to rotate the model."
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { dragRef.current.interacted = true; dragRef.current.targetY -= 0.24; }
        if (event.key === "ArrowRight") { dragRef.current.interacted = true; dragRef.current.targetY += 0.24; }
      }}
      onBlur={() => { dragRef.current.active = false; }}
    >
      <canvas ref={canvasRef} className="aer-canvas" aria-hidden="true" />
      {renderStatus === "loading" && <div className="aer-canvas-fallback" role="status">Preparing the live product view…</div>}
      {renderStatus === "fallback" && <div className="aer-canvas-static" aria-hidden="true"><svg viewBox="0 0 500 380"><ellipse cx="250" cy="333" rx="155" ry="19" fill="#080d10" opacity=".6"/><path d="M127 211c-9-110 35-165 123-165s132 55 123 165" fill="none" stroke="#202a30" strokeWidth="29" strokeLinecap="round"/><path d="M128 204c-5-94 36-140 122-140s127 46 122 140" fill="none" stroke="#aeb9b5" strokeWidth="8" strokeLinecap="round"/><g fill="var(--aer-accent)"><rect x="83" y="176" width="92" height="126" rx="36"/><rect x="325" y="176" width="92" height="126" rx="36"/></g><g fill="#171e22" stroke="#d3d9d5" strokeWidth="6"><rect x="94" y="187" width="70" height="104" rx="28"/><rect x="336" y="187" width="70" height="104" rx="28"/></g></svg></div>}
      <div className="aer-canvas__annotation aer-canvas__annotation--left"><i /><span>40 mm<br />Dynamic driver</span></div>
      <div className="aer-canvas__annotation aer-canvas__annotation--right"><i /><span>Aluminium<br />Precision housing</span></div>
      <span className="aer-canvas__instruction"><span aria-hidden="true">↕</span> Drag to explore</span>
    </div>
  );
}

export function HeadphoneExperience() {
  const [finish, setFinish] = useState<FinishId>("mineral");
  const selected = finishes.find((item) => item.id === finish)!;
  return (
    <div className="headphone-experience">
      <div className="aer-configurator">
        <div className="aer-configurator__headline"><span>AER / STUDIO 01</span><h2>The quieter<br />kind of loud.</h2><p>Balanced sound. Anodised aluminium. Designed to live in for hours.</p></div>
        <div className="aer-configurator__selectors">
          <p>Choose a finish</p>
          <div role="group" aria-label="Headphone finish" className="finish-selector">
            {finishes.map((item) => <button key={item.id} type="button" className={`finish-option${item.id === finish ? " is-selected" : ""}`} aria-label={`${item.label} finish`} aria-pressed={item.id === finish} onClick={() => setFinish(item.id)}><i style={{ backgroundColor: item.color }} /><span>{item.label}</span></button>)}
          </div>
          <p className="aer-configurator__selected">Finish / <strong>{selected.label}</strong></p>
          <button className="aer-configurator__action" type="button" onClick={() => document.querySelector(".case-intro")?.scrollIntoView({ behavior: "smooth" })}>Explore the build <span aria-hidden="true">↓</span></button>
        </div>
        <div className="aer-configurator__spec"><div><span>Weight</span><b>248 g</b></div><div><span>Playback</span><b>34 hours</b></div><div><span>Driver</span><b>40 mm</b></div></div>
      </div>
      <div className="aer-product-view" style={{ "--aer-accent": selected.color } as React.CSSProperties}>
        <HeadphoneCanvas finish={finish} />
        <div className="aer-product-view__footer"><span>STUDIO 01 — OVER-EAR</span><span>SPATIAL AUDIO / 2026</span></div>
      </div>
    </div>
  );
}
