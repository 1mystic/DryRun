/* sims.js, pattern simulators. Each takes a spec and returns frames (or {frames, ...static structure}).
   Frame fields: a (cells; primitives or {k,v,c}), h/g/x (highlight/good/dim idx), p (pointers {name:idx}), w ([l,r] window),
   aux ([[label,...items]]), note, grid {v,c}, tree (level-order override), th/tg/tv (tree node ids: current/done/visible),
   gh/gv (graph nodes current/visited), ge/gb (edges accepted/rejected), gl ({node:label}). */
(function(){
const S={};
const cp=a=>a.map(x=>(x&&typeof x==='object')?{...x}:x);

S.hash=({arr,target})=>{const f=[],m={};const mp=()=>['seen {value→index}',...Object.entries(m).map(([k,v])=>k+'→'+v)];
  f.push({a:arr,aux:[mp()],note:`Goal: two numbers that add up to ${target}. Remember every number we pass in a map.`});
  for(let i=0;i<arr.length;i++){const need=target-arr[i];
    f.push({a:arr,p:{i},h:[i],aux:[mp()],note:`x = ${arr[i]}. We need ${target} − ${arr[i]} = ${need}. Is ${need} already in the map?`});
    if(need in m){f.push({a:arr,p:{i,j:m[need]},g:[i,m[need]],aux:[mp()],note:`Yes! ${need} sits at index ${m[need]} → answer [${m[need]}, ${i}].`});return f;}
    m[arr[i]]=i;f.push({a:arr,p:{i},h:[i],aux:[mp()],note:`Not there. Store ${arr[i]}→${i} and move on.`});}
  return f;};

S.twoPtr=({arr,target})=>{let L=0,R=arr.length-1;const f=[{a:arr,p:{L,R},note:`Sorted array. L starts at the smallest, R at the largest. Target = ${target}.`}];
  while(L<R){const s=arr[L]+arr[R];
    if(s===target){f.push({a:arr,p:{L,R},g:[L,R],note:`${arr[L]} + ${arr[R]} = ${s} ✓ found.`});break;}
    if(s<target){f.push({a:arr,p:{L,R},h:[L,R],note:`${arr[L]} + ${arr[R]} = ${s} < ${target}: too small → move L right to a bigger number.`});L++;}
    else{f.push({a:arr,p:{L,R},h:[L,R],note:`${arr[L]} + ${arr[R]} = ${s} > ${target}: too big → move R left to a smaller number.`});R--;}}
  return f;};

S.water=({arr})=>{let L=0,R=arr.length-1,best=0;const f=[];
  while(L<R){const w=R-L,h=Math.min(arr[L],arr[R]),a=w*h;best=Math.max(best,a);
    f.push({a:arr,p:{L,R},h:[L,R],w:[L,R],aux:[['area',`${w}×${h}=${a}`],['best',best]],note:`Width ${w}, height = min(${arr[L]},${arr[R]}) = ${h} → area ${a}. Move the SHORTER wall: only a taller one can improve things.`});
    if(arr[L]<arr[R])L++;else R--;}
  f.push({a:arr,aux:[['best',best]],note:`Pointers met. Best area = ${best}.`});return f;};

S.rain=({arr})=>{let l=0,r=arr.length-1,lm=0,rm=0,w=0;const f=[];
  const fr=(note)=>f.push({a:arr,p:{l,r},aux:[['left max',lm],['right max',rm],['water',w]],note});
  fr('Water above a bar = min(tallest on left, tallest on right) − bar. Walk two pointers inward, always from the lower side.');
  while(l<r){
    if(arr[l]<arr[r]){lm=Math.max(lm,arr[l]);w+=lm-arr[l];fr(`Left side is lower. Left max = ${lm}, so bar ${l} holds ${lm-arr[l]} water.`);l++;}
    else{rm=Math.max(rm,arr[r]);w+=rm-arr[r];fr(`Right side is lower. Right max = ${rm}, so bar ${r} holds ${rm-arr[r]} water.`);r--;}}
  f.push({a:arr,aux:[['total water',w]],note:`Done: ${w} units trapped.`});return f;};

S.window=({s})=>{const a=[...s],f=[];let l=0,best=0;const set=new Set();
  const A=()=>[['window set',...set],['best',best]];
  f.push({a,aux:A(),note:'Grow a window [l..r]. Whenever a letter repeats, shrink from the left until it is unique again.'});
  for(let r=0;r<a.length;r++){
    while(set.has(a[r])){f.push({a,p:{l,r},w:[l,r-1],x:[r],aux:A(),note:`'${a[r]}' is already inside → drop '${a[l]}' from the left.`});set.delete(a[l]);l++;}
    set.add(a[r]);best=Math.max(best,r-l+1);
    f.push({a,p:{l,r},w:[l,r],g:[r],aux:A(),note:`Add '${a[r]}'. Window size ${r-l+1}, best so far ${best}.`});}
  return f;};

S.swmax=({arr,k})=>{const dq=[],out=[],f=[];
  const A=()=>[['deque (idx→val)',...dq.map(i=>i+'→'+arr[i])],['answers',...out]];
  f.push({a:arr,aux:A(),note:`Keep a deque of indices whose values are DECREASING. The front is always the max of the window (size ${k}).`});
  for(let i=0;i<arr.length;i++){
    while(dq.length&&arr[dq[dq.length-1]]<=arr[i]){const d=dq.pop();f.push({a:arr,p:{i},w:[Math.max(0,i-k+1),i],x:[d],aux:A(),note:`${arr[i]} ≥ ${arr[d]}: ${arr[d]} can never be a max again → pop it from the back.`});}
    dq.push(i);if(dq[0]<=i-k)dq.shift();
    if(i>=k-1)out.push(arr[dq[0]]);
    f.push({a:arr,p:{i},w:[Math.max(0,i-k+1),i],h:[dq[0]],aux:A(),note:i>=k-1?`Window [${i-k+1}..${i}] → max is ${arr[dq[0]]} (front of deque).`:`Window still filling.`});}
  return f;};

S.minwin=({s,t})=>{const a=[...s],need={};for(const c of t)need[c]=(need[c]||0)+1;let miss=t.length,l=0,bl=-1,br=-1;const f=[];
  const A=()=>[['still missing',miss],['best',bl<0?'-':s.slice(bl,br+1)]];
  f.push({a,aux:A(),note:`Need all letters of "${t}". Expand r until the window is valid, then shrink l as far as possible.`});
  for(let r=0;r<a.length;r++){
    if(need[a[r]]>0)miss--;need[a[r]]=(need[a[r]]||0)-1;
    f.push({a,p:{l,r},w:[l,r],aux:A(),note:`Add '${a[r]}'${miss===0?' → window is valid!':'.'}`});
    if(miss===0){
      while(need[a[l]]<0){need[a[l]]++;l++;}
      if(bl<0||r-l<br-bl){bl=l;br=r;}
      f.push({a,p:{l,r},w:[l,r],g:Array.from({length:r-l+1},(_,i)=>l+i),aux:A(),note:`Shrink from the left while letters are spare → tightest window "${s.slice(l,r+1)}".`});
      need[a[l]]++;miss++;l++;}}
  return f;};

S.bsearch=({arr,target})=>{let lo=0,hi=arr.length-1;const f=[{a:arr,p:{lo,hi},w:[lo,hi],note:`Sorted array → halve the search space each step. Looking for ${target}.`}];
  while(lo<=hi){const mid=(lo+hi)>>1;
    if(arr[mid]===target){f.push({a:arr,p:{lo,mid,hi},w:[lo,hi],g:[mid],note:`arr[${mid}] = ${arr[mid]} = target ✓ found at index ${mid}.`});return f;}
    if(arr[mid]<target){f.push({a:arr,p:{lo,mid,hi},w:[lo,hi],h:[mid],note:`arr[${mid}] = ${arr[mid]} < ${target} → everything left of mid is too small. lo = ${mid+1}.`});lo=mid+1;}
    else{f.push({a:arr,p:{lo,mid,hi},w:[lo,hi],h:[mid],note:`arr[${mid}] = ${arr[mid]} > ${target} → everything right of mid is too big. hi = ${mid-1}.`});hi=mid-1;}}
  f.push({a:arr,note:'Search space is empty → not found (-1).'});return f;};

// binary search on the answer: smallest m in [lo,hi] with ok(m) true
S.bsAns=({lo,hi,ok,goal,unit})=>{const vals=Array.from({length:hi-lo+1},(_,i)=>lo+i),f=[];let L=lo,R=hi;
  f.push({a:vals,p:{lo:0,hi:vals.length-1},w:[0,vals.length-1],note:`Search the ANSWER space ${lo}..${hi}. ${goal||'Find the smallest value that works.'}`});
  while(L<R){const m=(L+R)>>1,good=ok(m);
    f.push({a:vals,p:{lo:L-lo,mid:m-lo,hi:R-lo},w:[L-lo,R-lo],h:[m-lo],aux:[['feasible?',`${m}${unit||''} → ${good?'YES':'no'}`]],note:good?`${m} works → try smaller: hi = ${m}.`:`${m} is not enough → lo = ${m+1}.`});
    if(good)R=m;else L=m+1;}
  f.push({a:vals,g:[L-lo],p:{ans:L-lo},note:`lo == hi → answer = ${L}.`});return f;};

S.stackMono=({arr})=>{const st=[],res=arr.map(()=>0),f=[];
  const A=()=>[['stack (idx)',...st],['answer',...res]];
  f.push({a:arr,aux:A(),note:'Keep a stack of days still waiting for a warmer day (decreasing temps).'});
  for(let i=0;i<arr.length;i++){
    while(st.length&&arr[st[st.length-1]]<arr[i]){const j=st.pop();res[j]=i-j;f.push({a:arr,p:{i},g:[j],h:[i],aux:A(),note:`${arr[i]} > ${arr[j]}: day ${j} waited ${i-j} day(s). Pop it.`});}
    st.push(i);f.push({a:arr,p:{i},h:[i],aux:A(),note:`Push day ${i} (${arr[i]}), it now waits.`});}
  return f;};

S.parens=({s})=>{const a=[...s],st=[],f=[],pair={')':'(',']':'[','}':'{'};
  f.push({a,aux:[['stack']],note:'Every closer must match the most recent unmatched opener → a stack.'});
  for(let i=0;i<a.length;i++){const c=a[i];
    if(pair[c]){if(st[st.length-1]===pair[c]){st.pop();f.push({a,p:{i},g:[i],aux:[['stack',...st]],note:`'${c}' matches top '${pair[c]}' → pop.`});}
      else{f.push({a,p:{i},x:[i],aux:[['stack',...st]],note:`'${c}' does not match the top → invalid.`});return f;}}
    else{st.push(c);f.push({a,p:{i},h:[i],aux:[['stack',...st]],note:`Opener '${c}' → push.`});}}
  f.push({a,aux:[['stack',...st]],note:st.length?'Leftover openers → invalid.':'Stack empty → valid ✓'});return f;};

S.hist=({arr})=>{const h=[...arr,0],st=[],f=[];let best=0;const A=()=>[['stack (idx)',...st],['best area',best]];
  f.push({a:arr,aux:A(),note:'Stack of increasing bars. A shorter bar arriving "closes" taller bars: pop them and measure their rectangles.'});
  for(let i=0;i<h.length;i++){
    while(st.length&&h[st[st.length-1]]>=h[i]){const top=st.pop(),H=h[top],L=st.length?st[st.length-1]+1:0,area=H*(i-L);best=Math.max(best,area);
      f.push({a:arr,p:{i:Math.min(i,arr.length-1)},w:[L,i-1],g:[top],aux:A(),note:`Bar ${H} is closed by ${h[i]}. It stretched over ${i-L} bars → area ${H}×${i-L} = ${area}.`});}
    st.push(i);if(i<arr.length)f.push({a:arr,p:{i},h:[i],aux:A(),note:`Push bar ${i} (height ${arr[i]}).`});}
  f.push({a:arr,aux:[['best area',best]],note:`Largest rectangle = ${best}.`});return f;};

// 1-D DP. spec: n, init[], f(dp,i), deps(i), rule, top (optional labels)
S.dp1=v=>{const dp=[...v.init],f=[];const A=(cur,d)=>({a:Array.from({length:v.n},(_,i)=>i<dp.length?(dp[i]===true?'T':dp[i]===false?'F':dp[i]):'?'),...(cur!=null?{h:[cur],g:d}:{})});
  f.push({...A(),note:v.start||'Base cases are filled in. Every other cell is built from earlier cells.'});
  for(let i=v.init.length;i<v.n;i++){const d=v.deps?v.deps(i):[];const val=v.f(dp,i);dp[i]=val;f.push({...A(i,d),note:`${v.rule} → ${val===true?'T':val===false?'F':val}`});}
  f.push({...A(),...(v.end?{}:{g:[v.n-1]}),note:v.end||`Answer = last cell = ${dp[v.n-1]}.`});return f;};

S.dp2=v=>{const R=v.R,C=v.C,dp=Array.from({length:R},()=>Array(C).fill(null)),f=[];
  const show=x=>x==null?'':x===true?'T':x===false?'F':String(x);
  const snap=(cur,d)=>({grid:{v:dp.map(r=>r.map(show)),c:dp.map((r,i)=>r.map((x,j)=>cur&&cur[0]===i&&cur[1]===j?'on':(d||[]).some(q=>q[0]===i&&q[1]===j)?'dep':x!=null?'done':''))}});
  for(let i=0;i<R;i++)for(let j=0;j<C;j++){const b=v.init&&v.init(i,j);if(b!==undefined)dp[i][j]=b;}
  f.push({...snap(),note:v.start||'Base cases first (edges of the table).'});
  const cells=v.order?v.order():[].concat(...Array.from({length:R},(_,i)=>Array.from({length:C},(_,j)=>[i,j])));
  for(const [i,j] of cells){if(dp[i][j]!=null)continue;const d=v.deps(i,j),val=v.f(dp,i,j);dp[i][j]=val;f.push({...snap([i,j],d),note:`${v.rule(i,j)} → ${show(val)}`});}
  const [ri,rj]=v.ans||[R-1,C-1];f.push({...snap(),note:`Answer = dp[${ri}][${rj}] = ${show(dp[ri][rj])}.`});return f;};

S.flood=({grid})=>{const g=grid.map(r=>[...r]),R=g.length,C=g[0].length,seen=g.map(r=>r.map(()=>0)),f=[];let id=0;
  const snap=cur=>({grid:{v:g.map(r=>r.map(x=>x==='1'?'▲':'~')),c:g.map((r,i)=>r.map((x,j)=>cur&&cur[0]===i&&cur[1]===j?'on':seen[i][j]?'i'+((seen[i][j]-1)%4+1):x==='0'?'dim':''))}});
  f.push({...snap(),aux:[['islands',0]],note:'Scan every cell. The first time we touch unvisited land, count an island and flood-fill it so we never count it twice.'});
  for(let i=0;i<R;i++)for(let j=0;j<C;j++){
    if(g[i][j]==='1'&&!seen[i][j]){id++;f.push({...snap([i,j]),aux:[['islands',id]],note:`New land at (${i},${j}) → island #${id}. Flood-fill its neighbours.`});
      const st=[[i,j]];seen[i][j]=id;
      while(st.length){const [r,c]=st.pop();for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nc>=0&&nr<R&&nc<C&&g[nr][nc]==='1'&&!seen[nr][nc]){seen[nr][nc]=id;st.push([nr,nc]);}}}
      f.push({...snap(),aux:[['islands',id]],note:`Island #${id} fully marked.`});}}
  f.push({...snap(),aux:[['islands',id]],note:`Total islands = ${id}.`});return f;};

// level-order array → nested {id,v,c:[l,r]}
function buildTree(arr){if(!arr.length||arr[0]==null)return null;const nodes=arr.map((v,i)=>v==null?null:{id:i,v,c:[null,null]});
  const q=[0];let j=1;while(q.length&&j<arr.length){const i=q.shift();for(let s=0;s<2;s++){if(j<arr.length){if(nodes[j]){nodes[i].c[s]=nodes[j];q.push(j);}j++;}}}return nodes[0];}

S.treeOrder=({tree,order})=>{const root=buildTree(tree),seq=[],f=[];
  const lvl=[];if(order==='level'){const q=[root];while(q.length){const n=q.shift();lvl.push(n);n.c.forEach(c=>c&&q.push(c));}seq.push(...lvl);}
  else{const go=n=>{if(!n)return;if(order==='pre')seq.push(n);go(n.c[0]);if(order==='in')seq.push(n);go(n.c[1]);if(order==='post')seq.push(n);};go(root);}
  const nm={pre:'Preorder: node → left → right',in:'Inorder: left → node → right',post:'Postorder: left → right → node',level:'Level order: row by row using a queue'}[order];
  f.push({aux:[['visited']],tg:[],note:nm+'.'});
  seq.forEach((n,i)=>f.push({th:[n.id],tg:seq.slice(0,i).map(x=>x.id),aux:[['visited',...seq.slice(0,i+1).map(x=>x.v)]],note:`Visit ${n.v}.`}));
  f.push({tg:seq.map(x=>x.id),aux:[['result',...seq.map(x=>x.v)]],note:'Traversal complete.'});return f;};

S.graph=v=>{const adj={};v.nodes.forEach((_,i)=>adj[i]=[]);v.edges.forEach(([a,b])=>{adj[a].push(b);if(!v.dir)adj[b].push(a);});
  const bfs=v.mode!=='dfs',vis=[],f=[],lab=bfs?'queue':'stack';let q=[v.start];const seen=new Set(bfs?[v.start]:[]);
  f.push({gh:[v.start],gv:[],aux:[[lab,...q]],note:`Start at ${v.start}. ${bfs?'BFS uses a queue: explore level by level.':'DFS uses a stack: go as deep as possible first.'}`});
  while(q.length){const cur=bfs?q.shift():q.pop();if(!bfs){if(seen.has(cur))continue;seen.add(cur);}
    vis.push(cur);const nb=adj[cur].filter(n=>bfs?!seen.has(n):!seen.has(n));
    if(bfs)nb.forEach(n=>seen.add(n));q.push(...(bfs?nb:[...nb].reverse()));
    f.push({gh:[cur],gv:[...vis],aux:[[lab,...q],['visited',...vis]],note:`Visit ${cur}. ${nb.length?'Add neighbours '+nb.join(', ')+'.':'No new neighbours.'}`});}
  f.push({gv:[...vis],aux:[['visit order',...vis]],note:'Everything reachable has been visited.'});return f;};

S.topo=v=>{const n=v.nodes.length,indeg=Array(n).fill(0),adj=Array.from({length:n},()=>[]);v.edges.forEach(([a,b])=>{adj[a].push(b);indeg[b]++;});
  const q=[];indeg.forEach((d,i)=>d===0&&q.push(i));const order=[],f=[];const A=()=>[['in-degree',...indeg.map((d,i)=>i+':'+d)],['ready',...q],['order',...order]];
  f.push({gh:[],gv:[],aux:A(),note:'Edge a→b means "a must come first". Nodes with in-degree 0 have no prerequisites left → they are ready.'});
  while(q.length){const c=q.shift();order.push(c);const es=[];v.edges.forEach(([a,b],ei)=>{if(a===c){indeg[b]--;es.push(ei);if(indeg[b]===0)q.push(b);}});
    f.push({gh:[c],gv:[...order],ge:es,aux:A(),note:`Take ${c}. Remove its outgoing edges, lowering the in-degree of its dependents.`});}
  f.push({gv:[...order],aux:A(),note:order.length===n?'All nodes ordered → no cycle, a valid schedule exists.':'Some nodes never became ready → there is a cycle.'});return f;};

S.dijkstra=v=>{const n=v.nodes.length,d=Array(n).fill(Infinity),done=new Set(),f=[];d[v.start]=0;
  const L=()=>{const o={};d.forEach((x,i)=>o[i]=x===Infinity?'∞':x);return o;};
  f.push({gh:[v.start],gv:[],gl:L(),note:`Dijkstra: always finalise the unvisited node with the smallest known distance. dist[${v.start}] = 0.`});
  for(let k=0;k<n;k++){let u=-1;for(let i=0;i<n;i++)if(!done.has(i)&&d[i]<Infinity&&(u<0||d[i]<d[u]))u=i;if(u<0)break;done.add(u);const es=[];
    v.edges.forEach(([a,b,w],ei)=>{const x=v.dir?[[a,b]]:[[a,b],[b,a]];x.forEach(([p,q])=>{if(p===u&&!done.has(q)&&d[u]+w<d[q]){d[q]=d[u]+w;es.push(ei);}});});
    f.push({gh:[u],gv:[...done],ge:es,gl:L(),note:`Finalise ${u} (dist ${d[u]}). Relax its edges${es.length?': shorter routes found.':', nothing improved.'}`});}
  f.push({gv:[...done],gl:L(),note:`Done. Answer = ${v.answer!==undefined?v.answer:Math.max(...d)}.`});return f;};

S.bellman=v=>{const n=v.nodes.length;let d=Array(n).fill(Infinity);d[v.src]=0;const f=[];const L=a=>{const o={};a.forEach((x,i)=>o[i]=x===Infinity?'∞':x);return o;};
  f.push({gh:[v.src],gl:L(d),note:`At most ${v.k} stop(s) = ${v.k+1} flights. Each round allows ONE more flight, relaxing edges from the PREVIOUS round's prices.`});
  for(let r=0;r<=v.k;r++){const nd=[...d],es=[];v.edges.forEach(([a,b,w],ei)=>{if(d[a]<Infinity&&d[a]+w<nd[b]){nd[b]=d[a]+w;es.push(ei);}});d=nd;
    f.push({ge:es,gl:L(d),gh:[v.dst],aux:[['round',r+1]],note:`Round ${r+1}: cheapest price using ≤ ${r+1} flight(s). ${es.length?'Improved '+es.length+' route(s).':'No change.'}`});}
  f.push({gh:[v.dst],gl:L(d),note:`Cheapest to ${v.dst} = ${d[v.dst]===Infinity?-1:d[v.dst]}.`});return f;};

S.uf=v=>{const n=v.nodes.length,p=[...Array(n).keys()],find=x=>p[x]===x?x:(p[x]=find(p[x])),f=[],acc=[],rej=[];
  let order=v.edges.map((e,i)=>i);if(v.mode==='mst')order.sort((a,b)=>v.edges[a][2]-v.edges[b][2]);
  const comps=()=>{const m={};for(let i=0;i<n;i++){(m[find(i)]=m[find(i)]||[]).push(i);}return Object.values(m).map(c=>'{'+c.join(',')+'}');};
  f.push({ge:[],gb:[],aux:[['components',...comps()]],note:v.mode==='mst'?'Kruskal: take the cheapest edges first, skip any edge that closes a cycle (union-find tells us).':'Add edges one by one. An edge whose ends are already connected is the redundant one.'});
  for(const ei of order){const [a,b,w]=v.edges[ei],ra=find(a),rb=find(b);
    if(ra===rb){rej.push(ei);f.push({ge:[...acc],gb:[...rej],gh:[a,b],aux:[['components',...comps()]],note:`Edge ${a}-${b}${w!=null?' (cost '+w+')':''}: already connected → skip (it would form a cycle).`});if(v.mode!=='mst')return f;}
    else{p[ra]=rb;acc.push(ei);f.push({ge:[...acc],gb:[...rej],gh:[a,b],aux:[['components',...comps()]],note:`Edge ${a}-${b}${w!=null?' (cost '+w+')':''}: joins two components → keep.`});}}
  f.push({ge:[...acc],gb:[...rej],aux:[['components',...comps()]],note:v.mode==='mst'?`Tree complete. Total cost = ${acc.reduce((s,e)=>s+v.edges[e][2],0)}.`:'No redundant edge.'});return f;};

S.heapk=({arr,k})=>{const h=[],f=[];const A=()=>[['min-heap (size ≤ '+k+')',...[...h].sort((a,b)=>a-b)]];
  f.push({a:arr,aux:A(),note:`Keep the ${k} largest seen so far in a MIN-heap: its root is the smallest of the winners, so it is the one to evict.`});
  arr.forEach((x,i)=>{h.push(x);let note=`Push ${x}.`;if(h.length>k){const mn=Math.min(...h);h.splice(h.indexOf(mn),1);note+=` Heap too big → pop smallest (${mn}).`;}
    f.push({a:arr,p:{i},h:[i],aux:A(),note});});
  f.push({a:arr,aux:A(),note:`Root of the heap = ${Math.min(...h)} = ${k}th largest.`});return f;};

S.dutch=({arr})=>{const a=arr.map((v,k)=>({k,v,c:'c'+v}));let lo=0,mid=0,hi=a.length-1;const f=[];
  const fr=(note,h)=>f.push({a:cp(a),p:{lo,mid,hi},h:h||[Math.min(mid,a.length-1)],note});
  fr('Three zones: left of lo = 0s, right of hi = 2s, mid scans the unknown middle.');
  while(mid<=hi){const v=a[mid].v;
    if(v===0){[a[lo],a[mid]]=[a[mid],a[lo]];lo++;mid++;fr('0 → swap into the left zone, advance lo and mid.',[lo-1]);}
    else if(v===1){mid++;fr('1 is already in the middle zone → mid++');}
    else{[a[mid],a[hi]]=[a[hi],a[mid]];hi--;fr('2 → swap into the right zone, hi--. Do not advance mid: the swapped-in value is unchecked.',[mid]);}}
  f.push({a:cp(a),g:a.map((_,i)=>i),note:'Sorted in one pass, in place.'});return f;};

S.qselect=({arr,k})=>{const a=arr.map((v,key)=>({k:key,v})),n=a.length,t=n-k,f=[],done=[];let l=0,r=n-1;
  const fr=(note,p,h)=>f.push({a:cp(a),p,h:h||[],g:[...done],w:[l,r],note});
  fr(`The ${k}th largest sits at index ${t} of the sorted array. Partition around a pivot and only recurse into the side that contains index ${t}.`,{});
  while(l<=r){const pv=a[r].v;let i=l;fr(`Pivot = ${pv} (last item of the range). i = next slot for "smaller than pivot".`,{i,j:l},[r]);
    for(let j=l;j<r;j++){if(a[j].v<pv){[a[i],a[j]]=[a[j],a[i]];i++;fr(`${a[i-1].v} < ${pv} → swap into the small zone.`,{i,j},[r]);}}
    [a[i],a[r]]=[a[r],a[i]];done.push(i);fr(`Pivot ${pv} lands at its final index ${i}.`,{i},[i]);
    if(i===t){f.push({a:cp(a),g:[i],note:`Index ${t} reached → the ${k}th largest is ${a[i].v}. Average O(n): we only touched one side each time.`});return f;}
    if(i<t)l=i+1;else r=i-1;}
  return f;};

S.intervals=({iv})=>{const s=[...iv].sort((a,b)=>a[0]-b[0]),t=x=>`[${x[0]},${x[1]}]`,out=[],f=[];
  f.push({a:iv.map(t),note:'Intervals arrive unsorted.'});
  f.push({a:s.map(t),note:'Step 1: sort by start. Now any overlap must be with the PREVIOUS merged interval.'});
  for(let i=0;i<s.length;i++){const cur=s[i];
    if(out.length&&cur[0]<=out[out.length-1][1]){const last=out[out.length-1];last[1]=Math.max(last[1],cur[1]);f.push({a:s.map(t),p:{i},h:[i],aux:[['merged',...out.map(t)]],note:`${t(cur)} starts before the last merged interval ends → extend its end to ${last[1]}.`});}
    else{out.push([...cur]);f.push({a:s.map(t),p:{i},h:[i],aux:[['merged',...out.map(t)]],note:`${t(cur)} does not overlap → start a new merged interval.`});}}
  return f;};

S.llrev=({a})=>{const n=a.length,ar=Array(n-1).fill('r'),f=[];let prev=-1,cur=0;
  const fr=(note,p,h)=>f.push({a,ar:[...ar],p,h:h||[],note});
  fr('Walk the list; flip each node\'s arrow to point at the node BEHIND it. prev starts at null (left of the list).',{prev:-1,cur:0});
  while(cur<n){const nx=cur+1;fr(`Save next = ${nx<n?a[nx]:'null'} before we overwrite cur.next.`,{prev,cur,next:nx},[cur]);
    if(cur>=1)ar[cur-1]='l';if(cur<n-1)ar[cur]='n';
    fr(`Point ${a[cur]} back at prev (${prev>=0?a[prev]:'null'}). Then slide prev and cur one step forward.`,{prev,cur,next:nx},[cur]);prev=cur;cur=nx;}
  fr(`cur fell off the end; prev (${a[n-1]}) is the new head.`,{head:n-1},[]);return {frames:f,ll:true};};

S.llcycle=({a,pos})=>{const n=a.length,nx=i=>i===n-1?pos:i+1,f=[];let s=0,fa=0;
  f.push({a,p:{slow:0,fast:0},note:`Tail links back to node ${a[pos]}. Tortoise moves 1 step, hare moves 2. In a loop the hare must lap the tortoise.`});
  for(let i=0;i<12;i++){s=nx(s);fa=nx(nx(fa));
    if(s===fa){f.push({a,p:{'slow=fast':s},g:[s],note:`They meet at ${a[s]} → a cycle exists.`});break;}
    f.push({a,p:{slow:s,fast:fa},h:[s,fa],note:`slow → ${a[s]}, fast → ${a[fa]}.`});}
  return {frames:f,ll:true,back:[n-1,pos]};};

S.merge2=({a,b})=>{const out=[],f=[];let i=0,j=0;const A=()=>[['list1',...a.slice(i)],['list2',...b.slice(j)],['merged',...out]];
  f.push({aux:A(),note:'Two sorted lists. Compare the heads, always take the smaller one.'});
  while(i<a.length&&j<b.length){if(a[i]<=b[j]){out.push(a[i]);f.push({aux:A(),note:`${a[i]} ≤ ${b[j]} → take ${a[i]} from list1.`});i++;}else{out.push(b[j]);f.push({aux:A(),note:`${b[j]} < ${a[i]} → take ${b[j]} from list2.`});j++;}}
  out.push(...a.slice(i),...b.slice(j));i=a.length;j=b.length;f.push({aux:A(),note:'One list is empty → attach the rest of the other (no more comparing needed).'});return f;};

S.mergek=({lists})=>{const idx=lists.map(()=>0),out=[],f=[];const A=()=>[...lists.map((l,i)=>['list '+(i+1),...l.slice(idx[i])]),['output',...out]];
  f.push({aux:A(),note:'Keep a min-heap holding ONE head from each list. The smallest head is the next output.'});
  for(;;){let b=-1;lists.forEach((l,i)=>{if(idx[i]<l.length&&(b<0||l[idx[i]]<lists[b][idx[b]]))b=i;});if(b<0)break;
    out.push(lists[b][idx[b]]);idx[b]++;f.push({aux:A(),note:`Smallest head is ${out[out.length-1]} (list ${b+1}) → output it and push that list's next item into the heap.`});}
  return f;};

S.trie=({words,query})=>{let id=0;const root={id:id++,v:'∘',c:[]};const path={};
  for(const w of words){let n=root;const p=[0];for(const ch of w){let c=n.c.find(x=>x.v===ch);if(!c){c={id:id++,v:ch,c:[]};n.c.push(c);}n=c;p.push(n.id);}n.end=true;path[w]=p;}
  const vis=new Set([0]),ends=[],f=[];const ev=[];(function z(n){if(n.end)ev.push(n.id);n.c.forEach(z);})(root);
  f.push({tv:[...vis],th:[0],note:'A trie stores words letter by letter; shared prefixes share nodes.'});
  for(const w of words){path[w].forEach(i=>vis.add(i));const e=path[w][path[w].length-1];ends.push(e);f.push({tv:[...vis],th:path[w],tg:[...ends],note:`Insert "${w}": follow existing letters, create missing ones, mark the last node as a word end.`});}
  if(query){const pre=[0];let n=root,ok=true;for(const ch of query){const c=n.c.find(x=>x.v===ch);if(!c){ok=false;break;}n=c;pre.push(n.id);}
    f.push({tv:[...vis],th:pre,tg:[...ends],note:ok?`Prefix "${query}" exists after ${query.length} steps, cost depends only on its length, not on how many words are stored.`:`"${query}" falls off the trie → no such prefix.`});}
  return {frames:f,trie:root};};

// backtracking tree. spec: expand(path)->child paths, label(path), good(path), dead(path), max
S.bt=v=>{let id=0;const nodes=[],max=v.max||40;
  const mk=p=>({id:id++,v:v.label(p),p,c:[]});
  const root=mk(v.start||[]);const build=n=>{nodes.push(n);if(v.dead&&v.dead(n.p))return;if(id>=max)return;for(const q of v.expand(n.p)){if(id>=max)break;const c=mk(q);n.c.push(c);build(c);}};build(root);
  const f=[],vis=new Set(),goods=[],deads=[];
  f.push({tv:[0],th:[0],note:v.start_note||'Backtracking explores a tree of choices: choose → explore → un-choose. Each node is a partial answer.'});
  nodes.forEach(n=>{vis.add(n.id);const g=v.good&&v.good(n.p),d=v.dead&&v.dead(n.p);if(g)goods.push(n.id);
    f.push({tv:[...vis],th:[n.id],tg:[...goods],note:g?`${n.v} is a complete answer ✓, record it.`:d?`${n.v} breaks the rule → prune: do not explore below it.`:`Partial: ${n.v}. Try the next choices from here.`});});
  f.push({tv:[...vis],tg:[...goods],note:`Finished: ${goods.length} answer(s) found.`});return {frames:f,trie:root};};

window.SIMS={S,buildTree,run(spec){
  if(spec.flow)return Object.assign({},spec,{frames:spec.flow});
  const fn=S[spec.sim];if(!fn)throw new Error('unknown sim '+spec.sim);
  const r=fn(spec);return Array.isArray(r)?Object.assign({},spec,{frames:r}):Object.assign({},spec,r);}};
})();
