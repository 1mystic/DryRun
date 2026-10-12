// node tools/dump.js > out.json — loads the data files exactly like the browser and prints them as JSON
const fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
const dir=path.join(__dirname,'..','js','data');
const files=['boot.js',...fs.readdirSync(dir).filter(x=>/^p\d+\.js$/.test(x)).sort(),'tracks.js'].filter(f=>fs.existsSync(path.join(dir,f)));
for(const f of files)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f});
// viz may contain functions (ok(), f(), deps()) — they are dropped in JSON, which is fine for the python tests
process.stdout.write(JSON.stringify({P:ctx.DR.P,T:ctx.DR.T}));
