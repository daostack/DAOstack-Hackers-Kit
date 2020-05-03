# spawn-command-with-kill

Adds cross-platform `kill` function to spawn-command processes

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencyci-badge]][dependencyci]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npm-stat]
[![MIT License][license-badge]][LICENSE]

[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Donate][donate-badge]][donate]
[![Code of Conduct][coc-badge]][coc]
[![Roadmap][roadmap-badge]][roadmap]
[![Examples][examples-badge]][examples]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

[`spawn-command`](https://npmjs.com/package/spawn-command) is a cross platform solution to node's `spawn`. However, it
doesn't provide a mechanism for "killing" the process after it's begun (in a cross platform manner).

## This solution

This solution provides a `kill` function on the `child` returned from `spawn` which will kill the corresponding process
when invoked. It does not work with `spawn.sync` as the process will be finished before your code could run anyway.

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and should
be installed as one of your project's `dependencies`:

```
npm install --save spawn-command-with-kill
```

## Usage

```javascript
const spawn = require('spawn-command-with-kill')
const child = spawn('webpack')
child.kill() // <-- that's the ✨ magic ✨ extra function
```

## Inspiration

Big thank you goes to [@mysticatea](https://github.com/mysticatea) for his original work on
[npm-run-all](https://github.com/mysticatea/npm-run-all) from which
[this project was derived](https://github.com/mysticatea/npm-run-all/issues/59).

## Other Solutions

There's a version of this module for
[`cross-spawn`](https://github.com/IndigoUnited/node-cross-spawn) called
[`cross-spawn-with-kill`](https://github.com/kentcdodds/cross-spawn-with-kill).

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub>Kent C. Dodds</sub>](https://kentcdodds.com)<br />[💻](https://github.com/kentcdodds/spawn-command-with-kill/commits?author=kentcdodds) [📖](https://github.com/kentcdodds/spawn-command-with-kill/commits?author=kentcdodds) 🚇 [⚠️](https://github.com/kentcdodds/spawn-command-with-kill/commits?author=kentcdodds) | [<img src="https://avatars.githubusercontent.com/u/1937871?v=3" width="100px;"/><br /><sub>Toru Nagashima</sub>](https://plus.google.com/u/0/+ToruNagashimax/)<br />[💻](https://github.com/kentcdodds/spawn-command-with-kill/commits?author=mysticatea) |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification. Contributions of any kind welcome!

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/kentcdodds/spawn-command-with-kill.svg?style=flat-square
[build]: https://travis-ci.org/kentcdodds/spawn-command-with-kill
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/spawn-command-with-kill.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/spawn-command-with-kill
[dependencyci-badge]: https://dependencyci.com/github/kentcdodds/spawn-command-with-kill/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/kentcdodds/spawn-command-with-kill
[version-badge]: https://img.shields.io/npm/v/spawn-command-with-kill.svg?style=flat-square
[package]: https://www.npmjs.com/package/spawn-command-with-kill
[downloads-badge]: https://img.shields.io/npm/dm/spawn-command-with-kill.svg?style=flat-square
[npm-stat]: http://npm-stat.com/charts.html?package=spawn-command-with-kill&from=2016-04-01
[license-badge]: https://img.shields.io/npm/l/spawn-command-with-kill.svg?style=flat-square
[license]: https://github.com/kentcdodds/spawn-command-with-kill/blob/master/other/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[donate]: http://kcd.im/donate
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/spawn-command-with-kill/blob/master/other/CODE_OF_CONDUCT.md
[roadmap-badge]: https://img.shields.io/badge/%F0%9F%93%94-roadmap-CD9523.svg?style=flat-square
[roadmap]: https://github.com/kentcdodds/spawn-command-with-kill/blob/master/other/ROADMAP.md
[examples-badge]: https://img.shields.io/badge/%F0%9F%92%A1-examples-8C8E93.svg?style=flat-square
[examples]: https://github.com/kentcdodds/spawn-command-with-kill/blob/master/other/EXAMPLES.md
[github-watch-badge]: https://img.shields.io/github/watchers/kentcdodds/spawn-command-with-kill.svg?style=social
[github-watch]: https://github.com/kentcdodds/spawn-command-with-kill/watchers
[github-star-badge]: https://img.shields.io/github/stars/kentcdodds/spawn-command-with-kill.svg?style=social
[github-star]: https://github.com/kentcdodds/spawn-command-with-kill/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20spawn-command-with-kill!%20https://github.com/kentcdodds/spawn-command-with-kill%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/kentcdodds/spawn-command-with-kill.svg?style=social
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
