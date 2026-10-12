/* p5, dynamic programming, bit tricks, math */
(function(){const r=String.raw,f=DR.f;
const B=(v,w=8)=>v.toString(2).padStart(w,'0').split('');

/* ---------- generated flow frames ---------- */
const lisFlow=(()=>{const a=[10,9,2,5,3,7,101,18],tails=[];
  const fr=[f('tails[k] = the smallest possible last value of an increasing subsequence of length k+1. Keeping tails small keeps the future open.',a,{aux:[['tails']]})];
  a.forEach((x,i)=>{let lo=0,hi=tails.length;while(lo<hi){const m=(lo+hi)>>1;if(tails[m]<x)lo=m+1;else hi=m;}
    const grow=lo===tails.length;if(grow)tails.push(x);else tails[lo]=x;
    fr.push(f(grow?`${x} is bigger than every tail → extend: length is now ${tails.length}.`:`${x} replaces the first tail ≥ it (slot ${lo}): same length, smaller tail.`,a,{p:{i},h:[i],aux:[['tails',...tails]]}));});
  fr.push(f(`Answer = len(tails) = ${tails.length}. (tails is not itself a real subsequence, only its length is meaningful.)`,a,{aux:[['length',tails.length]]}));return fr;})();

const popFlow=(()=>{let n=11,c=0;const fr=[f('n = 11 → 00001011. Each loop removes exactly the lowest 1-bit, so we loop once per 1-bit, not once per position.',B(n),{g:[4,6,7],aux:[['count',0]]})];
  while(n){const low=Math.log2(n&-n),prev=n;n&=n-1;c++;fr.push(f(`n & (n−1) clears the lowest 1 (bit ${low}): ${prev} → ${n}. count = ${c}.`,B(prev),{x:[7-low],aux:[['count',c],['next n',n]]}));}
  fr.push(f(`n is 0 → no bits left. Answer ${c}.`,B(0),{aux:[['count',c]]}));return fr;})();

const xorFlow=(()=>{const a=[4,1,2,1,2];let x=0;const fr=[f('XOR rules: a ^ a = 0 and a ^ 0 = a. Pairs cancel out, the loner survives, order does not matter.',a,{aux:[['xor',0]]})];
  a.forEach((v,i)=>{const p=x;x^=v;fr.push(f(`${p} ^ ${v} = ${x}`,a,{h:[i],w:[0,i],aux:[['xor',x]]}));});
  fr.push(f(`Every pair vanished. Answer ${x}.`,a,{g:[0],aux:[['xor',x]]}));return fr;})();

const sumFlow=(()=>{let a=5,b=3;const fr=[f('No "+" allowed. XOR adds without carrying; AND shifted left is the carry. Repeat until no carry is left.',B(a),{aux:[['b (carry)',...B(b)]]})];
  while(b){const s=a^b,c=(a&b)<<1;fr.push(f(`sum without carry = ${a} ^ ${b} = ${s}; carry = (${a} & ${b}) << 1 = ${c}.`,B(s),{h:[],aux:[['carry',...B(c)]]}));a=s;b=c;}
  fr.push(f(`Carry is 0 → a = ${a} is the answer (5 + 3 = 8).`,B(a),{g:B(a).map((v,i)=>v==='1'?i:-1).filter(i=>i>=0)}));return fr;})();

const revFlow=(()=>{let n=0b00010110;const fr=[f('Reverse 8 bits by swapping halves, then quarters, then pairs: log₂(8) = 3 swaps instead of 8 single-bit moves.',B(n),{})];
  const steps=[['swap the two nibbles',0xF0,0x0F,4],['swap pairs inside each nibble',0xCC,0x33,2],['swap neighbouring bits',0xAA,0x55,1]];
  for(const [name,hi,lo,s] of steps){n=((n&hi)>>s)|((n&lo)<<s);fr.push(f(`${name} → ${B(n).join('')}`,B(n),{}));}
  fr.push(f('00010110 is now 01101000, exactly the mirror image. 32-bit works the same with 5 swaps.',B(n),{g:[1,2,4]}));return fr;})();

const powFlow=(()=>{let x=2,n=10,res=1;const fr=[f('2^10: write 10 in binary (1010). Square the base each step; multiply it into the result only where the exponent has a 1.',B(n,4),{aux:[['x',x],['result',res]]})];
  while(n){const bit=n&1;let t=bit?`bit is 1 → result = ${res} × ${x} = ${res*x}.`:'bit is 0 → skip.';if(bit)res*=x;x*=x;const prev=n;n>>=1;
    fr.push(f(`${t} Square base → ${x}; shift exponent.`,B(prev,4),{h:[3],g:bit?[3]:[],aux:[['x',x],['result',res]]}));}
  fr.push(f(`Exponent is 0 → 2^10 = ${res} after only 4 rounds, not 10 multiplications.`,B(0,4),{aux:[['result',res]]}));return fr;})();

const sieveFlow=(()=>{const N=30,a=[];for(let i=2;i<=N;i++)a.push(i);const dead=new Set();
  const fr=[f('List 2..30. Every prime crosses out all of its multiples. What is never crossed out is prime.',a,{})];
  for(let p=2;p*p<=N;p++){if(dead.has(p))continue;for(let m=p*p;m<=N;m+=p)dead.add(m);
    fr.push(f(`${p} is prime → cross out ${p*p}, ${p*p+p}, … (start at ${p}², smaller multiples were already crossed by smaller primes).`,a,{h:[p-2],x:[...dead].map(v=>v-2)}));}
  const pr=a.map((v,i)=>dead.has(v)?-1:i).filter(i=>i>=0);
  fr.push(f(`Next candidate 7: 7² = 49 > 30, so we can stop. ${pr.length} numbers survive → ${pr.length} primes up to 30.`,a,{x:[...dead].map(v=>v-2),g:pr}));return fr;})();

const A5=[1,3,8,9,15],B6=[7,11,18,19,21,25];
const medFlow=[
 f('A = [1,3,8,9,15], B = [7,11,18,19,21,25]. Total 11 → the left half holds 6 values. We only choose how many come from A (i); B supplies 6 − i.',A5,{aux:[['B',...B6]],w:[0,4]}),
 f('Try i = 2: left of A = [1,3], so j = 4 and left of B = [7,11,18,19]. Check 19 ≤ A[2] = 8? No, B’s left side is too big. Take more from A.',A5,{w:[0,1],p:{cut:2},aux:[['B left',7,11,18,19],['B right',21,25]],x:[2]}),
 f('Search moves right: i = 4, j = 2. Left of A = [1,3,8,9], left of B = [7,11].',A5,{w:[0,3],p:{cut:4},aux:[['B left',7,11],['B right',18,19,21,25]]}),
 f('Check both borders: 9 ≤ 18 ✓ and 11 ≤ 15 ✓. Every left value ≤ every right value → this is the true cut.',A5,{w:[0,3],g:[3,4],p:{cut:4},aux:[['B left',7,11],['B right',18,19,21,25],['borders','9 ≤ 18','11 ≤ 15']]}),
 f('Total is odd → median = max(left side) = max(9, 11) = 11. Only ~log(min(m,n)) cuts were tried.',A5,{g:[3],aux:[['median',11]]})];

/* ---------- problems ---------- */
DR.add(
{id:'climbing-stairs',n:70,t:'Climbing Stairs',d:'E',tg:['DP','Math'],pat:'Fibonacci DP',
br:'Count the ways to climb n stairs taking 1 or 2 steps at a time.',
bt:'O(2ⁿ)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        return self.climbStairs(n - 1) + self.climbStairs(n - 2)  #? recomputes the same sub-problems exponentially`,
o:r`class Solution:
    def climbStairs(self, n: int) -> int:
        a, b = 1, 1
        for _ in range(n - 1):
            a, b = b, a + b  #! only the last two values matter
        return b`,
trick:'To stand on step n you came from n−1 or n−2 → ways(n) = ways(n−1) + ways(n−2). It is Fibonacci. Keep two variables.',
real:'Counting paths/compositions; the template for every "last step" recurrence.',
viz:{sim:'dp1',n:7,init:[1,1],f:(dp,i)=>dp[i-1]+dp[i-2],deps:i=>[i-1,i-2],rule:'ways(i) = ways(i−1) + ways(i−2)',start:'ways(0)=1, ways(1)=1. Every later stair adds the two before it.'},
test:`res=[Solution().climbStairs(1),Solution().climbStairs(2),Solution().climbStairs(3),Solution().climbStairs(10)]`,exp:`[1,2,3,89]`},

{id:'house-robber',n:198,t:'House Robber',d:'M',tg:['DP','Array'],pat:'Take or Skip',
br:'Maximise loot from a row of houses without robbing two neighbours.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]
        dp = [0] * len(nums)  #? whole table, though only 2 cells are ever read
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])
        for i in range(2, len(nums)):
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
        return dp[-1]`,
o:r`class Solution:
    def rob(self, nums: List[int]) -> int:
        prev, cur = 0, 0
        for x in nums:
            prev, cur = cur, max(cur, prev + x)  #! skip this house, or rob it + best up to two back
        return cur`,
trick:'At each house: skip (keep the best so far) or rob (this house + best from two back). Two rolling numbers are enough.',
real:'Weighted interval choices with a no-adjacent constraint: scheduling jobs, non-overlapping ads.',
viz:{sim:'dp1',n:5,init:[2,7],f:(dp,i)=>Math.max(dp[i-1],dp[i-2]+[2,7,9,3,1][i]),deps:i=>[i-1,i-2],rule:'best(i) = max(skip → best(i−1), rob → best(i−2) + house)',start:'Houses [2,7,9,3,1]. best(0)=2, best(1)=max(2,7)=7.'},
test:`res=[Solution().rob([1,2,3,1]),Solution().rob([2,7,9,3,1]),Solution().rob([5]),Solution().rob([2,1,1,2])]`,exp:`[4,12,5,4]`},

{id:'coin-change',n:322,t:'Coin Change',d:'M',tg:['DP','Unbounded Knapsack'],pat:'Min Over Last Coin',
br:'Fewest coins that make up an amount (or −1).',
bt:'O(amount·coins)',bs:'O(amount)',ot:'O(amount·coins)',os:'O(amount)',
b:r`class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        memo = {}
        def best(rem):
            if rem == 0:
                return 0
            if rem < 0:
                return -1
            if rem in memo:
                return memo[rem]
            res = -1
            for c in coins:
                sub = best(rem - c)
                if sub >= 0 and (res < 0 or sub + 1 < res):
                    res = sub + 1
            memo[rem] = res
            return res
        return best(amount)  #? recursion depth can reach amount / smallest coin`,
o:r`class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1
        dp = [0] + [INF] * amount  #! dp[a] = fewest coins for amount a
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)  #! 1 coin of value c + best for the rest
        return dp[amount] if dp[amount] != INF else -1`,
trick:'Build amounts from 0 upward: best(a) = 1 + min(best(a − coin)). Use amount+1 as "infinity".',
real:'Minimum-cost decomposition: change-making, packet/chunk sizing, resource bundles.',
viz:{sim:'dp1',n:12,init:[0],f:(dp,i)=>Math.min(...[1,2,5].filter(c=>c<=i).map(c=>dp[i-c]+1)),deps:i=>[1,2,5].filter(c=>c<=i).map(c=>i-c),rule:'dp[a] = 1 + min(dp[a−1], dp[a−2], dp[a−5])',start:'Coins [1,2,5], amount 11. dp[0] = 0 coins.'},
test:`res=[Solution().coinChange([1,2,5],11),Solution().coinChange([2],3),Solution().coinChange([1],0),Solution().coinChange([186,419,83,408],6249)]`,exp:`[3,-1,0,20]`},

{id:'longest-increasing-subsequence',n:300,t:'Longest Increasing Subsequence',d:'M',tg:['DP','Binary Search'],pat:'Patience Tails',
br:'Length of the longest strictly increasing subsequence.',
bt:'O(n²)',bs:'O(n)',ot:'O(n log n)',os:'O(n)',
b:r`class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        dp = [1] * len(nums)
        for i in range(len(nums)):
            for j in range(i):  #? compare with every earlier element
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)`,
o:r`class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []
        for x in nums:
            i = bisect_left(tails, x)  #! binary-search the first tail >= x
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x  #! a smaller tail keeps more future options
        return len(tails)`,
trick:'Keep, for each length, the smallest tail seen. A new number either extends the longest or replaces the first tail ≥ it.',
real:'Longest monotone trend; the core of diff/patience algorithms and sequence alignment.',
viz:{flow:lisFlow},
test:`res=[Solution().lengthOfLIS([10,9,2,5,3,7,101,18]),Solution().lengthOfLIS([0,1,0,3,2,3]),Solution().lengthOfLIS([7,7,7,7])]`,exp:`[4,4,1]`},

{id:'longest-common-subsequence',n:1143,t:'Longest Common Subsequence',d:'M',tg:['DP','String'],pat:'2-D Table',
br:'Length of the longest subsequence shared by two strings.',
bt:'O(m·n)',bs:'O(m·n)',ot:'O(m·n)',os:'O(min(m,n))',
b:r`class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]  #? full m×n table kept in memory
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
o:r`class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        if len(text2) > len(text1):
            text1, text2 = text2, text1  #! make the row the shorter string
        prev = [0] * (len(text2) + 1)
        for ch in text1:
            cur = [0]
            for j, d in enumerate(text2, 1):
                cur.append(prev[j - 1] + 1 if ch == d else max(prev[j], cur[j - 1]))  #! only the previous row is needed
            prev = cur
        return prev[-1]`,
trick:'Match → diagonal + 1. No match → best of dropping a char from either string (up or left).',
real:'The engine behind diff, git merge, DNA alignment and fuzzy text matching.',
viz:{sim:'dp2',R:6,C:4,init:(i,j)=>(i===0||j===0)?0:undefined,
  f:(dp,i,j)=>'abcde'[i-1]==='ace'[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]),
  deps:(i,j)=>'abcde'[i-1]==='ace'[j-1]?[[i-1,j-1]]:[[i-1,j],[i,j-1]],
  rule:(i,j)=>'abcde'[i-1]==='ace'[j-1]?`"${'abcde'[i-1]}" = "${'ace'[j-1]}" → diagonal + 1`:`"${'abcde'[i-1]}" ≠ "${'ace'[j-1]}" → max(up, left)`,
  start:'Rows: "abcde", columns: "ace". First row and column are 0 (empty string).'},
test:`res=[Solution().longestCommonSubsequence("abcde","ace"),Solution().longestCommonSubsequence("abc","abc"),Solution().longestCommonSubsequence("abc","def"),Solution().longestCommonSubsequence("bl","yby")]`,exp:`[3,3,0,1]`},

{id:'edit-distance',n:72,t:'Edit Distance',d:'M',tg:['DP','String'],pat:'2-D Table (3 moves)',
br:'Fewest insert/delete/replace operations to turn word1 into word2.',
bt:'O(m·n)',bs:'O(m·n)',ot:'O(m·n)',os:'O(min(m,n))',
b:r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]  #? full table kept in memory
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
o:r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        if len(word1) < len(word2):
            word1, word2 = word2, word1  #! distance is symmetric, keep the row short
        prev = list(range(len(word2) + 1))
        for i, a in enumerate(word1, 1):
            cur = [i]
            for j, b in enumerate(word2, 1):
                if a == b:
                    cur.append(prev[j - 1])  #! equal letters cost nothing
                else:
                    cur.append(1 + min(prev[j - 1], prev[j], cur[j - 1]))  #! replace / delete / insert
            prev = cur
        return prev[-1]`,
trick:'Cell = cost to convert a prefix to a prefix. Same letter → copy the diagonal. Different → 1 + min(diagonal = replace, up = delete, left = insert).',
real:'Spell-check, fuzzy search, ASR word-error-rate, and string similarity metrics.',
viz:{sim:'dp2',R:6,C:4,init:(i,j)=>i===0?j:(j===0?i:undefined),
  f:(dp,i,j)=>'horse'[i-1]==='ros'[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]),
  deps:(i,j)=>'horse'[i-1]==='ros'[j-1]?[[i-1,j-1]]:[[i-1,j-1],[i-1,j],[i,j-1]],
  rule:(i,j)=>'horse'[i-1]==='ros'[j-1]?`"${'horse'[i-1]}" = "${'ros'[j-1]}" → free, copy diagonal`:`"${'horse'[i-1]}" ≠ "${'ros'[j-1]}" → 1 + min(replace, delete, insert)`,
  start:'"horse" → "ros". Turning a prefix into "" costs its length (first row/column).'},
test:`res=[Solution().minDistance("horse","ros"),Solution().minDistance("intention","execution"),Solution().minDistance("","a"),Solution().minDistance("","")]`,exp:`[3,5,1,0]`},

{id:'word-break',n:139,t:'Word Break',d:'M',tg:['DP','String','Hash Set'],pat:'Reachable Prefix',
br:'Can the string be split into dictionary words?',
bt:'O(n²)',bs:'O(n)',ot:'O(n·k)',os:'O(n)',
b:r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        memo = {}
        def can(i):
            if i == len(s):
                return True
            if i in memo:
                return memo[i]
            for j in range(i + 1, len(s) + 1):  #? tries every possible end position
                if s[i:j] in words and can(j):
                    memo[i] = True
                    return True
            memo[i] = False
            return False
        return can(0)`,
o:r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        lens = {len(w) for w in words}  #! only try word lengths that exist
        dp = [False] * (len(s) + 1)
        dp[0] = True
        for i in range(1, len(s) + 1):
            for L in lens:
                if L <= i and dp[i - L] and s[i - L:i] in words:  #! reachable start + dictionary word
                    dp[i] = True
                    break
        return dp[-1]`,
trick:'dp[i] = "the first i letters can be built". It is true if some earlier True cell plus one dictionary word lands on i.',
real:'Tokenisation and word segmentation, the same idea as splitting text into vocabulary pieces.',
viz:(()=>{const s='leetcode',dict=['leet','code'];const ok=i=>i===0||[...Array(i).keys()].some(j=>ok(j)&&dict.includes(s.slice(j,i)));
  return {sim:'dp1',n:9,init:[true],f:(dp,i)=>ok(i),deps:i=>ok(i)?[...Array(i).keys()].filter(j=>ok(j)&&dict.includes(s.slice(j,i))):[],rule:'dp[i] = some True cell j where s[j:i] is a word',start:'s = "leetcode", words {leet, code}. dp[0] = True (empty prefix).'};})(),
test:`res=[Solution().wordBreak("leetcode",["leet","code"]),Solution().wordBreak("applepenapple",["apple","pen"]),Solution().wordBreak("catsandog",["cats","dog","sand","and","cat"])]`,exp:`[True,True,False]`},

{id:'burst-balloons',n:312,t:'Burst Balloons',d:'H',tg:['DP','Interval DP'],pat:'Last Balloon in Interval',
br:'Choose the order of bursts to maximise coins; bursting i earns nums[i−1]·nums[i]·nums[i+1].',
bt:'O(n³)',bs:'O(n²)',ot:'O(n³)',os:'O(n²)',
b:r`class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        a = [1] + nums + [1]
        memo = {}
        def best(l, r):
            if l + 1 == r:
                return 0
            if (l, r) in memo:
                return memo[(l, r)]
            res = 0
            for k in range(l + 1, r):
                res = max(res, best(l, k) + a[l] * a[k] * a[r] + best(k, r))  #? k is the LAST balloon popped inside (l, r)
            memo[(l, r)] = res
            return res
        return best(0, len(a) - 1)`,
o:r`class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        a = [1] + nums + [1]
        n = len(a)
        dp = [[0] * n for _ in range(n)]
        for length in range(2, n):  #! solve small gaps first
            for l in range(n - length):
                r = l + length
                for k in range(l + 1, r):
                    dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r])  #! k is popped last, so its neighbours are exactly l and r
        return dp[0][n - 1]`,
trick:'Think backwards: pick the LAST balloon k to burst in a gap. Its neighbours are then the fixed borders, and the two sides become independent.',
real:'Interval DP: matrix-chain ordering, optimal BST, parsing, "choose the split point last".',
viz:(()=>{const a=[1,3,1,5,8,1];return {sim:'dp2',R:6,C:6,init:(i,j)=>j-i===1?0:undefined,
  order:()=>{const o=[];for(let L=2;L<=5;L++)for(let i=0;i+L<=5;i++)o.push([i,i+L]);return o;},
  f:(dp,i,j)=>{let b=0;for(let k=i+1;k<j;k++)b=Math.max(b,dp[i][k]+a[i]*a[k]*a[j]+dp[k][j]);return b;},
  deps:(i,j)=>{const d=[];for(let k=i+1;k<j;k++)d.push([i,k],[k,j]);return d;},
  rule:(i,j)=>`gap between ${a[i]} and ${a[j]}: try each balloon as the last to pop`,
  ans:[0,5],start:'nums [3,1,5,8] padded with 1s → [1,3,1,5,8,1]. dp[l][r] = best coins for the balloons strictly between l and r.'};})(),
test:`res=[Solution().maxCoins([3,1,5,8]),Solution().maxCoins([1,5]),Solution().maxCoins([7])]`,exp:`[167,10,7]`},

{id:'regular-expression-matching',n:10,t:'Regular Expression Matching',d:'H',tg:['DP','String','Recursion'],pat:'Pattern × Text Table',
br:'Does the pattern (with . and *) match the entire string?',
bt:'O(2^(m+n))',bs:'O(m+n)',ot:'O(m·n)',os:'O(m·n)',
b:r`class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        if not p:
            return not s
        first = bool(s) and p[0] in (s[0], ".")
        if len(p) >= 2 and p[1] == "*":
            return self.isMatch(s, p[2:]) or (first and self.isMatch(s[1:], p))  #? re-solves the same suffix pairs again and again
        return first and self.isMatch(s[1:], p[1:])`,
o:r`class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == "*":
                    dp[i][j] = dp[i][j - 2]  #! "x*" used zero times
                    if i > 0 and p[j - 2] in (s[i - 1], "."):
                        dp[i][j] = dp[i][j] or dp[i - 1][j]  #! or one more copy of x
                elif i > 0 and p[j - 1] in (s[i - 1], "."):
                    dp[i][j] = dp[i - 1][j - 1]  #! plain match: shrink both
        return dp[m][n]`,
trick:'dp[i][j] = "first i chars of s match first j chars of p". A "*" either vanishes (look two columns left) or eats one more char (look one row up).',
real:'How regex engines work; the same table-based thinking underlies glob matching and tokenizers.',
viz:(()=>{const s='aab',p='c*a*b';const mt=(i,j)=>i>0&&(p[j-1]==='.'||p[j-1]===s[i-1]);
  return {sim:'dp2',R:4,C:6,init:(i,j)=>j===0?i===0:undefined,
  f:(dp,i,j)=>{if(p[j-1]==='*'){return dp[i][j-2]||(i>0&&(p[j-2]==='.'||p[j-2]===s[i-1])&&dp[i-1][j]);}return mt(i,j)&&dp[i-1][j-1];},
  deps:(i,j)=>p[j-1]==='*'?[[i,j-2],...(i>0?[[i-1,j]]:[])]:(i>0?[[i-1,j-1]]:[]),
  rule:(i,j)=>p[j-1]==='*'?`"${p[j-2]}*": zero copies (left ×2) or one more copy (up)`:`"${p[j-1]}" vs "${s[i-1]||'∅'}" → need a match on the diagonal`,
  start:'s = "aab" (rows 0..3), p = "c*a*b" (columns 0..5). Column 0 is False except dp[0][0] = True: only empty matches empty.'};})(),
test:`res=[Solution().isMatch("aa","a"),Solution().isMatch("aa","a*"),Solution().isMatch("ab",".*"),Solution().isMatch("aab","c*a*b"),Solution().isMatch("mississippi","mis*is*p*."),Solution().isMatch("","a*")]`,exp:`[False,True,True,True,False,True]`},

{id:'longest-increasing-path-in-a-matrix',n:329,t:'Longest Increasing Path in a Matrix',d:'H',tg:['DP','DFS','Memoization','Matrix'],pat:'DFS + Memo on a DAG',
br:'Longest path of strictly increasing cells moving up/down/left/right.',
bt:'O(4^(m·n))',bs:'O(m·n)',ot:'O(m·n)',os:'O(m·n)',
b:r`class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        R, C = len(matrix), len(matrix[0])
        def dfs(r, c):
            best = 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))  #? same cell re-explored from every path that reaches it
            return best
        return max(dfs(r, c) for r in range(R) for c in range(C))`,
o:r`class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        R, C = len(matrix), len(matrix[0])
        memo = {}
        def dfs(r, c):
            if (r, c) in memo:
                return memo[(r, c)]  #! each cell is solved once
            best = 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))  #! strictly increasing → no cycles, no visited set needed
            memo[(r, c)] = best
            return best
        return max(dfs(r, c) for r in range(R) for c in range(C))`,
trick:'"Strictly increasing" means the grid is a DAG, no cycles. So longest path from a cell is a fixed number: compute it once and cache it.',
real:'Longest path in a DAG: build-dependency depth, critical-path analysis.',
viz:(()=>{const M=[[9,9,4],[6,6,8],[2,1,1]],D=[[1,0],[-1,0],[0,1],[0,-1]];
  const sm=(i,j)=>D.map(([a,b])=>[i+a,j+b]).filter(([x,y])=>x>=0&&y>=0&&x<3&&y<3&&M[x][y]<M[i][j]);
  return {sim:'dp2',R:3,C:3,order:()=>{const c=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)c.push([i,j]);return c.sort((a,b)=>M[a[0]][a[1]]-M[b[0]][b[1]]);},
  f:(dp,i,j)=>1+Math.max(0,...sm(i,j).map(([x,y])=>dp[x][y])),deps:(i,j)=>sm(i,j),
  rule:(i,j)=>`value ${M[i][j]}: 1 + best path among strictly smaller neighbours`,ans:[0,0],
  start:'Matrix [[9,9,4],[6,6,8],[2,1,1]]. Cells are visited from smallest value up, which is the order memoised DFS settles them, each cell is solved once.'};})(),
test:`res=[Solution().longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]]),Solution().longestIncreasingPath([[3,4,5],[3,2,6],[2,2,1]]),Solution().longestIncreasingPath([[1]])]`,exp:`[4,4,1]`},

{id:'number-of-1-bits',n:191,t:'Number of 1 Bits',d:'E',tg:['Bit Manipulation'],pat:'Clear the Lowest Set Bit',
br:'Count the set bits (Hamming weight) of an integer.',
bt:'O(32)',bs:'O(1)',ot:'O(popcount)',os:'O(1)',
b:r`class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            count += n & 1  #? checks every bit, even the zeros
            n >>= 1
        return count`,
o:r`class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1  #! clears the lowest 1-bit
            count += 1
        return count`,
trick:'n & (n−1) deletes the lowest 1-bit. Count how many deletions it takes to reach 0.',
real:'Popcount: bitsets, Bloom filters, hashing, and compact feature flags.',
viz:{flow:popFlow},
test:`res=[Solution().hammingWeight(11),Solution().hammingWeight(128),Solution().hammingWeight(2147483645)]`,exp:`[3,1,30]`},

{id:'counting-bits',n:338,t:'Counting Bits',d:'E',tg:['Bit Manipulation','DP'],pat:'Reuse i >> 1',
br:'For every i in 0..n return its number of 1-bits.',
bt:'O(n log n)',bs:'O(1) extra',ot:'O(n)',os:'O(1) extra',
b:r`class Solution:
    def countBits(self, n: int) -> List[int]:
        res = []
        for i in range(n + 1):
            c, x = 0, i
            while x:  #? recount all bits of every number
                c += x & 1
                x >>= 1
            res.append(c)
        return res`,
o:r`class Solution:
    def countBits(self, n: int) -> List[int]:
        res = [0] * (n + 1)
        for i in range(1, n + 1):
            res[i] = res[i >> 1] + (i & 1)  #! same bits as i/2, plus the last bit
        return res`,
trick:'i is just (i >> 1) with one more bit on the end, so bits(i) = bits(i >> 1) + (i & 1).',
real:'Building popcount lookup tables; classic example of DP on binary structure.',
viz:{sim:'dp1',n:9,init:[0],f:(dp,i)=>dp[i>>1]+(i&1),deps:i=>[i>>1],rule:'bits(i) = bits(i >> 1) + (i & 1)',start:'bits(0) = 0. Each number reuses the answer for its half.',end:'The whole array is the answer: [0,1,1,2,1,2,2,3,1], built in O(n), one step per number.'},
test:`res=[Solution().countBits(2),Solution().countBits(5)]`,exp:`[[0,1,1],[0,1,1,2,1,2]]`},

{id:'single-number',n:136,t:'Single Number',d:'E',tg:['Bit Manipulation','Array'],pat:'XOR Cancels Pairs',
br:'Every number appears twice except one, find it in O(1) space.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        count = Counter(nums)  #? O(n) extra memory
        for k, v in count.items():
            if v == 1:
                return k`,
o:r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        x = 0
        for n in nums:
            x ^= n  #! pairs cancel (a^a = 0), the loner is left
        return x`,
trick:'a ^ a = 0 and a ^ 0 = a. XOR everything, duplicates annihilate.',
real:'Parity/checksum tricks; RAID parity and error detection use the same XOR cancellation.',
viz:{flow:xorFlow},
test:`res=[Solution().singleNumber([2,2,1]),Solution().singleNumber([4,1,2,1,2]),Solution().singleNumber([1])]`,exp:`[1,4,1]`},

{id:'sum-of-two-integers',n:371,t:'Sum of Two Integers',d:'M',tg:['Bit Manipulation','Math'],pat:'XOR + Carry',
br:'Add two integers without using + or −.',
bt:'O(32)',bs:'O(1)',ot:'O(32)',os:'O(1)',
b:r`class Solution:
    def getSum(self, a: int, b: int) -> int:
        res, carry = 0, 0
        for i in range(32):  #? a full-adder circuit, simulated bit by bit
            x, y = (a >> i) & 1, (b >> i) & 1
            res |= (x ^ y ^ carry) << i
            carry = (x & y) | (carry & (x ^ y))
        return res if res <= 0x7FFFFFFF else ~(res ^ 0xFFFFFFFF)`,
o:r`class Solution:
    def getSum(self, a: int, b: int) -> int:
        mask = 0xFFFFFFFF
        while b != 0:
            a, b = (a ^ b) & mask, ((a & b) << 1) & mask  #! XOR = sum without carry, AND<<1 = the carries
        return a if a <= 0x7FFFFFFF else ~(a ^ mask)  #! undo Python's unbounded ints (32-bit sign)`,
trick:'XOR adds without carrying; (a & b) << 1 is the carry. Repeat until the carry dies. Mask to 32 bits in Python.',
real:'How an ALU adder works, half-adders chained into a full adder.',
viz:{flow:sumFlow},
test:`res=[Solution().getSum(1,2),Solution().getSum(2,3),Solution().getSum(-2,3),Solution().getSum(-5,-7),Solution().getSum(5,3)]`,exp:`[3,5,1,-12,8]`},

{id:'reverse-bits',n:190,t:'Reverse Bits',d:'E',tg:['Bit Manipulation'],pat:'Divide & Conquer Swaps',
br:'Reverse the bits of a 32-bit unsigned integer.',
bt:'O(32)',bs:'O(1)',ot:'O(log 32)',os:'O(1)',
b:r`class Solution:
    def reverseBits(self, n: int) -> int:
        bits = format(n, "032b")  #? builds a 32-char string
        return int(bits[::-1], 2)`,
o:r`class Solution:
    def reverseBits(self, n: int) -> int:
        n = ((n & 0xFFFF0000) >> 16) | ((n & 0x0000FFFF) << 16)  #! swap 16-bit halves
        n = ((n & 0xFF00FF00) >> 8) | ((n & 0x00FF00FF) << 8)  #! swap bytes
        n = ((n & 0xF0F0F0F0) >> 4) | ((n & 0x0F0F0F0F) << 4)  #! swap nibbles
        n = ((n & 0xCCCCCCCC) >> 2) | ((n & 0x33333333) << 2)  #! swap pairs
        n = ((n & 0xAAAAAAAA) >> 1) | ((n & 0x55555555) << 1)  #! swap neighbours
        return n`,
trick:'Swap halves, then quarters, then eighths… five swaps with masks reverse 32 bits.',
real:'FFT bit-reversal permutation, endianness conversion, hardware bit tricks.',
viz:{flow:revFlow},
test:`res=[Solution().reverseBits(43261596),Solution().reverseBits(4294967293)]`,exp:`[964176192,3221225471]`},

{id:'powx-n',n:50,t:'Pow(x, n)',d:'M',tg:['Math','Recursion'],pat:'Binary Exponentiation',
br:'Compute x raised to the integer power n quickly.',
bt:'O(n)',bs:'O(1)',ot:'O(log n)',os:'O(1)',
b:r`class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        res = 1.0
        for _ in range(n):  #? n multiplications, billions for a big n
            res *= x
        return res`,
o:r`class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        res = 1.0
        while n:
            if n & 1:
                res *= x  #! this bit of the exponent is 1 → fold the current power in
            x *= x  #! square: x, x², x⁴, x⁸ …
            n >>= 1
        return res`,
trick:'Write the exponent in binary. Keep squaring x; multiply into the answer only for the 1-bits.',
real:'Modular exponentiation in cryptography, matrix powers, fast Fibonacci.',
viz:{flow:powFlow},
test:`r=lambda v:round(Solution().myPow(*v),5)\nres=[r((2.0,10)),r((2.0,-2)),r((3.0,5)),r((2.1,3))]`,exp:`[1024.0,0.25,243.0,9.261]`},

{id:'count-primes',n:204,t:'Count Primes',d:'M',tg:['Math','Sieve'],pat:'Sieve of Eratosthenes',
br:'How many primes are strictly less than n?',
bt:'O(n√n)',bs:'O(1)',ot:'O(n log log n)',os:'O(n)',
b:r`class Solution:
    def countPrimes(self, n: int) -> int:
        count = 0
        for i in range(2, n):
            is_prime = True
            for d in range(2, int(i ** 0.5) + 1):  #? up to √i divisions for every single number
                if i % d == 0:
                    is_prime = False
                    break
            if is_prime:
                count += 1
        return count`,
o:r`class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        sieve = bytearray([1]) * n
        sieve[0] = sieve[1] = 0
        for i in range(2, int(n ** 0.5) + 1):
            if sieve[i]:
                sieve[i * i::i] = bytearray(len(range(i * i, n, i)))  #! cross out every multiple, starting at i²
        return sum(sieve)`,
trick:'Do not test each number, let every prime cross out its multiples. Start at p² and stop at √n.',
real:'Hashing/crypto parameter generation, number-theoretic precomputation.',
viz:{flow:sieveFlow},
test:`res=[Solution().countPrimes(10),Solution().countPrimes(0),Solution().countPrimes(1),Solution().countPrimes(2),Solution().countPrimes(100),Solution().countPrimes(1000)]`,exp:`[4,0,0,0,25,168]`},

{id:'median-of-two-sorted-arrays',n:4,t:'Median of Two Sorted Arrays',d:'H',tg:['Binary Search','Divide & Conquer'],pat:'Binary Search the Partition',
br:'Median of two sorted arrays in O(log(min(m,n))).',
bt:'O((m+n) log(m+n))',bs:'O(m+n)',ot:'O(log min(m,n))',os:'O(1)',
b:r`class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        merged = sorted(nums1 + nums2)  #? ignores that both inputs are already sorted
        n = len(merged)
        mid = n // 2
        if n % 2:
            return float(merged[mid])
        return (merged[mid - 1] + merged[mid]) / 2`,
o:r`class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        A, B = nums1, nums2
        if len(A) > len(B):
            A, B = B, A  #! binary search the shorter array
        m, n = len(A), len(B)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2  #! i items of A go to the left half
            j = half - i  #! the rest of the left half comes from B
            aL = A[i - 1] if i > 0 else float("-inf")
            aR = A[i] if i < m else float("inf")
            bL = B[j - 1] if j > 0 else float("-inf")
            bR = B[j] if j < n else float("inf")
            if aL <= bR and bL <= aR:  #! a valid cut: every left value <= every right value
                if (m + n) % 2:
                    return float(max(aL, bL))
                return (max(aL, bL) + min(aR, bR)) / 2
            if aL > bR:
                hi = i - 1
            else:
                lo = i + 1`,
trick:'Don’t merge. Binary-search how many elements of the shorter array sit in the left half; the rest is forced. A cut is right when each left border ≤ the opposite right border.',
real:'Order statistics across sharded sorted data, percentiles from several sorted partitions.',
viz:{flow:medFlow},
test:`res=[Solution().findMedianSortedArrays([1,3],[2]),Solution().findMedianSortedArrays([1,2],[3,4]),Solution().findMedianSortedArrays([],[1]),Solution().findMedianSortedArrays([0,0],[0,0]),Solution().findMedianSortedArrays([1,3,5,7],[2,4,6,8,10]),Solution().findMedianSortedArrays([1,3,8,9,15],[7,11,18,19,21,25])]`,exp:`[2.0,2.5,1.0,0.0,5.0,11.0]`}
);
})();
