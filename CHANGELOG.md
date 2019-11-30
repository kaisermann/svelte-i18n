# [2.1.0](https://github.com/kaisermann/svelte-i18n/compare/v2.1.0-alpha.2...v2.1.0) (2019-11-30)



# [2.1.0-alpha.2](https://github.com/kaisermann/svelte-i18n/compare/v2.0.2...v2.1.0-alpha.2) (2019-11-29)


### Bug Fixes

* 🐛 allow to wait for initial locale load ([0b7f61c](https://github.com/kaisermann/svelte-i18n/commit/0b7f61c49a1c3206bbb5d9c77dfb5819a85d4bb5))


### Features

* 🎸 add warnOnMissingMessages ([efbe793](https://github.com/kaisermann/svelte-i18n/commit/efbe793a0f3656b27d050886d85e06e9327ea681))



## [2.0.2](https://github.com/kaisermann/svelte-i18n/compare/v2.0.0...v2.0.2) (2019-11-24)


### Bug Fixes

* 🐛 fallback behaviour and simplify API contact points ([6e0df2f](https://github.com/kaisermann/svelte-i18n/commit/6e0df2fb25e1bf9038eb4252ba993541a7fa2b4a))
* 🐛 fallback locale being looked twice ([9260b83](https://github.com/kaisermann/svelte-i18n/commit/9260b83756b9bb2811be48817190510fa24cb2ff))



## [2.0.1](https://github.com/kaisermann/svelte-i18n/compare/v2.0.0...v2.0.1) (2019-11-24)


### Bug Fixes

* 🐛 fallback behaviour and simplify API contact points ([64e69eb](https://github.com/kaisermann/svelte-i18n/commit/64e69eb3c0f62754570429a87450ff53eb29973a))



# [2.0.0](https://github.com/kaisermann/svelte-i18n/compare/v1.1.2-beta...v2.0.0) (2019-11-22)


### Bug Fixes

* 🐛 consider generic locales when registering loaders ([1b0138c](https://github.com/kaisermann/svelte-i18n/commit/1b0138c3f3458c4d8f0b30b4550652e8e0317fc7))
* 🐛 flush use the same promise if it wasn't resolved yet ([66972d4](https://github.com/kaisermann/svelte-i18n/commit/66972d4b1536b53d33c7974eb0fc059c0d0cc46c))
* client locale parameters typo ([#11](https://github.com/kaisermann/svelte-i18n/issues/11)) ([d1adf4c](https://github.com/kaisermann/svelte-i18n/commit/d1adf4c00a48ed679ae34a2bffc8ca9d709a2d5c))


### Features

* 🎸 `addMessagesTo` method ([d6b8664](https://github.com/kaisermann/svelte-i18n/commit/d6b8664009d738870aa3f0a4bd80e96abf6e6e59))
* 🎸 add $loading indicator store ([bd2b350](https://github.com/kaisermann/svelte-i18n/commit/bd2b3501e9caa2e73f64835fedf93dc8939d41de))
* 🎸 add custom formats support ([d483244](https://github.com/kaisermann/svelte-i18n/commit/d483244a9f2bb5ba63ef8be95f0e87030b5cbc7e))
* 🎸 add pathname and hostname pattern matching ([b19b690](https://github.com/kaisermann/svelte-i18n/commit/b19b69050e252120016d47540e108f6eea193c37))
* 🎸 add preloadLocale method ([0a0e4b3](https://github.com/kaisermann/svelte-i18n/commit/0a0e4b3bab74499d684c86e17c949160762ae19b))
* 🎸 add waitInitialLocale helper ([6ee28e7](https://github.com/kaisermann/svelte-i18n/commit/6ee28e7d279c62060e834699714685567b6ab67c))
* 🎸 also look for message in generic locale ([e5d7b84](https://github.com/kaisermann/svelte-i18n/commit/e5d7b84241bd7e3fdd833e82dd8a9a8f251f023c)), closes [#19](https://github.com/kaisermann/svelte-i18n/issues/19)
* 🎸 export a store listing all locales available ([f58a20b](https://github.com/kaisermann/svelte-i18n/commit/f58a20b21eb58f891b3f9912cb6fff11eb329083))
* 🎸 locale change automatically updates the document lang ([64c8e55](https://github.com/kaisermann/svelte-i18n/commit/64c8e55f80636a1185a1797fe486b4189ff56944))


### Performance Improvements

* ⚡️ delay the $loading state change for quick loadings ([6573f51](https://github.com/kaisermann/svelte-i18n/commit/6573f51e9b817db0c77f158945572f4ba14c71fc))


### BREAKING CHANGES

* This PR modifies the formatter method arguments.



