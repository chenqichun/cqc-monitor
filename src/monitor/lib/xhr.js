import tracker from "../utils/tracker";
 let uploadUrl = /xxxx/;
export function injectXHR() {
  let XMLHttpRequest = window.XMLHttpRequest;
  let oleOpen = XMLHttpRequest.prototype.open;
  let oleSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url, async) {
   // 要判断下url, 不能是上传错误的接口uploadUrl,否则出现错误将进入死循环
    if (!url.match(uploadUrl) && !url.match(/sockjs/) ) {
      this._logData = {
        method,
        url,
        async
      }
    }
    return oleOpen.apply(this, arguments)
  }
  XMLHttpRequest.prototype.send = function(body) {
    if (this._logData) {
      let startTime = Date.now();
      const handler = (type) =>(event) => {
        let  duration = Date.now() - startTime;
        let status = this.status;
        let statusText = this.statusText;

        tracker.send({
          kind: 'stability',
          type: 'xhr',
          eventType: type,
          pathname: this._logData.url,
          status: status + '-' + statusText,
          duration: duration,
          response: this.response ? JSON.stringify(this.response) : '',
          params: body || ''
        })
      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
    }
    return oleSend.apply(this, arguments)
  }

    // fetch的拦截

    let oleFetch = window.fetch;
    window.fetch = (url, opts={}) => {
      let startTime = Date.now();
      let handler = response => {
        let duration = Date.now() - startTime;
        if (!url.match(/xxxx/) && !url.match(/sockjs/) && !url.match(/hot-update/)) {}
        tracker.send({
          kind: "stabillity", 
          type: "request-fetch",
          eventType: response.ok ? "success" : "error", 
          apiName: response.url, // 路径
          status: response.status + '-' + response.statusText, // 状态码
          duration: duration, // 持续时间
         // response: response.ok ? JSON.stringify(response.json()) : "", // 响应内容
          params: opts.body || (response.url.split("?")[1]??""), // 参数
        })
      }
      return new Promise((resolve, reject) => {
        let newOpts = {
          headers: {
            'Content-Type': 'application/json'
          },
          method: "GET",
          ...opts
        };
        oleFetch(url, newOpts)
        .then(response => {
          handler(response)
          if (response.ok) {
            return response.json()
          } else {
            return Promise.reject(response)
          }
          
        })
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
      })
    }
}