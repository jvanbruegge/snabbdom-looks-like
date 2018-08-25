import { VNode } from 'snabbdom/vnode';

const wildcardSymbol: any = Symbol();

export function wildcard() {
    return wildcardSymbol;
}

const e1 = 'Wildcards are only allowed in the expected vtree';
const e2 = (a: any, e: any) => `Text node mismatched, actual: "${a}", expected: "${e}"`;
const e3 = (a: any, e: any) => `Cannot compare different types, actual: ${a} (${typeof a}), expected: ${e} (${typeof e})`;
const e4 = (a: any, e: any) => `Text property not matching, actual: "${a.text}", expected: "${e.text}"`
const e5 = (a: any, e: any) => `Node selectors are not matching, actual: "${a.sel}", expected: "${e.sel}"`
const e6 = (a: any, e: any) => `Not enough children, actual: ${a.children.length}, expected at least: ${e.children.length}`;
const e7 = 'Two consequtive wildcards are not allowed';
const e8 = 'Could not match children';

export function looksLike(actual: VNode | string, expected: VNode | string | Symbol): void {
    if(typeof actual === 'symbol') {
        throw new Error(e1);
    }

    if(typeof actual === 'string' && typeof expected === 'string') {
        if(actual === expected) {
            return;
        } else {
            throw new Error(e2(actual, expected));
        }
    } else if(typeof actual === 'string' || typeof expected === 'string') {
        throw new Error(e3(actual, expected));
    }

    if(isObj(actual) && typeof expected === 'symbol') {
        return;
    }
    else if(isObj(actual) && isObj(expected)) {
        if(actual.sel === expected.sel) {
            if(actual.text !== expected.text) {
                throw new Error(e4(actual, expected));
            }
        } else {
            throw new Error(e5(actual, expected));
        }

        if(Array.isArray(actual.children) && Array.isArray(expected.children)) {
            if(expected.children.length > actual.children.length) {
                throw new Error(e6(actual, expected));
            }
            if(expected.children.reduce((a: any, c: any) => a == 1 ? (c === wildcardSymbol ? 2 : 0) : (a === 2 ? 2 : (c === wildcardSymbol ? 1 : 0)), 0) === 2) {
                throw new Error(e7);
            }

            const tries = replicateWildcards(actual.children, expected.children);
            let success = true;

            for(let i = 0; i < tries.length; i++) {
                success = true;

                for(let j = 0; j < tries[i].length; j++) {
                    try {
                        looksLike(actual.children[j], tries[i][j]);
                    } catch (e) {
                        success = false;
                        break;
                    }
                }

                if(success) {
                    break;
                }
            }
            if(!success) {
                throw new Error(e8);
            }
        }
    }
}

function splitOn<T>(arr: T[], div: any): T[][] {
    const i = arr.indexOf(div);
    if(i === -1) { return [arr]; }
    return [arr.slice(0, i)].concat(splitOn(arr.slice(i + 1), div));
}

function replicateWildcards<T>(actual: T[], expected: T[]): T[][] {
    const n = expected.filter(e => e === wildcardSymbol).length;
    const k = actual.length - (expected.length - n);

    const split = splitOn<T>(expected, wildcardSymbol);
    const distributions = getDistributions(Array(n).fill(0), k);

    let result: T[][] = [];

    for(let i = 0; i < distributions.length; i++) {
        let curr = split[0];
        for(let j = 0; j < distributions[i].length; j++) {
            curr = curr.concat(Array(distributions[i][j]).fill(wildcardSymbol));
            curr = curr.concat(split[j + 1]);
        }
        result.push(curr);
    }

    return result;
}

function getDistributions(arr: number[], k: number): number[][] {
    if(k === 0) {
        return [arr];
    }
    const n = arr.length;
    let result: number[][] = [];
    for(let i = 0; i < n; i++) {
        let a = arr.slice(0);
        a[i]++;
        result = result.concat(getDistributions(a, k - 1));
    }
    return result;
}

function isObj(a: any): a is VNode {
    return typeof a === 'object';
}

export function looksLikeBool(actual: VNode | string, expected: VNode | string): boolean {
    try {
        looksLike(actual, expected);
        return true;
    } catch (e) {
        return false;
    }
}
