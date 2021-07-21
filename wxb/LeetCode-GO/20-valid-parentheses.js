/**
  给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。

  有效字符串需满足：
    左括号必须用相同类型的右括号闭合。
    左括号必须以正确的顺序闭合。
*/

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  s = s.split('')
  let i = 0,
    len = s.length,
    res = []
  // 判断长度是否是基数
  if (len % 2 !== 0) return false

  let map = new Map()
  map.set('(', ')')
  map.set('[', ']')
  map.set('{', '}')

  for (i; i < len; i++) {
    let item = s[i]
    if (map.get(item)) {
      res.push(item)
    } else {
      if (map.get(res.pop()) !== item) {
        return false
      }
    }
  }
  // 最后需要判断一下栈内的数据
  if (res.length > 0) {
    return false
  } else {
    return true
  }
}
