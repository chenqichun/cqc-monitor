const userAgent = require('user-agent')
function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent)
    // 其他用户信息，如id, token
  }
}

class SendTracker {
  constructor() {
    this.url = ''; // 上报的路径
    this.xhr = new XMLHttpRequest
  }
  send(log = {}) {
    // this.xhr.open('POST', this.url, true)
    // this.xhr.setRequestHeader({})
    // this.xhr.onload = () =>{}
    // this.xhr.onerror = () =>{}
    // this.xhr.send(log)
    log = {...log, extraData: getExtraData()}
    console.log(log)
  }
}

export default new SendTracker