/**
 * iOS 26 Liquid Glass Effects Module
 * Handles spotlight tracking, ripple effects, and liquid animations
 */

export class LiquidGlassEffects {
    constructor() {
        this.spotlightElements = [];
        this.rippleElements = [];
        this.isInitialized = false;

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initSpotlightEffect();
        this.initRippleEffect();
        this.initParallaxGlass();
        this.isInitialized = true;

        console.log('Liquid Glass Effects initialized');
    }

    /**
     * Spotlight Effect - Follows mouse cursor on glass elements
     */
    initSpotlightEffect() {
        this.spotlightElements = document.querySelectorAll('.liquid-spotlight');

        this.spotlightElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                element.style.setProperty('--mouse-x', `${x}%`);
                element.style.setProperty('--mouse-y', `${y}%`);
            });

            element.addEventListener('mouseleave', () => {
                element.style.setProperty('--mouse-x', '-100%');
                element.style.setProperty('--mouse-y', '-100%');
            });
        });
    }

    /**
     * Ripple Click Effect
     */
    initRippleEffect() {
        this.rippleElements = document.querySelectorAll('.liquid-ripple-click');

        this.rippleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Create ripple element
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;

                element.appendChild(ripple);

                // Remove ripple after animation
                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            });
        });
    }

    /**
     * Parallax Glass Effect - Subtle 3D tilt on hover
     */
    initParallaxGlass() {
        const parallaxElements = document.querySelectorAll('.liquid-card, .liquid-glass-ios');

        parallaxElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Increased divisor for subtle, premium feel (was 30)
                const rotateX = (y - centerY) / 60;
                const rotateY = (centerX - x) / 60;

                element.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateY(-8px)
          scale(1.02)
        `;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }

    /**
     * Refresh effects after dynamic content changes
     */
    refresh() {
        this.initSpotlightEffect();
        this.initRippleEffect();
        this.initParallaxGlass();
    }

    /**
     * Destroy all event listeners
     */
    destroy() {
        // Event listeners are automatically cleaned up when elements are removed
        this.isInitialized = false;
    }
}

// Auto-initialize
const liquidGlassEffects = new LiquidGlassEffects();

export default liquidGlassEffects;
