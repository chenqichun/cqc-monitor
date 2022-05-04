// 这里是获取页面各各加载时间
import tracker  from '../utils/tracker';
import onload from '../utils/onload';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
export function timing() {
  let FMP, LCP, browser_has_performanceObserver = false;
  if (PerformanceObserver) {
    new PerformanceObserver((entryList, observer) => {
      // 这里要元素设置属性elementtiming才能进入这里，如h1.setAttribute('elementtiming', 'good'),就是自己给定某个元素设置为重要元素
      let perfEntries = entryList.getEntries();
      FMP = perfEntries[0];
      observer.disconnect(); // 不再观察了
    }).observe({entryTypes: ['element']}); // 观察页面中有意义的元素

    new PerformanceObserver((entryList, observer) => {
      let perfEntries = entryList.getEntries();
      LCP = perfEntries[0];
      observer.disconnect(); // 不再观察了
    }).observe({entryTypes: ['largest-contentful-paint']}) // 观察页面中有意义的元素

    new PerformanceObserver((entryList, observer) => {
      // 要用户在页面有交互才会进入这个。输入，点击都可以
      let firstInput = entryList.getEntries()[0];
      let lastEvent = getLastEvent();
      if (firstInput) {
        let inputDelay = firstInput.processingStart - firstInput.startTime;
        let duration = firstInput.duration;
        if (inputDelay > 0 || duration > 0) {
          tracker.send({
            king: 'experience', // 用户体验指标
            type: 'firstInputDelay', // 首次输入延迟
            startTime: firstInput.startTime, // 从页面打开到用户开始交互的时间
            inputDelay, // 延迟时间
            duration, // 处理时间
            selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ""
          })
        }
      }
      observer.disconnect(); // 不再观察了
    }).observe({type: 'first-input', buffered: true}) // 用户的第一次交互

    browser_has_performanceObserver = true;
  }
  onload(() => {
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        redirectEnd,
        redirectStart,
        domLoading,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        domInteractive,
        domComplete,
        domainLookupStart,
        domainLookupEnd,
        loadEventStart,
        loadEventEnd,
        secureConnectionStart,
        unloadEventEnd,
        unloadEventStart
      } = performance.timing;
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'timing', 
        unloadTime: unloadEventEnd - unloadEventStart, // 页面卸载耗时
        redirect: redirectEnd - redirectStart, // 重定向耗时
        appCache: domainLookupStart - fetchStart, // 读取缓存的时间
        dnsTime: domainLookupEnd - domainLookupStart, // DNS解析耗时
        sslTimne: secureConnectionStart ? (connectEnd - secureConnectionStart) : "", //ssl安全连接耗时(反应数据安全连接建立耗时)
        connectTime: connectEnd - connectStart, // 建立连接耗时,tcp连接耗时
        ttfbTime: responseStart - requestStart, //  首字节到达需要的时间
        responeTime: responseEnd - responseStart, // 数据响应传输耗时
        parseDOMTime: domInteractive - responseEnd, // DOM解析的时间（观察DOM结构是否有js阻塞页面解析）
        //domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart,
        dclTime: domContentLoadedEventEnd - domContentLoadedEventStart, // 当HTML文档被完全加载和解析完成之后，DOMContentLoaded事件触发，无需等待样式表，图像和子框架的完成加载所需要的时间，可以在 window.addEventListener("DOMContentLoaded", () => {let start = Date.now();while((Date.now() - start)  < 1000){}})测试
        resourcesTime: domComplete - domContentLoadedEventEnd, // 资源加载耗时(可观察文档流是否过大)
        domReadyTime: domContentLoadedEventEnd - fetchStart, // DOM阶段渲染耗时(DOM数和页面资源加载完成时间,会触发domContentLoaded事件)
        blankScreenTime: responseEnd - fetchStart, // 白屏时间（加载文档到看到第一帧非空图像的时间）
        lookupTime: responseStart - domainLookupStart, // 首包耗时(DNS解析到响应返回给浏览器第一个字节的时间)
        domToInteractive: domInteractive - fetchStart, //首次可交互所需要的时间(dom数解析完成，此时document.readState为interactive)
        loadTime: loadEventStart - fetchStart, // 页面完全加载需要的时间
        loadEventTime: loadEventEnd - loadEventStart, // onLoad事件耗时（onload事件里有可能写了很多代码）
      })

      // 开始发送性能指标
      let FP = performance.getEntriesByName("first-paint")[0];
      let FCP = performance.getEntriesByName('first-contentful-paint')[0];
      tracker.send({
        kind: 'experience',
        type: 'paint',
        FP: FP?.startTime,
        FCP: FCP?.startTime,
        FMP: FMP?.startTime,
        LCP: LCP?.startTime,
      })
    }, 3000);
    
  })
}