/**
 * V-ORRA Main Entry Point
 * Initializes all systems
 */

import '../styles/base.css';
import '../styles/cursor.css';
import '../styles/home.css';
import '../styles/transitions.css';
import '../styles/storytelling.css';
import '../styles/liquid-glass.css';
import '../styles/popups.css';
import { PageTransition } from './transitions.js';
import { CustomCursor } from './cursor.js';
import { smoothScroll, lenis, gsap, ScrollTrigger } from './scroll.js';
import { initAnimations, hideLoader, initMagneticButtons } from './animations/gsap-setup.js';
import { CityScene } from './scenes/cityscape.js';
import { LiquidGlassEffects } from './liquid-glass.js';
import { ParticleSystem } from './particles/ParticleSystem.js';

class VorraApp {
  constructor() {
    this.cursor = null;
    this.cityScene = null;
    this.pageTransition = null;
    this.liquidGlass = null;
    this.particleSystem = null;
    this.isLoaded = false;

    this.init();
  }

  async init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onReady());
    } else {
      this.onReady();
    }
  }

  onReady() {
    // Initialize navigation
    this.initNavigation();

    // Initialize cursor
    this.cursor = new CustomCursor();

    // Initialize page transitions
    this.pageTransition = new PageTransition();
    this.pageTransition.onExit(() => this.destroy());

    // Initialize 3D scene if container exists
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
      this.cityScene = new CityScene(heroCanvas);
    }

    // Initialize animations
    initAnimations();
    initMagneticButtons();

    // Hide loader after everything loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        hideLoader();
        this.isLoaded = true;
      }, 500);
    });

    // Initialize scroll triggers
    this.initScrollTriggers();

    // Initialize scroll progress
    this.initScrollProgress();

    // Initialize iOS 26 Liquid Glass Effects
    this.liquidGlass = new LiquidGlassEffects();

    // Initialize Particle Animation System
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
      this.particleSystem = new ParticleSystem('particle-canvas');
    }

    // Log ready
    console.log('V-orra website initialized');
  }

  initNavigation() {
    const nav = document.querySelector('.glass-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const links = document.querySelector('.nav-links');

    if (!nav) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

    // Mobile Menu Toggle
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('active');
        toggle.classList.toggle('active');
        const expanded = links.classList.contains('active');
        toggle.setAttribute('aria-expanded', expanded);
      });
    }

    // Dynamic Auth State for Navbar
    import('./firebase-config.js').then(({ auth, onAuthStateChanged, logOut }) => {
      onAuthStateChanged(auth, (user) => {
        const authLink = document.getElementById('navSignInBtn'); // ID added to auth.html and other pages if missing

        // Also check for mobile menu link if separate
        const mobileAuthLink = document.querySelector('.nav-links a[href="auth.html"]');
        const targetLink = authLink || mobileAuthLink;

        if (targetLink) {
          if (user) {
            // User is logged in
            targetLink.textContent = 'Dashboard';
            targetLink.href = 'tickets.html';
            targetLink.classList.add('nav-dashboard-btn');

            // Optional: Add Logout button to mobile menu or near dashboard
            // For now, simpler to just change the button to Dashboard
          } else {
            // User is logged out
            targetLink.textContent = 'Sign In';
            targetLink.href = 'auth.html';
            targetLink.classList.remove('nav-dashboard-btn');
          }
        }
      });
    }).catch(err => console.error('Failed to load firebase for nav', err));
  }

  initScrollTriggers() {
    // Zone highlights on scroll
    if (this.cityScene) {
      // Hospital zone trigger
      ScrollTrigger.create({
        trigger: '#zone-hospital',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.cityScene.activateZone('hospital'),
        onLeave: () => this.cityScene.deactivateZone('hospital'),
        onEnterBack: () => this.cityScene.activateZone('hospital'),
        onLeaveBack: () => this.cityScene.deactivateZone('hospital')
      });

      // School zone trigger
      ScrollTrigger.create({
        trigger: '#zone-school',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.cityScene.activateZone('school'),
        onLeave: () => this.cityScene.deactivateZone('school'),
        onEnterBack: () => this.cityScene.activateZone('school'),
        onLeaveBack: () => this.cityScene.deactivateZone('school')
      });

      // Court zone trigger
      ScrollTrigger.create({
        trigger: '#zone-court',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.cityScene.activateZone('court'),
        onLeave: () => this.cityScene.deactivateZone('court'),
        onEnterBack: () => this.cityScene.activateZone('court'),
        onLeaveBack: () => this.cityScene.deactivateZone('court')
      });
    }
  }

  initScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);

    // Update progress on scroll
    let ticking = false;
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;
      progressBar.style.width = `${Math.min(scrollProgress, 100)}%`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  }

  // Refresh animations (call after dynamic content)
  refresh() {
    ScrollTrigger.refresh();
    if (this.cursor) {
      this.cursor.refresh();
    }
  }

  destroy() {
    if (this.cityScene) {
      this.cityScene.destroy();
    }
    if (this.particleSystem) {
      this.particleSystem.destroy();
    }
    // Kill all ScrollTriggers
    ScrollTrigger.getAll().forEach(t => t.kill());
  }
}

// Initialize app
const app = new VorraApp();

// Export for global access
window.vorraApp = app;

export default app;
