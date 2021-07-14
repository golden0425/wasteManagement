> 如果是 vscode 编辑器，可以安装 Markdown Shortcuts 插件，vscode 打开此页后，用 Ctrl + Shift + V 启用阅览。

## React18-Alpha新特性

### 目录

1.  [什么是批处理](#1)


### 正文

#### <span id="1">一、什么是批处理</span>

- 批处理（Batching）是指 React 将多个状态更新合并到单个重新渲染中以获得更好的性能。
- 优化 setState 同异步问题. React在合成事件 [^1]和钩子函数中是异步执行(这里应该称为**批处理**)

  在 React 18 之前，我们只在 React 事件处理 handler 中批量更新。默认情况下，在 React 中，Promise、setTimeout、本地事件 handler 或任何其他事件中的更新是不会批处理的。

  在 React 18 的 createRoot [^2] 开始，所有的更新都会被自动，无论它们来自哪里。
  这意味着超时、Promise、本地事件 handler 或任何其他事件中的更新，将以与 React 事件中的更新相同的方式进行批处理。我们希望这将导致更少的渲染工作，从而提高应用程序的性能：

- 如果我不想要批处理怎么办？

  >通常情况下批处理是安全的，但有些代码可能依赖于在状态改变后立即从 DOM 中读取一些东西。对于这些用例，你可以使用 ReactDOM.flushSync() [^3] 来选择不进行批处理。


  > 合成事件: React 模拟原生 DOM 事件所有能力的一个事件对象，即浏览器原生事件的跨浏览器包装器

  > ```ReactDOM.createRoot(rootElement).render(<App />);```

  > ```flushSync(() => {setCounter(c => c + 1);});```
