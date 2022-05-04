function getSelector(path) {

  return path.reverse().filter(ele => {
    return ele !== document && ele !== window
  }).map(ele => {
    if (ele.id) {
      return `${ele.nodeName.toLowerCase()}#${ele.id}`
    } else if (ele.className && typeof ele.className === 'string') {
      return `${ele.nodeName.toLowerCase()}.${ele.className.split(" ").filter(item => !!item).join('.')}`
    } else {
      return `${ele.nodeName.toLowerCase()}`
    }
  }).join(" -> ")
}

export default function (pathOrTarget) {
  if (Array.isArray(pathOrTarget)) {
    return getSelector(pathOrTarget)
  } else {
    let path = [];
    while(pathOrTarget) {
      path.push(pathOrTarget)
      pathOrTarget = pathOrTarget.parentNode
    }
    return getSelector(path)
  }
}