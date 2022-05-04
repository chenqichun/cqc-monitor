
import tracker from "../utils/tracker";
import onload from "../utils/onload";

export function blankScreen() {
  let wrapperElements = ['html', 'body'];
  let emptyPoints = 0, count = 9;
 
  function getSelector(ele) {
    if (ele.id) {
      return '#' + ele.id
    } else if (ele.className) {
      return '.' + ele.className.split(" ").filter(item => !!item).join('.')
    } else {
      return ele.nodeName.toLowerCase();
    }
  }

  function isWrapper(ele) {
    let selector = getSelector(ele);
    if (wrapperElements.indexOf(selector) != -1) {
      emptyPoints++;
    }
  }

  onload(() => {
    for (let i = 1; i <= count; i++) {
      let xElements = document.elementsFromPoint(
        window.innerWidth * i / 10,
        window.innerHeight / 2
      )
      let yElements = document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight * i / 10
      )
      isWrapper(xElements[0])
      isWrapper(yElements[0])
    }
    if (emptyPoints >= (count * 2)) {
      let centerElments = document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      tracker.send({
        kind: 'stability',
        type: 'blank',
        emptyPoints,
        screen: window.screen.width + 'x' + window.screen.height,
        viewPoint: window.innerWidth + 'x' +window.innerHeight,
        centerSelector: getSelector(centerElments[0])
      })
    }
  })
}