/**
 * V-ORRA Products Page
 * Product 3D interactions
 */

import '../../styles/base.css';
import '../../styles/cursor.css';
import '../../styles/products.css';
import '../../styles/transitions.css';

import { PageTransition } from '../transitions.js';

import { CustomCursor } from '../cursor.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAnimations, hideLoader } from '../animations/gsap-setup.js';

gsap.registerPlugin(ScrollTrigger);

class ProductsPage {
    constructor() {
        this.init();
    }

    init() {
        // Initialize cursor
        new CustomCursor();

        // Initialize transitions
        new PageTransition();

        // Initialize animations
        initAnimations();

        // Hide loader
        window.addEventListener('load', () => {
            setTimeout(hideLoader, 500);
        });

        // Initialize nav
        this.initNav();

        // Initialize model controls
        this.initModelControls();

        // Initialize scroll animations
        this.initScrollAnimations();

        // Handle hash navigation
        this.handleHashNavigation();
    }

    initNav() {
        const nav = document.querySelector('.nav');
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');

        // Use requestAnimationFrame for scroll performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 100) {
                        nav?.classList.add('scrolled');
                    } else {
                        nav?.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        toggle?.addEventListener('click', () => {
            links?.classList.toggle('active');
        });
    }

    initModelControls() {
        const modelBtns = document.querySelectorAll('.model-btn');

        modelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const modelContainer = btn.closest('.product-3d-container');
                const model = modelContainer?.querySelector('.model-placeholder > div');

                if (action === 'rotate' && model) {
                    // Toggle rotation animation
                    if (model.style.animationPlayState === 'paused') {
                        model.style.animationPlayState = 'running';
                    } else {
                        model.style.animationPlayState = 'paused';
                    }
                }

                if (action === 'explode' && model) {
                    // Toggle exploded view
                    model.classList.toggle('exploded');
                }
            });
        });
    }

    initScrollAnimations() {
        // Product sections reveal - animations play once and stay visible
        gsap.utils.toArray('.product-section').forEach((section, index) => {
            const visual = section.querySelector('.product-3d-container');
            const info = section.querySelector('.product-info');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 75%',
                    toggleActions: 'play none none none' // Play once, never reverse
                }
            });

            if (index % 2 === 0) {
                tl.from(visual, { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' })
                    .from(info, { x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' }, '-=0.5');
            } else {
                tl.from(visual, { x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' })
                    .from(info, { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' }, '-=0.5');
            }
        });

        // Feature items stagger
        gsap.utils.toArray('.product-features').forEach(features => {
            gsap.from(features.querySelectorAll('.feature-item'), {
                scrollTrigger: {
                    trigger: features,
                    start: 'top 80%'
                },
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out'
            });
        });

        // Specs table reveal
        gsap.utils.toArray('.product-specs-table').forEach(table => {
            gsap.from(table, {
                scrollTrigger: {
                    trigger: table,
                    start: 'top 85%'
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Comparison table
        const comparisonTable = document.querySelector('.comparison-table');
        if (comparisonTable) {
            gsap.from(comparisonTable.querySelectorAll('tr'), {
                scrollTrigger: {
                    trigger: comparisonTable,
                    start: 'top 80%'
                },
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power3.out'
            });
        }
    }

    handleHashNavigation() {
        // Scroll to section if hash present
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    }
}

// Initialize
new ProductsPage();
