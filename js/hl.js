/* hl.js, tiny syntax highlighter, annotation parser, line diff, complexity maths */
(function(){
const PY=new Set('def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda pass break continue yield global nonlocal assert del async await'.split(' '));
const JS=new Set('function return if else for while do of in new const let var class extends this null undefined true false typeof instanceof try catch finally throw async await break continue switch case default yield static super delete void'.split(' '));
const BI=new Set('len range print min max sum sorted enumerate zip map list dict set tuple str int float abs any all reversed isinstance heappush heappop heapify heapreplace defaultdict Counter deque bisect_left bisect_right Math Object Array Promise JSON Map Set console setTimeout clearTimeout setInterval clearInterval ord chr'.split(' '));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function line(t,lang){
  const kw=lang==='js'?JS:PY;
  const re=lang==='js'?/(\/\/.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([\s\S])/g
                      :/(#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([\s\S])/g;
  let out='',m;
  while((m=re.exec(t))){
    if(m[1])out+='<i class="tk-c">'+esc(m[1])+'</i>';
    else if(m[2])out+='<i class="tk-s">'+esc(m[2])+'</i>';
    else if(m[3])out+='<i class="tk-n">'+m[3]+'</i>';
    else if(m[4]){const w=m[4];
      if(kw.has(w))out+='<i class="tk-k">'+w+'</i>';
      else if(BI.has(w))out+='<i class="tk-b">'+w+'</i>';
      else if(/^\s*\(/.test(t.slice(re.lastIndex)))out+='<i class="tk-f">'+w+'</i>';
      else out+=w;}
    else out+=esc(m[5]);
  }
  return out;
}
// parse source → [{t, k:'!'|'?'|undefined, n:'note'}]
function parse(src){
  return String(src||'').replace(/^\n+|\s+$/g,'').split('\n').map(raw=>{
    const m=raw.match(/^(.*?)\s+(?:#|\/\/)([!?])\s?(.*)$/);
    return m?{t:m[1],k:m[2],n:m[3]}:{t:raw};
  });
}
// LCS line diff → ops [['s'|'d'|'a', i, j]]
function diff(A,B){
  const a=A.map(x=>x.t.trim()),b=B.map(x=>x.t.trim()),n=a.length,m=b.length;
  const L=Array.from({length:n+1},()=>new Int16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=a[i]===b[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const ops=[];let i=0,j=0;
  while(i<n&&j<m){
    if(a[i]===b[j]){ops.push(['s',i,j]);i++;j++;}
    else if(L[i+1][j]>=L[i][j+1])ops.push(['d',i++,-1]);
    else ops.push(['a',-1,j++]);
  }
  while(i<n)ops.push(['d',i++,-1]);
  while(j<m)ops.push(['a',-1,j++]);
  return ops;
}
// complexity string → operation count for input size n
function ops(c,n){
  const s=String(c||'').toLowerCase().replace(/\s+/g,'').replace(/^o\(|\)$/g,'');
  const lg=Math.max(1,Math.log2(Math.max(2,n)));
  if(/2\^|2ⁿ|2\*\*/.test(s))return Math.pow(2,Math.min(n,40));
  if(/!/.test(s))return Math.min(1e12,Array.from({length:Math.min(n,18)},(_,i)=>i+1).reduce((x,y)=>x*y,1));
  if(/³|\^3|n\*n\*n/.test(s))return n*n*n;
  const hasLog=/log/.test(s);
  const sq=/²|\^2|n\*n|n\*m|nm|mn|m\*n|\*\*2|k\*n|n\*k|nk/.test(s);
  if(sq&&hasLog)return n*n*lg;
  if(sq)return n*n;
  const lin=/[nmkve]/.test(s.replace(/log/g,''));
  if(hasLog&&lin)return n*lg;
  if(hasLog)return lg;
  if(lin)return n;
  return 1;
}
window.HL={line,parse,diff,ops,esc};

/* ---------- DRUI.select: custom dropdown. Fixed menu, measured against the
   viewport on every open/scroll/resize; flips above the trigger when there is
   not enough room below. One shared menu, moved into the owning <dialog> so it
   renders above modal top-layer. Keyboard: arrows/Home/End/type-ahead/Enter/Esc. */
window.DRUI=(function(){
const CHEV='<svg class="chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const TICK='<svg class="tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
let menu=null,cur=null,bound=false,raf=0,typeT='',typeT0=0;
function ensureMenu(){if(menu)return menu;menu=document.createElement('div');menu.className='cmenu';menu.setAttribute('role','listbox');menu.hidden=true;document.body.appendChild(menu);return menu;}
function place(){
  if(!cur)return;const m=ensureMenu(),r=cur.btn.getBoundingClientRect();
  const gap=6,pad=8,vw=window.innerWidth||1024,vh=window.innerHeight||768;
  const below=vh-r.bottom-gap-pad,above=r.top-gap-pad;
  const maxH=Math.max(120,Math.min(320,vh-32,Math.max(below,above,120)));
  m.style.minWidth=Math.max(r.width||0,140)+'px';
  m.style.maxWidth=(vw-16)+'px';m.style.maxHeight=maxH+'px';
  m.style.visibility='hidden';m.hidden=false;
  const mh=m.offsetHeight||maxH,mw=m.offsetWidth||140;
  const down=below>=mh||below>=above;
  let top=down?r.bottom+gap:r.top-gap-mh;
  top=Math.max(pad,Math.min(top,Math.max(pad,vh-mh-pad)));
  let left=Math.max(pad,Math.min(Math.max(r.left,0),Math.max(pad,vw-mw-pad)));
  m.style.top=top+'px';m.style.left=left+'px';
  m.classList.toggle('up',!down);
  m.style.visibility='';m.hidden=false;
}
function schedule(){if(raf||typeof requestAnimationFrame!=='function'){if(!raf)place();return;}raf=requestAnimationFrame(()=>{raf=0;place();});}
function close(refocus){
  if(!cur)return;const c=cur;cur=null;
  ensureMenu().hidden=true;c.btn.setAttribute('aria-expanded','false');
  if(refocus){try{c.btn.focus();}catch(e){}}
}
function choose(comp,v,fire){
  comp._v=String(v);
  comp.btn.querySelector('.csel-val').textContent=comp.text(comp._v);
  close(true);
  if(fire&&comp._on)comp._on(comp._v);
}
function items(){return [...ensureMenu().querySelectorAll('.copt')];}
function focusItem(el){try{el.focus({preventScroll:true});}catch(e){try{el.focus();}catch(_){}}try{el.scrollIntoView({block:'nearest'});}catch(_){}}
function move(d){
  if(!cur)return;const list=items();if(!list.length)return;
  let i=list.indexOf(document.activeElement);
  if(d==='home')i=0;else if(d==='end')i=list.length-1;
  else if(i<0)i=d>0?0:list.length-1;else i=(i+d+list.length)%list.length;
  focusItem(list[i]);
}
function typeAhead(ch){
  const now=Date.now();if(now-typeT0>700)typeT='';typeT0=now;typeT+=ch.toLowerCase();
  const f=items().find(el=>(el.textContent||'').toLowerCase().trim().startsWith(typeT));
  if(f)focusItem(f);
}
function bind(){
  if(bound)return;bound=true;
  document.addEventListener('pointerdown',e=>{if(cur&&!ensureMenu().contains(e.target)&&!cur.btn.contains(e.target))close(false);},true);
  document.addEventListener('keydown',e=>{
    if(!cur)return;
    if(e.key==='Escape'){e.preventDefault();close(true);}
    else if(e.key==='ArrowDown'){e.preventDefault();move(1);}
    else if(e.key==='ArrowUp'){e.preventDefault();move(-1);}
    else if(e.key==='Home'){e.preventDefault();move('home');}
    else if(e.key==='End'){e.preventDefault();move('end');}
    else if(e.key==='Enter'||e.key===' '){const a=document.activeElement;if(a&&a.classList&&a.classList.contains('copt')){e.preventDefault();choose(cur.comp,a.dataset.v,true);}}
    else if(e.key==='Tab'){close(false);}
    else if(e.key&&e.key.length===1&&/\S/.test(e.key)){typeAhead(e.key);}
  },true);
  document.addEventListener('scroll',()=>{if(cur)schedule();},true);
  window.addEventListener('resize',()=>{if(cur)place();});
  window.addEventListener('orientationchange',()=>{if(cur)place();});
  window.addEventListener('hashchange',()=>close(false));
}
function open(comp){
  if(cur&&cur.comp===comp){close(true);return;}
  close(false);
  const m=ensureMenu(),btn=comp.btn,root=btn.closest('dialog')||document.body;
  if(m.parentNode!==root)root.appendChild(m);
  m.innerHTML='';m.setAttribute('aria-label',comp.label||'Options');
  comp._opts.forEach(([v,l])=>{
    const it=document.createElement('div');
    const on=String(v)===String(comp._v);
    it.className='copt'+(on?' cur':'');
    it.setAttribute('role','option');it.tabIndex=-1;
    it.setAttribute('aria-selected',on?'true':'false');
    it.dataset.v=String(v);
    const t=document.createElement('span');t.className='tx';t.textContent=l;it.append(t);
    it.insertAdjacentHTML('beforeend',TICK);
    it.addEventListener('click',()=>choose(comp,String(v),true));
    m.append(it);
  });
  bind();
  cur={comp,btn};btn.setAttribute('aria-expanded','true');
  place();
  const dlg=btn.closest('dialog');
  if(dlg)dlg.addEventListener('close',()=>close(false),{once:true});
  focusItem(m.querySelector('.copt.cur')||m.firstChild||m);
}
/* mount: element to append into. cfg: {options:[[value,label]], value, onChange, label, compact} */
function select(mount,cfg){
  const wrap=document.createElement('span');wrap.className='csel'+(cfg.compact?' compact':'');
  const btn=document.createElement('button');btn.type='button';btn.className='csel-btn';
  btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');
  const lab=cfg.label||'Choose';btn.setAttribute('aria-label',lab);
  const v=document.createElement('span');v.className='csel-val';btn.append(v);
  btn.insertAdjacentHTML('beforeend',CHEV);wrap.append(btn);mount.append(wrap);
  const comp={el:wrap,btn,label:lab,_opts:[],_v:'',_on:cfg.onChange||null,
    text(x){const f=this._opts.find(o=>o[0]===String(x));return f?f[1]:'';},
    get value(){return this._v;},
    set value(nv){this._v=String(nv);v.textContent=this.text(this._v);},
    choose(nv){choose(this,nv,true);},
    setOptions(opts,keep){this._opts=(opts||[]).map(o=>[String(o[0]),String(o[1])]);
      if(!keep||!this._opts.some(o=>o[0]===this._v))this.value=this._opts.length?this._opts[0][0]:'';
      else v.textContent=this.text(this._v);},
    destroy(){if(cur&&cur.comp===this)close(false);wrap.remove();}
  };
  comp.setOptions(cfg.options||[],false);
  if(cfg.value!=null)comp.value=cfg.value;
  btn.addEventListener('click',()=>open(comp));
  btn.addEventListener('keydown',e=>{if((e.key==='ArrowDown'||e.key==='ArrowUp')&&!(cur&&cur.comp===comp)){e.preventDefault();open(comp);}});
  return comp;
}
return {select,close:()=>close(false)};
})();
})();
