## Vue 工具脚本( 自动生成 )

出 bug 联系我哈   哈哈哈哈哈哈哈哈哈哈~~~~~~~~~~~~~~

### 目录

1.  [说明](#1)
2.  [自动生成 Vue-Component 组件并且挂全局](#2) ( 完成 )
3.  [自动生成 Vue 页面并且注册路由](#3) ( 完成 )

### 自动生成 Vue-Component 组件并且挂全局

- 使用方法
  1.在 package.json 文件 scripts 下写入脚本执行方法( 方法名可以自己定 )

    使用 node 执行 脚本存放的地址
    ```
    "scripts": {
      "create": "node ./scripts/generate${TYPE}/index"
    },
    ```

    通过 传入 TYPE 属性决定生成对应页面
    比如:生成 Component
    TYPE="Component" yarn create 或  TYPE="Component" npm run create

  2.请输入要生成的组件名称、会生成在 components/目录下,如需生成全局组件，请加 g/ 前缀,  组件之间使用,隔开  (如A,B  多个单词使用|隔开  如shopping|cart` 后续修复 )


  3.大小写问题抽空解决

