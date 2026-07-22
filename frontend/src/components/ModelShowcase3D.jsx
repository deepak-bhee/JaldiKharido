import { Suspense, lazy, useState } from 'react';

// Lazy-load so Three.js doesn't bloat the initial bundle
const ModelViewer = lazy(() => import('./ModelViewer'));

const SHOWCASE_MODELS = [
  {
    name: 'Toy Car',
    label: 'Electronics',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb',
    autoRotate: true,
    autoRotateSpeed: 0.5,
    environmentPreset: 'city',
    defaultZoom: 0.55,
    defaultRotationX: -30,
    defaultRotationY: 15,
    description: 'Drag to rotate • Scroll to zoom'
  },
  {
    name: 'Avocado',
    label: 'Organic Foods',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Avocado/glTF-Binary/Avocado.glb',
    autoRotate: true,
    autoRotateSpeed: 0.4,
    environmentPreset: 'forest',
    defaultZoom: 0.6,
    defaultRotationX: -20,
    defaultRotationY: 10,
    description: 'Drag to rotate • Scroll to zoom'
  },
  {
    name: 'Helmet',
    label: 'Sports',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    autoRotate: true,
    autoRotateSpeed: 0.3,
    environmentPreset: 'warehouse',
    defaultZoom: 0.7,
    defaultRotationX: -40,
    defaultRotationY: 20,
    description: 'Drag to rotate • Scroll to zoom'
  }
];

const ModelShowcase3D = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = SHOWCASE_MODELS[activeIdx];

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-surface to-[#0a0f1a]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-brand text-sm font-semibold tracking-widest uppercase">Interactive</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-2">
            Experience in 3D ✨
          </h2>
          <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">
            Explore our products in full 3D. Drag to rotate, scroll to zoom, hover to tilt.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {SHOWCASE_MODELS.map((m, i) => (
            <button
              key={m.name}
              onClick={() => setActiveIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
                ${i === activeIdx
                  ? 'bg-brand text-white border-brand shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                  : 'glass border-white/10 text-slate-400 hover:border-brand/40 hover:text-white'
                }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* 3D Viewer + Info */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* Viewer */}
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-brand/10 blur-xl" />
            <div className="relative glass border border-white/10 rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 0 60px rgba(249,115,22,0.12), 0 25px 50px rgba(0,0,0,0.5)' }}>
              <Suspense fallback={
                <div className="flex items-center justify-center bg-black/30"
                  style={{ width: 400, height: 400 }}>
                  <div className="text-center">
                    <div className="text-4xl mb-3 animate-spin">⚙️</div>
                    <div className="text-brand text-sm font-semibold">Loading 3D Model…</div>
                  </div>
                </div>
              }>
                <ModelViewer
                  key={active.url}
                  url={active.url}
                  width={400}
                  height={400}
                  autoRotate={active.autoRotate}
                  autoRotateSpeed={active.autoRotateSpeed}
                  environmentPreset={active.environmentPreset}
                  defaultZoom={active.defaultZoom}
                  defaultRotationX={active.defaultRotationX}
                  defaultRotationY={active.defaultRotationY}
                  fadeIn={true}
                  showScreenshotButton={true}
                  enableMouseParallax={true}
                  enableHoverRotation={true}
                  enableManualRotation={true}
                  enableManualZoom={true}
                  ambientIntensity={0.4}
                  keyLightIntensity={1.2}
                  fillLightIntensity={0.6}
                  rimLightIntensity={1.0}
                />
              </Suspense>
            </div>
            {/* Hint label */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full
              text-xs text-slate-400 border border-white/10 whitespace-nowrap pointer-events-none">
              🖱️ {active.description}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-5 max-w-xs text-center lg:text-left">
            <div>
              <span className="text-brand text-xs font-semibold tracking-widest uppercase">{active.label}</span>
              <h3 className="font-display font-black text-2xl text-white mt-1">{active.name}</h3>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: '🔄', text: 'Drag to freely rotate 360°' },
                { icon: '🔍', text: 'Scroll to zoom in and out' },
                { icon: '✨', text: 'Hover to tilt with parallax' },
                { icon: '📷', text: 'Screenshot button to save view' }
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3 glass border border-white/[0.06] rounded-xl px-4 py-2.5">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm text-slate-400">{f.text}</span>
                </div>
              ))}
            </div>

            <a href="/catalog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand to-orange-400
                text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all group">
              <span>Shop Now</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelShowcase3D;
