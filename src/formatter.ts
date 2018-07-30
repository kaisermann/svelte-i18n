/**
 * Adapted from 'https://github.com/kazupon/vue-i18n/blob/dev/src/format.js'
 * Copyright (c) 2016 kazuya kawaguchi
 **/
import { isObject, warn } from './utils'

const RE_TOKEN_LIST_VALUE: RegExp = /^(\d)+/
const RE_TOKEN_NAMED_VALUE: RegExp = /^(\w)+/

type Token = {
  type: 'text' | 'named' | 'list' | 'unknown'
  value: string
}

export default class Formatter {
  _caches: { [key: string]: Array<Token> }

  constructor() {
    this._caches = Object.create(null)
  }

  interpolate(message: string, values: any): Array<any> {
    if (!values) {
      return [message]
    }

    let tokens: Array<Token> = this._caches[message]
    if (!tokens) {
      tokens = parse(message)
      this._caches[message] = tokens
    }

    return compile(tokens, values)
  }
}

/** Parse a identification string into cached Tokens */
export function parse(format: string): Array<Token> {
  const tokens: Array<Token> = []
  let position: number = 0
  let currentText: string = ''

  while (position < format.length) {
    let char: string = format[position++]

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
      let namedKey: string = ''
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

export function compile(tokens: Array<Token>, values: { [id: string]: any }): Array<any> {
  const compiled: Array<any> = []
  let index: number = 0

  const mode: string = Array.isArray(values) ? 'list' : isObject(values) ? 'named' : 'unknown'

  if (mode === 'unknown') {
    return compiled
  }

  while (index < tokens.length) {
    const token: Token = tokens[index++]
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
