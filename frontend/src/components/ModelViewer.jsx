/* eslint-disable react/no-unknown-property */
import { Suspense, useRef, useLayoutEffect, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, Box3, Sphere, MathUtils } from 'three';

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const deg2rad = d => (d * Math.PI) / 180;
const DECIDE = 8;
const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG = deg2rad(6);
const HOVER_EASE = 0.15;

// === PROCEDURAL 3D MODELS (0 KB, 100% Reliable, 0 External Dependencies) ===
const ProceduralHeadphones = () => (
  <group scale={1.15}>
    <mesh position={[0, 0.4, 0]}>
      <torusGeometry args={[0.8, 0.08, 16, 32, Math.PI]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
    </mesh>
    <group position={[-0.8, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.25, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.13, 0, 0]}>
        <torusGeometry args={[0.42, 0.03, 16, 32]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]}>
        <torusGeometry args={[0.35, 0.1, 16, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
    </group>
    <group position={[0.8, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.25, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.13, 0, 0]}>
        <torusGeometry args={[0.42, 0.03, 16, 32]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.1, 0, 0]}>
        <torusGeometry args={[0.35, 0.1, 16, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
    </group>
  </group>
);

const ProceduralSmartWatch = () => (
  <group scale={1.2}>
    <mesh>
      <boxGeometry args={[0.9, 1.1, 0.25]} />
      <meshStandardMaterial color="#020617" metalness={0.95} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0, 0.13]}>
      <planeGeometry args={[0.8, 1.0]} />
      <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0, 0.14]}>
      <planeGeometry args={[0.72, 0.9]} />
      <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} />
    </mesh>
    <mesh position={[0.48, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
      <meshStandardMaterial color="#f97316" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.95, -0.05]} rotation={[-0.2, 0, 0]}>
      <boxGeometry args={[0.7, 0.8, 0.12]} />
      <meshStandardMaterial color="#1e293b" roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.95, -0.05]} rotation={[0.2, 0, 0]}>
      <boxGeometry args={[0.7, 0.8, 0.12]} />
      <meshStandardMaterial color="#1e293b" roughness={0.6} />
    </mesh>
  </group>
);

const ProceduralCyberGem = () => (
  <group scale={1.2}>
    <mesh>
      <octahedronGeometry args={[0.85, 0]} />
      <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.1} emissive="#ea580c" emissiveIntensity={0.8} transparent opacity={0.9} />
    </mesh>
    <mesh rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.2, 0.03, 16, 64]} />
      <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={2} />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
    </mesh>
  </group>
);

const ModelInner = ({
  modelType, xOff, yOff, pivot, initYaw, initPitch, minZoom, maxZoom,
  enableMouseParallax, enableManualRotation, enableHoverRotation, enableManualZoom,
  autoFrame, fadeIn, autoRotate, autoRotateSpeed, onLoaded
}) => {
  const outer = useRef(null);
  const inner = useRef(null);
  const { camera, gl } = useThree();
  const vel = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const pivotW = useRef(new Vector3());

  useLayoutEffect(() => {
    if (!inner.current || !outer.current) return;
    const g = inner.current;
    g.updateWorldMatrix(true, true);
    const sphere = new Box3().setFromObject(g).getBoundingSphere(new Sphere());
    const s = sphere.radius > 0 ? 1 / (sphere.radius * 2) : 1;
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);
    g.getWorldPosition(pivotW.current);
    pivot.copy(pivotW.current);
    outer.current.rotation.set(initPitch, initYaw, 0);
    onLoaded?.();
  }, [modelType]);

  useEffect(() => {
    if (!enableManualRotation || isTouch) return;
    const el = gl.domElement;
    if (!el) return;
    let drag = false; let lx = 0, ly = 0;
    const down = e => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      drag = true; lx = e.clientX; ly = e.clientY;
      window.addEventListener('pointerup', up);
    };
    const move = e => {
      if (!drag || !outer.current) return;
      const dx = e.clientX - lx; const dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      outer.current.rotation.y += dx * ROTATE_SPEED;
      outer.current.rotation.x += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
    };
    const up = () => (drag = false);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [gl, enableManualRotation]);

  useEffect(() => {
    if (!isTouch) return;
    const el = gl.domElement;
    if (!el) return;
    const pts = new Map();
    let mode = 'idle'; let sx = 0, sy = 0, lx = 0, ly = 0, startDist = 0, startZ = 0;
    const down = e => {
      if (e.pointerType !== 'touch') return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { mode = 'decide'; sx = lx = e.clientX; sy = ly = e.clientY; }
      else if (pts.size === 2 && enableManualZoom) {
        mode = 'pinch';
        const [p1, p2] = [...pts.values()];
        startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y); startZ = camera.position.z; e.preventDefault();
      }
    };
    const move = e => {
      const p = pts.get(e.pointerId); if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (mode === 'decide') {
        const dx = e.clientX - sx; const dy = e.clientY - sy;
        if (Math.abs(dx) > DECIDE || Math.abs(dy) > DECIDE) {
          if (enableManualRotation && Math.abs(dx) > Math.abs(dy)) { mode = 'rotate'; el.setPointerCapture(e.pointerId); }
          else { mode = 'idle'; pts.clear(); }
        }
      }
      if (mode === 'rotate' && outer.current) {
        e.preventDefault();
        const dx = e.clientX - lx; const dy = e.clientY - ly;
        lx = e.clientX; ly = e.clientY;
        outer.current.rotation.y += dx * ROTATE_SPEED; outer.current.rotation.x += dy * ROTATE_SPEED;
        vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
      } else if (mode === 'pinch' && pts.size === 2) {
        e.preventDefault();
        const [p1, p2] = [...pts.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y); const ratio = startDist / d;
        camera.position.z = MathUtils.clamp(startZ * ratio, minZoom, maxZoom);
      }
    };
    const up = e => {
      pts.delete(e.pointerId);
      if (mode === 'rotate' && pts.size === 0) mode = 'idle';
      if (mode === 'pinch' && pts.size < 2) mode = 'idle';
    };
    el.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    };
  }, [gl, enableManualRotation, enableManualZoom, minZoom, maxZoom]);

  useEffect(() => {
    if (isTouch) return;
    const mm = e => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (enableMouseParallax) tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG };
      if (enableHoverRotation) tHov.current = { x: ny * HOVER_MAG, y: nx * HOVER_MAG };
    };
    window.addEventListener('pointermove', mm);
    return () => window.removeEventListener('pointermove', mm);
  }, [enableMouseParallax, enableHoverRotation]);

  useFrame((_, dt) => {
    if (!outer.current) return;
    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
    cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x, phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
    cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;
    const ndc = pivotW.current.clone().project(camera);
    ndc.x += xOff + cPar.current.x; ndc.y += yOff + cPar.current.y;
    outer.current.position.copy(ndc.unproject(camera));
    outer.current.rotation.x += cHov.current.x - phx; outer.current.rotation.y += cHov.current.y - phy;
    if (autoRotate) outer.current.rotation.y += autoRotateSpeed * dt;
    outer.current.rotation.y += vel.current.x; outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA; vel.current.y *= INERTIA;
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {modelType === 'headphones' && <ProceduralHeadphones />}
        {modelType === 'watch' && <ProceduralSmartWatch />}
        {modelType === 'gem' && <ProceduralCyberGem />}
        {(!modelType || (modelType !== 'headphones' && modelType !== 'watch' && modelType !== 'gem')) && (
          <ProceduralCyberGem />
        )}
      </group>
    </group>
  );
};

const ModelViewer = ({
  modelType = 'headphones',
  width = 400,
  height = 400,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = -50,
  defaultRotationY = 20,
  defaultZoom = 0.5,
  minZoomDistance = 0.5,
  maxZoomDistance = 10,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = true,
  ambientIntensity = 0.5,
  keyLightIntensity = 1.2,
  fillLightIntensity = 0.6,
  rimLightIntensity = 0.8,
  autoFrame = false,
  showScreenshotButton = false,
  fadeIn = true,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  onModelLoaded
}) => {
  const pivot = useRef(new Vector3()).current;
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  const initYaw = deg2rad(defaultRotationX);
  const initPitch = deg2rad(defaultRotationY);
  const camZ = Math.min(Math.max(defaultZoom, minZoomDistance), maxZoomDistance);

  const capture = () => {
    const g = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
    if (!g || !s || !c) return;
    g.render(s, c);
    const urlPNG = g.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'model.png'; a.href = urlPNG; a.click();
  };

  return (
    <div style={{ width, height, touchAction: 'pan-y pinch-zoom', position: 'relative' }}>
      {showScreenshotButton && (
        <button
          onClick={capture}
          style={{
            position: 'absolute', border: '1px solid rgba(249,115,22,0.5)', right: 12, top: 12, zIndex: 10,
            cursor: 'pointer', padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.6)',
            color: '#f97316', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)'
          }}
        >
          📷 Screenshot
        </button>
      )}
      <Canvas
        shadows
        frameloop="always"
        gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <hemisphereLight skyColor="#ffffff" groundColor="#332211" intensity={0.7} />
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={keyLightIntensity} castShadow />
        <directionalLight position={[-5, 2, 5]} intensity={fillLightIntensity} />
        <directionalLight position={[0, 4, -5]} intensity={rimLightIntensity} />
        
        {/* Floor Shadow Disc */}
        <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial transparent opacity={0.35} depthWrite={false} color="#000000" />
        </mesh>

        <Suspense fallback={null}>
          <ModelInner
            modelType={modelType} xOff={modelXOffset} yOff={modelYOffset} pivot={pivot}
            initYaw={initYaw} initPitch={initPitch} minZoom={minZoomDistance} maxZoom={maxZoomDistance}
            enableMouseParallax={enableMouseParallax} enableManualRotation={enableManualRotation}
            enableHoverRotation={enableHoverRotation} enableManualZoom={enableManualZoom}
            autoFrame={autoFrame} fadeIn={fadeIn} autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed} onLoaded={onModelLoaded}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
