/**
 * V-ORRA Scroll System
 * Native scrolling (no Lenis) for maximum performance
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Use native scrolling - no Lenis for maximum performance
        // Add smooth scroll behavior via CSS instead
        document.documentElement.style.scrollBehavior = 'smooth';

        // Handle anchor links with native smooth scroll
        this.handleAnchorLinks();

        // Enable GSAP lag smoothing
        gsap.ticker.lagSmoothing(500, 33);
    }

    handleAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');

                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    scrollTo(target, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    stop() {
        // No-op for native scrolling
    }

    start() {
        // No-op for native scrolling
    }

    destroy() {
        // No-op for native scrolling
    }

    get instance() {
        return null;
    }
}

// Create and export instance
export const smoothScroll = new SmoothScroll();
export const lenis = null; // No Lenis

// GSAP ScrollTrigger Defaults
ScrollTrigger.defaults({
    toggleActions: 'play none none reverse',
    markers: false
});

// Export GSAP utilities
export { gsap, ScrollTrigger };
