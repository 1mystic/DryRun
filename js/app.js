/* app.js, router, pages, settings. */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const E=HL.esc;
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
const SS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const storeOK=()=>{try{localStorage.setItem('__dryrun_t','1');localStorage.removeItem('__dryrun_t');return true;}catch(e){return false;}};
/* session: visits + last page, all local. Powers the "continue" chip. */
const SKEY='dr-session';
const session=()=>LS(SKEY,null)||{v:1,visits:0};
const saveSession=s=>SS(SKEY,s);
const remember=label=>{try{const s=session(),now=Date.now();s.last=now;if(!s.first)s.first=now;s.lastPage={hash:location.hash,label:label||location.hash,ts:now};saveSession(s);}catch(e){}};
const DIFF={E:'Easy',M:'Medium',H:'Hard'};
const lcUrl=id=>'https://leetcode.com/problems/'+id+'/';
const find=id=>DR.P[id]||AI.mine()[id];
const done=()=>LS('dr-done',{});
let live=[];                       // things to destroy on route change
const killLive=()=>{live.forEach(x=>x&&x.destroy&&x.destroy());live=[];};

/* ---------- pixel art ---------- */
function pix(rows,fill){const R=rows.length,C=rows[0].length;let s='';rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='#')s+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';}));
  return '<svg viewBox="0 0 '+C+' '+R+'" fill="'+(fill||'currentColor')+'" shape-rendering="crispEdges" aria-hidden="true">'+s+'</svg>';}
const LUCIDE={
  trace:'<polygon points="6 3 20 12 6 21 6 3"/>',
  two:'<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  diff:'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  race:'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  card:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowL:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  upRight:'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};
function lucide(n,cls){return '<svg class="lucide '+(cls||'')+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+LUCIDE[n]+'</svg>';}
const BUGS=[
  ['#.#..#.#','.######.','##.##.##','########','.######.','#.####.#','#......#','.#....#.'],
  ['..####..','.######.','##.##.##','########','.######.','..#..#..','.#.##.#.','#......#'],
  ['#......#','.#....#.','.######.','##.##.##','########','.######.','.#....#.','#......#'],
  ['..#..#..','...##...','..####..','.######.','##.##.##','########','#.#..#.#','.#....#.'],
  ['...##...','..####..','.######.','##.##.##','########','.#.##.#.','#.#..#.#','.#....#.'],
  ['.######.','########','#.####.#','########','########','.######.','..#..#..','.##..##.']
];

/* ---------- dot-matrix skyline ---------- */
function dots(cv){
  const ctx=cv.getContext('2d');if(!ctx)return;let W=0,Hh=+cv.dataset.h||280,raf=0,vis=true;const SP=11;
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){const r=cv.getBoundingClientRect();W=Math.max(300,r.width||cv.parentElement.clientWidth||800);const d=Math.min(2,window.devicePixelRatio||1);cv.width=W*d;cv.height=Hh*d;ctx.setTransform(d,0,0,d,0,0);}
  function draw(t){
    const cs=getComputedStyle(document.documentElement),mute=cs.getPropertyValue('--mute').trim()||'#888',acc=cs.getPropertyValue('--acc').trim()||'#cf4';
    ctx.clearRect(0,0,W,Hh);
    for(let x=SP/2;x<W;x+=SP){
      const prof=Hh*.42+Math.sin(x*.012+t*.0004)*Hh*.13+Math.sin(x*.031-t*.0003)*Hh*.07+Math.sin(x*.07+t*.0006)*Hh*.025;
      for(let y=SP/2;y<Hh;y+=SP){
        if(y<prof-SP)continue;
        const edge=Math.abs(y-prof)<SP*1.1;
        ctx.globalAlpha=edge?.9:.22;ctx.fillStyle=edge?acc:mute;
        ctx.beginPath();ctx.arc(x,y,edge?1.9:.9,0,6.3);ctx.fill();
      }}
    ctx.globalAlpha=1;
  }
  function loop(t){if(vis)draw(t);raf=requestAnimationFrame(loop);}
  size();draw(0);
  if(!reduce){let last=0;const tick=t=>{if(vis&&t-last>50){draw(t);last=t;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);}
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(cv);
  window.addEventListener('resize',()=>{size();draw(performance.now());});
}

/* ---------- HOME ---------- */
function initHome(){
  const pats=['Two pointers','Sliding window','Hash maps','Stacks','Binary search','Heaps','Tries','Intervals','Linked lists','Trees','Graphs','Backtracking','Dynamic programming','Bit tricks','Design'];
  const t=pats.map(p=>'<span>'+p+'</span><i>◆</i>').join('');$('#ticker').innerHTML=t+t;
  const F=[['trace','Animated trace','Step through the algorithm on a real example: pointers glide, cells swap, stacks grow.'],
    ['two','Two variants','Beginner-friendly first, optimal second. Same method signature, side by side.'],
    ['diff','Diff morph','The brute force transforms into the best version, one highlighted change at a time.'],
    ['race','Complexity race','Drag n upward and watch O(n²) fall hopelessly behind O(n).'],
    ['bulb','Memory trick','One vivid line per problem so the pattern comes back when you need it.'],
    ['card','Anki cards','Download a deck, or push cards straight into Anki through AnkiConnect.'],
    ['globe','Any LeetCode URL','Not in the library? Bring any LLM key and generate the full page in seconds.']];
  const card=x=>'<div class="card feat">'+lucide(x[0])+'<h3>'+x[1]+'</h3><p>'+x[2]+'</p></div>';
  $('#feat1').innerHTML=F.slice(0,4).map(card).join('');$('#feat2').innerHTML=F.slice(4).map(card).join('');
  const slots=DR.T.reduce((s,x)=>s+x.ids.length,0),uniq=Object.keys(DR.P).length;
  $('#trackgrid').innerHTML=DR.T.map(x=>'<a class="card track" href="#/t/'+x.id+'"><div class="n">'+x.ids.length+'</div><h3>'+E(x.name)+'</h3><p>'+E(x.blurb)+'</p><div class="go">Open track '+lucide('arrow')+'</div></a>').join('');
  $('#stats').innerHTML=[[slots,'curated drills across 8 role tracks'],[uniq,'unique problems, each in 2 variants'],[0,'servers, builds or dependencies']].map(x=>'<div class="stat"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('');
  $('#prov').innerHTML=['groq','gemini','openrouter','cerebras','mistral','nvidia'].map(k=>{const p=AI.PROV[k];return '<a class="card" href="'+p.get+'" target="_blank" rel="noopener"><h3>'+p.n+'<em>'+p.tag+'</em></h3><p>'+p.blurb+'</p><p class="get" style="color:var(--acc)">Get a key '+lucide('arrow')+'</p></a>';}).join('');
  $('#sprites').innerHTML=BUGS.map(b=>pix(b)).join('');
  $$('canvas.dots').forEach(dots);
  $$('.try a').forEach(a=>a.onclick=()=>{$('#url').value='https://leetcode.com/problems/'+a.dataset.slug+'/';$('#urlform').requestSubmit();});
  try{const s=session(),lp=s&&s.lastPage;
    if(lp&&lp.hash&&lp.hash!==location.hash&&/^#\//.test(lp.hash)){
      $('#resume').innerHTML='<span>Welcome back, visit #'+(s.visits||1)+'</span><a class="btn small ghost" href="'+lp.hash.replace(/"/g,'')+'">Continue: '+E(String(lp.label||'where you left off')).slice(0,60)+' '+lucide('arrow')+'</a>';
    }}catch(e){}
  $('#urlform').addEventListener('submit',e=>{e.preventDefault();const v=$('#url').value.trim();
    const m=v.match(/leetcode\.(?:com|cn)\/problems\/([a-z0-9-]+)/i)||(/^[a-z0-9-]+$/i.test(v)?[0,v]:null);
    if(!m){$('#urlhint').textContent='Paste a link like https://leetcode.com/problems/two-sum/';return;}
    $('#urlhint').textContent='';const slug=m[1].toLowerCase();location.hash=find(slug)?'#/p/'+slug:'#/gen/'+slug;});
  $('#open-keys').onclick=openKeys;
}

/* ---------- views ---------- */
function setView(name){$$('.view').forEach(v=>v.hidden=v.id!=='v-'+name);}
function pageShell(inner,wide){return '<div class="page'+(wide?' page-wide':'')+'"><div class="wrap">'+inner+'</div></div>';}

function trackList(id){
  const T=DR.T.find(x=>x.id===id);if(!T)return notFound();
  killLive();setView('track');remember('Track: '+T.name);const v=$('#v-track'),dn=done();
  const list=T.ids.map(i=>DR.P[i]);
  v.innerHTML=pageShell('<div class="crumbs"><a href="#/">Home</a> / Track</div><h1 class="ptitle">'+E(T.name)+'</h1><p class="brief">'+E(T.blurb)+'</p>'+
   '<div class="toolbar"><a class="btn small" href="#/p/'+list[0].id+'?t='+T.id+'">Start with #1 '+lucide('arrow')+'</a><button class="btn small ghost" id="tk-dl">Download Anki cards</button><button class="btn small ghost" id="tk-push">Push to Anki</button><span class="small" id="tk-prog"></span></div><div class="status" id="tk-st" hidden></div>'+
   '<div class="filters"><input id="q" placeholder="Filter by title, pattern or tag…"><span id="df"></span></div>'+
   '<table class="tbl"><thead><tr><th></th><th>#</th><th>Problem</th><th>Level</th><th class="hm">Pattern</th><th class="hm">Tags</th></tr></thead><tbody id="rows"></tbody></table>');
  const body=$('#rows',v);
  const dfC=DRUI.select($('#df',v),{options:[['','All difficulties'],['E','Easy'],['M','Medium'],['H','Hard']],value:'',label:'Difficulty filter',onChange:draw});
  function draw(){const q=$('#q',v).value.toLowerCase(),df=dfC.value,d2=done();let c=0;
    body.innerHTML=list.map((p,i)=>{const hay=(p.t+' '+(p.pat||'')+' '+(p.tg||[]).join(' ')).toLowerCase();if((q&&!hay.includes(q))||(df&&p.d!==df))return '';
      return '<tr class="row" data-id="'+p.id+'"><td><input type="checkbox" class="done" '+(d2[p.id]?'checked':'')+' aria-label="Mark done"></td><td class="num">'+(i+1)+'</td><td class="t">'+E(p.t)+'</td><td><span class="chip '+p.d+'">'+DIFF[p.d]+'</span></td><td class="hm small">'+E(p.pat||'')+'</td><td class="hm small">'+E((p.tg||[]).slice(0,3).join(' · '))+'</td></tr>';}).join('');
    $$('.row',body).forEach(r=>r.onclick=e=>{if(e.target.classList.contains('done'))return;location.hash='#/p/'+r.dataset.id+'?t='+T.id;});
    $$('.done',body).forEach(cb=>cb.onchange=()=>{const d=done();const id2=cb.closest('tr').dataset.id;if(cb.checked)d[id2]=1;else delete d[id2];SS('dr-done',d);prog();});
    prog();}
  function prog(){const d=done();$('#tk-prog',v).textContent=list.filter(p=>d[p.id]).length+' / '+list.length+' done';}
  $('#q',v).oninput=draw;draw();
  $('#tk-dl',v).onclick=()=>Anki.download('dryrun-'+T.id+'.txt',Anki.tsv(list));
  $('#tk-push',v).onclick=async()=>{const s=$('#tk-st',v);s.hidden=false;s.className='status';s.textContent='Contacting AnkiConnect…';try{s.textContent=await Anki.push(list,'DryRun::'+T.name);}catch(e){s.className='status err';s.textContent='Could not reach Anki: '+e.message+'\nOpen Anki with the AnkiConnect add-on (code 2055492159) and allow this site in its webCorsOriginList.';}};
  window.scrollTo(0,0);
}

function codeBox(code,lang,tab,p){
  const lines=HL.parse(code);
  return '<div class="cbox"><div class="chead"><span><b>'+(tab===1?'Variant 1 · Beginner-friendly':'Variant 2 · Optimized')+'</b> · '+(lang==='js'?'JavaScript':'Python 3')+'</span><button class="btn small ghost cp" style="padding:4px 12px;box-shadow:none">Copy code</button></div><div class="code">'+Viz.codeHTML(lines,lang)+'</div><div class="cx"><span>Time <b>'+E(tab===1?p.bt:p.ot)+'</b></span><span>Space <b>'+E(tab===1?p.bs:p.os)+'</b></span>'+(tab===1?'<span class="small">Red lines = where the time goes.</span>':'<span class="small">Green lines = the idea that makes it faster.</span>')+'</div></div>';
}

function problem(id,query){
  const p=find(id);if(!p)return location.replace('#/gen/'+id);
  killLive();setView('problem');remember(p.t);const v=$('#v-problem');
  const tid=(query.match(/t=([\w-]+)/)||[])[1],T=DR.T.find(x=>x.id===tid),idx=T?T.ids.indexOf(id):-1;
  const lang=p.lang||'py',dn=done();
  const nav=(q,lab)=>q?'<a class="btn small ghost" href="#/p/'+q+'?t='+tid+'">'+lab+'</a>':'<span></span>';
  v.innerHTML=pageShell(
    '<div class="crumbs"><a href="#/">Home</a> / '+(T?'<a href="#/t/'+T.id+'">'+E(T.name)+'</a> / '+(idx+1):(p.ai?'<a href="#/mine">Generated</a>':'Library'))+'</div>'+
    '<h1 class="ptitle">'+(p.n?'<span class="mono" style="color:var(--mute);font-size:.5em;margin-right:12px">#'+p.n+'</span>':'')+E(p.t)+'</h1>'+
    '<div class="pmeta"><span class="chip '+p.d+'">'+DIFF[p.d]+'</span>'+(p.tg||[]).map(t=>'<span class="chip">'+E(t)+'</span>').join('')+(p.ai?'<span class="chip" style="color:var(--acc);border-color:var(--acc)">AI-generated · verify before relying</span>':'')+'<a class="btn small ghost" target="_blank" rel="noopener" href="'+lcUrl(p.id)+'">Open on LeetCode '+lucide('upRight')+'</a><button class="btn small ghost" id="mk-done">'+(dn[id]?'✓ Done':'Mark done')+'</button></div>'+
    (p.br?'<p class="brief">'+E(p.br)+'</p>':'')+
    '<div class="duo"><div class="sec duo-l"><h2>01 · Trace</h2><h3>Watch it run</h3><div id="viz"></div><p class="small" style="margin-top:10px">Tip: click the stage, then use ← → and space.</p></div>'+
    '<div class="sec duo-r"><h2>02 · Two variants</h2><h3>Beginner first, then the version interviewers want</h3><div class="tabs"><div class="tab on" data-t="1">Variant 1 · Beginner</div><div class="tab" data-t="2">Variant 2 · Optimized</div></div><div id="codebox"></div></div></div>'+
    '<div class="sec"><h2>03 · What changed</h2><h3>Morph the brute force into the best version</h3><div id="morph"></div><h3 style="margin-top:46px">…and why it matters at scale</h3><div id="race"></div></div>'+
    '<div class="sec"><h2>04 · Remember it</h2><h3>One hook, one flashcard</h3><div class="trick"><div class="card"><div class="pat">'+E(p.pat||'Pattern')+'</div><p class="big">'+E(p.trick||'')+'</p>'+(p.real?'<p class="small" style="margin-top:16px"><b style="color:var(--ink)">Where it shows up:</b> '+E(p.real)+'</p>':'')+'</div>'+
    '<div class="card"><h3 style="font-size:16px;font-weight:600;margin-bottom:6px">Anki</h3><p class="small">Two cards: pattern recall and write-the-code.</p><div style="display:grid;gap:10px;margin-top:16px"><button class="btn small" id="an-dl">Download cards (.txt)</button><button class="btn small ghost" id="an-push">Send to Anki (AnkiConnect)</button><a class="btn small ghost" target="_blank" rel="noopener" href="https://ankiweb.net/decks">Open AnkiWeb '+lucide('upRight')+'</a></div><p class="small" style="margin-top:12px">Pushes need desktop Anki open with the <a href="'+ANKI_ADDON+'" target="_blank" rel="noopener">AnkiConnect add-on ↗</a>.</p><div class="status" id="an-st" hidden style="font-size:12px"></div></div></div></div>'+
    '<div class="pn">'+(T?nav(T.ids[idx-1],lucide('arrowL')+' Previous')+nav(T.ids[idx+1],'Next '+lucide('arrow')):'<a class="btn small ghost" href="#/">'+lucide('arrowL')+' Home</a>')+'</div>',true);
  live.push(Viz.mount($('#viz',v),p.viz||{flow:[]}));
  const cb=$('#codebox',v);function tab(n){$$('.tab',v).forEach(t=>t.classList.toggle('on',t.dataset.t==String(n)));cb.innerHTML=codeBox(n===1?p.b:p.o,lang,n,p);$('.cp',cb).onclick=e=>{const txt=HL.parse(n===1?p.b:p.o).map(l=>l.t).join('\n');(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>e.target.textContent='Copied ✓').catch(()=>e.target.textContent='Copy failed');};}
  $$('.tab',v).forEach(t=>t.onclick=()=>tab(+t.dataset.t));tab(1);
  live.push(Viz.morph($('#morph',v),p.b,p.o,lang));Viz.race($('#race',v),p);
  $('#mk-done',v).onclick=e=>{const d=done();if(d[id]){delete d[id];e.target.textContent='Mark done';}else{d[id]=1;e.target.textContent='✓ Done';}SS('dr-done',d);};
  $('#an-dl',v).onclick=()=>Anki.download('dryrun-'+id+'.txt',Anki.tsv([p]));
  $('#an-push',v).onclick=async()=>{const s=$('#an-st',v);s.hidden=false;s.className='status';s.textContent='Contacting AnkiConnect…';try{s.textContent=await Anki.push([p],'DryRun');}catch(e){s.className='status err';s.textContent='Could not reach Anki ('+e.message+'). Open Anki with the AnkiConnect add-on (2055492159) and add this site to its webCorsOriginList.';}};
  window.scrollTo(0,0);
}

function gen(slug){
  killLive();setView('gen');remember('Generate: '+slug);const v=$('#v-gen');
  v.innerHTML=pageShell('<div class="crumbs"><a href="#/">Home</a> / New problem</div><h1 class="ptitle">Not in the library yet</h1><p class="brief">We will ask an LLM to produce the beginner solution, the optimal one, the trace and the memory trick for <b class="mono">'+E(slug)+'</b>. Results are saved in this browser only.</p>'+
    '<div class="field"><label>Problem statement (optional, paste it for better accuracy)</label><textarea id="gs" placeholder="Paste the problem description here, or leave empty…"></textarea></div>'+
    '<div class="toolbar"><button class="btn" id="gg">Generate</button><button class="btn ghost" id="gk">AI settings</button></div><div class="status" id="gst" hidden></div>');
  const st=$('#gst',v);let busy=false;
  async function run(){if(busy)return;busy=true;st.hidden=false;st.className='status';
    const say=m=>{st.innerHTML='<span class="spin"></span>'+E(m);};
    try{const p=await AI.generate(slug,$('#gs',v).value.trim(),say);AI.saveMine(p);location.hash='#/p/'+slug;}
    catch(e){st.className='status err';
      if(e.message==='NOKEY'){st.innerHTML='No AI provider is configured yet. Pick one and paste a key, Groq, Gemini and OpenRouter all have free tiers. Then press Generate again.';}
      else st.textContent=e.message;}
    busy=false;}
  $('#gg',v).onclick=run;$('#gk',v).onclick=openKeys;
  if(AI.ready())run();else{st.hidden=false;st.className='status err';st.textContent='Add an AI provider key to generate new problems (free options inside).';}
  window.scrollTo(0,0);
}

function mineView(){
  killLive();setView('mine');remember('Your generated problems');const v=$('#v-mine'),m=AI.mine(),ids=Object.keys(m);
  v.innerHTML=pageShell('<div class="crumbs"><a href="#/">Home</a> / Generated</div><h1 class="ptitle">Your generated problems</h1><p class="brief">Stored only in this browser (localStorage). Export a backup or turn them into Anki cards.</p>'+
   '<div class="toolbar"><button class="btn small ghost" id="m-exp">Export JSON</button><button class="btn small ghost" id="m-anki">Download Anki cards</button></div>'+
   (ids.length?'<table class="tbl"><tbody>'+ids.map(i=>'<tr class="row" data-id="'+i+'"><td class="t">'+E(m[i].t)+'</td><td><span class="chip '+m[i].d+'">'+DIFF[m[i].d]+'</span></td><td class="small">'+E(m[i].pat||'')+'</td><td><button class="btn small ghost del" style="padding:4px 12px;box-shadow:none">Delete</button></td></tr>').join('')+'</tbody></table>':'<p class="small" style="margin-top:30px">Nothing yet. Paste a LeetCode URL on the home page.</p>'));
  $$('.row',v).forEach(r=>r.onclick=e=>{if(e.target.classList.contains('del')){AI.delMine(r.dataset.id);mineView();return;}location.hash='#/p/'+r.dataset.id;});
  $('#m-exp',v).onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(m,null,1)],{type:'application/json'}));a.download='dryrun-generated.json';a.click();};
  $('#m-anki',v).onclick=()=>Anki.download('dryrun-generated.txt',Anki.tsv(ids.map(i=>m[i])));
  window.scrollTo(0,0);
}
/* ---------- your data: progress, backup export/import, Anki help ---------- */
const ANKI_ADDON='https://ankiweb.net/shared/info/2055492159';
function dataView(){
  killLive();setView('data');remember('Your data');const v=$('#v-data');
  const dn=done(),m=AI.mine(),s=session();
  const uniq=Object.keys(DR.P).length,dc=Object.keys(dn).length;
  const bar=(label,href,c,n)=>'<a href="'+href+'"><div class="rbar b"><span>'+label+'</span><div class="tr"><div class="fl" style="width:'+Math.round(100*c/Math.max(1,n))+'%"></div></div><span class="v">'+c+'/'+n+'</span></div></a>';
  const bytes=['dr-done','dr-mine','dr-ai','dr-theme','dr-session'].reduce((a,k)=>{try{return a+((localStorage.getItem(k)||'').length);}catch(e){return a;}},0);
  v.innerHTML=pageShell('<div class="crumbs"><a href="#/">Home</a> / Your data</div><h1 class="ptitle">Your data, on this device</h1><p class="brief">Progress, generated problems, keys and settings live only in this browser. Nothing is uploaded anywhere. Export a backup before clearing browser data or switching devices.</p>'+
   '<div class="sec"><h2>01 · Progress</h2><h3>'+dc+' of '+uniq+' library problems done, plus '+Object.keys(m).length+' generated</h3><div class="dbars">'+bar('All tracks','#tracks',dc,uniq)+DR.T.map(t=>bar(E(t.name),'#/t/'+t.id,t.ids.filter(id=>dn[id]).length,t.ids.length)).join('')+'</div></div>'+
   '<div class="sec"><h2>02 · Backup</h2><h3>Export or import everything</h3><div class="toolbar"><button class="btn small" id="d-exp">Export backup (.json)</button><label class="btn small ghost">Import backup<input type="file" id="d-imp" accept="application/json,.json"></label><button class="btn small ghost" id="d-wipe">Erase everything</button></div><div class="status" id="d-st" hidden></div><p class="small" style="margin-top:12px">Visits: '+(s.visits||1)+' · Storage used: ~'+(bytes/1024).toFixed(1)+' KB · A backup holds progress, generated problems, provider keys and theme.</p></div>'+
   '<div class="sec"><h2>03 · Anki</h2><h3>Push cards without anything looking broken</h3><p class="brief" style="margin-top:0">Card pushes go to desktop Anki on this machine through AnkiConnect (localhost, never the network). If a push fails, install the <a href="'+ANKI_ADDON+'" target="_blank" rel="noopener">AnkiConnect add-on (code 2055492159) ↗</a>, keep desktop Anki open, and allow this site in its webCorsOriginList. Background reading: <a href="https://docs.ankiweb.net/" target="_blank" rel="noopener">Anki docs ↗</a>.</p></div>');
  const st=$('#d-st',v),say=(m2,err)=>{st.hidden=false;st.className='status'+(err?' err':'');st.textContent=m2;};
  $('#d-exp',v).onclick=()=>{
    const out={app:'dryrun-backup',v:1,exportedAt:new Date().toISOString(),done:done(),mine:AI.mine(),ai:AI.get(),theme:null,session:session()};
    try{out.theme=localStorage.getItem('dr-theme')||'dark';}catch(e){}
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(out)],{type:'application/json'}));
    const d=new Date(),p2=n=>String(n).padStart(2,'0');a.download='dryrun-backup-'+d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'.json';a.click();
    setTimeout(()=>{try{URL.revokeObjectURL(a.href);}catch(e){}},4000);
    say('Backup exported as '+a.download+'. Keep it somewhere safe.');
  };
  $('#d-imp',v).onchange=e=>{
    const f=e.target.files&&e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{try{
      const j=JSON.parse(r.result);
      if(!j||typeof j!=='object'||(!j.done&&!j.mine&&!j.ai))throw new Error('not a DryRun backup (expected app "dryrun-backup")');
      if(!confirm('Import this backup from '+(j.exportedAt||'unknown date')+'? Progress and generated problems merge in. Provider keys and theme from the file replace what is saved here.'))return;
      const d0=done();Object.assign(d0,j.done||{});SS('dr-done',d0);
      const m0=AI.mine();Object.assign(m0,j.mine||{});SS('dr-mine',m0);
      if(j.ai&&j.ai.cfg){const cur=AI.get();if(j.ai.prov)cur.prov=j.ai.prov;Object.assign(cur.cfg,j.ai.cfg);SS('dr-ai',cur);}
      if(j.theme){try{localStorage.setItem('dr-theme',j.theme);document.documentElement.dataset.theme=j.theme;}catch(_){}}
      say('Backup imported: '+Object.keys(done()).length+' done, '+Object.keys(AI.mine()).length+' generated.');
      dataView();
    }catch(err){say('Import failed: '+err.message,true);}};
    r.readAsText(f);e.target.value='';
  };
  $('#d-wipe',v).onclick=()=>{if(confirm('Erase ALL DryRun data in this browser (progress, generated problems, keys, theme)? This cannot be undone. Export a backup first.')){['dr-done','dr-mine','dr-ai','dr-theme','dr-session'].forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});location.hash='#/';location.reload();}};
  window.scrollTo(0,0);
}
function notFound(){killLive();setView('gen');$('#v-gen').innerHTML=pageShell('<h1 class="ptitle">Page not found</h1><p class="brief"><a href="#/" style="color:var(--acc)">Back home</a></p>');}

/* ---------- AI settings dialog ---------- */
function openKeys(){
  const dlg=$('#dlg-keys'),cur=AI.get();
  const opts=Object.entries(AI.PROV).map(([k,p])=>[k,p.n+', '+p.tag]);
  dlg.innerHTML='<div class="dbody"><div class="dlg-head"><div><h3>AI settings</h3><p class="small">Only needed for problems outside the built-in library. Your key is stored in this browser and sent only to the provider you choose.</p></div><button class="dlg-x" id="k-x-top" aria-label="Close settings">'+lucide('x')+'</button></div>'+
   '<div class="field"><label>Provider</label><span id="k-p"></span></div><p class="small" id="k-blurb" style="margin-top:8px"></p>'+
   '<div class="field"><label>Base URL (OpenAI-compatible)</label><input id="k-b" spellcheck="false"></div>'+
   '<div class="field"><label>Model</label><input id="k-m" list="k-ml" spellcheck="false"><datalist id="k-ml"></datalist></div>'+
   '<div class="field"><label>API key</label><input id="k-k" type="password" autocomplete="off" placeholder="paste key"></div>'+
   '<div class="toolbar"><button class="btn small" id="k-s">Save</button><button class="btn small ghost" id="k-l">List models</button><a class="btn small ghost" id="k-g" target="_blank" rel="noopener">Get a key '+lucide('upRight')+'</a><button class="btn small ghost" id="k-x">Close</button></div><div class="status" id="k-st" hidden></div>'+
   '<div class="free"><b style="margin-top:20px;font-size:13px">Free-tier providers</b>'+['groq','gemini','openrouter','cerebras','mistral','nvidia','huggingface'].map(k=>'<span>• <a href="'+AI.PROV[k].get+'" target="_blank" rel="noopener">'+AI.PROV[k].n+'</a>, '+AI.PROV[k].blurb+'</span>').join('')+'<span class="small" style="margin-top:10px">Free tiers and model names change often; edit the Model field or press “List models”. Limits are per provider.</span></div>'+
   '<div class="toolbar"><button class="btn small ghost" id="k-c">Erase saved keys &amp; generated problems</button></div></div>';
  const Pc=DRUI.select($('#k-p',dlg),{options:opts,value:cur.prov,label:'AI provider',onChange:fill});
  function fill(){const k=Pc.value,c=AI.cfgFor(k),d=AI.PROV[k];$('#k-b',dlg).value=c.base;$('#k-m',dlg).value=c.model;$('#k-k',dlg).value=c.key;$('#k-blurb',dlg).textContent=d.blurb;const g=$('#k-g',dlg);g.hidden=!d.get;g.href=d.get||'#';}
  fill();
  const st=$('#k-st',dlg),val=()=>({prov:Pc.value,base:$('#k-b',dlg).value.trim(),model:$('#k-m',dlg).value.trim(),key:$('#k-k',dlg).value.trim()});
  $('#k-s',dlg).onclick=()=>{const c=val();AI.save(c.prov,c);st.hidden=false;st.className='status';st.textContent='Saved ✓';};
  $('#k-l',dlg).onclick=async()=>{const c=val();st.hidden=false;st.className='status';st.textContent='Loading models…';try{const ms=await AI.listModels(c);$('#k-ml',dlg).innerHTML=ms.map(m=>'<option value="'+E(m)+'">').join('');st.textContent=ms.length+' models found, click the Model field to choose.';}catch(e){st.className='status err';st.textContent='Could not list models: '+e.message;}};
  $('#k-x',dlg).onclick=()=>dlg.close();
  $('#k-x-top',dlg).onclick=()=>dlg.close();
  dlg.onclick=e=>{if(e.target===dlg)dlg.close();};
  $('#k-c',dlg).onclick=()=>{if(confirm('Erase saved API keys and generated problems from this browser?')){['dr-ai','dr-mine'].forEach(k=>localStorage.removeItem(k));fill();st.hidden=false;st.className='status';st.textContent='Erased.';}};
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
}

/* ---------- router ---------- */
function route(){
  const raw=location.hash.replace(/^#\/?/,''),[path,query]=raw.split('?'),parts=path.split('/').filter(Boolean);
  if(!parts.length||parts[0]==='tracks'){killLive();setView('home');if(parts[0]==='tracks'){const t=$('#tracks');t&&t.scrollIntoView();}else window.scrollTo(0,0);return;}
  if(parts[0]==='t')return trackList(parts[1]);
  if(parts[0]==='p')return problem(parts[1],query||'');
  if(parts[0]==='gen')return gen(parts[1]);
  if(parts[0]==='mine')return mineView();
  if(parts[0]==='data')return dataView();
  notFound();
}
function boot(){
  try{const s=session();s.visits=(s.visits||0)+1;s.last=Date.now();if(!s.first)s.first=Date.now();saveSession(s);}catch(e){}
  if(!storeOK()){const w=$('#storewarn');if(w)w.hidden=false;}
  initHome();
  $('#btn-theme').onclick=()=>{const t=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=t;try{localStorage.setItem('dr-theme',t);}catch(e){}};
  $('#btn-keys').onclick=openKeys;
  window.addEventListener('hashchange',route);route();
}
window.DRAPP={route,boot};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
