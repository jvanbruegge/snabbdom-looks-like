import { VNode } from 'snabbdom/vnode';
import * as jsdiff from 'diff';

export function Wildcard(): VNode {
    return {
        sel: '',
        elm: undefined,
        text: undefined,
        key: undefined,
        children: [],
        data: {
            isWildcard: true
        }
    };
}

function isWildcard(vnode: any) {
    return typeof vnode === 'object' && vnode.data && vnode.data.isWildcard;
}

export function assertLooksLike(
    actual: VNode | string,
    expected: VNode | string | Symbol,
    longError = false
): void {
    function prettyPrintError(
        message: string
    ): (actual: any, expected: any) => string {
        return (actual, expected) => {
            const a = removeGrandchildren(actual);
            const e = isWildcard(expected)
                ? expected
                : removeGrandchildren(expected);
            const eString = isWildcard(e)
                ? 'WILDCARD'
                : JSON.stringify(e, null, 2);
            const aString = JSON.stringify(a, null, 2);

            return (
                message +
                '\n' +
                jsdiff
                    .createTwoFilesPatch('', '', eString, aString, '', '')
                    .split('\n')
                    .slice(5)
                    .filter(s => s.indexOf('No newline at end of file') === -1)
                    .filter(
                        s =>
                            !(s.startsWith('-') && s.indexOf('WILDCARD') !== -1)
                    )
                    .map(
                        s =>
                            !(s.startsWith('+') || s.startsWith('-'))
                                ? '         ' + s
                                : s
                    )
                    .map(
                        s => (s.startsWith('-') ? 'expected: ' + s.slice(1) : s)
                    )
                    .map(
                        s => (s.startsWith('+') ? 'actual:   ' + s.slice(1) : s)
                    )
                    .join('\n') +
                (longError
                    ? '\n\n' +
                      'actual:\n' +
                      aString +
                      '\n\n' +
                      'expected:\n' +
                      eString
                    : '')
            );
        };
    }

    const e1 = 'Wildcards are only allowed in the expected vtree';
    const e2 = prettyPrintError('Text node mismatched');
    const e3 = prettyPrintError('Cannot compare different types');
    const e4 = prettyPrintError('Text property not matching');
    const e5 = prettyPrintError('Node selectors are not matching');
    const e6 = prettyPrintError('Not enough children');
    const e7 = 'Two consequtive wildcards are not allowed';
    const e8 = prettyPrintError('Could not match children');
    const e9 = prettyPrintError('Children mismatched');
    const e10 = prettyPrintError('Attributes mismatched');

    if (isWildcard(actual)) {
        throw new Error(e1);
    }

    if (typeof actual === 'string' && typeof expected === 'string') {
        if (actual === expected) {
            return;
        } else {
            throw new Error(e2(actual, expected));
        }
    } else if (typeof actual === 'string' || typeof expected === 'string') {
        throw new Error(e3(actual, expected));
    }

    if (isObj(actual) && isWildcard(expected)) {
        return;
    } else if (isObj(actual) && isObj(expected)) {
        const actualSels = (actual.sel || '').split(/\.|#/);
        const expectedSels = (expected.sel || '').split(/\.|#/);
        const isSubset = expectedSels.reduce(
            (acc, curr) => acc && actualSels.indexOf(curr) !== -1,
            true
        );
        if (isSubset) {
            if (actual.text !== expected.text) {
                throw new Error(e4(actual, expected));
            }
            if (!objectMatches(actual.data, expected.data)) {
                throw new Error(e10(actual, expected));
            }
        } else {
            throw new Error(e5(actual, expected));
        }

        if (
            Array.isArray(actual.children) &&
            Array.isArray(expected.children)
        ) {
            if (
                expected.children.filter(s => !isWildcard(s)).length >
                actual.children.length
            ) {
                throw new Error(e6(actual, expected));
            }
            if (
                expected.children.reduce(
                    (a: any, c: any) =>
                        a == 1
                            ? isWildcard(c)
                                ? 2
                                : 0
                            : a === 2
                                ? 2
                                : isWildcard(c)
                                    ? 1
                                    : 0,
                    0
                ) === 2
            ) {
                throw new Error(e7);
            }

            const tries = replicateWildcards(
                actual.children,
                expected.children
            );
            let success = true;
            let lastError = '';

            for (let i = 0; i < tries.length; i++) {
                success = true;

                if (tries[i].length !== actual.children.length) {
                    throw new Error(
                        e9(tries[i].length, actual.children.length)
                    );
                }

                for (let j = 0; j < tries[i].length; j++) {
                    try {
                        assertLooksLike(
                            actual.children[j],
                            tries[i][j],
                            longError
                        );
                    } catch (e) {
                        lastError = e.message;
                        success = false;
                        break;
                    }
                }

                if (success) {
                    break;
                }
            }
            if (!success) {
                throw new Error(lastError);
            }
        }
    }
}

function removeGrandchildren(vnode: VNode) {
    return {
        ...vnode,
        children: vnode.children
            ? vnode.children
                  .map(
                      c =>
                          typeof c === 'object'
                              ? {
                                    ...c,
                                    children: '...'
                                }
                              : c
                  )
                  .map(c => (isWildcard(c) ? 'WILDCARD' : c))
            : []
    };
}

function objectMatches(actual: any, expected: any): boolean {
    if (!expected) {
        return true;
    }
    if (typeof expected !== typeof actual) {
        return false;
    }
    if (typeof actual === 'object' && typeof expected === 'object') {
        for (let k in expected) {
            if (!objectMatches(actual[k], expected[k])) {
                return false;
            }
        }
        return true;
    }
    if (Array.isArray(expected) && Array.isArray(actual)) {
        if (expected.length === actual.length) {
            for (let i = 0; i < expected.length; i++) {
                if (!objectMatches(actual[i], expected[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    return actual === expected;
}

function splitOn<T>(arr: T[], div: (a: any) => boolean): T[][] {
    const i = arr.map(div).indexOf(true);
    if (i === -1) {
        return [arr];
    }
    return [arr.slice(0, i)].concat(splitOn(arr.slice(i + 1), div));
}

function replicateWildcards<T>(actual: T[], expected: T[]): T[][] {
    const n = expected.filter(isWildcard).length;
    const k = actual.length - (expected.length - n);

    if (k === 0) {
        return [expected.filter(e => !isWildcard(e))];
    }

    const split = splitOn<T>(expected, isWildcard);
    const distributions = getDistributions(Array(n).fill(0), k);

    let result: T[][] = [];

    for (let i = 0; i < distributions.length; i++) {
        let curr = split[0];
        for (let j = 0; j < distributions[i].length; j++) {
            curr = curr.concat(Array(distributions[i][j]).fill(Wildcard()));
            curr = curr.concat(split[j + 1]);
        }
        result.push(curr);
    }

    return result;
}

function getDistributions(arr: number[], k: number): number[][] {
    if (k === 0) {
        return [arr];
    }
    const n = arr.length;
    let result: number[][] = [];
    for (let i = 0; i < n; i++) {
        let a = arr.slice(0);
        a[i]++;
        result = result.concat(getDistributions(a, k - 1));
    }
    return result;
}

function isObj(a: any): a is VNode {
    return typeof a === 'object';
}

export function looksLike(
    actual: VNode | string,
    expected: VNode | string
): boolean {
    try {
        assertLooksLike(actual, expected);
        return true;
    } catch (e) {
        return false;
    }
}
