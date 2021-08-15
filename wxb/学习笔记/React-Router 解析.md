

## React-Router 解析

### React-Router 的简介

React-Router 是一个基于 `Route`组件和由统一作者开发的 `History` 库来建立.

提供了路由的核心api。如Router、Route、Switch等，但没有提供有关dom操作进行路由跳转的api；



---------



### React-Router-dom 的简介

`react-router-dom`在`react-router`的基础上扩展了可操作`dom`的`api`。

提供了`BrowserRouter`、`Route`、`Link`等api，可以通过dom操作触发事件控制路由。

`Link`组件，会渲染一个a标签；`BrowserRouter`和`HashRouter`组件，前者使用`pushState`和`popState`事件构建路由，后者使用`hash`和 `hashchange`事件构建路由。

`Swtich` 和 `Route` 都是从`react-router`中导入了相应的组件并重新导出，没做什么特殊处理。

`react-router-dom`中`package.json`依赖中存在对`react-router`的依赖，故此，不需要`npm`安装`react-router`。

- 可直接 npm 安装 react-router-dom，使用其api。

### 常用 API

```javascript
import { Switch, Route, Router } from 'react-router';

import { Swtich, Route, BrowserRouter, HashHistory, Link } from 'react-router-dom';
```



--------------



### 源码解析

#### HashHistory

```javascript
// 原理其实就是在 Router 上又封装了一层 只是个中间商
// 分别为 history 和 react-router。

import { Router } from "react-router";
import { createHashHistory as createHistory } from "history";

class HashRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
```



#### react-router

````javascript
// 整体实现相当于就是 创建一个 Context 提供数据
// 子组件作为消费者去使用
// 这两个东西其实很简单，都是引用了一个叫做createContext，目的也很简单，这里其实就是创建的普通context，只	 不过拥有特定的名称而已。源码放在下面
import HistoryContext from "./HistoryContext.js";
import RouterContext from "./RouterContext.js";
/*
  import createContext from "mini-create-react-context";

  const createNamedContext = name => {
    const context = createContext();
    context.displayName = name;
    return context;
  };

  export default createNamedContext;
*/

class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };
    /*
      因为子组件会比父组件更早渲染完成, 以及<Redirect>的存在, 若是在<Router>的componentDidMount生命周			 期中对history.location进行监听, 则有可能在监听事件注册之前, history.
      location已经由于<Redirect>发生了多次改变, 因此我们需要在<Router>的constructor中就注册监听事件
    */

    // TODO 判断是否挂载
    this._isMounted = false;
    // TODO 组件未加载完毕，但是 location 发生的变化，暂存在 _pendingLocation 字段中
    this._pendingLocation = null;

    if (!props.staticContext) {
      // TODO 进行监听 history.listen 返回的是一个取消监听的方法
      // TODO 实际的实现 hashchange 和 监听 popstate
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
            //TODO 组件加载完毕，将变化的 location 方法 state 中
          this.setState({ location });
        } else {
          // TODO 否则先暂存
          this._pendingLocation = location;
        }
      });
    }
  }

  componentDidMount() {
    // TODO 挂载完毕后进行状态修改
    this._isMounted = true;
    // TODO 判断是否有暂存数据
    if (this._pendingLocation) {
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    // TODO 组件卸载时判断是否有取消监听的方法.并且重置属性
    if (this.unlisten) {
      this.unlisten();
      this._isMounted = false;
      this._pendingLocation = null;
    }
  }

  render() {
    return (
      <RouterContext.Provider
        value={{
          // 根据 HashRouter 还是 BrowserRouter，可判断 history 类型
          history: this.props.history,
           // 这个 location 就是监听 history 变化得到的 location
          location: this.state.location,
          // path url params isExact 四个属性
          match: Router.computeRootMatch(this.state.location.pathname),
          // 只有 StaticRouter 会传 staticContext
          // HashRouter 和 BrowserRouter 都是 null
          staticContext: this.props.staticContext
        }}
      >
        <HistoryContext.Provider
          children={this.props.children || null}
          value={this.props.history}
        />
      </RouterContext.Provider>
    );
  }
}
````



**总结**:Router这个组件主要就是将一些数据进行存储。存到`Context`，之间不乏一些特殊情况的判断，比如子组件渲染比父组件早，以及`Redirect`的情况的处理。在卸载的时候要移除对`history`的监听。

子组件作为消费者，就可以对页面进行修改，跳转，获取这些数值。



------------



#### history

之前一直有不断提到的`history`，我们一起来看看它是谁



#### createHashHistory

我们之前用到的`createHashHistory`，他其实是返回的一个对象，这个对象里面有我们常用的一些方法。

`````javascript
let history: HashHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    createHref,
    push,
    replace,
    go,
    back() {
      go(-1);
    },
    forward() {
      go(1);
    },
    listen(listener) {
      return listeners.push(listener);
    },
    block(blocker) {
      let unblock = blockers.push(blocker);

      if (blockers.length === 1) {
        window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
      }

      return function() {
        unblock();

        // Remove the beforeunload listener so the document may
        // still be salvageable in the pagehide event.
        // See https://html.spec.whatwg.org/#unloading-documents
        if (!blockers.length) {
          window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
        }
      };
    }
  };

  return history;
`````

大部分精髓就是这里。发现有多熟悉的伙伴！ => `push`、`replace`、`go`等等。有些其实都是`window`提供的。

有些直接看代码就可以明白的就不解释了，比如`forward`，`back`。



#### push

`push`的源码，里面附带了一些会用到的函数。

`````javascript
// 就是简单处理一下返回值。
function getNextLocation(to: To, state: State = null): Location {
  return readOnly<Location>({
    ...location,
    ...(typeof to === 'string' ? parsePath(to) : to),
    state,
    key: createKey()
  });
}

// 进行判断
function allowTx(action: Action, location: Location, retry: () => void) {
    return (
      // 长度为0就返回true，长度大于0就调用函数，并传入参数。这个blockers等一下仔细探讨一下
      !blockers.length || (blockers.call({ action, location, retry }), false)
    );
  }


// 顾名思义获取state和url
function getHistoryStateAndUrl(
    nextLocation: Location,
    index: number
  ): [HistoryState, string] {
    return [
      {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: index
      },
      // 看上面 有专门介绍
      createHref(nextLocation)
    ];
  }

// 返回一些关于location的信息 ( HashHistory 和 BrowserHistory 有些许不同 )
function getIndexAndLocation(): [number, Location] {
    let { pathname = '/', search = '', hash = '' } = parsePath(
      window.location.hash.substr(1)
    );
    let state = globalHistory.state || {};
    return [
      state.idx,
      readOnly<Location>({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || 'default'
      })
    ];
  }

// 执行listeners内部的一些函数（也就是跳转），后面也会详细解读
function applyTx(nextAction: Action) {
    action = nextAction;
    [index, location] = getIndexAndLocation();
    listeners.call({ action, location });
  }


function push(to: To, state?: State) {
    // 这里是一个枚举值
    let nextAction = Action.Push;

    let nextLocation = getNextLocation(to, state);
    // 顾名思义，就是再来一次
    function retry() {
      push(to, state);
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);

      // TODO: Support forced reloading
      // try...catch because iOS limits us to 100 pushState calls :/
      try {
        // MDN的地址: https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState
        globalHistory.pushState(historyState, '', url);
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        // MDN的地址: https://developer.mozilla.org/zh-CN/docs/Web/API/Location/assign
        window.location.assign(url);
      }

      applyTx(nextAction);
    }
  }
`````

我在注释里面已经进行非常详细的解读了，用到的每个函数都有解释或者官方权威的url。

总结一下：`history.push`的一个完整流程

- 调用`history.pushState`
- 错误由`window.location.assign`来处理
- 执行一下`listeners`里面的函数

是的，你没有看错，就这么简单，只是里面有很多调用的函数，我都截取出来一一解释，做到每行代码都理解，所以显得比较长，概括来说就是这么简单。

重点来看一下`listen`和被调用的`createBrowserHistory`



#### replace

这里面用的函数，在前面的push都有解析，可以往上面去找找。

````javascript
  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index);
      // TODO: Support forced reloading
      // 调用的方法 从 push 变成了 replaceState
      // MDN的地址: https://developer.mozilla.org/zh-CN/docs/Web/API/History/replaceState
      globalHistory.replaceState(historyState, '', url);
      applyTx(nextAction);
    }
  }
````



#### listen

在`history`返回的`listen`是一个函数。这个函数我们之前在react-router的源码中发现，他是在构造函数和卸载的时候会用到

````javascript
		listen(listener) {
      // 往下看 listenrs 做了什么?
      return listeners.push(listener);
    }

		// 进行了个方法的执行.继续深入看看 createEvents 函数做了什么
		let listeners = createEvents();
````



#### createEvents

````javascript
function createEvents<F extends Function>(): Events<F> {
  //TODO 声明了一个数组 通过闭包储存需要触发的回调
  let handlers: F[] = [];

  return {
    // 获取数组长度
    get length() {
      return handlers.length;
    },
    push(fn: F) {
      // 插入回调
      handlers.push(fn);
      // 返回一个卸载当前回调的方法
      // 这里其实也是个闭包
      return function () {
        // 内部拿着 fn 的引用
        // 当外部调用返回方法的时候 相当于 重新对 handlers 进行赋值( 过滤掉之前传入的方法 )
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    // 这部分就是触发所有回调
    call(arg) {
      handlers.forEach(fn => fn && fn(arg));
    }
  };
}
````

总结一下:

- 这个方法，顾名思义，就是创建事件。定义了一个变量 `handlers` 数组，用于存放要处理的回调函数事件。然后返回了一个对象。

- `push` 方法就是往 `handlers` 中添加要执行的函数。

- 这块主要在 `history.listen()` 中使用，可以翻到开头看下 `history` 中返回了 `listen()` 方法，就是调用了`listeners.push(listener)` 。

- 最后 `call()` 方法就比较容易理解，就是取出 `handlers` 里面的回调函数并逐个执行。

- 总结一下，就是存储一下`push`进来的函数，并进行过滤。之后调用的时候会依次执行。`length`就是当前拥有的函数数量。

- 再切回去，就会发现，每次调用这个`listen`就相当于`push`一个函数到内部的一个变量`handlers`中。



#### block

在看 listeners 实现的时候发现了一个 blockers 也调用了 createEvents 方法

[官方的解释]: https://github.com/remix-run/history/blob/main/docs/blocking-transitions.md

看了下官网的文档就是用于关闭或者回退浏览器的误操作会用到的 .

 `react-router` 内 `Prompt` 组件就是基于这个实现



#### 具体核心原理

先秀一下源码。history的核心原理就是这个。先别被这么多行代码唬到了，很多都是我们在之前的push里面有解释的,主要的逻辑还是通过 popstate 和 hashchange来监听路由的变化然后，执行回调函数

````javascript
  let blockedPopTx: Transition | null = null;
  function handlePop() {
    // 如果设置 block 会先触发用户设置或者默认的 阻止跳转事件
    if (blockedPopTx) {
      blockers.call(blockedPopTx);
      blockedPopTx = null;
    } else {
      let nextAction = Action.Pop;
      let [nextIndex, nextLocation] = getIndexAndLocation();

      if (blockers.length) {
        if (nextIndex != null) {
          let delta = index - nextIndex;
          if (delta) {
            // Revert the POP
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry() {
                go(delta * -1);
              }
            };

            go(delta);
          }
        } else {
          // Trying to POP to a location with no index. We did not create
          // this location, so we can't effectively block the navigation.
          warning(
            false,
            // TODO: Write up a doc that explains our blocking strategy in
            // detail and link to it here so people can understand better
            // what is going on and how to avoid it.
            `You are trying to block a POP navigation to a location that was not ` +
              `created by the history library. The block will fail silently in ` +
              `production, but in general you should do all navigation with the ` +
              `history library (instead of using window.history.pushState directly) ` +
              `to avoid this situation.`
          );
        }
      } else {
        // 主要逻辑就是这里 触发跳转
        applyTx(nextAction);
      }
    }
  }

  window.addEventListener(PopStateEventType, handlePop);

  // popstate does not fire on hashchange in IE 11 and old (trident) Edge
  // https://developer.mozilla.org/de/docs/Web/API/Window/popstate_event
  window.addEventListener(HashChangeEventType, () => {
    let [, nextLocation] = getIndexAndLocation();
    // Ignore extraneous hashchange events.
    if (createPath(nextLocation) !== createPath(location)) {
      handlePop();
    }
  });
````



之前说的到，`history` 路由的核心是`window.addEventListener(PopStateEventType, handlePop);`

而哈希路由的核心也是监听路由的变化，只是参数不同。

```js
window.addEventListener('hashchange',function(e){
    /* 监听改变 */
})
```

而对路由的改变。`history`路由是：`history.pushState`，`history.replaceState`。

哈希路由是：

```
window.location.hash
```

通过`window.location.hash`属性获取和设置 `hash`值。

具体的话很差不多，关心细节的伙伴可以去看其源码哦。



------



#### Switch

````javascript
class Switch extends React.Component {
  render() {
    return (
       // TODO Router 子级消费
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Switch> outside a <Router>");

          // 默认使用context.location，如果有特殊定制的location才会使用。
          // 下面有介绍
          const location = this.props.location || context.location;

          let element, match;

          // We use React.Children.forEach instead of React.Children.toArray().find()
          // here because toArray adds keys to all child elements and we do not want
          // to trigger an unmount/remount for two <Route>s that render the same
          // component at different URLs.

          // React.Children.forEach 对子元素做遍历
          React.Children.forEach(this.props.children, child => {
            // 只要找到一个 match，那么就不会再进来了
            if (match == null && React.isValidElement(child)) {
              element = child;

              // child.props.path 就不多讲了， Route 的标准写法
              // 需要注意的是，使用 from 也会被匹配到
              // 任何组件，只要在 Switch 下，有 from 属性，并且和当前路径匹配，就会被渲染
              // from具体是给<Redirect>使用的，后面会说到
              const path = child.props.path || child.props.from;

              // 判断组件是否匹配
              match = path
              // 下面有专属的介绍这个函数
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;
            }
          });

          return match
            ? React.cloneElement(element, { location, computedMatch: match })
            : null;
        }}
      </RouterContext.Consumer>
    );
  }
}
````



#### matchPath

matchPath 函数也是由 react-router export 出去的函数，我们可以用来获得某个 url 中的指定的参数。

````javascript
function matchPath(pathname, options = {}) {
  // 如果 options 传的是个 string，那默认这个 string 代表 path
  // 如果 options 传的是个 数组，那只要有一个匹配，就认为匹配
  if (typeof options === "string" || Array.isArray(options)) {
    options = { path: options };
  }

  const { path, exact = false, strict = false, sensitive = false } = options;

  // 转化成数组进行判断
  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    if (!path && path !== "") return null;
    // 只要有一个 match，直接返回，认为是 match
    if (matched) return matched;

    // regexp 是正则表达式
    // keys 是切割出来的得 key 的值
    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    // exec() 该方法如果找到了匹配的文本的话，则会返回一个结果数组，否则的话，会返回一个
    const match = regexp.exec(pathname);
    /* 匹配不成功，返回null */
    if (!match) return null;

    // url 表示匹配到的部分
    const [url, ...values] = match;
    // pathname === url 表示完全匹配
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      // 这步就算匹配成功
      path, // the path used to match
      url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}
````



#### Route

````javascript
class Route extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Route> outside a <Router>");
          // 可以看出，用户传的 location 覆盖掉了 context 中的 location
          const location = this.props.location || context.location;

          // 如果有 computedMatch 就用 computedMatch 作为结果
          // 如果没有，则判断是否有 path 传参
          // matchPath 是调用 path-to-regexp 判断是否匹配
          // path-to-regexp 需要三个参数
          // exact: 如果为 true，则只有在路径完全匹配 location.pathname 时才匹配
          // strict: 如果为 true 当真实的路径具有一个斜线将只匹配一个斜线location.pathname
          // sensitive: 如果路径区分大小写，则为 true ，则匹配
          const match = this.props.computedMatch
            ? this.props.computedMatch // <Switch> already computed the match for us
            : this.props.path
            ? matchPath(location.pathname, this.props)
            : context.match;

          // props 就是更新后的 context
          // location 做了更新（有可能是用户传入的location）
          // match 做了更新
          const props = { ...context, location, match };

          // 三种渲染方式
          let { children, component, render } = this.props;

          // Preact uses an empty array as children by
          // default, so use null if that's the case.
          if (Array.isArray(children) && isEmptyChildren(children)) {
            children = null;
          }

          return (
            //TODO 渲染优先级 children > component > render
            <RouterContext.Provider value={props}>
              {props.match
                ? children
                  ? typeof children === "function"
                    ? __DEV__
                      ? evalChildrenDev(children, props, this.props.path)
                      : children(props)
                    : children
                  : component
                  ? React.createElement(component, props)
                  : render
                  ? render(props)
                  : null
                : typeof children === "function"
                ? __DEV__
                  ? evalChildrenDev(children, props, this.props.path)
                  : children(props)
                : null}
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}

````



- **Component**
  - component 表示只有当位置匹配时才会渲染的 React 组件。使用 component（而不是 render 或 children ）Route 使用从给定组件 React.createElement(element, props) 创建新的 React element。这意味着，使用 component 创建的组件能获得 router 中的 props。

- **children**
  - 从源码中可以看出，children 的优先级是高于 component，而且可以是一个组件，也可以是一个函数，children 没有获得 router 的 props。
  - children 有一个非常特殊的地方在于，当路由不匹配且 children 是一个函数的时候，会执行 children 方法，这就给了设计很大的灵活性。

- **render**
  - render 必须是一个函数，优先级是最低的，当匹配成功的时候，执行这个函数。



#### Prompt

Prompt 用于路由切换提示。这在某些场景下是非常有用的，比如用户在某个页面修改数据，离开时，提示用户是否保存，Prompt 组件有俩个属性：

1. message：用于显示提示的文本信息。
2. when：传递布尔值，相当于标签的开关，默认是 true，设置成 false 时，失效。

Prompt 的本质是在 when 为 true 的时候，调用  **context.history.block ( 上文提过 )** 方法，为全局注册路由监听，block 的原理看之前的 history 相关文章。路有变化的时候，默认使用 window.confirm 进行确认，我们也可以自定义 confirm 的形式，就是在 BrowserRouter 或者 HashRouter 传入 getUserConfirmation 这个参数，会替换掉 window.confirm。

````javascript
import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";

import Lifecycle from "./Lifecycle.js";
import RouterContext from "./RouterContext.js";

/**
 * The public API for prompting the user before navigating away from a screen.
 */
function Prompt({ message, when = true }) {
  return (
    <RouterContext.Consumer>
      {context => {
        invariant(context, "You should not use <Prompt> outside a <Router>");

        if (!when || context.staticContext) return null;

        // 调用了 history.block 方法 ( 核心逻辑 )
        const method = context.history.block;

        return (
          <Lifecycle
            onMount={self => {
              self.release = method(message);
            }}
            onUpdate={(self, prevProps) => {
              if (prevProps.message !== message) {
                self.release();
                self.release = method(message);
              }
            }}
            onUnmount={self => {
              self.release();
            }}
            message={message}
          />
        );
      }}
    </RouterContext.Consumer>
  );
}

export default Prompt;
````



#### Redirect

Redirect 与其说是一个组件，不如说是有组件封装的一组方法，该组件在 componentDidMount 生命周期内，通过调用 history API 跳转到到新位置，默认情况下，新位置将覆盖历史堆栈中的当前位置。

to 表示要重定向到的网址。to 也可以是一个 location 对象

push 为 true 时，重定向会将新条目推入历史记录，而不是替换当前条目。

结合 Switch 和 Redirect 源码看，如果 Redirect 中有 from 属性，会被 Switch 获得，当 from 和当前路径匹配的时候，就会渲染 Redirect 组件，执行跳转。

````javascript
/**
 * The public API for navigating programmatically with a component.
 */

function Redirect({ computedMatch, to, push = false }) {
  return (
    <RouterContext.Consumer>
      {context => {
        invariant(context, "You should not use <Redirect> outside a <Router>");

        const { history, staticContext } = context;

        // 一般来说，Redirect 操作都不需要留有 history，所以选择选择 history.replace
        const method = push ? history.push : history.replace;


        const location = createLocation(
          // computedMatch 就是看看 switch 有没有多管闲事
          computedMatch
            ? typeof to === "string"
              ? generatePath(to, computedMatch.params)
              : {
                  ...to,
                  pathname: generatePath(to.pathname, computedMatch.params)
                }
            : to
        );

        // When rendering in a static context,
        // set the new location immediately.
        // staticRouter 专用
        if (staticContext) {
          method(location);
          return null;
        }

        return (
          <Lifecycle
            onMount={() => {
              // componentDidMount 的时候执行 method(location)，也就是 history.replace 操作
              method(location);
            }}
            onUpdate={(self, prevProps) => {
              // componentDidUpdate 时候判断当前 location 和上一个 location 是否发生变化
              // 只要发生变化，调用 method(location)
              // 一般来讲，在 componentDidMount 的时候就跳走了，不会等到 componentDidUpdate
              const prevLocation = createLocation(prevProps.to);
              if (
                !locationsAreEqual(prevLocation, {
                  ...location,
                  key: prevLocation.key
                })
              ) {
                method(location);
              }
            }}

            // 无效
            to={to}
          />
        );
      }}
    </RouterContext.Consumer>
  );
}

export default Redirect;

````



#### Lifecycle

Lifecycle 不 render 任何页面，只有生命周期函数，Lifecycle 提供了 onMount， onUpdate， onUnmount 三个生命周期函数。

````javascript
import React from "react";

class Lifecycle extends React.Component {
  componentDidMount() {
    if (this.props.onMount) this.props.onMount.call(this, this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.onUpdate) this.props.onUpdate.call(this, this, prevProps);
  }

  componentWillUnmount() {
    if (this.props.onUnmount) this.props.onUnmount.call(this, this);
  }

  render() {
    return null;
  }
}

export default Lifecycle;

````



-----



### 总结

整个`react-router`是由`createBrowserHistory`或者`createHashHistory`来牵头，与我们的`React`组件绑定在一起，然后传递了一些属于`history`这个库的方法以及数值。当然，还有路由的匹配和渲染。

在`history`这个库里面又有对于路由的监听，改变等等。

### 流程

以`history`模式做参考（也是我们重点阅读的):

当`url`改变的时候，会触发写在`window`上面的监听`window.addEventListener('popstate', handlePop)`。

调用了我们的函数`handlePop`

函数内部我们`setState`，修改了`location`，方便传递正确的值下去，并通过了`Switch`找出匹配的`Route`组件。

触发了组件的渲染。



> 当然也包括我们所谓的history.push，history.repalce等等这些方法，本质上也是修改url，然后就是重复上面的步骤
