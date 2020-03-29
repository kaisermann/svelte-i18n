## [3.0.3](https://github.com/kaisermann/svelte-i18n/compare/v3.0.2...v3.0.3) (2020-03-29)


### Bug Fixes

* 🐛 prevent server from breaking on locale.set ([07ef1da](https://github.com/kaisermann/svelte-i18n/commit/07ef1da6d5177854b4707d5f038f5a14562e6bf5)), closes [#55](https://github.com/kaisermann/svelte-i18n/issues/55)



## [3.0.2](https://github.com/kaisermann/svelte-i18n/compare/v3.0.1...v3.0.2) (2020-03-06)


### Bug Fixes

* 🐛 ignore loadingDelay for the initialLocale ([9d82a98](https://github.com/kaisermann/svelte-i18n/commit/9d82a98e8d6ecf25dca12cce88183502e11133fe)), closes [#53](https://github.com/kaisermann/svelte-i18n/issues/53) [#53](https://github.com/kaisermann/svelte-i18n/issues/53)



## [3.0.1](https://github.com/kaisermann/svelte-i18n/compare/v2.3.1...v3.0.1) (2020-02-03)


### Features

* 🎸 add runtime typings ([7bf47d8](https://github.com/kaisermann/svelte-i18n/commit/7bf47d879006ffeec51ec112f20c74c72abe87ff)), closes [#43](https://github.com/kaisermann/svelte-i18n/issues/43)
* 🎸 make date,time and number formatters tree-shakeable ([6526245](https://github.com/kaisermann/svelte-i18n/commit/6526245bf9d40d25af14ec1e7acb34772a9f3f0e))
* 🎸 make getClientLocale tree-shakeable ([31b556b](https://github.com/kaisermann/svelte-i18n/commit/31b556bc3f77bc5b581541976a82f898a398c01a))


### BREAKING CHANGES

* It's now needed to explicitly import the `getClientLocale` method to use
its heuristics when setting the initial locale. This makes the method
and its helpers to be tree-shakeable.

```js
import { init, getClientLocale } from 'svelte-i18n'

init({
  initialLocale: getClientLocale({ ... })
})
```
* Changes completely the API. Now, to format a number, date or time, the
developer must explicitly import the formatter store:

`import { time, date, number } from 'svelte-i18n'`



# [3.0.0](https://github.com/kaisermann/svelte-i18n/compare/v2.3.1...v3.0.0) (2020-02-03)


### Features

* 🎸 add runtime typings ([90bf171](https://github.com/kaisermann/svelte-i18n/commit/90bf171139ad6b55faa0e36b3d28d317de538985)), closes [#43](https://github.com/kaisermann/svelte-i18n/issues/43)
* 🎸 make date,time and number formatters tree-shakeable ([fb82a40](https://github.com/kaisermann/svelte-i18n/commit/fb82a400f349d8d997c1d14f8d16b1d5c8da7f3e))
* 🎸 make getClientLocale tree-shakeable ([4881acb](https://github.com/kaisermann/svelte-i18n/commit/4881acb7b3a9aacd64b0f00f3b85fd736aa53316))


### BREAKING CHANGES

* It's now needed to explicitly import the `getClientLocale` method to use
its heuristics when setting the initial locale. This makes the method
and its helpers to be tree-shakeable.

```js
import { init, getClientLocale } from 'svelte-i18n'

init({
  initialLocale: getClientLocale({ ... })
})
```
* Changes completely the API. Now, to format a number, date or time, the
developer must explicitly import the formatter store:

`import { time, date, number } from 'svelte-i18n'`



## [2.3.1](https://github.com/kaisermann/svelte-i18n/compare/v2.3.0...v2.3.1) (2020-01-29)


### Bug Fixes

* 🐛 types from v3 branch leaking to master branch :shrug: ([88f7762](https://github.com/kaisermann/svelte-i18n/commit/88f7762e96c4eae963722bdedf601afbce4b2f17))
* memoizing of formatters when no locale is given. ([#47](https://github.com/kaisermann/svelte-i18n/issues/47)) ([27871f9](https://github.com/kaisermann/svelte-i18n/commit/27871f9775a96e0a2627a143635d4f4750b9f945))



# [2.3.0](https://github.com/kaisermann/svelte-i18n/compare/v2.2.4...v2.3.0) (2020-01-23)


### Features

* 🎸 add runtime typings ([dadeaa2](https://github.com/kaisermann/svelte-i18n/commit/dadeaa2e7fa0d0447135f76a5c70273238fc1da0)), closes [#43](https://github.com/kaisermann/svelte-i18n/issues/43)



## [2.2.4](https://github.com/kaisermann/svelte-i18n/compare/v2.2.2...v2.2.4) (2020-01-21)



## [2.2.3](https://github.com/kaisermann/svelte-i18n/compare/v2.2.2...v2.2.3) (2020-01-15)

### Refactor

* 💡 remove deepmerge and dlv dependencies ([270aefa](https://github.com/kaisermann/svelte-i18n/commit/270aefa1998d89215d8bdd1f813bdb9c690a5a2c))


## [2.2.2](https://github.com/kaisermann/svelte-i18n/compare/v2.2.0...v2.2.2) (2020-01-14)


### Bug Fixes

* 🐛 lookup message not caching correctly ([bb8c68f](https://github.com/kaisermann/svelte-i18n/commit/bb8c68f2eb7bbe658a40dc528b471ffadd5f92df))
* 🐛 mjs causing an elusive bug in webpack module resolution ([b2dc782](https://github.com/kaisermann/svelte-i18n/commit/b2dc7828c55b23be05adb0791816cc7bc9910af2)), closes [#36](https://github.com/kaisermann/svelte-i18n/issues/36)



## [2.2.1](https://github.com/kaisermann/svelte-i18n/compare/v2.2.0...v2.2.1) (2020-01-08)


### Bug Fixes

* 🐛 lookup message not caching correctly ([b9b6fa4](https://github.com/kaisermann/svelte-i18n/commit/b9b6fa41ffd99b89fc117c44a5bc636335c63632))



# [2.2.0](https://github.com/kaisermann/svelte-i18n/compare/v2.1.1...v2.2.0) (2020-01-07)


### Bug Fixes

* 🐛 make message formatter default to current locale ([0c57b9b](https://github.com/kaisermann/svelte-i18n/commit/0c57b9b568ba60216c4c96931da19dea97d998c4))


### Features

* add low level API to get access to the formatters ([#31](https://github.com/kaisermann/svelte-i18n/issues/31)) ([86cca99](https://github.com/kaisermann/svelte-i18n/commit/86cca992515809b1767d648293d395562dc2946a))



## [2.1.1](https://github.com/kaisermann/svelte-i18n/compare/v2.1.0...v2.1.1) (2019-12-02)

### Bug Fixes

- 🐛 fix conflict artifacts ([feb7ab9](https://github.com/kaisermann/svelte-i18n/commit/feb7ab9deadc97041e2d8a3364137f1fa13ed89b))

# [2.1.0](https://github.com/kaisermann/svelte-i18n/compare/v2.1.0-alpha.2...v2.1.0) (2019-11-30)

### Bug Fixes

- 🐛 allow to wait for initial locale load ([0b7f61c](https://github.com/kaisermann/svelte-i18n/commit/0b7f61c49a1c3206bbb5d9c77dfb5819a85d4bb5))
- 🐛 fallback behaviour and simplify API contact points ([64e69eb](https://github.com/kaisermann/svelte-i18n/commit/64e69eb3c0f62754570429a87450ff53eb29973a))
- 🐛 consider generic locales when registering loaders ([1b0138c](https://github.com/kaisermann/svelte-i18n/commit/1b0138c3f3458c4d8f0b30b4550652e8e0317fc7))
- 🐛 flush use the same promise if it wasn't resolved yet ([66972d4](https://github.com/kaisermann/svelte-i18n/commit/66972d4b1536b53d33c7974eb0fc059c0d0cc46c))
- client locale parameters typo ([#11](https://github.com/kaisermann/svelte-i18n/issues/11)) ([d1adf4c](https://github.com/kaisermann/svelte-i18n/commit/d1adf4c00a48ed679ae34a2bffc8ca9d709a2d5c))

### Features

- 🎸 add warnOnMissingMessages ([efbe793](https://github.com/kaisermann/svelte-i18n/commit/efbe793a0f3656b27d050886d85e06e9327ea681))

- 🐛 fallback behaviour and simplify API contact points ([6e0df2f](https://github.com/kaisermann/svelte-i18n/commit/6e0df2fb25e1bf9038eb4252ba993541a7fa2b4a)

- 🎸 `addMessagesTo` method ([d6b8664](https://github.com/kaisermann/svelte-i18n/commit/d6b8664009d738870aa3f0a4bd80e96abf6e6e59))
- 🎸 add \$loading indicator store ([bd2b350](https://github.com/kaisermann/svelte-i18n/commit/bd2b3501e9caa2e73f64835fedf93dc8939d41de))
- 🎸 add custom formats support ([d483244](https://github.com/kaisermann/svelte-i18n/commit/d483244a9f2bb5ba63ef8be95f0e87030b5cbc7e))
- 🎸 add pathname and hostname pattern matching ([b19b690](https://github.com/kaisermann/svelte-i18n/commit/b19b69050e252120016d47540e108f6eea193c37))
- 🎸 add preloadLocale method ([0a0e4b3](https://github.com/kaisermann/svelte-i18n/commit/0a0e4b3bab74499d684c86e17c949160762ae19b))
- 🎸 add waitInitialLocale helper ([6ee28e7](https://github.com/kaisermann/svelte-i18n/commit/6ee28e7d279c62060e834699714685567b6ab67c))
- 🎸 also look for message in generic locale ([e5d7b84](https://github.com/kaisermann/svelte-i18n/commit/e5d7b84241bd7e3fdd833e82dd8a9a8f251f023c)), closes [#19](https://github.com/kaisermann/svelte-i18n/issues/19)
- 🎸 export a store listing all locales available ([f58a20b](https://github.com/kaisermann/svelte-i18n/commit/f58a20b21eb58f891b3f9912cb6fff11eb329083))
- 🎸 locale change automatically updates the document lang ([64c8e55](https://github.com/kaisermann/svelte-i18n/commit/64c8e55f80636a1185a1797fe486b4189ff56944))

### Performance Improvements

- ⚡️ delay the \$loading state change for quick loadings ([6573f51](https://github.com/kaisermann/svelte-i18n/commit/6573f51e9b817db0c77f158945572f4ba14c71fc))

### BREAKING CHANGES

- This PR modifies the formatter method arguments.
