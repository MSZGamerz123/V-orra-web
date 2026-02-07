/**
 * V-ORRA No Horn Zone Page
 * Interactive demo and animations
 */

import '../../styles/base.css';
import '../../styles/cursor.css';
import '../../styles/pages.css';
import '../../styles/transitions.css';

import { PageTransition } from '../transitions.js';

import { CustomCursor } from '../cursor.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAnimations, hideLoader } from '../animations/gsap-setup.js';

gsap.registerPlugin(ScrollTrigger);

class NoHornDemo {
    constructor() {
        this.isInZone = false;
        this.hornActive = true;
        this.logTime = 0;
        this.logInterval = null;

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

        // Initialize demo controls
        this.initDemoControls();

        // Start log timer
        this.startLogTimer();

        // Initialize circuit animation
        this.initCircuitAnimation();
    }

    initNav() {
        const nav = document.querySelector('.nav');
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                nav?.classList.add('scrolled');
            } else {
                nav?.classList.remove('scrolled');
            }
        });

        toggle?.addEventListener('click', () => {
            links?.classList.toggle('active');
        });
    }

    initDemoControls() {
        const btnApproach = document.getElementById('btn-approach');
        const btnEnter = document.getElementById('btn-enter');
        const btnHorn = document.getElementById('btn-horn');
        const btnExit = document.getElementById('btn-exit');

        btnApproach?.addEventListener('click', () => this.approachZone());
        btnEnter?.addEventListener('click', () => this.enterZone());
        btnHorn?.addEventListener('click', () => this.pressHorn());
        btnExit?.addEventListener('click', () => this.exitZone());
    }

    startLogTimer() {
        this.logInterval = setInterval(() => {
            this.logTime++;
        }, 1000);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    addLog(message, type = 'info') {
        const log = document.getElementById('demo-log');
        if (!log) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
      <span class="log-time">${this.formatTime(this.logTime)}</span>
      <span class="log-text" style="color: ${type === 'warning' ? 'var(--accent-warning)' : type === 'error' ? 'var(--accent-enforcement)' : type === 'success' ? 'var(--accent-system)' : 'var(--text-secondary)'}">${message}</span>
    `;

        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    updateStatus(active) {
        const status = document.getElementById('horn-status');
        if (!status) return;

        const icon = status.querySelector('.status-icon');
        const text = status.querySelector('span:last-child');

        if (active) {
            icon?.classList.remove('status-disabled');
            icon?.classList.add('status-active');
            if (icon) {
                icon.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
          </svg>
        `;
            }
            if (text) text.textContent = 'Horn Active';
        } else {
            icon?.classList.remove('status-active');
            icon?.classList.add('status-disabled');
            if (icon) {
                icon.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        `;
            }
            if (text) text.textContent = 'Horn Disabled';
        }
    }

    approachZone() {
        this.addLog('Vehicle approaching No Horn Zone...', 'info');

        gsap.to('.zone-label', {
            scale: 1.1,
            boxShadow: '0 0 20px var(--accent-enforcement)',
            duration: 0.5,
            repeat: 3,
            yoyo: true
        });

        setTimeout(() => {
            this.addLog('GPS coordinates: 19.0760°N, 72.8777°E', 'info');
            this.addLog('Zone detected: HOSPITAL - 100m radius', 'warning');
        }, 500);
    }

    enterZone() {
        this.isInZone = true;
        this.hornActive = false;

        this.addLog('ZONE ENTRY DETECTED', 'warning');
        this.addLog('Activating relay... Circuit broken', 'error');
        this.addLog('Horn function DISABLED', 'error');

        this.updateStatus(false);

        // Visual feedback
        gsap.to('.zone-label', {
            backgroundColor: 'rgba(255, 59, 59, 0.3)',
            duration: 0.3
        });

        // Show circuit break
        const circuitBreak = document.getElementById('circuit-break');
        if (circuitBreak) {
            circuitBreak.classList.add('active');
        }
    }

    pressHorn() {
        if (!this.isInZone) {
            this.addLog('Horn pressed - SOUND OUTPUT', 'success');

            // Visual horn animation
            gsap.to('.demo-visual', {
                boxShadow: '0 0 30px var(--accent-warning)',
                duration: 0.1,
                repeat: 3,
                yoyo: true
            });
        } else {
            this.addLog('Horn pressed - NO OUTPUT (Circuit Open)', 'error');
            this.addLog('Enforcement active. Driver notified via dashboard light.', 'warning');

            // Visual feedback - blocked
            gsap.to('.demo-visual', {
                boxShadow: '0 0 30px var(--accent-enforcement)',
                duration: 0.1,
                repeat: 1,
                yoyo: true
            });
        }
    }

    exitZone() {
        if (!this.isInZone) {
            this.addLog('Vehicle not currently in zone.', 'info');
            return;
        }

        this.isInZone = false;
        this.hornActive = true;

        this.addLog('ZONE EXIT DETECTED', 'info');
        this.addLog('Deactivating relay... Circuit restored', 'success');
        this.addLog('Horn function RESTORED', 'success');

        this.updateStatus(true);

        // Visual feedback
        gsap.to('.zone-label', {
            backgroundColor: 'transparent',
            duration: 0.3
        });

        // Hide circuit break
        const circuitBreak = document.getElementById('circuit-break');
        if (circuitBreak) {
            circuitBreak.classList.remove('active');
        }
    }

    initCircuitAnimation() {
        // Animate circuit on scroll
        ScrollTrigger.create({
            trigger: '.circuit-section',
            start: 'top 70%',
            onEnter: () => {
                gsap.from('.circuit-component', {
                    opacity: 0,
                    y: 20,
                    stagger: 0.2,
                    duration: 0.6,
                    ease: 'power3.out'
                });

                gsap.from('.circuit-wire', {
                    scaleX: 0,
                    stagger: 0.15,
                    duration: 0.4,
                    ease: 'power2.out',
                    delay: 0.5
                });
            }
        });
    }
}

// Initialize
new NoHornDemo();
