/* p1 — arrays, hashing, two pointers, sliding window, prefix tricks */
(function(){const r=String.raw,f=DR.f;
DR.add(
{id:'two-sum',n:1,t:'Two Sum',d:'E',tg:['Array','Hash Map'],pat:'Hash Map Complement',
br:'Return the indices of the two numbers that add up to target.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):  #? checks every pair → O(n²)
                if nums[i] + nums[j] == target:
                    return [i, j]`,
o:r`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  #! value → index of numbers we have already passed
        for i, x in enumerate(nums):
            need = target - x  #! the partner this number is waiting for
            if need in seen:  #! O(1) lookup replaces the whole inner loop
                return [seen[need], i]
            seen[x] = i`,
trick:'"Looking for a pair?" → ask "have I seen the complement?" Store what you have passed, query what you need.',
real:'Join keys in feature stores and de-duplicating records by a derived key.',
viz:{sim:'hash',arr:[2,7,11,15],target:9},
test:`res=Solution().twoSum([2,7,11,15],9)`,exp:`[0,1]`},

{id:'contains-duplicate',n:217,t:'Contains Duplicate',d:'E',tg:['Array','Hash Set'],pat:'Seen-Set',
br:'Does any value appear at least twice?',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):  #? compares every pair
                if nums[i] == nums[j]:
                    return True
        return False`,
o:r`class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()  #! remembers everything passed so far
        for x in nums:
            if x in seen:  #! O(1) membership test
                return True
            seen.add(x)
        return False`,
trick:'"Repeat?" → a set is a bouncer with a guest list: the second time someone shows up, stop.',
real:'Idempotency keys and duplicate-event filtering in pipelines.',
viz:{flow:[f('Walk the array and keep a set of numbers already seen.',[1,2,3,1],{aux:[['seen']]}),
 f('1 is new → add it.',[1,2,3,1],{p:{i:0},h:[0],aux:[['seen',1]]}),
 f('2 is new → add it.',[1,2,3,1],{p:{i:1},h:[1],aux:[['seen',1,2]]}),
 f('3 is new → add it.',[1,2,3,1],{p:{i:2},h:[2],aux:[['seen',1,2,3]]}),
 f('1 is already in the set → duplicate found!',[1,2,3,1],{p:{i:3},g:[0,3],aux:[['seen',1,2,3]]})]},
test:`res=Solution().containsDuplicate([1,2,3,1])`,exp:`True`},

{id:'valid-anagram',n:242,t:'Valid Anagram',d:'E',tg:['String','Hash Map'],pat:'Frequency Count',
br:'Are two strings made of exactly the same letters?',
bt:'O(n log n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return sorted(s) == sorted(t)  #? sorting costs O(n log n)`,
o:r`class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):  #! different lengths can never match
            return False
        count = [0] * 26  #! one counter per letter
        for a, b in zip(s, t):
            count[ord(a) - 97] += 1  #! +1 for a letter of s...
            count[ord(b) - 97] -= 1  #! ...−1 for the same position of t
        return not any(count)  #! all zeros → same letters`,
trick:'"Same letters?" → tally, don\'t sort. +1 for one word, −1 for the other, everything must cancel to zero.',
real:'Bag-of-words comparison and token-frequency checks.',
viz:{flow:[f('Count letters: +1 for each letter of "cat", −1 for each letter of "act".',['c','a','t'],{aux:[['count']]}),
 f('c: +1 (from s), then −1 (from t = "a")… we process position by position.',['c','a','t'],{p:{i:0},h:[0],aux:[['count','c:+1','a:−1']]}),
 f('a: +1, t=c: −1 → c is now back to 0.',['c','a','t'],{p:{i:1},h:[1],aux:[['count','c:0','a:0']]}),
 f('t: +1, t=t: −1.',['c','a','t'],{p:{i:2},h:[2],aux:[['count','c:0','a:0','t:0']]}),
 f('Every counter is 0 → anagram ✓',['c','a','t'],{g:[0,1,2],aux:[['count','c:0','a:0','t:0']]})]},
test:`res=Solution().isAnagram("anagram","nagaram")`,exp:`True`},

{id:'group-anagrams',n:49,t:'Group Anagrams',d:'M',tg:['String','Hash Map'],pat:'Canonical Key',
br:'Group words that are anagrams of each other.',
bt:'O(n²·k log k)',bs:'O(n·k)',ot:'O(n·k)',os:'O(n·k)',
b:r`class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = []
        for w in strs:
            for g in groups:  #? scans every existing group for every word
                if sorted(g[0]) == sorted(w):
                    g.append(w)
                    break
            else:
                groups.append([w])
        return groups`,
o:r`class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for w in strs:
            count = [0] * 26
            for c in w:
                count[ord(c) - 97] += 1  #! the letter histogram is identical for all anagrams
            groups[tuple(count)].append(w)  #! histogram = hashable key → no scanning, no sorting
        return list(groups.values())`,
trick:'"Group by sameness" → invent a canonical key (sorted word or letter histogram) and let a dict do the grouping.',
real:'Entity resolution: bucket records by a normalised signature before comparing.',
viz:{flow:[f('Give every word a canonical key. Anagrams share the same key.',['eat','tea','tan','ate'],{aux:[['key → words']]}),
 f('"eat" → key a1e1t1',['eat','tea','tan','ate'],{p:{i:0},h:[0],aux:[['key → words','a1e1t1: eat']]}),
 f('"tea" has the SAME key → joins the group.',['eat','tea','tan','ate'],{p:{i:1},h:[1],aux:[['key → words','a1e1t1: eat, tea']]}),
 f('"tan" → new key a1n1t1 → new group.',['eat','tea','tan','ate'],{p:{i:2},h:[2],aux:[['key → words','a1e1t1: eat, tea','a1n1t1: tan']]}),
 f('"ate" → key a1e1t1 → joins the first group.',['eat','tea','tan','ate'],{p:{i:3},h:[3],aux:[['key → words','a1e1t1: eat, tea, ate','a1n1t1: tan']]})]},
test:`res=sorted(sorted(g) for g in Solution().groupAnagrams(["eat","tea","tan","ate","nat","bat"]))`,exp:`[["ate","eat","tea"],["bat"],["nat","tan"]]`},

{id:'top-k-frequent-elements',n:347,t:'Top K Frequent Elements',d:'M',tg:['Array','Hash Map','Bucket Sort'],pat:'Count + Bucket by Frequency',
br:'Return the k values that appear most often.',
bt:'O(n log n)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        ordered = sorted(count, key=count.get, reverse=True)  #? sorting every distinct value: O(n log n)
        return ordered[:k]`,
o:r`class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]  #! index = frequency (max possible is n)
        for x, c in count.items():
            buckets[c].append(x)
        res = []
        for c in range(len(buckets) - 1, 0, -1):  #! walk from the highest frequency down
            for x in buckets[c]:
                res.append(x)
                if len(res) == k:
                    return res`,
trick:'"Top-k by count" → counts are bounded by n, so use the count itself as an array index (bucket sort) — no sorting needed.',
real:'Most frequent tokens for vocabulary building; top queries in logs.',
viz:{flow:[f('Step 1: count each value.',[1,1,1,2,2,3],{aux:[['count']]}),
 f('Counts: 1→3, 2→2, 3→1.',[1,1,1,2,2,3],{aux:[['count','1→3','2→2','3→1']]}),
 f('Step 2: put each value in the bucket numbered by its frequency.',[1,1,1,2,2,3],{aux:[['bucket 1','3'],['bucket 2','2'],['bucket 3','1']]}),
 f('Step 3: read buckets from the top. k = 2 → take 1, then 2.',[1,1,1,2,2,3],{g:[0,3],aux:[['bucket 3','1'],['bucket 2','2'],['answer','1','2']]})]},
test:`res=sorted(Solution().topKFrequent([1,1,1,2,2,3],2))`,exp:`[1,2]`},

{id:'product-of-array-except-self',n:238,t:'Product of Array Except Self',d:'M',tg:['Array','Prefix Sum'],pat:'Prefix × Suffix',
br:'For each position, the product of all other numbers — without division.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        res = []
        for i in range(len(nums)):
            prod = 1
            for j in range(len(nums)):  #? multiplies everything again for every i
                if j != i:
                    prod *= nums[j]
            res.append(prod)
        return res`,
o:r`class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n
        pre = 1
        for i in range(n):
            res[i] = pre  #! product of everything to the LEFT of i
            pre *= nums[i]
        suf = 1
        for i in range(n - 1, -1, -1):
            res[i] *= suf  #! times everything to the RIGHT of i
            suf *= nums[i]
        return res`,
trick:'"Everything except me" = (stuff on my left) × (stuff on my right). Two sweeps, no division.',
real:'Leave-one-out statistics and gradient-of-product computations.',
viz:{flow:[f('Answer[i] = product left of i × product right of i.',[1,2,3,4],{aux:[['res']]}),
 f('Left sweep: res[i] = product of everything before i.',[1,2,3,4],{p:{i:0},h:[0],aux:[['res',1,'·','·','·']]}),
 f('res[1] = 1, res[2] = 1·2, res[3] = 1·2·3.',[1,2,3,4],{p:{i:3},aux:[['res',1,1,2,6]]}),
 f('Right sweep: multiply by the product of everything after i.',[1,2,3,4],{p:{i:3},h:[3],aux:[['res',1,1,2,6],['suffix',1]]}),
 f('Finished: [24, 12, 8, 6].',[1,2,3,4],{g:[0,1,2,3],aux:[['res',24,12,8,6]]})]},
test:`res=Solution().productExceptSelf([1,2,3,4])`,exp:`[24,12,8,6]`},

{id:'subarray-sum-equals-k',n:560,t:'Subarray Sum Equals K',d:'M',tg:['Array','Prefix Sum','Hash Map'],pat:'Prefix Sum + Hash Map',
br:'Count the contiguous subarrays whose sum equals k.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = 0
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):  #? every start × every end
                total += nums[j]
                if total == k:
                    count += 1
        return count`,
o:r`class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        seen = {0: 1}  #! prefix sums seen so far (the empty prefix is 0)
        total = count = 0
        for x in nums:
            total += x
            count += seen.get(total - k, 0)  #! an earlier prefix of (total − k) ⇒ a subarray that sums to k
            seen[total] = seen.get(total, 0) + 1
        return count`,
trick:'"Subarray sum = k" → prefix[j] − prefix[i] = k, i.e. look up prefix − k. It\'s Two Sum on running totals.',
real:'Windowed aggregates over time series; anomaly detection on cumulative metrics.',
viz:{flow:[f('Running total = prefix sum. A subarray ending here sums to k if some earlier prefix equals total − k. k = 2.',[1,1,1],{aux:[['prefix counts','0→1'],['count',0]]}),
 f('total = 1. Need an earlier prefix of 1−2 = −1 → none. Record prefix 1.',[1,1,1],{p:{i:0},h:[0],aux:[['prefix counts','0→1','1→1'],['count',0]]}),
 f('total = 2. Need prefix 0 → seen once ⇒ subarray [1,1] ✓.',[1,1,1],{p:{i:1},h:[1],w:[0,1],aux:[['prefix counts','0→1','1→1','2→1'],['count',1]]}),
 f('total = 3. Need prefix 1 → seen once ⇒ subarray [1,1] (positions 2–3) ✓.',[1,1,1],{p:{i:2},h:[2],w:[1,2],aux:[['prefix counts','0→1','1→1','2→1','3→1'],['count',2]]})]},
test:`res=Solution().subarraySum([1,1,1],2)`,exp:`2`},

{id:'longest-consecutive-sequence',n:128,t:'Longest Consecutive Sequence',d:'M',tg:['Array','Hash Set'],pat:'Set + Run Starts',
br:'Length of the longest run of consecutive integers (order in the array does not matter).',
bt:'O(n log n)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        if not nums:
            return 0
        nums = sorted(set(nums))  #? sorting costs O(n log n)
        best = cur = 1
        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1] + 1:
                cur += 1
            else:
                cur = 1
            best = max(best, cur)
        return best`,
o:r`class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        s = set(nums)  #! O(1) membership
        best = 0
        for x in s:
            if x - 1 not in s:  #! only count from the START of a run
                y = x
                while y + 1 in s:
                    y += 1
                best = max(best, y - x + 1)
        return best`,
trick:'"Consecutive without sorting" → only start counting at numbers whose predecessor is missing. Each run is walked once.',
real:'Detecting contiguous ID ranges, session gaps, missing sequence numbers.',
viz:{flow:[f('Put everything in a set. Only numbers with no (x−1) start a run.',[100,4,200,1,3,2],{aux:[['starts']]}),
 f('100: 99 missing → start. 101 missing → run length 1.',[100,4,200,1,3,2],{p:{x:0},h:[0],aux:[['starts',100],['best',1]]}),
 f('4: 3 exists → NOT a start, skip.',[100,4,200,1,3,2],{p:{x:1},x:[1],aux:[['starts',100],['best',1]]}),
 f('1: 0 missing → start. Walk 1,2,3,4 → length 4.',[100,4,200,1,3,2],{p:{x:3},h:[3,5,4,1],aux:[['starts',100,1],['best',4]]}),
 f('Longest run = 4.',[100,4,200,1,3,2],{g:[3,5,4,1],aux:[['best',4]]})]},
test:`res=Solution().longestConsecutive([100,4,200,1,3,2])`,exp:`4`},

{id:'best-time-to-buy-and-sell-stock',n:121,t:'Best Time to Buy and Sell Stock',d:'E',tg:['Array','Greedy'],pat:'Running Minimum',
br:'Maximise profit from one buy followed by one later sell.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        best = 0
        for i in range(len(prices)):
            for j in range(i + 1, len(prices)):  #? every buy day × every sell day
                best = max(best, prices[j] - prices[i])
        return best`,
o:r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        low, best = float("inf"), 0
        for p in prices:
            low = min(low, p)  #! cheapest price so far = best buy day
            best = max(best, p - low)  #! sell today at that best buy
        return best`,
trick:'"Best buy then sell" → at each day, assume you bought at the lowest price seen so far.',
real:'Max drawdown / max run-up on a metric time series.',
viz:{flow:(()=>{const a=[7,1,5,3,6,4];let low=1e9,best=0;const o=[f('Track the lowest price so far and the best profit if we sold today.',a,{aux:[['lowest','—'],['best profit',0]]})];a.forEach((p,i)=>{low=Math.min(low,p);best=Math.max(best,p-low);o.push(f('Price '+p+'. Lowest so far = '+low+'; selling now earns '+(p-low)+'. Best = '+best+'.',a,{p:{i},h:[i],aux:[['lowest',low],['best profit',best]]}));});return o;})()},
test:`res=Solution().maxProfit([7,1,5,3,6,4])`,exp:`5`},

{id:'maximum-subarray',n:53,t:'Maximum Subarray',d:'M',tg:['Array','DP','Kadane'],pat:"Kadane's Algorithm",
br:'Largest sum of any contiguous subarray.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = nums[0]
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):  #? every start × every end
                total += nums[j]
                best = max(best, total)
        return best`,
o:r`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)  #! extend the run, or restart here if the run is a burden
            best = max(best, cur)
        return best`,
trick:'"Best contiguous sum" → at every element decide: extend the run or start fresh. Drop any negative baggage.',
real:'Finding the best contiguous window of gains, e.g. peak reward span in an RL episode.',
viz:{flow:(()=>{const a=[-2,1,-3,4,-1,2,1,-5,4];let cur=a[0],best=a[0];const o=[f('cur = best sum of a run ENDING here. Either extend it or restart at this element.',a,{p:{i:0},h:[0],aux:[['cur',cur],['best',best]]})];for(let i=1;i<a.length;i++){const x=a[i];const ext=cur+x;const restart=x>ext;cur=Math.max(x,ext);best=Math.max(best,cur);o.push(f(restart?x+' alone beats '+ext+' → restart. cur = '+cur+'.':'Extend: '+(ext-x)+' + '+x+' = '+cur+'.',a,{p:{i},h:[i],aux:[['cur',cur],['best',best]]}));}return o;})()},
test:`res=Solution().maxSubArray([-2,1,-3,4,-1,2,1,-5,4])`,exp:`6`},

{id:'maximum-product-subarray',n:152,t:'Maximum Product Subarray',d:'M',tg:['Array','DP'],pat:'Track Max and Min',
br:'Largest product of any contiguous subarray (negatives can flip signs).',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        best = nums[0]
        for i in range(len(nums)):
            prod = 1
            for j in range(i, len(nums)):  #? every start × every end
                prod *= nums[j]
                best = max(best, prod)
        return best`,
o:r`class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        best = cur_max = cur_min = nums[0]
        for x in nums[1:]:
            cands = (x, cur_max * x, cur_min * x)  #! a negative number swaps the roles of max and min
            cur_max, cur_min = max(cands), min(cands)
            best = max(best, cur_max)
        return best`,
trick:'"Product + negatives" → keep BOTH the biggest and smallest run; a minus sign turns the smallest into the biggest.',
real:'Compounded returns / multiplicative factors where sign flips matter.',
viz:{flow:(()=>{const a=[2,3,-2,4];let mx=2,mn=2,best=2;const o=[f('Keep the max AND min product of runs ending here.',a,{p:{i:0},h:[0],aux:[['max',mx],['min',mn],['best',best]]})];for(let i=1;i<a.length;i++){const x=a[i],c=[x,mx*x,mn*x];mx=Math.max(...c);mn=Math.min(...c);best=Math.max(best,mx);o.push(f('x = '+x+' → candidates '+c.join(', ')+'.',a,{p:{i},h:[i],aux:[['max',mx],['min',mn],['best',best]]}));}return o;})()},
test:`res=Solution().maxProduct([2,3,-2,4])`,exp:`6`},

{id:'3sum',n:15,t:'3Sum',d:'M',tg:['Array','Two Pointers','Sorting'],pat:'Sort + Two Pointers',
br:'All unique triplets that sum to zero.',
bt:'O(n³)',bs:'O(n)',ot:'O(n²)',os:'O(1)',
b:r`class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        found = set()
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                for k in range(j + 1, n):  #? three nested loops → O(n³)
                    if nums[i] + nums[j] + nums[k] == 0:
                        found.add(tuple(sorted((nums[i], nums[j], nums[k]))))
        return [list(t) for t in found]`,
o:r`class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()  #! sorted order enables two pointers and easy duplicate skipping
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue  #! skip repeated first numbers
            l, r = i + 1, len(nums) - 1
            while l < r:  #! two pointers replace the third loop
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append([nums[i], nums[l], nums[r]])
                    l += 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
        return res`,
trick:'"k-Sum" → sort, fix one number, then Two-Sum-II with two pointers on the rest. Skip equal neighbours to avoid duplicates.',
real:'Finding balancing combinations in sorted score/cost lists.',
viz:{flow:(()=>{const a=[-4,-1,-1,0,1,2];return [f('Sort first. Fix one number (i), then search the rest with two pointers for a pair summing to −a[i].',a,{aux:[['triplets']]}),
 f('i = −4: need 4 from the rest. L+R = −1+2 = 1 < 4 → move L. Nothing reaches 4 → next i.',a,{p:{i:0,L:1,R:5},h:[0]}),
 f('i = −1: need 1. L=−1, R=2 → sum −1+2 = 1 ✓ triplet (−1,−1,2).',a,{p:{i:1,L:2,R:5},g:[1,2,5],aux:[['triplets','(−1,−1,2)']]}),
 f('Move both. L=0, R=1 → 0+1 = 1 ✓ triplet (−1,0,1).',a,{p:{i:1,L:3,R:4},g:[1,3,4],aux:[['triplets','(−1,−1,2)','(−1,0,1)']]}),
 f('i = −1 again (duplicate of previous i) → skip. Done.',a,{p:{i:2},x:[2],aux:[['triplets','(−1,−1,2)','(−1,0,1)']]})];})()},
test:`res=sorted(Solution().threeSum([-1,0,1,2,-1,-4]))`,exp:`[[-1,-1,2],[-1,0,1]]`},

{id:'container-with-most-water',n:11,t:'Container With Most Water',d:'M',tg:['Array','Two Pointers','Greedy'],pat:'Two Pointers (shrink from the shorter wall)',
br:'Pick two vertical lines that hold the most water.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def maxArea(self, height: List[int]) -> int:
        best = 0
        for i in range(len(height)):
            for j in range(i + 1, len(height)):  #? tries every pair of walls
                best = max(best, (j - i) * min(height[i], height[j]))
        return best`,
o:r`class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r, best = 0, len(height) - 1, 0
        while l < r:  #! start with the widest container
            best = max(best, (r - l) * min(height[l], height[r]))
            if height[l] < height[r]:
                l += 1  #! the shorter wall limits us: only moving it can help
            else:
                r -= 1
        return best`,
trick:'"Widest first" → start at both ends and always throw away the SHORTER wall; the taller one may still pair with something better.',
real:'Any two-ended greedy search where width trades off against quality.',
viz:{sim:'water',arr:[1,8,6,2,5,4,8,3,7]},
test:`res=Solution().maxArea([1,8,6,2,5,4,8,3,7])`,exp:`49`},

{id:'trapping-rain-water',n:42,t:'Trapping Rain Water',d:'H',tg:['Array','Two Pointers','Stack'],pat:'Two Pointers with Running Maxes',
br:'How much rain water is trapped between the bars?',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def trap(self, height: List[int]) -> int:
        water = 0
        for i in range(len(height)):
            left = max(height[:i + 1])  #? rescans the left side for every bar
            right = max(height[i:])  #? rescans the right side for every bar
            water += min(left, right) - height[i]
        return water`,
o:r`class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        lmax = rmax = water = 0
        while l < r:  #! two pointers converge; no precomputed arrays
            if height[l] < height[r]:  #! the lower side is the limiting wall
                lmax = max(lmax, height[l])
                water += lmax - height[l]
                l += 1
            else:
                rmax = max(rmax, height[r])
                water += rmax - height[r]
                r -= 1
        return water`,
trick:'"Water on a bar" = min(tallest left, tallest right) − bar. Process the LOWER side first — its limit is already known.',
real:'Capacity / buffer-fill calculations between peaks.',
viz:{sim:'rain',arr:[0,1,0,2,1,0,1,3,2,1,2,1]},
test:`res=Solution().trap([0,1,0,2,1,0,1,3,2,1,2,1])`,exp:`6`},

{id:'valid-palindrome',n:125,t:'Valid Palindrome',d:'E',tg:['String','Two Pointers'],pat:'Two Pointers Inward',
br:'Is the string a palindrome after ignoring case and non-alphanumerics?',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def isPalindrome(self, s: str) -> bool:
        cleaned = [c.lower() for c in s if c.isalnum()]  #? builds a whole second copy: O(n) extra space
        return cleaned == cleaned[::-1]`,
o:r`class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:  #! two pointers walk inward — no copy needed
            while l < r and not s[l].isalnum():
                l += 1
            while l < r and not s[r].isalnum():
                r -= 1
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1
        return True`,
trick:'"Mirror check" → one finger at each end, walk toward the middle, skip junk.',
real:'Symmetry checks and two-ended scans in text normalisation.',
viz:{flow:(()=>{const a=[...'racecar'];const o=[f('Compare the outermost characters, then move both pointers inward.',a,{p:{l:0,r:6}})];for(let l=0;l<3;l++)o.push(f('"'+a[l]+'" = "'+a[6-l]+'" ✓',a,{p:{l,r:6-l},g:[l,6-l]}));o.push(f('Pointers met in the middle → palindrome ✓',a,{p:{'l=r':3},g:[0,1,2,3,4,5,6]}));return o;})()},
test:`res=Solution().isPalindrome("A man, a plan, a canal: Panama")`,exp:`True`},

{id:'longest-substring-without-repeating-characters',n:3,t:'Longest Substring Without Repeating Characters',d:'M',tg:['String','Sliding Window','Hash Set'],pat:'Variable Sliding Window',
br:'Length of the longest substring in which every character is unique.',
bt:'O(n²)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        best = 0
        for i in range(len(s)):
            seen = set()
            for j in range(i, len(s)):  #? restarts the scan from every i
                if s[j] in seen:
                    break
                seen.add(s[j])
            best = max(best, len(seen))
        return best`,
o:r`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = set()
        l = best = 0
        for r, c in enumerate(s):
            while c in seen:  #! shrink from the left until the duplicate is gone
                seen.remove(s[l])
                l += 1
            seen.add(c)
            best = max(best, r - l + 1)
        return best`,
trick:'"Longest window with a rule" → grow right, and when the rule breaks shrink left. Each character enters and leaves once.',
real:'Streaming dedup windows; longest unique run in a token stream.',
viz:{sim:'window',s:'abcabcbb'},
test:`res=Solution().lengthOfLongestSubstring("abcabcbb")`,exp:`3`},

{id:'minimum-window-substring',n:76,t:'Minimum Window Substring',d:'H',tg:['String','Sliding Window','Hash Map'],pat:'Expand then Contract',
br:'Smallest substring of s that contains every character of t (with multiplicity).',
bt:'O(n³)',bs:'O(m)',ot:'O(n + m)',os:'O(m)',
b:r`class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        best = ""
        for i in range(len(s)):
            for j in range(i + len(t), len(s) + 1):  #? every substring...
                window = Counter(s[i:j])  #? ...recounted from scratch
                if all(window[c] >= need[c] for c in need):
                    if not best or j - i < len(best):
                        best = s[i:j]
                    break
        return best`,
o:r`class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)  #! how many required letters are still absent
        l = 0
        best = (float("inf"), 0, 0)
        for r, c in enumerate(s):
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
            if missing == 0:  #! window is valid → squeeze it
                while need[s[l]] < 0:  #! drop letters we hold spare copies of
                    need[s[l]] += 1
                    l += 1
                if r - l + 1 < best[0]:
                    best = (r - l + 1, l, r)
                need[s[l]] += 1
                missing += 1
                l += 1
        return "" if best[0] == float("inf") else s[best[1]:best[2] + 1]`,
trick:'"Smallest window that covers X" → expand right until covered, contract left until it breaks, record, repeat.',
real:'Finding the shortest context span that contains all required evidence (retrieval snippets).',
viz:{sim:'minwin',s:'ADOBECODEBANC',t:'ABC'},
test:`res=Solution().minWindow("ADOBECODEBANC","ABC")`,exp:`"BANC"`},

{id:'sliding-window-maximum',n:239,t:'Sliding Window Maximum',d:'H',tg:['Array','Deque','Sliding Window'],pat:'Monotonic Deque',
br:'The maximum of every window of size k.',
bt:'O(n·k)',bs:'O(1)',ot:'O(n)',os:'O(k)',
b:r`class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        res = []
        for i in range(len(nums) - k + 1):
            res.append(max(nums[i:i + k]))  #? rescans k items for every window
        return res`,
o:r`class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        dq, res = deque(), []  #! indices whose values are kept in decreasing order
        for i, x in enumerate(nums):
            while dq and nums[dq[-1]] <= x:
                dq.pop()  #! smaller values behind x can never be a max again
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()  #! front slid out of the window
            if i >= k - 1:
                res.append(nums[dq[0]])  #! front of the deque = window max
        return res`,
trick:'"Max of a moving window" → a deque that stays sorted descending: pop weaker values from the back, expire old ones from the front.',
real:'Sliding-window attention masks and rolling max/min metrics.',
viz:{sim:'swmax',arr:[1,3,-1,-3,5,3,6,7],k:3},
test:`res=Solution().maxSlidingWindow([1,3,-1,-3,5,3,6,7],3)`,exp:`[3,3,5,5,6,7]`},

{id:'longest-common-prefix',n:14,t:'Longest Common Prefix',d:'E',tg:['String'],pat:'Lexicographic Extremes',
br:'Longest starting string shared by every word.',
bt:'O(n·m)',bs:'O(1)',ot:'O(n·m)',os:'O(1)',
b:r`class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        prefix = strs[0]
        for w in strs[1:]:
            while not w.startswith(prefix):  #? shrink the prefix one letter at a time, per word
                prefix = prefix[:-1]
        return prefix`,
o:r`class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        lo, hi = min(strs), max(strs)  #! the alphabetically first and last words bound everyone else
        i = 0
        while i < len(lo) and lo[i] == hi[i]:
            i += 1
        return lo[:i]`,
trick:'"Common prefix of many" → only compare the alphabetically smallest and largest; everything else sits between them.',
real:'Prefix caching: sharing the common prefix of prompts lets an LLM server reuse its KV cache.',
viz:{flow:[f('Words: flower, flow, flight. Sort order: the first and last words bound the rest.',['flight','flow','flower'],{aux:[['min','flight'],['max','flow']]}),
 f('Compare "flight" and "flow" letter by letter: f = f ✓',['f','l','i','g','h','t'],{p:{i:0},g:[0],aux:[['other','f','l','o','w']]}),
 f('l = l ✓',['f','l','i','g','h','t'],{p:{i:1},g:[0,1],aux:[['other','f','l','o','w']]}),
 f('i ≠ o → stop. Prefix = "fl".',['f','l','i','g','h','t'],{p:{i:2},g:[0,1],x:[2,3,4,5],aux:[['prefix','fl']]})]},
test:`res=Solution().longestCommonPrefix(["flower","flow","flight"])`,exp:`"fl"`}
);})();
