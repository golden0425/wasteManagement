### React-Router 解析



##### React-Router 的简介

React-Router 是一个基于 `Route`组件和由统一作者开发的 `History` 库来建立.

提供了路由的核心api。如Router、Route、Switch等，但没有提供有关dom操作进行路由跳转的api；



---------



#####React-Router-dom 的简介

`react-router-dom`在`react-router`的基础上扩展了可操作`dom`的`api`。

提供了`BrowserRouter`、`Route`、`Link`等api，可以通过dom操作触发事件控制路由。

`Link`组件，会渲染一个a标签；`BrowserRouter`和`HashRouter`组件，前者使用`pushState`和`popState`事件构建路由，后者使用`hash`和 `hashchange`事件构建路由。

`Swtich` 和 `Route` 都是从`react-router`中导入了相应的组件并重新导出，没做什么特殊处理。

`react-router-dom`中`package.json`依赖中存在对`react-router`的依赖，故此，不需要`npm`安装`react-router`。

- 可直接 npm 安装 react-router-dom，使用其api。

##### 常用 API

```javascript
import { Switch, Route, Router } from 'react-router';

import { Swtich, Route, BrowserRouter, HashHistory, Link } from 'react-router-dom';
```



--------------



##### 源码解析

**HashHistory**

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



##### react-router

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



**总结:**Router这个组件主要就是将一些数据进行存储。存到`Context`，之间不乏一些特殊情况的判断，比如子组件渲染比父组件早，以及`Redirect`的情况的处理。在卸载的时候要移除对`history`的监听。

子组件作为消费者，就可以对页面进行修改，跳转，获取这些数值。



##### history

之前一直有不断提到的`history`，我们一起来看看它是谁



createHashHistory

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

**push**

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



**replace**

这里面用的函数，在前面的push都有解析，可以往上面去找找，就不多赘述了。

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

