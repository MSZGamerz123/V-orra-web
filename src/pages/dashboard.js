/**
 * V-ORRA Dashboard Page
 * Interactive dashboard mockup
 */

import '../../styles/base.css';
import '../../styles/cursor.css';
import '../../styles/dashboard.css';
import '../../styles/transitions.css';

import { PageTransition } from '../transitions.js';

import { CustomCursor } from '../cursor.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAnimations, hideLoader } from '../animations/gsap-setup.js';

gsap.registerPlugin(ScrollTrigger);

class DashboardPage {
    constructor() {
        this.activeNavItem = 'Overview';
        this.selectedZone = null;

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

        // Initialize dashboard interactions
        this.initDashboardNav();
        this.initMapInteractions();
        this.initToolbar();

        // Initialize animations
        this.initAnimations();

        // Start vehicle animations
        this.animateVehicles();
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

    initDashboardNav() {
        const navItems = document.querySelectorAll('.dash-nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.activeNavItem = item.textContent;
            });
        });
    }

    initMapInteractions() {
        const zones = document.querySelectorAll('.map-zone');

        zones.forEach(zone => {
            zone.addEventListener('click', () => {
                zones.forEach(z => z.classList.remove('selected'));
                zone.classList.add('selected');
                this.selectZone(zone);
            });
        });

        // Map control buttons
        const mapBtns = document.querySelectorAll('.map-btn');
        mapBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Visual feedback
                gsap.to(btn, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1
                });
            });
        });
    }

    initToolbar() {
        const toolbarBtns = document.querySelectorAll('.toolbar-btn');

        toolbarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolbarBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    selectZone(zone) {
        const tooltip = zone.querySelector('.zone-tooltip strong');
        const zoneName = tooltip?.textContent || 'Unknown Zone';

        const nameElement = document.querySelector('.zone-name');
        if (nameElement) {
            nameElement.textContent = zoneName;
        }

        // Animate selection
        gsap.fromTo(zone,
            { scale: 1 },
            { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }
        );
    }

    animateVehicles() {
        const vehicles = document.querySelectorAll('.map-vehicle');

        vehicles.forEach((vehicle, index) => {
            // Random movement animation
            const startX = parseFloat(vehicle.style.left);
            const startY = parseFloat(vehicle.style.top);

            gsap.to(vehicle, {
                left: `${startX + (Math.random() - 0.5) * 20}%`,
                top: `${startY + (Math.random() - 0.5) * 10}%`,
                duration: 5 + Math.random() * 5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.5
            });
        });
    }

    initAnimations() {
        // Dashboard mockup reveal
        gsap.from('.dashboard-mockup-full', {
            scrollTrigger: {
                trigger: '.dashboard-preview',
                start: 'top 70%'
            },
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });

        // Stats counter animation
        const statValues = document.querySelectorAll('.stat-mini .stat-value');
        statValues.forEach(stat => {
            const value = stat.textContent;
            if (value.match(/^\d/)) {
                const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
                const suffix = value.replace(/[\d.,]/g, '');

                gsap.from(stat, {
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 90%'
                    },
                    textContent: 0,
                    duration: 1.5,
                    ease: 'power1.out',
                    snap: { textContent: 1 },
                    onUpdate: function () {
                        const current = Math.round(parseFloat(this.targets()[0].textContent));
                        stat.textContent = current.toLocaleString() + suffix;
                    }
                });
            }
        });

        // OTA progress bar animation
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            gsap.from(progressFill, {
                scrollTrigger: {
                    trigger: progressFill,
                    start: 'top 90%'
                },
                width: '0%',
                duration: 2,
                ease: 'power2.out'
            });
        }

        // Feature boxes
        gsap.utils.toArray('.feature-box').forEach((box, i) => {
            gsap.from(box, {
                scrollTrigger: {
                    trigger: box,
                    start: 'top 85%'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: 'power3.out'
            });
        });

        // Chart bars
        gsap.utils.toArray('.chart-bar').forEach((bar, i) => {
            gsap.from(bar, {
                scrollTrigger: {
                    trigger: bar.parentElement,
                    start: 'top 80%'
                },
                height: 0,
                duration: 0.8,
                delay: i * 0.15,
                ease: 'power2.out'
            });
        });
    }
}

// Initialize
new DashboardPage();
