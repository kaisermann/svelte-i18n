`import { dictionary } from 'svelte-i18n'`

### `$dictionary`

The `$dictionary` store is responsible for holding all loaded message definitions for each locale. A dictionary of messages can be a shallow or deep object:

###### `en-shallow.json`

```json
{
  "title": "Sign up",
  "field.name": "Name",
  "field.birth": "Date of birth",
  "field.genre": "Genre"
}
```

###### `en-deep.json`

```json
{
  "title": "Sign up",
  "field": {
    "name": "Name",
    "birth": "Date of birth",
    "genre": "Genre"
  }
}
```

It's recommended to use the [`addMessages()`](/docs/Methods.md#addmessages) and [`register()`](/docs/Methods.md#register) methods to add new message dictionaries to your app.
