/* p4, graphs, union-find, backtracking */
(function(){const r=String.raw,f=DR.f;
const grid=(rows,cls)=>({v:rows,c:rows.map((row,i)=>row.map((x,j)=>(cls&&cls(i,j,x))||''))});
DR.add(
{id:'number-of-islands',n:200,t:'Number of Islands',d:'M',tg:['Graph','DFS','Matrix'],pat:'Flood Fill',
br:'Count the groups of connected land cells in a grid.',
bt:'O(m·n)',bs:'O(m·n)',ot:'O(m·n)',os:'O(m·n) stack worst',
b:r`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        R, C = len(grid), len(grid[0])
        visited = set()  #? a separate visited set costs extra memory
        def dfs(r, c):
            if not (0 <= r < R and 0 <= c < C) or grid[r][c] == "0" or (r, c) in visited:
                return
            visited.add((r, c))
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                dfs(r + dr, c + dc)
        count = 0
        for r in range(R):
            for c in range(C):
                if grid[r][c] == "1" and (r, c) not in visited:
                    count += 1
                    dfs(r, c)
        return count`,
o:r`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        R, C, count = len(grid), len(grid[0]), 0
        for r in range(R):
            for c in range(C):
                if grid[r][c] == "1":
                    count += 1  #! unvisited land = a brand-new island
                    stack = [(r, c)]
                    grid[r][c] = "0"  #! "sink" the land in place, no visited set
                    while stack:  #! iterative DFS: no recursion-depth limit
                        x, y = stack.pop()
                        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                            if 0 <= nx < R and 0 <= ny < C and grid[nx][ny] == "1":
                                grid[nx][ny] = "0"
                                stack.append((nx, ny))
        return count`,
trick:'"Count connected blobs" → scan; on unvisited land, count +1 and flood-fill the whole blob so it is never counted again.',
real:'Connected-component labelling: image regions, clusters, contiguous free memory.',
viz:{sim:'flood',grid:['11000','11000','00100','00011']},
test:`g=lambda a:[list(r) for r in a]\nres=[Solution().numIslands(g(["11110","11010","11000","00000"])),Solution().numIslands(g(["11000","11000","00100","00011"]))]`,exp:`[1,3]`},

{id:'clone-graph',n:133,t:'Clone Graph',d:'M',tg:['Graph','DFS','Hash Map'],pat:'Old → New Map',
br:'Deep-copy an undirected connected graph.',
bt:'O(V+E)',bs:'O(V)',ot:'O(V+E)',os:'O(V)',
b:r`class Solution:
    def cloneGraph(self, node: 'Optional[Node]') -> 'Optional[Node]':
        if not node:
            return None
        order, seen, q = [], {node}, deque([node])
        while q:  #? pass 1: discover every node
            cur = q.popleft()
            order.append(cur)
            for nb in cur.neighbors:
                if nb not in seen:
                    seen.add(nb)
                    q.append(nb)
        clone = {n: Node(n.val) for n in order}  #? pass 2: create copies
        for n in order:  #? pass 3: wire the edges
            clone[n].neighbors = [clone[nb] for nb in n.neighbors]
        return clone[node]`,
o:r`class Solution:
    def cloneGraph(self, node: 'Optional[Node]') -> 'Optional[Node]':
        if not node:
            return None
        clone = {}  #! old node → its copy; doubles as the visited set
        def dfs(n):
            if n in clone:
                return clone[n]  #! already copied (breaks cycles)
            clone[n] = Node(n.val)
            clone[n].neighbors = [dfs(nb) for nb in n.neighbors]  #! copy neighbours while descending
            return clone[n]
        return dfs(node)`,
trick:'"Copy a graph" → one dictionary old→new. Check it before recursing: that stops infinite loops on cycles.',
real:'Deep-copying object graphs and compute graphs.',
viz:{sim:'graph',nodes:[[100,60],[400,60],[400,190],[100,190]],edges:[[0,1],[1,2],[2,3],[3,0]],start:0,mode:'bfs'},
test:`n=[Node(i) for i in range(1,5)]\nfor i,j in [(0,1),(1,2),(2,3),(3,0)]:\n    n[i].neighbors.append(n[j]); n[j].neighbors.append(n[i])\nc=Solution().cloneGraph(n[0])\nseen={}\nst=[c]\nwhile st:\n    x=st.pop()\n    if x.val in seen: continue\n    seen[x.val]=x; st+=x.neighbors\nold={id(x) for x in n}\nres=(sorted((v,sorted(y.val for y in x.neighbors)) for v,x in seen.items()),all(id(x) not in old for x in seen.values()))`,exp:`([(1,[2,4]),(2,[1,3]),(3,[2,4]),(4,[1,3])],True)`},

{id:'course-schedule',n:207,t:'Course Schedule',d:'M',tg:['Graph','Topological Sort'],pat:"Kahn's Algorithm (in-degree)",
br:'Can all courses be finished given prerequisite pairs? (Is the graph acyclic?)',
bt:'O(V·(V+E))',bs:'O(V)',ot:'O(V+E)',os:'O(V+E)',
b:r`class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        remaining = set(range(numCourses))
        progress = True
        while remaining and progress:  #? rescans every edge after each round
            progress = False
            for c in list(remaining):
                if not any(a == c and b in remaining for a, b in prerequisites):
                    remaining.remove(c)  #! a course with no unfinished prerequisite can be taken
                    progress = True
        return not remaining`,
o:r`class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        adj = defaultdict(list)
        indeg = [0] * numCourses  #! number of unfinished prerequisites per course
        for a, b in prerequisites:
            adj[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        taken = 0
        while q:
            c = q.popleft()
            taken += 1
            for nxt in adj[c]:
                indeg[nxt] -= 1  #! finishing c unlocks its dependents
                if indeg[nxt] == 0:
                    q.append(nxt)
        return taken == numCourses  #! leftovers = a cycle`,
trick:'"Dependencies" → count unmet prerequisites per node; peel off nodes at 0. If you cannot peel everything, there is a cycle.',
real:'Build systems, ML pipeline DAGs, and autograd (backprop runs a topological order).',
viz:{sim:'topo',nodes:[[260,30],[110,120],[410,120],[260,215]],edges:[[0,1],[0,2],[1,3],[2,3]],dir:true},
test:`res=[Solution().canFinish(2,[[1,0]]),Solution().canFinish(2,[[1,0],[0,1]]),Solution().canFinish(4,[[1,0],[2,0],[3,1],[3,2]])]`,exp:`[True,False,True]`},

{id:'course-schedule-ii',n:210,t:'Course Schedule II',d:'M',tg:['Graph','Topological Sort'],pat:'Topological Order',
br:'Return a valid order to take all courses, or [] if impossible.',
bt:'O(V·(V+E))',bs:'O(V)',ot:'O(V+E)',os:'O(V+E)',
b:r`class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        remaining, order = set(range(numCourses)), []
        progress = True
        while remaining and progress:  #? rescans every edge after each round
            progress = False
            for c in sorted(remaining):
                if not any(a == c and b in remaining for a, b in prerequisites):
                    remaining.remove(c)
                    order.append(c)
                    progress = True
        return order if not remaining else []`,
o:r`class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        adj = defaultdict(list)
        indeg = [0] * numCourses
        for a, b in prerequisites:
            adj[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)  #! start with courses that need nothing
        order = []
        while q:
            c = q.popleft()
            order.append(c)  #! the removal order IS the answer
            for nxt in adj[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return order if len(order) == numCourses else []`,
trick:'Same peel-off-zero-in-degree loop as Course Schedule, just record the order you peel in.',
real:'Dependency resolution in package managers and task orchestrators (Airflow-style DAG order).',
viz:{sim:'topo',nodes:[[260,30],[110,120],[410,120],[260,215]],edges:[[0,1],[0,2],[1,3],[2,3]],dir:true},
test:`pre=[[1,0],[2,0],[3,1],[3,2]]\no=Solution().findOrder(4,pre)\npos={c:i for i,c in enumerate(o)}\nres=(len(o)==4 and all(pos[b]<pos[a] for a,b in pre),Solution().findOrder(2,[[0,1],[1,0]]))`,exp:`(True,[])`},

{id:'network-delay-time',n:743,t:'Network Delay Time',d:'M',tg:['Graph','Dijkstra','Heap'],pat:"Dijkstra's Shortest Paths",
br:'Time for a signal from node k to reach every node (or -1).',
bt:'O(V·E)',bs:'O(V)',ot:'O(E log V)',os:'O(V+E)',
b:r`class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        dist = [float("inf")] * (n + 1)
        dist[k] = 0
        for _ in range(n - 1):  #? relax EVERY edge, n−1 times (Bellman-Ford)
            for u, v, w in times:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        worst = max(dist[1:])
        return -1 if worst == float("inf") else worst`,
o:r`class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        adj = defaultdict(list)
        for u, v, w in times:
            adj[u].append((v, w))
        dist = {}
        heap = [(0, k)]  #! always expand the closest unfinished node
        while heap:
            d, u = heapq.heappop(heap)
            if u in dist:
                continue
            dist[u] = d  #! first time popped = final shortest distance
            for v, w in adj[u]:
                if v not in dist:
                    heapq.heappush(heap, (d + w, v))
        return max(dist.values()) if len(dist) == n else -1`,
trick:'"Shortest path, non-negative weights" → a min-heap of (distance, node). The first time a node pops, its distance is final.',
real:'Routing, latency estimation and cheapest-path search over service graphs.',
viz:{sim:'dijkstra',nodes:[[80,125,1],[240,40,2],[240,210,3],[420,125,4]],edges:[[0,1,2],[0,2,5],[1,2,1],[1,3,6],[2,3,2]],start:0,dir:true,answer:5},
test:`res=[Solution().networkDelayTime([[2,1,1],[2,3,1],[3,4,1]],4,2),Solution().networkDelayTime([[1,2,1]],2,2)]`,exp:`[2,-1]`},

{id:'cheapest-flights-within-k-stops',n:787,t:'Cheapest Flights Within K Stops',d:'M',tg:['Graph','Bellman-Ford','DP'],pat:'Bellman-Ford with k+1 Rounds',
br:'Cheapest price from src to dst using at most k stops.',
bt:'O(n^k)',bs:'O(k)',ot:'O(k·E)',os:'O(n)',
b:r`class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        adj = defaultdict(list)
        for a, b, w in flights:
            adj[a].append((b, w))
        best = float("inf")
        def dfs(city, used, cost):
            nonlocal best
            if city == dst:
                best = min(best, cost)
                return
            if used == k + 1:
                return
            for nxt, w in adj[city]:  #? explores every route up to k+1 flights, exponential
                dfs(nxt, used + 1, cost + w)
        dfs(src, 0, 0)
        return -1 if best == float("inf") else best`,
o:r`class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        prices = [float("inf")] * n
        prices[src] = 0
        for _ in range(k + 1):  #! round i = best prices using at most i flights
            nxt = prices[:]  #! copy: each round may extend routes by exactly ONE flight
            for a, b, w in flights:
                if prices[a] + w < nxt[b]:
                    nxt[b] = prices[a] + w
            prices = nxt
        return -1 if prices[dst] == float("inf") else prices[dst]`,
trick:'"At most k hops" → Bellman-Ford: do exactly k+1 rounds of relaxing all edges, reading from last round\'s prices.',
real:'Budgeted path planning: cheapest route with a cap on hops or retries.',
viz:{sim:'bellman',nodes:[[70,120],[230,40],[230,200],[420,120]],edges:[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]],src:0,dst:3,k:1,dir:true},
test:`F=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]\nres=[Solution().findCheapestPrice(4,F,0,3,1),Solution().findCheapestPrice(4,F,0,3,2),Solution().findCheapestPrice(3,[[0,1,100],[1,2,100],[0,2,500]],0,2,0)]`,exp:`[700,400,500]`},

{id:'min-cost-to-connect-all-points',n:1584,t:'Min Cost to Connect All Points',d:'M',tg:['Graph','MST','Union-Find'],pat:'Minimum Spanning Tree',
br:'Connect all points with minimum total Manhattan distance.',
bt:'O(n² log n)',bs:'O(n²)',ot:'O(n²)',os:'O(n)',
b:r`class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        edges = sorted((abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j)
                       for i in range(n) for j in range(i + 1, n))  #? builds and sorts all n² edges
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        cost = 0
        for d, i, j in edges:
            a, b = find(i), find(j)
            if a != b:
                parent[a] = b
                cost += d
        return cost`,
o:r`class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        dist = [float("inf")] * n  #! cheapest edge from the growing tree to each point
        dist[0] = 0
        used = [False] * n
        cost = 0
        for _ in range(n):
            u = min((i for i in range(n) if not used[i]), key=lambda i: dist[i])  #! absorb the cheapest outside point
            used[u] = True
            cost += dist[u]
            for v in range(n):
                if not used[v]:
                    dist[v] = min(dist[v], abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]))
        return cost`,
trick:'"Connect everything cheaply" → grow a tree: always add the cheapest edge leaving it (Prim). On dense graphs use plain arrays, no heap.',
real:'Clustering (single-linkage), network design and hierarchical agglomeration.',
viz:{sim:'uf',mode:'mst',nodes:[[80,50],[230,50],[400,50],[240,190]],edges:[[0,1,1],[1,2,2],[0,2,4],[2,3,3],[1,3,5]]},
test:`res=[Solution().minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]]),Solution().minCostConnectPoints([[3,12],[-2,5],[-4,1]])]`,exp:`[20,18]`},

{id:'redundant-connection',n:684,t:'Redundant Connection',d:'M',tg:['Graph','Union-Find'],pat:'Union-Find Cycle Detection',
br:'A tree got one extra edge. Return the edge that can be removed.',
bt:'O(n²)',bs:'O(n)',ot:'O(n·α(n))',os:'O(n)',
b:r`class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        adj = defaultdict(list)
        def reachable(a, b):
            seen, st = {a}, [a]
            while st:
                x = st.pop()
                if x == b:
                    return True
                for y in adj[x]:
                    if y not in seen:
                        seen.add(y)
                        st.append(y)
            return False
        for a, b in edges:
            if reachable(a, b):  #? a full graph search before every insertion
                return [a, b]
            adj[a].append(b)
            adj[b].append(a)`,
o:r`class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        parent = list(range(len(edges) + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]  #! path compression keeps trees flat
                x = parent[x]
            return x
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return [a, b]  #! already in the same group → this edge closes a cycle
            parent[ra] = rb  #! otherwise merge the two groups`,
trick:'"Does this edge make a loop?" → union-find: if both ends already share a root, it does.',
real:'Detecting redundant links in networks and merging equivalent entities.',
viz:{sim:'uf',mode:'cycle',nodes:[[260,40,1],[100,190,2],[420,190,3]],edges:[[0,1],[0,2],[1,2]]},
test:`res=[Solution().findRedundantConnection([[1,2],[1,3],[2,3]]),Solution().findRedundantConnection([[1,2],[2,3],[3,4],[1,4],[1,5]])]`,exp:`[[2,3],[1,4]]`},

{id:'accounts-merge',n:721,t:'Accounts Merge',d:'M',tg:['Union-Find','Hash Map','String'],pat:'Union-Find on Emails',
br:'Merge accounts that share at least one email.',
bt:'O(n²·k)',bs:'O(n·k)',ot:'O(n·k·α)',os:'O(n·k)',
b:r`class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        groups = []  # each group: [name, set of emails]
        for name, *emails in accounts:
            es = set(emails)
            overlapping = [g for g in groups if g[1] & es]  #? compares with every existing group
            for g in overlapping:
                es |= g[1]
                groups.remove(g)
            groups.append([name, es])
        return [[n] + sorted(es) for n, es in groups]`,
o:r`class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        parent, owner = {}, {}
        def find(x):
            parent.setdefault(x, x)
            if parent[x] != x:
                parent[x] = find(parent[x])  #! path compression
            return parent[x]
        for name, *emails in accounts:
            for e in emails:
                owner[e] = name
                parent[find(e)] = find(emails[0])  #! every email of one account shares a root
        groups = defaultdict(list)
        for e in owner:
            groups[find(e)].append(e)
        return [[owner[root]] + sorted(es) for root, es in groups.items()]`,
trick:'"Merge records that share a key" → treat each shared key as a union. One union-find over the emails, then group by root.',
real:'Entity resolution: collapsing duplicate customer profiles in a CRM or feature store.',
viz:{flow:[f('Four accounts. Accounts 1 and 2 share johnsmith@…, so they belong to the same person.',['A1','A2','A3','A4'],{aux:[['A1','john_newyork, johnsmith'],['A2','johnsmith, john00'],['A3','mary'],['A4','johnnybravo']]}),
 f('Union the emails of A1 under one root.',['A1','A2','A3','A4'],{h:[0],aux:[['group 1','john_newyork','johnsmith']]}),
 f('A2 contains johnsmith (already in group 1) → john00 joins group 1.',['A1','A2','A3','A4'],{h:[1],g:[0,1],aux:[['group 1','john_newyork','johnsmith','john00']]}),
 f('A3 and A4 share nothing → they stay separate. Result: 3 merged accounts, emails sorted.',['A1','A2','A3','A4'],{g:[0,1,2,3],aux:[['group 1','john00','john_newyork','johnsmith'],['group 2','mary'],['group 3','johnnybravo']]})]},
test:`A=[["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]\nres=sorted(Solution().accountsMerge(A))`,exp:`[["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["John","johnnybravo@mail.com"],["Mary","mary@mail.com"]]`},

{id:'word-search',n:79,t:'Word Search',d:'M',tg:['Backtracking','Matrix','DFS'],pat:'DFS Backtracking on a Grid',
br:'Is the word spelled by a path of adjacent cells (no cell reused)?',
bt:'O(m·n·4^L) + copies',bs:'O(L²)',ot:'O(m·n·3^L)',os:'O(L)',
b:r`class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        R, C = len(board), len(board[0])
        def dfs(r, c, i, visited):
            if i == len(word):
                return True
            if not (0 <= r < R and 0 <= c < C) or (r, c) in visited or board[r][c] != word[i]:
                return False
            visited = visited | {(r, c)}  #? copies the whole visited set at every step
            return any(dfs(r + dr, c + dc, i + 1, visited) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        return any(dfs(r, c, 0, frozenset()) for r in range(R) for c in range(C))`,
o:r`class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        R, C = len(board), len(board[0])
        have = Counter(ch for row in board for ch in row)
        if any(have[ch] < n for ch, n in Counter(word).items()):  #! cheap reject: the board lacks the letters
            return False
        def dfs(r, c, i):
            if i == len(word):
                return True
            if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:
                return False
            tmp, board[r][c] = board[r][c], "#"  #! mark the cell as used IN PLACE
            found = dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)
            board[r][c] = tmp  #! backtrack: put the letter back
            return found
        return any(dfs(r, c, 0) for r in range(R) for c in range(C))`,
trick:'"Path in a grid" → choose, explore, un-choose. Mark the cell visited in place and restore it on the way back.',
real:'Constraint search and puzzle solvers; the choose/explore/undo template.',
viz:{flow:(()=>{const B=[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];const path=[[0,0],[0,1],[0,2],[1,2],[2,2],[2,1]];const W='ABCCED';const o=[f('Find "ABCCED". Try every cell as a start; extend one neighbour at a time, never reusing a cell.',null,{grid:grid(B)})];
  path.forEach((p,i)=>o.push(f('Letter '+(i+1)+' = "'+W[i]+'" matches cell ('+p[0]+','+p[1]+')'+(i===path.length-1?' → whole word found ✓':'. Mark it used and look at its neighbours.'),null,{grid:grid(B,(r,c)=>{const k=path.slice(0,i+1).findIndex(q=>q[0]===r&&q[1]===c);return k<0?'':(k===i?'on':(i===path.length-1?'good':'done'));})})));
  return o;})()},
test:`B=lambda:[list(r) for r in ["ABCE","SFCS","ADEE"]]\nres=[Solution().exist(B(),"ABCCED"),Solution().exist(B(),"SEE"),Solution().exist(B(),"ABCB")]`,exp:`[True,True,False]`},

{id:'combination-sum',n:39,t:'Combination Sum',d:'M',tg:['Backtracking','Array'],pat:'Backtracking with a Start Index',
br:'All unique combinations that sum to target; each number may be reused.',
bt:'exponential, all orders',bs:'O(T/m)',ot:'O(n^(T/m)), no repeats',os:'O(T/m)',
b:r`class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        found = set()
        def go(path, total):
            if total == target:
                found.add(tuple(sorted(path)))  #? the same combo is reached in many orders, then de-duplicated
                return
            if total > target:
                return
            for c in candidates:
                go(path + [c], total + c)
        go([], 0)
        return [list(t) for t in found]`,
o:r`class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []
        def go(start, path, total):
            if total == target:
                res.append(path[:])
                return
            for i in range(start, len(candidates)):  #! only look forward → every combination appears once
                if total + candidates[i] > target:
                    continue
                path.append(candidates[i])
                go(i, path, total + candidates[i])  #! i, not i+1: the same number may be reused
                path.pop()  #! undo the choice
        go(0, [], 0)
        return res`,
trick:'"All combinations" → at each level choose from index ≥ start so order cannot repeat; recurse, then undo (append / pop).',
real:'Enumerating configurations (hyper-parameter grids, coin/resource bundles).',
viz:{sim:'bt',expand:p=>{const s=p.reduce((a,b)=>a+b,0);if(s>=5)return [];const last=p.length?p[p.length-1]:0;return [2,3,5].filter(c=>c>=last).map(c=>[...p,c]);},label:p=>p.length?p.join('+'):'∅',good:p=>p.reduce((a,b)=>a+b,0)===5,dead:p=>p.reduce((a,b)=>a+b,0)>5,start_note:'candidates [2,3,5], target 5. Each node is the numbers chosen so far; stop when the sum reaches or passes 5.'},
test:`res=sorted(sorted(x) for x in Solution().combinationSum([2,3,6,7],7))`,exp:`[[2,2,3],[7]]`},

{id:'generate-parentheses',n:22,t:'Generate Parentheses',d:'M',tg:['Backtracking','String'],pat:'Backtrack with open/close Counts',
br:'All well-formed strings with n pairs of parentheses.',
bt:'O(2^(2n)·n)',bs:'O(n)',ot:'O(4^n / √n)',os:'O(n)',
b:r`class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        def valid(s):
            bal = 0
            for c in s:
                bal += 1 if c == "(" else -1
                if bal < 0:
                    return False
            return bal == 0
        res = []
        for bits in itertools.product("()", repeat=2 * n):  #? tries ALL 2^(2n) strings, then filters
            s = "".join(bits)
            if valid(s):
                res.append(s)
        return res`,
o:r`class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        res = []
        def go(s, opened, closed):
            if len(s) == 2 * n:
                res.append(s)
                return
            if opened < n:
                go(s + "(", opened + 1, closed)  #! may open while openers remain
            if closed < opened:
                go(s + ")", opened, closed + 1)  #! may close only if something is open
        go("", 0, 0)
        return res`,
trick:'"Valid by construction" → never build an invalid prefix: add "(" if you have some left, add ")" only if closers < openers.',
real:'Grammar-constrained generation: only emit tokens that keep the output valid.',
viz:{sim:'bt',expand:p=>{if(p.length>=4)return [];const o=p.filter(c=>c==='(').length,c=p.length-o;const r=[];if(o<2)r.push([...p,'(']);if(c<o)r.push([...p,')']);return r;},label:p=>p.join('')||'∅',good:p=>p.length===4,start_note:'n = 2. Only two rules: open if you still can, close only if something is open. Every leaf at length 4 is valid.'},
test:`res=sorted(Solution().generateParenthesis(3))`,exp:`["((()))","(()())","(())()","()(())","()()()"]`},

{id:'n-queens',n:51,t:'N-Queens',d:'H',tg:['Backtracking'],pat:'Backtracking + Conflict Sets',
br:'Place n queens on an n×n board so none attack each other.',
bt:'O(n!·n)',bs:'O(n)',ot:'O(n!) with pruning',os:'O(n)',
b:r`class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        res = []
        for cols in itertools.permutations(range(n)):  #? every arrangement of one queen per row (n!)
            if len({r + c for r, c in enumerate(cols)}) == n and len({r - c for r, c in enumerate(cols)}) == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in cols])
        return res`,
o:r`class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        res, cols, d1, d2, board = [], set(), set(), set(), []
        def go(r):
            if r == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in board])
                return
            for c in range(n):
                if c in cols or r - c in d1 or r + c in d2:  #! O(1) conflict test with three sets
                    continue
                cols.add(c); d1.add(r - c); d2.add(r + c); board.append(c)
                go(r + 1)
                cols.remove(c); d1.remove(r - c); d2.remove(r + c); board.pop()  #! undo
        go(0)
        return res`,
trick:'"One queen per row" → recurse row by row; a square is safe if its column, its (r−c) diagonal and its (r+c) diagonal are free.',
real:'Constraint satisfaction and pruning search, the idea behind SAT/CSP solvers.',
viz:{flow:(()=>{const Q=(qs,bad)=>grid([0,1,2,3].map(r=>[0,1,2,3].map(c=>qs.some(q=>q[0]===r&&q[1]===c)?'♛':'')),(r,c)=>{if(bad&&bad.some(b=>b[0]===r&&b[1]===c))return 'bad';const k=qs.findIndex(q=>q[0]===r&&q[1]===c);return k<0?'':(k===qs.length-1?'on':'done');});
 return [f('4 queens, one per row. Place row by row; skip any square whose column or diagonal is taken.',null,{grid:Q([])}),
 f('Row 0 → try column 0.',null,{grid:Q([[0,0]])}),
 f('Row 1: columns 0 and 1 are attacked → column 2 is the first safe square.',null,{grid:Q([[0,0],[1,2]])}),
 f('Row 2: every column is attacked → dead end. BACKTRACK: undo row 1 and try the next option.',null,{grid:Q([[0,0],[1,2]],[[2,0],[2,1],[2,2],[2,3]])}),
 f('Eventually row 0 moves to column 1, and the search finds a full placement.',null,{grid:Q([[0,1],[1,3],[2,0],[3,2]])}),
 f('Solution found: [1, 3, 0, 2]. Continue for the other solution.',null,{grid:Q([[0,1],[1,3],[2,0],[3,2]],[]),aux:[['columns per row',1,3,0,2]]})];})()},
test:`res=sorted(Solution().solveNQueens(4))`,exp:`[["..Q.","Q...","...Q",".Q.."],[".Q..","...Q","Q...","..Q."]]`}
);})();
