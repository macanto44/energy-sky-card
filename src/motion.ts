// Whether the card's animations run, hold or never start: the tab's
// visibility, the card's place on screen (IntersectionObserver, 100 px
// ahead) and the reduced-motion setting.

export type Motion = 'on' | 'paused' | 'off';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** The rule, on its own: off beats paused beats on */
export function motionState(o: { animate: boolean; reducedMotion: boolean; tabHidden: boolean; offscreen: boolean }): Motion {
    if (!o.animate || o.reducedMotion) return 'off';
    if (o.tabHidden || o.offscreen) return 'paused';
    return 'on';
}

/**
 * Watches the tab, the card's place on screen and the reduced-motion
 * setting while the card is connected, and writes the result to the
 * host's data-motion attribute.
 */
export class MotionController {
    private hiddenTab = false;
    private outOfView = false;
    private reducedMotion = false;
    private animate = true;
    private observer?: IntersectionObserver;
    private media?: MediaQueryList;
    private onVisibility = () => { this.hiddenTab = document.hidden; this.apply(); };
    private onMedia = (e: MediaQueryListEvent) => { this.reducedMotion = e.matches; this.apply(); };

    constructor(private host: HTMLElement) {}

    setAnimate(animate: boolean): void {
        this.animate = animate;
        this.apply();
    }

    /** Call from connectedCallback */
    start(): void {
        this.stop();
        this.hiddenTab = document.hidden;
        document.addEventListener('visibilitychange', this.onVisibility);
        if (typeof window.matchMedia === 'function') {
            this.media = window.matchMedia(REDUCED_MOTION);
            this.reducedMotion = this.media.matches;
            this.media.addEventListener?.('change', this.onMedia);
        }
        // Off-screen cards pause too; the margin resumes them just before they scroll into view
        if ('IntersectionObserver' in window) {
            const margin = '100px';
            this.observer = new IntersectionObserver(entries => {
                const latest = entries.at(-1);
                if (latest) this.outOfView = !latest.isIntersecting;
                this.apply();
            }, { rootMargin: margin });
            this.observer.observe(this.host);
        }
        this.apply();
    }

    /** Call from disconnectedCallback: a detached card holds still */
    stop(): void {
        document.removeEventListener('visibilitychange', this.onVisibility);
        this.media?.removeEventListener?.('change', this.onMedia);
        this.media = undefined;
        this.observer?.disconnect();
        this.observer = undefined;
        this.outOfView = false;
    }

    get state(): Motion {
        return motionState({ animate: this.animate, reducedMotion: this.reducedMotion, tabHidden: this.hiddenTab, offscreen: this.outOfView });
    }

    private apply(): void {
        const state = this.state;
        if (this.host.dataset.motion !== state) this.host.dataset.motion = state;
    }
}
