import { parse } from 'svelte/compiler';

import {
  collectFormatCalls,
  collectMessageDefinitions,
  collectMessages,
  extractMessages,
} from '../../src/cli/extract';

describe('collecting format calls', () => {
  it('returns nothing if there are no script tag', () => {
    const ast = parse(`<div>Hey</div>`);
    const calls = collectFormatCalls(ast);

    expect(calls).toHaveLength(0);
  });

  it('returns nothing if there are no imports', () => {
    const ast = parse(`<script>
      import Foo from 'foo';
      const $_ = () => 0; $_();
    </script>`);

    const calls = collectFormatCalls(ast);

    expect(calls).toHaveLength(0);
  });

  it('returns nothing if import from wrong lib', () => {
    const ast = parse(`<script>
      import { _ } from '../helpers/i18n'
      let label = $_('bar')
    </script>`);

    const calls = collectFormatCalls(ast);

    expect(calls).toHaveLength(0);
  });

  it('returns all format calls if import from wrong lib and import-check is disabled', () => {
    const ast = parse(`<script>
      import { _ } from '../helpers/i18n'
      let label = $_('bar')
    </script>`);

    const ignoreLib = true;
    const calls = collectFormatCalls(ast, ignoreLib);

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ type: 'CallExpression' });
  });

  it('returns nothing if there are no format imports', () => {
    const ast = parse(
      `<script>
        import { init } from 'svelte-i18n';
        init({})
      </script>`,
    );

    const calls = collectFormatCalls(ast);

    expect(calls).toHaveLength(0);
  });

  it('collects all format calls in the instance script', () => {
    const ast = parse(`<script>
    import { format, _ } from 'svelte-i18n'
      $format('foo')
      format('bar')
      let label = $_({id:'bar'})
      const a = { b: () => 0}
    </script>`);

    const calls = collectFormatCalls(ast);

    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({ type: 'CallExpression' });
    expect(calls[1]).toMatchObject({ type: 'CallExpression' });
  });

  it('collects all format calls with renamed imports', () => {
    const ast = parse(`<script>
      import { format as _x, _ as intl, t as f } from 'svelte-i18n'
      $_x('foo')
      $intl({ id: 'bar' })
      $f({ id: 'bar' })
    </script>`);

    const calls = collectFormatCalls(ast);

    expect(calls).toHaveLength(3);
    expect(calls[0]).toMatchObject({ type: 'CallExpression' });
    expect(calls[1]).toMatchObject({ type: 'CallExpression' });
    expect(calls[2]).toMatchObject({ type: 'CallExpression' });
  });
});

describe('collecting message definitions', () => {
  it('returns nothing if there are no imports from the library', () => {
    const ast = parse(
      `<script>
        import foo from 'foo';
        import { dictionary } from 'svelte-i18n';
      </script>`,
    );

    expect(collectMessageDefinitions(ast)).toHaveLength(0);
  });

  it('gets all message definition objects', () => {
    const ast = parse(`
    <script context="module">
      import { defineMessages } from 'svelte-i18n';
      defineMessages({ quux: { id: 'quux' }, quuz: { id: 'quuz' } })
      defineMessages({ corge: { id: 'corge' }, grault: { id: 'grault' } })
    </script>
    <script>
      import { defineMessages } from 'svelte-i18n';
      defineMessages({ foo: { id: 'foo' }, bar: { id: 'bar' } })
      defineMessages({ baz: { id: 'baz' }, quix: { id: 'qux' } })
    </script>`);

    const definitions = collectMessageDefinitions(ast);

    expect(definitions).toHaveLength(8);
    definitions.forEach((definition) => {
      expect(definition).toMatchObject({ type: 'ObjectExpression' });
    });
  });

  it('gets message definitions if in module only', () => {
    const ast = parse(`
    <script context="module">
      import { defineMessages } from 'svelte-i18n';
      defineMessages({ quux: { id: 'quux' }, quuz: { id: 'quuz' } })
      defineMessages({ corge: { id: 'corge' }, grault: { id: 'grault' } })
    </script>
    <script>
      const a = "a";
    </script>`);

    const definitions = collectMessageDefinitions(ast);

    expect(definitions).toHaveLength(4);
    definitions.forEach((definition) => {
      expect(definition).toMatchObject({ type: 'ObjectExpression' });
    });
  });

  it('gets message definitions if in script only', () => {
    const ast = parse(`
    <script context="module">
      const a = "a";
    </script>
    <script>
      import { defineMessages } from 'svelte-i18n';
      defineMessages({ foo: { id: 'foo' }, bar: { id: 'bar' } })
      defineMessages({ baz: { id: 'baz' }, quix: { id: 'qux' } })
    </script>`);

    const definitions = collectMessageDefinitions(ast);

    expect(definitions).toHaveLength(4);
    definitions.forEach((definition) => {
      expect(definition).toMatchObject({ type: 'ObjectExpression' });
    });
  });

  it('gets message definitions if script only', () => {
    const ast = parse(`
    <script>
      import { defineMessages } from 'svelte-i18n';
      defineMessages({ foo: { id: 'foo' }, bar: { id: 'bar' } })
      defineMessages({ baz: { id: 'baz' }, quix: { id: 'qux' } })
    </script>`);

    const definitions = collectMessageDefinitions(ast);

    expect(definitions).toHaveLength(4);
    definitions.forEach((definition) => {
      expect(definition).toMatchObject({ type: 'ObjectExpression' });
    });
  });

  it('gets message definitions if module only', () => {
    const ast = parse(`
    <script context="module">
      import { defineMessages } from 'svelte-i18n';
      defineMessages({ foo: { id: 'foo' }, bar: { id: 'bar' } })
      defineMessages({ baz: { id: 'baz' }, quix: { id: 'qux' } })
    </script>`);

    const definitions = collectMessageDefinitions(ast);

    expect(definitions).toHaveLength(4);
    definitions.forEach((definition) => {
      expect(definition).toMatchObject({ type: 'ObjectExpression' });
    });
  });

  it('throws an error if an spread is found', () => {
    const ast = parse(`<script>
      import { defineMessages } from 'svelte-i18n';
      const potato = { foo: { id: 'foo' }, bar: { id: 'bar' } }
      defineMessages({ ...potato })
    </script>`);

    expect(() =>
      collectMessageDefinitions(ast),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Found invalid 'SpreadElement' at L4:23"`,
    );
  });
});

describe('collecting messages', () => {
  it('collects all messages in both instance and html ASTs', () => {
    const markup = `
    <script>
      import { _, defineMessages } from 'svelte-i18n';

      console.log($_({ id: 'foo' }))
      console.log($_({ id: 'page.title' }))

      const messages = defineMessages({
        enabled: { id: 'enabled' , default: 'Enabled' },
        disabled: { id: 'disabled', default:  'Disabled' }
      })
    </script>

    <div>{$_('msg_1')}</div>
    <div>{$_({id: 'msg_2'})}</div>
    <div>{$_('msg_3', { default: 'Message'})}</div>`;

    const messages = collectMessages(markup);

    expect(messages).toHaveLength(7);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'foo' }),
        expect.objectContaining({ id: 'msg_1' }),
        expect.objectContaining({ id: 'msg_2' }),
        expect.objectContaining({ id: 'msg_3', default: 'Message' }),
        expect.objectContaining({ id: 'page.title' }),
        expect.objectContaining({
          id: 'disabled',
          default: 'Disabled',
        }),
        expect.objectContaining({
          id: 'enabled',
          default: 'Enabled',
        }),
      ]),
    );
  });

  it('ignores non-static message ids', () => {
    const markup = `
    <script>
      import { _, defineMessages } from 'svelte-i18n';

      $_({ id: 'foo' + i })
      $_('bar' + i)
    </script>`;

    const messages = collectMessages(markup);

    expect(messages).toHaveLength(0);
  });
});

describe('messages extraction', () => {
  it('returns a object built based on all found message paths', () => {
    const markup = `<script>
      import { _ } from 'svelte-i18n';
    </script>

    <h1>{$_('title')}</h1>
    <h2>{$_({ id: 'subtitle'})}</h2>
    `;

    const dict = extractMessages(markup);

    expect(dict).toMatchObject({ title: '', subtitle: '' });
  });

  it('creates deep nested properties', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    <ul>
      <li>{$_('list.0')}</li>
      <li>{$_('list.1')}</li>
      <li>{$_('list.2')}</li>
    </ul>
    `;

    const dict = extractMessages(markup);

    expect(dict).toMatchObject({
      home: { page: { title: '', subtitle: '' } },
      list: ['', '', ''],
    });
  });

  it('creates a shallow dictionary', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    <ul>
      <li>{$_('list.0')}</li>
      <li>{$_('list.1')}</li>
      <li>{$_('list.2')}</li>
    </ul>
    `;

    const dict = extractMessages(markup, { shallow: true });

    expect(dict).toMatchObject({
      'home.page.title': '',
      'home.page.subtitle': '',
      'list.0': '',
      'list.1': '',
      'list.2': '',
    });
  });

  it('allow to pass a initial dictionary and only append non-existing props', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    <ul>
      <li>{$_('list.0')}</li>
      <li>{$_('list.1')}</li>
      <li>{$_('list.2')}</li>
    </ul>
    `;

    const dict = extractMessages(markup, {
      accumulator: {
        home: {
          page: {
            title: 'Page title',
          },
        },
      },
    });

    expect(dict).toMatchObject({
      home: {
        page: {
          title: 'Page title',
          subtitle: '',
        },
      },
      list: ['', '', ''],
    });
  });

  it('allow to pass a initial dictionary and only append shallow non-existing props', () => {
    const markup = `
    <script>import { _ } from 'svelte-i18n';</script>

    <h1>{$_('home.page.title')}</h1>
    <h2>{$_({ id: 'home.page.subtitle'})}</h2>
    `;

    const dict = extractMessages(markup, {
      shallow: true,
      accumulator: {
        'home.page.title': 'Page title',
      },
    });

    expect(dict).toMatchObject({
      'home.page.title': 'Page title',
      'home.page.subtitle': '',
    });
  });
});
