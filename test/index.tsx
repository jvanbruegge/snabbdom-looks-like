import * as assert from 'assert';
import { h } from 'snabbdom/h';
import { assertLooksLike, looksLike, Wildcard } from '../src/index';
import Snabbdom from 'snabbdom-pragma';

describe('simpleTests', () => {
    it('should compare string nodes', () => {
        const vnode1 = 'Test';
        const vnode2 = 'Test';
        const vnode3 = 'Text';

        assertLooksLike(vnode1, vnode2);
        assert.throws(() => assertLooksLike(vnode1, vnode3));
        assert(looksLike(vnode1, vnode2));
        assert(!looksLike(vnode1, vnode3));
    });

    it('should compare simple div nodes', () => {
        const vnode1 = h('div', {}, 'Test');
        const vnode2 = h('div', {}, 'Test');
        const vnode3 = h('div', {}, 'Text');

        assertLooksLike(vnode1, vnode2);
        assert.throws(() => assertLooksLike(vnode1, vnode3));
        assert(looksLike(vnode1, vnode2));
        assert(!looksLike(vnode1, vnode3));
    });

    it('should compare nested nodes', () => {
        const vnode1 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('form', {}, [
                h('button.submit', {}, 'Submit')
            ])
        ]);
        const vnode2 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('form', {}, [
                h('button.submit', {}, 'Submit')
            ])
        ]);
        const vnode3 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('form', {}, [
                h('button.submit', {}, 'Sumit')
            ])
        ]);
        const vnode4 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('form.test', {}, [
                h('button.submit', {}, 'Sumit')
            ])
        ]);

        assertLooksLike(vnode1, vnode2);
        assert.throws(() => assertLooksLike(vnode1, vnode3));
        assert.throws(() => assertLooksLike(vnode1, vnode4));
        assert(looksLike(vnode1, vnode2));
        assert(!looksLike(vnode1, vnode3));
        assert(!looksLike(vnode1, vnode4));
    });

    it('should match Wildcards', () => {
        const vnode1 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('span', {}, 'Hello2'),
            h('span', {}, 'Hello3')
        ]);
        const vnode2 = h('div', {}, [
            Wildcard(),
            h('span', {}, 'Hello2'),
            h('span', {}, 'Hello3')
        ]);
        const vnode3 = h('div', {}, [
            Wildcard(),
            h('span', {}, 'Hello2'),
            Wildcard()
        ]);
        const vnode4 = h('div', {}, [
            Wildcard(),
            h('span', {}, 'Hello3')
        ]);
        const vnode5 = h('div', {}, [
            Wildcard(),
            h('span', {}, 'Hello1'),
            h('span', {}, 'Hello3')
        ]);

        assertLooksLike(vnode1, vnode2);
        assertLooksLike(vnode1, vnode3);
        assertLooksLike(vnode1, vnode4);
        assert.throws(() => assertLooksLike(vnode1, vnode5));
        assert.throws(() => assertLooksLike(vnode2, vnode1));
        assert(looksLike(vnode1, vnode2));
        assert(looksLike(vnode1, vnode3));
        assert(looksLike(vnode1, vnode4));
        assert(!looksLike(vnode1, vnode5));
        assert(!looksLike(vnode2, vnode1));
    });

    it('should match Wildcards with JSX', () => {
        const vnode1 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('span', {}, 'Hello2'),
            h('span', {}, 'Hello3')
        ]);
        const vnode2 = <div>
            <span>Hello</span>
            <span>Hello2</span>
            <span>Hello3</span>
        </div>;
        const vnode3 = h('div', {}, [
            Wildcard(),
            h('span', {}, 'Hello2'),
            h('span', {}, 'Hello3')
        ]);
        const vnode4 = <div>
            <Wildcard />
            <span>Hello2</span>
            <Wildcard />
        </div>
        const vnode5 = <div>
            <Wildcard />
            <span>Hello3</span>
        </div>

        assertLooksLike(vnode1, vnode2);
        assertLooksLike(vnode1, vnode3);
        assertLooksLike(vnode1, vnode4);
        assertLooksLike(vnode1, vnode5);
        assert.throws(() => assertLooksLike(vnode3, vnode1));
        assert(looksLike(vnode1, vnode2));
        assert(looksLike(vnode1, vnode3));
        assert(looksLike(vnode1, vnode4));
        assert(looksLike(vnode1, vnode5));
        assert(!looksLike(vnode3, vnode1));
    });
});
