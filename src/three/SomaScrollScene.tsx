import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

interface SomaScrollSceneProps {
  progressRef: MutableRefObject<number>;
  lowDetail: boolean;
  onReady: () => void;
  onFailure: () => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

interface SceneKeyframe {
  progress: number;
  x: number;
  scale: number;
  z: number;
  cameraY: number;
  rotation: number;
  keyLightX: number;
}

const storyKeyframes: SceneKeyframe[] = [
  { progress: 0, x: 1.05, scale: 1.02, z: 6.35, cameraY: 0.74, rotation: -0.08, keyLightX: -3.5 },
  { progress: 0.22, x: 1.18, scale: 1.08, z: 5.65, cameraY: 0.78, rotation: 0.86, keyLightX: -2.1 },
  { progress: 0.5, x: 1.55, scale: 1.19, z: 5.1, cameraY: 0.92, rotation: 1.52, keyLightX: 2.5 },
  { progress: 0.76, x: 0.73, scale: 1.37, z: 4.65, cameraY: 1.14, rotation: 2.12, keyLightX: 3.7 },
  { progress: 1, x: 0.92, scale: 0.98, z: 6.5, cameraY: 0.78, rotation: Math.PI * 2 - 0.1, keyLightX: -3.2 },
];

function makeLabelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  context.fillStyle = "#e7dfce";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(80, 83, 66, 0.38)";
  context.lineWidth = 2;
  context.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);
  context.fillStyle = "#384237";
  context.textAlign = "center";
  context.font = "500 104px Georgia, serif";
  context.fillText("SOMA", canvas.width / 2, 438);
  context.fillStyle = "#626a57";
  context.font = "500 24px Arial, sans-serif";
  context.fillText("BOTANICAL BODY OIL", canvas.width / 2, 500);
  context.fillStyle = "#777761";
  context.font = "24px Georgia, serif";
  context.fillText("RITUAL  /  01", canvas.width / 2, 886);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 124);
  gradient.addColorStop(0, "rgba(29, 36, 30, .33)");
  gradient.addColorStop(0.38, "rgba(29, 36, 30, .18)");
  gradient.addColorStop(1, "rgba(29, 36, 30, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeLeafMaterial(color: string): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.72,
    clearcoat: 0.12,
    side: THREE.DoubleSide,
  });
}

function createLeaf(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  rotation: number,
  scale: number,
  material: THREE.Material,
): void {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.3, 0.02, 0.66, 0.29);
  shape.quadraticCurveTo(0.37, 0.5, 0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.007,
    curveSegments: 8,
  });
  const leaf = new THREE.Mesh(geometry, material);
  leaf.position.set(x, y, z);
  leaf.rotation.z = rotation;
  leaf.scale.setScalar(scale);
  leaf.castShadow = true;
  parent.add(leaf);

  const veinCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.015, 0.006, 0.029),
    new THREE.Vector3(0.2, 0.085, 0.03),
    new THREE.Vector3(0.43, 0.18, 0.03),
    new THREE.Vector3(0.64, 0.285, 0.03),
  ]);
  const vein = new THREE.Mesh(
    new THREE.TubeGeometry(veinCurve, 10, 0.0045, 5, false),
    new THREE.MeshStandardMaterial({ color: "#b1ae87", roughness: 0.86 }),
  );
  vein.position.set(x, y, z);
  vein.rotation.z = rotation;
  vein.scale.setScalar(scale);
  parent.add(vein);
}

function makeBottle(labelTexture: THREE.CanvasTexture): THREE.Group {
  const bottle = new THREE.Group();
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.55, 0.045),
    new THREE.Vector2(0.58, 0.14),
    new THREE.Vector2(0.58, 1.16),
    new THREE.Vector2(0.55, 1.32),
    new THREE.Vector2(0.46, 1.43),
    new THREE.Vector2(0.3, 1.54),
    new THREE.Vector2(0.235, 1.59),
    new THREE.Vector2(0.235, 1.76),
    new THREE.Vector2(0, 1.76),
  ];
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#778064",
    roughness: 0.21,
    metalness: 0.02,
    clearcoat: 0.86,
    clearcoatRoughness: 0.17,
    transmission: 0.08,
    thickness: 0.34,
    ior: 1.45,
  });
  const glass = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), glassMaterial);
  glass.castShadow = true;
  glass.receiveShadow = true;
  bottle.add(glass);

  const oil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.475, 0.49, 0.82, 48, 1),
    new THREE.MeshPhysicalMaterial({ color: "#77714c", roughness: 0.42, metalness: 0.02, clearcoat: 0.28 }),
  );
  oil.position.y = 0.55;
  oil.castShadow = true;
  bottle.add(oil);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.244, 0.244, 0.055, 48),
    new THREE.MeshStandardMaterial({ color: "#a18468", metalness: 0.62, roughness: 0.34 }),
  );
  collar.position.y = 1.78;
  collar.castShadow = true;
  bottle.add(collar);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.245, 0.257, 0.4, 64, 1),
    new THREE.MeshPhysicalMaterial({ color: "#ded5c4", roughness: 0.7, clearcoat: 0.08, clearcoatRoughness: 0.58 }),
  );
  cap.position.y = 2.0;
  cap.castShadow = true;
  bottle.add(cap);

  const capTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.238, 0.245, 0.025, 64),
    new THREE.MeshStandardMaterial({ color: "#eee8dc", roughness: 0.73 }),
  );
  capTop.position.y = 2.213;
  bottle.add(capTop);

  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.586, 0.586, 0.82, 64, 1, true, -0.72, 1.44),
    new THREE.MeshPhysicalMaterial({ map: labelTexture, roughness: 0.94, metalness: 0, side: THREE.DoubleSide }),
  );
  label.position.y = 0.76;
  bottle.add(label);

  return bottle;
}

function frameAt(progress: number): [SceneKeyframe, SceneKeyframe, number] {
  const bounded = THREE.MathUtils.clamp(progress, 0, 1);
  for (let index = 0; index < storyKeyframes.length - 1; index += 1) {
    const first = storyKeyframes[index];
    const next = storyKeyframes[index + 1];
    if (bounded <= next.progress) {
      const amount = (bounded - first.progress) / (next.progress - first.progress);
      return [first, next, THREE.MathUtils.smoothstep(amount, 0, 1)];
    }
  }
  const last = storyKeyframes[storyKeyframes.length - 1];
  return [last, last, 0];
}

export function SomaScrollScene({ progressRef, lowDetail, onReady, onFailure, containerRef }: SomaScrollSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onReady, onFailure, containerRef });
  callbacksRef.current = { onReady, onFailure, containerRef };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lowDetail, powerPreference: "low-power" });
    } catch {
      callbacksRef.current.onFailure();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0.75, 6.35);
    camera.lookAt(0.15, 0.8, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowDetail ? 1 : 1.35));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !lowDetail;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.className = "soma-webgl-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight("#f7f0df", "#323d34", 2.2);
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight("#fff0d6", 4.1);
    keyLight.position.set(-3.5, 5.5, 4);
    keyLight.castShadow = !lowDetail;
    keyLight.shadow.mapSize.set(768, 768);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.bias = -0.00025;
    keyLight.shadow.radius = 5;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight("#c8d1b4", 1.6, 12, 2);
    fillLight.position.set(3.5, 1.5, 2.8);
    scene.add(fillLight);

    const labelTexture = makeLabelTexture();
    const arrangement = new THREE.Group();
    scene.add(arrangement);
    const botanicals = new THREE.Group();
    arrangement.add(botanicals);
    const bottle = makeBottle(labelTexture);
    bottle.position.set(0, -1.075, 0);
    arrangement.add(bottle);

    const leafMaterials = [makeLeafMaterial("#6e7b63"), makeLeafMaterial("#8d9476"), makeLeafMaterial("#4b5d4b")];
    const detailFactor = lowDetail ? 0.8 : 1;
    const leaves = [
      [1.16, 0.35, -0.25, 2.62, 1.18],
      [1.28, 0.93, -0.18, 0.18, 0.92],
      [1.42, 1.45, -0.28, 2.94, 1.0],
      [1.42, 0.34, -0.2, 0.48, 1.15],
      [1.55, 0.96, -0.2, 2.96, 0.96],
      [1.28, 1.5, -0.3, 0.12, 1.04],
      [0.83, 0.66, -0.52, 0.4, 0.82],
      [1.83, 0.64, -0.52, 2.62, 0.86],
    ] as const;
    leaves.forEach(([x, y, z, rotation, scale], index) => {
      if (lowDetail && index >= 5) return;
      createLeaf(botanicals, x, y, z, rotation, scale * detailFactor, leafMaterials[index % leafMaterials.length]);
    });

    const stemMaterial = new THREE.MeshStandardMaterial({ color: "#6d775f", roughness: 0.82 });
    const stems = [
      new THREE.CatmullRomCurve3([new THREE.Vector3(0.85, -0.55, -0.3), new THREE.Vector3(1.18, 0.1, -0.25), new THREE.Vector3(1.27, 0.88, -0.25), new THREE.Vector3(1.42, 1.66, -0.3)]),
      new THREE.CatmullRomCurve3([new THREE.Vector3(1.8, -0.56, -0.28), new THREE.Vector3(1.53, 0.06, -0.25), new THREE.Vector3(1.5, 0.88, -0.25), new THREE.Vector3(1.28, 1.68, -0.3)]),
    ];
    if (!lowDetail) stems.forEach((curve) => botanicals.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.012, 5, false), stemMaterial)));

    const shadowMaterial = new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide });
    const floorShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.35), shadowMaterial);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0.78, -1.062, 0.04);
    scene.add(floorShadow);

    const reduced = lowDetail;
    let raf = 0;
    let inView = false;
    let contextLost = false;
    const renderFrame = () => {
      raf = 0;
      if (document.hidden || !inView || contextLost) return;

      const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
      const [first, next, amount] = frameAt(progress);
      const lerp = (a: number, b: number) => THREE.MathUtils.lerp(a, b, amount);
      const viewWidth = callbacksRef.current.containerRef.current?.clientWidth ?? window.innerWidth;
      const compact = viewWidth <= 700;
      const tablet = viewWidth > 700 && viewWidth <= 820;
      arrangement.position.set(compact ? -1 : 0, compact ? 0.75 : 0, 0);
      botanicals.position.set(compact ? 0.65 : 0, 0, 0);
      bottle.position.set(compact ? 1.05 : lerp(first.x, next.x), compact ? 0.32 : -1.075, 0);
      bottle.scale.setScalar(compact ? 0.8 : lerp(first.scale, next.scale));
      bottle.rotation.y = lerp(first.rotation, next.rotation);
      bottle.rotation.x = THREE.MathUtils.lerp(0.015, -0.11, THREE.MathUtils.smoothstep(progress, 0.52, 0.82));
      arrangement.rotation.y = Math.sin(progress * Math.PI * 2) * 0.055;
      arrangement.rotation.z = THREE.MathUtils.lerp(0, -0.04, THREE.MathUtils.smoothstep(progress, 0.5, 0.8));
      keyLight.position.x = lerp(first.keyLightX, next.keyLightX);
      const forest = progress > 0.54 && progress < 0.88;
      keyLight.color.set(forest ? "#d6c7a5" : "#fff0d6");
      keyLight.intensity = forest ? 3.2 : 4.1;
      fillLight.intensity = forest ? 2.1 : 1.6;
      shadowMaterial.opacity = forest ? 0.96 : 0.88;
      if (compact) {
        camera.position.set(0.08, 1.05, 8.2);
        camera.lookAt(0.15, 1, 0);
        floorShadow.position.set(0.05, 1.062, 0.04);
      } else {
        camera.position.set(0.08, lerp(first.cameraY, next.cameraY), lerp(first.z, next.z) * (tablet ? 1.5 : 1));
        camera.lookAt(tablet ? 0.65 : 0.16, 0.78, 0);
        floorShadow.position.set(0.78, -1.062, 0.04);
      }
      renderer.render(scene, camera);
    };
    const requestRender = () => {
      if (!inView || document.hidden || contextLost || raf) return;
      raf = window.requestAnimationFrame(renderFrame);
    };
    const resize = () => {
      const parent = callbacksRef.current.containerRef.current;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.fov = width <= 700 ? 41 : 36;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, reduced ? 1 : 1.35));
      requestRender();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const start = () => {
      if (inView) return;
      inView = true;
      requestRender();
      callbacksRef.current.onReady();
    };
    const stop = () => {
      inView = false;
      window.cancelAnimationFrame(raf);
      raf = 0;
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start();
      else stop();
    }, { rootMargin: "60px" });
    observer.observe(mount);
    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else requestRender();
    };
    const onStoryProgress = () => requestRender();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      callbacksRef.current.onFailure();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("soma:story-progress", onStoryProgress);
    if (mount.getBoundingClientRect().top < window.innerHeight) start();

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("soma:story-progress", onStoryProgress);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          const map = "map" in material ? material.map : null;
          map?.dispose();
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [lowDetail, progressRef]);

  return <div ref={mountRef} className="soma-scene" aria-hidden="true" />;
}
