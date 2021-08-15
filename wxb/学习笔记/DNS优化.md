### 预加载

#### DNS Prefetch

- DNS Prefetch 就是浏览器提供给我们的一个 API。它是 Resource Hint 的一部分。它可以告诉浏览器：过会我就可能要去 yourwebsite.com 上下载一个资源啦，帮我先解析一下域名吧。这样之后用户点击某个按钮，触发了 yourwebsite.com 域名下的远程请求时，就略去了 DNS 解析的步骤。使用方式很简单：

```
<link rel="dns-prefetch" href="//yourwebsite.com">
```

####  预先建立连接

- 我们知道，建立连接不仅需要 DNS 查询，还需要进行 TCP 协议握手，有些还会有 TLS/SSL 协议，这些都会导致连接的耗时。使用 Preconnect 可以帮助你告诉浏览器：“我有一些资源会用到某个源（origin），你可以帮我预先建立连接。”

```
<link rel="preconnect" href="//sample.com">
当然，你也可以设置 CORS：
<link rel="preconnect" href="//sample.com" crossorigin>
```

#### Prefetch

- 你可以把 Prefetch 理解为资源预获取。一般来说，可以用 Prefetch 来指定在紧接着之后的操作或浏览中需要使用到的资源，让浏览器提前获取。由于仅仅是提前获取资源，因此浏览器不会对资源进行预处理，并且像 CSS 样式表、JavaScript 脚本这样的资源是不会自动执行并应用于当前文档的。其中 as 属性用于指定资源的类型，与 Preload 规范一致

```
<link rel="prefetch" href="/prefetch.js" as="script">
```

#### Prerender

- Prerender 比 Prefetch 更进一步，可以粗略地理解不仅会预获取，还会预执行。

```
<link rel="prerender" href="//sample.com/nextpage.html">
```

#### Preload

- 在遇到需要 Preload 的资源时，浏览器会 **立刻** 进行预获取，并将结果放在内存中，资源的获取不会影响页面 parse 与 load 事件的触发。直到再次遇到该资源的使用标签时，才会执行。

```
<link rel="preload" href="./nextpage.js" as="script">
```

------------------

- 与 Prefetch 相比，Preload 会强制浏览器立即获取资源，并且该请求具有较高的优先级（mandatory and high-priority），因此建议对一些当前页面会马上用到资源使用 Preload；相对的，Prefetch 的资源获取则是可选与较低优先级的，其是否获取完全取决于浏览器的决定，适用于预获取将来可能会用到的资源。
