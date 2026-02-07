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
import '../styles/dynamic-island.css';

import { PageTransition } from './transitions.js';
import { CustomCursor } from './cursor.js';
import { smoothScroll, lenis, gsap, ScrollTrigger } from './scroll.js';
import { initAnimations, hideLoader, initMagneticButtons } from './animations/gsap-setup.js';
import { CityScene } from './scenes/cityscape.js';
import { LiquidGlassEffects } from './liquid-glass.js';
import { ParticleSystem } from './particles/ParticleSystem.js';
import { DynamicIsland } from './dynamic-island.js';

class VorraApp {
  constructor() {
    this.cursor = null;
    this.cityScene = null;
    this.pageTransition = null;
    this.liquidGlass = null;
    this.particleSystem = null;
    this.dynamicIsland = null;
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

    // Initialize mobile menu
    this.initMobileMenu();

    // Initialize scroll progress
    this.initScrollProgress();

    // Initialize iOS 26 Liquid Glass Effects
    this.liquidGlass = new LiquidGlassEffects();

    // Initialize Dynamic Island
    this.dynamicIsland = new DynamicIsland();

    // Initialize Particle Animation System
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
      this.particleSystem = new ParticleSystem('particle-canvas');
    }

    // Log ready
    console.log('V-orra website initialized');
  }

  initNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    // Scroll effect for nav
    // Scroll effect for nav
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 100) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    const nav = document.querySelector('.nav');

    if (toggle && links && nav) {
      // Create overlay element if it doesn't exist
      let overlay = document.querySelector('.nav-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        nav.appendChild(overlay);
      }

      const openMenu = () => {
        links.classList.add('active');
        toggle.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
      };

      const closeMenu = () => {
        links.classList.remove('active');
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('menu-open');
      };

      toggle.addEventListener('click', () => {
        if (links.classList.contains('active')) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      // Close menu on overlay click
      overlay.addEventListener('click', closeMenu);

      // Close menu on link click
      links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links.classList.contains('active')) {
          closeMenu();
        }
      });

      // Close menu on resize to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && links.classList.contains('active')) {
          closeMenu();
        }
      });
    }
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
