/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (head == null || head.next == null) return false
  let slower = head,
    faster = head
  while (faster != null && faster.next != null) {
    slower = slower.next
    faster = faster.next.next
    if (slower === faster) return true
  }
  return false
}
