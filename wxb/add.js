const addRemote = async (a, b) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(a + b), 1)
  })

// 请实现本地的add方法，调用addRemote，能最优的实现输入数字的加法。
const add = (...args) => {
  if (args.length <= 1) return Promise.resolve(args[0])
  const promiseList = []

  for (let i = 0; i * 2 < args.length - 1; i++) {
    console.log(i)

    console.log(args[i * 2])

    console.log(args[i * 2 + 1])

    const promise = addRemote(args[i * 2], args[i * 2 + 1])

    promise.then((item) => {
      console.log(item)
    })

    promiseList.push(promise)
  }
  console.log(args.length)

  if (args.length % 2) {
    console.log(args.length)
    console.log(args[args.length - 1])
    const promise = Promise.resolve(args[args.length - 1])
    promiseList.push(promise)
  }

  return Promise.all(promiseList).then((results) => add(...results))
}

// 请用示例验证运行结果:
add(1, 2, 4, 5, 6).then((result) => {
  console.log(result) // 3
})
