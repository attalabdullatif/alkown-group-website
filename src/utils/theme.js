// ── THEME CONSTANTS ───────────────────────────────────────────
export const C = {
  gold: "#c8922a", goldLight: "#f5c842", goldDark: "#8a6010",
  goldMid: "#d4a843",
  goldGlow: "rgba(200,146,42,0.40)",
  cream: "#faf7f2", warmWhite: "#fffcf7", beige: "#f4ede0",
  g100: "#ede5d8", g200: "#ddd0bc", g400: "#7a6b50",
  g600: "#3d3020", g800: "#1e1508",
  dark: "#16100a", darkMid: "#211608",
  success: "#2d9c5a", error: "#c0392b", info: "#2980b9",
};

export const gold = (extra = "") =>
  `background:linear-gradient(135deg,${C.gold} 0%,${C.goldLight} 45%,${C.gold} 100%);${extra}`;

export const hexRgb = (hex = "") => {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "200,146,42";
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
};

export const buildCSS = (C, ff) => `
@font-face {
  font-family: 'Dubai';
  src: url('/fonts/DUBAI-BOLD.TTF') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Cairo:wght@300;400;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{-webkit-font-smoothing:antialiased;background:${C.warmWhite}}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:${C.g100}}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,${C.gold},${C.goldLight});border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:${C.gold}}
h1,h2,h3,h4{font-weight:800;color:${C.g800};line-height:1.2}
button{font-weight:700}
p{font-weight:400;line-height:1.8}
a{transition:color .2s}
::selection{background:${C.goldGlow};color:${C.g800}}

.nav-desktop{display:flex}
.nav-hamburger{display:none}
.mob-overlay{display:none}
@media(max-width:860px){
  .nav-desktop{display:none!important}
  .nav-hamburger{display:flex!important}
  .mob-overlay{display:block}
  h1{font-size:clamp(1.7rem,7vw,2.6rem)!important}
  h2{font-size:clamp(1.3rem,5vw,2rem)!important}
  section{padding:52px 20px!important}
  .card:hover{transform:none!important;box-shadow:none!important}
  table{font-size:.82rem}
  .hide-mobile{display:none!important}
}
@media(max-width:480px){
  .grid-2{grid-template-columns:1fr!important}
  .grid-3{grid-template-columns:1fr!important}
  .grid-4{grid-template-columns:1fr 1fr!important}
}
@keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 ${C.goldGlow}}70%{box-shadow:0 0 0 16px rgba(200,146,42,0)}}
@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}

.fu{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both}
.fu2{animation:fadeUp .7s .12s cubic-bezier(.22,1,.36,1) both}
.fu3{animation:fadeUp .7s .24s cubic-bezier(.22,1,.36,1) both}
.fu4{animation:fadeUp .7s .36s cubic-bezier(.22,1,.36,1) both}

.shimmer{
  background:linear-gradient(90deg,${C.goldDark} 0%,${C.goldLight} 30%,${C.gold} 55%,${C.goldLight} 80%,${C.goldDark} 100%);
  background-size:250% auto;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 5s linear infinite
}

.gbtn{
  background:linear-gradient(135deg,${C.goldDark} 0%,${C.gold} 35%,${C.goldLight} 65%,${C.gold} 100%);
  background-size:200% 200%;
  color:${C.dark};
  border:none;
  padding:14px 36px;
  font-size:.83rem;
  letter-spacing:.18em;
  text-transform:uppercase;
  cursor:pointer;
  border-radius:3px;
  font-weight:800;
  transition:all .35s cubic-bezier(.25,.46,.45,.94);
  box-shadow:0 4px 18px rgba(200,146,42,.25);
  position:relative;
  overflow:hidden
}
.gbtn::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);
  opacity:0;
  transition:opacity .3s
}
.gbtn:hover{
  transform:translateY(-3px);
  box-shadow:0 14px 40px ${C.goldGlow};
  background-position:right center
}
.gbtn:hover::after{opacity:1}
.gbtn:active{transform:translateY(-1px)}

.obtn{
  background:transparent;
  color:${C.gold};
  border:1.5px solid rgba(200,146,42,.5);
  padding:12px 30px;
  font-size:.82rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  cursor:pointer;
  border-radius:3px;
  font-weight:600;
  transition:all .3s
}
.obtn:hover{border-color:${C.gold};background:rgba(200,146,42,.08);transform:translateY(-2px);box-shadow:0 6px 20px rgba(200,146,42,.15)}

.dbtn{
  background:${C.g800};
  color:${C.goldLight};
  border:none;
  padding:14px 34px;
  font-size:.82rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  cursor:pointer;
  border-radius:3px;
  font-weight:700;
  transition:all .3s;
  box-shadow:0 4px 16px rgba(0,0,0,.2)
}
.dbtn:hover{background:${C.dark};transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.3)}

.card{
  background:#fff;
  border:1px solid rgba(200,146,42,.12);
  transition:all .4s cubic-bezier(.25,.46,.45,.94);
  cursor:pointer;
  position:relative;
  overflow:hidden
}
.card::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:2px;
  background:linear-gradient(90deg,transparent,${C.gold},transparent);
  opacity:0;
  transition:opacity .4s
}
.card:hover{transform:translateY(-8px);box-shadow:0 28px 72px rgba(120,90,20,.14)!important;border-color:rgba(200,146,42,.28)}
.card:hover::before{opacity:1}
.card:hover .gl{width:60px!important}

.gl{width:28px;height:2px;background:linear-gradient(90deg,${C.gold},${C.goldLight});transition:width .45s ease;margin-bottom:16px;border-radius:2px}

input,textarea,select{outline:none;font-family:inherit;transition:all .25s}
input:focus,textarea:focus,select:focus{
  border-color:${C.gold}!important;
  box-shadow:0 0 0 4px rgba(200,146,42,.1)!important
}
input::placeholder,textarea::placeholder{color:${C.g400};opacity:.7}

.tab-btn{background:transparent;border:none;cursor:pointer;padding:12px 22px;font-size:.83rem;letter-spacing:.08em;transition:all .3s;border-bottom:2px solid transparent;margin-bottom:-2px;color:${C.g400}}
.tab-active{color:${C.gold}!important;border-bottom-color:${C.gold}!important;font-weight:700}
.tab-btn:hover{color:${C.gold}}

.gold-bar{height:3px;background:linear-gradient(90deg,${C.goldDark},${C.gold},${C.goldLight},${C.gold},${C.goldDark});background-size:200% auto;animation:shimmer 4s linear infinite}
`;
