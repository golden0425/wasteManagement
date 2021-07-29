let originArr = [
  1, 2, 5, 6, 8, 3, 15, 7, 45, 10, 34, 35, 16, 17, 18, 88, 99, 123,
]

let classify = (originArr) => {
  let map = new Map()
  for (let i = 0; i < originArr.length; i++) {
    const curr = originArr[i]
    if (map.has(curr - 1)) {
      let arr = map.get(curr - 1)
      map.delete(curr - 1)
      arr.push(curr)
      map.set(curr, arr)
      if (map.has(curr + 1)) {
        let arr = map.get(curr)
        map.delete(curr + 1)
        arr.push(curr + 1)
        map.set(curr, arr)
      }
    } else {
      map.set(curr, [curr])
    }
  }
  console.log([...map.values()])
}

classify(originArr)

// let sortArr = originArr.sort((a, b) => a - b)
// let classify = (sortArr) => {
//   let noContinuousArr = []
//   let continuousArr = []
//   let i = 0
//   let total = 0

//   while (sortArr.length) {
//     let curr = sortArr[i]
//     let next = sortArr[i + 1]
//     i++
//     if (curr + 1 === next) {
//       total++
//     } else {
//       if (total > 0) {
//         continuousArr.push(sortArr.splice(0, total + 1))
//         total = 0
//       } else {
//         sortArr.splice(0, 1)
//         noContinuousArr.push(curr)
//       }
//       i = 0
//     }
//   }
//   console.log(continuousArr)
//   console.log(noContinuousArr)
// }
// classify(sortArr)

// for (i; i < len; i++) {
//   let curr = sortArr[i]
//   let next = sortArr[i + 1]
//   // let last = sortArr[i - 1]
//   if (curr + 1 === next) {
//     total++
//   } else {
//     if (total > 0) {
//       continuousArr.push(sortArr.splice(0, total + 1))
//       console.log(sortArr)
//     } else {
//       noContinuousArr.push(sortArr.splice(0, 1))
//     }
//     total = 0
//   }

// let curr = sortArr[i]
// let next = sortArr[i + 1]
// let last = sortArr[i - 1]
// if (curr + 1 === next) {
//   arr.add(curr)
//   arr.add(next)
// } else {
//   if (Array.from(arr).length > 0) {
//     continuousArr.push(Array.from(arr))
//   }
//   arr.clear()
//   if (last + 1 !== curr) {
//     noContinuousArr.push(curr)
//   }
// }
// }
