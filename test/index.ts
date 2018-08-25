import * as assert from 'assert';
import { h } from 'snabbdom/h';
import { looksLike, looksLikeBool, wildcard } from '../src/index';

describe('simpleTests', () => {
    it('should compare string nodes', () => {
        const vnode1 = 'Test';
        const vnode2 = 'Test';
        const vnode3 = 'Text';

        assert.doesNotThrow(() => looksLike(vnode1, vnode2));
        assert.throws(() => looksLike(vnode1, vnode3));
        assert(looksLikeBool(vnode1, vnode2));
        assert(!looksLikeBool(vnode1, vnode3));
    });

    it('should compare simple div nodes', () => {
        const vnode1 = h('div', {}, 'Test');
        const vnode2 = h('div', {}, 'Test');
        const vnode3 = h('div', {}, 'Text');

        assert.doesNotThrow(() => looksLike(vnode1, vnode2));
        assert.throws(() => looksLike(vnode1, vnode3));
        assert(looksLikeBool(vnode1, vnode2));
        assert(!looksLikeBool(vnode1, vnode3));
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

        assert.doesNotThrow(() => looksLike(vnode1, vnode2));
        assert.throws(() => looksLike(vnode1, vnode3));
        assert.throws(() => looksLike(vnode1, vnode4));
        assert(looksLikeBool(vnode1, vnode2));
        assert(!looksLikeBool(vnode1, vnode3));
        assert(!looksLikeBool(vnode1, vnode4));
    });

    it('should match wildcards', () => {
        const vnode1 = h('div', {}, [
            h('span', {}, 'Hello'),
            h('span', {}, 'Hello2'),
            h('span', {}, 'Hello3')
        ]);
        const vnode2 = h('div', {}, [
            wildcard(),
            h('span', {}, 'Hello2'),
            h('span', {}, 'Hello3')
        ]);
        const vnode3 = h('div', {}, [
            wildcard(),
            h('span', {}, 'Hello2'),
            wildcard()
        ]);
        const vnode4 = h('div', {}, [
            wildcard(),
            h('span', {}, 'Hello3')
        ]);
        const vnode5 = h('div', {}, [
            wildcard(),
            h('span', {}, 'Hello1'),
            h('span', {}, 'Hello3')
        ]);

        assert.doesNotThrow(() => {
            looksLike(vnode1, vnode2);
            looksLike(vnode1, vnode3);
            looksLike(vnode1, vnode4);
        });
        assert.throws(() => looksLike(vnode1, vnode5));
        assert.throws(() => looksLike(vnode2, vnode1));
        assert(looksLikeBool(vnode1, vnode2));
        assert(looksLikeBool(vnode1, vnode3));
        assert(looksLikeBool(vnode1, vnode4));
        assert(!looksLikeBool(vnode1, vnode5));
        assert(!looksLikeBool(vnode2, vnode1));
    });
});
