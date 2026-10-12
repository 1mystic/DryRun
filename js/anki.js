/* anki.js — build Anki cards: TSV download (File → Import) and AnkiConnect push */
(function(){
const E=HL.esc;
const url=p=>'https://leetcode.com/problems/'+p.id+'/';
function strip(src){return HL.parse(src).map(l=>l.t).join('\n');}
function cards(p){
  const tag=['dryrun',(p.pat||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')].filter(Boolean).join(' ');
  const code='<pre style="text-align:left;font-size:13px">'+E(strip(p.o))+'</pre>';
  return [
    {f:'<b>'+E(p.t)+'</b><br><a href="'+url(p)+'">'+url(p)+'</a><br><br>Which pattern solves this, and what is the memory trick?',
     b:'<b>'+E(p.pat||'')+'</b><br>'+E(p.trick||'')+'<br><br>Brute force: '+E(p.bt)+' → Optimal: '+E(p.ot)+' time, '+E(p.os)+' space.',tags:tag},
    {f:'Write the <b>optimal</b> solution for <b>'+E(p.t)+'</b> ('+E(p.pat||'')+').',b:code,tags:tag}
  ];
}
const tsvCell=s=>String(s).replace(/\t/g,' ').replace(/\r?\n/g,'<br>');
function tsv(list){
  return '#separator:tab\n#html:true\n#tags column:3\n'+list.flatMap(cards).map(c=>[c.f,c.b,c.tags].map(tsvCell).join('\t')).join('\n')+'\n';
}
function download(name,text){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/tab-separated-values'}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
}
async function connect(action,params){
  const r=await fetch('http://127.0.0.1:8765',{method:'POST',body:JSON.stringify({action,version:6,params})});
  const j=await r.json();if(j.error)throw new Error(j.error);return j.result;
}
async function push(list,deck){
  deck=deck||'DryRun';
  await connect('createDeck',{deck});
  const notes=list.flatMap(cards).map(c=>({deckName:deck,modelName:'Basic',fields:{Front:c.f,Back:c.b},tags:c.tags.split(' ').filter(Boolean),options:{allowDuplicate:false}}));
  const res=await connect('addNotes',{notes});
  return res.filter(x=>x!=null).length+' new card(s) added to deck "'+deck+'" ('+(notes.length-res.filter(x=>x!=null).length)+' duplicates skipped).';
}
window.Anki={cards,tsv,download,push};
})();
