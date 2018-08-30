# snabbdom-looks-like

Makes it easy to assert if to virtual DOM trees look similar

## Usage

```jsx
import { assertLooksLike, Wildcard } from 'snabbdom-looks-like';
import { h } from 'snabbdom/h';
import { div, span } from '@cycle/dom'; // or other hyperscript helpers
import Snabbdom from 'snabbdom-pragma'; // for JSX

import * as assert from 'assert';

it('simple Test', () => {
    const expected = div([
        span('hello')
    ]);

    const actual = h('div', {}, [
        h('span', {}. 'hello')
    ]);

    assertLooksLike(actual, expected);
});

it('supports wildcards', () => {
    const expected = div([
        Wildcard(),
        span('', {}, 'hello'),
        Wildcard(),
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

    assertLooksLike(matches, expected);
    assert.throws(() => assertLooksLike(doesNotMatch, expected));
});

it('also works with JSX', () => {
    const expected = <div>
        <Wildcard />,
        <span>hello</span>,
        <Wildcard />,
    </div>;

    const actualHyperscript = h('div', {}, [
        h('span', {}, 'hello'),
        h('span', {}, 'this gets matched to the wildcard!!!!'),
        h('span', {}, 'this too!!!!')
    ]);

    const actualJSX = <div>
        <span>hello</span>
        <span>this gets matched to the wildcard!!!!</span>
        <span>this too!!!!</span>
    </div>;

    assertLooksLike(actualHyperscript, expected);
    assertLooksLike(actualJSX, expected);
});

it('can expect attributes', () => {
    const expected = <div>
        <span className="test">Test</span>
    </div>;

    const actual = h('div', {}, [
        h('span', { props: { className: 'test' }}, 'Test')
    ]);

    assertLooksLike(actual, expected);
});
```
