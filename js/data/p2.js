/* p2 — binary search, stacks, intervals, heaps, sorting, scheduling */
(function(){const r=String.raw,f=DR.f;
DR.add(
{id:'binary-search',n:704,t:'Binary Search',d:'E',tg:['Array','Binary Search'],pat:'Halve the Search Space',
br:'Find the index of target in a sorted array, or -1.',
bt:'O(n)',bs:'O(1)',ot:'O(log n)',os:'O(1)',
b:r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        for i in range(len(nums)):  #? looks at every element, ignoring that it is sorted
            if nums[i] == target:
                return i
        return -1`,
o:r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2  #! look at the middle...
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1  #! ...and discard the half that cannot contain target
            else:
                hi = mid - 1
        return -1`,
trick:'"Sorted + find" → ask the middle one question, throw half the array away. lo/hi/mid, and always move past mid (±1).',
real:'git bisect, searching sorted indexes, and tuning a threshold by halving.',
viz:{sim:'bsearch',arr:[-1,0,3,5,9,12,15],target:9},
test:`res=Solution().search([-1,0,3,5,9,12],9)`,exp:`4`},

{id:'search-in-rotated-sorted-array',n:33,t:'Search in Rotated Sorted Array',d:'M',tg:['Array','Binary Search'],pat:'Binary Search on the Sorted Half',
br:'A sorted array was rotated at an unknown pivot. Find target in O(log n).',
bt:'O(n)',bs:'O(1)',ot:'O(log n)',os:'O(1)',
b:r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        for i, x in enumerate(nums):  #? linear scan
            if x == target:
                return i
        return -1`,
o:r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:  #! left half is sorted
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1  #! target lies inside the sorted half → go there
                else:
                    lo = mid + 1
            else:  #! otherwise the right half is sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1`,
trick:'"Rotated array" → at least ONE half is always sorted. Check if target fits in that half; if not, go the other way.',
real:'Searching circular buffers / ring logs.',
viz:{flow:[f('Array rotated: [4,5,6,7,0,1,2]. Find 0. At least one half is always sorted.',[4,5,6,7,0,1,2],{p:{lo:0,hi:6},w:[0,6]}),
 f('mid = 3 (7). Left half 4..7 is sorted, and 0 is not in 4..7 → go right.',[4,5,6,7,0,1,2],{p:{lo:0,mid:3,hi:6},w:[0,6],h:[3]}),
 f('lo = 4. mid = 5 (1). Left half 0..1 is sorted and 0 fits → go left.',[4,5,6,7,0,1,2],{p:{lo:4,mid:5,hi:6},w:[4,6],h:[5]}),
 f('mid = 4 → value 0 = target ✓',[4,5,6,7,0,1,2],{p:{lo:4,mid:4,hi:4},g:[4]})]},
test:`res=Solution().search([4,5,6,7,0,1,2],0)`,exp:`4`},

{id:'find-peak-element',n:162,t:'Find Peak Element',d:'M',tg:['Array','Binary Search'],pat:'Binary Search on a Slope',
br:'Find any index whose value is greater than both neighbours.',
bt:'O(n)',bs:'O(1)',ot:'O(log n)',os:'O(1)',
b:r`class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        for i in range(len(nums)):  #? checks every index
            left = nums[i - 1] if i > 0 else float("-inf")
            right = nums[i + 1] if i < len(nums) - 1 else float("-inf")
            if nums[i] > left and nums[i] > right:
                return i`,
o:r`class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1  #! still climbing → a peak must exist to the right
            else:
                hi = mid  #! descending → mid itself or something left of it is a peak
        return lo`,
trick:'"Any peak" → follow the uphill side. If the right neighbour is bigger, a peak is guaranteed that way.',
real:'Hill-climbing on a 1-D score such as picking the best learning-rate bucket.',
viz:{flow:[f('Edges count as −∞, so walking uphill must reach a peak.',[1,2,1,3,5,6,4],{p:{lo:0,hi:6},w:[0,6]}),
 f('mid = 3 (3) < next (5) → still climbing, go right.',[1,2,1,3,5,6,4],{p:{lo:0,mid:3,hi:6},w:[0,6],h:[3,4]}),
 f('lo = 4. mid = 5 (6) > next (4) → descending: a peak is at mid or to its left.',[1,2,1,3,5,6,4],{p:{lo:4,mid:5,hi:6},w:[4,6],h:[5,6]}),
 f('lo = 4, hi = 5; mid = 4 (5) < 6 → go right.',[1,2,1,3,5,6,4],{p:{lo:4,mid:4,hi:5},w:[4,5],h:[4,5]}),
 f('lo = hi = 5 → peak value 6 ✓',[1,2,1,3,5,6,4],{g:[5],p:{ans:5}})]},
test:`a=[1,2,1,3,5,6,4]\ni=Solution().findPeakElement(a)\nres=a[i]>(a[i-1] if i>0 else -9e9) and a[i]>(a[i+1] if i<len(a)-1 else -9e9)`,exp:`True`},

{id:'sqrtx',n:69,t:'Sqrt(x)',d:'E',tg:['Math','Binary Search'],pat:'Binary Search on the Answer',
br:'Integer square root (round down) without using sqrt.',
bt:'O(√x)',bs:'O(1)',ot:'O(log x)',os:'O(1)',
b:r`class Solution:
    def mySqrt(self, x: int) -> int:
        i = 0
        while (i + 1) * (i + 1) <= x:  #? counts up one by one
            i += 1
        return i`,
o:r`class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi = 0, x
        while lo < hi:
            mid = (lo + hi + 1) // 2  #! round UP so the loop always makes progress
            if mid * mid <= x:
                lo = mid  #! mid still fits → the answer is mid or larger
            else:
                hi = mid - 1
        return lo`,
trick:'"Largest value that still works" → binary search the ANSWER, not an array. Use mid = (lo+hi+1)//2 when you move lo = mid.',
real:'Newton / bisection root finding and numeric thresholds in loss functions.',
viz:{sim:'bsAns',lo:0,hi:12,ok:m=>m*m<=40,goal:'Largest m with m×m ≤ 40 (x = 40).',unit:'²'},
test:`res=[Solution().mySqrt(x) for x in (0,1,4,8,40,2147395599)]`,exp:`[0,1,2,2,6,46339]`},

{id:'koko-eating-bananas',n:875,t:'Koko Eating Bananas',d:'M',tg:['Binary Search','Array'],pat:'Binary Search on the Answer',
br:'Smallest eating speed that finishes all piles within h hours.',
bt:'O(n·max)',bs:'O(1)',ot:'O(n log max)',os:'O(1)',
b:r`class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        speed = 1
        while True:  #? tries every speed 1, 2, 3, ...
            hours = sum((p + speed - 1) // speed for p in piles)
            if hours <= h:
                return speed
            speed += 1`,
o:r`class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)  #! the answer lives in [1, biggest pile]
        while lo < hi:
            mid = (lo + hi) // 2
            hours = sum((p + mid - 1) // mid for p in piles)  #! can speed 'mid' finish in time?
            if hours <= h:
                hi = mid  #! yes → try slower
            else:
                lo = mid + 1  #! no → must go faster
        return lo`,
trick:'"Minimum X such that feasible" → feasibility is monotonic, so binary search X directly and test it with a greedy check.',
real:'Finding the smallest batch size / throughput that meets a latency budget.',
viz:{sim:'bsAns',lo:1,hi:11,ok:m=>[3,6,7,11].reduce((s,p)=>s+Math.ceil(p/m),0)<=8,goal:'Piles [3,6,7,11], h = 8. Smallest speed finishing in time?',unit:'/h'},
test:`res=Solution().minEatingSpeed([3,6,7,11],8)`,exp:`4`},

{id:'find-the-index-of-the-first-occurrence-in-a-string',n:28,t:'Find the Index of the First Occurrence in a String',d:'E',tg:['String','KMP'],pat:'KMP Failure Table',
br:'Index of the first place needle appears in haystack (strStr).',
bt:'O(n·m)',bs:'O(1)',ot:'O(n + m)',os:'O(m)',
b:r`class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        for i in range(len(haystack) - len(needle) + 1):
            if haystack[i:i + len(needle)] == needle:  #? re-compares from scratch at every start
                return i
        return -1`,
o:r`class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        if not needle:
            return 0
        lps = [0] * len(needle)  #! lps[i] = longest proper prefix of needle that is also a suffix up to i
        k = 0
        for i in range(1, len(needle)):
            while k and needle[i] != needle[k]:
                k = lps[k - 1]
            if needle[i] == needle[k]:
                k += 1
            lps[i] = k
        k = 0
        for i, c in enumerate(haystack):
            while k and c != needle[k]:
                k = lps[k - 1]  #! on a mismatch, fall back — never move i backwards
            if c == needle[k]:
                k += 1
            if k == len(needle):
                return i - k + 1
        return -1`,
trick:'"Don\'t re-read text" → on a mismatch fall back inside the NEEDLE using its own prefix-suffix table; the haystack pointer only goes forward.',
real:'Streaming pattern matching in logs and parsers.',
viz:{flow:[f('Needle "abab" has failure table [0,0,1,2]: after matching "aba", a mismatch can fall back to a match of length 1, not 0.',['a','b','a','a','b','a','b'],{aux:[['lps of "abab"',0,0,1,2]]}),
 f('Text "abaabab": a, b, a match the needle so far (k = 3).',['a','b','a','a','b','a','b'],{w:[0,2],g:[0,1,2],aux:[['k',3]]}),
 f('Index 3 is "a" but the needle wants "b" → mismatch. Fall back k = lps[2] = 1 (we already know the last "a" matches).',['a','b','a','a','b','a','b'],{p:{i:3},x:[3],aux:[['k','3 → 1']]}),
 f('Still "a" vs needle[1] = "b" → fall back again: k = lps[0] = 0. The text pointer never moves backwards.',['a','b','a','a','b','a','b'],{p:{i:3},x:[3],aux:[['k','1 → 0']]}),
 f('"a" matches needle[0] → k = 1, and b, a, b follow → full match starting at index 3.',['a','b','a','a','b','a','b'],{w:[3,6],g:[3,4,5,6],aux:[['answer',3]]})]},
test:`res=[Solution().strStr("sadbutsad","sad"),Solution().strStr("abaabab","abab"),Solution().strStr("leetcode","leeto"),Solution().strStr("aaa","")]`,exp:`[0,3,-1,0]`},

{id:'valid-parentheses',n:20,t:'Valid Parentheses',d:'E',tg:['String','Stack'],pat:'Stack of Openers',
br:'Are all brackets closed in the right order?',
bt:'O(n²)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def isValid(self, s: str) -> bool:
        while "()" in s or "[]" in s or "{}" in s:  #? repeated full-string rescans
            s = s.replace("()", "").replace("[]", "").replace("{}", "")
        return s == ""`,
o:r`class Solution:
    def isValid(self, s: str) -> bool:
        pair = {")": "(", "]": "[", "}": "{"}
        stack = []  #! openers still waiting for their closer
        for c in s:
            if c in pair:
                if not stack or stack.pop() != pair[c]:  #! a closer must match the MOST RECENT opener
                    return False
            else:
                stack.append(c)
        return not stack`,
trick:'"Nested / balanced" → last opened, first closed = a stack. Push openers, pop on closers.',
real:'HTML/JSON/JSX parsing and validating nested tags in the DOM.',
viz:{sim:'parens',s:'{[()]}'},
test:`res=[Solution().isValid("()[]{}"),Solution().isValid("(]"),Solution().isValid("{[]}")]`,exp:`[True,False,True]`},

{id:'min-stack',n:155,t:'Min Stack',d:'M',tg:['Stack','Design'],pat:'Stack of (value, min so far)',
br:'A stack that also returns its minimum in O(1).',
bt:'O(n) getMin',bs:'O(n)',ot:'O(1) all ops',os:'O(n)',
b:r`class MinStack:
    def __init__(self):
        self.s = []
    def push(self, val: int) -> None:
        self.s.append(val)
    def pop(self) -> None:
        self.s.pop()
    def top(self) -> int:
        return self.s[-1]
    def getMin(self) -> int:
        return min(self.s)  #? scans the whole stack on every call`,
o:r`class MinStack:
    def __init__(self):
        self.s = []  #! each entry remembers the minimum at the time it was pushed
    def push(self, val: int) -> None:
        self.s.append((val, min(val, self.s[-1][1]) if self.s else val))
    def pop(self) -> None:
        self.s.pop()
    def top(self) -> int:
        return self.s[-1][0]
    def getMin(self) -> int:
        return self.s[-1][1]  #! the min is always one step away`,
trick:'"Extra query on a stack" → store the answer next to each item. When an item is popped, its snapshot goes with it.',
real:'Running min/max with undo, e.g. monotonic stacks in editors and rollback.',
viz:{flow:[f('Each stack entry stores (value, min so far).',[],{aux:[['stack (val,min)']]}),
 f('push 5 → (5,5)',[],{aux:[['stack (val,min)','(5,5)']]}),
 f('push 2 → (2,2): new minimum.',[],{aux:[['stack (val,min)','(5,5)','(2,2)']]}),
 f('push 7 → (7,2): min stays 2.',[],{aux:[['stack (val,min)','(5,5)','(2,2)','(7,2)']]}),
 f('getMin = top.min = 2 in O(1).',[],{aux:[['stack (val,min)','(5,5)','(2,2)','(7,2)'],['getMin',2]]}),
 f('pop 7, pop 2 → min is back to 5 automatically.',[],{aux:[['stack (val,min)','(5,5)'],['getMin',5]]})]},
test:`m=MinStack();m.push(-2);m.push(0);m.push(-3);a=m.getMin();m.pop();res=[a,m.top(),m.getMin()]`,exp:`[-3,0,-2]`},

{id:'daily-temperatures',n:739,t:'Daily Temperatures',d:'M',tg:['Array','Monotonic Stack'],pat:'Monotonic Stack',
br:'For each day, how many days until a warmer one?',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        res = [0] * n
        for i in range(n):
            for j in range(i + 1, n):  #? scans forward from every day
                if temperatures[j] > temperatures[i]:
                    res[i] = j - i
                    break
        return res`,
o:r`class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        res = [0] * len(temperatures)
        stack = []  #! days still waiting for a warmer day (temps decreasing)
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:
                j = stack.pop()
                res[j] = i - j  #! today is the answer for every colder day on the stack
            stack.append(i)
        return res`,
trick:'"Next greater element" → stack of unresolved items; a bigger newcomer resolves everything smaller on top of it.',
real:'Next-event lookups: when does a metric next exceed a threshold?',
viz:{sim:'stackMono',arr:[73,74,75,71,69,72,76,73]},
test:`res=Solution().dailyTemperatures([73,74,75,71,69,72,76,73])`,exp:`[1,1,4,2,1,1,0,0]`},

{id:'evaluate-reverse-polish-notation',n:150,t:'Evaluate Reverse Polish Notation',d:'M',tg:['Stack','Math'],pat:'Operand Stack',
br:'Evaluate a postfix expression like ["2","1","+","3","*"].',
bt:'O(n²)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        t = tokens[:]
        while len(t) > 1:
            for i, x in enumerate(t):  #? rescans the list from the start after every operation
                if x in "+-*/" and len(x) == 1:
                    a, b = int(t[i - 2]), int(t[i - 1])
                    v = a + b if x == "+" else a - b if x == "-" else a * b if x == "*" else int(a / b)
                    t[i - 2:i + 1] = [str(v)]
                    break
        return int(t[0])`,
o:r`class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        st = []  #! operands waiting for an operator
        for x in tokens:
            if x in ("+", "-", "*", "/"):
                b, a = st.pop(), st.pop()  #! operator takes the two most recent operands
                if x == "+": st.append(a + b)
                elif x == "-": st.append(a - b)
                elif x == "*": st.append(a * b)
                else: st.append(int(a / b))  #! truncate toward zero
            else:
                st.append(int(x))
        return st[0]`,
trick:'"Postfix" → numbers go on the stack, an operator eats the top two and pushes the result. No parentheses ever needed.',
real:'How compilers and calculators evaluate expressions; stack machines.',
viz:{flow:[f('Tokens: 2 1 + 3 *  (means (2+1)*3).',['2','1','+','3','*'],{aux:[['stack']]}),
 f('Number → push.',['2','1','+','3','*'],{p:{i:0},h:[0],aux:[['stack',2]]}),
 f('Number → push.',['2','1','+','3','*'],{p:{i:1},h:[1],aux:[['stack',2,1]]}),
 f('"+" pops 1 and 2, pushes 3.',['2','1','+','3','*'],{p:{i:2},h:[2],aux:[['stack',3]]}),
 f('Number → push.',['2','1','+','3','*'],{p:{i:3},h:[3],aux:[['stack',3,3]]}),
 f('"*" pops 3 and 3 → 9.',['2','1','+','3','*'],{p:{i:4},g:[4],aux:[['stack',9]]})]},
test:`res=[Solution().evalRPN(["2","1","+","3","*"]),Solution().evalRPN(["4","13","5","/","+"]),Solution().evalRPN(["10","6","9","3","+","-11","*","/","*","17","+","5","+"])]`,exp:`[9,6,22]`},

{id:'largest-rectangle-in-histogram',n:84,t:'Largest Rectangle in Histogram',d:'H',tg:['Array','Monotonic Stack'],pat:'Increasing Stack',
br:'Area of the largest rectangle that fits inside the bars.',
bt:'O(n²)',bs:'O(1)',ot:'O(n)',os:'O(n)',
b:r`class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        best = 0
        for i in range(len(heights)):
            low = heights[i]
            for j in range(i, len(heights)):  #? every left × right edge
                low = min(low, heights[j])
                best = max(best, low * (j - i + 1))
        return best`,
o:r`class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        st, best = [], 0  #! indices of bars with increasing heights
        h = heights + [0]  #! sentinel 0 flushes the stack at the end
        for i, x in enumerate(h):
            while st and h[st[-1]] >= x:
                height = h[st.pop()]  #! this bar is closed by a shorter one on the right
                left = st[-1] + 1 if st else 0
                best = max(best, height * (i - left))
            st.append(i)
        return best`,
trick:'"Biggest rectangle" → every bar is the shortest of some rectangle. A shorter bar arriving tells the taller ones how far they stretched.',
real:'Largest contiguous region under a threshold, e.g. longest stretch of acceptable latency.',
viz:{sim:'hist',arr:[2,1,5,6,2,3]},
test:`res=[Solution().largestRectangleArea([2,1,5,6,2,3]),Solution().largestRectangleArea([2,4])]`,exp:`[10,4]`},

{id:'decode-string',n:394,t:'Decode String',d:'M',tg:['String','Stack'],pat:'Two Stacks (count, text)',
br:'Expand patterns like 3[a2[c]] → accaccacc.',
bt:'O(n·k) rescans',bs:'O(n)',ot:'O(output)',os:'O(n)',
b:r`class Solution:
    def decodeString(self, s: str) -> str:
        while "[" in s:  #? repeatedly find and expand the innermost pair
            m = re.search(r"(\d+)\[([a-z]*)\]", s)
            s = s[:m.start()] + m.group(2) * int(m.group(1)) + s[m.end():]
        return s`,
o:r`class Solution:
    def decodeString(self, s: str) -> str:
        stack, cur, num = [], "", 0
        for c in s:
            if c.isdigit():
                num = num * 10 + int(c)
            elif c == "[":
                stack.append((cur, num))  #! save the outer context
                cur, num = "", 0
            elif c == "]":
                prev, k = stack.pop()  #! restore it and expand the inner text
                cur = prev + cur * k
            else:
                cur += c
        return cur`,
trick:'"Nested brackets with counts" → on "[" save (text so far, count); on "]" pop and stitch: previous + inner × count.',
real:'Template expansion and nested config rendering.',
viz:{flow:[f('Decode 3[a2[c]].',[...'3[a2[c]]'],{aux:[['stack'],['current','']]}),
 f('3 → remember count 3. "[" → push ("", 3), start fresh.',[...'3[a2[c]]'],{p:{i:1},aux:[['stack','("",3)'],['current','']]}),
 f('a → current = "a". 2 then "[" → push ("a",2).',[...'3[a2[c]]'],{p:{i:4},aux:[['stack','("",3)','("a",2)'],['current','']]}),
 f('c → current = "c".',[...'3[a2[c]]'],{p:{i:5},aux:[['stack','("",3)','("a",2)'],['current','c']]}),
 f('"]" → pop ("a",2): current = "a" + "c"×2 = "acc".',[...'3[a2[c]]'],{p:{i:6},aux:[['stack','("",3)'],['current','acc']]}),
 f('"]" → pop ("",3): current = "" + "acc"×3.',[...'3[a2[c]]'],{p:{i:7},g:[7],aux:[['current','accaccacc']]})]},
test:`res=[Solution().decodeString("3[a]2[bc]"),Solution().decodeString("3[a2[c]]"),Solution().decodeString("2[abc]3[cd]ef")]`,exp:`["aaabcbc","accaccacc","abcabccdcdcdef"]`},

{id:'merge-intervals',n:56,t:'Merge Intervals',d:'M',tg:['Array','Sorting','Intervals'],pat:'Sort by Start, then Sweep',
br:'Merge all overlapping intervals.',
bt:'O(n²)',bs:'O(n)',ot:'O(n log n)',os:'O(n)',
b:r`class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        iv = [list(x) for x in intervals]
        merged = True
        while merged:  #? keep scanning all pairs until nothing merges
            merged = False
            for i in range(len(iv)):
                for j in range(i + 1, len(iv)):
                    if iv[i][0] <= iv[j][1] and iv[j][0] <= iv[i][1]:
                        iv[i] = [min(iv[i][0], iv[j][0]), max(iv[i][1], iv[j][1])]
                        iv.pop(j)
                        merged = True
                        break
                if merged:
                    break
        return sorted(iv)`,
o:r`class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])  #! sorted by start: overlaps can only be with the previous interval
        out = []
        for s, e in intervals:
            if out and s <= out[-1][1]:
                out[-1][1] = max(out[-1][1], e)  #! overlap → extend the last interval
            else:
                out.append([s, e])
        return out`,
trick:'"Overlapping ranges" → sort by start, then each interval either extends the last one or starts a new one.',
real:'Merging time ranges: calendar free/busy, log windows, GPU reservation blocks.',
viz:{sim:'intervals',iv:[[8,10],[1,3],[2,6],[15,18]]},
test:`res=Solution().merge([[1,3],[2,6],[8,10],[15,18]])`,exp:`[[1,6],[8,10],[15,18]]`},

{id:'meeting-rooms-ii',n:253,t:'Meeting Rooms II',d:'M',tg:['Intervals','Heap','Sorting'],pat:'Min-Heap of End Times',
br:'Minimum number of rooms so no meetings overlap in the same room.',
bt:'O(n²)',bs:'O(n)',ot:'O(n log n)',os:'O(n)',
b:r`class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        best = 0
        for s, _ in intervals:  #? for each start, count the meetings alive at that moment
            alive = sum(1 for a, b in intervals if a <= s < b)
            best = max(best, alive)
        return best`,
o:r`class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        intervals.sort()  #! process meetings in start order
        rooms = []  #! min-heap of end times of rooms currently in use
        for s, e in intervals:
            if rooms and rooms[0] <= s:
                heapq.heapreplace(rooms, e)  #! earliest-finishing room is free → reuse it
            else:
                heapq.heappush(rooms, e)  #! all rooms busy → open a new one
        return len(rooms)`,
trick:'"How many at once?" → keep a min-heap of end times; if the earliest end is before the next start, reuse that room.',
real:'GPU / worker allocation: how many accelerators does a job queue need?',
viz:{flow:[f('Meetings: (0,30) (5,10) (15,20). Heap holds the end time of each room in use.',['0–30','5–10','15–20'],{aux:[['room end-times']]}),
 f('(0,30): no rooms yet → open room 1.',['0–30','5–10','15–20'],{p:{i:0},h:[0],aux:[['room end-times',30]]}),
 f('(5,10): earliest end 30 > 5 → all busy → open room 2.',['0–30','5–10','15–20'],{p:{i:1},h:[1],aux:[['room end-times',10,30]]}),
 f('(15,20): earliest end 10 ≤ 15 → reuse that room (end becomes 20).',['0–30','5–10','15–20'],{p:{i:2},h:[2],aux:[['room end-times',20,30]]}),
 f('Heap size = 2 rooms needed.',['0–30','5–10','15–20'],{g:[0,1,2],aux:[['rooms',2]]})]},
test:`res=[Solution().minMeetingRooms([[0,30],[5,10],[15,20]]),Solution().minMeetingRooms([[7,10],[2,4]])]`,exp:`[2,1]`},

{id:'sort-colors',n:75,t:'Sort Colors',d:'M',tg:['Array','Two Pointers','Sorting'],pat:'Dutch National Flag',
br:'Sort an array of 0s, 1s and 2s in place.',
bt:'O(n log n)',bs:'O(1)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def sortColors(self, nums: List[int]) -> None:
        nums.sort()  #? generic sort ignores that only 3 values exist`,
o:r`class Solution:
    def sortColors(self, nums: List[int]) -> None:
        lo, mid, hi = 0, 0, len(nums) - 1  #! three zones: 0s | 1s | unknown | 2s
        while mid <= hi:
            if nums[mid] == 0:
                nums[lo], nums[mid] = nums[mid], nums[lo]  #! 0 goes to the front zone
                lo += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[hi] = nums[hi], nums[mid]  #! 2 goes to the back zone
                hi -= 1`,
trick:'"Few distinct values" → partition into zones with 3 pointers: low / mid / high. One pass, in place.',
real:'Three-way partition inside quicksort; bucketing labels in place.',
viz:{sim:'dutch',arr:[2,0,2,1,1,0]},
test:`a=[2,0,2,1,1,0]\nSolution().sortColors(a)\nres=a`,exp:`[0,0,1,1,2,2]`},

{id:'kth-largest-element-in-an-array',n:215,t:'Kth Largest Element in an Array',d:'M',tg:['Heap','Quickselect','Sorting'],pat:'Quickselect / Min-Heap of Size k',
br:'The kth largest value in an unsorted array.',
bt:'O(n log n)',bs:'O(1)',ot:'O(n) avg',os:'O(1)',
b:r`class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        return sorted(nums, reverse=True)[k - 1]  #? sorts everything just to read one position`,
o:r`class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        target = len(nums) - k  #! kth largest = element at this index when sorted
        l, r = 0, len(nums) - 1
        while True:
            pivot, i = nums[r], l
            for j in range(l, r):
                if nums[j] < pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
            nums[i], nums[r] = nums[r], nums[i]  #! pivot is now at its final sorted index i
            if i == target:
                return nums[i]
            if i < target:
                l = i + 1  #! only recurse into the side that holds the target
            else:
                r = i - 1`,
trick:'"kth without sorting" → partition like quicksort but only follow ONE side. Average O(n). (Or keep a size-k min-heap.)',
real:'Top-k sampling over logits in LLM decoding — keep only the k best candidates.',
viz:{sim:'qselect',arr:[3,2,1,5,6,4],k:2},
test:`res=[Solution().findKthLargest([3,2,1,5,6,4],2),Solution().findKthLargest([3,2,3,1,2,4,5,5,6],4)]`,exp:`[5,4]`},

{id:'k-closest-points-to-origin',n:973,t:'K Closest Points to Origin',d:'M',tg:['Heap','Geometry','Sorting'],pat:'Max-Heap of Size k',
br:'The k points nearest to (0,0).',
bt:'O(n log n)',bs:'O(n)',ot:'O(n log k)',os:'O(k)',
b:r`class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        return sorted(points, key=lambda p: p[0] ** 2 + p[1] ** 2)[:k]  #? full sort of n points`,
o:r`class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []  #! max-heap (negated distance) holding the k closest so far
        for x, y in points:
            d = x * x + y * y  #! squared distance is enough — no sqrt
            heapq.heappush(heap, (-d, x, y))
            if len(heap) > k:
                heapq.heappop(heap)  #! evict the farthest of the k+1
        return [[x, y] for _, x, y in heap]`,
trick:'"Nearest k" → keep a heap of size k whose root is the WORST of the winners; a better candidate evicts it. Think k-NN.',
real:'k-nearest-neighbour retrieval over embeddings.',
viz:{flow:[f('Points → squared distances: (1,3)=10, (−2,2)=8, (5,8)=89, (0,1)=1. k = 2.',['(1,3)','(-2,2)','(5,8)','(0,1)'],{aux:[['max-heap (dist)']]}),
 f('Push 10.',['(1,3)','(-2,2)','(5,8)','(0,1)'],{p:{i:0},h:[0],aux:[['max-heap (dist)',10]]}),
 f('Push 8. Heap size 2 is fine.',['(1,3)','(-2,2)','(5,8)','(0,1)'],{p:{i:1},h:[1],aux:[['max-heap (dist)',10,8]]}),
 f('Push 89 → size 3 > k → evict the largest (89).',['(1,3)','(-2,2)','(5,8)','(0,1)'],{p:{i:2},x:[2],aux:[['max-heap (dist)',10,8]]}),
 f('Push 1 → evict the largest (10). Heap = {8, 1} → (−2,2) and (0,1).',['(1,3)','(-2,2)','(5,8)','(0,1)'],{p:{i:3},x:[0],g:[1,3],aux:[['max-heap (dist)',8,1]]})]},
test:`res=sorted(Solution().kClosest([[1,3],[-2,2],[5,8],[0,1]],2))`,exp:`[[-2,2],[0,1]]`},

{id:'find-median-from-data-stream',n:295,t:'Find Median from Data Stream',d:'H',tg:['Heap','Design','Two Heaps'],pat:'Two Heaps',
br:'Support addNum and findMedian on a growing stream.',
bt:'O(n) per add',bs:'O(n)',ot:'O(log n) add, O(1) median',os:'O(n)',
b:r`class MedianFinder:
    def __init__(self):
        self.a = []
    def addNum(self, num: int) -> None:
        self.a.append(num)
    def findMedian(self) -> float:
        s = sorted(self.a)  #? re-sorts everything on every query
        n = len(s)
        return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2`,
o:r`class MedianFinder:
    def __init__(self):
        self.lo = []  #! max-heap (negated) for the smaller half
        self.hi = []  #! min-heap for the larger half
    def addNum(self, num: int) -> None:
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))  #! pass the biggest of the small half across
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))  #! keep halves balanced (lo may have 1 extra)
    def findMedian(self) -> float:
        if len(self.lo) > len(self.hi):
            return -self.lo[0]  #! median = the heap roots
        return (-self.lo[0] + self.hi[0]) / 2`,
trick:'"Running median" → split the data in two halves: a max-heap of the small half, a min-heap of the big half. The median sits at the roots.',
real:'Streaming p50 latency and rolling quantiles in monitoring.',
viz:{flow:[f('Two heaps: LOW half (max-heap) and HIGH half (min-heap).',[],{aux:[['low (max)'],['high (min)']]}),
 f('add 5 → low = {5}. Median 5.',[],{aux:[['low (max)',5],['high (min)'],['median',5]]}),
 f('add 2 → 2 goes into low, then low\'s biggest (5) crosses to high. Sizes equal → low = {2}, high = {5}. Median = (2+5)/2 = 3.5.',[],{aux:[['low (max)',2],['high (min)',5],['median',3.5]]}),
 f('add 9 → low = {2}, high = {5,9} → move 5 down: low = {2,5}, high = {9}. Median = 5.',[],{aux:[['low (max)',5,2],['high (min)',9],['median',5]]}),
 f('add 7 → low = {2,5}, high = {7,9}. Median = (5+7)/2 = 6.',[],{aux:[['low (max)',5,2],['high (min)',7,9],['median',6]]})]},
test:`m=MedianFinder();m.addNum(1);m.addNum(2);a=m.findMedian();m.addNum(3);res=[a,m.findMedian()]`,exp:`[1.5,2]`},

{id:'merge-k-sorted-lists',n:23,t:'Merge k Sorted Lists',d:'H',tg:['Linked List','Heap','Divide and Conquer'],pat:'Min-Heap of List Heads',
br:'Merge k sorted linked lists into one sorted list.',
bt:'O(N log N)',bs:'O(N)',ot:'O(N log k)',os:'O(k)',
b:r`class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        vals = []
        for node in lists:
            while node:
                vals.append(node.val)
                node = node.next
        vals.sort()  #? ignores that every list is already sorted
        dummy = cur = ListNode()
        for v in vals:
            cur.next = ListNode(v)
            cur = cur.next
        return dummy.next`,
o:r`class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = [(n.val, i, n) for i, n in enumerate(lists) if n]  #! one head from each list
        heapq.heapify(heap)
        dummy = cur = ListNode()
        while heap:
            _, i, node = heapq.heappop(heap)  #! smallest head overall
            cur.next = node
            cur = cur.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))  #! replace it with its successor
        return dummy.next`,
trick:'"Merge k sorted streams" → a min-heap holding ONE candidate per stream; pop the smallest, push that stream\'s next.',
real:'Merging beam-search candidates, k-way merge in LSM databases, merging sorted shards.',
viz:{sim:'mergek',lists:[[1,4,5],[1,3,4],[2,6]]},
test:`res=LL(Solution().mergeKLists([L([1,4,5]),L([1,3,4]),L([2,6])]))`,exp:`[1,1,2,3,4,4,5,6]`},

{id:'task-scheduler',n:621,t:'Task Scheduler',d:'M',tg:['Greedy','Heap','Counting'],pat:'Most Frequent Task Sets the Frame',
br:'Minimum time to run all tasks with a cooldown n between identical ones.',
bt:'O(T·26)',bs:'O(26)',ot:'O(T)',os:'O(26)',
b:r`class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = Counter(tasks)
        last = {}
        time = 0
        while sum(count.values()) > 0:  #? simulates every single time slot
            ready = [t for t in count if count[t] > 0 and time - last.get(t, -10**9) > n]
            if ready:
                t = max(ready, key=lambda x: count[x])
                count[t] -= 1
                last[t] = time
            time += 1
        return time`,
o:r`class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = Counter(tasks)
        mx = max(count.values())  #! the busiest task dictates the frame
        n_max = sum(1 for v in count.values() if v == mx)  #! how many tasks tie for busiest
        return max(len(tasks), (mx - 1) * (n + 1) + n_max)  #! frames of size n+1, last frame only holds the ties`,
trick:'"Cooldown scheduling" → lay out the most frequent task as columns of width n+1; everything else just fills the gaps. Answer = max(len(tasks), frame formula).',
real:'Batching and rate-limited job scheduling (API calls with per-key cooldowns).',
viz:{flow:[f('Tasks AAABBB, cooldown n = 2. A is the busiest (3×).',[...'AAABBB'],{aux:[['frame width','n + 1 = 3']]}),
 f('Frame 1: A B idle',['A','B','·'],{aux:[['time',3]]}),
 f('Frame 2: A B idle',['A','B','·','A','B','·'],{aux:[['time',6]]}),
 f('Last frame has no idle at the end — only the tied tasks (A, B): A B',['A','B','·','A','B','·','A','B'],{g:[6,7],aux:[['time',8],['formula','(3−1)·3 + 2 = 8']]})]},
test:`res=[Solution().leastInterval(list("AAABBB"),2),Solution().leastInterval(list("AAABBB"),0),Solution().leastInterval(list("AAAAAABCDEFG"),2)]`,exp:`[8,6,16]`}
);})();
