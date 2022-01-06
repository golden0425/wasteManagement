// 给你一个链表数组，每个链表都已经按升序排列。
// 请你将所有链表合并到一个升序链表中，返回合并后的链表。




/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function (lists) {
  if (lists.length === 0) return null
  return mergeArr(lists)
}
function mergeArr(lists) {
  if (lists.length <= 1) return lists[0]
  let index = Math.floor(lists.length / 2)
  const left = mergeArr(lists.slice(0, index))
  const right = mergeArr(lists.slice(index))
  return merge(left, right)
}
function merge(l1, l2) {
  if (l1 == null && l2 == null) return null
  if (l1 != null && l2 == null) return l1
  if (l1 == null && l2 != null) return l2
  let newHead = null,
    head = null
  while (l1 != null && l2 != null) {
    if (l1.val < l2.val) {
      if (!head) {
        newHead = l1
        head = l1
      } else {
        newHead.next = l1
        newHead = newHead.next
      }
      l1 = l1.next
    } else {
      if (!head) {
        newHead = l2
        head = l2
      } else {
        newHead.next = l2
        newHead = newHead.next
      }
      l2 = l2.next
    }
  }
  newHead.next = l1 ? l1 : l2
  return head
}
