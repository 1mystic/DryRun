/* viz.js, animated trace player, code renderer, morph diff and complexity race */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const h=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const E=HL.esc;

/* ---------- tree layout ---------- */
function layout(root,bin){
  const nodes=[],edges=[];let cnt=0,maxD=0;
  const key=n=>bin?String(n.v):'n'+n.id;
  if(!root)return {nodes,edges,w:1,hgt:1};
  if(bin){(function go(n,d,par){if(!n)return;maxD=Math.max(maxD,d);go(n.c[0],d+1,n);const o={id:n.id,key:key(n),v:n.v,x:cnt++,y:d};nodes.push(o);n._o=o;if(par)edges.push([par._o||par,o]);go(n.c[1],d+1,n);})(root,0,null);
    // parent link fix (parent._o may not exist yet) → rebuild edges after
    edges.length=0;(function e(n){if(!n)return;n.c.forEach(c=>{if(c){edges.push([n._o,c._o]);e(c);}});})(root);}
  else{(function go(n,d){maxD=Math.max(maxD,d);const o={id:n.id,key:key(n),v:n.v,y:d};n._o=o;nodes.push(o);
      if(!n.c.length){o.x=cnt++;}else{n.c.forEach(c=>{go(c,d+1);edges.push([o,c._o]);});o.x=(n.c[0]._o.x+n.c[n.c.length-1]._o.x)/2;}})(root,0);}
  return {nodes,edges,w:Math.max(1,cnt),hgt:maxD+1};
}

/* ---------- player ---------- */
function mount(el,vspec,opts){
  opts=opts||{};
  let spec;try{spec=SIMS.run(vspec);}catch(e){el.innerHTML='<div class="stage"><div class="note">Visual unavailable: '+E(e.message)+'</div></div>';return {destroy(){}};}
  const frames=(spec.frames||[]).slice(0,60);
  if(!frames.length){el.innerHTML='<div class="stage"><div class="note">No visual for this problem yet.</div></div>';return {destroy(){}};}
  el.innerHTML='';
  const st=h('div','stage');st.tabIndex=0;
  const sv=h('div','sv'),main=h('div','sv-main');sv.append(main);
  const aux=h('div','aux'),ctrl=h('div','ctrl');let note=h('div','note');
  ctrl.innerHTML='<button data-a="first" title="First">⏮</button><button data-a="prev" title="Back (←)">◀</button><button class="play" data-a="play">▶ Play</button><button data-a="next" title="Next (→)">▶|</button><button data-a="last" title="Last">⏭</button><input type="range" min="0" max="'+(frames.length-1)+'" value="0" aria-label="Step"><span class="ct"></span><span class="spd"></span>';
  st.append(sv,aux,note,ctrl);el.append(st);
  const range=$('input',ctrl),ct=$('.ct',ctrl),playBtn=$('.play',ctrl);
  const sel=DRUI.select($('.spd',ctrl),{options:[['2200','0.5×'],['1400','1×'],['700','2×']],value:'1400',label:'Speed',compact:true,onChange:()=>{if(timer){stop();play();}}});
  let i=0,timer=null,prevAux={};

  // persistent parts
  let row=null,cells=new Map(),ptrs=new Map(),win=null,grid=null,gridKey='',treeSvg=null,treeNodes=new Map(),graphSvg=null,graphG=null;

  function ensureRow(){if(row)return;row=h('div','sv-row');main.append(row);win=h('div','win');row.append(win);}
  function renderRow(fr){
    if(!fr.a){if(row)row.hidden=true;return;}
    ensureRow();row.hidden=false;
    const A=fr.a,n=A.length;let ml=1;A.forEach(x=>{const s=String(x&&typeof x==='object'?x.v:x);ml=Math.max(ml,s.length);});
    const cw=Math.max(n>18?28:n>12?36:n>9?44:54,Math.min(110,ml*9+16)),gap=spec.ll?34:8,step=cw+gap;
    const keys=new Set();
    A.forEach((it,idx)=>{const o=it&&typeof it==='object'&&'k' in it?it:{v:it};const k=o.k!=null?'k'+o.k:'i'+idx;keys.add(k);
      let c=cells.get(k);if(!c){c=h('div','cell');row.append(c);cells.set(k,c);}
      c.textContent=o.v;c.className='cell'+((fr.h||[]).includes(idx)?' h':'')+((fr.g||[]).includes(idx)?' g':'')+((fr.x||[]).includes(idx)?' x':'')+(o.c?' '+o.c:'')+(o.v==='?'?' q':'');
      c.style.width=cw+'px';c.style.height=cw+'px';c.style.transform='translateX('+(idx*step)+'px)';});
    for(const [k,c] of cells)if(!keys.has(k)){c.remove();cells.delete(k);}
    row.querySelectorAll('.ix,.arr,.back').forEach(e=>e.remove());
    const lab=spec.labels||spec.top;
    A.forEach((_,idx)=>{const t=h('div','ix',lab?E(String(lab[idx]??idx)):idx);t.style.cssText='width:'+cw+'px;transform:translateX('+(idx*step)+'px);top:'+(cw+3)+'px';row.append(t);});
    if(spec.ll){const ar=fr.ar||[];for(let q=0;q<n-1;q++){const d=ar[q]||'r';if(d==='n')continue;const t=h('div','arr',d==='l'?'←':'→');t.style.cssText='width:'+gap+'px;height:'+cw+'px;left:0;top:0;transform:translateX('+(q*step+cw)+'px)';row.append(t);}}
    if(spec.back){const [a,b]=spec.back,x1=a*step+cw/2,x2=b*step+cw/2,y=cw+22;const sv2=document.createElementNS('http://www.w3.org/2000/svg','svg');sv2.setAttribute('class','back');sv2.style.cssText='position:absolute;left:0;top:'+y+'px;overflow:visible;pointer-events:none';sv2.setAttribute('width',n*step);sv2.setAttribute('height',34);
      sv2.innerHTML='<path d="M'+x1+' 0 V24 H'+x2+' V6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 3" style="color:var(--mute)"/><path d="M'+(x2-5)+' 10 L'+x2+' 2 L'+(x2+5)+' 10" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--mute)"/>';row.append(sv2);}
    // window
    if(fr.w&&fr.w[0]<=fr.w[1]){win.style.opacity=1;win.style.left=(fr.w[0]*step-5)+'px';win.style.width=((fr.w[1]-fr.w[0]+1)*step-gap+10)+'px';win.style.height=(cw+16)+'px';}else win.style.opacity=0;
    // pointers
    const p=fr.p||{},at={};let maxS=0;const names=Object.keys(p);
    for(const [name,e] of ptrs)if(!(name in p)){e.remove();ptrs.delete(name);}
    names.forEach(name=>{const idx=p[name];let e=ptrs.get(name);if(!e){e=h('div','ptr');row.append(e);ptrs.set(name,e);}
      const stack=at[idx]=(at[idx]===undefined?0:at[idx]+1);maxS=Math.max(maxS,stack);const nul=idx<0||idx>=n;
      e.textContent=name+(nul?' (null)':'');e.style.width='56px';e.style.left='0';e.style.top=(cw+22+stack*34)+'px';e.style.transform='translateX('+(idx*step+cw/2-28)+'px)';});
    row.style.width=Math.max(n*step-gap,10)+'px';row.style.height=(cw+30+(names.length?34*(maxS+1)+4:0)+(spec.back?30:0))+'px';
    row.style.marginLeft=row.style.marginRight='auto';
  }
  function renderGrid(fr){
    if(!fr.grid){if(grid)grid.hidden=true;return;}
    const V=fr.grid.v,C=fr.grid.c||[],R=V.length,Cn=V[0].length,rl=spec.rl,cl=spec.cl,off=(rl?1:0),offr=(cl?1:0);
    const k=R+'x'+Cn+(rl?'r':'')+(cl?'c':'');
    if(!grid||gridKey!==k){if(grid)grid.remove();grid=h('div','sv-grid');gridKey=k;grid.style.gridTemplateColumns='repeat('+(Cn+off)+',auto)';
      if(cl){if(rl)grid.append(h('div','g lab',''));cl.forEach(x=>grid.append(h('div','g lab',E(String(x)))));}
      for(let r=0;r<R;r++){if(rl)grid.append(h('div','g lab',E(String(rl[r]))));for(let c=0;c<Cn;c++)grid.append(h('div','g'));}
      main.append(grid);}
    grid.hidden=false;const cs=[...grid.querySelectorAll('.g:not(.lab)')];
    for(let r=0;r<R;r++)for(let c=0;c<Cn;c++){const e=cs[r*Cn+c];e.textContent=V[r][c];e.className='g '+((C[r]&&C[r][c])||'');}
  }
  function svgEl(t,a){const e=document.createElementNS('http://www.w3.org/2000/svg',t);for(const k in a)e.setAttribute(k,a[k]);return e;}
  function renderTree(fr){
    const arr=fr.tree||spec.tree,nested=spec.trie;
    if(!arr&&!nested){if(treeSvg)treeSvg.style.display='none';return;}
    const bin=!!arr,root=arr?SIMS.buildTree(arr):nested,L=layout(root,bin);
    const dx=bin?44:48,dy=58,W=Math.max(L.w*dx,dx),H=L.hgt*dy+10;
    if(!treeSvg){treeSvg=svgEl('svg',{class:'gfx'});main.append(treeSvg);}
    treeSvg.style.display='';treeSvg.setAttribute('viewBox','0 0 '+W+' '+H);treeSvg.style.width=Math.min(W,900)+'px';
    treeSvg.querySelectorAll('.eg').forEach(e=>e.remove());
    const eg=svgEl('g',{class:'eg'});treeSvg.prepend(eg);
    const pos=o=>[o.x*dx+dx/2,o.y*dy+26];
    L.edges.forEach(([a,b])=>{const [x1,y1]=pos(a),[x2,y2]=pos(b);const vis=!fr.tv||(fr.tv.includes(a.id)&&fr.tv.includes(b.id));eg.append(svgEl('line',{x1,y1,x2,y2,class:'ed',opacity:vis?1:.1}));});
    const keep=new Set();
    L.nodes.forEach(o=>{keep.add(o.key);let g=treeNodes.get(o.key);if(!g){g=svgEl('g',{class:'nd'});g.append(svgEl('circle',{r:17}),svgEl('text',{}));treeSvg.append(g);treeNodes.set(o.key,g);}
      const [x,y]=pos(o);g.style.transform='translate('+x+'px,'+y+'px)';g.querySelector('text').textContent=o.v;
      g.setAttribute('class','nd'+((fr.th||[]).includes(o.id)?' h':(fr.tg||[]).includes(o.id)?' g':'')+(fr.tv&&!fr.tv.includes(o.id)?' hide':''));});
    for(const [k,g] of treeNodes)if(!keep.has(k)){g.remove();treeNodes.delete(k);}
  }
  function renderGraph(fr){
    if(!spec.nodes){if(graphSvg)graphSvg.style.display='none';return;}
    const vb=spec.vb||[520,250];
    if(!graphSvg){graphSvg=svgEl('svg',{class:'gfx',viewBox:'0 0 '+vb[0]+' '+vb[1]});graphSvg.style.width=Math.min(vb[0],640)+'px';
      graphSvg.innerHTML='<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor" style="color:var(--mute)"/></marker></defs>';
      graphG={e:svgEl('g',{}),n:svgEl('g',{})};graphSvg.append(graphG.e,graphG.n);main.append(graphSvg);
      spec.edges.forEach(([a,b,w],ei)=>{const A=spec.nodes[a],B=spec.nodes[b];const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy)||1,r=spec.dir?20:0;
        const l=svgEl('line',{x1:A[0],y1:A[1],x2:B[0]-dx/d*r,y2:B[1]-dy/d*r,class:'ed','data-i':ei});if(spec.dir)l.setAttribute('marker-end','url(#ah)');graphG.e.append(l);
        if(w!=null){const t=svgEl('text',{x:(A[0]+B[0])/2,y:(A[1]+B[1])/2-6,class:'ew'});t.textContent=w;graphG.e.append(t);}});
      spec.nodes.forEach((n,ni)=>{const g=svgEl('g',{class:'nd','data-i':ni});g.style.transform='translate('+n[0]+'px,'+n[1]+'px)';g.append(svgEl('circle',{r:17}));const t=svgEl('text',{});t.textContent=n[2]!=null?n[2]:ni;g.append(t);const nl=svgEl('text',{class:'nl',y:-26});g.append(nl);graphG.n.append(g);});}
    graphSvg.style.display='';
    graphG.e.querySelectorAll('line').forEach(l=>{const ei=+l.getAttribute('data-i');l.setAttribute('class','ed'+((fr.ge||[]).includes(ei)?' h':'')+((fr.gb||[]).includes(ei)?' bad':''));});
    graphG.n.querySelectorAll('.nd').forEach(g=>{const ni=+g.getAttribute('data-i');g.setAttribute('class','nd'+((fr.gh||[]).includes(ni)?' h':(fr.gv||[]).includes(ni)?' v':''));g.querySelector('.nl').textContent=fr.gl&&fr.gl[ni]!=null?fr.gl[ni]:'';});
  }
  function renderAux(fr){
    const cur={};aux.innerHTML='';
    (fr.aux||[]).forEach(r=>{const label=String(r[0]);const items=r.slice(1).map(String);cur[label]=items;
      const row2=h('div','auxr','<b>'+E(label)+'</b>');items.forEach(t=>{const s=h('span',(prevAux[label]||[]).includes(t)?'':'nw',E(t));row2.append(s);});aux.append(row2);});
    prevAux=cur;
  }
  function show(k,quiet){
    i=Math.max(0,Math.min(frames.length-1,k));const fr=frames[i];
    renderRow(fr);renderGrid(fr);renderTree(fr);renderGraph(fr);renderAux(fr);
    const nn=h('div','note',E(fr.note||''));note.replaceWith(nn);note=nn;
    range.value=i;ct.textContent=(i+1)+' / '+frames.length;
    if(i>=frames.length-1&&timer)stop();
  }
  function play(){if(timer){stop();return;}if(i>=frames.length-1)show(0);playBtn.textContent='❚❚ Pause';timer=setInterval(()=>show(i+1),+sel.value);}
  function stop(){clearInterval(timer);timer=null;playBtn.textContent='▶ Play';}
  ctrl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.dataset.a)return;const a=b.dataset.a;stop();
    if(a==='first')show(0);else if(a==='prev')show(i-1);else if(a==='next')show(i+1);else if(a==='last')show(frames.length-1);else if(a==='play')play();});
  range.addEventListener('input',()=>{stop();show(+range.value);});
  st.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){stop();show(i+1);e.preventDefault();}else if(e.key==='ArrowLeft'){stop();show(i-1);e.preventDefault();}else if(e.key===' '){play();e.preventDefault();}});
  show(0);
  return {destroy(){stop();sel.destroy();},show,frames};
}

/* ---------- code ---------- */
function codeHTML(lines,lang){
  return lines.map(l=>'<div class="cl'+(l.k==='!'?' ok':l.k==='?'?' warn':'')+'"><span class="tx">'+(HL.line(l.t,lang)||' ')+'</span>'+(l.n?'<span class="nt">'+E(l.n)+'</span>':'')+'</div>').join('');
}

/* ---------- morph diff ---------- */
function morph(el,pb,po,lang){
  const A=HL.parse(pb),B=HL.parse(po),ops=HL.diff(A,B);let hunk=-1,prevS=true;const lines=[];const H=[];
  ops.forEach(([t,i,j])=>{
    if(t==='s'){prevS=true;lines.push({t:'s',l:A[i]});return;}
    if(prevS){hunk++;H.push({del:[],add:[]});prevS=false;}
    const l=t==='d'?A[i]:B[j];lines.push({t,l,hk:hunk});H[hunk][t==='d'?'del':'add'].push(l);});
  el.innerHTML='<div class="cbox"><div class="chead"><span><b>Variant 1 → Variant 2</b> · red lines leave, green lines arrive</span><span class="mcount"></span></div><div class="code diff"></div></div><div class="ctrl" style="margin-top:14px"><button class="play mnext" style="width:auto">Next change ▶</button><button class="mauto" style="width:auto;padding:0 14px;font-size:13px">Auto-play</button><button class="mreset" style="width:auto;padding:0 14px;font-size:13px">Reset</button></div><div class="note dnote"></div>';
  const box=$('.diff',el),nt=$('.dnote',el),cnt=$('.mcount',el);let s=0,tm=null;
  const cnts={};
  box.innerHTML=lines.map(x=>{const k=(x.t==='d'?'del':x.t==='a'?'add':'same');const idx=x.hk!=null?(cnts[x.hk]=(cnts[x.hk]||0)+1)-1:0;
    return '<div class="ln '+k+'"'+(x.hk!=null?' data-h="'+x.hk+'"':'')+' style="--d:'+(idx*0.12)+'s"><span class="sg">'+(x.t==='d'?'−':x.t==='a'?'+':' ')+'</span><span class="tx">'+(HL.line(x.l.t,lang)||' ')+'</span></div>';}).join('');
  function apply(){box.querySelectorAll('.ln[data-h]').forEach(e=>{const k=+e.dataset.h,on=k<s;if(e.classList.contains('del'))e.classList.toggle('gone',on);else e.classList.toggle('show',on);});
    cnt.textContent=s+' / '+H.length+' changes';
    if(s===0)nt.innerHTML='Variant 1 as written. Press <b>Next change</b> to watch it become the optimized version.';
    else{const g=H[s-1];const dn=g.del.map(l=>l.n).filter(Boolean).join(' · ');const an=g.add.map(l=>l.n).filter(Boolean).join(' · ');
      nt.innerHTML=(dn?'<b style="color:var(--red)">Before:</b> '+E(dn)+'<br>':'')+(an?'<b style="color:var(--acc)">After:</b> '+E(an):(dn?'':'Lines rearranged.'));}
  }
  const step=()=>{s=s>=H.length?0:s+1;apply();};
  $('.mnext',el).onclick=()=>{clearInterval(tm);step();};
  $('.mreset',el).onclick=()=>{clearInterval(tm);s=0;apply();};
  $('.mauto',el).onclick=()=>{clearInterval(tm);s=0;apply();tm=setInterval(()=>{if(s>=H.length){clearInterval(tm);return;}step();},1700);};
  apply();return {destroy(){clearInterval(tm);}};
}

/* ---------- complexity race ---------- */
const fmt=x=>x>=1e12?'10¹²+':x>=1e9?(x/1e9).toFixed(1)+'B':x>=1e6?(x/1e6).toFixed(1)+'M':x>=1e3?(x/1e3).toFixed(1)+'K':String(Math.round(x));
function race(el,p){
  el.innerHTML='<div class="nrow"><span>Input size n =</span><b class="mono nv">1,000</b><input type="range" min="1" max="5" step="0.1" value="3"><button class="btn small go">Run race ▶</button></div><div class="race"><div class="rbar a"><span>Variant 1<br><b class="mono">'+E(p.bt)+'</b></span><div class="tr"><div class="fl"></div></div><span class="v"></span></div><div class="rbar b"><span>Variant 2<br><b class="mono">'+E(p.ot)+'</b></span><div class="tr"><div class="fl"></div></div><span class="v"></span></div></div><p class="small" style="margin-top:12px">Bars use a log scale, every step to the right is 10× more work. Space: V1 '+E(p.bs)+' · V2 '+E(p.os)+'.</p>';
  const rg=$('input',el),nv=$('.nv',el),fl=[...el.querySelectorAll('.fl')],vs=[...el.querySelectorAll('.v')];
  function upd(anim){const n=Math.round(Math.pow(10,+rg.value));nv.textContent=n.toLocaleString();const a=HL.ops(p.bt,n),b=HL.ops(p.ot,n),mx=Math.max(a,b,10);
    [a,b].forEach((x,k)=>{const w=Math.max(2,Math.log10(1+x)/Math.log10(1+mx)*100);if(anim){fl[k].style.transition='none';fl[k].style.width='0%';void fl[k].offsetWidth;fl[k].style.transition='';}
      requestAnimationFrame(()=>{fl[k].style.width=w+'%';});vs[k].textContent=fmt(x)+' ops';});}
  rg.oninput=()=>upd(false);$('.go',el).onclick=()=>upd(true);upd(false);
}

window.Viz={mount,codeHTML,morph,race};
})();
