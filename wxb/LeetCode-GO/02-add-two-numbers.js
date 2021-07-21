// LeetCode-02

/**
 * 给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。
 * 请你将两个数相加，并以相同形式返回一个表示和的链表。
 * 你可以假设除了数字 0 之外，这两个数都不会以 0 开头。
 *
 * 示例 1：
 * 输入：l1 = [2,4,3], l2 = [5,6,4]
 * 输出：[7,0,8]
 * 解释：342 + 465 = 807.
 *
 * 示例 2：
 * 输入：l1 = [0], l2 = [0]
 * 输出：[0]
 *
 * 示例 3：
 * 输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
 * 输出：[8,9,9,9,0,0,0,1]
 */


/*方法一：模拟
思路与算法
这种链表相加的题目是非常简单的，只需要将解题的表达式写出来便一目了然，以本题的例题为例：(2->4->3)+(5->6->4) = (7->0->8)，根据加法的计算过程我们知道首先从低位开始算起，也就是说应该先计算2+5=7，所以思路来了：

首先取出“+”左右两边两个数的最低位，也就是

let val1 = l1.val
let val2 = l2.val

其次求出他们的和并作为输出结果的最低位（由于输出的结果是链表的形式保存，所以我们应该写成这种形式）

let sum = new ListNode('0')
sum.next = new ListNode(“结果” % 10)//之所以要“结果” % 10是因为我们的计算结果是有可能大于10的，所以需要取余
所以初步的代码如下：

var addTwoNumbers = function(l1, l2) {
    let sum = new ListNode('0') // 创建一个头链表用于保存结果
    let head = sum // 保存头链表的位置用于最后的链表返回
    while (l1 || l2) {//在两个链表之中有一个存在的前提下执行下面的逻辑
        let val1 = l1.val
        let val2 = l2.val
        let r1 = val1 + val2//求和
        sum.next = new ListNode(r1 % 10)//sum的下一个节点
        sum = sum.next //sum指向下一个节点
       if (l1) l1 = l1.next //l1指向下一个节点，以便计算第二个节点的值
        if(l2) l2 = l2.next //l2指向下一个节点，以便计算第二个节点的值
    }
    return head.next //返回计算结果，之所以用head.next是因为head中保存的第一个节点是刚开始定义的“0”
};

下面便是开始进行优化了，作为一名大学生我们应该知道的第一点是加法运算是有进位的，所以考虑将进位加入代码中

    let addOne = 0 //进位
    let sum = new ListNode('0')
    let head = sum
    while (addOne || l1 || l2) {//在进位或者两个链表之中有一个存在的前提下执行下面的逻辑
        let val1 = l1.val
        let val2 = l2.val
        let r1 = val1 + val2 + addOne//求和
        addOne = r1 >= 10 ? 1 : 0 // 如果求和结果>=10，那么进位为1，否则为0
        sum.next = new ListNode(r1 % 10)
        sum = sum.next
       if (l1) l1 = l1.next
        if(l2) l2 = l2.next
    }
    return head.next
};
能写出以上代码已经接近成功了，但是离成功还差个那么一步，当我们提交的时候并不能通过所有的案例，不能通过的一个案例为：[9999]与[99]相加，这是因为l1与l2相加的过程中，当指针指向第三个9的时候l1的9是存在的而l2的9是不存在的，也就是为null，所以无法相加会进行报错，所以我们需要进行一步优化,如果值不存在时，将其设置为0，然后再进行相加即可，完成代码如下：
这个解法是最直接的最通用的，以后无论多少个数相加都可以采用这种思路，我认为学习算法，做的多了，慢慢的就会举一反三了
*/

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */

var addTwoNumbers = function(l1, l2) {
  let addOne = 0
  let sum = new ListNode('0')
  let head = sum

  while (addOne || l1 || l2) {
    let val1 = l1 !== null ? l1.val : 0 // 优化点
    let val2 = l2 !== null ? l2.val : 0 //优化点
    let r1 = val1 + val2 + addOne
    addOne = r1 >= 10 ? 1 : 0
    sum.next = new ListNode(r1 % 10)
    sum = sum.next
    if (l1) l1 = l1.next
    if (l2) l2 = l2.next
  }
  return head.next
}
