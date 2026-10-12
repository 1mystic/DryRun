// node tools/checkjs.js — runs BOTH variants of every JS problem against its jt/je test (async, real timers)
const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('assert');
const c={};c.window=c;vm.createContext(c);
const dd=path.join(__dirname,'..','js','data');
for(const f of ['boot.js',...fs.readdirSync(dd).filter(x=>/^p\d+\.js$/.test(x)).sort()])vm.runInContext(fs.readFileSync(path.join(dd,f),'utf8'),c,{filename:f});
const strip=s=>s.replace(/[ \t]+\/\/[!?].*$/gm,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const AF=Object.getPrototypeOf(async function(){}).constructor;
(async()=>{let bad=0,ran=0;const js=Object.values(c.DR.P).filter(p=>p.lang==='js');
  for(const p of js){
    if(/`|\$\{/.test(p.b+p.o)){bad++;console.log('BACKTICK/${ in',p.id);}
    for(const [name,code,exp] of [['b',p.b,p.jeb||p.je],['o',p.o,p.je]]){
      ran++;
      try{
        new Function(strip(code)); // syntax check
        const fn=new AF('sleep',strip(code)+'\n'+p.jt);
        const got=await fn(sleep);
        assert.deepStrictEqual(JSON.parse(JSON.stringify(got)),JSON.parse(exp));
      }catch(e){bad++;console.log('FAIL',p.id,'['+name+']',e.message.split('\n').slice(0,6).join(' | '));}
    }
    if(!p.jt)console.log('NOTE no jt for',p.id);
  }
  console.log('js problems',js.length,'variant runs',ran,'failures',bad);process.exit(bad?1:0);})();
