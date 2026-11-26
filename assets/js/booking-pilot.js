(function(){
"use strict";
const API="https://xvxgqyrykkxdfadppoor.supabase.co/functions/v1/avanti-booking",KEY="sb_publishable_CSD6Wfed4Wz3Qxd4qsUlLQ_psQpke_k";
const app=document.getElementById("booking-live-app"),summary=document.getElementById("pilot-summary"),dialog=document.getElementById("ab-live-dialog");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const parts=now=>Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Berlin",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now).map(x=>[x.type,x.value]));
const today=()=>{const p=parts(new Date());return p.year+"-"+p.month+"-"+p.day};
const addDays=(d,n)=>{const dt=new Date(d+"T00:00:00Z");dt.setUTCDate(dt.getUTCDate()+n);return dt.toISOString().slice(0,10)};
const time=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
const dateLabel=d=>new Intl.DateTimeFormat("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(d+"T00:00:00Z"));
const money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(n);

const code={service:"",staff:"any",day:today(),start:null};
const state={catalog:null,slots:[],days:{},loading:false,error:"",confirmed:false};
let requestId=0;
const icons={
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
 people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg>',
 calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
};
async function request(action,params={}){
 const url=new URL(API);url.searchParams.set("action",action);
 for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
 const res=await fetch(url.href,{method:"GET",headers:{apikey:KEY},cache:"no-store",signal:AbortSignal.timeout(15000)});
 let data;try{data=await res.json()}catch{throw Error("Keine gültige Serverantwort.");}if(!res.ok)throw Error(data.error||"Buchungsserver nicht erreichbar.");return data;
}
const weekStart=d=>addDays(d,-((new Date(d+"T00:00:00Z").getUTCDay()+6)%7));
const validDay=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=today()&&d<=addDays(today(),90);
const selectedService=()=>state.catalog?.services.find(s=>s.code===code.service);
const selectedSlot=()=>state.slots.find(s=>s.start===code.start);
const datesForWeek=()=>Array.from({length:7},(_,i)=>addDays(weekStart(code.day),i));
const shortDay=d=>new Intl.DateTimeFormat("de-DE",{weekday:"short",timeZone:"UTC"}).format(new Date(d+"T00:00:00Z")).replace(".","");
const monthLabel=d=>new Intl.DateTimeFormat("de-DE",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(d+"T00:00:00Z"));
const staffName=()=>selectedSlot()?.staffName||(code.staff==="any"?"Erste freie Mitarbeiterin":state.catalog.staff.find(s=>s.code===code.staff)?.name||"");
const step=(n,title,copy)=>'<div class="av-step-heading"><span class="av-step-number">'+n+'</span><div><h2>'+title+'</h2><p>'+copy+'</p></div></div>';
function render(){
 if(!state.catalog||state.confirmed)return;
 const service=selectedService(),picked=selectedSlot();
 const people=state.catalog.staff;
 const days=datesForWeek(),start=days[0],end=days[6];
 const before=addDays(start,-7),after=addDays(start,7);
 const dateRange=monthLabel(start)===monthLabel(end)?monthLabel(start):monthLabel(start)+" / "+monthLabel(end);
 const dayButtons=days.map(d=>{
  const valid=validDay(d),availability=state.days[d],count=availability?.slots?.length;
  const label=!valid?"":availability?.error?"?":count===undefined?"":count>0?"Frei":"Belegt";
  return '<button type="button" class="av-day '+(d===code.day?"is-selected":"")+(count>0?" has-slots":"")+'" data-day="'+d+'" aria-pressed="'+(d===code.day)+'" aria-label="'+esc(dateLabel(d)+(label?" · "+label:""))+'" '+(!valid?"disabled":"")+'><span>'+shortDay(d)+'</span><strong>'+Number(d.slice(8))+'</strong><small>'+esc(label||" ")+'</small></button>';
 }).join("");
 const staffButtons=[{code:"any",name:"Egal",specialty:"Erste freie Zeit"},...people].map(s=>'<button type="button" class="av-person '+(s.code===code.staff?"is-selected":"")+'" data-staff="'+esc(s.code)+'" aria-pressed="'+(s.code===code.staff)+'"><span class="av-avatar">'+(s.code==="any"?icons.people:esc(s.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("")))+'</span><strong>'+esc(s.name)+'</strong><small>'+esc(s.specialty)+'</small><span class="av-choice-mark" aria-hidden="true">'+icons.check+'</span></button>').join("");
 const serviceButtons=state.catalog.services.map(s=>'<button type="button" class="av-treatment '+(s.code===code.service?"is-selected":"")+'" data-service="'+esc(s.code)+'" aria-pressed="'+(s.code===code.service)+'"><span class="av-service-copy"><strong>'+esc(s.name)+'</strong><small>'+Number(s.duration)+' Min.</small></span><span class="av-price">'+money(s.price)+'</span><span class="av-radio">'+icons.check+'</span></button>').join("");
 const groups=[["Vormittags",state.slots.filter(s=>s.start<720)],["Nachmittags",state.slots.filter(s=>s.start>=720)]].filter(g=>g[1].length);
 const slots=state.loading?'<div class="av-slots-state" role="status"><span class="av-spinner"></span> Freie Zeiten werden geprüft …</div>':state.error?'<div class="av-slots-state av-error" role="alert">'+esc(state.error)+'<button type="button" id="retry">Erneut versuchen</button></div>':groups.length?groups.map(([name,items])=>'<div class="av-slot-group"><h3>'+name+'</h3><div class="av-time-grid">'+items.map(s=>'<button type="button" data-slot="'+s.start+'" class="av-time '+(code.start===s.start?"is-selected":"")+'" aria-pressed="'+(code.start===s.start)+'">'+time(s.start)+'</button>').join("")+'</div></div>').join(""):'<div class="av-slots-state"><strong>Keine freien Zeiten an diesem Tag.</strong><span>Wähle einen anderen Tag oder eine andere Mitarbeiterin.</span></div>';
 app.innerHTML='<div class="av-booking-main"><section class="av-section">'+step("01","Deine Behandlung","Was möchtest du buchen?")+'<div class="av-treatment-list">'+(serviceButtons||'<p>Derzeit keine buchbaren Leistungen.</p>')+'</div></section><section class="av-section">'+step("02","Deine Wunschstylistin","Wähle eine Person oder den nächsten freien Termin.")+'<div class="av-people">'+staffButtons+'</div></section><section class="av-section">'+step("03","Datum & Uhrzeit","Nur freie Zeiten aus dem Salonkalender werden angezeigt.")+'<div class="av-week-head"><strong>'+esc(dateRange)+'</strong><div class="av-week-nav"><button type="button" data-week="-1" aria-label="Vorherige Woche" '+(end<=today()||addDays(start,-1)<today()?"disabled":"")+'>‹</button><button type="button" data-week="1" aria-label="Nächste Woche" '+(after>addDays(today(),90)?"disabled":"")+'>›</button></div></div><div class="av-days">'+dayButtons+'</div><div class="av-date-row"><strong>'+esc(dateLabel(code.day))+'</strong><label class="av-date-label">'+icons.calendar+'<span>Anderes Datum</span><input id="pilot-date" aria-label="Anderes Datum" type="date" value="'+code.day+'" min="'+today()+'" max="'+addDays(today(),90)+'"></label></div><div aria-live="polite">'+slots+'</div></section></div><aside class="av-review" aria-label="Deine Buchung"><div class="av-review-top"><span class="av-review-kicker">DEIN SALONBESUCH</span><h2>Dein Termin.</h2><p>Alles auf einen Blick.</p></div><dl><div><dt>Behandlung</dt><dd>'+esc(service?.name||"Bitte auswählen")+'</dd></div><div><dt>Mitarbeiterin</dt><dd>'+esc(staffName())+'</dd></div><div><dt>Datum</dt><dd>'+esc(dateLabel(code.day))+'</dd></div><div><dt>Uhrzeit</dt><dd>'+esc(picked?time(picked.start)+" Uhr":"Bitte wählen")+'</dd></div><div><dt>Dauer</dt><dd>'+(service?Number(service.duration)+" Minuten":"–")+'</dd></div></dl><div class="av-total"><span>Preis <small>(vorläufig)</small></span><strong>'+(service?money(service.price):"–")+'</strong></div><button type="button" id="confirm-live" class="av-next" '+(!picked||state.loading?"disabled":"")+'>Weiter zur Buchung <span aria-hidden="true">›</span></button><p class="av-review-note">'+icons.lock+' Kein Kundenkonto erforderlich.<br>Testmodus – keine Speicherung.</p><div class="av-help"><strong>Lieber persönlich?</strong><a href="tel:079559268671">07955 9268671</a></div></aside>';
 summary.hidden=true;
 app.querySelectorAll("[data-service]").forEach(b=>b.onclick=()=>{code.service=b.dataset.service;code.start=null;update(true);});
 app.querySelectorAll("[data-staff]").forEach(b=>b.onclick=()=>{code.staff=b.dataset.staff;code.start=null;update(true);});
 app.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{code.day=b.dataset.day;code.start=null;update(false);});
 app.querySelectorAll("[data-week]").forEach(b=>b.onclick=()=>{const d=addDays(weekStart(code.day),7*Number(b.dataset.week));code.day=d<today()?today():d;code.start=null;update(true);});
 app.querySelector("#pilot-date").onchange=e=>{if(validDay(e.target.value)){const same=weekStart(code.day)===weekStart(e.target.value);code.day=e.target.value;code.start=null;update(!same);}};
 app.querySelectorAll("[data-slot]").forEach(b=>b.onclick=()=>{code.start=Number(b.dataset.slot);render();app.querySelector('[data-slot="'+code.start+'"]')?.focus({preventScroll:true});});
 app.querySelector("#retry")?.addEventListener("click",()=>update(true));
 app.querySelector("#confirm-live").onclick=()=>confirm(picked);
}
async function update(refreshWeek=true){
 if(!selectedService())return;
 const id=++requestId,day=code.day,service=code.service,staff=code.staff;
 state.loading=true;state.error="";state.slots=[];if(refreshWeek)state.days={};render();
 const query=d=>request("availability",{day:d,service,staff});
 try{const data=await query(day);if(id!==requestId)return;state.slots=Array.isArray(data.slots)?data.slots:[];state.days[day]={slots:state.slots};if(!state.slots.some(s=>s.start===code.start))code.start=null;}
 catch(e){if(id!==requestId)return;state.error="Verfügbarkeit konnte nicht geladen werden. Bitte versuche es erneut.";}
 finally{if(id===requestId){state.loading=false;render();}}
 if(id!==requestId)return;
 if(refreshWeek){const dates=datesForWeek().filter(d=>validDay(d)&&d!==day);
  const result=await Promise.all(dates.map(async d=>{try{return [d,{slots:(await query(d)).slots||[]}]}catch{return [d,{error:true}];}}));
  if(id===requestId){Object.assign(state.days,Object.fromEntries(result));if(!dialog.open)render();}
 }
}
function confirm(picked){
 if(!picked||state.loading||state.confirmed)return;
 const selection={day:code.day,start:picked.start,staffName:picked.staffName,service:selectedService()};
 dialog.innerHTML='<form class="av-confirm-form"><div class="av-dialog-head"><span class="av-review-kicker">TESTBUCHUNG</span><button type="button" data-close aria-label="Schließen">×</button></div><h2>Fast geschafft.</h2><p class="av-confirm-copy">Prüfe deinen Termin. Diese Vorschau speichert keine persönlichen Daten und erstellt keinen echten Termin.</p><div class="av-confirm-info"><strong>'+esc(selection.service.name)+'</strong><p>'+esc(selection.staffName)+' · '+esc(dateLabel(selection.day))+' · '+time(selection.start)+' Uhr</p><p>'+money(selection.service.price)+' · '+selection.service.duration+' Min.</p></div><label>Name (Testangabe)<input name="name" value="Testkunde" required minlength="2" maxlength="100" autocomplete="off"></label><label>Telefon (Testangabe, optional)<input name="phone" type="tel" placeholder="000 000000" maxlength="40" autocomplete="off"></label><label>E-Mail (Testangabe)<input name="email" type="email" value="test@example.invalid" required maxlength="254" autocomplete="off"></label><p class="av-confirm-copy">Bitte ausschließlich fiktive Daten verwenden. Keine Bestätigungs-E-Mail.</p><button class="av-next" type="submit">Testbuchung bestätigen</button><button type="button" data-close class="av-back">Zurück</button></form>';
 const form=dialog.querySelector("form");
 form.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>dialog.close());
 form.onsubmit=e=>{e.preventDefault();state.confirmed=true;dialog.close();dialog.innerHTML="";app.innerHTML='<section class="av-success" role="status"><span class="av-success-mark">'+icons.check+'</span><h2>Testbuchung abgeschlossen.</h2><p>Der Buchungsablauf wurde simuliert. Es wurde kein Termin im Salonkalender angelegt und keine E-Mail versendet.</p><div class="av-confirm-info"><strong>'+esc(selection.service.name)+'</strong><p>'+esc(selection.staffName)+' · '+esc(dateLabel(selection.day))+' · '+time(selection.start)+' Uhr</p></div><button type="button" id="again" class="av-next">Neue Testbuchung</button></section>';app.querySelector("#again").onclick=()=>{state.confirmed=false;code.start=null;update(true);};app.focus({preventScroll:true});};
 dialog.showModal();
}
async function start(){
 try{const c=await request("catalog");state.catalog={services:(c.services||[]).filter(s=>s.code&&s.duration>0),staff:(c.staff||[]).filter(s=>s.code)};code.service=state.catalog.services[0]?.code||"";render();if(code.service)await update(true);}
 catch(e){app.innerHTML='<section class="av-section" role="alert"><h2>Salonkalender nicht erreichbar.</h2><p>Bitte versuche es später erneut oder rufe im Salon an.</p><button class="av-next" type="button" id="retry-start">Erneut versuchen</button><p><a href="tel:079559268671">07955 9268671</a></p></section>';app.querySelector("#retry-start").onclick=start;}
}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&state.catalog&&!dialog.open&&!state.confirmed)update(true);});
start();
})();
