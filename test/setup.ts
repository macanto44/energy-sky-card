// Runs before every test file. jsdom lacks window.matchMedia, which the card
// reads for prefers-reduced-motion: answer "no match" for every query.
// Tests that need another answer replace window.matchMedia themselves.

if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (media: string) => {
        const list = {
            matches: false,
            media,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
            dispatchEvent: () => false,
        };
        return list as unknown as MediaQueryList;
    };
}
