## [4.0.1](https://github.com/kaisermann/svelte-i18n/compare/v3.7.4...v4.0.1) (2024-10-21)

### Features

- allow svelte@5 as peer dep ([#253](https://github.com/kaisermann/svelte-i18n/issues/253)) ([79c5fbb](https://github.com/kaisermann/svelte-i18n/commit/79c5fbbaa9bf62ee15c43de2a10fd24530eab5a3))

# [4.0.0](https://github.com/kaisermann/svelte-i18n/compare/v3.7.4...v4.0.0) (2023-10-16)

### Bug Fixes

- make package esm-only ([d54ee67](https://github.com/kaisermann/svelte-i18n/commit/d54ee678e14c7fdffe7be9ecda65813742aac95e))
- remove node 14 from tests ([458a759](https://github.com/kaisermann/svelte-i18n/commit/458a75901824a11d22a6917ffc41448f62cf7449))

### BREAKING CHANGES

- package is now esm-only

- chore(deps-dev): bump postcss from 8.4.29 to 8.4.31

Bumps [postcss](https://github.com/postcss/postcss) from 8.4.29 to 8.4.31.

- [Release notes](https://github.com/postcss/postcss/releases)
- [Changelog](https://github.com/postcss/postcss/blob/main/CHANGELOG.md)
- [Commits](https://github.com/postcss/postcss/compare/8.4.29...8.4.31)

## [3.7.4](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.7.4) (2023-09-04)

### Bug Fixes

- use named import for IntlMessageFormat ([fc837dc](https://github.com/kaisermann/svelte-i18n/commit/fc837dc154903d5dfc68845a9d53a28ee4eb193f))

## [3.7.3](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.7.3) (2023-09-03)

### Bug Fixes

- use IntlMessageFormat.resolveLocale ([2e42e58](https://github.com/kaisermann/svelte-i18n/commit/2e42e58d2f9e30000d3f1eebd98498ec27203528))

## [3.7.2](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.7.2) (2023-09-03)

### Chores

- use esbuild for bundling.

## [3.7.1](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.7.1) (2023-09-03)

### Bug Fixes

- validate `initialLocale` before using it ([#217](https://github.com/kaisermann/svelte-i18n/issues/217)) ([ebeec58](https://github.com/kaisermann/svelte-i18n/commit/ebeec58db57b01cd062cc215a14953fd63353e93))

# [3.7.0](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.7.0) (2023-07-04)

### Features

- add svelte@4 as peer dep ([c0b9fc0](https://github.com/kaisermann/svelte-i18n/commit/c0b9fc00c9f54412d78221be6050d6dcede22340))

# [3.6.0](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.6.0) (2022-11-25)

### Features

- add unwrapFunctionStore utility ([fafa641](https://github.com/kaisermann/svelte-i18n/commit/fafa641c8151c4ceb21a1d9558b535f9eb56dbf9))

## [3.5.2](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.5.2) (2022-11-23)

### Bug Fixes

- require node 16 ([bf622da](https://github.com/kaisermann/svelte-i18n/commit/bf622da160c555180e5f48e407d64d8b6d8ef6d7))

## [3.5.1](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.5.1) (2022-11-22)

### Bug Fixes

- better handling of --config CLI parameter ([124d4b7](https://github.com/kaisermann/svelte-i18n/commit/124d4b7b58adb48292829258db393931306d3fd0))
- make typescript strict and fix small issues ([7b49a74](https://github.com/kaisermann/svelte-i18n/commit/7b49a74f0fade6aaee42b4d137dc96d22ec55b2b))
- svelte.config not being loaded properly by CLI ([309896c](https://github.com/kaisermann/svelte-i18n/commit/309896cc7cca9018562eaa7f6845b64253900f54))

# [3.5.0](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.5.0) (2022-11-22)

### Bug Fixes

- better handling of --config CLI parameter ([124d4b7](https://github.com/kaisermann/svelte-i18n/commit/124d4b7b58adb48292829258db393931306d3fd0))
- make typescript strict and fix small issues ([7b49a74](https://github.com/kaisermann/svelte-i18n/commit/7b49a74f0fade6aaee42b4d137dc96d22ec55b2b))

## [3.4.1](https://github.com/kaisermann/svelte-i18n/compare/v3.4.0...v3.4.1) (2022-11-19)

### Bug Fixes

- make typescript strict and fix small issues ([7b49a74](https://github.com/kaisermann/svelte-i18n/commit/7b49a74f0fade6aaee42b4d137dc96d22ec55b2b))

# [3.4.0](https://github.com/kaisermann/svelte-i18n/compare/v3.3.13...v3.4.0) (2022-04-05)

### Features

- introduce handleMissingMessage ([#175](https://github.com/kaisermann/svelte-i18n/issues/175)) ([a8b5df0](https://github.com/kaisermann/svelte-i18n/commit/a8b5df0442466ef1d805fbc48b704974b846f52c))

## [3.3.13](https://github.com/kaisermann/svelte-i18n/compare/v3.3.12...v3.3.13) (2021-10-11)

### Bug Fixes

- check modules for defineMessages imports ([#163](https://github.com/kaisermann/svelte-i18n/issues/163)) ([ec939ab](https://github.com/kaisermann/svelte-i18n/commit/ec939ab6c645995312e7f07195532f60165a3e5a))

## [3.3.12](https://github.com/kaisermann/svelte-i18n/compare/v3.3.10...v3.3.12) (2021-09-30)

### Bug Fixes

- fallback delve to undefined for an undefined key ([64e8ae2](https://github.com/kaisermann/svelte-i18n/commit/64e8ae2bd3f9f10e3f3bfed6ef9cb6d8616b0caa))

## [3.3.11](https://github.com/kaisermann/svelte-i18n/compare/v3.3.10...v3.3.11) (2021-09-30)

### Bug Fixes

- fallback delve to undefined for an undefined key ([64e8ae2](https://github.com/kaisermann/svelte-i18n/commit/64e8ae2bd3f9f10e3f3bfed6ef9cb6d8616b0caa))

## [3.3.10](https://github.com/kaisermann/svelte-i18n/compare/v3.3.9...v3.3.10) (2021-08-24)

### Bug Fixes

- enable typescript strictNullChecks ([bf4189a](https://github.com/kaisermann/svelte-i18n/commit/bf4189a862e36b16242aa2bb8c68c6d1b59dc486))

## [3.3.9](https://github.com/kaisermann/svelte-i18n/compare/v3.3.8...v3.3.9) (2021-03-27)

### Bug Fixes

- 🐛 only set lang attr if lang is not nullish ([1c516c9](https://github.com/kaisermann/svelte-i18n/commit/1c516c9cda45e5a25dd466947804a5cc94734d22)), closes [#133](https://github.com/kaisermann/svelte-i18n/issues/133)

## [3.3.8](https://github.com/kaisermann/svelte-i18n/compare/v3.3.7...v3.3.8) (2021-03-27)

### Bug Fixes

- 🐛 support more specific fallback locale (i.e en-GB vs en) ([5db1dbc](https://github.com/kaisermann/svelte-i18n/commit/5db1dbc3a40f9a19585f63dbacd42846e599d927)), closes [#137](https://github.com/kaisermann/svelte-i18n/issues/137)

## [3.3.7](https://github.com/kaisermann/svelte-i18n/compare/v3.3.6...v3.3.7) (2021-03-17)

### Bug Fixes

- clear locale lookup cache when new messages are added ([#130](https://github.com/kaisermann/svelte-i18n/issues/130)) ([88ad5b2](https://github.com/kaisermann/svelte-i18n/commit/88ad5b21801eb54cbbb6a8cc9a02bb9b76bc1fbe))

## [3.3.6](https://github.com/kaisermann/svelte-i18n/compare/v3.3.4...v3.3.6) (2021-02-25)

### Bug Fixes

- 🐛 generated types directory ([396e181](https://github.com/kaisermann/svelte-i18n/commit/396e181e006819da11438f78a5c7f62cc415b5e0))
- 🐛 support deep properties keyed with dots ([980bc18](https://github.com/kaisermann/svelte-i18n/commit/980bc18f291e550c0e4acabf7f38c2ef04843987)), closes [#129](https://github.com/kaisermann/svelte-i18n/issues/129)

## [3.3.5](https://github.com/kaisermann/svelte-i18n/compare/v3.3.4...v3.3.5) (2021-02-21)

### Bug Fixes

- 🐛 support deep properties keyed with dots ([c13ed35](https://github.com/kaisermann/svelte-i18n/commit/c13ed35e5d735ef9a8dd9390c7646d9f5eda55f2)), closes [#129](https://github.com/kaisermann/svelte-i18n/issues/129)

## [3.3.4](https://github.com/kaisermann/svelte-i18n/compare/v3.3.2...v3.3.4) (2021-02-15)

### Bug Fixes

- crash if message has syntax error ([#128](https://github.com/kaisermann/svelte-i18n/issues/128)) ([0d623f9](https://github.com/kaisermann/svelte-i18n/commit/0d623f9884d831bc83b93eb01914628ca834ea1a))

## [3.3.3](https://github.com/kaisermann/svelte-i18n/compare/v3.3.2...v3.3.3) (2021-02-15)

## [3.3.2](https://github.com/kaisermann/svelte-i18n/compare/v3.3.1...v3.3.2) (2021-02-11)

### Bug Fixes

- expose intl-messageformat option `ignoreTag` and default to true for backwards compatibility. ([#121](https://github.com/kaisermann/svelte-i18n/issues/121)) ([341ed7f](https://github.com/kaisermann/svelte-i18n/commit/341ed7f3633447294919e4851c9db53b72bc94c3))

## [3.3.1](https://github.com/kaisermann/svelte-i18n/compare/v3.2.7...v3.3.1) (2021-02-11)

### Bug Fixes

- 🐛 default $json type to any ([41d8e4d](https://github.com/kaisermann/svelte-i18n/commit/41d8e4d28b68bb0ec61f2adf3152025086c1cc7c))

# [3.3.0](https://github.com/kaisermann/svelte-i18n/compare/v3.2.7...v3.3.0) (2020-11-24)

### Features

- 🎸 add $json method to get raw dictionary values ([52400b5](https://github.com/kaisermann/svelte-i18n/commit/52400b5c51213b45270da101aab6e8ae2bda024c)), closes [#109](https://github.com/kaisermann/svelte-i18n/issues/109) [#83](https://github.com/kaisermann/svelte-i18n/issues/83)

## [3.2.7](https://github.com/kaisermann/svelte-i18n/compare/v3.2.6...v3.2.7) (2020-11-23)

### Bug Fixes

- 🐛 message formatter type ([40e6dbe](https://github.com/kaisermann/svelte-i18n/commit/40e6dbe8f7490c57b70dc96f525530f046abcda1)), closes [#109](https://github.com/kaisermann/svelte-i18n/issues/109)

## [3.2.6](https://github.com/kaisermann/svelte-i18n/compare/v3.2.5...v3.2.6) (2020-11-20)

### Changed

- Don't minify CLI for better debugging.

## [3.2.5](https://github.com/kaisermann/svelte-i18n/compare/v3.2.4...v3.2.5) (2020-11-08)

### Bug Fixes

- 🐛 regression of flat keys separated by dot ([d87caef](https://github.com/kaisermann/svelte-i18n/commit/d87caef0600be10727222a2cfbe7ff391fb8ff4c))

## [3.2.4](https://github.com/kaisermann/svelte-i18n/compare/v3.2.3...v3.2.4) (2020-11-07)

### Bug Fixes

- 🐛 possible interpolation value types ([0caaead](https://github.com/kaisermann/svelte-i18n/commit/0caaead4789a62daef4ea73361506a9f135b80e7))

## [3.2.3](https://github.com/kaisermann/svelte-i18n/compare/v3.2.2...v3.2.3) (2020-11-06)

### Bug Fixes

- 🐛 prevent extraction of non-deterministic message ids ([9b6adb6](https://github.com/kaisermann/svelte-i18n/commit/9b6adb6538329ecba1e32e2acdca2c4761c1d99c)), closes [#89](https://github.com/kaisermann/svelte-i18n/issues/89)

## [3.2.2](https://github.com/kaisermann/svelte-i18n/compare/v3.2.1...v3.2.2) (2020-11-05)

### Bug Fixes

- 🐛 update estree-walker and intl-messageformat ([44e71d7](https://github.com/kaisermann/svelte-i18n/commit/44e71d72aba1cb3263ea009932df27dd39d86cb3))

## [3.2.1](https://github.com/kaisermann/svelte-i18n/compare/v3.2.0...v3.2.1) (2020-11-05)

### Bug Fixes

- 🐛 interpolate values for default values and missing keys ([330f20b](https://github.com/kaisermann/svelte-i18n/commit/330f20b7bd55af1e565de7ba0449a03cc24738aa)), closes [#101](https://github.com/kaisermann/svelte-i18n/issues/101)

# [3.2.0](https://github.com/kaisermann/svelte-i18n/compare/v3.1.0...v3.2.0) (2020-11-05)

### Features

- 🎸 Support getting deep localized objects/arrays ([ff54136](https://github.com/kaisermann/svelte-i18n/commit/ff541367f85a28ad69bb34beb145ce404b1a9240)), closes [#83](https://github.com/kaisermann/svelte-i18n/issues/83)

# [3.1.0](https://github.com/kaisermann/svelte-i18n/compare/v3.0.4...v3.1.0) (2020-09-20)

### Bug Fixes

- export correct configuration type ([68e8c51](https://github.com/kaisermann/svelte-i18n/commit/68e8c51a636910bbe0619350b7d8ad6fabe13c7d))

## [3.0.4](https://github.com/kaisermann/svelte-i18n/compare/v3.0.3...v3.0.4) (2020-05-31)

### Bug Fixes

- 🐛 also wait for loaders added while loading ([e560514](https://github.com/kaisermann/svelte-i18n/commit/e560514b1d957b2c4fc9b1a4f412ab93cf31d21a))

## [3.0.3](https://github.com/kaisermann/svelte-i18n/compare/v3.0.2...v3.0.3) (2020-03-29)

### Bug Fixes

- 🐛 prevent server from breaking on locale.set ([07ef1da](https://github.com/kaisermann/svelte-i18n/commit/07ef1da6d5177854b4707d5f038f5a14562e6bf5)), closes [#55](https://github.com/kaisermann/svelte-i18n/issues/55)

## [3.0.2](https://github.com/kaisermann/svelte-i18n/compare/v3.0.1...v3.0.2) (2020-03-06)

### Bug Fixes

- 🐛 ignore loadingDelay for the initialLocale ([9d82a98](https://github.com/kaisermann/svelte-i18n/commit/9d82a98e8d6ecf25dca12cce88183502e11133fe)), closes [#53](https://github.com/kaisermann/svelte-i18n/issues/53) [#53](https://github.com/kaisermann/svelte-i18n/issues/53)

## [3.0.1](https://github.com/kaisermann/svelte-i18n/compare/v2.3.1...v3.0.1) (2020-02-03)

### Features

- 🎸 add runtime typings ([7bf47d8](https://github.com/kaisermann/svelte-i18n/commit/7bf47d879006ffeec51ec112f20c74c72abe87ff)), closes [#43](https://github.com/kaisermann/svelte-i18n/issues/43)
- 🎸 make date,time and number formatters tree-shakeable ([6526245](https://github.com/kaisermann/svelte-i18n/commit/6526245bf9d40d25af14ec1e7acb34772a9f3f0e))
- 🎸 make getClientLocale tree-shakeable ([31b556b](https://github.com/kaisermann/svelte-i18n/commit/31b556bc3f77bc5b581541976a82f898a398c01a))

### BREAKING CHANGES

- It's now needed to explicitly import the `getClientLocale` method to use
  its heuristics when setting the initial locale. This makes the method
  and its helpers to be tree-shakeable.

```js
import { init, getClientLocale } from 'svelte-i18n'

init({
  initialLocale: getClientLocale({ ... })
})
```

- Changes completely the API. Now, to format a number, date or time, the
  developer must explicitly import the formatter store:

`import { time, date, number } from 'svelte-i18n'`

# [3.0.0](https://github.com/kaisermann/svelte-i18n/compare/v2.3.1...v3.0.0) (2020-02-03)

### Features

- 🎸 add runtime typings ([90bf171](https://github.com/kaisermann/svelte-i18n/commit/90bf171139ad6b55faa0e36b3d28d317de538985)), closes [#43](https://github.com/kaisermann/svelte-i18n/issues/43)
- 🎸 make date,time and number formatters tree-shakeable ([fb82a40](https://github.com/kaisermann/svelte-i18n/commit/fb82a400f349d8d997c1d14f8d16b1d5c8da7f3e))
- 🎸 make getClientLocale tree-shakeable ([4881acb](https://github.com/kaisermann/svelte-i18n/commit/4881acb7b3a9aacd64b0f00f3b85fd736aa53316))

### BREAKING CHANGES

- It's now needed to explicitly import the `getClientLocale` method to use
  its heuristics when setting the initial locale. This makes the method
  and its helpers to be tree-shakeable.

```js
import { init, getClientLocale } from 'svelte-i18n'

init({
  initialLocale: getClientLocale({ ... })
})
```

- Changes completely the API. Now, to format a number, date or time, the
  developer must explicitly import the formatter store:

`import { time, date, number } from 'svelte-i18n'`

## [2.3.1](https://github.com/kaisermann/svelte-i18n/compare/v2.3.0...v2.3.1) (2020-01-29)

### Bug Fixes

- 🐛 types from v3 branch leaking to master branch :shrug: ([88f7762](https://github.com/kaisermann/svelte-i18n/commit/88f7762e96c4eae963722bdedf601afbce4b2f17))
- memoizing of formatters when no locale is given. ([#47](https://github.com/kaisermann/svelte-i18n/issues/47)) ([27871f9](https://github.com/kaisermann/svelte-i18n/commit/27871f9775a96e0a2627a143635d4f4750b9f945))

# [2.3.0](https://github.com/kaisermann/svelte-i18n/compare/v2.2.4...v2.3.0) (2020-01-23)

### Features

- 🎸 add runtime typings ([dadeaa2](https://github.com/kaisermann/svelte-i18n/commit/dadeaa2e7fa0d0447135f76a5c70273238fc1da0)), closes [#43](https://github.com/kaisermann/svelte-i18n/issues/43)

## [2.2.4](https://github.com/kaisermann/svelte-i18n/compare/v2.2.2...v2.2.4) (2020-01-21)

## [2.2.3](https://github.com/kaisermann/svelte-i18n/compare/v2.2.2...v2.2.3) (2020-01-15)

### Refactor

- 💡 remove deepmerge and dlv dependencies ([270aefa](https://github.com/kaisermann/svelte-i18n/commit/270aefa1998d89215d8bdd1f813bdb9c690a5a2c))

## [2.2.2](https://github.com/kaisermann/svelte-i18n/compare/v2.2.0...v2.2.2) (2020-01-14)

### Bug Fixes

- 🐛 lookup message not caching correctly ([bb8c68f](https://github.com/kaisermann/svelte-i18n/commit/bb8c68f2eb7bbe658a40dc528b471ffadd5f92df))
- 🐛 mjs causing an elusive bug in webpack module resolution ([b2dc782](https://github.com/kaisermann/svelte-i18n/commit/b2dc7828c55b23be05adb0791816cc7bc9910af2)), closes [#36](https://github.com/kaisermann/svelte-i18n/issues/36)

## [2.2.1](https://github.com/kaisermann/svelte-i18n/compare/v2.2.0...v2.2.1) (2020-01-08)

### Bug Fixes

- 🐛 lookup message not caching correctly ([b9b6fa4](https://github.com/kaisermann/svelte-i18n/commit/b9b6fa41ffd99b89fc117c44a5bc636335c63632))

# [2.2.0](https://github.com/kaisermann/svelte-i18n/compare/v2.1.1...v2.2.0) (2020-01-07)

### Bug Fixes

- 🐛 make message formatter default to current locale ([0c57b9b](https://github.com/kaisermann/svelte-i18n/commit/0c57b9b568ba60216c4c96931da19dea97d998c4))

### Features

- add low level API to get access to the formatters ([#31](https://github.com/kaisermann/svelte-i18n/issues/31)) ([86cca99](https://github.com/kaisermann/svelte-i18n/commit/86cca992515809b1767d648293d395562dc2946a))

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
