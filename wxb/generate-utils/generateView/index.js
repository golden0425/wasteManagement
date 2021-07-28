// index.js`
//导入公用方法
const {
  dotExistDirectoryCreate,
  generateFile,
  fs,
  log,
  resolvePath,
  successLog,
  errorLog,
  resolveComponentName
} = require('../common.js')
const { viewRouterTemplate, routerTemplate } = require('./template')
const { commonTemplate, entryTemplate } = require('../commonTemplate')
// 如A,B  多个单词使用|隔开  如shopping|cart`
log(
  '请输入要生成的页面名称、会生成在 pages/目录下,页面之间使用,隔开'
)
let componentNameStr = ''
process.stdin.on('data', async chunk => {
  // 获取到输入的值
  const inputName = String(chunk)
    .trim()
    .toString()

  if (inputName.includes('/')) {
    const inputArr = inputName.split('/')
    componentNameStr = inputArr[inputArr.length - 1]
  } else {
    componentNameStr = inputName
  }

  let viewNameList = resolveComponentName(componentNameStr)

  if (viewNameList.length <= 0) {
    return
  }
  while (viewNameList.length > 0) {
    viewName = viewNameList.splice(0, 1).join()
    /**
     * 页面目录路径
     */
    const viewDirectory = resolvePath('../src/pages', viewName)
    /**
     * vue页面路径
     */
    const viewVueName = resolvePath(viewDirectory, `${viewName}.vue`)
    /**
     * 入口文件路径
     */
    const entryViewName = resolvePath(viewDirectory, 'index.js')
    /**
     * 样式文件路径
     */
    const styleViewName = resolvePath(viewDirectory, 'index.less')

    // 查找是否存在目录文件
    const hasViewDirectory = fs.existsSync(viewDirectory)

    if (hasViewDirectory) {
      errorLog(`${viewName}页面目录已存在，请重新输入`)
      return
    } else {
      log(`正在生成 vue 目录 ${viewDirectory}`)
      await dotExistDirectoryCreate(viewDirectory)
    }
    try {
      log(`正在生成 vue 文件 ${viewVueName}`)
      await generateFile(viewVueName, commonTemplate(viewName))
      log(`正在生成 entry 文件 ${entryViewName}`)
      await generateFile(entryViewName, entryTemplate(viewName))
      log(`正在生成 style 文件 index.less`)
      await generateFile(styleViewName, `//${viewName}.less`)
      log(`正在注册路由文件 ${viewName}`)
      await addRouter(viewName)
      successLog('页面生成成功')
    } catch (e) {
      errorLog(e.message)
    }
  }
  process.stdin.emit('end')
})

process.stdin.on('end', () => {
  // 退出
  log('exit')
  process.exit()
})

function addRouter(fileName) {
  const file = resolvePath('../src/router', 'index.js')
  let reg = /(routes\s*:\s*\[)((.|\s)*?)\]/
  let routerListItem
  return new Promise((resolve, reject) => {
    if (fs.existsSync(file)) {
      fs.readFile(file, 'utf-8', (err, data) => {
        if (err) {
          errorLog(err.message)
          reject()
        } else {
          let dataStr = data.toString()
          if (!dataStr) {
            emptyIndexAdd(file, fileName).then(() => {
              resolve()
            })
          } else {
            let routerList = dataStr.match(reg)
            if (routerList && routerList.input) {
              routerListItem =
                routerList[1] +
                routerList[2] +
                (routerList[2].trim() ? ',' : '') +
                viewRouterTemplate(fileName) +
                ']'
              dataStr = dataStr.replace(reg, routerListItem)
              writeDataToFile(file, dataStr).then(() => {
                resolve()
              })
            } else {
              errorLog('router/index.js页面结构不正确,本次注册路由失败!')
              reject()
            }
          }
        }
      })
    } else {
      emptyIndexAdd(file, fileName).then(() => {
        resolve()
      })
    }
  })

  function emptyIndexAdd(file, fileName) {
    let importStr = routerTemplate(fileName)
    return writeDataToFile(file, importStr)
  }

  function writeDataToFile(file, data) {
    return new Promise((resolve, reject) => {
      let routerFile = resolvePath('../src/router')
      if (!fs.existsSync(routerFile)) {
        fs.mkdir(routerFile, {}, err => {
          if (err) {
            console.log(err)
            return
          }
        })
      }
      fs.writeFile(
        file,
        data,
        {
          flag: 'w'
        },
        err => {
          if (err) {
            errorLog(err.message)
            reject(err.message)
          }
          successLog('路由注册成功!')
          resolve()
        }
      )
    })
  }
}
