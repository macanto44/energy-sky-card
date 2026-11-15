// The editor ships as a second file next to the card; it is fetched on first use.

import { CARD_NAME, CARD_EDITOR_NAME } from './constants';

/**
 * Where the editor file lives: the card's own script URL with the file name
 * swapped, so the query string (?v=…, ?hacstag=…) and therefore the cache
 * version carry over. Without the card's script tag, a relative name.
 */
export function siblingBundleUrl(name: string, scripts: readonly { src: string }[]): string {
    const file = `${CARD_NAME}.js`;
    for (const { src } of scripts) {
        const url = new URL(src, 'http://local/');
        const at = url.pathname.lastIndexOf('/');
        if (url.pathname.slice(at + 1) !== file) continue;
        return src.replace(file, `${name}.js`);
    }
    return `${name}.js`;
}

let editorLoad: Promise<void> | undefined;

/** Fetch the editor file once; a failed attempt can be retried */
export function loadEditorBundle(): Promise<void> {
    if (customElements.get(CARD_EDITOR_NAME)) return Promise.resolve();
    editorLoad ??= new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = siblingBundleUrl(CARD_EDITOR_NAME, Array.from(document.scripts));
        script.addEventListener('load', () => customElements.get(CARD_EDITOR_NAME)
            ? resolve()
            : reject(new Error(`${script.src}: no editor registered`)));
        script.addEventListener('error', () => reject(new Error(`${script.src}: failed to load`)));
        document.head.append(script);
    }).catch(err => {
        editorLoad = undefined;
        throw err;
    });
    return editorLoad;
}
