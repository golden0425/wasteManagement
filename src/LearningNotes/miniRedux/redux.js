;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global = global || self), factory((global.Redux = {})))
})(this, function (exports) {
  var ActionTypes = {
    INIT: '@@redux/INIT',
    REPLACE: '@@redux/REPLACE',
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return '@@redux/PROBE_UNKNOWN_ACTION'
    },
  }

  function createStore(reducer, preloadedState, enhancer) {
    var currentReducer = reducer
    var currentState = preloadedState
    var currentListeners = []

    function getState() {
      return currentState
    }

    function subscribe(listener) {
      currentListeners.push(listener)
    }

    function dispatch(action) {
      currentState = currentReducer(currentState, action)
      var listeners = currentListeners
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i]
        listener()
      }

      return action
    }

    function replaceReducer() {
      currentReducer = nextReducer
      dispatch({
        type: ActionTypes.REPLACE,
      })
    }

    function observable() {}

    dispatch({
      type: ActionTypes.REPLACE,
    })

    return {
      getState,
      subscribe,
      dispatch,
      replaceReducer,
    }
  }

  exports.createStore = createStore

  Object.defineProperty(exports, '__esModule', { value: true })
})
