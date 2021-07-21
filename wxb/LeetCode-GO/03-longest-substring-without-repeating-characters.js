// LeetCode-03

/**
 * 给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。
 *
 * 示例 1:
 * 输入: s = "abcabcbb"
 * 输出: 3
 * 解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
 *
 * 示例 2:
 * 输入: s = "bbbbb"
 * 输出: 1
 * 解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
 *
 * 示例 3:
 * 输入: s = "pwwkew"
 * 输出: 3
 * 解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
 *      请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
 */

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  // return (
  //   (a = []) &&
  //   s
  //     .split('')
  //     .reduce(
  //       (len, v, i) =>
  //         ((i = a.indexOf(v)) > -1 && (a = a.slice(++i)) && 0 > 1) ||
  //         (a.push(v) && Math.max(len, a.length)),
  //       0
  //     )
  // )
  let i = 0, //查找初始值
    res = 0, //返回的结果
    n = 0 // 重复值所在位置
  for (let j = 0; j < s.length; j++) {
    //  1.获取查找范围内是否有相同的值
    n = s.slice(i, j).indexOf(s[j])
    if (n == -1) {
      // 不存在则比对 res 和 当前方位最大长度的值的大小
      res = Math.max(res, j + 1 - i) // 长度减去 查找范围初始值 等于结果
    } else {
      // 存在就把查找初始值移动到重复值的后一位
      i += n + 1
    }
  }
  return res
}
