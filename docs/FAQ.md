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
