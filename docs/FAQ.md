##### `'this' keyword is equivalent to 'undefined'`

When using `Rollup` as a bundler, you're possibly seeing this warning. It's related to the output of the typescript compiler used to transpile the `intl-messageformat` package. In this case, it's harmless and you can learn to live with it on your terminal or teach your rollup to ignore this kind of warning:

```js
// modified version of onwarn provided by sapper projects
const onwarn = (warning, onwarn) => {
  if (
    (warning.code === 'CIRCULAR_DEPENDENCY' &&
      /[/\\]@sapper[/\\]/.test(warning.message))
  ) {
    return
  }

  // ignores the annoying this is undefined warning
  if(warning.code === 'THIS_IS_UNDEFINED') {
    return
  }

  onwarn(warning)
}

export default {
  client: {
    ...,
    onwarn,
  },
  server: {
    ...,
    onwarn,
  },
}

```

##### `How can I use svelte-i18n with SvelteKit?`

You can find a guide on how to use `svelte-i18n` with `SvelteKit` [here](/docs/Svelte-Kit.md).

##### `Can I use the formatter functions outside of a Svelte component?`

Yes, you can! Since the exported formatters are stores, you need to subscribe to them to get the value. `svelte-i18n` provides a utility method called `unwrapFunctionStore`  to help you with that:

```js
// some-file.js
import { unwrapFunctionStore, format, formatNumber } from 'svelte-i18n';

const $formatNumber = unwrapFunctionStore(formatNumber);
const $format = unwrapFunctionStore(format);

console.log(
  $formatNumber(1000, 'en-US', { style: 'currency', currency: 'USD' }),
); // $1,000.00
console.log($format('Hello {name}', { name: 'John' }, 'en-US')); // Hello John
```
