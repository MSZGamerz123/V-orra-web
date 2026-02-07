/**
 * V-ORRA GSAP Animations Setup
 * Scroll triggers and reveal animations
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
    // Refresh ScrollTrigger after images load
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // Hero animations only - these don't cause scroll lag
    initHeroAnimations();

    // Simple Intersection Observer based reveal (performant)
    initSimpleReveal();
}

function initHeroAnimations() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' }
    });

    tl.from('.hero-badge', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.5
    })
        .from('.hero-title', {
            opacity: 0,
            y: 50,
            duration: 1
        }, '-=0.3')
        .from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 0.8
        }, '-=0.5')
        .from('.hero-cta', {
            opacity: 0,
            y: 20,
            duration: 0.6
        }, '-=0.3')
        .from('.scroll-indicator', {
            opacity: 0,
            y: -20,
            duration: 0.6
        }, '-=0.2');
}

// Simple CSS-based reveal animations using Intersection Observer
// Much more performant than GSAP ScrollTrigger
function initSimpleReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .product-card');

    if (!revealElements.length) return;

    // Add initial hidden state via CSS class
    revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
    });

    // Use Intersection Observer for performant scroll detection
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                entry.target.classList.remove('reveal-hidden');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// DISABLED: These functions caused scroll lag
// Keeping them commented out for reference

/*
function initRevealAnimations() { ... }
function initParallaxEffects() { ... }
function initCounterAnimations() { ... }
function initStaggerAnimations() { ... }
*/



// Magnetic button effect
export function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-magnetic');

    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.8, // Slower, more fluid return
                ease: 'power3.out' // Soft easing, no bounce
            });
        });
    });
}

// Text split animation
export function splitText(element, type = 'chars') {
    const text = element.textContent;
    element.textContent = '';

    if (type === 'chars') {
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            element.appendChild(span);
        });
    } else if (type === 'words') {
        text.split(' ').forEach((word, i, arr) => {
            const span = document.createElement('span');
            span.textContent = word;
            span.style.display = 'inline-block';
            element.appendChild(span);
            if (i < arr.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });
    }

    return element.querySelectorAll('span');
}

// Scramble text effect
export function scrambleText(element, duration = 1) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const original = element.textContent;
    let iteration = 0;

    const interval = setInterval(() => {
        element.textContent = original
            .split('')
            .map((char, index) => {
                if (index < iteration) {
                    return original[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (iteration >= original.length) {
            clearInterval(interval);
        }

        iteration += 1 / 3;
    }, duration * 1000 / (original.length * 3));
}

// Loader animation
export function hideLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;

    const progress = loader.querySelector('.loader-progress');

    gsap.to(progress, {
        width: '100%',
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => {
                    loader.classList.add('hidden');
                }
            });
        }
    });
}

export { gsap, ScrollTrigger };
