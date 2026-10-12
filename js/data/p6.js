/* p6, system-design style classes, sampling, string/stack utilities */
(function(){const r=String.raw,f=DR.f;
const gr=(rows,cur)=>({grid:{v:rows.map(x=>x.map(String)),c:rows.map((x,i)=>x.map((v,j)=>cur&&cur[0]===i&&cur[1]===j?'on':v===2?'i1':''))}});

DR.add(
{id:'lru-cache',n:146,t:'LRU Cache',d:'M',tg:['Design','Hash Map','Linked List'],pat:'Hash Map + Recency Order',
br:'A fixed-size cache that evicts the least recently used key. get/put should be O(1).',
bt:'O(n) per op',bs:'O(capacity)',ot:'O(1) per op',os:'O(capacity)',
b:r`class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.data = {}
        self.order = []  # least recent first

    def get(self, key: int) -> int:
        if key not in self.data:
            return -1
        self.order.remove(key)  #? O(n) scan to find the key
        self.order.append(key)
        return self.data[key]

    def put(self, key: int, value: int) -> None:
        if key in self.data:
            self.order.remove(key)  #? O(n) again
        elif len(self.data) == self.cap:
            old = self.order.pop(0)  #? O(n): shifts every element
            del self.data[old]
        self.data[key] = value
        self.order.append(key)`,
o:r`class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.d = OrderedDict()  #! hash map + doubly linked list in one

    def get(self, key: int) -> int:
        if key not in self.d:
            return -1
        self.d.move_to_end(key)  #! O(1): mark as most recently used
        return self.d[key]

    def put(self, key: int, value: int) -> None:
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)  #! O(1): evict the least recently used (front)`,
trick:'Hash map for O(1) lookup + a linked list for O(1) "move to front / drop the back". OrderedDict is exactly that pair.',
real:'Every cache: CPU, CDN, DB buffer pool, and LLM prompt/KV-prefix caches.',
viz:{flow:[f('Capacity 2. The row shows keys from least recent (left) to most recent (right).',['1'],{p:{LRU:0,MRU:0},aux:[['put','(1,1)']]}),
 f('put(2,2): new key goes to the most-recent end.',['1','2'],{p:{LRU:0,MRU:1},h:[1],aux:[['put','(2,2)']]}),
 f('get(1) → 1. A read counts as use: key 1 moves to the most-recent end.',['2','1'],{p:{LRU:0,MRU:1},h:[1],aux:[['get','1 → 1']]}),
 f('put(3,3): cache is full → evict the LEAST recent key, which is 2.',['2','1'],{p:{LRU:0,MRU:1},x:[0],aux:[['put','(3,3)']]}),
 f('Now [1,3]. get(2) → −1 (it was evicted).',['1','3'],{p:{LRU:0,MRU:1},h:[1],aux:[['get(2)','−1']]})]},
test:`c=LRUCache(2);c.put(1,1);c.put(2,2);r=[c.get(1)];c.put(3,3);r+=[c.get(2)];c.put(4,4);r+=[c.get(1),c.get(3),c.get(4)];res=r`,exp:`[1,-1,-1,3,4]`},

{id:'lfu-cache',n:460,t:'LFU Cache',d:'H',tg:['Design','Hash Map','Linked List'],pat:'Frequency Buckets',
br:'Evict the least frequently used key (ties → least recently used) in O(1).',
bt:'O(n) evict',bs:'O(capacity)',ot:'O(1) per op',os:'O(capacity)',
b:r`class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.val, self.freq, self.last = {}, {}, {}
        self.tick = 0

    def _touch(self, key):
        self.freq[key] += 1
        self.tick += 1
        self.last[key] = self.tick

    def get(self, key: int) -> int:
        if key not in self.val:
            return -1
        self._touch(key)
        return self.val[key]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.val:
            self.val[key] = value
            self._touch(key)
            return
        if len(self.val) == self.cap:
            victim = min(self.val, key=lambda k: (self.freq[k], self.last[k]))  #? scans every key on each eviction
            for d in (self.val, self.freq, self.last):
                del d[victim]
        self.val[key] = value
        self.freq[key] = 0
        self._touch(key)`,
o:r`class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.min = 0
        self.val, self.freq = {}, {}
        self.buckets = defaultdict(OrderedDict)  #! freq -> keys in recency order

    def _bump(self, key):
        f = self.freq[key]
        del self.buckets[f][key]  #! leave the old frequency bucket
        if not self.buckets[f] and self.min == f:
            self.min += 1  #! the minimum frequency moves up with it
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.val:
            return -1
        self._bump(key)
        return self.val[key]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.val:
            self.val[key] = value
            self._bump(key)
            return
        if len(self.val) == self.cap:
            old, _ = self.buckets[self.min].popitem(last=False)  #! oldest key in the lowest-frequency bucket
            del self.val[old]
            del self.freq[old]
        self.val[key] = value
        self.freq[key] = 1
        self.buckets[1][key] = None
        self.min = 1`,
trick:'Group keys by use-count, each group in LRU order, and always remember the smallest count. Evict from that group’s front.',
real:'Hot-key caches where popularity matters more than recency (CDNs, model-serving feature stores).',
viz:{flow:[f('Capacity 2. Each entry shows key · use-count.',['1 · f1','2 · f1'],{aux:[['put','(1,1) then (2,2)']]}),
 f('get(1): key 1 jumps to frequency 2.',['2 · f1','1 · f2'],{h:[1],aux:[['get','1 → 1']]}),
 f('put(3,3): full → evict from the LOWEST frequency (f1): key 2.',['2 · f1','1 · f2'],{x:[0],aux:[['min freq',1]]}),
 f('Cache is [1 · f2, 3 · f1]. get(3) bumps it to frequency 2.',['1 · f2','3 · f2'],{h:[1],aux:[['min freq',2]]}),
 f('put(4,4): both are frequency 2 → tie → evict the least recently used of them: key 1.',['1 · f2','3 · f2'],{x:[0],aux:[['tie-break','LRU']]})]},
test:`c=LFUCache(2);c.put(1,1);c.put(2,2);r=[c.get(1)];c.put(3,3);r+=[c.get(2),c.get(3)];c.put(4,4);r+=[c.get(1),c.get(3),c.get(4)];res=r`,exp:`[1,-1,3,-1,3,4]`},

{id:'time-based-key-value-store',n:981,t:'Time Based Key-Value Store',d:'M',tg:['Design','Binary Search','Hash Map'],pat:'Sorted Timestamps + Bisect',
br:'set(key, value, ts) and get(key, ts) → the value with the largest timestamp ≤ ts.',
bt:'O(n) get',bs:'O(n)',ot:'O(log n) get',os:'O(n)',
b:r`class TimeMap:
    def __init__(self):
        self.d = defaultdict(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.d[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        for ts, v in reversed(self.d[key]):  #? linear scan from the newest
            if ts <= timestamp:
                return v
        return ""`,
o:r`class TimeMap:
    def __init__(self):
        self.ts = defaultdict(list)
        self.vals = defaultdict(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.ts[key].append(timestamp)
        self.vals[key].append(value)

    def get(self, key: str, timestamp: int) -> str:
        i = bisect_right(self.ts[key], timestamp)  #! binary search: timestamps are strictly increasing
        return self.vals[key][i - 1] if i else ""`,
trick:'Timestamps only ever grow, so each key’s list is already sorted → binary-search for "last one ≤ query".',
real:'Point-in-time reads in versioned stores, feature stores and time-series DBs ("as of" queries).',
viz:{flow:[f('Key "foo" has timestamps [1,4,7,10,13]. Query: value at time 8 → the latest timestamp ≤ 8.',[1,4,7,10,13],{p:{lo:0,hi:4},w:[0,4]}),
 f('mid = 2 → ts 7 ≤ 8: it is a candidate, but a later one might also fit → search right.',[1,4,7,10,13],{p:{lo:0,mid:2,hi:4},w:[0,4],h:[2]}),
 f('lo = 3: mid = 3 → ts 10 > 8: too new → search left.',[1,4,7,10,13],{p:{lo:3,mid:3,hi:4},w:[3,4],x:[3]}),
 f('Range empty. The best candidate is ts 7 → return the value stored at 7.',[1,4,7,10,13],{g:[2],aux:[['answer','value@7']]})]},
test:`t=TimeMap();t.set("foo","bar",1);r=[t.get("foo",1),t.get("foo",3)];t.set("foo","bar2",4);r+=[t.get("foo",4),t.get("foo",5),t.get("foo",0)];res=r`,exp:`["bar","bar","bar2","bar2",""]`},

{id:'design-hit-counter',n:362,t:'Design Hit Counter',d:'M',tg:['Design','Queue','Sliding Window'],pat:'Time-Bucket Ring',
br:'Count hits in the last 300 seconds.',
bt:'O(n) per query',bs:'O(n)',ot:'O(300) per query',os:'O(300)',
b:r`class HitCounter:
    def __init__(self):
        self.hits = []

    def hit(self, timestamp: int) -> None:
        self.hits.append(timestamp)  #? every hit is stored forever

    def getHits(self, timestamp: int) -> int:
        return sum(1 for t in self.hits if timestamp - t < 300)  #? scans the whole history`,
o:r`class HitCounter:
    def __init__(self):
        self.t = [0] * 300
        self.h = [0] * 300

    def hit(self, timestamp: int) -> None:
        i = timestamp % 300
        if self.t[i] != timestamp:  #! this slot still holds an old second
            self.t[i] = timestamp
            self.h[i] = 0
        self.h[i] += 1

    def getHits(self, timestamp: int) -> int:
        return sum(h for t, h in zip(self.t, self.h) if timestamp - t < 300)  #! fixed 300 slots, whatever the traffic`,
trick:'Only 300 seconds matter, so keep 300 slots: second % 300. A slot with an older timestamp is stale and gets reused.',
real:'Rate limiters, request counters and "last 5 minutes" dashboards.',
viz:{flow:[f('Hits at seconds 1, 2, 3. Window = the last 300 seconds.',[1,2,3],{w:[0,2],aux:[['getHits(4)',3]]}),
 f('hit(300): second 300 is stored in slot 300 % 300 = 0.',[1,2,3,300],{h:[3]}),
 f('getHits(300): window is (0, 300] → all 4 hits count.',[1,2,3,300],{w:[0,3],aux:[['getHits(300)',4]]}),
 f('getHits(301): window is (1, 301] → second 1 has expired.',[1,2,3,300],{x:[0],w:[1,3],aux:[['getHits(301)',3]]})]},
test:`h=HitCounter();h.hit(1);h.hit(2);h.hit(3);r=[h.getHits(4)];h.hit(300);r+=[h.getHits(300),h.getHits(301)];res=r`,exp:`[3,4,3]`},

{id:'number-of-recent-calls',n:933,t:'Number of Recent Calls',d:'E',tg:['Design','Queue'],pat:'Expiring Queue',
br:'ping(t) returns how many pings happened in [t − 3000, t].',
bt:'O(n)',bs:'O(n)',ot:'O(1) amortised',os:'O(window)',
b:r`class RecentCounter:
    def __init__(self):
        self.calls = []

    def ping(self, t: int) -> int:
        self.calls.append(t)
        return sum(1 for c in self.calls if c >= t - 3000)  #? re-counts the entire history each ping`,
o:r`class RecentCounter:
    def __init__(self):
        self.q = deque()

    def ping(self, t: int) -> int:
        self.q.append(t)
        while self.q[0] < t - 3000:  #! old pings can never matter again
            self.q.popleft()
        return len(self.q)`,
trick:'Pings arrive in increasing time, so expired ones are always at the front: pop them, count what is left.',
real:'Sliding-window rate limiting and recent-activity counters.',
viz:{flow:[f('ping(1): queue [1] → 1 call in [−2999, 1].',[1],{w:[0,0]}),
 f('ping(100): queue [1,100] → 2.',[1,100],{w:[0,1]}),
 f('ping(3001): window starts at 1 → 1 is still inside. 3 calls.',[1,100,3001],{w:[0,2]}),
 f('ping(3002): window starts at 2 → 1 expired, pop it. 3 calls remain.',[1,100,3001,3002],{x:[0],w:[1,3]})]},
test:`p=RecentCounter();res=[p.ping(1),p.ping(100),p.ping(3001),p.ping(3002)]`,exp:`[1,2,3,3]`},

{id:'insert-delete-getrandom-o1',n:380,t:'Insert Delete GetRandom O(1)',d:'M',tg:['Design','Hash Map','Array'],pat:'Swap With Last',
br:'A set with O(1) insert, remove and uniformly random getRandom.',
bt:'O(n) insert/remove',bs:'O(n)',ot:'O(1) all',os:'O(n)',
b:r`import random

class RandomizedSet:
    def __init__(self):
        self.a = []

    def insert(self, val: int) -> bool:
        if val in self.a:  #? O(n) membership test
            return False
        self.a.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.a:
            return False
        self.a.remove(val)  #? O(n) search + shift
        return True

    def getRandom(self) -> int:
        return random.choice(self.a)`,
o:r`import random

class RandomizedSet:
    def __init__(self):
        self.a = []
        self.pos = {}  # value -> index in a

    def insert(self, val: int) -> bool:
        if val in self.pos:
            return False
        self.pos[val] = len(self.a)
        self.a.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.pos:
            return False
        i, last = self.pos[val], self.a[-1]
        self.a[i] = last  #! fill the hole with the last element
        self.pos[last] = i
        self.a.pop()  #! popping the end is O(1)
        del self.pos[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.a)`,
trick:'Array = random access, dict = fast lookup. To delete from the middle in O(1): overwrite it with the last element and pop the end.',
real:'Random sampling from a dynamic pool: negative sampling, work stealing, A/B bucket picks.',
viz:{flow:[f('Array [10,20,30,40] with a dict value → index. Remove 20 (index 1).',[10,20,30,40],{h:[1],aux:[['remove',20]]}),
 f('Copy the LAST element (40) into the hole and update its index in the dict.',[10,40,30,40],{h:[1],x:[3],aux:[['pos[40]',1]]}),
 f('Pop the end of the array, O(1), nothing shifts.',[10,40,30],{g:[1],aux:[['removed',20]]})]},
test:`s=RandomizedSet();r=[s.insert(1),s.remove(2),s.insert(2),s.getRandom() in (1,2),s.remove(1),s.insert(2),s.getRandom()];res=r`,exp:`[True,False,True,True,True,False,2]`},

{id:'maximum-frequency-stack',n:895,t:'Maximum Frequency Stack',d:'H',tg:['Design','Stack','Hash Map'],pat:'Stack Per Frequency',
br:'pop() removes the most frequent element (ties → the most recently pushed).',
bt:'O(n) pop',bs:'O(n)',ot:'O(1) per op',os:'O(n)',
b:r`class FreqStack:
    def __init__(self):
        self.a = []

    def push(self, val: int) -> None:
        self.a.append(val)

    def pop(self) -> int:
        cnt = Counter(self.a)  #? recounts everything on every pop
        top = max(cnt.values())
        for i in range(len(self.a) - 1, -1, -1):
            if cnt[self.a[i]] == top:
                return self.a.pop(i)`,
o:r`class FreqStack:
    def __init__(self):
        self.freq = defaultdict(int)
        self.group = defaultdict(list)  #! level f holds every value pushed when its count became f
        self.mx = 0

    def push(self, val: int) -> None:
        self.freq[val] += 1
        f = self.freq[val]
        self.mx = max(self.mx, f)
        self.group[f].append(val)

    def pop(self) -> int:
        val = self.group[self.mx].pop()  #! newest value on the highest level
        self.freq[val] -= 1
        if not self.group[self.mx]:
            self.mx -= 1
        return val`,
trick:'A value pushed for the 3rd time lives on level 3 (and still on levels 1 and 2). Pop from the top level, recency is automatic because each level is a stack.',
real:'Priority by popularity then recency: hot-item eviction, trending queues.',
viz:{flow:[f('Push 5,7,5,7,4,5. Level f keeps values in the order they reached count f.',[5,7,5,7,4,5],{aux:[['level 1',5,7,4],['level 2',5,7],['level 3',5]]}),
 f('pop() → top level (3) holds only 5.',[5,7,5,7,4,5],{h:[5],aux:[['level 1',5,7,4],['level 2',5,7],['level 3']]}),
 f('Level 3 is empty, so the max level drops to 2. pop() → the newest on level 2 is 7.',[5,7,5,7,4,5],{h:[3],aux:[['level 1',5,7,4],['level 2',5],['pop','7']]}),
 f('Next pop → 5 (level 2), then 4 (level 1’s newest).',[5,7,5,7,4,5],{g:[0,4],aux:[['sequence','5, 7, 5, 4']]})]},
test:`s=FreqStack()\nfor x in (5,7,5,7,4,5): s.push(x)\nres=[s.pop(),s.pop(),s.pop(),s.pop()]`,exp:`[5,7,5,4]`},

{id:'snapshot-array',n:1146,t:'Snapshot Array',d:'M',tg:['Design','Binary Search'],pat:'Versioned Cells',
br:'An array with snap() and get(index, snap_id).',
bt:'O(n) snap',bs:'O(n·snaps)',ot:'O(1) snap, O(log s) get',os:'O(changes)',
b:r`class SnapshotArray:
    def __init__(self, length: int):
        self.cur = [0] * length
        self.snaps = []

    def set(self, index: int, val: int) -> None:
        self.cur[index] = val

    def snap(self) -> int:
        self.snaps.append(self.cur[:])  #? copies the whole array on every snapshot
        return len(self.snaps) - 1

    def get(self, index: int, snap_id: int) -> int:
        return self.snaps[snap_id][index]`,
o:r`class SnapshotArray:
    def __init__(self, length: int):
        self.hist = [[(0, 0)] for _ in range(length)]  #! per cell: list of (snap_id, value) changes
        self.id = 0

    def set(self, index: int, val: int) -> None:
        h = self.hist[index]
        if h[-1][0] == self.id:
            h[-1] = (self.id, val)
        else:
            h.append((self.id, val))  #! store only what changed

    def snap(self) -> int:
        self.id += 1  #! O(1): nothing is copied
        return self.id - 1

    def get(self, index: int, snap_id: int) -> int:
        h = self.hist[index]
        i = bisect_right(h, (snap_id, float("inf"))) - 1  #! last change at or before snap_id
        return h[i][1]`,
trick:'Don’t copy the array. Per cell, record (snap_id, value) only when it changes, then binary-search the history.',
real:'Version control and MVCC databases: cheap snapshots through copy-on-write.',
viz:{flow:[f('Cell 0 history starts as [(snap 0, value 0)].',['(0,0)'],{aux:[['cell 0','(0,0)']]}),
 f('set(0,5) then snap() → id 0 is frozen. History for cell 0: (0,5).',['(0,5)'],{h:[0],aux:[['snap_id',0]]}),
 f('set(0,6) then snap() → id 1. Cell 0 now has two changes.',['(0,5)','(1,6)'],{h:[1],aux:[['snap_id',1]]}),
 f('get(0, snap 0): binary-search the last change with id ≤ 0 → value 5.',['(0,5)','(1,6)'],{g:[0],aux:[['answer',5]]})]},
test:`s=SnapshotArray(3);s.set(0,5);r=[s.snap()];s.set(0,6);r+=[s.get(0,0),s.snap(),s.get(0,1),s.get(1,1)];res=r`,exp:`[0,5,1,6,0]`},

{id:'design-twitter',n:355,t:'Design Twitter',d:'M',tg:['Design','Heap','Hash Map'],pat:'Merge K Sorted Feeds',
br:'Post tweets, follow/unfollow, and fetch the 10 most recent tweets from you and your followees.',
bt:'O(T) feed',bs:'O(T)',ot:'O(F + 10 log F) feed',os:'O(T)',
b:r`class Twitter:
    def __init__(self):
        self.t = 0
        self.tweets = []
        self.f = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.t += 1
        self.tweets.append((self.t, userId, tweetId))

    def getNewsFeed(self, userId: int) -> List[int]:
        mine = self.f[userId] | {userId}
        feed = [x for x in self.tweets if x[1] in mine]  #? scans every tweet ever posted
        feed.sort(reverse=True)
        return [x[2] for x in feed[:10]]

    def follow(self, followerId: int, followeeId: int) -> None:
        self.f[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.f[followerId].discard(followeeId)`,
o:r`class Twitter:
    def __init__(self):
        self.t = 0
        self.tw = defaultdict(list)  # user -> [(-time, tweetId)]
        self.f = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.t -= 1  # negative time: smaller = newer for a min-heap
        self.tw[userId].append((self.t, tweetId))

    def getNewsFeed(self, userId: int) -> List[int]:
        heap = []
        for v in self.f[userId] | {userId}:
            if self.tw[v]:
                i = len(self.tw[v]) - 1
                t, tid = self.tw[v][i]
                heap.append((t, tid, v, i))
        heapify(heap)  #! one entry per followee: their newest tweet
        res = []
        while heap and len(res) < 10:
            t, tid, v, i = heappop(heap)  #! newest tweet overall (merge of k sorted lists)
            res.append(tid)
            if i > 0:
                t2, tid2 = self.tw[v][i - 1]
                heappush(heap, (t2, tid2, v, i - 1))
        return res

    def follow(self, followerId: int, followeeId: int) -> None:
        self.f[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.f[followerId].discard(followeeId)`,
trick:'Each user’s tweets are already time-ordered. The feed is "merge k sorted lists, stop after 10", a heap of each followee’s newest tweet.',
real:'Timeline fan-in for social feeds, activity streams and log aggregation.',
viz:{flow:[f('You follow A and B. Each has their own newest-first list.',['A: 9','A: 6','A: 2'],{aux:[['B',8,5,3]]}),
 f('Heap starts with each person’s newest: 9 (A) and 8 (B). Pop the largest → 9.',['A: 9','A: 6','A: 2'],{h:[0],aux:[['feed',9],['heap',8,6]]}),
 f('Push A’s next (6). Heap [8,6]. Pop → 8.',['A: 9','A: 6','A: 2'],{h:[1],aux:[['feed',9,8],['heap',6,5]]}),
 f('We never touch older tweets than we need, 10 pops at most.',['A: 9','A: 6','A: 2'],{g:[0,1],aux:[['feed',9,8,6,5,'…']]})]},
test:`tw=Twitter();tw.postTweet(1,5);r=[tw.getNewsFeed(1)];tw.follow(1,2);tw.postTweet(2,6);r+=[tw.getNewsFeed(1)];tw.unfollow(1,2);r+=[tw.getNewsFeed(1)];res=r`,exp:`[[5],[6,5],[5]]`},

{id:'design-hashmap',n:706,t:'Design HashMap',d:'E',tg:['Design','Hash Table'],pat:'Bucket Chaining',
br:'Build put/get/remove without a built-in hash table.',
bt:'O(1)',bs:'O(10⁶) always',ot:'O(1) avg',os:'O(n + buckets)',
b:r`class MyHashMap:
    def __init__(self):
        self.a = [-1] * 1000001  #? a million slots whether you use them or not

    def put(self, key: int, value: int) -> None:
        self.a[key] = value

    def get(self, key: int) -> int:
        return self.a[key]

    def remove(self, key: int) -> None:
        self.a[key] = -1`,
o:r`class MyHashMap:
    def __init__(self):
        self.n = 769  #! a prime bucket count spreads keys evenly
        self.b = [[] for _ in range(self.n)]

    def put(self, key: int, value: int) -> None:
        bucket = self.b[key % self.n]
        for p in bucket:
            if p[0] == key:
                p[1] = value
                return
        bucket.append([key, value])  #! chaining: colliding keys share a bucket

    def get(self, key: int) -> int:
        for k, v in self.b[key % self.n]:
            if k == key:
                return v
        return -1

    def remove(self, key: int) -> None:
        bucket = self.b[key % self.n]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                return`,
trick:'hash(key) % buckets picks a bucket; collisions chain inside it. Keep the bucket count prime and the chains stay short.',
real:'This is literally how dict / HashMap / Redis hash tables work.',
viz:{flow:[f('4 buckets for illustration. Insert keys 1, 5, 2, 9: 1 % 4 = 1, 5 % 4 = 1, 2 % 4 = 2, 9 % 4 = 1.',[0,1,2,3],{aux:[['bucket 1',1,5,9],['bucket 2',2]]}),
 f('Keys 1, 5 and 9 collide in bucket 1 → they form a short chain.',[0,1,2,3],{h:[1],aux:[['bucket 1',1,5,9],['bucket 2',2]]}),
 f('get(9): jump to bucket 9 % 4 = 1 and walk its chain (3 items), not the whole table.',[0,1,2,3],{g:[1],aux:[['walked',1,5,9],['found',9]]})]},
test:`m=MyHashMap();m.put(1,1);m.put(2,2);r=[m.get(1),m.get(3)];m.put(2,1);r+=[m.get(2)];m.remove(2);r+=[m.get(2)];m.put(770,5);r+=[m.get(770),m.get(1)];res=r`,exp:`[1,-1,1,-1,5,1]`},

{id:'design-circular-queue',n:622,t:'Design Circular Queue',d:'M',tg:['Design','Queue','Array'],pat:'Ring Buffer',
br:'A fixed-capacity queue where space is reused as items leave.',
bt:'O(n) dequeue',bs:'O(k)',ot:'O(1) all',os:'O(k)',
b:r`class MyCircularQueue:
    def __init__(self, k: int):
        self.k = k
        self.q = []

    def enQueue(self, value: int) -> bool:
        if len(self.q) == self.k:
            return False
        self.q.append(value)
        return True

    def deQueue(self) -> bool:
        if not self.q:
            return False
        self.q.pop(0)  #? shifts every remaining element
        return True

    def Front(self) -> int:
        return self.q[0] if self.q else -1

    def Rear(self) -> int:
        return self.q[-1] if self.q else -1

    def isEmpty(self) -> bool:
        return not self.q

    def isFull(self) -> bool:
        return len(self.q) == self.k`,
o:r`class MyCircularQueue:
    def __init__(self, k: int):
        self.a = [0] * k
        self.k = k
        self.h = 0  # head index
        self.n = 0  # items stored

    def enQueue(self, value: int) -> bool:
        if self.n == self.k:
            return False
        self.a[(self.h + self.n) % self.k] = value  #! write at the tail, wrapping around
        self.n += 1
        return True

    def deQueue(self) -> bool:
        if self.n == 0:
            return False
        self.h = (self.h + 1) % self.k  #! just advance the head, nothing shifts
        self.n -= 1
        return True

    def Front(self) -> int:
        return self.a[self.h] if self.n else -1

    def Rear(self) -> int:
        return self.a[(self.h + self.n - 1) % self.k] if self.n else -1

    def isEmpty(self) -> bool:
        return self.n == 0

    def isFull(self) -> bool:
        return self.n == self.k`,
trick:'Never move data. Keep a head index and a count; the tail is (head + count) % capacity, so indexes wrap around.',
real:'Ring buffers: network packet queues, audio streams, logging, producer/consumer pipes.',
viz:{flow:[f('Capacity 3. Enqueue 1, 2, 3 → the buffer is full.',[1,2,3],{p:{head:0,tail:2},g:[0,1,2]}),
 f('dequeue(): only the head index moves. Slot 0 is free again.',[1,2,3],{p:{head:1,tail:2},x:[0]}),
 f('enqueue(4): tail = (1 + 2) % 3 = 0 → it wraps around into the freed slot.',[4,2,3],{p:{head:1,tail:0},h:[0]}),
 f('Rear() = 4 and Front() = 2. No element was ever shifted.',[4,2,3],{p:{head:1,tail:0},g:[1,0]})]},
test:`q=MyCircularQueue(3);res=[q.enQueue(1),q.enQueue(2),q.enQueue(3),q.enQueue(4),q.Rear(),q.isFull(),q.deQueue(),q.enQueue(4),q.Rear()]`,exp:`[True,True,True,False,3,True,True,True,4]`},

{id:'implement-queue-using-stacks',n:232,t:'Implement Queue using Stacks',d:'E',tg:['Design','Stack','Queue'],pat:'Two Stacks (Lazy Reverse)',
br:'Build a FIFO queue using only stack operations.',
bt:'O(n) push',bs:'O(n)',ot:'O(1) amortised',os:'O(n)',
b:r`class MyQueue:
    def __init__(self):
        self.s = []

    def push(self, x: int) -> None:
        tmp = []
        while self.s:
            tmp.append(self.s.pop())  #? pour everything out...
        self.s.append(x)
        while tmp:
            self.s.append(tmp.pop())  #? ...and back in on every push

    def pop(self) -> int:
        return self.s.pop()

    def peek(self) -> int:
        return self.s[-1]

    def empty(self) -> bool:
        return not self.s`,
o:r`class MyQueue:
    def __init__(self):
        self.inp = []
        self.out = []

    def push(self, x: int) -> None:
        self.inp.append(x)

    def _move(self):
        if not self.out:
            while self.inp:
                self.out.append(self.inp.pop())  #! reverse only when out is empty

    def pop(self) -> int:
        self._move()
        return self.out.pop()

    def peek(self) -> int:
        self._move()
        return self.out[-1]

    def empty(self) -> bool:
        return not self.inp and not self.out`,
trick:'Reversing a stack twice restores order. Push into "in", and only when "out" runs dry pour "in" into it, every element moves at most once.',
real:'Amortised analysis made visible; the same trick builds queues in functional languages.',
viz:{flow:[f('push(1), push(2), push(3): they pile up in the IN stack (top is the right).',['in: 1','in: 2','in: 3'],{aux:[['in',1,2,3],['out']]}),
 f('pop(): OUT is empty → pour IN into OUT. The order flips: 3 at the bottom, 1 on top.',['out: 3','out: 2','out: 1'],{aux:[['in'],['out',3,2,1]]}),
 f('Pop OUT’s top → 1, the oldest element. FIFO ✓.',['out: 3','out: 2','out: 1'],{x:[2],aux:[['in'],['out',3,2]]}),
 f('Later pops reuse OUT without pouring again. Each element moved only once → amortised O(1).',['out: 3','out: 2'],{g:[1],aux:[['moves per item',1]]})]},
test:`q=MyQueue();q.push(1);q.push(2);r=[q.peek(),q.pop(),q.empty()];q.pop();r+=[q.empty()];res=r`,exp:`[1,1,False,True]`},

{id:'design-browser-history',n:1472,t:'Design Browser History',d:'M',tg:['Design','Array','Pointers'],pat:'Array + Cursor',
br:'visit / back / forward over a tab’s history.',
bt:'O(n) visit',bs:'O(n)',ot:'O(1) all',os:'O(n)',
b:r`class BrowserHistory:
    def __init__(self, homepage: str):
        self.h = [homepage]
        self.i = 0

    def visit(self, url: str) -> None:
        self.h = self.h[:self.i + 1]  #? copies the kept part on every visit
        self.h.append(url)
        self.i += 1

    def back(self, steps: int) -> str:
        self.i = max(0, self.i - steps)
        return self.h[self.i]

    def forward(self, steps: int) -> str:
        self.i = min(len(self.h) - 1, self.i + steps)
        return self.h[self.i]`,
o:r`class BrowserHistory:
    def __init__(self, homepage: str):
        self.h = [homepage]
        self.i = 0  # current page
        self.n = 1  # number of valid pages

    def visit(self, url: str) -> None:
        self.i += 1
        if self.i == len(self.h):
            self.h.append(url)
        else:
            self.h[self.i] = url  #! overwrite the old "forward" page, no slicing
        self.n = self.i + 1  #! moving the end marker forgets the forward history

    def back(self, steps: int) -> str:
        self.i = max(0, self.i - steps)
        return self.h[self.i]

    def forward(self, steps: int) -> str:
        self.i = min(self.n - 1, self.i + steps)
        return self.h[self.i]`,
trick:'History is an array and a cursor. visit() writes at cursor+1 and moves the end marker; back/forward only move the cursor within [0, end).',
real:'Undo/redo stacks in editors; navigation stacks in mobile apps.',
viz:{flow:[f('Pages: [leetcode, google, facebook, youtube]. Cursor at youtube.',['leetcode','google','facebook','youtube'],{p:{cur:3}}),
 f('back(2) → cursor moves to google. Nothing is deleted yet.',['leetcode','google','facebook','youtube'],{p:{cur:1},h:[1]}),
 f('visit(linkedin): write at cursor + 1, then set end = 3. facebook/youtube are now unreachable.',['leetcode','google','linkedin','youtube'],{p:{cur:2},h:[2],x:[3]}),
 f('forward(2) can only go as far as the end marker → stays at linkedin.',['leetcode','google','linkedin','youtube'],{p:{cur:2},g:[2]})]},
test:`b=BrowserHistory("leetcode.com");b.visit("google.com");b.visit("facebook.com");b.visit("youtube.com");r=[b.back(1),b.back(1),b.forward(1)];b.visit("linkedin.com");r+=[b.forward(2),b.back(2),b.back(7)];res=r`,exp:`["facebook.com","google.com","facebook.com","linkedin.com","google.com","leetcode.com"]`},

{id:'random-pick-with-weight',n:528,t:'Random Pick with Weight',d:'M',tg:['Math','Binary Search','Prefix Sum','Randomized'],pat:'Prefix Sums + Bisect',
br:'Pick index i with probability w[i] / sum(w).',
bt:'O(1) pick, O(sum w) memory',bs:'O(sum w)',ot:'O(log n) pick',os:'O(n)',
b:r`import random

class Solution:
    def __init__(self, w: List[int]):
        self.pool = [i for i, x in enumerate(w) for _ in range(x)]  #? one entry per unit of weight

    def pickIndex(self) -> int:
        return random.choice(self.pool)`,
o:r`import random
from itertools import accumulate

class Solution:
    def __init__(self, w: List[int]):
        self.pre = list(accumulate(w))  #! prefix sums cut [1, total] into weighted buckets
        self.total = self.pre[-1]

    def pickIndex(self) -> int:
        r = random.randint(1, self.total)
        return bisect_left(self.pre, r)  #! the bucket that r falls into`,
trick:'Lay the weights end to end on a number line. A uniform random point lands in index i’s segment with probability w[i]/total, find the segment with binary search.',
real:'Weighted sampling: sampling tokens from a distribution (temperature/top-p), load balancing, reservoir mixes.',
viz:{flow:[f('Weights [1,3,2] → prefix sums [1,4,6]. Think of a line from 1 to 6 split into segments 1 | 2-4 | 5-6.',[1,3,2],{aux:[['prefix',1,4,6]]}),
 f('Draw r = 5 uniformly from 1..6.',[1,3,2],{aux:[['prefix',1,4,6],['r',5]]}),
 f('Binary search the first prefix ≥ 5: 1 < 5, 4 < 5, 6 ≥ 5 → index 2.',[1,3,2],{h:[2],aux:[['prefix',1,4,6],['r',5]]}),
 f('Index 1 owns 3 of the 6 points → picked 50% of the time, as required.',[1,3,2],{g:[1],aux:[['P(index 1)','3/6']]})]},
test:`random.seed(1)\ns=Solution([1,3])\nc=Counter(s.pickIndex() for _ in range(4000))\nres=[700<c[0]<1300,2700<c[1]<3300,Solution([5]).pickIndex()]`,exp:`[True,True,0]`},

{id:'shuffle-an-array',n:384,t:'Shuffle an Array',d:'M',tg:['Math','Randomized'],pat:'Fisher-Yates',
br:'Return a uniformly random permutation, and support reset().',
bt:'O(n²)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`import random

class Solution:
    def __init__(self, nums: List[int]):
        self.orig = nums[:]

    def reset(self) -> List[int]:
        return self.orig

    def shuffle(self) -> List[int]:
        pool = self.orig[:]
        res = []
        while pool:
            res.append(pool.pop(random.randrange(len(pool))))  #? popping from the middle shifts elements: O(n) each
        return res`,
o:r`import random

class Solution:
    def __init__(self, nums: List[int]):
        self.orig = nums[:]

    def reset(self) -> List[int]:
        return self.orig

    def shuffle(self) -> List[int]:
        a = self.orig[:]
        for i in range(len(a) - 1, 0, -1):
            j = random.randint(0, i)  #! pick from the not-yet-fixed prefix
            a[i], a[j] = a[j], a[i]  #! lock position i for good
        return a`,
trick:'Walk from the back. For slot i pick a random j ≤ i and swap. Each of the n! orders has exactly the same chance.',
real:'Shuffling datasets/minibatches for training, randomised experiments, card games.',
viz:{flow:[f('Array [1,2,3,4]. Start at the last slot (i = 3); pick j in 0..3.',[1,2,3,4],{p:{i:3},w:[0,3]}),
 f('j = 1 → swap positions 3 and 1. Position 3 is now locked.',[1,4,3,2],{h:[1,3],g:[3]}),
 f('i = 2: pick j in 0..2 → j = 0. Swap and lock position 2.',[3,4,1,2],{h:[0,2],g:[2,3]}),
 f('i = 1: pick j in 0..1 → j = 1 (stay). Done: the last slot is forced.',[3,4,1,2],{g:[1,2,3]})]},
test:`s=Solution([1,2,3,4,5])\nres=[sorted(s.shuffle()),s.reset(),len({tuple(s.shuffle()) for _ in range(200)})>30]`,exp:`[[1,2,3,4,5],[1,2,3,4,5],True]`},

{id:'random-pick-index',n:398,t:'Random Pick Index',d:'M',tg:['Math','Reservoir Sampling','Randomized'],pat:'Reservoir Sampling',
br:'Return a random index among those equal to target.',
bt:'O(n) time + O(n) memory per pick',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`import random

class Solution:
    def __init__(self, nums: List[int]):
        self.nums = nums

    def pick(self, target: int) -> int:
        idx = [i for i, x in enumerate(self.nums) if x == target]  #? materialises every matching index
        return random.choice(idx)`,
o:r`import random

class Solution:
    def __init__(self, nums: List[int]):
        self.nums = nums

    def pick(self, target: int) -> int:
        res, seen = -1, 0
        for i, x in enumerate(self.nums):
            if x == target:
                seen += 1
                if random.randrange(seen) == 0:  #! keep the k-th match with probability 1/k
                    res = i
        return res`,
trick:'Reservoir sampling: the k-th match replaces the current pick with probability 1/k. Every match ends up equally likely, with O(1) memory.',
real:'Sampling from a stream of unknown length: log sampling, telemetry, mini-batch selection.',
viz:{flow:[f('nums = [1,2,3,3,3], target 3. Matches are at indices 2, 3, 4.',[1,2,3,3,3],{aux:[['pick','-']]}),
 f('Index 2 is the 1st match: keep it with probability 1/1 = 100%.',[1,2,3,3,3],{h:[2],aux:[['pick',2],['seen',1]]}),
 f('Index 3 is the 2nd match: replace with probability 1/2.',[1,2,3,3,3],{h:[3],aux:[['pick','2 or 3'],['seen',2]]}),
 f('Index 4 is the 3rd match: replace with probability 1/3 → every match has ended with exactly 1/3.',[1,2,3,3,3],{g:[2,3,4],aux:[['each index','1/3'],['seen',3]]})]},
test:`s=Solution([1,2,3,3,3])\nc=Counter(s.pick(3) for _ in range(3000))\nres=[sorted(c),all(800<v<1200 for v in c.values()),s.pick(1)]`,exp:`[[2,3,4],True,0]`},

{id:'simplify-path',n:71,t:'Simplify Path',d:'M',tg:['String','Stack'],pat:'Path Stack',
br:'Turn a Unix path into its canonical form.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def simplifyPath(self, path: str) -> str:
        res, cur = [], ""
        for ch in path + "/":  #? hand-rolled tokenizer
            if ch == "/":
                if cur == "..":
                    if res:
                        res.pop()
                elif cur and cur != ".":
                    res.append(cur)
                cur = ""
            else:
                cur += ch  #? builds each name one character at a time
        return "/" + "/".join(res)`,
o:r`class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []
        for part in path.split("/"):  #! split does the tokenising for us
            if part == "..":
                if stack:
                    stack.pop()  #! ".." climbs one level up
            elif part and part != ".":
                stack.append(part)  #! a real folder name
        return "/" + "/".join(stack)`,
trick:'Split on "/". Skip empty and ".". ".." pops the stack. Everything else is pushed. Join with "/".',
real:'Path normalisation in file systems, web servers and static-site routers (and path-traversal defence).',
viz:{flow:[f('Path "/a/./b/../../c/" splits into: a, ., b, .., .., c.',['a','.','b','..','..','c'],{aux:[['stack']]}),
 f('"a" is a real folder → push.',['a','.','b','..','..','c'],{h:[0],aux:[['stack','a']]}),
 f('"." means "here" → skip. "b" → push.',['a','.','b','..','..','c'],{h:[2],aux:[['stack','a','b']]}),
 f('".." → pop b. Another ".." → pop a.',['a','.','b','..','..','c'],{h:[3,4],aux:[['stack']]}),
 f('"c" → push. Result "/c".',['a','.','b','..','..','c'],{g:[5],aux:[['stack','c'],['path','/c']]})]},
test:`s=Solution();res=[s.simplifyPath("/home/"),s.simplifyPath("/home//foo/"),s.simplifyPath("/../"),s.simplifyPath("/a/./b/../../c/"),s.simplifyPath("/...")]`,exp:`["/home","/home/foo","/","/c","/..."]`},

{id:'basic-calculator-ii',n:227,t:'Basic Calculator II',d:'M',tg:['String','Stack','Math'],pat:'Last-Operator Stack',
br:'Evaluate an expression with + − * / and no parentheses.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def calculate(self, s: str) -> int:
        tokens, num = [], 0
        for ch in s.replace(" ", "") + "+":
            if ch.isdigit():
                num = num * 10 + int(ch)
            else:
                tokens.append(num)
                tokens.append(ch)
                num = 0
        tokens.pop()  # drop the sentinel "+"
        stack = [tokens[0]]  #? pass 1: fold * and / into terms
        i = 1
        while i < len(tokens):
            op, val = tokens[i], tokens[i + 1]
            if op == "*":
                stack[-1] *= val
            elif op == "/":
                stack[-1] = int(stack[-1] / val)
            else:
                stack.extend([op, val])
            i += 2
        res = stack[0]  #? pass 2: add and subtract the terms
        for j in range(1, len(stack), 2):
            res += stack[j + 1] if stack[j] == "+" else -stack[j + 1]
        return res`,
o:r`class Solution:
    def calculate(self, s: str) -> int:
        stack, num, op = [], 0, "+"
        for i, ch in enumerate(s):
            if ch.isdigit():
                num = num * 10 + int(ch)
            if ch in "+-*/" or i == len(s) - 1:  #! an operator (or the end) finishes the previous number
                if op == "+":
                    stack.append(num)
                elif op == "-":
                    stack.append(-num)
                elif op == "*":
                    stack.append(stack.pop() * num)  #! * and / bind tighter: fold into the last term now
                else:
                    stack.append(int(stack.pop() / num))
                op, num = ch, 0
        return sum(stack)`,
trick:'Remember the operator BEFORE each number. + / − push the number (signed); * / / combine it with the top of the stack immediately. Answer = sum(stack).',
real:'Expression parsers: spreadsheets, query-language WHERE clauses, config evaluators.',
viz:{flow:[f('Expression "3+2*2". Keep a stack of terms; the previous operator decides what to do with each number.',['3','+','2','*','2'],{aux:[['stack']]}),
 f('Reach "+": the previous op was "+", so push 3.',['3','+','2','*','2'],{h:[0],aux:[['stack',3],['op','+']]}),
 f('Reach "*": previous op "+" → push 2.',['3','+','2','*','2'],{h:[2],aux:[['stack',3,2],['op','*']]}),
 f('End of input: previous op "*" → pop 2, multiply by 2, push 4.',['3','+','2','*','2'],{h:[4],aux:[['stack',3,4]]}),
 f('Answer = sum(stack) = 3 + 4 = 7.',['3','+','2','*','2'],{g:[0,2,4],aux:[['answer',7]]})]},
test:`s=Solution();res=[s.calculate("3+2*2"),s.calculate(" 3/2 "),s.calculate(" 3+5 / 2 "),s.calculate("14-3/2"),s.calculate("1-1+1")]`,exp:`[7,1,5,13,1]`},

{id:'text-justification',n:68,t:'Text Justification',d:'H',tg:['String','Simulation'],pat:'Greedy Line Packing',
br:'Pack words into lines of exactly maxWidth, spreading extra spaces evenly (left-heavy); the last line is left-justified.',
bt:'O(total chars)',bs:'O(total chars)',ot:'O(total chars)',os:'O(total chars)',
b:r`class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        res, i = [], 0
        while i < len(words):
            j, length = i, 0
            while j < len(words) and length + len(words[j]) + (j - i) <= maxWidth:
                length += len(words[j])
                j += 1
            line, gaps = words[i:j], j - i - 1
            if j == len(words) or gaps == 0:
                s = " ".join(line)
                s += " " * (maxWidth - len(s))
            else:
                spaces = [0] * gaps
                for t in range(maxWidth - length):
                    spaces[t % gaps] += 1  #? hands out spaces one at a time, round-robin
                s = ""
                for k in range(gaps):
                    s += line[k] + " " * spaces[k]
                s += line[-1]
            res.append(s)
            i = j
        return res`,
o:r`class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        res, i = [], 0
        while i < len(words):
            j, length = i, 0
            while j < len(words) and length + len(words[j]) + (j - i) <= maxWidth:
                length += len(words[j])  #! greedy: take words while they fit with 1 space between
                j += 1
            line, gaps = words[i:j], j - i - 1
            if j == len(words) or gaps == 0:
                s = " ".join(line)
                s += " " * (maxWidth - len(s))  #! last line / single word: left-justify
            else:
                space, extra = divmod(maxWidth - length, gaps)  #! even share + leftovers for the leftmost gaps
                s = ""
                for k, w in enumerate(line[:-1]):
                    s += w + " " * (space + (1 if k < extra else 0))
                s += line[-1]
            res.append(s)
            i = j
        return res`,
trick:'Greedy-fill each line. Spaces per gap = divmod(extra spaces, gaps): everyone gets the quotient, the first "remainder" gaps get one more.',
real:'Text layout engines, terminal formatters and PDF/typesetting line breaking.',
viz:{flow:[f('Width 16. Words: This, is, an, example, of … Greedily add words while they fit with single spaces.',['This','is','an','example','of','text'],{w:[0,0]}),
 f('"This is an" = 8 letters + 2 minimum spaces = 10 ≤ 16. Adding "example" (7) would need 18 → stop.',['This','is','an','example','of','text'],{w:[0,2],x:[3]}),
 f('Spaces to distribute: 16 − 8 letters = 8, over 2 gaps → 4 each.',['This','is','an','example','of','text'],{w:[0,2],aux:[['spaces',8],['gaps',2],['each',4]]}),
 f('Line 1 = "This    is    an". The last line is left-justified instead.',['This','is','an','example','of','text'],{g:[0,1,2],aux:[['line 1','This····is····an']]})]},
test:`s=Solution();res=[s.fullJustify(["This","is","an","example","of","text","justification."],16),s.fullJustify(["What","must","be","acknowledgment","shall","be"],16)]`,exp:`[["This    is    an","example  of text","justification.  "],["What   must   be","acknowledgment  ","shall be        "]]`},

{id:'flood-fill',n:733,t:'Flood Fill',d:'E',tg:['Graph','BFS','DFS','Matrix'],pat:'Grid BFS',
br:'Repaint the connected region of the starting pixel with a new colour.',
bt:'O(m·n)',bs:'O(m·n) stack',ot:'O(m·n)',os:'O(m·n) queue',
b:r`class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        old = image[sr][sc]
        if old == color:
            return image
        def dfs(r, c):
            if r < 0 or c < 0 or r >= len(image) or c >= len(image[0]) or image[r][c] != old:
                return
            image[r][c] = color
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)  #? recursion depth can reach rows × cols
        dfs(sr, sc)
        return image`,
o:r`class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        old = image[sr][sc]
        if old == color:
            return image  #! same colour: nothing to do (and no infinite loop)
        q = deque([(sr, sc)])
        image[sr][sc] = color  #! paint on enqueue: the new colour doubles as "visited"
        while q:
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < len(image) and 0 <= nc < len(image[0]) and image[nr][nc] == old:
                    image[nr][nc] = color
                    q.append((nr, nc))
        return image`,
trick:'Spread from the start to 4-neighbours that still have the old colour. Painting immediately is your visited marker. Guard: new colour == old colour.',
real:'The paint-bucket tool, image segmentation, connected-component labelling.',
viz:{flow:[f('Image with start pixel (1,1) and new colour 2. Only the 4-connected region of 1s changes; the diagonal 1 does not.',null,gr([[1,1,1],[1,1,0],[1,0,1]],[1,1])),
 f('Paint the start pixel and put it in the queue.',null,gr([[1,1,1],[1,2,0],[1,0,1]],[1,1])),
 f('Its neighbours (0,1) and (1,0) are 1s → paint them and enqueue. (2,1) and (1,2) are 0 → ignored.',null,gr([[1,2,1],[2,2,0],[1,0,1]])),
 f('From those two: (0,0), (0,2) and (2,0) get painted. Painting on enqueue means nothing is queued twice.',null,gr([[2,2,2],[2,2,0],[2,0,1]])),
 f('Queue empty. The bottom-right 1 touches the region only diagonally, so it keeps its colour.',null,gr([[2,2,2],[2,2,0],[2,0,1]]))]},
test:`s=Solution();res=[s.floodFill([[1,1,1],[1,1,0],[1,0,1]],1,1,2),s.floodFill([[0,0,0],[0,0,0]],0,0,0)]`,exp:`[[[2,2,2],[2,2,0],[2,0,1]],[[0,0,0],[0,0,0]]]`}
);
})();
