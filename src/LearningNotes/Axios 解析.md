### Axios 的简介

Axios 是一个基于 Promise 的 HTTP 客户端，拥有以下特性：

- 支持 Promise API；

- 能够拦截请求和响应；

- 能够转换请求和响应数据；

- 客户端支持防御 CSRF 攻击；

- 同时支持浏览器和 Node.js 环境；

- 能够取消请求及自动转换 JSON 数据。



------

### HTTP 拦截器的设计与实现

拦截器介绍:

- 主要是为了避免为每个请求单独处理，我们可以通过封装统一的 request 函数来为每个请求统一添加 token 信息.减少后续项目维护成本

- 请求拦截器：该类拦截器的作用是在请求发送前统一执行某些操作，比如在请求头中添加 token 字段。

- 响应拦截器：该类拦截器的作用是在接收到服务器响应后统一执行某些操作，比如发现响应状态码为 401 时，自动跳转到登录页。

使用方法:
- 在 Axios 中设置拦截器很简单，通过 axios.interceptors.request 和 axios.interceptors.response 对象提供的 use 方法，就可以分别设置请求拦截器和响应拦截器：

````javascript
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  config.headers.token = 'added by interceptor';
  return config;
});

// 添加响应拦截器
axios.interceptors.response.use(function (data) {
  data.data = data.data + ' - modified by interceptor';
  return data;
});
````



**「任务注册、任务编排和任务调度」**  三个方面来分析 Axios 拦截器的实现。

#### 任务注册:

我们已经知道如何注册请求拦截器和响应拦截器，其中请求拦截器用于处理请求配置对象的子任务，而响应拦截器用于处理响应对象的子任务。要搞清楚任务是如何注册的，就需要了解 `axios` 和 `axios.interceptors` 对象。

`````javascript
// lib/axios.js
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);
  // Copy context to instance
  utils.extend(instance, context);
  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);
`````

在 Axios 的源码中，我们找到了 `axios` 对象的定义，很明显默认的 `axios` 实例是通过 `createInstance` 方法创建的，该方法最终返回的是 `Axios.prototype.request` 函数对象。同时，我们发现了 `Axios` 的构造函数：

````javascript
// lib/core/Axios.js
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
````

在构造函数中，我们找到了 `axios.interceptors` 对象的定义，也知道了 `interceptors.request` 和 `interceptors.response` 对象都是 `InterceptorManager` 类的实例。因此接下来，进一步分析 `InterceptorManager` 构造函数及相关的 `use` 方法就可以知道任务是如何注册的：

````javascript
// lib/core/InterceptorManager.js
function InterceptorManager() {
  //TODO 拦截队列
  this.handlers = [];
}

InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    //TODO 配置项
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  //TODO 返回当前的索引，用于移除已注册的拦截器
  return this.handlers.length - 1;
};
````
**InterceptorManager关系图**
![InterceptorManager关系图](https://user-images.githubusercontent.com/48218273/129293736-2a25e479-d20a-4d5d-815e-d80a7e1e73ce.png)


#### 任务编排:

现在我们已经知道如何注册拦截器任务，但仅仅注册任务是不够，我们还需要对已注册的任务进行编排，这样才能确保任务的执行顺序。这里我们把完成一次完整的 HTTP 请求分为处理请求配置对象、发起 HTTP 请求和处理响应对象 3 个阶段

- 接下来我们来看一下 Axios 如何发请求的：

````javascript
axios({
  url: '/hello',
  method: 'get',
}).then(res =>{
  console.log('axios res: ', res)
  console.log('axios res.data: ', res.data)
})
````

通过前面的分析，我们已经知道 `axios` 对象对应的是 `Axios.prototype.request` 函数对象，该函数的具体实现如下：

````javascript
//   ##lib/core/Axios.js
Axios.prototype.request = function request(config) {
  config = mergeConfig(this.defaults, config);

  // 任务编排
  //TODO 请求拦截器数组
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    //TODO interceptor 就是我们调用 interceptors.request.use 传入的参数对象
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }
    // TODO interceptors.request.use 方法 第三个参数可配置 interceptor.synchronous;
    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
    // TODO 成功和失败的回调 =>
    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });
  // TODO 响应拦截器数组(实现和请求拦截器差不多)
  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });


  // TODO 任务调度
  var promise;
  // TODO 同步请求进入
  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined]
    // TODO requestInterceptorChain => [ interceptor.fulfilled, interceptor.rejected ]
    Array.prototype.unshift.apply(chain, requestInterceptorChain)
    // 同上
    chain.concat(responseInterceptorChain)
    // TODO 最终会变成 [ requestInterceptorChain ,dispatchRequest, undefined ,responseInterceptorChain ]
    // TODO => dispatchRequest 请求适配器 进行数据请求
    promise = Promise.resolve(config)
    while (chain.length) {
      // TODO 重点 => 通过 while 语句我们就可以不断地取出设置的任务，然后组装成 Promise 调用链从而实现任务调度
      promise = promise.then(chain.shift(), chain.shift())
    }
    // 最终返回
    return promise
  }


  // TODO 遍历请求拦截队列
  while (requestInterceptorChain.length) {
    // TODO 取出 request 的方法
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      //TODO 执行 获取用户的自定义配置
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    // TODO 获取请求方法进行请求
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }
  // TODO 同样最后进行响应拦截
  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;



  var newConfig = config;
  // TODO 遍历请求拦截队列
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};
````

**任务编排**
![任务编排](https://user-images.githubusercontent.com/48218273/129293727-1a7bf4a4-7def-4aad-9af5-b7ae2a09be98.png)

**任务调度**
![任务调度](https://user-images.githubusercontent.com/48218273/129293735-5f1d63a6-b6fa-4ccd-8723-e5910217e318.png)

下面我们来回顾一下 Axios 拦截器完整的使用流程：

````javascript
// 添加请求拦截器 —— 处理请求配置对象
axios.interceptors.request.use( (config) =>{
  config.headers.token = 'added by interceptor';
  return config;
},(err)=>{

});

// 添加响应拦截器 —— 处理响应对象
axios.interceptors.response.use( (data) => {
  data.data = data.data + ' - modified by interceptor';
  return data;
},(err)=>{

});

axios({
  url: '/hello',
  method: 'get',
}).then(res =>{
  console.log('axios res.data: ', res.data)
})
````

介绍完 Axios 的拦截器，我们来总结一下它的优点。Axios 通过提供拦截器机制，让开发者可以很容易在请求的生命周期中自定义不同的处理逻辑。

此外，也可以通过拦截器机制来灵活地扩展 Axios 的功能，比如 Axios 生态中列举的 axios-response-logger 和 axios-debug-log 这两个库。

参考 Axios 拦截器的设计模型，我们就可以抽出以下通用的任务处理模型：


![任务处理模型](https://user-images.githubusercontent.com/48218273/129293733-15607f11-c659-4404-900e-ee349a0a9be5.png)

--------

### HTTP 适配器的设计与实现

#### 默认 HTTP 适配器

Axios 同时支持浏览器和 Node.js 环境，对于浏览器环境来说，我们可以通过 `XMLHttpRequest` 或 `fetch` API 来发送 HTTP 请求，而对于 Node.js 环境来说，我们可以通过 Node.js 内置的 `http` 或 `https` 模块来发送 HTTP 请求。

为了支持不同的环境，Axios 引入了适配器。在 HTTP 拦截器设计部分，我们看到了一个 `dispatchRequest` 方法，该方法用于发送 HTTP 请求，它的具体实现如下所示：

````javascript
// lib/core/dispatchRequest.js
module.exports = function dispatchRequest(config) {
  // 省略部分代码
  // TODO adapter 通过判断 XMLHttpRequest 和 process 的类型去判断当前环境状态来区分使用什么方式请求 具体的逻辑在 // lib/defaults.js
  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    // 省略部分代码
    return response;
  }, function onAdapterRejection(reason) {
    // 省略部分代码
    return Promise.reject(reason);
  });
};
````



#### 自定义适配器

其实除了默认的适配器外，我们还可以自定义适配器。那么如何自定义适配器呢？这里我们可以参考 Axios 提供的示例：

```javascript
var settle = require('./../core/settle');
module.exports = function myAdapter(config) {
  // 当前时机点：
  //  - config配置对象已经与默认的请求配置合并
  //  - 请求转换器已经运行
  //  - 请求拦截器已经运行

  // 使用提供的config配置对象发起请求
  // 根据响应对象处理Promise的状态
  return new Promise(function(resolve, reject) {
    var response = {
      data: responseData,
      status: request.status,
      statusText: request.statusText,
      headers: responseHeaders,
      config: config,
      request: request
    };

    settle(resolve, reject, response);

    // 此后:
    //  - 响应转换器将会运行
    //  - 响应拦截器将会运行
  });
}
```

在以上示例中，我们主要关注转换器、拦截器的运行时机点和适配器的基本要求。比如当调用自定义适配器之后，需要返回 Promise 对象。这是因为 Axios 内部是通过 Promise 链式调用来完成请求调度，不清楚的小伙伴可以重新阅读 “拦截器的设计与实现” 部分的内容。

 axios-mock-adapter 这个库，该库通过自定义适配器，让开发者可以轻松地模拟请求。对应的使用示例如下所示：

````javascript
var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");

// 在默认的Axios实例上设置mock适配器
var mock = new MockAdapter(axios);

// 模拟 GET /users 请求
mock.onGet("/users").reply(200, {
  users: [{ id: 1, name: "John Smith" }],
});

axios.get("/users").then(function (response) {
  console.log(response.data);
});
````

到这里我们已经介绍了 Axios 的拦截器与适配器，下面用一张图来总结一下 Axios 使用请求拦截器和响应拦截器后，请求的处理流程：

**处理流程**
![处理流程](https://user-images.githubusercontent.com/48218273/129295276-3afa8339-bddc-4801-86a3-c01632595ade.png)

