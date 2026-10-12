// node tools/frames.js — generates frames for every problem's viz (catches sim / data-spec errors)
const vm=require('vm'),fs=require('fs'),path=require('path');
const c={};c.window=c;vm.createContext(c);
const dir=path.join(__dirname,'..','js'),dd=path.join(dir,'data');
const files=['data/boot.js',...fs.readdirSync(dd).filter(x=>/^p\d+\.js$/.test(x)).sort().map(x=>'data/'+x),'sims.js'];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),c,{filename:f});
let n=0,bad=0;
for(const [id,p] of Object.entries(c.DR.P)){
  try{const r=c.SIMS.run(p.viz);if(!r.frames||r.frames.length<3)throw new Error('frames='+(r.frames&&r.frames.length));
    r.frames.forEach((fr,i)=>{if(!fr.note||/undefined|NaN|\[object/.test(fr.note))throw new Error('bad note in frame '+i+': '+fr.note);});n++;}
  catch(e){bad++;console.log('VIZ FAIL',id,e.message);}
}
console.log('viz ok',n,'bad',bad);process.exit(bad?1:0);
