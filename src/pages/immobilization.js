/**
 * V-ORRA Passive Immobilization Page
 * Interactive enforcement sequence demo
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

class ImmobilizationDemo {
    constructor() {
        this.currentStep = 0;
        this.isRunning = false;

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

        // Initialize step buttons
        this.initStepButtons();
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
        const executeBtn = document.getElementById('btn-execute');
        executeBtn?.addEventListener('click', () => this.executeSequence());
    }

    initStepButtons() {
        const stepBtns = document.querySelectorAll('.step-btn');
        stepBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.dataset.step);
                this.goToStep(step);
            });
        });
    }

    updateStepUI(step) {
        const stepBtns = document.querySelectorAll('.step-btn');
        stepBtns.forEach((btn, index) => {
            btn.classList.remove('active', 'completed');
            if (index + 1 < step) {
                btn.classList.add('completed');
            } else if (index + 1 === step) {
                btn.classList.add('active');
            }
        });
    }

    updateStatus(target, signal, command) {
        const statusTarget = document.getElementById('status-target');
        const statusSignal = document.getElementById('status-signal');
        const statusCommand = document.getElementById('status-command');

        if (statusTarget) statusTarget.textContent = target;
        if (statusSignal) statusSignal.textContent = signal;
        if (statusCommand) statusCommand.textContent = command;
    }

    async executeSequence() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.currentStep = 0;

        // Reset all elements
        this.resetDemo();

        // Step 1: Aim V-Gun
        await this.step1_aim();

        // Step 2: Fire Signal
        await this.step2_fire();

        // Step 3: Beacon Relay
        await this.step3_relay();

        // Step 4: Vehicle Stop
        await this.step4_stop();

        this.isRunning = false;
    }

    resetDemo() {
        // Reset V-Gun beam
        const beam = document.getElementById('vgun-beam');
        if (beam) beam.classList.remove('active');

        // Reset beacon signals
        document.querySelectorAll('.beacon-signal').forEach(signal => {
            signal.classList.remove('active');
        });

        // Reset violator vehicle - remove stopping class and restart animation
        const violator = document.getElementById('violator-vehicle');
        if (violator) {
            violator.classList.remove('stopping');
            // Force animation restart
            violator.style.animation = 'none';
            violator.offsetHeight; // Trigger reflow
            violator.style.animation = '';
        }

        // Reset stop indicator
        const stopIndicator = document.getElementById('stop-indicator');
        if (stopIndicator) stopIndicator.classList.remove('active');

        // Reset status
        this.updateStatus('—', '—', 'STANDBY');

        // Reset step buttons
        this.updateStepUI(0);
    }

    goToStep(step) {
        this.currentStep = step;
        this.updateStepUI(step);

        // Visual feedback based on step
        switch (step) {
            case 1:
                this.showStep1();
                break;
            case 2:
                this.showStep2();
                break;
            case 3:
                this.showStep3();
                break;
            case 4:
                this.showStep4();
                break;
        }
    }

    showStep1() {
        this.resetDemo();
        this.updateStatus('MH-12-AB-1234', '—', 'ACQUIRING');

        gsap.to('.scene-officer', {
            x: 10,
            duration: 0.3,
            yoyo: true,
            repeat: 1
        });
    }

    showStep2() {
        const beam = document.getElementById('vgun-beam');
        if (beam) beam.classList.add('active');
        this.updateStatus('MH-12-AB-1234', '95%', 'TRANSMITTING');
    }

    showStep3() {
        document.querySelectorAll('.beacon-signal').forEach(signal => {
            signal.classList.add('active');
        });
        this.updateStatus('MH-12-AB-1234', '100%', 'RELAYING');
    }

    showStep4() {
        const violator = document.getElementById('violator-vehicle');
        const stopIndicator = document.getElementById('stop-indicator');

        if (violator) violator.classList.add('stopping');
        if (stopIndicator) stopIndicator.classList.add('active');

        this.updateStatus('MH-12-AB-1234', '100%', 'STOP CONFIRMED');
    }

    async step1_aim() {
        return new Promise(resolve => {
            this.currentStep = 1;
            this.updateStepUI(1);

            this.updateStatus('SCANNING...', '—', 'ACQUIRING');

            gsap.to('.scene-officer', {
                x: 10,
                duration: 0.3,
                yoyo: true,
                repeat: 1
            });

            setTimeout(() => {
                this.updateStatus('MH-12-AB-1234', '—', 'TARGET LOCKED');
                resolve();
            }, 1500);
        });
    }

    async step2_fire() {
        return new Promise(resolve => {
            this.currentStep = 2;
            this.updateStepUI(2);

            this.updateStatus('MH-12-AB-1234', '0%', 'TRANSMITTING');

            const beam = document.getElementById('vgun-beam');
            if (beam) {
                beam.classList.add('active');

                gsap.to(beam, {
                    opacity: 1,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 2
                });
            }

            // Animate signal strength
            let signal = 0;
            const signalInterval = setInterval(() => {
                signal += 20;
                this.updateStatus('MH-12-AB-1234', `${signal}%`, 'TRANSMITTING');

                if (signal >= 100) {
                    clearInterval(signalInterval);
                    resolve();
                }
            }, 200);
        });
    }

    async step3_relay() {
        return new Promise(resolve => {
            this.currentStep = 3;
            this.updateStepUI(3);

            this.updateStatus('MH-12-AB-1234', '100%', 'RELAYING');

            // Activate beacons sequentially
            const beacons = document.querySelectorAll('.beacon-signal');
            beacons.forEach((beacon, index) => {
                setTimeout(() => {
                    beacon.classList.add('active');
                }, index * 300);
            });

            setTimeout(() => {
                this.updateStatus('MH-12-AB-1234', '100%', 'BROADCAST COMPLETE');
                resolve();
            }, 1500);
        });
    }

    async step4_stop() {
        return new Promise(resolve => {
            this.currentStep = 4;
            this.updateStepUI(4);

            this.updateStatus('MH-12-AB-1234', '100%', 'STOPPING');

            const violator = document.getElementById('violator-vehicle');
            const stopIndicator = document.getElementById('stop-indicator');

            if (stopIndicator) {
                stopIndicator.classList.add('active');
            }

            if (violator) {
                violator.classList.add('stopping');
            }

            setTimeout(() => {
                this.updateStatus('MH-12-AB-1234', '100%', 'VIOLATOR STOPPED');
                resolve();
            }, 2500);
        });
    }
}

// Initialize
new ImmobilizationDemo();
