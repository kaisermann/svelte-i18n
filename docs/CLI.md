`svelte-i18n` provides a command-line interface to extract all your messages to the `stdout` or to a specific JSON file.

```bash
$ svelte-i18n extract [options] <glob-pattern> [output-file]
```

### Options

- `-s, --shallow` - extract all messages to a shallow object, without creating nested objects. Default: `false`.

- `--overwrite` - overwrite the content of the `output` file instead of just appending missing properties. Default: `false`.

- `-c, --config` - define the path of a `svelte.config.js` in case your svelte components need to be preprocessed.
