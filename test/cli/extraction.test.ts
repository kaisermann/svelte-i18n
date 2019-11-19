// TODO: better tests. these are way too generic.

import { parse } from 'svelte/compiler'

import {
  collectFormatCalls,
  collectMessageDefinitions,
  collectMessages,
  extractMessages,
} from '../../src/cli/extract'

describe('collecting format calls', () => {
  it('should return nothing if there are no imports from the library', () => {
    const ast = parse(`<script>const $_ = () => 0; $_();</script>`)
    const calls = collectFormatCalls(ast)
    expect(calls).toHaveLength(0)
  })

  it('should collect all format calls in the instance script', () => {
    const ast = parse(`<script>
    import { format, _ } from 'svelte-i18n'
    $format('foo')
    format('bar')
    let label = $_({id:'bar'})
    const a = { b: () => 0}
    </script>`)
    const calls = collectFormatCalls(ast)
    expect(calls).toHaveLength(2)
    expect(calls[0]).toMatchObject({ type: 'CallExpression' })
    expect(calls[1]).toMatchObject({ type: 'CallExpression' })
  })

  it('should collect all format calls with renamed imports', () => {
    const ast = parse(`<script>
    import { format as _x, _ as intl } from 'svelte-i18n'
    $_x('foo')
    $intl({ id: 'bar' })
    </script>`)
    const calls = collectFormatCalls(ast)
    expect(calls).toHaveLength(2)
    expect(calls[0]).toMatchObject({ type: 'CallExpression' })
    expect(calls[1]).toMatchObject({ type: 'CallExpression' })
  })

  it('should collect all format utility calls', () => {
    const ast = parse(`<script>
    import { _ } from 'svelte-i18n'
    $_.title('foo')
    $_.capitalize({ id: 'bar' })
    $_.number(10000)
    </script>`)
    const calls = collectFormatCalls(ast)
    expect(calls).toHaveLength(3)
    expect(calls[0]).toMatchObject({ type: 'CallExpression' })
    expect(calls[1]).toMatchObject({ type: 'CallExpression' })
    expect(calls[2]).toMatchObject({ type: 'CallExpression' })
  })
})

describe('collecting message definitions', () => {
  it('should return nothing if there are no imports from the library', () => {
    const ast = parse(
      `<script>
      import foo from 'foo';
      import { dictionary } from 'svelte-i18n';
      </script>`,
    )
    expect(collectMessageDefinitions(ast)).toHaveLength(0)
  })

  it('should get all message definition objects', () => {
    const ast = parse(`<script>
    import { defineMessages } from 'svelte-i18n';
    defineMessages({ foo: { id: 'foo' }, bar: { id: 'bar' } })
    defineMessages({ baz: { id: 'baz' }, quix: { id: 'qux' } })
    </script>`)
    const definitions = collectMessageDefinitions(ast)
    expect(definitions).toHaveLength(4)
    expect(definitions[0]).toMatchObject({ type: 'ObjectExpression' })
    expect(definitions[1]).toMatchObject({ type: 'ObjectExpression' })
    expect(definitions[2]).toMatchObject({ type: 'ObjectExpression' })
    expect(definitions[3]).toMatchObject({ type: 'ObjectExpression' })
  })
})

describe('collecting messages', () => {
  it('should collect all messages in both instance and html ASTs', () => {
    const markup = `
    <script>
      import { _, defineMessages } from 'svelte-i18n';
      console.log($_({ id: 'foo' }))
      console.log($_.title({ id: 'page.title' }))

      const messages = defineMessages({
        enabled: { id: 'enabled' , default: 'Enabled' },
        disabled: { id: 'disabled', default:  'Disabled' }
      })
    </script>
    <div>{$_('msg_1')}</div>
    <div>{$_({id: 'msg_2'})}</div>
    <div>{$_('msg_3', { default: 'Message'})}</div>`
    const messages = collectMessages(markup)
    expect(messages).toHaveLength(7)
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ meta: { id: 'foo' } }),
        expect.objectContaining({ meta: { id: 'msg_1' } }),
        expect.objectContaining({ meta: { id: 'msg_2' } }),
        expect.objectContaining({ meta: { id: 'msg_3', default: 'Message' } }),
        expect.objectContaining({ meta: { id: 'page.title' } }),
        expect.objectContaining({
          meta: { id: 'disabled', default: 'Disabled' },
        }),
        expect.objectContaining({
          meta: { id: 'enabled', default: 'Enabled' },
        }),
      ]),
    )
  })
})

describe('messages extraction', () => {
  it('should return a object built based on all found message paths', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_.title('title')}</h1>
    <h2>{$_({ id: 'subtitle'})}</h2>
    `
    const dict = extractMessages(markup)
    expect(dict).toMatchObject({ title: '', subtitle: '' })
  })

  it('creates deep nested properties', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_.title('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    <ul>
      <li>{$_('list[0]')}</li>
      <li>{$_('list[1]')}</li>
      <li>{$_('list[2]')}</li>
    </ul>
    `
    const dict = extractMessages(markup)
    expect(dict).toMatchObject({
      home: { page: { title: '', subtitle: '' } },
      list: ['', '', ''],
    })
  })

  it('creates a shallow dictionary', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_.title('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    <ul>
      <li>{$_('list[0]')}</li>
      <li>{$_('list[1]')}</li>
      <li>{$_('list[2]')}</li>
    </ul>
    `
    const dict = extractMessages(markup, { shallow: true })
    expect(dict).toMatchObject({
      'home.page.title': '',
      'home.page.subtitle': '',
      'list[0]': '',
      'list[1]': '',
      'list[2]': '',
    })
  })

  it('allow to pass a initial dictionary and only append non-existing props', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_.title('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    <ul>
      <li>{$_('list[0]')}</li>
      <li>{$_('list[1]')}</li>
      <li>{$_('list[2]')}</li>
    </ul>
    `
    const dict = extractMessages(markup, {
      overwrite: false,
      accumulator: {
        home: {
          page: {
            title: 'Page title',
          },
        },
      },
    })
    expect(dict).toMatchObject({
      home: {
        page: {
          title: 'Page title',
          subtitle: '',
        },
      },
      list: ['', '', ''],
    })
  })

  it('allow to pass a initial dictionary and only append shallow non-existing props', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_.title('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    `
    const dict = extractMessages(markup, {
      overwrite: false,
      shallow: true,
      accumulator: {
        'home.page.title': 'Page title',
      },
    })
    expect(dict).toMatchObject({
      'home.page.title': 'Page title',
      'home.page.subtitle': '',
    })
  })
})
