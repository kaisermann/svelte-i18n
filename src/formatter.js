/**
 * Adapted from 'https://github.com/kazupon/vue-i18n/blob/dev/src/format.js'
 * Copyright (c) 2016 kazuya kawaguchi
 **/
import { isObject, warn } from './utils'

const RE_TOKEN_LIST_VALUE = /^(\d)+/
const RE_TOKEN_NAMED_VALUE = /^(\w)+/

export default class Formatter {
  constructor() {
    this._caches = Object.create(null)
  }

  interpolate(message, values) {
    if (!values) {
      return [message]
    }

    let tokens = this._caches[message]
    if (!tokens) {
      tokens = parse(message)
      this._caches[message] = tokens
    }

    return compile(tokens, values)
  }
}

/** Parse a identification string into cached Tokens */
export function parse(format){
  const tokens = []
  let position = 0
  let currentText = ''

  while (position < format.length) {
    let char = format[position++]

    /** If found any character that's not a '{' (does not include '\{'), assume text */
    if (char !== '{' || (position > 0 && char[position - 1] === '\\')) {
      currentText += char
    } else {
      /** Beginning of a interpolation */
      if (currentText.length) {
        tokens.push({ type: 'text', value: currentText })
      }

      /** Reset the current text string because we're dealing interpolation entry */
      currentText = ''

      /** Key name */
      let namedKey = ''
      char = format[position++]

      while (char !== '}') {
        namedKey += char
        char = format[position++]
      }

      const type = RE_TOKEN_LIST_VALUE.test(namedKey)
        ? 'list'
        : RE_TOKEN_NAMED_VALUE.test(namedKey)
          ? 'named'
          : 'unknown'

      tokens.push({ value: namedKey, type })
    }
  }

  /** If there's any text left, push it to the tokens list */
  if (currentText) {
    tokens.push({ type: 'text', value: currentText })
  }

  return tokens
}

export function compile(tokens, values) {
  const compiled = []
  let index  = 0

  const mode = Array.isArray(values) ? 'list' : isObject(values) ? 'named' : 'unknown'

  if (mode === 'unknown') {
    return compiled
  }

  while (index < tokens.length) {
    const token = tokens[index++]
    switch (token.type) {
      case 'text':
        compiled.push(token.value)
        break
      case 'list':
        compiled.push(values[parseInt(token.value, 10)])
        break
      case 'named':
        if (mode === 'named') {
          compiled.push(values[token.value])
        } else {
          if (process.env.NODE_ENV !== 'production') {
            warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`)
          }
        }
        break

      case 'unknown':
        if (process.env.NODE_ENV !== 'production') {
          warn(`Detect 'unknown' type of token!`)
        }
        break
    }
  }

  return compiled
}
