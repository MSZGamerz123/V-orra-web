/**
 * V-ORRA Page Transitions
 * Smooth, cinematic transitions between pages
 */

class PageTransition {
    constructor() {
        this.overlay = null;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        // Create transition overlay
        this.createOverlay();

        // Intercept all internal links
        this.interceptLinks();

        // Handle page load animation
        this.handlePageLoad();
    }

    onCreate(callback) {
        this.createCallback = callback;
    }

    createOverlay() {
        // Create main overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition';
        this.overlay.innerHTML = `
      <div class="transition-layer layer-1"></div>
      <div class="transition-layer layer-2"></div>
      <div class="transition-layer layer-3"></div>
    `;

        document.body.appendChild(this.overlay);
    }

    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            if (!link) return;

            const href = link.getAttribute('href');

            // Skip if external link, anchor, or javascript
            if (!href ||
                href.startsWith('http') ||
                href.startsWith('#') ||
                href.startsWith('javascript') ||
                href.startsWith('mailto') ||
                link.target === '_blank') {
                return;
            }

            // Skip if modifier key pressed
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;

            e.preventDefault();
            this.navigateTo(href);
        });
    }

    onExit(callback) {
        this.exitCallback = callback;
    }

    async navigateTo(url) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Trigger cleanup if registered
        if (this.exitCallback) {
            try {
                this.exitCallback();
            } catch (e) {
                console.error('Exit callback failed:', e);
            }
        }

        // Start exit animation
        await this.animateOut();

        // Set transitioning flag immediately before navigation
        sessionStorage.setItem('vorra-transitioning', 'true');

        // Navigate to new page
        window.location.href = url;
    }

    animateOut() {
        return new Promise((resolve) => {
            this.overlay.classList.add('active', 'exiting');

            // Wait for animation
            setTimeout(resolve, 800); // Increased duration for smoothness
        });
    }

    handlePageLoad() {
        // Critical: Check immediately to catch the transition state
        // This prevents the "stutter" or flash of unstyled content
        const wasTransitioning = sessionStorage.getItem('vorra-transitioning');

        if (wasTransitioning) {
            // Immediately add class to body to prevent FOUC
            document.documentElement.classList.add('is-transitioning');

            sessionStorage.removeItem('vorra-transitioning');
            this.overlay.classList.add('active', 'entering');

            // Smoother entry sequence
            requestAnimationFrame(() => {
                // Remove the opacity hide constraint after overlay is confirmed ready
                setTimeout(() => {
                    document.documentElement.classList.remove('is-transitioning');
                    this.animateIn();
                }, 50);
            });
        }
    }

    animateIn() {
        // Soften the reveal
        this.overlay.classList.add('reveal');

        setTimeout(() => {
            this.overlay.classList.remove('active', 'entering', 'exiting', 'reveal');
            this.isTransitioning = false;
        }, 1000); // Longer, softer fade out
    }
}

// Export for use in pages
export { PageTransition };


