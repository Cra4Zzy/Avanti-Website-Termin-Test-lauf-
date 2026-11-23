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
const code={service:"cut",staff:"any",day:addDays(today(),1),start:null},state={catalog:null,slots:[],enabled:false,error:""};
let requestId=0;
async function request(action,params={},post=false){
 const url=new URL(API);url.searchParams.set("action",action);if(!post)for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
 const res=await fetch(url.href,{method:post?"POST":"GET",headers:{apikey:KEY,"Content-Type":"application/json"},body:post?JSON.stringify(params):undefined,cache:"no-store"});
 let data;try{data=await res.json()}catch{throw Error("Keine gültige Antwort vom Buchungsserver.")}if(!res.ok)throw Error(data.error||"Buchungsserver nicht erreichbar.");return data;
}
function render(){
 const services=state.catalog?.services||[],staff=state.catalog?.staff||[],service=services.find(v=>v.code===code.service);
 const picked=state.slots.find(s=>s.start===code.start);
 app.innerHTML='<section class="ab-panel"><div class="ab-title"><span class="ab-number">01</span><h2>Behandlung wählen</h2></div><p>Testpreise und Testdauer – werden vor dem Livegang abgestimmt.</p><div class="ab-services">'+services.map((v,i)=>'<button type="button" class="ab-service '+(code.service===v.code?"is-selected":"")+'" data-service="'+esc(v.code)+'" aria-pressed="'+(code.service===v.code)+'"><span class="ab-service-info"><strong>'+esc(v.name)+'</strong><small>'+v.duration+' Min.</small></span><span class="ab-price">'+money(v.price)+'</span></button>').join("")+'</div></section>'+
 '<div class="ab-main"><section class="ab-panel"><div class="ab-title"><span class="ab-number">02</span><h2>Wunschstylistin</h2></div><div class="ab-pilot-persons"><button type="button" data-staff="any" class="'+(code.staff==="any"?"is-selected":"")+'" aria-pressed="'+(code.staff==="any")+'"><strong>Egal welche</strong><small>Nächster freier Termin</small></button>'+staff.map(s=>'<button type="button" class="'+(code.staff===s.code?"is-selected":"")+'" data-staff="'+esc(s.code)+'" aria-pressed="'+(code.staff===s.code)+'"><strong>'+esc(s.name)+'</strong><small>'+esc(s.specialty)+'</small></button>').join("")+'</div></section>'+
 '<section class="ab-panel"><div class="ab-title"><span class="ab-number">03</span><h2>Datum & freie Uhrzeiten</h2></div><p>Die Auswahl berücksichtigt den gemeinsamen Supabase-Kalender.</p><label for="pilot-date" style="display:block;font-size:12px;font-weight:800">Wunschtag</label><input id="pilot-date" class="ab-pilot-day" type="date" value="'+code.day+'" min="'+today()+'" max="'+addDays(today(),90)+'"><h3 style="font-size:14px;margin:16px 0 8px">'+esc(dateLabel(code.day))+'</h3>'+(state.error?'<p class="ab-pilot-empty" role="alert">'+esc(state.error)+'</p>':state.slots.length?'<div class="ab-pilot-slotgrid">'+state.slots.map(s=>'<button type="button" class="ab-pilot-slot '+(code.start===s.start?"is-selected":"")+'" data-slot="'+s.start+'">'+time(s.start)+'</button>').join("")+'</div>':'<div class="ab-pilot-empty">Für diese Auswahl gibt es derzeit keine freien Startzeiten. Bitte anderen Tag oder andere Mitarbeiterin wählen.</div>')+
 '<p class="ab-pilot-active">✓ Verfügbarkeit direkt aus der Supabase-Datenbank gelesen</p></section></div>';
 summary.hidden=false;
 summary.innerHTML='<div><strong>'+esc(service?.name||"Behandlung auswählen")+' · '+esc(picked?.staffName||(code.staff==="any"?"Egal welche Mitarbeiterin":staff.find(s=>s.code===code.staff)?.name||""))+'</strong><span>'+dateLabel(code.day)+' · '+(picked?time(picked.start)+" Uhr":"Bitte Uhrzeit wählen")+' · '+(service?.duration||0)+' Minuten · '+money(service?.price||0)+'</span></div><button type="button" '+(!picked||!state.enabled?"disabled":"")+' id="confirm-live">'+(state.enabled?"Termin verbindlich buchen":"Buchung noch nicht freigeschaltet")+'</button>';
 app.querySelectorAll("[data-service]").forEach(b=>b.onclick=()=>{code.service=b.dataset.service;code.start=null;update()});
 app.querySelectorAll("[data-staff]").forEach(b=>b.onclick=()=>{code.staff=b.dataset.staff;code.start=null;update()});
 app.querySelector("#pilot-date").onchange=e=>{if(e.target.value){code.day=e.target.value;code.start=null;update()}};
 app.querySelectorAll("[data-slot]").forEach(b=>b.onclick=()=>{code.start=Number(b.dataset.slot);render()});
 const button=summary.querySelector("#confirm-live");if(button&&!button.disabled)button.onclick=()=>confirm(picked);
}
async function update(){const id=++requestId;state.error="";state.slots=[];render();
 try{const response=await request("availability",{day:code.day,service:code.service,staff:code.staff});
 if(id!==requestId)return;state.slots=response.slots||[];state.enabled=response.publicBookingEnabled===true;if(!state.slots.some(s=>s.start===code.start))code.start=null;render();
 }catch(e){if(id!==requestId)return;state.error=e.message;render()}}
function confirm(picked){
 if(!state.enabled||!picked)return;
 dialog.innerHTML='<form><h2>Termin buchen</h2><div class="ab-confirm-info"><strong>'+esc(state.catalog.services.find(s=>s.code===code.service)?.name)+' · '+esc(picked.staffName)+'</strong><p>'+esc(dateLabel(code.day))+' · '+time(picked.start)+' Uhr</p></div><label>Name<input name="name" minlength="2" maxlength="100" required autocomplete="name"></label><label>E-Mail<input name="email" type="email" maxlength="254" required autocomplete="email"></label><label>Telefon (optional)<input name="phone" type="tel" maxlength="40" autocomplete="tel"></label><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><p class="subtle">Termine werden erst nach erfolgreicher Serverbestätigung verbindlich.</p><p id="pilot-error" role="alert"></p><button class="ab-submit" type="submit">Termin bestätigen</button><button class="ab-cancel" type="button" data-close>Zurück</button></form>';
 const f=dialog.querySelector("form");f.querySelector("[data-close]").onclick=()=>dialog.close();
 f.onsubmit=async e=>{e.preventDefault();const button=f.querySelector('button[type="submit"]');button.disabled=true;try{const result=await request("book",{day:code.day,start:picked.start,staffCode:picked.staffCode,serviceCode:code.service,name:f.elements.name.value.trim(),email:f.elements.email.value.trim(),phone:f.elements.phone.value.trim(),website:f.elements.website.value},true);
 if(!result.confirmed)throw Error("Buchung nicht bestätigt.");dialog.close();app.innerHTML='<section class="ab-panel" role="status"><h2>Dein Termin ist bestätigt.</h2><p>Datum: '+esc(dateLabel(code.day))+' · '+time(picked.start)+' Uhr</p><p>Reservierungsnummer: '+esc(result.bookingId)+'</p><button type="button" class="ab-submit" id="again">Weitere Zeiten ansehen</button></section>';summary.hidden=true;app.querySelector("#again").onclick=()=>{code.start=null;update()};}catch(err){f.querySelector("#pilot-error").textContent=err.message==="slot_taken"?"Diese Zeit wurde gerade vergeben. Bitte Seite aktualisieren.":err.message}finally{button.disabled=false}};
 dialog.showModal();
}
async function start(){try{const catalog=await request("catalog");state.catalog=catalog;if(!catalog.services.some(s=>s.code===code.service))code.service=catalog.services[0]?.code||"";await update()}catch(e){app.innerHTML='<section class="ab-panel" role="alert"><h2>Keine Verbindung zum Salonkalender</h2><p>'+esc(e.message)+'</p><p>Für verbindliche Termine bitte unter <a href="tel:079559268671">07955 9268671</a> anrufen.</p></section>'}}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&state.catalog&&!dialog.open)update()});
start();
})();