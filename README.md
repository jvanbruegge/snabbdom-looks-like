# snabbdom-looks-like

Makes it easy to assert if to virtual DOM trees look similar

## Usage

```js
import { looksLike, wildcard } from 'snabbdom-looks-like';
import { h } from 'snabbdom/h';
import { div, span } from '@cycle/dom'; // or other hyperscript helpers

import * as assert from 'assert';

it('simple Test', () => {
    const expected = div([
        span('hello')
    ]);

    const actual = h('div', {}, [
        h('span', {}. 'hello')
    ]);

    looksLike(actual, expected);
});

it('supports wildcards', () => {
    const expected = div([
        wildcard(),
        span('', {}, 'hello'),
        wildcard(),
        div('.red')
    ]);

    const matches = h('div', {}, [
        h('span', {}, 'hello'),
        h('span', {}, 'this gets matched to the wildcard!!!!'),
        h('span', {}, 'this too!!!!'),
        h('div.red')
    ]);

    const doesNotMatch = const matches = h('div', {}, [
        h('span', {}, 'hello'),
        h('span', {}, 'this gets matched to the wildcard!!!!'),
        h('span', {}, 'this too!!!!'),
        h('div.blue')
    ]);

    looksLike(actual, matches);
    assert.throws(() => looksLike(actual, doesNotMatch));
});
```
