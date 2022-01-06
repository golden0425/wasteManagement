/**
 * 给你一个链表，每 k 个节点一组进行翻转，请你返回翻转后的链表。

  k 是一个正整数，它的值小于或等于链表的长度。

  如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。

 */


/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var reverseKGroup = function(head, k) {
    let a = head, b = head;
    for (let i = 0; i < k; i++) {
        if (b == null) return head;
        b = b.next;
    }
    const newHead = reverse(a, b);
    a.next = reverseKGroup(b, k);
    return newHead;
};
function reverse(a, b) {
    let prev = null, cur = a, nxt = a;
    while (cur != b) {
        nxt = cur.next;
        cur.next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

