import { VNodeChildElement, h } from 'snabbdom/src/package/h';
import { VNodeData } from 'snabbdom/src/package/vnode';

export function createElement(
    tag: string | Function,
    props: Record<string, any>,
    ...children: VNodeChildElement[]
) {
    if (tag instanceof Function) return tag({ ...props, children });

    const data: VNodeData = {};

    for (const key in props) {
        const name = key.split('-');

        if (name.length > 1) {
            const newKey = name.slice(1).join('-');

            switch (name[0]) {
                case 'attrs':
                    (data.attrs = data.attrs || {})[newKey] = props[key];
                    break;
                case 'data':
                    (data.dataset = data.dataset || {})[newKey] = props[key];
            }
        } else (data.props = data.props || {})[key] = props[key];
    }

    return h(tag, data, !children[1] ? children[0] : children);
}
