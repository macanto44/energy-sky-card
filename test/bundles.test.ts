import { describe, it, expect } from 'vitest';
import { siblingBundleUrl } from '../src/bundles';

describe('siblingBundleUrl', () => {
    const editor = 'energy-sky-card-editor';

    it('keeps the Marketplace ?v= cache buster', () => {
        const scripts = [{ src: 'https://ha.local/local/community/energy-sky-card/energy-sky-card.js?v=0.1.0' }];
        expect(siblingBundleUrl(editor, scripts)).toBe('https://ha.local/local/community/energy-sky-card/energy-sky-card-editor.js?v=0.1.0');
    });

    it('keeps the HACS ?hacstag= cache buster', () => {
        const scripts = [{ src: 'https://ha.local/hacsfiles/energy-sky-card/energy-sky-card.js?hacstag=123' }];
        expect(siblingBundleUrl(editor, scripts)).toBe('https://ha.local/hacsfiles/energy-sky-card/energy-sky-card-editor.js?hacstag=123');
    });

    it('ignores other scripts and falls back to a relative URL', () => {
        expect(siblingBundleUrl(editor, [{ src: 'https://ha.local/other-card.js' }])).toBe('energy-sky-card-editor.js');
    });
});
