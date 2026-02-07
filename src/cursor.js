/**
 * V-ORRA Custom Cursor System
 * Simple, reliable cursor that follows the mouse
 */

// Singleton to prevent duplicates
let instance = null;

export class CustomCursor {
  constructor() {
    // Singleton pattern
    if (instance) {
      return instance;
    }
    instance = this;

    this.cursor = null;
    this.follower = null;
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.followerX = this.mouseX;
    this.followerY = this.mouseY;
    this.raf = null;
    this.isVisible = true;

    // Only init on non-touch devices
    if (!this.isTouchDevice()) {
      this.init();
    }
  }

  isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  init() {
    // Clean up any existing cursors first
    document.querySelectorAll('.cursor').forEach(el => el.remove());
    document.querySelectorAll('.cursor-follower').forEach(el => el.remove());

    // Create cursor dot
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor';
    this.cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 12px;
      height: 12px;
      background: #4285F4;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      will-change: transform;
    `;
    document.body.appendChild(this.cursor);

    // Create follower ring
    this.follower = document.createElement('div');
    this.follower.className = 'cursor-follower';
    this.follower.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(66, 133, 244, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      will-change: transform;
    `;
    document.body.appendChild(this.follower);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    // Bind mouse events
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);

    document.addEventListener('mousemove', this.onMouseMove, { passive: true });
    document.addEventListener('mouseleave', this.onMouseLeave);
    document.addEventListener('mouseenter', this.onMouseEnter);

    // Start animation
    this.animate();

    console.log('Custom cursor initialized');
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  onMouseLeave() {
    this.isVisible = false;
    if (this.cursor) this.cursor.style.opacity = '0';
    if (this.follower) this.follower.style.opacity = '0';
  }

  onMouseEnter() {
    this.isVisible = true;
    if (this.cursor) this.cursor.style.opacity = '1';
    if (this.follower) this.follower.style.opacity = '1';
  }

  animate() {
    // Follower lerp (smooth follow)
    this.followerX += (this.mouseX - this.followerX) * 0.12;
    this.followerY += (this.mouseY - this.followerY) * 0.12;

    // Position cursor exactly at mouse (centered)
    if (this.cursor) {
      this.cursor.style.transform = `translate(${this.mouseX - 6}px, ${this.mouseY - 6}px)`;
    }

    // Position follower with smooth delay (centered)
    if (this.follower) {
      this.follower.style.transform = `translate(${this.followerX - 20}px, ${this.followerY - 20}px)`;
    }

    this.raf = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseleave', this.onMouseLeave);
    document.removeEventListener('mouseenter', this.onMouseEnter);

    if (this.cursor) this.cursor.remove();
    if (this.follower) this.follower.remove();

    document.documentElement.style.cursor = '';
    document.body.style.cursor = '';

    instance = null;
  }
}

export default CustomCursor;
