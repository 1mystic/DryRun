/* boot.js — data registry and tiny helpers used by every data file.
   Problem record keys: id (LeetCode slug), n (number), t (title), d (E|M|H), tg (tags), pat (pattern),
   br (brief), b (beginner code), o (optimal code), bt/bs/ot/os (time/space), trick, real,
   viz ({sim:..} | {flow:[frames]}), lang ('py'|'js'), test (python snippet setting res), exp (python literal).
   Code annotations: trailing "#? note" marks a slow line (variant 1), "#! note" marks a key line (variant 2). */
window.DR={P:{},T:[],
  add(...a){a.forEach(p=>{if(this.P[p.id])throw new Error('duplicate '+p.id);this.P[p.id]=p;});},
  f(note,a,o){return Object.assign({note},a?{a}:{},o||{});}
};
