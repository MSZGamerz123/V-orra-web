/**
 * V-ORRA Particle System
 * Super smooth morphing animation - particles fill the entire screen
 * 
 * Flow: Free roaming → Vehicles (CENTER) → Logo (CENTER, BIG) → Globe (CENTER, FULL SCREEN)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    generateCombinedVehicles,
    generateLogoShape,
    generateGlobeShape,
    Easing
} from './shapes.js';

gsap.registerPlugin(ScrollTrigger);

export class ParticleSystem {
    constructor(canvasId = 'particle-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Particle canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.scrollProgress = 0;
        this.time = 0;
        this.globeRotation = 0;
        this.vehicleRotation = 0;

        // Scroll tracking
        this.lastScrollProgress = 0;
        this.scrollVelocity = 0;
        this.smoothVelocity = 0;
        this.dismantleForce = 0;  // Force to spread particles when at top

        // Mouse tracking for cursor interaction
        this.mouseX = this.width / 2 || 0;
        this.mouseY = this.height / 2 || 0;
        this.mouseRadius = 120; // Radius of mouse influence
        this.mouseActive = false;

        // Configuration
        this.config = {
            particleCount: 180,
            particleMinSize: 2,
            particleMaxSize: 4,
            floatAmplitude: 3,
            floatSpeed: 0.002,
            roamSpeed: 0.4,
            // SUPER SMOOTH morphing
            morphLerp: 0.025,
            lineMaxDistance: 150,
            colorPhases: {
                roaming: { h: 200, s: 80, l: 55 },
                vehicles: { h: 190, s: 100, l: 60 },
                logo: { h: 280, s: 85, l: 65 },
                globe: { h: 160, s: 90, l: 55 }
            }
        };

        this.shapes = {
            vehicles: null,
            logo: null,
            globe: null
        };

        this.init();
    }

    init() {
        this.resize();
        this.generateShapes();
        this.createParticles();
        this.setupScrollTrigger();
        this.setupMouseTracking();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        console.log(`Particle System: ${this.config.particleCount} particles (with cursor interaction)`);
    }

    setupMouseTracking() {
        // Track mouse movement for particle interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.mouseActive = true;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseActive = false;
        });

        // Also track on document for better coverage
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.mouseActive = true;
        });
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.ctx.scale(dpr, dpr);

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // HUGE SCALE - shapes fill the screen
        this.scale = Math.min(this.width, this.height) * 0.75;
        // Globe gets MASSIVE scale to fill entire screen
        this.globeScale = Math.min(this.width, this.height) * 0.85;
    }

    generateShapes() {
        const count = this.config.particleCount;
        this.shapes.vehicles = generateCombinedVehicles(count);
        this.shapes.logo = generateLogoShape(count);
        this.shapes.globe = generateGlobeShape(count);
    }

    createParticles() {
        for (let i = 0; i < this.config.particleCount; i++) {
            // Start scattered across full screen
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.4;

            this.particles.push({
                x: x,
                y: y,
                targetX: x,
                targetY: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: this.config.particleMinSize + Math.random() * (this.config.particleMaxSize - this.config.particleMinSize),
                alpha: 0.5 + Math.random() * 0.5,
                floatOffset: Math.random() * Math.PI * 2,
                hue: 200 + Math.random() * 20,
                originalSize: this.config.particleMinSize + Math.random() * (this.config.particleMaxSize - this.config.particleMinSize)
            });
        }
    }

    setupScrollTrigger() {
        // Track scroll position to detect scroll-to-top
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const scrollingUp = currentScrollY < lastScrollY;
            const nearTop = currentScrollY < 300;

            // Trigger dismantle when scrolling UP and near the top
            if (scrollingUp && nearTop) {
                this.dismantleForce = Math.min(1, this.dismantleForce + 0.15);
            } else {
                this.dismantleForce *= 0.92;
            }

            lastScrollY = currentScrollY;
        });

        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            onUpdate: (self) => {
                const newProgress = self.progress;
                this.scrollVelocity = newProgress - this.lastScrollProgress;
                this.lastScrollProgress = newProgress;
                this.scrollProgress = newProgress;
            }
        });
    }

    getPhase() {
        const p = this.scrollProgress;

        // Phase order: Roaming → V Logo → Car/Bike → Globe
        if (p < 0.10) {
            return { phase: 'roaming', mergeProgress: 0, shape: null };
        } else if (p < 0.30) {
            // V-orra Logo (first shape)
            const t = (p - 0.10) / 0.20;
            return { phase: 'merging', mergeProgress: this.smoothstep(t), shape: 'logo' };
        } else if (p < 0.40) {
            // Transition from logo
            const t = (p - 0.30) / 0.10;
            return { phase: 'transition', mergeProgress: 1 - this.smoothstep(t) * 0.3, shape: 'logo' };
        } else if (p < 0.65) {
            // Car/Bike Vehicles (second shape)
            const t = (p - 0.40) / 0.25;
            return { phase: 'merging', mergeProgress: this.smoothstep(t), shape: 'vehicles' };
        } else if (p < 0.75) {
            // Transition from vehicles
            const t = (p - 0.65) / 0.10;
            return { phase: 'transition', mergeProgress: 1 - this.smoothstep(t) * 0.3, shape: 'vehicles' };
        } else {
            // Globe (third shape)
            const t = (p - 0.75) / 0.25;
            return { phase: 'merging', mergeProgress: this.smoothstep(t), shape: 'globe' };
        }
    }

    // Much smoother than linear interpolation
    smoothstep(t) {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
    }

    getCurrentColor() {
        const phase = this.getPhase();
        const phases = this.config.colorPhases;

        // Color order matches shape order: roaming → logo → vehicles → globe
        if (phase.phase === 'roaming') {
            return phases.roaming;
        } else if (phase.shape === 'logo') {
            return this.lerpColor(phases.roaming, phases.logo, phase.mergeProgress);
        } else if (phase.shape === 'vehicles') {
            return this.lerpColor(phases.logo, phases.vehicles, phase.mergeProgress);
        } else {
            return this.lerpColor(phases.vehicles, phases.globe, phase.mergeProgress);
        }
    }

    lerpColor(colorA, colorB, t) {
        return {
            h: colorA.h + (colorB.h - colorA.h) * t,
            s: colorA.s + (colorB.s - colorA.s) * t,
            l: colorA.l + (colorB.l - colorA.l) * t
        };
    }

    rotatePoint3D(point, angleY) {
        const cos = Math.cos(angleY);
        const sin = Math.sin(angleY);
        const x = point.x;
        const z = point.z || 0;

        return {
            x: x * cos - z * sin,
            y: point.y,
            z: x * sin + z * cos
        };
    }

    updateParticles() {
        this.time += this.config.floatSpeed;
        this.vehicleRotation += 0.004;
        this.globeRotation += 0.005;

        const phase = this.getPhase();
        const mergeProgress = phase.mergeProgress;
        const roamIntensity = 1 - mergeProgress;
        const currentColor = this.getCurrentColor();

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            // CURSOR INTERACTION - particles repel and glow near mouse
            if (this.mouseActive) {
                const dx = particle.x - this.mouseX;
                const dy = particle.y - this.mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouseRadius) {
                    // Repel force - stronger when closer
                    const force = (1 - dist / this.mouseRadius) * 3;
                    const angle = Math.atan2(dy, dx);

                    particle.vx += Math.cos(angle) * force * 0.5;
                    particle.vy += Math.sin(angle) * force * 0.5;

                    // Increase glow when near cursor
                    particle.cursorGlow = Math.max(particle.cursorGlow || 0, (1 - dist / this.mouseRadius));
                } else {
                    // Decay glow when cursor moves away
                    particle.cursorGlow = (particle.cursorGlow || 0) * 0.9;
                }
            } else {
                particle.cursorGlow = (particle.cursorGlow || 0) * 0.95;
            }

            // SLOW SCATTER - particles slowly drift to spread across entire screen
            // When scrolling to top, particles gently move to random positions
            if (this.dismantleForce > 0.05) {
                // Set a target position for this particle (only once)
                if (!particle.spreadTargetX) {
                    particle.spreadTargetX = Math.random() * this.width;
                    particle.spreadTargetY = Math.random() * this.height;
                }

                // Very slowly move towards the spread target position
                const slowSpeed = 0.02; // Very slow movement
                particle.x += (particle.spreadTargetX - particle.x) * slowSpeed;
                particle.y += (particle.spreadTargetY - particle.y) * slowSpeed;
            } else {
                // Reset spread targets when not at top
                particle.spreadTargetX = null;
                particle.spreadTargetY = null;
            }

            // FREE ROAMING - particles drift around
            if (roamIntensity > 0.1) {
                particle.vx += (Math.random() - 0.5) * 0.03 * roamIntensity;
                particle.vy += (Math.random() - 0.5) * 0.03 * roamIntensity;

                // Speed limit with cursor boost
                const cursorBoost = (particle.cursorGlow || 0) * 2;
                const maxSpeed = this.config.roamSpeed + this.dismantleForce * 1.5 + cursorBoost;
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > maxSpeed) {
                    particle.vx = (particle.vx / speed) * maxSpeed;
                    particle.vy = (particle.vy / speed) * maxSpeed;
                }
            }

            // Wrap around screen
            if (particle.x < -30) particle.x = this.width + 30;
            if (particle.x > this.width + 30) particle.x = -30;
            if (particle.y < -30) particle.y = this.height + 30;
            if (particle.y > this.height + 30) particle.y = -30;

            // Calculate target based on shape
            let shapeTargetX = particle.x + particle.vx * roamIntensity;
            let shapeTargetY = particle.y + particle.vy * roamIntensity;

            if (phase.shape && mergeProgress > 0) {
                let shapePoint;

                if (phase.shape === 'vehicles') {
                    const p = this.shapes.vehicles[i];
                    const angle = this.vehicleRotation * 0.05;
                    shapePoint = {
                        x: p.x * Math.cos(angle),
                        y: p.y
                    };
                } else if (phase.shape === 'logo') {
                    const p = this.shapes.logo[i];
                    shapePoint = { x: p.x, y: p.y };
                } else if (phase.shape === 'globe') {
                    const p = this.shapes.globe[i];
                    const rotated = this.rotatePoint3D(p, this.globeRotation * 0.15);
                    const perspective = 1 / (1.5 - rotated.z * 0.4);
                    // Globe uses larger scale for full screen coverage
                    const globeTargetX = this.centerX + rotated.x * perspective * this.globeScale;
                    const globeTargetY = this.centerY - rotated.y * perspective * this.globeScale;

                    shapeTargetX = particle.x + (globeTargetX - particle.x) * mergeProgress;
                    shapeTargetY = particle.y + (globeTargetY - particle.y) * mergeProgress;
                    shapePoint = null; // Skip the normal target calculation
                }

                if (shapePoint) {
                    const targetX = this.centerX + shapePoint.x * this.scale;
                    const targetY = this.centerY - shapePoint.y * this.scale;

                    // Smooth blend towards shape
                    shapeTargetX = particle.x + (targetX - particle.x) * mergeProgress;
                    shapeTargetY = particle.y + (targetY - particle.y) * mergeProgress;
                }
            }

            // Floating animation
            const floatX = Math.sin(this.time * 1.5 + particle.floatOffset) * this.config.floatAmplitude * roamIntensity;
            const floatY = Math.cos(this.time + particle.floatOffset) * this.config.floatAmplitude * roamIntensity;

            // SUPER SMOOTH interpolation
            const lerp = this.config.morphLerp + mergeProgress * 0.04;
            particle.x += (shapeTargetX - particle.x) * lerp + floatX * 0.1;
            particle.y += (shapeTargetY - particle.y) * lerp + floatY * 0.1;

            // Update visual properties
            particle.hue = currentColor.h + (Math.random() - 0.5) * 10;
            particle.alpha = 0.4 + mergeProgress * 0.5;
            particle.size = particle.originalSize * (1 + mergeProgress * 0.4);
        }
    }

    drawConnections() {
        const maxDist = this.config.lineMaxDistance;
        const maxDistSq = maxDist * maxDist;
        const phase = this.getPhase();
        const currentColor = this.getCurrentColor();
        const connectionStrength = 0.15 + phase.mergeProgress * 0.25;

        this.ctx.lineWidth = 0.4 + phase.mergeProgress * 0.3;

        const checkLimit = Math.min(this.particles.length, 100);

        for (let i = 0; i < checkLimit; i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < checkLimit; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    const alpha = (1 - (distSq / maxDistSq)) * connectionStrength;
                    this.ctx.strokeStyle = `hsla(${currentColor.h}, ${currentColor.s}%, ${currentColor.l + 10}%, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawParticles() {
        const currentColor = this.getCurrentColor();
        const phase = this.getPhase();

        for (const particle of this.particles) {
            const h = particle.hue;
            const s = currentColor.s;
            const l = currentColor.l;

            // Enhanced glow when near cursor
            const cursorGlow = particle.cursorGlow || 0;
            const glowBoost = 1 + cursorGlow * 2;
            const glowSize = particle.size * (3 + phase.mergeProgress) * glowBoost;
            const glowL = l + cursorGlow * 20; // Brighter when near cursor

            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, glowSize
            );

            // Use cyan tint when cursor is near
            const glowHue = cursorGlow > 0.1 ? 180 : h;
            gradient.addColorStop(0, `hsla(${glowHue}, ${s}%, ${Math.min(100, glowL)}%, ${particle.alpha + cursorGlow * 0.3})`);
            gradient.addColorStop(0.4, `hsla(${glowHue}, ${s}%, ${glowL - 10}%, ${particle.alpha * 0.4})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Core dot - brighter when cursor is near
            const coreAlpha = particle.alpha * (0.7 + cursorGlow * 0.5);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * (0.35 + cursorGlow * 0.3), 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawConnections();
        this.drawParticles();
    }

    animate() {
        this.updateParticles();
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resize);
        ScrollTrigger.getAll().forEach(t => {
            if (t.trigger === 'body') t.kill();
        });
    }
}

export default ParticleSystem;
