/* p3 — linked lists, trees, tries */
(function(){const r=String.raw,f=DR.f;
DR.add(
{id:'reverse-linked-list',n:206,t:'Reverse Linked List',d:'E',tg:['Linked List'],pat:'Flip Arrows with prev / cur',
br:'Reverse a singly linked list.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        vals = []
        node = head
        while node:  #? copies every value into a list first: O(n) extra space
            vals.append(node.val)
            node = node.next
        dummy = cur = ListNode()
        for v in reversed(vals):
            cur.next = ListNode(v)
            cur = cur.next
        return dummy.next`,
o:r`class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, cur = None, head
        while cur:
            nxt = cur.next  #! remember the rest before cutting the link
            cur.next = prev  #! flip the arrow backwards
            prev, cur = cur, nxt
        return prev`,
trick:'"Reverse in place" → three fingers: prev, cur, next. Save next, flip cur.next, slide everything one step.',
real:'Undo stacks and reversing event chains without extra memory.',
viz:{sim:'llrev',a:[1,2,3,4,5]},
test:`res=LL(Solution().reverseList(L([1,2,3,4,5])))`,exp:`[5,4,3,2,1]`},

{id:'merge-two-sorted-lists',n:21,t:'Merge Two Sorted Lists',d:'E',tg:['Linked List','Two Pointers'],pat:'Dummy Head + Compare Heads',
br:'Merge two sorted linked lists into one sorted list.',
bt:'O((n+m) log(n+m))',bs:'O(n+m)',ot:'O(n + m)',os:'O(1)',
b:r`class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        vals = []
        for node in (list1, list2):
            while node:
                vals.append(node.val)
                node = node.next
        vals.sort()  #? forgets both lists were already sorted
        dummy = cur = ListNode()
        for v in vals:
            cur.next = ListNode(v)
            cur = cur.next
        return dummy.next`,
o:r`class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = cur = ListNode()  #! dummy head avoids special-casing the first node
        while list1 and list2:
            if list1.val <= list2.val:  #! the smaller head goes next
                cur.next, list1 = list1, list1.next
            else:
                cur.next, list2 = list2, list2.next
            cur = cur.next
        cur.next = list1 or list2  #! attach whatever remains in one step
        return dummy.next`,
trick:'"Merge sorted things" → two fingers, always take the smaller head. A dummy node saves the edge case.',
real:'Merge step of merge sort and of sorted-shard compaction.',
viz:{sim:'merge2',a:[1,2,4],b:[1,3,4]},
test:`res=LL(Solution().mergeTwoLists(L([1,2,4]),L([1,3,4])))`,exp:`[1,1,2,3,4,4]`},

{id:'linked-list-cycle',n:141,t:'Linked List Cycle',d:'E',tg:['Linked List','Two Pointers'],pat:"Floyd's Tortoise and Hare",
br:'Does the linked list contain a cycle?',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        seen = set()  #? remembers every node: O(n) memory
        while head:
            if head in seen:
                return True
            seen.add(head)
            head = head.next
        return False`,
o:r`class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next  #! tortoise: 1 step
            fast = fast.next.next  #! hare: 2 steps
            if slow is fast:  #! inside a loop the hare must lap the tortoise
                return True
        return False`,
trick:'"Loop detection with no memory" → a slow and a fast runner. If there is a track loop, the fast one catches the slow one.',
real:'Detecting cycles in dependency chains or pointer graphs.',
viz:{sim:'llcycle',a:[3,2,0,-4],pos:1},
test:`h=L([3,2,0,-4])\nt=h\nwhile t.next: t=t.next\nt.next=h.next\nres=[Solution().hasCycle(h),Solution().hasCycle(L([1,2,3]))]`,exp:`[True,False]`},

{id:'copy-list-with-random-pointer',n:138,t:'Copy List with Random Pointer',d:'M',tg:['Linked List','Hash Map'],pat:'Weave Copies Into the List',
br:'Deep-copy a list where each node also has a random pointer.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(1)',
b:r`class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None
        clone = {}  #? old node → new node: O(n) extra memory
        node = head
        while node:
            clone[node] = Node(node.val)
            node = node.next
        node = head
        while node:
            clone[node].next = clone.get(node.next)
            clone[node].random = clone.get(node.random)
            node = node.next
        return clone[head]`,
o:r`class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None
        node = head
        while node:  #! 1) weave a copy right behind every node: A → A′ → B → B′
            copy = Node(node.val)
            copy.next = node.next
            node.next = copy
            node = copy.next
        node = head
        while node:  #! 2) the copy of my random target sits right behind that target
            if node.random:
                node.next.random = node.random.next
            node = node.next.next
        new_head, node = head.next, head
        while node:  #! 3) unweave: restore the original list, extract the copies
            copy = node.next
            node.next = copy.next
            copy.next = copy.next.next if copy.next else None
            node = node.next
        return new_head`,
trick:'"Clone with extra pointers" → park each copy right after its original; then copy.random = original.random.next. No map needed.',
real:'Deep-copying object graphs (config trees, ASTs) without a lookup table.',
viz:{flow:[f('Goal: copy every node AND its random pointer. Idea: place each copy right behind its original.',['7','13','11'],{aux:[['original chain','7 → 13 → 11']]}),
 f('Step 1 – weave: 7 → 7′ → 13 → 13′ → 11 → 11′',['7','7′','13','13′','11','11′'],{h:[1,3,5]}),
 f('Step 2 – set randoms: copy.random = original.random.next. 13.random = 7 → 13′.random = 7′.',['7','7′','13','13′','11','11′'],{h:[3],g:[1],aux:[['rule','copy.random = orig.random.next']]}),
 f('Step 3 – unweave: restore the original chain and extract the copy chain.',['7′','13′','11′'],{g:[0,1,2],aux:[['result','7′ → 13′ → 11′ (randoms intact)']]})]},
test:`ns=[Node(7),Node(13),Node(11)]\nfor i in range(2): ns[i].next=ns[i+1]\nns[1].random=ns[0]; ns[2].random=ns[0]\nc=Solution().copyRandomList(ns[0])\ncs=[]\nx=c\nwhile x:\n    cs.append(x); x=x.next\nidx={id(n):i for i,n in enumerate(cs)}\nold={id(n) for n in ns}\nres=([[n.val, idx.get(id(n.random))] for n in cs], all(id(n) not in old for n in cs))`,exp:`([[7,None],[13,0],[11,0]],True)`},

{id:'invert-binary-tree',n:226,t:'Invert Binary Tree',d:'E',tg:['Tree','DFS'],pat:'Swap Children Everywhere',
br:'Mirror a binary tree.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(w)',
b:r`class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        return TreeNode(root.val, self.invertTree(root.right), self.invertTree(root.left))  #? allocates a whole second tree`,
o:r`class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        stack = [root]
        while stack:
            node = stack.pop()
            if node:
                node.left, node.right = node.right, node.left  #! swap in place, no new nodes
                stack += [node.left, node.right]  #! iterative: no recursion-depth limit
        return root`,
trick:'"Mirror a tree" → at every node swap left and right. Order of visiting does not matter.',
real:'Mirroring layouts (RTL UI) and symmetric tree transforms.',
viz:{tree:[4,2,7,1,3,6,9],flow:[f('Original tree. At every node we swap the two children.',null,{tree:[4,2,7,1,3,6,9],th:[]}),
 f('Swap the children of the root: 2 ↔ 7 (their subtrees travel with them).',null,{tree:[4,7,2,6,9,1,3],th:[0]}),
 f('Swap the children of 7: 6 ↔ 9.',null,{tree:[4,7,2,9,6,1,3],th:[1]}),
 f('Swap the children of 2: 1 ↔ 3. Done.',null,{tree:[4,7,2,9,6,3,1],th:[2],tg:[0,1]})]},
test:`res=TT(Solution().invertTree(T([4,2,7,1,3,6,9])))`,exp:`[4,7,2,9,6,3,1]`},

{id:'maximum-depth-of-binary-tree',n:104,t:'Maximum Depth of Binary Tree',d:'E',tg:['Tree','DFS','BFS'],pat:'Height = 1 + max(children)',
br:'Number of levels in a binary tree.',
bt:'O(n)',bs:'O(w)',ot:'O(n)',os:'O(h)',
b:r`class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        depth, level = 0, [root]
        while level:  #? bookkeeping of whole levels in memory
            depth += 1
            level = [c for n in level for c in (n.left, n.right) if c]
        return depth`,
o:r`class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))  #! a tree is as deep as its deeper child, plus me`,
trick:'"Tree property" → trust recursion: answer(node) = 1 + max(answer(left), answer(right)), base case null = 0.',
real:'Computing nesting depth of DOM / JSON / AST structures.',
viz:{sim:'treeOrder',tree:[3,9,20,null,null,15,7],order:'post'},
test:`res=Solution().maxDepth(T([3,9,20,None,None,15,7]))`,exp:`3`},

{id:'binary-tree-level-order-traversal',n:102,t:'Binary Tree Level Order Traversal',d:'M',tg:['Tree','BFS'],pat:'BFS with a Queue',
br:'Return node values level by level.',
bt:'O(n·h)',bs:'O(h)',ot:'O(n)',os:'O(w)',
b:r`class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        def collect(node, depth, target):
            if not node:
                return []
            if depth == target:
                return [node.val]
            return collect(node.left, depth + 1, target) + collect(node.right, depth + 1, target)
        res, d = [], 0
        while True:
            level = collect(root, 0, d)  #? walks the tree from the root again for every level
            if not level:
                break
            res.append(level)
            d += 1
        return res`,
o:r`class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        res = []
        q = deque([root] if root else [])  #! queue = "who is next in line"
        while q:
            level = []
            for _ in range(len(q)):  #! exactly one level per round
                node = q.popleft()
                level.append(node.val)
                q.extend(c for c in (node.left, node.right) if c)
            res.append(level)
        return res`,
trick:'"Level by level" → BFS with a queue; freeze len(queue) at the start of each round to know where the level ends.',
real:'Rendering trees breadth-first (DOM inspectors, org charts).',
viz:{sim:'treeOrder',tree:[3,9,20,null,null,15,7],order:'level'},
test:`res=Solution().levelOrder(T([3,9,20,None,None,15,7]))`,exp:`[[3],[9,20],[15,7]]`},

{id:'validate-binary-search-tree',n:98,t:'Validate Binary Search Tree',d:'M',tg:['Tree','DFS','BST'],pat:'Pass Down Allowed Bounds',
br:'Is the tree a valid binary search tree?',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(h)',
b:r`class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        vals = []
        def inorder(n):
            if n:
                inorder(n.left)
                vals.append(n.val)
                inorder(n.right)
        inorder(root)  #? stores the whole inorder sequence
        return all(vals[i] < vals[i + 1] for i in range(len(vals) - 1))`,
o:r`class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def ok(node, lo, hi):
            if not node:
                return True
            if not (lo < node.val < hi):  #! every node must sit inside the interval its ancestors allow
                return False
            return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
        return ok(root, float("-inf"), float("inf"))`,
trick:'"BST check" → comparing to the parent is not enough. Carry an (lo, hi) window down: left child shrinks hi, right child raises lo.',
real:'Validating ordered index invariants (B-tree style).',
viz:{tree:[5,1,4,null,null,3,6],flow:[f('Each node must fall inside (lo, hi) inherited from its ancestors.',null,{th:[0],aux:[['root bounds','(−∞, ∞)']]}),
 f('1 is inside (−∞, 5) ✓',null,{th:[1],tg:[0],aux:[['bounds','(−∞, 5)']]}),
 f('4 must be inside (5, ∞) — but 4 < 5 ✗. Not a valid BST.',null,{th:[2],tg:[0,1],aux:[['bounds','(5, ∞)'],['4 is','too small']]})]},
test:`res=[Solution().isValidBST(T([2,1,3])),Solution().isValidBST(T([5,1,4,None,None,3,6])),Solution().isValidBST(T([5,4,6,None,None,3,7]))]`,exp:`[True,False,False]`},

{id:'lowest-common-ancestor-of-a-binary-tree',n:236,t:'Lowest Common Ancestor of a Binary Tree',d:'M',tg:['Tree','DFS'],pat:'Post-order: Found on Both Sides',
br:'The lowest node that has both p and q as descendants.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(h)',
b:r`class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        def path(node, target):
            if not node:
                return None
            if node is target:
                return [node]
            sub = path(node.left, target) or path(node.right, target)
            return [node] + sub if sub else None
        a, b = path(root, p), path(root, q)  #? two full walks and two stored root-to-node paths
        lca = None
        for x, y in zip(a, b):
            if x is not y:
                break
            lca = x
        return lca`,
o:r`class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        return root if left and right else left or right  #! p and q found on different sides → this node is the LCA`,
trick:'"Meeting point" → ask each subtree "do you contain p or q?". The first node that hears YES from both sides is the answer.',
real:'Finding the nearest shared parent in the DOM or in a dependency tree.',
viz:{tree:[3,5,1,6,2,0,8],flow:[f('Find the LCA of 5 and 1. Each node reports what its subtrees found.',null,{th:[0]}),
 f('Left subtree reaches 5 → reports "found 5".',null,{th:[1],tg:[]}),
 f('Right subtree reaches 1 → reports "found 1".',null,{th:[2],tg:[1]}),
 f('Back at 3: BOTH sides reported something → 3 is the lowest common ancestor.',null,{th:[],tg:[0]})]},
test:`root=T([3,5,1,6,2,0,8,None,None,7,4])\ndef find(n,v):\n    if not n: return None\n    if n.val==v: return n\n    return find(n.left,v) or find(n.right,v)\nres=[Solution().lowestCommonAncestor(root,find(root,5),find(root,1)).val,Solution().lowestCommonAncestor(root,find(root,5),find(root,4)).val]`,exp:`[3,5]`},

{id:'serialize-and-deserialize-binary-tree',n:297,t:'Serialize and Deserialize Binary Tree',d:'H',tg:['Tree','Design','DFS'],pat:'Preorder with Null Markers',
br:'Turn a tree into a string and rebuild the exact same tree.',
bt:'O(n)',bs:'O(n)',ot:'O(n)',os:'O(n)',
b:r`class Codec:
    def serialize(self, root):
        out, q = [], deque([root])
        while q:  #? level-order: needs a queue and trailing nulls
            n = q.popleft()
            if n:
                out.append(str(n.val))
                q.extend([n.left, n.right])
            else:
                out.append("#")
        return ",".join(out)
    def deserialize(self, data):
        vals = data.split(",")
        if vals[0] == "#":
            return None
        root = TreeNode(int(vals[0]))
        q, i = deque([root]), 1
        while q:
            n = q.popleft()
            if vals[i] != "#":
                n.left = TreeNode(int(vals[i])); q.append(n.left)
            i += 1
            if vals[i] != "#":
                n.right = TreeNode(int(vals[i])); q.append(n.right)
            i += 1
        return root`,
o:r`class Codec:
    def serialize(self, root):
        out = []
        def dfs(n):
            if not n:
                out.append("#")  #! null markers make the shape unambiguous
                return
            out.append(str(n.val))
            dfs(n.left)
            dfs(n.right)
        dfs(root)
        return ",".join(out)
    def deserialize(self, data):
        it = iter(data.split(","))
        def build():
            v = next(it)  #! the iterator remembers where we are
            if v == "#":
                return None
            node = TreeNode(int(v))
            node.left = build()
            node.right = build()
            return node
        return build()`,
trick:'"Round-trip a structure" → write it in preorder INCLUDING nulls; reading it back is the same recursion.',
real:'Serialising trees / JSON-like structures for storage and RPC.',
viz:{tree:[1,2,3,null,null,4,5],flow:[f('Preorder walk, writing "#" for every missing child.',null,{th:[0],aux:[['string','1']]}),
 f('Go left: 2, then its two empty children.',null,{th:[1],tg:[0],aux:[['string','1,2,#,#']]}),
 f('Go right: 3, then 4 and its empty children.',null,{th:[5],tg:[0,1,2],aux:[['string','1,2,#,#,3,4,#,#']]}),
 f('Finally 5 and its empty children. Reading it back follows the same recursion.',null,{th:[6],tg:[0,1,2,5],aux:[['string','1,2,#,#,3,4,#,#,5,#,#']]})]},
test:`c=Codec()\nres=TT(c.deserialize(c.serialize(T([1,2,3,None,None,4,5]))))`,exp:`[1,2,3,None,None,4,5]`},

{id:'implement-trie-prefix-tree',n:208,t:'Implement Trie (Prefix Tree)',d:'M',tg:['Trie','Design','String'],pat:'Trie = Dict of Dicts',
br:'insert, search and startsWith on a growing set of words.',
bt:'O(N·L) per query',bs:'O(N·L)',ot:'O(L) per op',os:'O(N·L)',
b:r`class Trie:
    def __init__(self):
        self.words = []
    def insert(self, word: str) -> None:
        self.words.append(word)
    def search(self, word: str) -> bool:
        return word in self.words  #? scans every stored word
    def startsWith(self, prefix: str) -> bool:
        return any(w.startswith(prefix) for w in self.words)  #? scans every stored word`,
o:r`class Trie:
    def __init__(self):
        self.root = {}  #! nested dicts: each level is one letter
    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node["$"] = True  #! end-of-word marker
    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and "$" in node
    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None  #! cost depends on prefix length, not on word count
    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node:
                return None
            node = node[c]
        return node`,
trick:'"Prefix queries" → share common beginnings. Walk letter by letter; the cost is the length of the query, not the size of the dictionary.',
real:'Autocomplete, tokenizer vocabularies and constrained decoding (only letters that keep a valid word).',
viz:{sim:'trie',words:['app','apple','apt','bat'],query:'ap'},
test:`t=Trie()\nt.insert("apple")\nres=[t.search("apple"),t.search("app"),t.startsWith("app")]\nt.insert("app")\nres.append(t.search("app"))`,exp:`[True,False,True,True]`},

{id:'design-add-and-search-words-data-structure',n:211,t:'Design Add and Search Words Data Structure',d:'M',tg:['Trie','DFS','Design'],pat:'Trie + DFS for Wildcards',
br:"Words can be searched with '.' standing for any letter.",
bt:'O(N·L)',bs:'O(N·L)',ot:'O(L) … O(26^L) worst',os:'O(N·L)',
b:r`class WordDictionary:
    def __init__(self):
        self.words = []
    def addWord(self, word: str) -> None:
        self.words.append(word)
    def search(self, word: str) -> bool:
        for w in self.words:  #? checks every stored word against the pattern
            if len(w) == len(word) and all(a == b or b == "." for a, b in zip(w, word)):
                return True
        return False`,
o:r`class WordDictionary:
    def __init__(self):
        self.root = {}
    def addWord(self, word: str) -> None:
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node["$"] = True
    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            c = word[i]
            if c == ".":
                return any(dfs(child, i + 1) for k, child in node.items() if k != "$")  #! wildcard: try every branch
            return c in node and dfs(node[c], i + 1)
        return dfs(self.root, 0)`,
trick:'"Pattern with blanks" → trie for the letters, DFS that fans out only at a "." — everywhere else it follows one path.',
real:'Wildcard routing and fuzzy matching of identifiers.',
viz:{sim:'trie',words:['bad','dad','mad'],query:'ba'},
test:`w=WordDictionary()\nfor x in ("bad","dad","mad"): w.addWord(x)\nres=[w.search("pad"),w.search("bad"),w.search(".ad"),w.search("b..")]`,exp:`[False,True,True,True]`},

{id:'search-suggestions-system',n:1268,t:'Search Suggestions System',d:'M',tg:['Trie','Binary Search','String'],pat:'Sort + Binary Search the Prefix',
br:'After each typed letter, suggest up to 3 products with that prefix (alphabetical).',
bt:'O(L·N·M)',bs:'O(1)',ot:'O(N log N + L·log N)',os:'O(1)',
b:r`class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        products.sort()
        res = []
        for i in range(1, len(searchWord) + 1):
            prefix = searchWord[:i]
            res.append([p for p in products if p.startswith(prefix)][:3])  #? scans every product for every typed letter
        return res`,
o:r`class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        products.sort()  #! sorted words with the same prefix sit side by side
        res, lo = [], 0
        for i in range(1, len(searchWord) + 1):
            prefix = searchWord[:i]
            lo = bisect_left(products, prefix, lo)  #! binary search for the first word ≥ prefix
            res.append([p for p in products[lo:lo + 3] if p.startswith(prefix)])  #! only the next 3 can matter
        return res`,
trick:'"Typeahead" → sort once; matches for a prefix are a contiguous block starting at bisect_left(prefix).',
real:'Search-box autocomplete and prefix lookups in sorted indexes.',
viz:{flow:[f('Sorted catalogue: mobile, moneypot, monitor, mouse, mousepad. Typed so far: "m".',['mobile','moneypot','monitor','mouse','mousepad'],{p:{lo:0},w:[0,2],aux:[['prefix','m'],['top 3','mobile','moneypot','monitor']]}),
 f('Typed "mo": block still starts at index 0.',['mobile','moneypot','monitor','mouse','mousepad'],{p:{lo:0},w:[0,2],aux:[['prefix','mo'],['top 3','mobile','moneypot','monitor']]}),
 f('Typed "mou": binary search jumps to the first word ≥ "mou" → index 3.',['mobile','moneypot','monitor','mouse','mousepad'],{p:{lo:3},w:[3,4],g:[3,4],aux:[['prefix','mou'],['top 3','mouse','mousepad']]})]},
test:`res=Solution().suggestedProducts(["mobile","mouse","moneypot","monitor","mousepad"],"mouse")`,exp:`[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]`}
);})();
