/**
 * V-ORRA Smart Beam Page
 * Smart Dipper interactive demo
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

class SmartBeamDemo {
    constructor() {
        this.holdTimer = null;
        this.holdStartTime = 0;
        this.isHolding = false;
        this.logTime = 0;

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

        // Initialize demo
        this.initDemo();

        // Start log timer
        setInterval(() => this.logTime++, 1000);

        // Initialize low beam as active
        this.setBeam('low');
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

    initDemo() {
        const btnFlash = document.getElementById('btn-flash');
        const btnHold = document.getElementById('btn-hold');

        // Flash button
        btnFlash?.addEventListener('click', () => this.doFlash());

        // Hold button - mousedown/mouseup for hold detection
        btnHold?.addEventListener('mousedown', () => this.startHold());
        btnHold?.addEventListener('mouseup', () => this.endHold());
        btnHold?.addEventListener('mouseleave', () => this.endHold());

        // Touch support
        btnHold?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startHold();
        });
        btnHold?.addEventListener('touchend', () => this.endHold());
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

    setBeam(type) {
        const lowBeam = document.getElementById('low-beam');
        const highBeam = document.getElementById('high-beam');
        const lowIndicator = document.querySelector('.beam-indicator.low');
        const highIndicator = document.querySelector('.beam-indicator.high');

        if (type === 'low') {
            lowBeam?.classList.add('active');
            highBeam?.classList.remove('active');
            lowIndicator?.classList.add('active');
            highIndicator?.classList.remove('active');
            highIndicator?.classList.remove('blocked');
        } else if (type === 'high') {
            lowBeam?.classList.remove('active');
            highBeam?.classList.add('active');
            lowIndicator?.classList.remove('active');
            highIndicator?.classList.add('active');
            highIndicator?.classList.remove('blocked');
        } else if (type === 'blocked') {
            lowBeam?.classList.add('active');
            highBeam?.classList.remove('active');
            lowIndicator?.classList.add('active');
            highIndicator?.classList.remove('active');
            highIndicator?.classList.add('blocked');
        }
    }

    doFlash() {
        this.addLog('High beam flash detected', 'info');
        this.addLog('Duration: < 500ms - ALLOWED', 'success');

        // Visual flash
        this.setBeam('high');

        gsap.to('.demo-visual', {
            backgroundColor: 'rgba(255, 255, 200, 0.1)',
            duration: 0.1
        });

        setTimeout(() => {
            this.setBeam('low');
            gsap.to('.demo-visual', {
                backgroundColor: 'transparent',
                duration: 0.3
            });
        }, 300);
    }

    startHold() {
        if (this.isHolding) return;

        this.isHolding = true;
        this.holdStartTime = Date.now();

        this.addLog('High beam switch ON', 'warning');
        this.setBeam('high');

        // Check for threshold
        this.holdTimer = setTimeout(() => {
            if (this.isHolding) {
                this.blockBeam();
            }
        }, 500);
    }

    endHold() {
        if (!this.isHolding) return;

        const holdDuration = Date.now() - this.holdStartTime;
        this.isHolding = false;

        if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }

        if (holdDuration < 500) {
            this.addLog(`Duration: ${holdDuration}ms - Allowed flash`, 'success');
            this.setBeam('low');
        } else {
            this.addLog('High beam switch OFF', 'info');
            this.addLog('Circuit restored to low beam', 'info');
            this.setBeam('low');
        }

        gsap.to('.demo-visual', {
            backgroundColor: 'transparent',
            duration: 0.3
        });
    }

    blockBeam() {
        this.addLog('Duration: > 500ms - THRESHOLD EXCEEDED', 'error');
        this.addLog('Smart Dipper ACTIVATED - High beam BLOCKED', 'error');
        this.addLog('Forcing low beam mode', 'warning');

        this.setBeam('blocked');

        // Visual feedback
        gsap.to('.demo-visual', {
            backgroundColor: 'rgba(255, 59, 59, 0.1)',
            duration: 0.2,
            yoyo: true,
            repeat: 2
        });
    }
}

// Initialize
new SmartBeamDemo();
