/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
var getIntersectionNode = function (headA, headB) {
  let lastHeadA = null
  let lastHeadB = null
  let originHeadA = headA
  let originHeadB = headB
  if (!headA || !headB) {
    return null
  }
  while (true) {
    if (headB == headA) {
      return headB
    }
    if (headA && headA.next == null) {
      lastHeadA = headA
      headA = originHeadB
    } else {
      headA = headA.next
    }
    if (headB && headB.next == null) {
      lastHeadB = headB
      headB = originHeadA
    } else {
      headB = headB.next
    }
    if (lastHeadA && lastHeadB && lastHeadA != lastHeadB) {
      return null
    }
  }
  return null
}
