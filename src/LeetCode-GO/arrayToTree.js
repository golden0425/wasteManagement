// 数组生成树形结构
let arr = [
  {
    id: 1,
    pid: 0,
  },
  {
    id: 2,
    pid: 1,
  },
  {
    id: 3,
    pid: 1,
  },
  {
    id: 4,
    pid: 2,
  },
  {
    id: 5,
    pid: 3,
  },
]

const arrayToTree = (arr) => {
  let map = {}
  let result = []
  let i = 0,
    len = arr.length
  for (i; i < len; i++) {
    const item = arr[i]

    if (map[pid]) {
      if (!map[pid].children) {
        map[pid].children = []
      }
      map[pid].children.push(item)
    }
    map[id] = item
    if (pid === 0) {
      // 重点理解 为什么?
      // result 和 map 内部的 item 指向的同一块区域
      result.push(item)
    }
  }
  return result
}
// 递归
const arrayToTree = (list,rootPid) =>{
  return list
    .filter(({ pid }) => pid === rootPid)
    .map((item) => ({
      ...item,
      children: arrayToTree(list, item.id),
    }))
}
