// node tools/smoke.js — loads index.html in jsdom, visits every route, steps every animation to the end, exercises morph/race/tabs/Anki/dialog
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
html=html.replace(/<script src="[^"]+"><\/script>/g,'').replace(/<link[^>]+googleapis[^>]*>/g,'');
const errs=[];const vc=new VirtualConsole();
vc.on('jsdomError',e=>errs.push('jsdomError: '+(e.detail&&e.detail.stack||e.message)));
vc.on('error',e=>errs.push('console.error: '+e));
const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window;
w.HTMLCanvasElement.prototype.getContext=()=>null;
w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};
w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
w.matchMedia=w.matchMedia||(()=>({matches:false,addListener(){},removeListener(){},addEventListener(){}}));
w.URL.createObjectURL=()=>'blob:x';
w.addEventListener('error',e=>errs.push('window error: '+e.message));
w.addEventListener('unhandledrejection',e=>errs.push('rejection: '+e.reason));
for(const s of scripts){try{w.eval(fs.readFileSync(path.join(root,s),'utf8')+'\n//# sourceURL='+s);}catch(e){errs.push('load '+s+': '+e.stack.split('\n').slice(0,3).join(' | '));}}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
const $=(s,r=w.document)=>r.querySelector(s),$$=(s,r=w.document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let checks=0,fails=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m);}};
const go=async h=>{w.location.hash=h;w.DRAPP.route();await sleep(0);};
(async()=>{
 // boot may not have run if script order made DRAPP boot already; make sure home is rendered
 ok(!!w.DRAPP,'DRAPP exists');
 await go('#/');
 ok($('#v-home')&&!$('#v-home').hidden,'home visible');
 ok($$('#trackgrid > *').length===8,'8 track cards on home, got '+$$('#trackgrid > *').length);
 ok($$('#ticker *').length>0,'ticker filled');
 ok($$('#feat1 > *').length>0&&$$('#feat2 > *').length>0,'feature cards');
 ok($$('#prov > *').length>0,'providers section filled');
 // URL form routing
 $('#url').value='https://leetcode.com/problems/two-sum/description/';$('#urlform').dispatchEvent(new w.Event('submit',{cancelable:true}));await sleep(10);w.DRAPP.route();
 ok(w.location.hash==='#/p/two-sum','url → library problem, got '+w.location.hash);
 $('#url').value='https://leetcode.com/problems/some-new-problem/';$('#urlform').dispatchEvent(new w.Event('submit',{cancelable:true}));w.DRAPP.route();await sleep(10);
 ok(w.location.hash==='#/gen/some-new-problem','unknown → gen, got '+w.location.hash);
 ok(!$('#v-gen').hidden&&/No AI provider|Add an AI provider/.test($('#v-gen').textContent),'gen view asks for a key');
 // tracks
 for(const T of w.DR.T){await go('#/t/'+T.id);const rows=$$('#rows .row');ok(rows.length===25,T.id+' shows 25 rows, got '+rows.length);
   $('#q').value='zzzz';$('#q').oninput();ok($$('#rows .row').length===0,T.id+' filter empties');$('#q').value='';$('#q').oninput();
   const tsv=w.Anki.tsv(T.ids.map(i=>w.DR.P[i]));ok(tsv.split('\n').filter(Boolean).length>=50,T.id+' anki rows '+tsv.split('\n').length);}
 // problems
 let n=0;
 for(const id of Object.keys(w.DR.P)){
   const p=w.DR.P[id];const T=w.DR.T.find(t=>t.ids.includes(id));
   await go('#/p/'+id+(T?'?t='+T.id:''));n++;
   const v=$('#v-problem');ok(!v.hidden,id+' visible');
   ok($$('.cell',v).length>0||$$('.grid',v).length>0||$('svg',v)||$('.stage',v),id+' stage rendered');
   // step viz to last frame
   const last=$('[data-a=last]',v);ok(!!last,id+' has controls');if(last){last.click();const nb=$('[data-a=prev]',v);nb&&nb.click();$('[data-a=next]',v).click();$('[data-a=first]',v).click();for(let k=0;k<40;k++)$('[data-a=next]',v).click();}
   // tabs
   const tabs=$$('.tab',v);tabs[1].click();ok(/Variant 2/.test($('#codebox',v).textContent),id+' tab 2');ok($$('.cl',$('#codebox',v)).length>=3,id+' code lines rendered');
   ok($$('.cl.ok',$('#codebox',v)).length>=1,id+' variant 2 has green key lines');tabs[0].click();
   ok($$('.cl.warn',$('#codebox',v)).length>=1,id+' variant 1 has red slow lines');
   // morph
   const mn=$('.mnext',v);ok(!!mn,id+' morph control');if(mn){for(let k=0;k<30;k++)mn.click();$('.mreset',v).click();}
   ok($$('#race .bar, #race [class*=bar]',v).length>=0&&$('#race',v).children.length>0,id+' race rendered');
   ok(v.textContent.includes(p.t),id+' title');
 }
 console.log('visited',n,'problems');
 // done toggle & Anki single
 await go('#/p/two-sum?t=ds');$('#mk-done').click();ok(JSON.parse(w.localStorage.getItem('dr-done')||'{}')['two-sum']===1,'done saved');
 // mine
 await go('#/mine');ok(!$('#v-mine').hidden,'mine view');
 // data view: progress, backup, anki help
 await go('#/data');ok(!$('#v-data').hidden,'data view');
 ok($$('#v-data .dbars .rbar').length>=9,'data progress bars '+$$('#v-data .dbars .rbar').length);
 ok($('#d-exp')&&$('#d-imp')&&$('#d-wipe'),'backup controls');
 w.HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute('download'))return;};$('#d-exp').click();ok(/Backup exported/.test($('#d-st').textContent),'export writes status');
 ok($('a[href="#/data"]'),'footer data link');
 await go('#/anki');ok(!$('#v-anki').hidden,'anki guide');
 ok(/webCorsOriginList/.test($('#v-anki').textContent),'cors step shown');
 ok(/1mystic\.github\.io/.test($('#v-anki').textContent),'deployed origin listed');
 ok($('#anki-copy')&&$('#anki-origin'),'origin copy controls');
 ok($('a[href*="ankiweb.net/shared"]')&&$('a[href*="ankiweb.net/shared"]').target==='_blank','anki addon link new tab');
 // settings dialog
 $('#btn-keys').click();const dlg=$('#dlg-keys');ok(dlg.hasAttribute('open'),'dialog open');
 const pBtn=$('#k-p .csel-btn',dlg);ok(!!pBtn,'provider dropdown trigger');
 pBtn.click();ok($$('.copt',dlg).length>=10,'providers in dialog '+$$('.copt',dlg).length);
 for(let i=0;i<$$('.copt',dlg).length;i++){pBtn.click();$$('.copt',dlg)[i].click();ok($('#k-b',dlg).value.startsWith('http'),'base url #'+i);}
 pBtn.click();[...$$('.copt',dlg)].find(o=>/Groq/.test(o.textContent)).click();$('#k-k',dlg).value='sk-test';$('#k-s',dlg).click();ok(/Saved/.test($('#k-st',dlg).textContent),'save key');
 ok(w.AI.ready(),'AI.ready after save');
 // sanitise generated JSON
 const fake={title:'Fake Problem',difficulty:'Medium',tags:['Array'],pattern:'X',brief:'b',brute:'def f(a):\n    return a  #? slow',opt:'def f(a):\n    return a  #! fast',bt:'O(n^2)',bs:'O(1)',ot:'O(n)',os:'O(1)',trick:'t',real:'r',flow:[{note:'one',a:[1,2,3],h:[0]},{note:'two',a:[1,2,3],g:[1]}]};
 console.log('AI exports:',Object.keys(w.AI).join(','));
 // mocked provider: first reply is junk, second is valid JSON in fences → retry path, saveMine, render
 let calls=0;const reply=txt=>({ok:true,status:200,text:async()=>JSON.stringify({choices:[{message:{content:txt}}]}),json:async()=>({})});
 w.fetch=async(u,o)=>{if(/chat\/completions/.test(u)){calls++;return calls===1?reply('Sure! here you go (no json)'):reply('```json\n'+JSON.stringify(fake)+'\n```');}
   if(/8765/.test(u)){const b=JSON.parse(o.body);return {ok:true,json:async()=>({result:b.action==='version'?6:[1],error:null})};}
   return {ok:false,status:404,json:async()=>({}),text:async()=>''};};
 await go('#/gen/fake-problem');await sleep(400);w.DRAPP.route();await sleep(50);
 ok(calls>=2,'provider called twice (retry), calls='+calls);
 ok(w.location.hash==='#/p/fake-problem','redirected to generated problem, got '+w.location.hash);
 w.DRAPP.route();await sleep(20);
 ok(/AI-generated/.test($('#v-problem').textContent),'AI chip shown');
 ok($$('.cl.warn',$('#codebox')).length===1,'generated variant 1 has the #? line');
 $('[data-a=last]',$('#v-problem')).click();ok(/two/.test($('#v-problem .note').textContent),'generated flow plays');
 ok(Object.keys(w.AI.mine()).includes('fake-problem'),'saved in mine');
 await go('#/mine');ok(/Fake Problem/.test($('#v-mine').textContent),'mine lists it');
 try{const msg=await w.Anki.push([w.DR.P['two-sum']],'DryRun');ok(/\d|added|sent|card/i.test(String(msg)),'anki push msg: '+msg);}catch(e){ok(false,'anki push threw '+e.message);}
 const tsv=w.Anki.tsv([w.DR.P['two-sum']]);ok(tsv.split('\n').filter(x=>x&&!x.startsWith('#')).length===2,'two cards per problem');
 // theme toggle
 $('#btn-theme').click();ok(w.document.documentElement.dataset.theme==='light','theme → light');$('#btn-theme').click();ok(w.document.documentElement.dataset.theme==='dark','theme → dark');
 await go('#/nope');ok(/not found/i.test($('#v-gen').textContent),'404');
 console.log('checks',checks,'fails',fails,'errors',errs.length);
 [...new Set(errs)].slice(0,15).forEach(e=>console.log(' ',e));
 process.exit(fails||errs.length?1:0);
})();
