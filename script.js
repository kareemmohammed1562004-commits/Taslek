const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='drain_site_v1';
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S={posts:[],images:[],phone:'+966508162112',wa:'+966508162112',visits:8700,user:'admin',hash:''};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
try{if(!sessionStorage.getItem('v')){sessionStorage.setItem('v',1);S.visits++}}catch(e){}

function save(){try{localStorage.setItem(KEY,JSON.stringify(S));return true}catch(e){toast('مساحة التخزين ممتلئة، احذف بعض الصور','err');return false}}
function toast(m,t){const e=$('#toast');e.textContent=m;e.className='show '+(t||'');clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2600)}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

/* ضغط الصورة قبل الحفظ */
function compress(file){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,900/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.78))};i.onerror=()=>res(null);i.src=r.result};r.onerror=()=>res(null);r.readAsDataURL(file)})}
async function readFiles(list){const out=[];for(const f of list){if(!f.type.startsWith('image/')){toast('اختر ملفات صور فقط (JPG, PNG)','err');continue}const d=await compress(f);if(d)out.push(d)}return out}
function bindDrop(zone,input,cb){
  zone.onclick=()=>input.click();
  zone.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}};
  input.onchange=async()=>{cb(await readFiles(input.files));input.value=''};
  ['dragover','dragenter'].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add('over')}));
  ['dragleave','drop'].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove('over')}));
  zone.addEventListener('drop',async e=>cb(await readFiles(e.dataTransfer.files)));
}

/* ===== بيانات الاتصال ===== */
function applyContacts(){
  $$('[data-call]').forEach(a=>a.href='tel:'+S.phone.replace(/\s/g,''));
  $$('[data-wa]').forEach(a=>a.href='https://wa.me/'+S.wa.replace(/\D/g,''));
  $$('[data-phone]').forEach(e=>e.textContent=S.phone);
  $('#sPhone').value=S.phone;$('#sWa').value=S.wa;$('#aUser').value=S.user;
}

/* ===== معرض الأعمال ===== */
const DEFAULTS=[
  ['IMG-20261114-WA0018.jpg','تسليك المجاري'],
  ['hero-img.jpg','شحنات علي اعلي مستوي'],
  ['IMG-20261114-WA0028.jpg','تصريف المياه'],
  ['IMG-20261114-WA0020.jpg','صيانة الصرف'],
  ['IMG-20261114-WA0016.jpg','كسح المجاري'],
  ['IMG-20261114-WA0022.jpg','فتح البلاعات']];
let expanded=false;
function renderWorks(){
  const all=[...S.images.map(i=>({src:i.src,t:i.title})),...DEFAULTS.map(d=>({src:d[0],t:d[1]}))];
  const list=expanded?all:all.slice(0,4);
  $('#worksGrid').innerHTML=list.map(w=>w.src
    ?`<figure data-src="${w.src}"><img src="${w.src}" alt="${esc(w.t)}" loading="lazy"><figcaption>${esc(w.t)}</figcaption></figure>`
    :`<figure class="ph" style="background:linear-gradient(135deg,${w.c})"><span>${w.e}</span><figcaption>${esc(w.t)}</figcaption></figure>`).join('');
  $('#moreBtn').hidden=all.length<=4;
  $('#moreBtn').textContent=expanded?'عرض أقل ↑':'عرض المزيد ←';
}
$('#moreBtn').onclick=()=>{expanded=!expanded;renderWorks()};
$('#worksGrid').onclick=e=>{const f=e.target.closest('figure[data-src]');if(f){$('#lightbox img').src=f.dataset.src;$('#lightbox').hidden=false}};
$('#lightbox').onclick=()=>$('#lightbox').hidden=true;
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#lightbox').hidden=true});

/* ===== لوحة التحكم ===== */
const fmt=n=>n>=1000?(n/1000).toFixed(1)+'K':n;
function rowHTML(p){return`<tr><td>${p.img?`<img src="${p.img}" alt="">`:'<div class="noimg">🖼️</div>'}</td><td>${esc(p.title)}</td><td>${p.date}</td><td><div class="act"><button class="ib e" data-edit="${p.id}" aria-label="تعديل">✏️</button><button class="ib d" data-del="${p.id}" aria-label="حذف">🗑️</button></div></td></tr>`}
function renderAdmin(){
  $('#stPosts').textContent=S.posts.length;
  $('#stImgs').textContent=S.images.length;
  $('#stVis').textContent=fmt(S.visits);
  const empty='<tr><td colspan="4" class="empty">لا توجد منشورات بعد. أضف أول منشور من النموذج.</td></tr>';
  $('#latest').innerHTML=S.posts.length?S.posts.slice(0,5).map(rowHTML).join(''):empty;
  $('#allPosts').innerHTML=S.posts.length?S.posts.map(rowHTML).join(''):empty;
  $('#imgGrid').innerHTML=S.images.length?S.images.map(i=>`<div class="t"><img src="${i.src}" alt="${esc(i.title)}"><button class="x" data-rm="${i.id}" aria-label="حذف الصورة">✕</button></div>`).join(''):'<p class="empty">لا توجد صور مرفوعة بعد.</p>';
}
function renderAll(){renderAdmin();renderWorks()}

function setView(v){
  $$('[data-view]').forEach(s=>s.hidden=s.dataset.view!==v);
  $$('#side button').forEach(b=>b.classList.toggle('on',b.dataset.go===v));
  $('#side').classList.remove('open');window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){const v=g.dataset.go;
    if(v==='contact'){location.hash='#contact';return}
    if(v==='new'){setView('dash');$('#postForm').scrollIntoView();$('#pTitle').focus();return}
    setView(v);}
  const d=e.target.closest('[data-del]');
  if(d&&confirm('هل تريد حذف هذا المنشور؟')){
    const p=S.posts.find(x=>x.id==d.dataset.del);
    S.images=S.images.filter(i=>!(p.imgIds||[]).includes(i.id));
    S.posts=S.posts.filter(x=>x!==p);save();renderAll();toast('تم حذف المنشور');}
  const ed=e.target.closest('[data-edit]');
  if(ed){const p=S.posts.find(x=>x.id==ed.dataset.edit),t=prompt('عنوان المنشور:',p.title);
    if(t&&t.trim()){p.title=t.trim();save();renderAll();toast('تم تعديل المنشور')}}
  const r=e.target.closest('[data-rm]');
  if(r&&confirm('هل تريد حذف هذه الصورة؟')){S.images=S.images.filter(i=>i.id!==r.dataset.rm);save();renderAll();toast('تم حذف الصورة')}
});

/* رفع صور النشر */
let pending=[];
function renderPending(){$('#pending').innerHTML=pending.map((s,i)=>`<div class="t"><img src="${s}" alt=""><button type="button" class="x" data-px="${i}" aria-label="إزالة">✕</button></div>`).join('')}
$('#pending').onclick=e=>{const x=e.target.closest('[data-px]');if(x){pending.splice(x.dataset.px,1);renderPending()}};
bindDrop($('#dz1'),$('#f1'),imgs=>{pending.push(...imgs);renderPending()});

$('#postForm').onsubmit=e=>{
  e.preventDefault();
  const title=$('#pTitle').value.trim();
  if(!title){toast('اكتب عنوان المنشور أولاً','err');$('#pTitle').focus();return}
  const imgs=pending.map(src=>({id:uid(),src,title}));
  S.posts.unshift({id:uid(),title,details:$('#pText').value.trim(),img:pending[0]||'',imgIds:imgs.map(i=>i.id),date:new Date().toISOString().slice(0,10)});
  S.images.unshift(...imgs);
  if(!save()){S.posts.shift();S.images.splice(0,imgs.length);return}
  e.target.reset();pending=[];renderPending();renderAll();toast('تم نشر المنشور');
};

/* رفع صور المعرض مباشرة */
bindDrop($('#dz2'),$('#f2'),imgs=>{
  if(!imgs.length)return;
  S.images.unshift(...imgs.map(src=>({id:uid(),src,title:'عمل جديد'})));
  if(save()){renderAll();toast('تمت إضافة '+imgs.length+' صورة للمعرض')}
});

$('#setForm').onsubmit=e=>{
  e.preventDefault();
  const p=$('#sPhone').value.trim(),w=$('#sWa').value.trim();
  if(p.replace(/\D/g,'').length<8||w.replace(/\D/g,'').length<8){toast('أدخل أرقاماً صحيحة','err');return}
  S.phone=p;S.wa=w;save();applyContacts();toast('تم حفظ الإعدادات');
};

/* ===== التنقل ===== */
function route(){
  const a=location.hash==='#';
  $('#site').hidden=a;
  $('#login').hidden=!(a&&!authed);
  $('#admin').hidden=!(a&&authed);
  if(a){authed?setView('dash'):$('#lUser').focus();return}
  const el=document.getElementById(location.hash.slice(1));
  el?el.scrollIntoView():window.scrollTo(0,0);
}
addEventListener('hashchange',route);
$('#logout').onclick=()=>{authed=false;try{sessionStorage.removeItem('auth')}catch(e){}location.hash='#top';toast('تم تسجيل الخروج')};
$('#menuBtn').onclick=()=>$('#menu').classList.toggle('open');
$('#menu').onclick=e=>{if(e.target.closest('a'))$('#menu').classList.remove('open')};
$('#sideBtn').onclick=()=>$('#side').classList.toggle('open');

/* ===== تسجيل الدخول ===== */
async function sha(t){const s='drain|'+t;try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))>>>0;return 'f'+h}}
/* كلمة المرور الافتراضية: admin123 (غيّرها من الإعدادات) */
const ready=(async()=>{if(!S.hash){S.hash=await sha('admin123');save()}})();
let authed=false;try{authed=sessionStorage.getItem('auth')==='1'}catch(e){}
const LK='drain_lock';
const lockInfo=()=>{try{return JSON.parse(localStorage.getItem(LK)||'{}')}catch(e){return {}}};
$('#showPw').onclick=()=>{const i=$('#lPass');i.type=i.type==='password'?'text':'password'};
$('#loginForm').onsubmit=async e=>{
  e.preventDefault();await ready;
  const L=lockInfo(),err=$('#lErr');
  if(L.until>Date.now()){err.textContent='محاولات كثيرة. حاول بعد '+Math.ceil((L.until-Date.now())/1000)+' ثانية';return}
  const u=$('#lUser').value.trim(),p=$('#lPass').value;
  if(u===S.user&&await sha(p)===S.hash){
    try{localStorage.removeItem(LK);sessionStorage.setItem('auth','1')}catch(x){}
    authed=true;$('#lPass').value='';err.textContent='';route();toast('أهلاً بك 👋');
  }else{
    const n=(L.n||0)+1;
    try{localStorage.setItem(LK,JSON.stringify(n>=5?{n:0,until:Date.now()+30000}:{n}))}catch(x){}
    err.textContent=n>=5?'تم إيقاف الدخول 30 ثانية بسبب المحاولات الخاطئة':'اسم المستخدم أو كلمة المرور غير صحيحة';
  }
};
$('#accForm').onsubmit=async e=>{
  e.preventDefault();
  const cur=$('#aCur').value,nu=$('#aUser').value.trim(),np=$('#aNew').value;
  if(await sha(cur)!==S.hash){toast('كلمة المرور الحالية غير صحيحة','err');return}
  if(nu.length<3){toast('اسم المستخدم 3 أحرف على الأقل','err');return}
  if(np&&np.length<6){toast('كلمة المرور الجديدة 6 أحرف على الأقل','err');return}
  S.user=nu;if(np)S.hash=await sha(np);
  save();e.target.reset();$('#aUser').value=S.user;toast('تم تحديث بيانات الدخول');
};

applyContacts();renderAll();route();save();

addEventListener('scroll',()=>$('.nav').classList.toggle('solid',scrollY>40));