
// 给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 。

// 题解 1
// 利用链表的后续遍历，使用函数调用栈作为后序遍历栈，来判断是否回文

/**
 *
 */
var isPalindrome = function (head) {
  let left = head
  function traverse(right) {
    if (right == null) return true
    let res = traverse(right.next)
    res = res && right.val === left.val
    left = left.next
    return res
  }
  return traverse(head)
}


// 题解 2
// 通过 快、慢指针找链表中点，然后反转链表，比较两个链表两侧是否相等，来判断是否是回文链表


/**
  *
  */
var isPalindrome = function(head) {
    // 反转 slower 链表
    let right = reverse(findCenter(head));
    let left = head;
    // 开始比较
    while (right != null) {
        if (left.val !== right.val) {
            return false;
        }
        left = left.next;
        right = right.next;
    }
    return true;
}
function findCenter(head) {
    let slower = head, faster = head;
    while (faster && faster.next != null) {
        slower = slower.next;
        faster = faster.next.next;
    }
    // 如果 faster 不等于 null，说明是奇数个，slower 再移动一格
    if (faster != null) {
        slower = slower.next;
    }
    return slower;
}
function reverse(head) {
    let prev = null, cur = head, nxt = head;
    while (cur != null) {
        nxt = cur.next;
        cur.next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}


