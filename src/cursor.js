/**
 * V-ORRA Custom Cursor System - Dual Layer V-Shape
 * Primary V: Acts as the click point (Front)
 * Secondary V: Follows with a delay (Rear)
 */

// Singleton to prevent duplicates
let instance = null;

export class CustomCursor {
  constructor() {
    if (instance) return instance;
    instance = this;

    this.container = null;
    this.primary = null;
    this.secondary = null;

    // Mouse Position
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;

    // Follower Positions
    this.primaryX = this.mouseX;
    this.primaryY = this.mouseY;
    this.secondaryX = this.mouseX;
    this.secondaryY = this.mouseY;

    // Rotation
    this.angle = 135; // Default: Points NW (135 degrees if 0 is Pointing Down? No, let's adjust visually)
    // If V points DOWN (0deg), then to point Top-Left (NW), we need 135deg.
    // Let's settle: 0deg = Upright V. 
    // We want default state: NW tilt.
    // We want hover state: Upright (0deg).

    // Current rotation values for interpolation
    this.primaryAngle = 135;
    this.secondaryAngle = 135;

    // State
    this.isHovering = false;
    this.isClicking = false;
    this.isVisible = false; // Start hidden until mouse moves

    this.raf = null;

    if (!this.isTouchDevice()) {
      this.init();
    }
  }

  isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  init() {
    // cleanup
    document.querySelectorAll('.cursor-container').forEach(el => el.remove());

    // Create Container
    this.container = document.createElement('div');
    this.container.className = 'cursor-container';

    // Create Primary (Front)
    this.primary = document.createElement('div');
    this.primary.className = 'v-cursor cursor-primary';
    this.container.appendChild(this.primary);

    // Create Secondary (Rear)
    this.secondary = document.createElement('div');
    this.secondary.className = 'v-cursor cursor-secondary';
    this.container.appendChild(this.secondary);

    document.body.appendChild(this.container);

    // Bind Events
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    document.addEventListener('mousemove', this.onMouseMove, { passive: true });
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mouseenter', this.onMouseEnter);
    document.addEventListener('mouseleave', this.onMouseLeave);

    // Hover Detection (Delegate)
    this.initHoverListeners();

    // Start Loop
    this.animate();

    console.log('Dual-layer V-cursor initialized');
  }

  initHoverListeners() {
    const hoverTags = 'a, button, .btn, input, textarea, select, label, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTags)) {
        this.isHovering = true;
        this.primary.classList.add('hovering');
        this.secondary.classList.add('hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTags)) {
        this.isHovering = false;
        this.primary.classList.remove('hovering');
        this.secondary.classList.remove('hovering');
      }
    });
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (!this.isVisible) {
      this.isVisible = true;
      this.container.style.opacity = '1';
    }
  }

  onMouseDown() {
    this.isClicking = true;
    this.primary.classList.add('clicking');
    this.secondary.classList.add('clicking');
  }

  onMouseUp() {
    this.isClicking = false;
    this.primary.classList.remove('clicking');
    this.secondary.classList.remove('clicking');
  }

  onMouseLeave() {
    this.isVisible = false;
    this.container.style.opacity = '0';
  }

  onMouseEnter() {
    this.isVisible = true;
    this.container.style.opacity = '1';
  }

  animate() {
    // LERP for Smooth Movement
    // Primary: Instant (1.0) - Matches mouse speed exactly as requested
    // Secondary: Smoother trail (0.15) - Creates the depth effect

    this.primaryX = this.mouseX;
    this.primaryY = this.mouseY;

    this.secondaryX += (this.mouseX - this.secondaryX) * 0.15;
    this.secondaryY += (this.mouseY - this.secondaryY) * 0.15;

    // Rotation Logic
    // Target Angle:
    // Default (Idle): 135deg (Points NW, assuming 0 is Down)
    // Hovering: 0deg (Points Down - "Upright V")

    const targetAngle = this.isHovering ? 0 : 135;

    // Smooth rotation mix (keep this smooth for premium feel)
    this.primaryAngle += (targetAngle - this.primaryAngle) * 0.2;
    this.secondaryAngle += (targetAngle - this.secondaryAngle) * 0.15;

    // Apply Transforms
    // We offset by half width/height so the "transform-origin" feels centered effectively,
    // BUT the user said "bottom vertex... acts as the click hotspot".
    // The V shape is 24x24. Bottom vertex is at (12px, 24px) inside the box.
    // We want (12, 24) to be at mouseX, mouseY.
    // Translate logic: translate(mouseX - 12, mouseY - 24) puts bottom point at mouse.

    // Ensure we use 3D transform for hardware acceleration
    if (this.primary) {
      this.primary.style.transform = `
        translate3d(${this.primaryX - 12}px, ${this.primaryY - 24}px, 0) 
        rotate(${this.primaryAngle}deg)
      `;
    }

    if (this.secondary) {
      this.secondary.style.transform = `
        translate3d(${this.secondaryX - 12}px, ${this.secondaryY - 24}px, 0) 
        rotate(${this.secondaryAngle}deg)
      `;
    }

    this.raf = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mouseenter', this.onMouseEnter);
    document.removeEventListener('mouseleave', this.onMouseLeave);

    if (this.container) this.container.remove();

    instance = null;
  }
}

export default CustomCursor;
