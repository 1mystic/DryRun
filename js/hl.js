/* hl.js — tiny syntax highlighter, annotation parser, line diff, complexity maths */
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
})();
