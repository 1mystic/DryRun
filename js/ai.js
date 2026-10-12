/* ai.js, generate a new problem page with any OpenAI-compatible endpoint (or Anthropic). Keys stay in localStorage. */
(function(){
const PROV={
  groq:{n:'Groq',base:'https://api.groq.com/openai/v1',model:'llama-3.3-70b-versatile',get:'https://console.groq.com/keys',tag:'free tier',blurb:'Very fast Llama / GPT-OSS models. Sign in, create a key, done.'},
  gemini:{n:'Google Gemini (AI Studio)',base:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-2.5-flash',get:'https://aistudio.google.com/apikey',tag:'free tier',blurb:'Generous free quota and a huge context window.'},
  openrouter:{n:'OpenRouter',base:'https://openrouter.ai/api/v1',model:'meta-llama/llama-3.3-70b-instruct:free',get:'https://openrouter.ai/keys',tag:'free models',blurb:'One key, 20+ models marked ":free" (Llama, Qwen, GPT-OSS…).'},
  cerebras:{n:'Cerebras',base:'https://api.cerebras.ai/v1',model:'llama-3.3-70b',get:'https://cloud.cerebras.ai/',tag:'free tier',blurb:'Free daily token allowance, extremely quick.'},
  mistral:{n:'Mistral',base:'https://api.mistral.ai/v1',model:'mistral-small-latest',get:'https://console.mistral.ai/api-keys',tag:'free tier',blurb:'"Experiment" plan is free (needs a phone check).'},
  github:{n:'GitHub Models',base:'https://models.github.ai/inference',model:'openai/gpt-4.1-mini',get:'https://github.com/marketplace/models',tag:'free tier',blurb:'Use a GitHub personal access token. May block browser (CORS) calls.'},
  nvidia:{n:'NVIDIA NIM',base:'https://integrate.api.nvidia.com/v1',model:'meta/llama-3.3-70b-instruct',get:'https://build.nvidia.com/',tag:'free credits',blurb:'Free developer credits for hosted open models.'},
  huggingface:{n:'Hugging Face',base:'https://router.huggingface.co/v1',model:'meta-llama/Llama-3.3-70B-Instruct',get:'https://huggingface.co/settings/tokens',tag:'free tier',blurb:'Inference router across providers with a token.'},
  deepseek:{n:'DeepSeek',base:'https://api.deepseek.com/v1',model:'deepseek-chat',get:'https://platform.deepseek.com/api_keys',tag:'very cheap',blurb:'Strong at code, pennies per problem.'},
  qwen:{n:'Qwen (Alibaba DashScope)',base:'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',model:'qwen-plus',get:'https://bailian.console.alibabacloud.com/',tag:'trial quota',blurb:'Qwen models through the international endpoint.'},
  openai:{n:'OpenAI (ChatGPT)',base:'https://api.openai.com/v1',model:'gpt-4o-mini',get:'https://platform.openai.com/api-keys',tag:'paid',blurb:'GPT models. Needs billing.'},
  anthropic:{n:'Anthropic (Claude)',base:'https://api.anthropic.com/v1',model:'claude-haiku-5-5',get:'https://console.anthropic.com/settings/keys',tag:'paid',blurb:'Claude models. Needs billing.',special:true},
  pollinations:{n:'Pollinations (experimental)',base:'https://text.pollinations.ai/openai',model:'openai',get:'https://pollinations.ai/',tag:'try without key',blurb:'Community endpoint. Access rules change; may need a token.',nokey:true},
  custom:{n:'Custom (any OpenAI-compatible URL)',base:'http://localhost:11434/v1',model:'llama3.1',get:'',tag:'yours',blurb:'Ollama, LM Studio, vLLM, LiteLLM, Together, Fireworks… anything speaking /chat/completions.'}
};
const LS=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
const SS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
function get(){const s=LS('dr-ai')||{};return {prov:s.prov||'groq',cfg:s.cfg||{}};}
function cfgFor(prov){const s=get(),d=PROV[prov]||PROV.custom,c=s.cfg[prov]||{};return {prov,base:c.base||d.base,model:c.model||d.model,key:c.key||''};}
function current(){return cfgFor(get().prov);}
function save(prov,c){const s=get();s.prov=prov;s.cfg[prov]={base:c.base,model:c.model,key:c.key};SS('dr-ai',s);}
function ready(){const c=current();return !!(c.key||(PROV[c.prov]||{}).nokey||c.prov==='custom');}

const mine=()=>LS('dr-mine')||{};
const saveMine=p=>{const m=mine();m[p.id]=p;SS('dr-mine',m);};
const delMine=id=>{const m=mine();delete m[id];SS('dr-mine',m);};

async function timed(url,opt,ms){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms);try{return await fetch(url,Object.assign({signal:ac.signal},opt));}finally{clearTimeout(t);}}

async function chat(c,sys,user){
  const base=c.base.replace(/\/$/,'');let r,txt;
  try{
    if(c.prov==='anthropic'){
      r=await timed(base+'/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':c.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:c.model,max_tokens:6000,system:sys,messages:[{role:'user',content:user}]})},120000);
    }else{
      r=await timed(base+'/chat/completions',{method:'POST',headers:Object.assign({'Content-Type':'application/json'},c.key?{Authorization:'Bearer '+c.key}:{}),body:JSON.stringify({model:c.model,temperature:0.2,max_tokens:6000,messages:[{role:'system',content:sys},{role:'user',content:user}]})},120000);
    }
  }catch(e){throw new Error(e.name==='AbortError'?'The provider took too long (2 min).':'Could not reach '+base+'. Either you are offline, the key/URL is wrong, or this provider blocks calls from browsers (CORS). Try Groq, Gemini or OpenRouter.');}
  txt=await r.text();
  if(!r.ok){let m=txt.slice(0,300);throw new Error(r.status+(r.status===401||r.status===403?', key rejected or missing. ':r.status===429?', rate limit hit, wait a minute or switch provider. ':', ')+m);}
  let j;try{j=JSON.parse(txt);}catch(e){throw new Error('Provider returned non-JSON: '+txt.slice(0,160));}
  return c.prov==='anthropic'?(j.content||[]).map(x=>x.text||'').join(''):(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||'';
}

async function listModels(c){
  const base=c.base.replace(/\/$/,'');if(c.prov==='anthropic')return ['claude-haiku-5-5','claude-sonnet-5-5','claude-opus-5-5'];
  const r=await timed(base+'/models',{headers:c.key?{Authorization:'Bearer '+c.key}:{}},15000);if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,120));
  const j=await r.json();const a=j.data||j.models||j;return a.map(x=>(x.id||x.name||'').replace(/^models\//,'')).filter(Boolean).sort();
}

const SYS=`You are an expert algorithms coach. Given a LeetCode problem, reply with ONLY one JSON object (no markdown fences, no commentary) with exactly these keys:
{"title":"", "difficulty":"Easy|Medium|Hard", "tags":["Array","Hash Map"], "pattern":"short pattern name (2-4 words)",
"brief":"1-2 sentence plain-English restatement of the task",
"brute":"Python 3 LeetCode-style 'class Solution' code. The easiest CORRECT approach a beginner would write, <=20 lines. Mark the slow line(s) with a trailing comment starting '#? ' explaining the cost.",
"opt":"Python 3 'class Solution' code of the best known approach, <=25 lines. Put a trailing comment starting '#! ' on the 2-6 lines that carry the key idea (why it is faster). Keep the same method signature as brute.",
"bt":"O(..) time of brute","bs":"O(..) space of brute","ot":"O(..) time of opt","os":"O(..) space of opt",
"trick":"ONE memorable mnemonic in the form 'CUE -> PATTERN: vivid hook' (<=200 chars)",
"real":"one sentence on where this idea shows up in real systems",
"flow":[ 8 to 14 animation frames tracing the OPTIMAL algorithm on a tiny example (array of <=10 items) ]}
Each frame is an object: {"note":"what happens, one sentence","a":[cells as strings or numbers],"h":[highlighted indexes],"g":[green/done indexes],"x":[dimmed indexes],"p":{"pointerName":index},"w":[left,right] for a window,"aux":[["label","item1","item2"]]}, aux rows show hash maps, stacks, queues, heaps, results as chips. Every frame should repeat the full state (a, p, aux). Use only these keys. Escape newlines inside JSON strings as \\n.`;

function extractJSON(s){
  s=String(s||'').replace(/```(?:json)?/gi,'');const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<=a)throw new Error('No JSON found in the model reply.');
  return JSON.parse(s.slice(a,b+1));
}
const arrI=x=>Array.isArray(x)?x.filter(n=>Number.isInteger(n)).slice(0,40):undefined;
function cleanFrames(fl){
  if(!Array.isArray(fl))return [];
  return fl.slice(0,24).map(f=>{
    const o={note:String(f.note||'').slice(0,300)};
    if(Array.isArray(f.a))o.a=f.a.slice(0,24).map(x=>(typeof x==='number'||typeof x==='string')?x:String(x));
    ['h','g','x'].forEach(k=>{const v=arrI(f[k]);if(v)o[k]=v;});
    if(f.p&&typeof f.p==='object'){o.p={};Object.keys(f.p).slice(0,6).forEach(k=>{if(Number.isInteger(f.p[k]))o.p[String(k).slice(0,12)]=f.p[k];});}
    if(Array.isArray(f.w)&&f.w.length===2&&f.w.every(Number.isInteger))o.w=f.w;
    if(Array.isArray(f.aux))o.aux=f.aux.slice(0,4).filter(Array.isArray).map(r=>r.slice(0,14).map(x=>String(x).slice(0,40)));
    return o;
  });
}
const str=(x,d)=>typeof x==='string'&&x.trim()?x:d;
function normalize(slug,j){
  if(!j.brute||!j.opt)throw new Error('The model reply is missing the code fields.');
  return {id:slug,n:null,t:str(j.title,slug.replace(/-/g,' ')),d:({easy:'E',medium:'M',hard:'H'})[String(j.difficulty||'').toLowerCase()]||'M',
    tg:Array.isArray(j.tags)?j.tags.slice(0,5).map(String):[],pat:str(j.pattern,'Pattern'),br:str(j.brief,''),
    bt:str(j.bt,'O(n²)'),bs:str(j.bs,'O(1)'),ot:str(j.ot,'O(n)'),os:str(j.os,'O(n)'),b:String(j.brute),o:String(j.opt),
    trick:str(j.trick,''),real:str(j.real,''),viz:{flow:cleanFrames(j.flow)},ai:true,made:Date.now()};
}

async function fetchStatement(slug){
  const tries=[['https://alfa-leetcode-api.onrender.com/select?titleSlug='+slug,j=>j.question],['https://leetcode-api-pied.vercel.app/problem/'+slug,j=>j.content]];
  for(const [u,pick] of tries){try{const r=await timed(u,{},7000);if(!r.ok)continue;const j=await r.json();const html=pick(j);if(html)return String(html).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim().slice(0,3500);}catch(e){}}
  return '';
}

async function generate(slug,statement,status){
  const c=current();if(!ready())throw new Error('NOKEY');
  status('Looking for the problem statement…');
  const text=statement||await fetchStatement(slug);
  status('Asking '+(PROV[c.prov]||PROV.custom).n+' ('+c.model+')… this takes 20-60 seconds.');
  const user='LeetCode problem slug: '+slug+' (https://leetcode.com/problems/'+slug+'/)\n'+(text?'Problem statement:\n'+text:'No statement was available, use your own knowledge of this problem.');
  let out,j;
  for(let attempt=0;attempt<2;attempt++){
    out=await chat(c,SYS,attempt?user+'\n\nYour previous reply was not valid JSON. Reply with ONLY the JSON object.':user);
    try{j=extractJSON(out);break;}catch(e){if(attempt)throw new Error('The model did not return valid JSON. Try a stronger model.');status('Reply was not valid JSON, retrying once…');}
  }
  return normalize(slug,j);
}

window.AI={PROV,get,cfgFor,current,save,ready,mine,saveMine,delMine,generate,listModels};
})();
