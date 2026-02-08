/**
 * V-ORRA Founders Page
 * Subtle animations for leadership section
 */

import '../../styles/base.css';
import '../../styles/cursor.css';
import '../../styles/founders.css';
import '../../styles/transitions.css';

import { PageTransition } from '../transitions.js';

import { CustomCursor } from '../cursor.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAnimations, hideLoader } from '../animations/gsap-setup.js';

gsap.registerPlugin(ScrollTrigger);

class FoundersPage {
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

        // Initialize founder card animations
        this.initFounderAnimations();

        // Initialize parallax effects
        this.initParallax();

        // Initialize value cards
        this.initValueCards();
    }

    initNav() {
        const nav = document.querySelector('.glass-nav');
        const toggle = document.querySelector('.mobile-menu-toggle');
        const links = document.querySelector('.nav-links');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav?.classList.add('scrolled');
            } else {
                nav?.classList.remove('scrolled');
            }
        });

        if (toggle && links) {
            toggle.addEventListener('click', () => {
                links.classList.toggle('active');
                toggle.classList.toggle('active');
                const expanded = links.classList.contains('active');
                toggle.setAttribute('aria-expanded', expanded);
            });
        }
    }

    initFounderAnimations() {
        // Founder cards
        gsap.utils.toArray('.founder-card').forEach((card, index) => {
            const visual = card.querySelector('.founder-visual');
            const info = card.querySelector('.founder-info');
            const avatar = card.querySelector('.founder-avatar');
            const highlights = card.querySelectorAll('.highlight-item');
            const quote = card.querySelector('.founder-quote');

            const isReverse = card.classList.contains('reverse');

            ScrollTrigger.create({
                trigger: card,
                start: 'top 70%',
                onEnter: () => {
                    // Animate visual
                    gsap.from(visual, {
                        x: isReverse ? 100 : -100,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out'
                    });

                    // Animate avatar
                    gsap.from(avatar, {
                        scale: 0.5,
                        opacity: 0,
                        duration: 0.8,
                        delay: 0.3,
                        ease: 'back.out(1.5)'
                    });

                    // Animate avatar ring
                    const ring = avatar.querySelector('.avatar-ring');
                    if (ring) {
                        gsap.from(ring, {
                            scale: 0,
                            opacity: 0,
                            duration: 1,
                            delay: 0.5,
                            ease: 'power3.out'
                        });
                    }

                    // Animate info
                    gsap.from(info, {
                        x: isReverse ? -100 : 100,
                        opacity: 0,
                        duration: 1,
                        delay: 0.2,
                        ease: 'power3.out'
                    });

                    // Animate highlights
                    gsap.from(highlights, {
                        y: 20,
                        opacity: 0,
                        stagger: 0.1,
                        duration: 0.5,
                        delay: 0.6,
                        ease: 'power3.out'
                    });

                    // Animate quote
                    if (quote) {
                        gsap.from(quote, {
                            y: 30,
                            opacity: 0,
                            duration: 0.8,
                            delay: 0.8,
                            ease: 'power3.out'
                        });
                    }
                }
            });
        });
    }

    initParallax() {
        // Data lines parallax
        gsap.utils.toArray('.data-line').forEach((line, i) => {
            gsap.to(line, {
                scrollTrigger: {
                    trigger: '.founders-hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                },
                x: (i + 1) * 100,
                ease: 'none'
            });
        });

        // Avatar glow parallax
        gsap.utils.toArray('.avatar-glow').forEach(glow => {
            gsap.to(glow, {
                scrollTrigger: {
                    trigger: glow,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                scale: 1.3,
                ease: 'none'
            });
        });

        // Gradient orbs
        gsap.utils.toArray('.gradient-orb').forEach((orb, i) => {
            gsap.to(orb, {
                scrollTrigger: {
                    trigger: orb.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                y: (i + 1) * -150,
                ease: 'none'
            });
        });
    }

    initValueCards() {
        const valueCards = document.querySelectorAll('.value-card');

        valueCards.forEach((card, i) => {
            // Initial reveal animation
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%'
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.15,
                ease: 'power3.out'
            });

            // Number animation
            const number = card.querySelector('.value-number');
            if (number) {
                gsap.from(number, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%'
                    },
                    opacity: 0,
                    scale: 0.5,
                    duration: 0.6,
                    delay: i * 0.15 + 0.3,
                    ease: 'power3.out'
                });
            }

            // Hover interaction
            card.addEventListener('mouseenter', () => {
                gsap.to(number, {
                    opacity: 0.4,
                    scale: 1.1,
                    duration: 0.3
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(number, {
                    opacity: 0.2,
                    scale: 1,
                    duration: 0.3
                });
            });
        });
    }
}

// Initialize
new FoundersPage();
