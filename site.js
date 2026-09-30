const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
if (menu && nav) {
  const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); menu.textContent = open ? 'Close' : 'Menu'; });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
}
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false;
let typingTimer;
let typingChars = [];
const finishTyping = () => {
  clearTimeout(typingTimer);
  typingChars.forEach(c => { c.classList.add('revealed'); c.classList.remove('typing-cursor'); });
};
const title = document.querySelector('.type-title');
const homeHeadlines = [
  ['LEADING WITH', 'PURPOSE.', 'LEARNING', 'TO CARE.'],
  ['GUIDING TEAMS.', 'BUILDING TRUST.', 'GROWING', 'TOWARD MEDICINE.'],
  ['LEAD THROUGH', 'SERVICE.', 'GROW THROUGH', 'SCIENCE.'],
  ['CURIOUS', 'BY NATURE.', 'LEADING', 'THROUGH ACTION.'],
  ['BRING PEOPLE', 'TOGETHER.', 'TURN PURPOSE', 'INTO ACTION.']
];
const aboutHeadlines = [
  ['Lead with empathy.', 'Act with purpose.', 'Keep learning.'],
  ['Leadership starts', 'with listening.', 'Service gives it', 'meaning.'],
  ['Guide a team.', 'Support a person.', 'Make it matter.'],
  ['Curiosity shapes', 'my questions.', 'Compassion guides', 'my leadership.']
];
function nextHeadline() {
  const isAbout = document.body.classList.contains('about-page');
  const phrases = isAbout ? aboutHeadlines : homeHeadlines;
  const key = 'jaithra-headline-v1-' + (isAbout ? 'about' : 'home');
  let index = 0;
  try {
    const stored = Number.parseInt(localStorage.getItem(key) || '0', 10);
    index = Number.isFinite(stored) ? ((stored % phrases.length) + phrases.length) % phrases.length : 0;
    localStorage.setItem(key, String((index + 1) % phrases.length));
  } catch { index = Math.floor(Math.random() * phrases.length); }
  return phrases[index];
}
function presentHeadline() {
  if (!title) return;
  finishTyping(); typingChars = [];
  const lines = nextHeadline();
  title.replaceChildren();
  title.setAttribute('aria-label', lines.join(' '));
  lines.forEach((line, index) => {
    const row = document.createElement('span');
    row.className = 'headline-row' + (index >= 2 ? ' headline-accent' : '');
    row.setAttribute('aria-hidden', 'true');
    if (reduceMotion.matches) row.textContent = line;
    else for (const letter of line) {
      const char = document.createElement('span');
      char.className = 'type-char'; char.textContent = letter;
      row.append(char); typingChars.push(char);
    }
    title.append(row);
  });
  if (reduceMotion.matches) return;
  let current = 0;
  const typeNext = () => {
    if (current) typingChars[current - 1].classList.remove('typing-cursor');
    if (current === typingChars.length) return;
    const char = typingChars[current++]; char.classList.add('revealed', 'typing-cursor');
    typingTimer = setTimeout(typeNext, /[.!?]/.test(char.textContent) ? 180 : 36);
  };
  typingTimer = setTimeout(typeNext, 200);
}
presentHeadline();
addEventListener('pageshow', event => { if (event.persisted) presentHeadline(); });
// Original schematic double-helix background with a slow rotational phase.
const canvas = document.querySelector('.cinema-canvas');
const ctx = canvas?.getContext('2d', { alpha: false });
let width = 0, height = 0, clock = 0, last = 0, frame = 0;
function resizeScene() {
  if (!ctx) return;
  width = innerWidth; height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawScene();
}
function drawScene() {
  if (!ctx) return;
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width*.72, height*.45, 0, width*.72, height*.45, Math.max(width,height)*.65);
  glow.addColorStop(0, '#14376a'); glow.addColorStop(.6, '#0a152c'); glow.addColorStop(1, '#050811');
  ctx.fillStyle = glow; ctx.fillRect(0,0,width,height);
  // A schematic double helix: two antipodal backbones linked by base-pair rungs.
  // This is a visual model, not a depiction of a particular genetic sequence.
  for (let strand=0; strand<2; strand++) {
    ctx.save();
    ctx.translate(width * (strand ? .09 : .78), height*.5);
    ctx.rotate(strand ? .24 : -.18);
    const radius = Math.min(width*.1, 115)*(strand ? .6 : 1);
    const opacity = strand ? .15 : .28;
    const step = 18;
    const count = Math.ceil(height/step)+18;
    const phase = clock*.24 + strand*2.2;
    for(let i=-count/2;i<count/2;i++) {
      const y=i*step, angle=i*.24+phase;
      const x=Math.sin(angle)*radius, depth=Math.cos(angle);
      ctx.beginPath();ctx.moveTo(-x,y);ctx.lineTo(x,y);
      ctx.lineWidth=1.2;
      ctx.strokeStyle=i%9===0 ? `rgba(111,151,211,${opacity*.8})` : `rgba(216,221,230,${opacity*.55})`;
      ctx.stroke();
      for(const side of [-1,1]) {
        const nextX=Math.sin(angle+.24)*radius*side;
        const front=(depth*side+1)/2;
        ctx.beginPath();ctx.moveTo(x*side,y);ctx.lineTo(nextX,y+step);
        ctx.lineWidth=1.1+front*1.8;
        ctx.strokeStyle=`rgba(236,239,244,${opacity*(.35+front*.65)})`;ctx.stroke();
        ctx.beginPath();ctx.arc(x*side,y,1.2+front*1.8,0,Math.PI*2);
        ctx.fillStyle=`rgba(234,240,250,${opacity*(.45+front*.55)})`;ctx.fill();
      }
    }
    ctx.restore();
  }
}
function tick(timestamp) {
  frame = 0;
  if (paused || reduceMotion.matches || document.hidden) { last = 0; return; }
  if (last && timestamp - last < 32) { frame = requestAnimationFrame(tick); return; }
  clock += last ? Math.min((timestamp - last) / 1000, .08) : 0;
  last = timestamp; drawScene(); frame = requestAnimationFrame(tick);
}
function syncMotion() {
  cancelAnimationFrame(frame); frame = 0; last = 0;
  if (!paused && !reduceMotion.matches && !document.hidden && ctx) frame = requestAnimationFrame(tick);
}
document.querySelectorAll('.motion-toggle').forEach(button => {
  button.addEventListener('click', () => {
    paused = !paused; document.body.classList.toggle('motion-paused', paused);
    document.querySelectorAll('.motion-toggle').forEach(b => { b.setAttribute('aria-pressed', String(paused)); b.textContent = paused ? 'Resume all motion' : 'Pause all motion'; });
    if (paused) finishTyping(); syncMotion();
  });
});
reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) finishTyping(); syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);
addEventListener('resize', resizeScene);
resizeScene(); syncMotion();

// Each section owns its decorations: they scroll with it and cannot cross its edges.
const isAboutPage = document.body.classList.contains('about-page');
const organelleTypes = isAboutPage ? [2,3] : [0,1];
const iconTypes = isAboutPage ? [1,3] : [0,2];
document.querySelectorAll('main > section').forEach((section, sectionIndex) => {
  section.classList.add('local-biology-section');
  const field = document.createElement('div');
  field.className = 'section-biology';
  field.setAttribute('aria-hidden', 'true');
  for (let i=0;i<12;i++) {
    const icon = document.createElement('span');
    icon.className = 'medical-star sprite-' + iconTypes[i%2];
    icon.style.cssText = `left:${(i*31.7+5+sectionIndex*7)%94}%;top:${8+(i*23.3+sectionIndex*11)%78}%;--size:${24+i%3*5}px;--alpha:.18;--duration:${10+i%5*2}s;--delay:-${i*1.3}s`;
    field.append(icon);
  }
  [[2,22,88],[89,67,100]].forEach(([x,y,size],i)=>{
    const organelle = document.createElement('span');
    organelle.className = 'organelle sprite-' + organelleTypes[(i+sectionIndex)%2];
    organelle.style.cssText = `left:${x}%;top:${y}%;--size:${size}px;--duration:${26+i*7}s;--delay:-${sectionIndex*4+i*6}s`;
    field.append(organelle);
  });
  section.append(field);
});
// Silent looping motion portraits; honour visibility, explicit pause and reduced motion.
const clips = [...document.querySelectorAll('.volunteer-video')];
function syncVideos() {
  clips.forEach(video => {
    const mayPlay = !paused && !reduceMotion.matches && !document.hidden && video.dataset.inView === 'true' && video.dataset.userPaused !== 'true';
    if (mayPlay) video.play().catch(() => {});
    else video.pause();
  });
}
const clipObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => { entry.target.dataset.inView = String(entry.isIntersecting); });
  syncVideos();
}, {threshold:.1}) : null;
clips.forEach(video => {
  video.muted = true;
  const button = video.parentElement.querySelector('.video-toggle');
  const label = button.getAttribute('aria-label').replace(/^Play /, '');
  const updateButton = () => {
    button.textContent = video.paused ? 'Play clip' : 'Pause clip';
    button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} ${label}`);
    button.setAttribute('aria-pressed', String(!video.paused));
  };
  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  button.addEventListener('click', () => {
    if (video.paused) {
      video.dataset.userPaused = 'false';
      video.play().catch(updateButton);
    } else {
      video.dataset.userPaused = 'true'; video.pause();
    }
  });
  if (clipObserver) clipObserver.observe(video);
  else video.dataset.inView = 'true';
});
document.querySelectorAll('.motion-toggle').forEach(button => button.addEventListener('click', syncVideos));
reduceMotion.addEventListener('change', syncVideos);
document.addEventListener('visibilitychange', syncVideos);
syncVideos();
