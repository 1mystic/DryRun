/* p7 — JavaScript utility problems (30-days-of-JS style) for the front-end track.
   lang:'js'. Tests live in jt (body of an async function; `sleep(ms)` is provided) with expected JSON in je
   (and jeb when variant 1 is expected to behave differently). Annotations: //? slow/naive line, //! key line.
   Code is inside String.raw — no backticks and no dollar-brace sequences. */
(function(){const r=String.raw,f=DR.f;

DR.add(
{id:'join-two-arrays-by-id',n:2722,t:'Join Two Arrays by ID',d:'M',tg:['JavaScript','Hash Map','Sorting'],pat:'Merge by Key',lang:'js',
br:'Merge two arrays of objects on id; arr2 wins on conflicts; result sorted by id.',
bt:'O(n·m)',bs:'O(n+m)',ot:'O((n+m) log(n+m))',os:'O(n+m)',
b:r`var join = function(arr1, arr2) {
  const res = arr1.map(o => ({ ...o }));
  for (const o2 of arr2) {
    const found = res.find(o => o.id === o2.id); //? linear search for every element of arr2
    if (found) Object.assign(found, o2);
    else res.push({ ...o2 });
  }
  return res.sort((a, b) => a.id - b.id);
};`,
o:r`var join = function(arr1, arr2) {
  const m = new Map(); //! id -> merged object
  for (const o of arr1) m.set(o.id, o);
  for (const o of arr2) m.set(o.id, { ...(m.get(o.id) || {}), ...o }); //! arr2 wins on conflicts
  return [...m.values()].sort((a, b) => a.id - b.id);
};`,
trick:'Key everything by id in a Map, spread-merge (later object wins), then sort by id once.',
real:'Joining API responses, merging user profiles, left/right-join logic in front-end data layers.',
viz:{flow:[f('arr1 ids [1,2], arr2 ids [2,3]. Put arr1 into a Map keyed by id.',[1,2],{aux:[['arr2 ids',2,3],['Map',1,2]]}),
 f('arr2 id 2 already exists → merge: {...old, ...new}. New fields win.',[1,2],{h:[1],aux:[['Map',1,'2 (merged)']]}),
 f('arr2 id 3 is new → just add it.',[1,2,3],{h:[2],aux:[['Map',1,2,3]]}),
 f('Spread the Map values and sort by id.',[1,2,3],{g:[0,1,2],aux:[['result ids',1,2,3]]})]},
jt:`return join([{id:1,x:1},{id:2,x:9}],[{id:2,x:3,y:4},{id:3,x:5}]);`,je:`[{"id":1,"x":1},{"id":2,"x":3,"y":4},{"id":3,"x":5}]`},

{id:'group-by',n:2631,t:'Group By',d:'M',tg:['JavaScript','Hash Map','Prototype'],pat:'Bucket by Key',lang:'js',
br:'Add Array.prototype.groupBy(fn) that returns { key: [items] }.',
bt:'O(n·k)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`Array.prototype.groupBy = function(fn) {
  const keys = [...new Set(this.map(fn))];
  const res = {};
  for (const k of keys) res[k] = this.filter(x => fn(x) === k); //? re-scans the array once per key and calls fn again
  return res;
};`,
o:r`Array.prototype.groupBy = function(fn) {
  const res = {};
  for (const x of this) {
    const k = fn(x);
    (res[k] ??= []).push(x); //! create the bucket on first sight, then push
  }
  return res;
};`,
trick:'One pass: compute the key once, make the bucket if missing (??=), push.',
real:'Grouping rows for tables, charts and sectioned lists (also now built in as Object.groupBy).',
viz:{flow:[f('Group [1,2,3,4,5] by parity.',[1,2,3,4,5],{aux:[['odd'],['even']]}),
 f('1 → odd bucket created, push.',[1,2,3,4,5],{h:[0],aux:[['odd',1],['even']]}),
 f('2 → even bucket created, push. 3 → odd.',[1,2,3,4,5],{h:[1,2],aux:[['odd',1,3],['even',2]]}),
 f('4 → even, 5 → odd. One pass, fn called once per item.',[1,2,3,4,5],{g:[0,1,2,3,4],aux:[['odd',1,3,5],['even',2,4]]})]},
jt:`return [1,2,3,4,5].groupBy(x => x % 2 === 0 ? 'even' : 'odd');`,je:`{"odd":[1,3,5],"even":[2,4]}`},

{id:'flatten-deeply-nested-array',n:2625,t:'Flatten Deeply Nested Array',d:'M',tg:['JavaScript','Recursion','Array'],pat:'Depth-Limited Recursion',lang:'js',
br:'Flatten an array up to depth n.',
bt:'O(n·depth)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`var flat = function (arr, n) {
  if (n === 0) return arr;
  let res = [];
  for (const x of arr) {
    if (Array.isArray(x)) res = res.concat(flat(x, n - 1)); //? concat copies the whole result every time
    else res.push(x);
  }
  return res;
};`,
o:r`var flat = function (arr, n) {
  const res = [];
  const go = (a, depth) => {
    for (const x of a) {
      if (Array.isArray(x) && depth > 0) go(x, depth - 1); //! only dive while depth remains
      else res.push(x); //! everything else lands in ONE shared result
    }
  };
  go(arr, n);
  return res;
};`,
trick:'Carry a depth budget. Arrays are opened only while depth > 0; every leaf is pushed into a single output array.',
real:'Normalising nested API payloads, menus and tree-like JSON for rendering.',
viz:{flow:[f('[1,[2,[3,[4]]],5] with n = 1: open only the first layer of nesting.',['1','[2,[3,[4]]]','5'],{aux:[['depth left',1]]}),
 f('Element 1 is a number → push.',['1','[2,[3,[4]]]','5'],{h:[0],aux:[['out',1],['depth left',1]]}),
 f('[2,[3,[4]]] is an array and depth is 1 → open it: push 2, but [3,[4]] is at depth 0 → pushed whole.',['1','[2,[3,[4]]]','5'],{h:[1],aux:[['out',1,2,'[3,[4]]'],['depth left',0]]}),
 f('Last element 5 → push. Result [1,2,[3,[4]],5].',['1','[2,[3,[4]]]','5'],{g:[0,1,2],aux:[['out',1,2,'[3,[4]]',5]]})]},
jt:`return [flat([1,[2,[3,[4]]],5],1), flat([1,[2,[3,[4]]],5],2), flat([1,[2]],0)];`,je:`[[1,2,[3,[4]],5],[1,2,3,[4],5],[1,[2]]]`},

{id:'debounce',n:2627,t:'Debounce',d:'M',tg:['JavaScript','Closures','Timers'],pat:'Reset the Timer',lang:'js',
br:'Delay a function until calls stop for t ms.',
bt:'O(1)',bs:'O(1)',ot:'O(1)',os:'O(1)',
b:r`var debounce = function(fn, t) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), t); //? 'this' is lost and the pending call cannot be cancelled
  };
};`,
o:r`var debounce = function(fn, t) {
  let timer;
  const debounced = function(...args) {
    clearTimeout(timer); //! every new call restarts the countdown
    timer = setTimeout(() => fn.apply(this, args), t); //! keeps 'this'
  };
  debounced.cancel = () => clearTimeout(timer); //! lets callers (e.g. on unmount) drop the pending call
  return debounced;
};`,
trick:'One timer in a closure. Each call clears it and starts a new one — only the quiet gap after the LAST call lets it fire.',
real:'Search-as-you-type, window resize handlers, autosave, validating form fields.',
viz:{flow:[f('A user types: c1, c2, c3 quickly. Wait time t = 50 ms.',['c1','c2','c3','…','…','run'],{}),
 f('c1 starts a 50 ms timer.',['c1','c2','c3','…','…','run'],{h:[0]}),
 f('c2 arrives before it fires → clearTimeout, start a new timer. c1 is dropped.',['c1','c2','c3','…','…','run'],{h:[1],x:[0]}),
 f('c3 does the same. Now the user stops typing.',['c1','c2','c3','…','…','run'],{h:[2],x:[0,1]}),
 f('50 ms of silence → the timer fires: fn runs ONCE with the last arguments (c3).',['c1','c2','c3','…','…','run'],{g:[2,5],x:[0,1]})]},
jt:`const out=[]; const d=debounce(x=>out.push(x),50); d(1); d(2); await sleep(20); d(3); await sleep(120); d(4); await sleep(120); return out;`,je:`[3,4]`},

{id:'throttle',n:2676,t:'Throttle',d:'M',tg:['JavaScript','Closures','Timers'],pat:'Leading + Trailing Window',lang:'js',
br:'Run fn at most once per t ms: first call immediately, then the latest queued call when the window ends.',
bt:'O(1)',bs:'O(1)',ot:'O(1)',os:'O(1)',
b:r`var throttle = function(fn, t) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= t) { //? calls inside the window are simply dropped — the final call is lost
      last = now;
      fn(...args);
    }
  };
};`,
o:r`var throttle = function(fn, t) {
  let timer = null, pending = null;
  const run = () => {
    if (pending) {
      fn(...pending);
      pending = null;
      timer = setTimeout(run, t); //! the window restarts after a trailing call
    } else timer = null;
  };
  return function(...args) {
    if (timer) { pending = args; return; } //! window open: remember only the LATEST call
    fn(...args); //! leading edge: run immediately
    timer = setTimeout(run, t);
  };
};`,
trick:'Run the first call now, open a t ms window. Calls inside it just overwrite "pending". When the window ends, run the pending one and open a new window.',
real:'Scroll/mousemove handlers, rate-limited API calls, analytics batching.',
viz:{flow:[f('t = 50 ms. Calls arrive: 1 at 0 ms, 2 at 10 ms, 3 at 20 ms.',['1','2','3','…','4'],{}),
 f('Call 1: no window is open → run now, open a window.',['1','2','3','…','4'],{g:[0],h:[0]}),
 f('Calls 2 and 3 arrive inside the window → only the latest (3) is remembered.',['1','2','3','…','4'],{x:[1],h:[2]}),
 f('Window ends at 50 ms → the pending call 3 runs.',['1','2','3','…','4'],{g:[0,2]}),
 f('A later call 4 finds no open window → runs immediately.',['1','2','3','…','4'],{g:[0,2,4]})]},
jt:`const out=[]; const d=throttle(x=>out.push(x),50); d(1); await sleep(10); d(2); await sleep(10); d(3); await sleep(120); d(4); await sleep(120); return out;`,je:`[1,3,4]`,jeb:`[1,4]`},

{id:'memoize',n:2623,t:'Memoize',d:'M',tg:['JavaScript','Closures','Hash Map'],pat:'Cache by Arguments',lang:'js',
br:'Return a function that caches results per distinct argument list.',
bt:'O(args) per call',bs:'O(calls)',ot:'O(args) per call',os:'O(calls)',
b:r`function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args); //? serialises on every call; breaks for functions, undefined and NaN
    if (key in cache) return cache[key];
    return (cache[key] = fn(...args));
  };
}`,
o:r`function memoize(fn) {
  const root = new Map(); //! a trie of Maps: one level per argument
  const END = Symbol("result");
  return function(...args) {
    let node = root;
    for (const a of args) {
      if (!node.has(a)) node.set(a, new Map());
      node = node.get(a); //! arguments are compared by identity — no serialisation
    }
    if (!node.has(END)) node.set(END, fn(...args));
    return node.get(END);
  };
}`,
trick:'Turn the arguments into a lookup path. Same path → return the stored answer instead of calling fn again.',
real:'React useMemo/useCallback, selector libraries, caching pure computations.',
viz:{flow:[f('memoize(add). Calls: add(2,3), add(2,3), add(3,2).',['2,3','2,3','3,2'],{aux:[['cache'],['real calls',0]]}),
 f('First add(2,3): not cached → compute 5, store it.',['2,3','2,3','3,2'],{h:[0],aux:[['cache','2,3 → 5'],['real calls',1]]}),
 f('Second add(2,3): cache hit → 5, fn is NOT called.',['2,3','2,3','3,2'],{g:[1],aux:[['cache','2,3 → 5'],['real calls',1]]}),
 f('add(3,2) is a different argument list → compute again.',['2,3','2,3','3,2'],{h:[2],aux:[['cache','2,3 → 5','3,2 → 5'],['real calls',2]]})]},
jt:`let calls=0; const m=memoize((a,b)=>{calls++; return a+b;}); return [m(2,3),m(2,3),m(3,2),calls];`,je:`[5,5,5,2]`},

{id:'cache-with-time-limit',n:2622,t:'Cache With Time Limit',d:'M',tg:['JavaScript','Class','Timers'],pat:'Self-Expiring Entries',lang:'js',
br:'A key-value cache whose entries expire after a duration.',
bt:'O(n) count',bs:'O(n)',ot:'O(1) count',os:'O(n)',
b:r`var TimeLimitedCache = function() { this.store = new Map(); };
TimeLimitedCache.prototype.set = function(key, value, duration) {
  const alive = this.store.has(key) && this.store.get(key).expireAt > Date.now();
  this.store.set(key, { value, expireAt: Date.now() + duration });
  return alive;
};
TimeLimitedCache.prototype.get = function(key) {
  const e = this.store.get(key);
  return e && e.expireAt > Date.now() ? e.value : -1;
};
TimeLimitedCache.prototype.count = function() {
  let n = 0;
  for (const e of this.store.values()) if (e.expireAt > Date.now()) n++; //? scans every entry, including long-expired ones that never leave the Map
  return n;
};`,
o:r`var TimeLimitedCache = function() { this.store = new Map(); };
TimeLimitedCache.prototype.set = function(key, value, duration) {
  const old = this.store.get(key);
  if (old) clearTimeout(old.timer); //! cancel the previous expiry
  const timer = setTimeout(() => this.store.delete(key), duration); //! the entry removes itself when time is up
  this.store.set(key, { value, timer });
  return Boolean(old);
};
TimeLimitedCache.prototype.get = function(key) {
  return this.store.has(key) ? this.store.get(key).value : -1;
};
TimeLimitedCache.prototype.count = function() { return this.store.size; }; //! O(1): only live keys remain`,
trick:'Give each entry its own timer that deletes it. Re-setting a key cancels the old timer first. Then count() is just the Map size.',
real:'Session caches, OTP/token expiry, TTL caches in front of slow APIs.',
viz:{flow:[f('set(1, 42, 50 ms): store the value and start a 50 ms delete-timer.',['key 1'],{aux:[['value',42],['expires in','50 ms']]}),
 f('set(1, 43, 150 ms) while key 1 is alive → clear the old timer, start a new one. Returns true.',['key 1'],{h:[0],aux:[['value',43],['expires in','150 ms'],['returned','true']]}),
 f('At 100 ms: the old 50 ms timer was cancelled, so get(1) = 43 and count() = 1.',['key 1'],{g:[0],aux:[['get',43],['count',1]]}),
 f('At 150 ms the new timer fires and deletes the key: get(1) = −1, count() = 0.',['key 1'],{x:[0],aux:[['get',-1],['count',0]]})]},
jt:`const c=new TimeLimitedCache(); const r=[c.set(1,42,50)]; r.push(c.get(1)); r.push(c.set(1,43,150)); await sleep(100); r.push(c.get(1)); r.push(c.count()); await sleep(100); r.push(c.get(1)); r.push(c.count()); return r;`,je:`[false,42,true,43,1,-1,0]`},

{id:'event-emitter',n:2694,t:'Event Emitter',d:'M',tg:['JavaScript','Class','Observer'],pat:'Publish / Subscribe',lang:'js',
br:'subscribe(event, cb) returns {unsubscribe}; emit(event, args) calls every callback and returns their results.',
bt:'O(n) unsubscribe',bs:'O(n)',ot:'O(1) unsubscribe',os:'O(n)',
b:r`class EventEmitter {
  constructor() { this.events = {}; }
  subscribe(event, cb) {
    (this.events[event] ??= []).push(cb);
    return { unsubscribe: () => {
      const i = this.events[event].indexOf(cb); //? O(n) search; matches by value, so duplicate callbacks are ambiguous
      if (i !== -1) this.events[event].splice(i, 1);
    } };
  }
  emit(event, args = []) {
    return (this.events[event] || []).map(cb => cb(...args));
  }
}`,
o:r`class EventEmitter {
  constructor() { this.events = new Map(); }
  subscribe(event, cb) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    const entry = { cb }; //! a unique token per subscription
    this.events.get(event).add(entry);
    return { unsubscribe: () => { this.events.get(event).delete(entry); } }; //! O(1) and safe to call twice
  }
  emit(event, args = []) {
    return [...(this.events.get(event) || [])].map(e => e.cb(...args));
  }
}`,
trick:'Per event keep a set of subscriptions. Wrap each callback in its own object so unsubscribing removes exactly that subscription, even for duplicates.',
real:'DOM events, Node EventEmitter, Redux/store subscriptions, message buses.',
viz:{flow:[f('Two listeners on event "a": add-one and double.',['add-one','double'],{aux:[['emit("a", [5])']]}),
 f('emit("a", [5]) calls every listener in order and collects the results.',['add-one','double'],{g:[0,1],aux:[['results',6,10]]}),
 f('unsubscribe() on the first listener removes just that subscription.',['add-one','double'],{x:[0],aux:[['listeners',1]]}),
 f('Emit again: only the remaining listener runs.',['add-one','double'],{g:[1],x:[0],aux:[['results',10]]})]},
jt:`const e=new EventEmitter(); const s=e.subscribe('a',x=>x+1); e.subscribe('a',x=>x*2); const r=[e.emit('a',[5])]; s.unsubscribe(); s.unsubscribe(); r.push(e.emit('a',[5])); r.push(e.emit('nope')); return r;`,je:`[[6,10],[10],[]]`},

{id:'curry',n:2632,t:'Curry',d:'M',tg:['JavaScript','Closures','Functional'],pat:'Collect Args Until fn.length',lang:'js',
br:'curry(fn) lets you call with arguments split across calls: f(1)(2)(3) = f(1,2,3).',
bt:'O(args)',bs:'O(args)',ot:'O(args)',os:'O(args)',
b:r`var curry = function(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return function(...more) { return curried(...args, ...more); }; //? builds a fresh closure and re-spreads all args on every partial call
  };
};`,
o:r`var curry = function(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : curried.bind(this, ...args); //! bind pre-fills the arguments we already have
  };
};`,
trick:'fn.length tells you how many parameters it needs. Keep collecting arguments; once you have enough, call fn.',
real:'Functional pipelines, event handlers with pre-filled arguments, Redux middleware.',
viz:{flow:[f('add(a,b,c) has fn.length = 3. curried = curry(add).',['a','b','c'],{aux:[['collected']]}),
 f('curried(1): 1 argument < 3 → return a function that remembers [1].',['a','b','c'],{h:[0],aux:[['collected',1]]}),
 f('(2): still 2 < 3 → remember [1,2].',['a','b','c'],{h:[1],aux:[['collected',1,2]]}),
 f('(3): now 3 ≥ 3 → call add(1,2,3) = 6.',['a','b','c'],{g:[0,1,2],aux:[['collected',1,2,3],['result',6]]})]},
jt:`const add=(a,b,c)=>a+b+c; const c=curry(add); return [c(1)(2)(3), c(1,2)(3), c(1)(2,3), c(1,2,3), curry(()=>7)()];`,je:`[6,6,6,6,7]`},

{id:'promise-pool',n:2636,t:'Promise Pool',d:'M',tg:['JavaScript','Async','Concurrency'],pat:'Worker Pool',lang:'js',
br:'Run async functions with at most n running at once.',
bt:'batch-bound',bs:'O(n)',ot:'optimal throughput',os:'O(n)',
b:r`var promisePool = async function(functions, n) {
  for (let i = 0; i < functions.length; i += n) {
    await Promise.all(functions.slice(i, i + n).map(f => f())); //? waits for the SLOWEST task of each batch before starting the next
  }
};`,
o:r`var promisePool = async function(functions, n) {
  let next = 0;
  const worker = async () => {
    while (next < functions.length) {
      const f = functions[next++]; //! each worker grabs the next task the moment it is free
      await f();
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, functions.length) }, worker)); //! n workers share one queue
};`,
trick:'Start n workers. Each loops: take the next task, await it, repeat. A fast worker is never stuck waiting for a slow one.',
real:'Rate-limited uploads, crawlers, parallel API calls with a concurrency cap, test runners.',
viz:{flow:[f('Tasks take [60, 10, 10, 10, 10] ms; at most 2 at a time.',[60,10,10,10,10],{aux:[['worker A'],['worker B']]}),
 f('Both workers start: A takes task 0 (60 ms), B takes task 1 (10 ms).',[60,10,10,10,10],{h:[0,1],aux:[['worker A',60],['worker B',10]]}),
 f('At 10 ms B is free → it immediately takes task 2 (batching would still be waiting on the 60 ms task).',[60,10,10,10,10],{h:[0,2],g:[1],aux:[['worker A',60],['worker B',10,10]]}),
 f('B keeps pulling tasks 3 and 4 while A finishes its long one. Total ≈ 60 ms instead of 80 ms.',[60,10,10,10,10],{g:[0,1,2,3,4],aux:[['worker A',60],['worker B',10,10,10,10]]})]},
jt:`let run=0,max=0,done=0; const starts=[]; const t0=Date.now(); const mk=(ms)=>async()=>{starts.push(Date.now()-t0); run++; max=Math.max(max,run); await sleep(ms); run--; done++;}; await promisePool([60,10,10,10,10].map(mk),2); return [max<=2, done===5, starts[2]<40];`,je:`[true,true,true]`,jeb:`[true,true,false]`},

{id:'promise-time-limit',n:2637,t:'Promise Time Limit',d:'M',tg:['JavaScript','Async','Promise'],pat:'Race Against a Timer',lang:'js',
br:'Wrap an async function so it rejects with "Time Limit Exceeded" if it takes longer than t ms.',
bt:'O(1)',bs:'O(1)',ot:'O(1)',os:'O(1)',
b:r`var timeLimit = function(fn, t) {
  return async function(...args) {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject("Time Limit Exceeded"), t); //? the timer is never cleared, so it keeps running after fn finished
      fn(...args).then(resolve).catch(reject);
    });
  };
};`,
o:r`var timeLimit = function(fn, t) {
  return async function(...args) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject("Time Limit Exceeded"), t);
    });
    try {
      return await Promise.race([fn(...args), timeout]); //! whichever settles first wins
    } finally {
      clearTimeout(timer); //! always tidy up the timer
    }
  };
};`,
trick:'Promise.race between the real call and a timer that rejects. Clear the timer in finally.',
real:'API timeouts, fetch with AbortController, circuit breakers and health checks.',
viz:{flow:[f('timeLimit(fn, 50). fn needs 100 ms. Start the call and a 50 ms timer together.',['fn','timer'],{aux:[['t','0 ms']]}),
 f('The race is on: first to settle decides the result.',['fn','timer'],{h:[0,1],aux:[['t','0 ms']]}),
 f('At 50 ms the timer rejects first → "Time Limit Exceeded". fn is ignored.',['fn','timer'],{g:[1],x:[0],aux:[['t','50 ms'],['result','rejected']]}),
 f('If fn had finished first, we would return its value and clear the timer.',['fn','timer'],{g:[0],aux:[['result','fn value']]})]},
jt:`const r=[]; const lim=timeLimit(async x=>{await sleep(100); return x;},50); try{await lim(1);}catch(e){r.push(e);} const fast=timeLimit(async x=>{await sleep(10); return x*2;},50); r.push(await fast(4)); return r;`,je:`["Time Limit Exceeded",8]`},

{id:'function-composition',n:2629,t:'Function Composition',d:'E',tg:['JavaScript','Functional','Reduce'],pat:'reduceRight',lang:'js',
br:'compose([f, g, h])(x) = f(g(h(x))).',
bt:'O(k)',bs:'O(1)',ot:'O(k)',os:'O(1)',
b:r`var compose = function(functions) {
  return function(x) {
    let val = x;
    for (let i = functions.length - 1; i >= 0; i--) val = functions[i](val); //? manual index juggling, easy to get off by one
    return val;
  };
};`,
o:r`var compose = function(functions) {
  return x => functions.reduceRight((acc, f) => f(acc), x); //! apply from right to left, threading the value through
};`,
trick:'Composition reads right to left. reduceRight does that for you and the empty list naturally returns x.',
real:'Middleware chains, Redux enhancers, data-transformation pipelines.',
viz:{flow:[f('compose([x+1, 2x])(4) → first apply 2x, then x+1.',['x+1','2x'],{aux:[['value',4]]}),
 f('Start from the RIGHT: 2x applied to 4.',['x+1','2x'],{h:[1],aux:[['value',8]]}),
 f('Then x+1 applied to 8.',['x+1','2x'],{h:[0],aux:[['value',9]]}),
 f('Result 9. An empty list returns x unchanged.',['x+1','2x'],{g:[0,1],aux:[['result',9]]})]},
jt:`return [compose([x=>x+1,x=>2*x])(4), compose([])(5), compose([x=>x*x,x=>x+1])(3)];`,je:`[9,5,16]`},

{id:'sort-by',n:2724,t:'Sort By',d:'E',tg:['JavaScript','Sorting'],pat:'Decorate – Sort – Undecorate',lang:'js',
br:'Sort an array ascending by the value returned from fn(item).',
bt:'O(n log n) fn calls',bs:'O(1)',ot:'n fn calls',os:'O(n)',
b:r`var sortBy = function(arr, fn) {
  return arr.sort((a, b) => fn(a) - fn(b)); //? fn runs twice per comparison — O(n log n) calls
};`,
o:r`var sortBy = function(arr, fn) {
  return arr
    .map(x => [fn(x), x]) //! compute each key exactly once
    .sort((a, b) => a[0] - b[0])
    .map(p => p[1]);
};`,
trick:'If computing the key is costly, compute it once per item, sort the (key, item) pairs, then drop the keys (Schwartzian transform).',
real:'Sorting by an expensive derived value: relevance scores, parsed dates, distance to a point.',
viz:{flow:[f('Sort [5,4,1,2,3] by fn(x) = x. The comparator version calls fn twice on every comparison.',[5,4,1,2,3],{aux:[['fn calls',0]]}),
 f('Decorate: call fn once per item → pairs [key, item].',['5·5','4·4','1·1','2·2','3·3'],{aux:[['fn calls',5]]}),
 f('Sort the pairs by key. Comparisons only read stored keys — no more fn calls.',['1·1','2·2','3·3','4·4','5·5'],{h:[0,1,2,3,4],aux:[['fn calls',5]]}),
 f('Undecorate: keep the items → [1,2,3,4,5].',[1,2,3,4,5],{g:[0,1,2,3,4],aux:[['fn calls',5]]})]},
jt:`let calls=0; const r=sortBy([5,4,1,2,3],x=>{calls++; return x;}); return [r, calls===5];`,je:`[[1,2,3,4,5],true]`,jeb:`[[1,2,3,4,5],false]`},

{id:'chunk-array',n:2677,t:'Chunk Array',d:'E',tg:['JavaScript','Array'],pat:'Stride Slice',lang:'js',
br:'Split an array into subarrays of length size (the last may be shorter).',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`var chunk = function(arr, size) {
  const res = [];
  let cur = [];
  for (const x of arr) {
    cur.push(x);
    if (cur.length === size) { //? manual bookkeeping of the current chunk
      res.push(cur);
      cur = [];
    }
  }
  if (cur.length) res.push(cur);
  return res;
};`,
o:r`var chunk = function(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size)); //! jump by size, slice does the cutting
  return res;
};`,
trick:'Step i by size and slice(i, i + size). slice is safe past the end, so the short last chunk needs no special case.',
real:'Pagination, batching API requests, splitting work across workers.',
viz:{flow:[f('Chunk [1,2,3,4,5] by 2: step the start index by 2.',[1,2,3,4,5],{p:{i:0}}),
 f('i = 0 → slice(0, 2) = [1,2].',[1,2,3,4,5],{p:{i:0},w:[0,1]}),
 f('i = 2 → slice(2, 4) = [3,4].',[1,2,3,4,5],{p:{i:2},w:[2,3]}),
 f('i = 4 → slice(4, 6) = [5] (slice stops at the end). Result [[1,2],[3,4],[5]].',[1,2,3,4,5],{p:{i:4},w:[4,4],g:[4]})]},
jt:`return [chunk([1,2,3,4,5],2), chunk([],1), chunk([1,2,3],5)];`,je:`[[[1,2],[3,4],[5]],[],[[1,2,3]]]`}
);
})();
