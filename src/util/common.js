export function substitutionString(str, frontLen = 10, endLen = 10, cha = '.') {
  if (!str) return ''
  if (typeof str !== 'string') return 'object'
  if (str.length <= frontLen + endLen) return str
  const len = 3
  let substitutionStr = ''
  for (let i = 0; i < len; i++) {
    substitutionStr += cha
  }
  return str.slice(0, frontLen) + substitutionStr + str.slice(-endLen)
}

export function substitutionStringForMatrixId(str, frontLen = 30, endLen = 30, char = '.') {
  if (!str) return ''
  if (typeof str !== 'string') return 'object'
  if (str.length <= frontLen + endLen) return str
  const regex = /(?<=@)([^:]*)(?=:)/gm
  const matches = str.match(regex)
  if (matches?.[0]) {
    return substitutionString(matches[0], frontLen, endLen, char)
  }
  return str
}
export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

export function diffMinutes(dt2, dt1) {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000
  diff /= 60
  return Math.abs(Math.round(diff))
}

export function isInSameDay(dt2, dt1) {
  return dt2.getFullYear() === dt1.getFullYear() && dt2.getMonth() === dt1.getMonth() && dt2.getDate() === dt1.getDate()
}

/**
 * @param {Event} ev
 * @param {string} [targetSelector] element selector for Element.matches([selector])
 */
export function getEventCords(ev, targetSelector) {
  let boxInfo

  const path = ev.nativeEvent.composedPath()
  const target = targetSelector ? path.find((element) => element.matches?.(targetSelector)) : null
  if (target) {
    boxInfo = target.getBoundingClientRect()
  } else {
    boxInfo = ev.target.getBoundingClientRect()
  }

  return {
    x: boxInfo.x,
    y: boxInfo.y,
    width: boxInfo.width,
    height: boxInfo.height,
    detail: ev.detail,
  }
}

export function abbreviateNumber(number) {
  if (number > 99) return '99+'
  return number
}

export class Debounce {
  constructor() {
    this.timeoutId = null
  }

  /**
   * @param {function} func - callback function
   * @param {number} wait - wait in milliseconds to call func
   * @returns {func} debounceCallback - to pass arguments to func callback
   */
  _(func, wait) {
    const that = this
    return function debounceCallback(...args) {
      clearTimeout(that.timeoutId)
      that.timeoutId = setTimeout(() => {
        func.apply(this, args)
        that.timeoutId = null
      }, wait)
    }
  }
}

export class Throttle {
  constructor() {
    this.timeoutId = null
  }

  /**
   * @param {function} func - callback function
   * @param {number} wait - wait in milliseconds to call func
   * @returns {function} throttleCallback - to pass arguments to func callback
   */
  _(func, wait) {
    const that = this
    return function throttleCallback(...args) {
      if (that.timeoutId !== null) return
      that.timeoutId = setTimeout(() => {
        func.apply(this, args)
        that.timeoutId = null
      }, wait)
    }
  }
}

export function getUrlPrams(paramName) {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  return urlParams.get(paramName)
}

export function getScrollInfo(target) {
  const scroll = {}
  scroll.top = Math.round(target.scrollTop)
  scroll.height = Math.round(target.scrollHeight)
  scroll.viewHeight = Math.round(target.offsetHeight)
  scroll.isScrollable = scroll.height > scroll.viewHeight
  return scroll
}

export function avatarInitials(text) {
  if (typeof text !== 'string' || text.length < 1) {
    return text[0]
  }

  if (text.toUpperCase().startsWith('0X')) {
    return text.substring(text.length - 1).toUpperCase()
  }
  return [...text][0].toUpperCase()
}

export function parseMatrixAccountId(str) {
  let start = -1
  start = str.startsWith('@') ? 1 : start
  start = str.startsWith('!') ? 0 : start
  start = str.startsWith('#') ? 0 : start
  if (start >= 0) {
    const end = str.indexOf(':')
    if (end > 0) {
      return str.substring(start, end)
    }
  }
  return str
}

export function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name)
}

export function setFavicon(url) {
  const favicon = document.querySelector('#favicon')
  if (!favicon) return
  favicon.setAttribute('href', url)
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  } else {
    const host = document.body
    const copyInput = document.createElement('input')
    copyInput.style.position = 'fixed'
    copyInput.style.opacity = '0'
    copyInput.value = text
    host.append(copyInput)

    copyInput.select()
    copyInput.setSelectionRange(0, 99999)
    document.execCommand('Copy')
    copyInput.remove()
  }
}

export function suffixRename(name, validator) {
  let suffix = 2
  let newName = name
  do {
    newName = name + suffix
    suffix += 1
  } while (validator(newName))

  return newName
}

export function getImageDimension(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = async () => {
      resolve({
        w: img.width,
        h: img.height,
      })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export function scaleDownImage(imageFile, width, height) {
  return new Promise((resolve) => {
    const imgURL = URL.createObjectURL(imageFile)
    const img = new Image()

    img.onload = () => {
      let newWidth = img.width
      let newHeight = img.height
      if (newHeight <= height && newWidth <= width) {
        resolve(imageFile)
      }

      if (newHeight > height) {
        newWidth = Math.floor(newWidth * (height / newHeight))
        newHeight = height
      }
      if (newWidth > width) {
        newHeight = Math.floor(newHeight * (width / newWidth))
        newWidth = width
      }

      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      canvas.toBlob((thumbnail) => {
        URL.revokeObjectURL(imgURL)
        resolve(thumbnail)
      }, imageFile.type)
    }

    img.src = imgURL
  })
}

/**
 * @param {sigil} string sigil to search for (for example '@', '#' or '$')
 * @param {flags} string regex flags
 * @param {prefix} string prefix appended at the beginning of the regex
 * @returns {RegExp}
 */
export function idRegex(sigil, flags, prefix) {
  const servername = '(?:[a-zA-Z0-9-.]*[a-zA-Z0-9]+|\\[\\S+?\\])(?::\\d+)?'
  return new RegExp(`${prefix}(${sigil}\\S+:${servername})`, flags)
}

const matrixToRegex = /^https?:\/\/matrix.to\/#\/(\S+:\S+)/
/**
 * Parses a matrix.to URL into an matrix id.
 * This function can later be extended to support matrix: URIs
 * @param {string} uri The URI to parse
 * @returns {string|null} The id or null if the URI does not match
 */
export function parseIdUri(uri) {
  const res = decodeURIComponent(uri).match(matrixToRegex)
  if (!res) return null
  return res[1]
}
