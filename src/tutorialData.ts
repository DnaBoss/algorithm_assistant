export type VisualKind = 'array' | 'linked-list' | 'tree' | 'stack'
export type Pointer = { label: string; index?: number; node?: string; color?: string }
export type Step = {
  title: string
  explain: string
  codeLine: string
  variables: Record<string, string | number | boolean | null>
  visual: {
    kind: VisualKind
    items?: Array<number | string>
    links?: Array<{ id: string; value: number | string; next?: string | null; highlight?: boolean; faded?: boolean }>
    nodes?: Array<{ id: string; value: number | string; x: number; y: number; left?: string; right?: string; highlight?: boolean; faded?: boolean }>
    stack?: string[]
    pointers?: Pointer[]
    notes?: string[]
  }
}
export type Tutorial = { id: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; group: string; summary: string; tags: string[]; idea: string[]; complexity: string; code: string[]; steps: Step[] }
type RawTutorial = Omit<Tutorial, 'tags' | 'idea' | 'code' | 'steps' | 'complexity'> & { tags: string[]; pattern: VisualKind; focus: string; operation: string }

const codeByPattern: Record<VisualKind, string[]> = {
  array: ['初始化答案與輔助結構', 'for / while 掃描目前元素或窗口', '依照條件更新指標、狀態或答案', '回傳最終結果'],
  'linked-list': ['ListNode dummy(0);', 'ListNode* prev = &dummy; ListNode* cur = head;', '調整 next 指標，避免遺失後續節點', '移動 prev / cur 到下一個白板狀態', 'return dummy.next ? dummy.next : head;'],
  tree: ['int dfs(TreeNode* node) {', '  if (node == nullptr) return base;', '  int left = dfs(node->left);', '  int right = dfs(node->right);', '  return combine(node, left, right);', '}'],
  stack: ['for (auto item : input) {', '  while (!st.empty() && 需要彈出) st.pop();', '  st.push(目前狀態);', '  更新答案或檢查 st.top();', '}']
}

function arrayItemsFor(raw: RawTutorial): Array<number | string> {
  if (raw.id.includes('stock')) return [7, 1, 5, 3, 6, 4]
  if (raw.id.includes('duplicate')) return [1, 2, 3, 1]
  if (raw.id.includes('product')) return [1, 2, 3, 4]
  if (raw.id.includes('maximum-subarray')) return [-2, 1, -3, 4, -1, 2, 1]
  if (raw.id.includes('rotated')) return [4, 5, 6, 7, 0, 1, 2]
  if (raw.id.includes('coin')) return [1, 2, 5, 11]
  if (raw.id.includes('house')) return [2, 7, 9, 3, 1]
  if (raw.id.includes('substring')) return ['a', 'b', 'c', 'a', 'b', 'c']
  if (raw.id.includes('matrix') || raw.tags.includes('Matrix')) return ['r0c0', 'r0c1', 'r1c0', 'r1c1']
  const seed = [...raw.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return [0, 1, 2, 3].map(i => ((seed + i * 3) % 13) - 3)
}

function specificSteps(raw: RawTutorial): Step[] | null {
  if (raw.id === 'two-sum') return [
    { title: 'LeetCode 測資與初始化', explain: '使用 LeetCode 範例 nums=[2,7,11,15], target=9。unordered_map 先是空的，還沒進入迴圈。', codeLine: 'unordered_map<int, int> seen;', variables: { nums: '[2,7,11,15]', target: 9, i: '-', nums_i: '-', need: '-', map: '{}', answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [], notes: ['測資固定：nums=[2,7,11,15], target=9', 'seen 記錄「值 → 索引」'] } },
    { title: 'i=0，讀 nums[0]', explain: '迴圈開始，i 指向 index 0，目前值 nums[i]=2。', codeLine: '  for (int i = 0; i < nums.size(); i++) {', variables: { nums: '[2,7,11,15]', target: 9, i: 0, nums_i: 2, need: '-', map: '{}', answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'i', index: 0, color: '#18E299' }], notes: ['目前處理 nums[0] = 2'] } },
    { title: '計算 need=7', explain: '照程式碼計算 need = target - nums[i] = 9 - 2 = 7。', codeLine: '    int need = target - nums[i];', variables: { nums: '[2,7,11,15]', target: 9, i: 0, nums_i: 2, need: 7, map: '{}', answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'i=0', index: 0, color: '#18E299' }, { label: 'need=7', index: 1, color: '#fbbf24' }], notes: ['need=7 但 map 目前是空的'] } },
    { title: '查 seen，沒有 7', explain: '執行 if (seen.count(need))，seen 裡沒有 7，所以不能回傳答案。', codeLine: '  if (seen.count(need)) return {seen[need], i};', variables: { nums: '[2,7,11,15]', target: 9, i: 0, nums_i: 2, need: 7, map: '{}', hasNeed: false, answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'i=0', index: 0, color: '#18E299' }, { label: 'not found', index: 1, color: '#ef4444' }], notes: ['seen.count(7) = 0'] } },
    { title: '把 2 放進 seen', explain: '沒有找到補數，所以執行 seen[nums[i]] = i，記錄 2 的索引是 0。', codeLine: '  seen[nums[i]] = i;', variables: { nums: '[2,7,11,15]', target: 9, i: 0, nums_i: 2, need: 7, map: '{2:0}', answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'stored', index: 0, color: '#18E299' }], notes: ['seen = {2:0}', '下一輪若需要 2，就能找到 index 0'] } },
    { title: 'i=1，讀 nums[1]', explain: 'i 前進到 index 1，目前值 nums[i]=7。', codeLine: '  for (int i = 0; i < nums.size(); i++) {', variables: { nums: '[2,7,11,15]', target: 9, i: 1, nums_i: 7, need: '-', map: '{2:0}', answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'seen', index: 0, color: '#a78bfa' }, { label: 'i', index: 1, color: '#18E299' }], notes: ['seen 已經記住 2 在 index 0'] } },
    { title: '計算 need=2 並命中', explain: 'need = 9 - 7 = 2。seen 裡有 2，代表 nums[0] + nums[1] = 9。', codeLine: '    int need = target - nums[i];', variables: { nums: '[2,7,11,15]', target: 9, i: 1, nums_i: 7, need: 2, map: '{2:0}', hasNeed: true, answer: '-' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'need=2', index: 0, color: '#fbbf24' }, { label: 'i=1', index: 1, color: '#18E299' }], notes: ['seen.count(2) = 1', 'seen[2] = 0'] } },
    { title: '回傳答案 [0,1]', explain: '執行 return {seen[need], i}，也就是 [0,1]。', codeLine: '  if (seen.count(need)) return {seen[need], i};', variables: { nums: '[2,7,11,15]', target: 9, i: 1, nums_i: 7, need: 2, map: '{2:0}', answer: '[0,1]' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'answer[0]', index: 0, color: '#18E299' }, { label: 'answer[1]', index: 1, color: '#18E299' }], notes: ['nums[0] + nums[1] = 2 + 7 = 9', '答案是索引，不是數值：[0,1]'] } }
  ]
  if (raw.id === 'three-sum') return [
    { title: '排序並固定 i', explain: 'nums 排序後固定 i=0，也就是 -4；left 指向 -1，right 指向 2。', codeLine: codeByPattern.array[1], variables: { i: 0, left: 1, right: 5, sum: -3, target: 0 }, visual: { kind: 'array', items: [-4, -1, -1, 0, 1, 2], pointers: [{ label: 'i', index: 0, color: '#18E299' }, { label: 'L', index: 1, color: '#a78bfa' }, { label: 'R', index: 5, color: '#fbbf24' }], notes: ['sum=-4+(-1)+2=-3，太小，left 右移'] } },
    { title: 'left 右移', explain: 'sum 太小，表示需要更大的值，所以 left 從 index 1 移到 index 2，再繼續比較。', codeLine: codeByPattern.array[2], variables: { i: 0, left: 2, right: 5, sum: -3, action: 'left++' }, visual: { kind: 'array', items: [-4, -1, -1, 0, 1, 2], pointers: [{ label: 'i', index: 0, color: '#18E299' }, { label: 'L', index: 2, color: '#a78bfa' }, { label: 'R', index: 5, color: '#fbbf24' }], notes: ['重複 -1 仍會被處理；命中後才跳過重複'] } },
    { title: '換下一個 i 找到答案', explain: 'i 移到 -1 後，left=0、right=2，sum=1，right 左移後得到 [-1,-1,2]。', codeLine: codeByPattern.array[3], variables: { i: 1, left: 2, right: 5, answer: '[-1,-1,2]' }, visual: { kind: 'array', items: [-4, -1, -1, 0, 1, 2], pointers: [{ label: 'i', index: 1, color: '#18E299' }, { label: 'L', index: 2, color: '#a78bfa' }, { label: 'R', index: 5, color: '#fbbf24' }], notes: ['命中後 left/right 同時移動並跳過重複'] } }
  ]
  if (raw.id === 'container-with-most-water') return [
    { title: '兩端開始', explain: 'left 在高度 1，right 在高度 7，寬度 8，面積由較短邊 1 決定。', codeLine: codeByPattern.array[1], variables: { left: 0, right: 8, width: 8, minHeight: 1, area: 8 }, visual: { kind: 'array', items: [1, 8, 6, 2, 5, 4, 8, 3, 7], pointers: [{ label: 'L', index: 0, color: '#18E299' }, { label: 'R', index: 8, color: '#fbbf24' }], notes: ['area = min(1,7) * 8 = 8；移動短邊 left'] } },
    { title: '移動較短邊', explain: 'left 移到高度 8，right 仍在 7，面積變成 min(8,7)*7=49。', codeLine: codeByPattern.array[2], variables: { left: 1, right: 8, width: 7, minHeight: 7, best: 49 }, visual: { kind: 'array', items: [1, 8, 6, 2, 5, 4, 8, 3, 7], pointers: [{ label: 'L', index: 1, color: '#18E299' }, { label: 'R', index: 8, color: '#fbbf24' }], notes: ['best 更新為 49；接著移動 right'] } },
    { title: '收斂', explain: '每次只移動較短的板，因為寬度只會變小，保留短板不可能得到更大面積。', codeLine: codeByPattern.array[3], variables: { best: 49, rule: 'move shorter side' }, visual: { kind: 'array', items: [1, 8, 6, 2, 5, 4, 8, 3, 7], pointers: [{ label: 'best L', index: 1, color: '#18E299' }, { label: 'best R', index: 8, color: '#fbbf24' }], notes: ['答案 49 來自 index 1 與 8'] } }
  ]
  if (raw.id === 'number-of-islands') return [
    { title: '遇到第一塊陸地', explain: '掃描 grid，遇到第一個 1，島嶼數 +1，並從這格開始 DFS。', codeLine: codeByPattern.array[1], variables: { row: 0, col: 0, islands: 1, current: '1' }, visual: { kind: 'array', items: ['1', '1', '0', '1', '0'], pointers: [{ label: 'DFS', index: 0, color: '#18E299' }], notes: ['這裡用一列壓縮圖表示 grid 的目前掃描列'] } },
    { title: 'DFS 沉島', explain: '把相連的 1 標記成 visited/0，避免之後重複計算同一座島。', codeLine: codeByPattern.array[2], variables: { visited: '(0,0),(0,1)', islands: 1, action: 'mark 1 -> 0' }, visual: { kind: 'array', items: ['0', '0', '0', '1', '0'], pointers: [{ label: 'visited', index: 0, color: '#a78bfa' }, { label: 'visited', index: 1, color: '#a78bfa' }], notes: ['新增、移除不是改答案，而是標記已走過的格子'] } },
    { title: '繼續掃描下一座島', explain: '前面的島已沉完，後面再遇到 1 才代表新的島。', codeLine: codeByPattern.array[3], variables: { row: 0, col: 3, islands: 2 }, visual: { kind: 'array', items: ['0', '0', '0', '1', '0'], pointers: [{ label: 'new island', index: 3, color: '#18E299' }], notes: ['島嶼題的圖應該跟 DFS 走訪同步變化'] } }
  ]
  if (raw.id === 'invert-binary-tree') return [
    { title: 'current = 4', explain: '目前在 root=4，左子樹是 2，右子樹是 7。', codeLine: codeByPattern.tree[0], variables: { current: 4, left: 2, right: 7 }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '2', right: '7', highlight: true }, { id: '2', value: 2, x: 28, y: 35, left: '1', right: '3' }, { id: '7', value: 7, x: 72, y: 35, left: '6', right: '9' }, { id: '1', value: 1, x: 18, y: 68 }, { id: '3', value: 3, x: 38, y: 68 }, { id: '6', value: 6, x: 62, y: 68 }, { id: '9', value: 9, x: 82, y: 68 }], pointers: [{ label: 'current', node: '4' }], notes: ['交換 4.left 與 4.right，不是改節點值'] } },
    { title: '交換 root 左右', explain: '4.left 改指向 7，4.right 改指向 2，圖形位置同步左右對調。', codeLine: codeByPattern.tree[4], variables: { current: 4, left: 7, right: 2 }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '7', right: '2', highlight: true }, { id: '7', value: 7, x: 28, y: 35, left: '6', right: '9' }, { id: '2', value: 2, x: 72, y: 35, left: '1', right: '3' }, { id: '6', value: 6, x: 18, y: 68 }, { id: '9', value: 9, x: 38, y: 68 }, { id: '1', value: 1, x: 62, y: 68 }, { id: '3', value: 3, x: 82, y: 68 }], pointers: [{ label: 'current', node: '4' }], notes: ['指標換邊，子樹整包跟著換邊'] } },
    { title: '遞迴處理子樹', explain: '接著 current 移到 7 與 2，各自重複交換左右孩子。', codeLine: codeByPattern.tree[2], variables: { nextCurrent: 7, action: 'swap children recursively' }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '7', right: '2' }, { id: '7', value: 7, x: 28, y: 35, left: '9', right: '6', highlight: true }, { id: '2', value: 2, x: 72, y: 35, left: '3', right: '1' }, { id: '9', value: 9, x: 18, y: 68 }, { id: '6', value: 6, x: 38, y: 68 }, { id: '3', value: 3, x: 62, y: 68 }, { id: '1', value: 1, x: 82, y: 68 }], pointers: [{ label: 'current', node: '7' }], notes: ['每個節點的圖都會改，不是同一張示意圖'] } }
  ]
  if (raw.id === 'reverse-linked-list') return [
    { title: '保存 next', explain: 'cur 在 1，先保存 next=2，否則反轉 cur.next 後會找不到後面的鏈表。', codeLine: codeByPattern['linked-list'][2], variables: { prev: null, cur: 1, next: 2 }, visual: { kind: 'linked-list', links: [{ id: '1', value: 1, next: '2', highlight: true }, { id: '2', value: 2, next: '3' }, { id: '3', value: 3, next: null }], pointers: [{ label: 'cur', node: '1' }, { label: 'next', node: '2' }], notes: ['先保存 next，再改 cur.next'] } },
    { title: '反轉箭頭', explain: '執行 cur.next = prev；箭頭從向右改成向左。', codeLine: codeByPattern['linked-list'][2], variables: { prev: null, cur: 1, next: 2, changed: '1.next = null' }, visual: { kind: 'linked-list', links: [{ id: '1', value: 1, next: null, highlight: true }, { id: '2', value: 2, next: '3' }, { id: '3', value: 3, next: null }], pointers: [{ label: 'prev<-cur', node: '1' }, { label: 'next', node: '2' }], notes: ['cur.next = prev；箭頭從向右改成向左'] } },
    { title: 'prev/cur 前進', explain: 'prev 移到 1，cur 移到 2，下一輪會把 2 指回 1。', codeLine: codeByPattern['linked-list'][3], variables: { prev: 1, cur: 2, next: 3 }, visual: { kind: 'linked-list', links: [{ id: '2', value: 2, next: '1', highlight: true }, { id: '1', value: 1, next: null }, { id: '3', value: 3, next: null }], pointers: [{ label: 'cur', node: '2' }, { label: 'prev', node: '1' }], notes: ['下一步會形成 2 → 1 → null'] } }
  ]
  return null
}

function stepsFor(raw: RawTutorial): Step[] {
  const specific = specificSteps(raw)
  if (specific) return specific
  const items = arrayItemsFor(raw)
  if (raw.pattern === 'linked-list') return [
    { title: '建立白板狀態', explain: `${raw.title} 先把 dummy、prev、cur 畫出來，確認每個指標目前指向哪個節點。`, codeLine: codeByPattern['linked-list'][1], variables: { prev: 'dummy', cur: 'head', operation: raw.operation }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: 'a' }, { id: 'a', value: 1, next: 'b', highlight: true }, { id: 'b', value: 2, next: 'c' }, { id: 'c', value: 3, next: null }], pointers: [{ label: 'prev', node: 'd' }, { label: 'cur', node: 'a' }], notes: ['先畫節點，再畫指標；不要直接改值。'] } },
    { title: '改變連線', explain: `執行核心動作：${raw.operation}。白板上用箭頭重接 next，先保存會被斷開的節點。`, codeLine: codeByPattern['linked-list'][2], variables: { savedNext: 'cur.next', changed: true, focus: raw.focus }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: 'b', faded: true }, { id: 'b', value: 2, next: 'a', highlight: true }, { id: 'a', value: 1, next: 'c' }, { id: 'c', value: 3, next: null }], pointers: [{ label: 'prev', node: 'd' }, { label: 'cur', node: 'b' }], notes: ['箭頭變化是本題 dry run 的核心。'] } },
    { title: '移動指標並收斂', explain: '完成本輪後移動指標，檢查是否已處理完剩餘節點。', codeLine: codeByPattern['linked-list'][3], variables: { prev: '下一個穩定節點', cur: '下一個待處理節點', done: '依題目條件' }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: 'b', faded: true }, { id: 'b', value: 2, next: 'a' }, { id: 'a', value: 1, next: 'c' }, { id: 'c', value: 3, next: null, highlight: true }], pointers: [{ label: 'tail / cur', node: 'c' }], notes: ['每一輪只做一個安全的指標變更。'] } }
  ]
  if (raw.pattern === 'tree') return [
    { title: '定位 current node', explain: `${raw.title} 先把 root/current、左右子樹與回傳值畫清楚。`, codeLine: codeByPattern.tree[0], variables: { current: 'root', left: '待計算', right: '待計算', focus: raw.focus }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '2', right: '7', highlight: true }, { id: '2', value: 2, x: 28, y: 35, left: '1', right: '3' }, { id: '7', value: 7, x: 72, y: 35, left: '6', right: '9' }, { id: '1', value: 1, x: 18, y: 68 }, { id: '3', value: 3, x: 38, y: 68 }, { id: '6', value: 6, x: 62, y: 68 }, { id: '9', value: 9, x: 82, y: 68 }], pointers: [{ label: 'current', node: '4' }], notes: ['樹題先問：目前節點要向左右子樹拿什麼資訊？'] } },
    { title: '處理左右子樹', explain: `對 left/right 套用同一個規則：${raw.operation}。`, codeLine: codeByPattern.tree[2], variables: { current: 4, leftResult: '由左子樹回傳', rightResult: '由右子樹回傳' }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '2', right: '7' }, { id: '2', value: 2, x: 28, y: 35, left: '1', right: '3', highlight: true }, { id: '7', value: 7, x: 72, y: 35, left: '6', right: '9', highlight: true }, { id: '1', value: 1, x: 18, y: 68 }, { id: '3', value: 3, x: 38, y: 68 }, { id: '6', value: 6, x: 62, y: 68 }, { id: '9', value: 9, x: 82, y: 68 }], notes: ['左右結果回到 current 後再合併。'] } },
    { title: '合併並回傳', explain: '把 current 的值與左右結果合併，回傳給父節點或成為答案。', codeLine: codeByPattern.tree[4], variables: { combine: 'node + left + right', answer: '更新全域或回傳值' }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '2', right: '7', highlight: true }, { id: '2', value: 2, x: 28, y: 35 }, { id: '7', value: 7, x: 72, y: 35 }], pointers: [{ label: 'return', node: '4' }], notes: ['後序 / 前序 / 中序差異在合併時機。'] } }
  ]
  if (raw.pattern === 'stack') return [
    { title: '掃描輸入', explain: `${raw.title} 把目前元素與 stack top 同時寫在白板上。`, codeLine: codeByPattern.stack[0], variables: { i: 0, current: '第一個元素', stackTop: '空', focus: raw.focus }, visual: { kind: 'stack', stack: [], notes: ['stack 保存尚未解決的候選狀態。'] } },
    { title: '根據 top 決定 push / pop', explain: `如果 top 已不符合條件，就彈出；否則把目前狀態放入 stack。核心動作：${raw.operation}。`, codeLine: codeByPattern.stack[1], variables: { action: 'push / pop', stack: '[候選狀態]', answer: '可能更新' }, visual: { kind: 'stack', stack: ['候選 1', '候選 2'], notes: ['只比較目前元素與 stack top。'] } },
    { title: '輸出答案', explain: '掃描結束後，stack 或累積答案給出最終結果。', codeLine: codeByPattern.stack[3], variables: { done: true, answer: '依題目定義' }, visual: { kind: 'stack', stack: ['最終狀態'], notes: ['檢查是否需要清空 stack 或保留 top。'] } }
  ]
  return [
    { title: '初始化窗口 / 狀態', explain: `${raw.title} 先定義指標、答案與輔助資料結構。`, codeLine: codeByPattern.array[0], variables: { left: 0, right: 0, answer: '初始值', focus: raw.focus }, visual: { kind: 'array', items: items, pointers: [{ label: 'L', index: 0, color: '#18E299' }, { label: 'R', index: 0, color: '#a78bfa' }], notes: ['先確認不變量：目前狀態代表什麼？'] } },
    { title: '移動指標並更新狀態', explain: `依照條件執行：${raw.operation}。每次移動後同步更新變數表。`, codeLine: codeByPattern.array[2], variables: { left: 0, right: 2, current: 'nums[right]', answer: '更新中' }, visual: { kind: 'array', items: items, pointers: [{ label: 'L', index: 0, color: '#18E299' }, { label: 'R', index: 2, color: '#a78bfa' }], notes: ['白板 dry run 只展示關鍵狀態轉移。'] } },
    { title: '收斂答案', explain: '當掃描完成或條件命中，回傳目前最佳答案。', codeLine: codeByPattern.array[3], variables: { done: true, answer: '最終結果' }, visual: { kind: 'array', items: items, pointers: [{ label: 'answer', index: 1, color: '#18E299' }, { label: 'answer', index: 2, color: '#18E299' }], notes: ['確認邊界：空陣列、單元素、重複值。'] } }
  ]
}

function codeFor(raw: RawTutorial): string[] {
  if (raw.id === 'two-sum') return ['vector<int> twoSum(vector<int>& nums, int target) {', '  unordered_map<int, int> seen;', '  for (int i = 0; i < nums.size(); i++) {', '    int need = target - nums[i];', '    if (seen.count(need)) return {seen[need], i};', '    seen[nums[i]] = i;', '  }', '  return {};', '}']
  return codeByPattern[raw.pattern]
}

function make(raw: RawTutorial): Tutorial {
  return {
    ...raw,
    tags: ['Blind 75', 'LeetCode 75', ...raw.tags],
    idea: [`核心觀念：${raw.focus}。`, `白板推演時固定追蹤目前指標 / 節點與答案狀態。`, `每一步只做一個動作：${raw.operation}，再檢查不變量是否仍成立。`],
    code: codeFor(raw),
    complexity: raw.pattern === 'tree' ? 'Time O(n), Space O(h)' : raw.pattern === 'linked-list' ? 'Time O(n), Space O(1)' : raw.pattern === 'stack' ? 'Time O(n), Space O(n)' : 'Time O(n), Space O(n) 或依排序/二分條件調整',
    steps: stepsFor(raw)
  }
}

const rawTutorials: RawTutorial[] = [
  { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', group: 'Array / Hash Map', summary: '用雜湊表記錄看過的數字，遇到 target - nums[i] 就回傳答案。', tags: ['Array', 'Hash Map', 'Beginner'], pattern: 'array', focus: '補數查找與索引記錄', operation: '先查 need 是否存在，再把目前數字放入 map' },
  { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', group: 'Array / Sliding Window', summary: '維護目前最低買入價，逐日更新最大利潤。', tags: ['Array', 'Sliding Window', 'Greedy', 'Beginner'], pattern: 'array', focus: '最低買點與最大獲利', operation: 'price - minPrice 更新 profit，再更新 minPrice' },
  { id: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy', group: 'Array / Hash Set', summary: '掃描陣列並用 set 判斷是否看過相同元素。', tags: ['Array', 'Hash Set', 'Beginner'], pattern: 'array', focus: '已看過集合', operation: '若 set 已有 nums[i] 回傳 true，否則加入 set' },
  { id: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium', group: 'Array / Prefix Product', summary: '用前綴積與後綴積在 O(n) 內求出不含自己的乘積。', tags: ['Array', 'Prefix', 'Medium'], pattern: 'array', focus: 'prefix 與 suffix 乘積', operation: '先寫入左側乘積，再從右往左乘上右側乘積' },
  { id: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium', group: 'Array / Kadane', summary: '每一步決定要延續前段或從目前元素重新開始。', tags: ['Array', 'DP', 'Kadane'], pattern: 'array', focus: '目前最佳連續和', operation: 'current = max(nums[i], current + nums[i])，再更新 best' },
  { id: 'maximum-product-subarray', title: 'Maximum Product Subarray', difficulty: 'Medium', group: 'Array / DP', summary: '同時維護最大與最小乘積，處理負數翻轉。', tags: ['Array', 'DP'], pattern: 'array', focus: 'maxProduct / minProduct', operation: '遇到負數時最大最小可能交換，再更新答案' },
  { id: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', group: 'Binary Search', summary: '比較 mid 與 right 判斷最小值落在哪一半。', tags: ['Array', 'Binary Search'], pattern: 'array', focus: '旋轉陣列的有序半邊', operation: 'nums[mid] > nums[right] 則 left = mid + 1，否則 right = mid' },
  { id: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', group: 'Binary Search', summary: '每次找出哪一半有序，再判斷 target 是否在那一半。', tags: ['Array', 'Binary Search'], pattern: 'array', focus: '有序半邊與 target 範圍', operation: '根據有序區間移動 left/right' },
  { id: 'three-sum', title: '3Sum', difficulty: 'Medium', group: 'Two Pointers', summary: '排序後固定一個數，再用雙指標找另外兩個數。', tags: ['Array', 'Two Pointers', 'Sorting'], pattern: 'array', focus: '固定 i 與左右夾逼', operation: 'sum 太小左指標右移，太大右指標左移，命中後跳過重複' },
  { id: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium', group: 'Two Pointers', summary: '雙指標從兩端往內縮，每次移動較短的板。', tags: ['Array', 'Two Pointers', 'Greedy'], pattern: 'array', focus: '寬度與較短高度決定面積', operation: '更新 area 後移動高度較小的一側' },
  { id: 'sum-of-two-integers', title: 'Sum of Two Integers', difficulty: 'Medium', group: 'Bit Manipulation', summary: '用 XOR 表示無進位加法，用 AND 左移表示進位。', tags: ['Bit Manipulation'], pattern: 'array', focus: 'sum without carry 與 carry', operation: 'a ^ b 得到部分和，(a & b) << 1 得到進位' },
  { id: 'number-of-1-bits', title: 'Number of 1 Bits', difficulty: 'Easy', group: 'Bit Manipulation', summary: '重複清掉最低位的 1，計算執行次數。', tags: ['Bit Manipulation', 'Beginner'], pattern: 'array', focus: '最低位 1', operation: 'n = n & (n - 1) 每次移除一個 1' },
  { id: 'counting-bits', title: 'Counting Bits', difficulty: 'Easy', group: 'Bit Manipulation / DP', summary: '利用 i >> 1 的答案推導 i 的 bit count。', tags: ['Bit Manipulation', 'DP'], pattern: 'array', focus: '低一半狀態轉移', operation: 'bits[i] = bits[i >> 1] + (i & 1)' },
  { id: 'missing-number', title: 'Missing Number', difficulty: 'Easy', group: 'Math / Bit Manipulation', summary: '用總和或 XOR 找出 0..n 中缺少的數。', tags: ['Array', 'Math', 'Bit Manipulation'], pattern: 'array', focus: '期望集合與實際集合差異', operation: 'expectedSum - actualSum 或 XOR 抵消' },
  { id: 'reverse-bits', title: 'Reverse Bits', difficulty: 'Easy', group: 'Bit Manipulation', summary: '逐位取出 n 的最低位，放到答案的相反位置。', tags: ['Bit Manipulation'], pattern: 'array', focus: '位元搬移', operation: 'ans 左移並加上 n & 1，n 右移' },
  { id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', group: 'Dynamic Programming', summary: '第 n 階可由 n-1 與 n-2 階到達。', tags: ['DP', 'Beginner'], pattern: 'array', focus: 'Fibonacci 型狀態', operation: 'dp[i] = dp[i-1] + dp[i-2]' },
  { id: 'coin-change', title: 'Coin Change', difficulty: 'Medium', group: 'Dynamic Programming', summary: '對每個金額嘗試所有硬幣，取最少硬幣數。', tags: ['DP'], pattern: 'array', focus: '金額 dp 表', operation: 'dp[a] = min(dp[a], dp[a-coin] + 1)' },
  { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Medium', group: 'Dynamic Programming', summary: '維護 tails，讓每個長度的結尾盡量小。', tags: ['DP', 'Binary Search'], pattern: 'array', focus: 'tails 陣列', operation: '用二分找到 nums[i] 應替換的 tails 位置' },
  { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', group: 'Dynamic Programming', summary: '二維 DP 比較兩字串前綴的最長共同子序列。', tags: ['DP', 'String'], pattern: 'array', focus: 'dp[i][j] 前綴答案', operation: '字元相等取左上 + 1，否則取上/左最大' },
  { id: 'word-break', title: 'Word Break', difficulty: 'Medium', group: 'Dynamic Programming', summary: 'dp[i] 表示 s[0..i) 是否可由字典切出。', tags: ['DP', 'String', 'Hash Set'], pattern: 'array', focus: '可切分前綴', operation: '枚舉切點 j，檢查 dp[j] 與 s[j:i]' },
  { id: 'combination-sum-iv', title: 'Combination Sum IV', difficulty: 'Medium', group: 'Dynamic Programming', summary: '排列數 DP：每個 target 由 target - num 累加而來。', tags: ['DP'], pattern: 'array', focus: '順序敏感的組合數', operation: 'dp[t] += dp[t - num]' },
  { id: 'house-robber', title: 'House Robber', difficulty: 'Medium', group: 'Dynamic Programming', summary: '每間房決定偷或不偷，不能連續偷。', tags: ['DP'], pattern: 'array', focus: 'take / skip', operation: 'best = max(prev1, prev2 + nums[i])' },
  { id: 'house-robber-ii', title: 'House Robber II', difficulty: 'Medium', group: 'Dynamic Programming', summary: '環狀房屋拆成不偷第一間或不偷最後一間兩個線性問題。', tags: ['DP'], pattern: 'array', focus: '環拆線', operation: 'max(rob(0..n-2), rob(1..n-1))' },
  { id: 'decode-ways', title: 'Decode Ways', difficulty: 'Medium', group: 'Dynamic Programming', summary: '每個位置看一位與兩位能否形成有效字母。', tags: ['DP', 'String'], pattern: 'array', focus: '字串前綴解碼數', operation: '有效一位加 dp[i-1]，有效兩位加 dp[i-2]' },
  { id: 'unique-paths', title: 'Unique Paths', difficulty: 'Medium', group: 'Dynamic Programming', summary: '每格路徑數來自上方與左方。', tags: ['DP', 'Matrix'], pattern: 'array', focus: 'grid dp 表', operation: 'dp[r][c] = dp[r-1][c] + dp[r][c-1]' },
  { id: 'jump-game', title: 'Jump Game', difficulty: 'Medium', group: 'Greedy / DP', summary: '維護目前可到達的最遠位置。', tags: ['Array', 'Greedy', 'DP'], pattern: 'array', focus: 'farthest reach', operation: 'farthest = max(farthest, i + nums[i])，若 i 超過 farthest 則失敗' },
  { id: 'clone-graph', title: 'Clone Graph', difficulty: 'Medium', group: 'Graph / DFS', summary: '用 map 保存原節點到新節點的對應，避免重複複製。', tags: ['Graph', 'DFS', 'Hash Map'], pattern: 'tree', focus: 'visited map 與鄰居複製', operation: '先建立 clone，再遞迴複製 neighbors' },
  { id: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium', group: 'Graph / Topological Sort', summary: '偵測有向圖是否有環；無環才能完成所有課程。', tags: ['Graph', 'Topological Sort', 'DFS'], pattern: 'tree', focus: '入度或 DFS 狀態', operation: 'Kahn 移除入度 0 節點，或 DFS 遇到 visiting 表示有環' },
  { id: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', group: 'Graph / Matrix DFS', summary: '從兩個海洋邊界反向 DFS，找同時可達的格子。', tags: ['Graph', 'DFS', 'Matrix'], pattern: 'array', focus: '兩組可達集合', operation: '由海洋往高處或等高處反向擴散' },
  { id: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium', group: 'Graph / Matrix DFS', summary: '遇到陸地就 DFS/BFS 沉島，島嶼數加一。', tags: ['Graph', 'DFS', 'Matrix'], pattern: 'array', focus: 'visited grid', operation: '從 1 擴散到上下左右並標記 visited' },
  { id: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', difficulty: 'Medium', group: 'Hash Set', summary: '只從序列起點開始往後數，避免重複工作。', tags: ['Array', 'Hash Set'], pattern: 'array', focus: '序列起點 num-1 不存在', operation: '從 start 連續檢查 start+1、start+2...' },
  { id: 'alien-dictionary', title: 'Alien Dictionary', difficulty: 'Hard', group: 'Graph / Topological Sort', summary: '由相鄰單字第一個不同字元建立字母順序圖。', tags: ['Graph', 'Topological Sort', 'Hard'], pattern: 'tree', focus: '字母有向邊與拓撲排序', operation: '建立 edge 後做 topological sort，若有環則無答案' },
  { id: 'graph-valid-tree', title: 'Graph Valid Tree', difficulty: 'Medium', group: 'Graph / Union Find', summary: '樹必須有 n-1 條邊且所有節點連通無環。', tags: ['Graph', 'Union Find'], pattern: 'tree', focus: '連通與無環', operation: 'Union 每條邊，若兩端已連通表示有環' },
  { id: 'number-of-connected-components', title: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium', group: 'Graph / Union Find', summary: '每次 union 成功就讓連通分量數減一。', tags: ['Graph', 'Union Find'], pattern: 'tree', focus: 'component count', operation: 'union(u,v) 若根不同則合併並 count--' },
  { id: 'insert-interval', title: 'Insert Interval', difficulty: 'Medium', group: 'Intervals', summary: '依序加入不重疊區間，遇到重疊就合併 newInterval。', tags: ['Interval', 'Array'], pattern: 'array', focus: 'newInterval 的左右邊界', operation: '先放左側，再合併重疊，最後放右側' },
  { id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', group: 'Intervals', summary: '排序後維護目前合併區間，重疊就延長右界。', tags: ['Interval', 'Sorting'], pattern: 'array', focus: '目前 merged 最後一段', operation: '若 start <= last.end 則 last.end = max(last.end, end)' },
  { id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', difficulty: 'Medium', group: 'Intervals / Greedy', summary: '按結束時間排序，保留最早結束的區間。', tags: ['Interval', 'Greedy'], pattern: 'array', focus: '最早結束時間', operation: '遇到重疊就移除一個，保留 end 較小者' },
  { id: 'meeting-rooms', title: 'Meeting Rooms', difficulty: 'Easy', group: 'Intervals', summary: '排序後檢查相鄰會議是否重疊。', tags: ['Interval', 'Sorting', 'Beginner'], pattern: 'array', focus: '相鄰會議結束與開始', operation: '若 next.start < current.end 則不能參加全部會議' },
  { id: 'meeting-rooms-ii', title: 'Meeting Rooms II', difficulty: 'Medium', group: 'Intervals / Heap', summary: '用最小堆追蹤最早結束的會議室。', tags: ['Interval', 'Heap'], pattern: 'stack', focus: 'min-heap of end times', operation: '若最早 end <= start 可重用，否則新增房間' },
  { id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', group: 'Linked List', summary: '逐步反轉 cur.next，並移動 prev/cur。', tags: ['Linked List', 'Beginner'], pattern: 'linked-list', focus: 'prev / cur / next 三指標', operation: 'next = cur.next; cur.next = prev; prev = cur; cur = next' },
  { id: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy', group: 'Linked List / Fast Slow', summary: '快慢指標若相遇代表有環。', tags: ['Linked List', 'Two Pointers'], pattern: 'linked-list', focus: 'slow 與 fast 指標', operation: 'slow 走一步，fast 走兩步；相遇即有 cycle' },
  { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', group: 'Linked List', summary: '用 dummy 與 tail 指標，把較小節點接到結果鏈表後面。', tags: ['Linked List', 'Two Pointers', 'Beginner'], pattern: 'linked-list', focus: 'tail 與兩條鏈表頭', operation: '比較 l1/l2，tail.next 接較小者，來源指標前進' },
  { id: 'merge-k-sorted-lists', title: 'Merge K Sorted Lists', difficulty: 'Hard', group: 'Linked List / Heap', summary: '用最小堆每次取出目前最小節點接到結果鏈表。', tags: ['Linked List', 'Heap', 'Hard'], pattern: 'linked-list', focus: 'min-heap 與 tail', operation: 'pop 最小節點接到 tail，若有 next 再推入 heap' },
  { id: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End of List', difficulty: 'Medium', group: 'Linked List / Two Pointers', summary: 'fast 先走 n 步，slow 停在待刪節點前一個。', tags: ['Linked List', 'Two Pointers'], pattern: 'linked-list', focus: 'fast 與 slow 間距 n', operation: 'fast 到尾後，slow.next = slow.next.next' },
  { id: 'reorder-list', title: 'Reorder List', difficulty: 'Medium', group: 'Linked List', summary: '找中點、反轉後半、再交錯合併。', tags: ['Linked List', 'Two Pointers'], pattern: 'linked-list', focus: '中點、反轉後半與交錯合併', operation: 'first.next = second; second.next = savedFirstNext' },
  { id: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', difficulty: 'Medium', group: 'Matrix', summary: '用第一列與第一欄作標記，最後統一清零。', tags: ['Matrix', 'Array'], pattern: 'array', focus: 'row/col zero markers', operation: '先標記需要清零的列欄，再第二輪寫 0' },
  { id: 'spiral-matrix', title: 'Spiral Matrix', difficulty: 'Medium', group: 'Matrix', summary: '用 top/bottom/left/right 四個邊界一圈圈收縮。', tags: ['Matrix', 'Array'], pattern: 'array', focus: '四個邊界', operation: '走上邊、右邊、下邊、左邊後收縮邊界' },
  { id: 'rotate-image', title: 'Rotate Image', difficulty: 'Medium', group: 'Matrix', summary: '先轉置矩陣，再反轉每一列完成順時針旋轉。', tags: ['Matrix', 'Array'], pattern: 'array', focus: '座標交換', operation: 'swap(matrix[r][c], matrix[c][r]) 後 reverse row' },
  { id: 'word-search', title: 'Word Search', difficulty: 'Medium', group: 'Matrix / Backtracking', summary: '從每格開始 DFS，走過的格子暫時標記避免重複使用。', tags: ['Matrix', 'Backtracking', 'DFS'], pattern: 'array', focus: '路徑與 visited', operation: '匹配目前字元後往四方向遞迴，返回時復原' },
  { id: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', group: 'String / Sliding Window', summary: '維護無重複字元窗口，重複時移動 left。', tags: ['String', 'Sliding Window'], pattern: 'array', focus: '無重複窗口', operation: '右端加入字元，若重複則左端移到上次出現後' },
  { id: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', group: 'String / Sliding Window', summary: '窗口長度減去最高頻字元數即需要替換次數。', tags: ['String', 'Sliding Window'], pattern: 'array', focus: 'maxFreq 與窗口大小', operation: '若 windowLen - maxFreq > k，縮小 left' },
  { id: 'minimum-window-substring', title: 'Minimum Window Substring', difficulty: 'Hard', group: 'String / Sliding Window', summary: '擴張右端直到覆蓋需求，再收縮左端找最短。', tags: ['String', 'Sliding Window', 'Hard'], pattern: 'array', focus: 'need/window 計數與 valid', operation: 'valid 滿足後更新答案並嘗試收縮 left' },
  { id: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy', group: 'String / Hash Map', summary: '比較兩字串字元計數是否完全相同。', tags: ['String', 'Hash Map', 'Beginner'], pattern: 'array', focus: '字元頻率表', operation: 's 中加一，t 中減一，最後檢查全為 0' },
  { id: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium', group: 'String / Hash Map', summary: '把排序後字串或 26 維計數當作分組 key。', tags: ['String', 'Hash Map'], pattern: 'array', focus: 'anagram signature', operation: '計算 key 後放入 map[key] 群組' },
  { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', group: 'Stack', summary: '左括號入 stack；右括號時檢查 stack top 是否是對應左括號。', tags: ['Stack', 'String', 'Beginner'], pattern: 'stack', focus: 'stack top 與括號配對', operation: '右括號時 pop 並比對需要的左括號' },
  { id: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', group: 'String / Two Pointers', summary: '左右指標跳過非英數字元後比較。', tags: ['String', 'Two Pointers', 'Beginner'], pattern: 'array', focus: 'left/right 字元比較', operation: '忽略非英數後，若小寫字元不同則 false' },
  { id: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', difficulty: 'Medium', group: 'String / Expand Center', summary: '枚舉每個中心向左右擴張，更新最長回文。', tags: ['String', 'DP'], pattern: 'array', focus: '中心擴張', operation: '從 odd/even center 擴張直到兩側不同' },
  { id: 'palindromic-substrings', title: 'Palindromic Substrings', difficulty: 'Medium', group: 'String / Expand Center', summary: '每個中心擴張時，每成功一次就是一個回文子字串。', tags: ['String', 'DP'], pattern: 'array', focus: '回文中心數量', operation: '左右字元相同就 count++ 並繼續擴張' },
  { id: 'encode-and-decode-strings', title: 'Encode and Decode Strings', difficulty: 'Medium', group: 'String / Design', summary: '用長度前綴避免分隔符衝突。', tags: ['String', 'Design'], pattern: 'array', focus: 'length-prefixed encoding', operation: 'encode 為 length#word；decode 先讀長度再切字串' },
  { id: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', group: 'Tree / DFS', summary: '每個節點深度等於左右子樹最大深度加一。', tags: ['Tree', 'DFS', 'Beginner'], pattern: 'tree', focus: '左右子樹高度', operation: 'return 1 + max(depth(left), depth(right))' },
  { id: 'same-tree', title: 'Same Tree', difficulty: 'Easy', group: 'Tree / DFS', summary: '兩棵樹同時遞迴，比較節點值與左右子樹。', tags: ['Tree', 'DFS', 'Beginner'], pattern: 'tree', focus: '兩個 current node 同步比較', operation: '值相同且 left/right 都 same 才回傳 true' },
  { id: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy', group: 'Tree / DFS', summary: '對每個節點交換 left 與 right，再遞迴處理左右子樹。', tags: ['Tree', 'DFS', 'Recursion', 'Beginner'], pattern: 'tree', focus: '左右孩子指標交換', operation: 'swap(node.left, node.right) 後遞迴處理子樹' },
  { id: 'binary-tree-maximum-path-sum', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', group: 'Tree / DFS', summary: '每個節點計算向上可延伸最大貢獻，同時更新穿過該點的答案。', tags: ['Tree', 'DFS', 'Hard'], pattern: 'tree', focus: 'gain 與 global max', operation: 'maxPath = node.val + max(0,left) + max(0,right)' },
  { id: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', group: 'Tree / BFS', summary: '用 queue 一層一層取出節點。', tags: ['Tree', 'BFS'], pattern: 'tree', focus: 'queue 與 level size', operation: '每輪固定處理目前 queue 長度的節點' },
  { id: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', group: 'Tree / Design', summary: '用前序加 null 標記保存完整結構，再按順序重建。', tags: ['Tree', 'DFS', 'Design', 'Hard'], pattern: 'tree', focus: 'null marker 與讀取指標', operation: 'serialize 寫值/null；deserialize 依序讀 token 重建左右' },
  { id: 'subtree-of-another-tree', title: 'Subtree of Another Tree', difficulty: 'Easy', group: 'Tree / DFS', summary: '在主樹每個節點嘗試 Same Tree 比較。', tags: ['Tree', 'DFS'], pattern: 'tree', focus: '候選根節點', operation: 'sameTree(root, subRoot) 或往左右子樹繼續找' },
  { id: 'construct-binary-tree-from-preorder-and-inorder-traversal', title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', group: 'Tree / Recursion', summary: 'preorder 第一個是 root，inorder root 左右分割子樹。', tags: ['Tree', 'DFS', 'Array'], pattern: 'tree', focus: 'preIndex 與 inorder 分割點', operation: '取 preorder[preIndex] 建 root，再遞迴左右範圍' },
  { id: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', difficulty: 'Medium', group: 'Tree / DFS', summary: '遞迴時帶上下界，確認每個節點落在合法範圍。', tags: ['Tree', 'DFS', 'BST'], pattern: 'tree', focus: 'low/high 邊界', operation: 'left 上界變 node.val，right 下界變 node.val' },
  { id: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', group: 'Tree / BST', summary: 'BST 中序走訪會得到遞增序列，第 k 個即答案。', tags: ['Tree', 'BST', 'DFS'], pattern: 'tree', focus: 'inorder count', operation: '中序訪問時 count--，到 0 回傳目前節點' },
  { id: 'lowest-common-ancestor-of-a-bst', title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium', group: 'Tree / BST', summary: '利用 BST 大小關係，同時小往左，同時大往右，分岔即 LCA。', tags: ['Tree', 'BST'], pattern: 'tree', focus: 'p/q 與 current 的大小關係', operation: 'p,q 都小於 current 往左；都大於往右；否則 current 是答案' },
  { id: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', group: 'Trie', summary: '每個節點保存 children 與 isWord，逐字元插入/查找。', tags: ['Trie', 'Design', 'Tree'], pattern: 'tree', focus: 'children map 與 isWord', operation: '沿字元路徑建立或移動節點，最後標記 isWord' },
  { id: 'add-and-search-word', title: 'Add and Search Word', difficulty: 'Medium', group: 'Trie / DFS', summary: 'Trie 查詢時遇到 . 就枚舉所有 child 繼續 DFS。', tags: ['Trie', 'DFS', 'Design'], pattern: 'tree', focus: '萬用字元分支', operation: '普通字元走固定 child，點號走所有 children' },
  { id: 'word-search-ii', title: 'Word Search II', difficulty: 'Hard', group: 'Trie / Backtracking', summary: '把 words 建成 Trie，再在 board 上 DFS 剪枝找字。', tags: ['Trie', 'Backtracking', 'Matrix', 'Hard'], pattern: 'tree', focus: 'Trie prefix 剪枝與 board path', operation: '格子字元若不在 trie child 立即停止，命中 word 加入答案' },
  { id: 'top-k-frequent-elements', title: 'Top K Frequent Elements', difficulty: 'Medium', group: 'Heap / Bucket', summary: '先計數，再用 heap 或 bucket 找出前 k 高頻元素。', tags: ['Heap', 'Hash Map', 'Array'], pattern: 'stack', focus: 'frequency map 與候選集合', operation: '維護大小為 k 的 min-heap，或依頻率 bucket 倒序收集' },
  { id: 'find-median-from-data-stream', title: 'Find Median from Data Stream', difficulty: 'Hard', group: 'Heap / Design', summary: '用最大堆保存較小半、最小堆保存較大半，保持平衡。', tags: ['Heap', 'Design', 'Hard'], pattern: 'stack', focus: '兩個 heap 的大小與頂端', operation: '插入後重新平衡；中位數由 heap top 得到' }
]

export const tutorials: Tutorial[] = rawTutorials.map(make)
export const blind75Count = tutorials.length
