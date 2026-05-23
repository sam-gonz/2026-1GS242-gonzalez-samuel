interface PixelBgProps {
  blur?: boolean
}

export default function PixelBg({ blur = true }: PixelBgProps) {
  return (
    <>
      <style>{`
        .pixelbg-wrap {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* ── Cielo degradado ── */
        .pixelbg-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,
            #1a1a2e 0%,
            #16213e 40%,
            #0f3460 70%,
            #1a3a2a 100%
          );
        }

        /* ── Estrellas pixel ── */
        .pixelbg-stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 15%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 8%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 20%, #ffe 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 5%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 12%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 18%, #ffe 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 9%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 30%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 25%, #fff 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 35%, #ffe 0%, transparent 100%),
            radial-gradient(2px 2px at 5% 10%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(2px 2px at 90% 22%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(2px 2px at 48% 14%, rgba(255,255,220,0.8) 0%, transparent 100%);
          animation: pixelStarTwinkle 4s ease-in-out infinite alternate;
        }
        @keyframes pixelStarTwinkle {
          0%   { opacity: 0.6; }
          50%  { opacity: 1; }
          100% { opacity: 0.7; }
        }

        /* ── Luna pixel ── */
        .pixelbg-moon {
          position: absolute;
          top: 6%;
          right: 12%;
          width: 40px;
          height: 40px;
          image-rendering: pixelated;
          background: #f5e642;
          box-shadow:
            0 0 0 4px #f5e642,
            0 0 0 8px rgba(245,230,66,0.3),
            0 0 20px rgba(245,230,66,0.2);
          clip-path: polygon(
            25% 0%, 75% 0%, 100% 25%, 100% 75%,
            75% 100%, 25% 100%, 0% 75%, 0% 25%
          );
        }

        /* ── Montañas de fondo (oscuras) ── */
        .pixelbg-mountains-far {
          position: absolute;
          bottom: 32%;
          left: 0;
          right: 0;
          height: 160px;
          background: #0d1b2a;
          clip-path: polygon(
            0% 100%,
            0% 70%,
            4% 70%,   5% 50%,   8% 50%,
            10% 25%,  12% 25%,  14% 45%,  16% 45%,
            18% 30%,  20% 30%,  22% 10%,  24% 10%,
            26% 30%,  28% 30%,  30% 50%,  32% 50%,
            34% 35%,  36% 35%,  38% 55%,  40% 55%,
            42% 20%,  44% 20%,  46% 40%,  48% 40%,
            50% 60%,  52% 60%,  54% 40%,  56% 40%,
            58% 55%,  60% 55%,  62% 30%,  64% 30%,
            66% 50%,  68% 50%,  70% 35%,  72% 35%,
            74% 15%,  76% 15%,  78% 40%,  80% 40%,
            82% 55%,  84% 55%,  86% 35%,  88% 35%,
            90% 50%,  92% 50%,  94% 65%,  96% 65%,
            98% 55%,  100% 55%,
            100% 100%
          );
          filter: drop-shadow(0 -4px 0 #111827);
        }

        /* ── Montañas intermedias ── */
        .pixelbg-mountains-mid {
          position: absolute;
          bottom: 30%;
          left: 0;
          right: 0;
          height: 120px;
          background: #112240;
          clip-path: polygon(
            0% 100%,
            0% 80%,
            3% 80%,   5% 55%,   7% 55%,
            9% 70%,   11% 70%,  13% 40%,  15% 40%,
            17% 60%,  19% 60%,  21% 45%,  23% 45%,
            25% 65%,  27% 65%,  30% 80%,  33% 80%,
            35% 50%,  37% 50%,  39% 70%,  41% 70%,
            43% 35%,  45% 35%,  47% 55%,  49% 55%,
            51% 75%,  53% 75%,  55% 55%,  57% 55%,
            59% 40%,  61% 40%,  63% 60%,  65% 60%,
            67% 80%,  70% 80%,  72% 60%,  74% 60%,
            76% 45%,  78% 45%,  80% 65%,  82% 65%,
            84% 80%,  86% 80%,  88% 60%,  90% 60%,
            92% 75%,  94% 75%,  96% 85%,  98% 85%,
            100% 80%, 100% 100%
          );
        }

        /* ── Franja de tierra oscura ── */
        .pixelbg-dirt {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 32%;
          background: #1a2f1a;
          border-top: 4px solid #2d4a2d;
        }

        /* ── Cesped pixel superior ── */
        .pixelbg-grass-top {
          position: absolute;
          bottom: 32%;
          left: 0;
          right: 0;
          height: 16px;
          background: #3a7d44;
          image-rendering: pixelated;
        }
        .pixelbg-grass-top::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          height: 8px;
          background-image: repeating-linear-gradient(
            90deg,
            #3a7d44 0px, #3a7d44 8px,
            #4a9e56 8px, #4a9e56 16px,
            #3a7d44 16px, #3a7d44 24px,
            transparent 24px, transparent 32px
          );
        }
        .pixelbg-grass-top::after {
          content: '';
          position: absolute;
          top: -4px;
          left: 0;
          right: 0;
          height: 4px;
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0px, transparent 12px,
            #5cb86a 12px, #5cb86a 20px,
            transparent 20px, transparent 36px,
            #5cb86a 36px, #5cb86a 44px
          );
        }

        /* ── Camino pixel ── */
        .pixelbg-path {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 32%;
          background: #c8a96e;
          border-left: 4px solid #b89055;
          border-right: 4px solid #b89055;
        }
        .pixelbg-path::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent 0px, transparent 14px,
            rgba(0,0,0,0.08) 14px, rgba(0,0,0,0.08) 16px
          );
        }

        /* ── Arboles izquierda ── */
        .pixelbg-trees-left {
          position: absolute;
          bottom: 30%;
          left: 0;
          width: 38%;
          height: 140px;
          display: flex;
          align-items: flex-end;
          gap: 0;
        }

        /* ── Arboles derecha ── */
        .pixelbg-trees-right {
          position: absolute;
          bottom: 30%;
          right: 0;
          width: 38%;
          height: 140px;
          display: flex;
          align-items: flex-end;
          gap: 0;
          flex-direction: row-reverse;
        }

        /* ── Arbol pixel individual ── */
        .pixel-tree {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .pixel-tree-crown {
          width: 32px;
          height: 32px;
          background: #2d7a2d;
          box-shadow:
            -8px 8px 0 #2d7a2d,
             8px 8px 0 #2d7a2d,
            -8px 0px 0 #3a9a3a,
             8px 0px 0 #3a9a3a,
             0px -8px 0 #3a9a3a;
          image-rendering: pixelated;
        }
        .pixel-tree-crown-top {
          width: 16px;
          height: 16px;
          background: #4ab84a;
          margin-bottom: -4px;
          box-shadow: -4px 4px 0 #4ab84a, 4px 4px 0 #4ab84a;
          image-rendering: pixelated;
        }
        .pixel-tree-trunk {
          width: 8px;
          height: 20px;
          background: #6b4226;
          box-shadow: inset -2px 0 0 #4a2e1a;
          image-rendering: pixelated;
        }

        /* ── Arboles variados (tamaños) ── */
        .pixel-tree--sm .pixel-tree-crown  { width: 24px; height: 24px; }
        .pixel-tree--sm .pixel-tree-crown-top { width: 12px; height: 12px; }
        .pixel-tree--sm .pixel-tree-trunk  { height: 14px; }
        .pixel-tree--lg .pixel-tree-crown  { width: 40px; height: 40px; }
        .pixel-tree--lg .pixel-tree-crown-top { width: 20px; height: 20px; }
        .pixel-tree--lg .pixel-tree-trunk  { width: 10px; height: 26px; }

        /* ── Arbustos ── */
        .pixel-bush {
          width: 24px;
          height: 16px;
          background: #1e5c1e;
          box-shadow:
            -8px 4px 0 #1e5c1e,
             8px 4px 0 #1e5c1e,
             0px -4px 0 #2a7a2a;
          image-rendering: pixelated;
          margin-bottom: 0;
        }

        /* ── Flores pixel ── */
        .pixel-flowers {
          position: absolute;
          bottom: 30%;
          left: 0;
          right: 0;
          height: 12px;
          pointer-events: none;
          background-image:
            radial-gradient(circle 3px at 15% 60%, #ff6b6b 0%, transparent 100%),
            radial-gradient(circle 3px at 22% 70%, #ff6b6b 0%, transparent 100%),
            radial-gradient(circle 2px at 20% 40%, #fff 0%, transparent 100%),
            radial-gradient(circle 3px at 65% 55%, #ffdd57 0%, transparent 100%),
            radial-gradient(circle 3px at 72% 65%, #ff6b6b 0%, transparent 100%),
            radial-gradient(circle 2px at 78% 45%, #fff 0%, transparent 100%),
            radial-gradient(circle 3px at 88% 60%, #ffdd57 0%, transparent 100%),
            radial-gradient(circle 2px at 35% 50%, #ffdd57 0%, transparent 100%);
        }

        /* ── Nubes pixel animadas ── */
        .pixelbg-cloud {
          position: absolute;
          background: rgba(255,255,255,0.12);
          image-rendering: pixelated;
        }
        .pixelbg-cloud::before,
        .pixelbg-cloud::after {
          content: '';
          position: absolute;
          background: rgba(255,255,255,0.12);
        }
        .pixelbg-cloud-1 {
          top: 10%; left: -120px;
          width: 80px; height: 16px;
          animation: cloudMove 28s linear infinite;
        }
        .pixelbg-cloud-1::before {
          top: -8px; left: 16px;
          width: 48px; height: 16px;
        }
        .pixelbg-cloud-1::after {
          top: -4px; left: 8px;
          width: 64px; height: 8px;
        }
        .pixelbg-cloud-2 {
          top: 18%; left: -160px;
          width: 96px; height: 16px;
          animation: cloudMove 40s linear infinite;
          animation-delay: -12s;
        }
        .pixelbg-cloud-2::before {
          top: -8px; left: 20px;
          width: 56px; height: 16px;
        }
        .pixelbg-cloud-2::after {
          top: -4px; left: 12px;
          width: 72px; height: 8px;
        }
        .pixelbg-cloud-3 {
          top: 7%; left: -80px;
          width: 64px; height: 12px;
          animation: cloudMove 22s linear infinite;
          animation-delay: -8s;
        }
        .pixelbg-cloud-3::before {
          top: -8px; left: 12px;
          width: 40px; height: 12px;
        }
        @keyframes cloudMove {
          from { left: -200px; }
          to   { left: 110%; }
        }

        /* ── Overlay de niebla ── */
        .pixelbg-fog {
          position: absolute;
          bottom: 28%;
          left: 0; right: 0;
          height: 60px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(16,40,20,0.35) 50%,
            transparent 100%
          );
          animation: fogDrift 8s ease-in-out infinite alternate;
        }
        @keyframes fogDrift {
          from { opacity: 0.4; transform: translateX(-2%); }
          to   { opacity: 0.7; transform: translateX(2%); }
        }

        /* ── Blur overlay para menus ── */
        .pixelbg-blur-overlay {
          position: absolute;
          inset: 0;
          backdrop-filter: blur(6px) brightness(0.7) saturate(0.8);
          -webkit-backdrop-filter: blur(6px) brightness(0.7) saturate(0.8);
          background: rgba(10,10,20,0.45);
        }

        /* ── Grid pixel sutil encima ── */
        .pixelbg-scanlines {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.04) 3px,
            rgba(0,0,0,0.04) 4px
          );
          pointer-events: none;
        }
      `}</style>

      <div className="pixelbg-wrap">
        <div className="pixelbg-sky" />
        <div className="pixelbg-stars" />
        <div className="pixelbg-moon" />

        {/* Nubes */}
        <div className="pixelbg-cloud pixelbg-cloud-1" />
        <div className="pixelbg-cloud pixelbg-cloud-2" />
        <div className="pixelbg-cloud pixelbg-cloud-3" />

        {/* Montañas */}
        <div className="pixelbg-mountains-far" />
        <div className="pixelbg-mountains-mid" />

        {/* Suelo */}
        <div className="pixelbg-dirt" />
        <div className="pixelbg-grass-top" />
        <div className="pixelbg-path" />
        <div className="pixel-flowers" />

        {/* Árboles izquierda */}
        <div className="pixelbg-trees-left">
          <div className="pixel-tree pixel-tree--sm" style={{marginBottom:2}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-tree pixel-tree--lg" style={{marginLeft:4}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-tree" style={{marginLeft:8}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-bush" style={{marginLeft:12,marginBottom:4}} />
          <div className="pixel-tree pixel-tree--sm" style={{marginLeft:6}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-tree pixel-tree--lg" style={{marginLeft:10}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-bush" style={{marginLeft:8,marginBottom:2}} />
        </div>

        {/* Árboles derecha */}
        <div className="pixelbg-trees-right">
          <div className="pixel-tree pixel-tree--lg" style={{marginLeft:4}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-tree pixel-tree--sm" style={{marginLeft:8}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-bush" style={{marginLeft:10,marginBottom:4}} />
          <div className="pixel-tree" style={{marginLeft:6}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-tree pixel-tree--lg" style={{marginLeft:12}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
          <div className="pixel-bush" style={{marginLeft:6,marginBottom:2}} />
          <div className="pixel-tree pixel-tree--sm" style={{marginLeft:8}}><div className="pixel-tree-crown-top"/><div className="pixel-tree-crown"/><div className="pixel-tree-trunk"/></div>
        </div>

        <div className="pixelbg-fog" />
        <div className="pixelbg-scanlines" />

        {blur && <div className="pixelbg-blur-overlay" />}
      </div>
    </>
  )
}
