import getLastEvent from '../utils/getLastEvent'
import getSelector from '../utils/getSelector'
import tracker from '../utils/tracker'

export function injectJsError() {
  function formattStack(stack) {
    return  stack.replace(/(\n\s+at\s*)+/ig, ' -> ')
  }

  window.addEventListener('error', (event) => {
    let lastEvent = getLastEvent();
    if (event.target && (event.target.src || event.target.href)) {
      tracker.send({
        kind: 'stability', // 稳定性，监控指标的大类
        type: 'error', // 小类型， 这是一个错误
        errorType: 'resourceError',
        filename: event.target.src || event.target.href,
        tagName: event.target.tagName.toLowerCase(),
        selector: getSelector(event.target) // 最后触发错误的元素
      })
    } else {
      tracker.send({
        kind: 'stability', // 稳定性，监控指标的大类
        type: 'error', // 小类型， 这是一个错误
        errorType: 'jsError',
        message: event.message,
        filename: event.filename,
        position: `${event.lineno}:${event.colno}`,
        stack: formattStack(event.error.stack),
        selector: lastEvent ? getSelector(lastEvent.path) : '' // 最后触发错误的元素
      })
    }
   
  }, true)

  window.addEventListener('unhandledrejection', event => {
    let lastEvent = getLastEvent();
    let message, stack, filename, lineno, colno;
    let reason = event.reason;
    if (typeof reason === 'string') {
      message = reason
    } else if (typeof reason === 'object') {
      if (reason.message) message = reason.message;
      if (reason.stack) {
        let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/, reason.stack);
        filename = matchResult[1]
        stack = formattStack(reason.stack)
        lineno = matchResult[2]
        colno = matchResult[3]
      }
    }
    let log = {
      kind: 'stability', // 稳定性，监控指标的大类
      type: 'error', // 小类型， 这是一个错误
      errorType: 'promiseError',
      message,
      filename,
      position: `${lineno}:${colno}`,
      stack,
      selector: lastEvent ? getSelector(lastEvent.path) : '' // 最后触发错误的元素
    }
    tracker.send(log)
  }, true)
}