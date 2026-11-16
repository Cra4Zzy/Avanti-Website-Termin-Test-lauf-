
const header=document.querySelector('.site-header');
const nav=document.getElementById('mainNav');
const toggle=document.getElementById('menuToggle');
const backdrop=document.getElementById('navBackdrop');
const page=document.body.dataset.page;

function setHeader(){header?.classList.toggle('is-scrolled',window.scrollY>26)}
setHeader();window.addEventListener('scroll',setHeader,{passive:true});

function closeMenu(){nav?.classList.remove('is-open');toggle?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');backdrop?.classList.remove('is-visible');document.body.classList.remove('menu-open')}
function openMenu(){nav?.classList.add('is-open');toggle?.classList.add('is-open');toggle?.setAttribute('aria-expanded','true');backdrop?.classList.add('is-visible');document.body.classList.add('menu-open')}
toggle?.addEventListener('click',()=>nav?.classList.contains('is-open')?closeMenu():openMenu());
backdrop?.addEventListener('click',closeMenu);nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeLightbox()}});
window.addEventListener('resize',()=>{if(innerWidth>860)closeMenu()},{passive:true});

document.querySelectorAll('[data-page-link]').forEach(a=>a.classList.toggle('is-active',a.dataset.pageLink===page));

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems=document.querySelectorAll('.reveal');
if(reduced){revealItems.forEach(el=>el.classList.add('is-visible'))}else{
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 revealItems.forEach(el=>io.observe(el));
}

// Video sound control and performance pause
const video=document.querySelector('[data-salon-video]');
const videoToggle=document.querySelector('[data-video-toggle]');
if(video&&videoToggle){
 videoToggle.addEventListener('click',()=>{video.muted=!video.muted;videoToggle.textContent=video.muted?'Ton an':'Ton aus';if(video.paused)video.play().catch(()=>{})});
 const vio=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){video.play().catch(()=>{})}else{video.pause()}}),{threshold:.22});
 vio.observe(video);
}

// Slider, supports 3/2/1 cards depending on viewport
const slider=document.querySelector('[data-gallery-slider]');
if(slider){
 const viewport=slider.querySelector('.gallery-viewport');
 const track=slider.querySelector('.gallery-track');
 const slides=[...slider.querySelectorAll('.gallery-slide')];
 const prev=slider.querySelector('[data-gallery-prev]');
 const next=slider.querySelector('[data-gallery-next]');
 const counter=slider.querySelector('[data-gallery-counter]');
 const progress=slider.querySelector('[data-gallery-progress]');
 let index=0,startX=0,moveX=0;
 function visible(){return innerWidth>1100?3:innerWidth>860?2:1}
 function maxIndex(){return Math.max(0,slides.length-visible())}
 function gap(){return 16}
 function render(){
  index=Math.max(0,Math.min(index,maxIndex()));
  const slide=slides[0];if(!slide)return;
  const x=index*(slide.getBoundingClientRect().width+gap());track.style.transform=`translate3d(-${x}px,0,0)`;
  if(counter)counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(maxIndex()+1).padStart(2,'0')}`;
  if(progress)progress.style.transform=`scaleX(${(index+1)/(maxIndex()+1)})`;
 }
 prev?.addEventListener('click',()=>{index=index<=0?maxIndex():index-1;render()});
 next?.addEventListener('click',()=>{index=index>=maxIndex()?0:index+1;render()});
 viewport?.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;moveX=0},{passive:true});
 viewport?.addEventListener('touchmove',e=>{moveX=e.touches[0].clientX-startX},{passive:true});
 viewport?.addEventListener('touchend',()=>{if(Math.abs(moveX)>45){index+=moveX<0?1:-1;render()}});
 window.addEventListener('resize',render,{passive:true});render();
}

// Lightbox
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightboxImg');
const lightboxText=document.getElementById('lightboxText');
function closeLightbox(){if(!lightbox)return;lightbox.classList.remove('is-open');lightbox.setAttribute('aria-hidden','true');if(lightboxImg)lightboxImg.src=''}
document.querySelectorAll('[data-lightbox]').forEach(btn=>btn.addEventListener('click',()=>{if(!lightbox||!lightboxImg)return;lightboxImg.src=btn.dataset.lightbox;lightboxImg.alt=btn.dataset.title||'';if(lightboxText)lightboxText.textContent=btn.dataset.title||'';lightbox.classList.add('is-open');lightbox.setAttribute('aria-hidden','false')}));
document.getElementById('lightboxClose')?.addEventListener('click',closeLightbox);lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});

document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
