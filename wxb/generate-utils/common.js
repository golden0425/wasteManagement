const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const resolvePath = (...file) => path.resolve(__dirname, ...file)
const log = message => console.log(chalk.green(`${message}`))
const successLog = message => console.log(chalk.blue(`${message}`))
const errorLog = error => console.log(chalk.red(`${error}`))
const resolveComponentName = componentName => {
  const regex = /^[a-z0-9A-Z,|]+$/
  if (!regex.test(componentName)) {
    // 如A,B  多个单词使用|隔开  如shopping|cart
    errorLog(`格式错误! 页面(组件)之间使用,隔开`)
    return ''
  }
  try {
    let componentNameStr
    let componentNameList = []
    if (componentName.includes(',')) {
      componentNameStr = componentName.split(',')
    } else {
      componentNameStr = componentName
    }
    if (Array.isArray(componentNameStr)) {
      componentNameList = componentNameStr.map(el => {
        return (el.substring(0, 1).toUpperCase() + el.substring(1)).replace(
          /\|/g,
          ''
        )
      })
    } else {
      componentNameList.push(
        (
          componentNameStr.substring(0, 1).toUpperCase() +
          componentNameStr.substring(1)
        ).replace(/\|/g, '')
      )
    }
    return componentNameList
  } catch (error) {
    errorLog(error)
    return ''
  }
}

// 递归创建目录
const mkdirs = (directory, callback) => {
  var exists = fs.existsSync(directory)
  if (exists) {
    callback()
  } else {
    mkdirs(path.dirname(directory), function() {
      fs.mkdirSync(directory)
      callback()
    })
  }
}

module.exports = {
  dotExistDirectoryCreate: directory => {
    return new Promise(resolve => {
      mkdirs(directory, function() {
        resolve(true)
      })
    })
  },
  generateFile: (path, data) => {
    if (fs.existsSync(path)) {
      errorLog(`${path}文件已存在`)
      return
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, 'utf8', err => {
        if (err) {
          errorLog(err.message)
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  path: path,
  chalk: chalk,
  fs: fs,
  log: log,
  successLog: successLog,
  errorLog: errorLog,
  resolvePath: resolvePath,
  resolveComponentName: resolveComponentName
}
