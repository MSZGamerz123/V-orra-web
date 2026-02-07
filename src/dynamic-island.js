/**
 * Dynamic Island - Left-Aligned Notch Navigation
 * Transforms from notch (at top) to floating island (on scroll)
 * Expands horizontally to show navigation
 */

export class DynamicIsland {
    constructor() {
        this.island = null;
        this.isNavOpen = false;
        this.isFloating = false;
        this.currentPage = this.detectCurrentPage();
        this.scrollThreshold = 50; // Pixels to scroll before floating

        // Navigation links
        this.navLinks = [
            { icon: 'home', label: 'Home', href: '/', key: 'index' },
            { icon: 'chart', label: 'Data', href: '/data.html', key: 'data' },
            { icon: 'cpu', label: 'Tech', href: '/features.html', key: 'features' },
            { icon: 'users', label: 'Team', href: '/founders.html', key: 'founders' },
            { icon: 'mail', label: 'Contact', href: '/contact.html', key: 'contact' },
            { icon: 'lock', label: 'Sign In', href: '/auth.html', key: 'auth' }
        ];

        // Icons SVG
        this.icons = {
            home: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
            chart: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            cpu: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>`,
            users: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            mail: `<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>`,
            lock: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
            shield: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            menu: `<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
            close: `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
        };

        this.init();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path.endsWith('index.html')) return 'index';
        const match = path.match(/\/([^/]+)\.html$/);
        return match ? match[1] : 'index';
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createIslandElement();
        this.setupEventListeners();
        this.setupScrollListener();
        console.log('Dynamic Island Navigation initialized');
    }

    createIslandElement() {
        this.island = document.createElement('div');
        this.island.className = 'dynamic-island compact';
        this.island.id = 'dynamic-island';

        this.island.innerHTML = `
            <div class="island-content">
                <div class="island-left">
                    <div class="island-icon">${this.icons.shield}</div>
                    <span class="island-text"><span class="v-letter">V</span><span class="orra-text">-orra</span></span>
                </div>
                <nav class="island-nav">
                    <div class="island-nav-grid">
                        ${this.navLinks.map(link => `
                            <a href="${link.href}" class="island-nav-item ${link.key === this.currentPage ? 'active' : ''}" data-key="${link.key}">
                                <div class="nav-item-icon">${this.icons[link.icon]}</div>
                                <span class="nav-item-label">${link.label}</span>
                            </a>
                        `).join('')}
                    </div>
                </nav>
                <div class="island-right">
                    <div class="island-menu-toggle">${this.icons.menu}</div>
                </div>
            </div>
        `;

        // Remove any existing island
        const existingIsland = document.getElementById('dynamic-island');
        if (existingIsland) {
            existingIsland.remove();
        }

        // Insert at beginning of body
        document.body.insertBefore(this.island, document.body.firstChild);
    }

    setupEventListeners() {
        // Toggle menu on click
        this.island.addEventListener('click', (e) => {
            // Check if clicked on a nav link
            if (e.target.closest('.island-nav-item')) {
                return; // Let the link navigate
            }

            // Toggle navigation
            this.toggleNav();
        });

        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isNavOpen && !e.target.closest('#dynamic-island')) {
                this.closeNav();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isNavOpen) {
                this.closeNav();
            }
        });
    }

    setupScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        this.handleScroll();
    }

    handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > this.scrollThreshold && !this.isFloating) {
            // Transition to floating island
            this.isFloating = true;
            this.island.classList.add('floating');
        } else if (scrollY <= this.scrollThreshold && this.isFloating) {
            // Transition back to notch
            this.isFloating = false;
            this.island.classList.remove('floating');

            // Close nav when returning to notch
            if (this.isNavOpen) {
                this.closeNav();
            }
        }
    }

    toggleNav() {
        if (this.isNavOpen) {
            this.closeNav();
        } else {
            this.openNav();
        }
    }

    openNav() {
        this.isNavOpen = true;
        this.island.classList.add('nav-open');
        this.island.classList.remove('compact');

        const toggle = this.island.querySelector('.island-menu-toggle');
        if (toggle) toggle.innerHTML = this.icons.close;
    }

    closeNav() {
        this.isNavOpen = false;
        this.island.classList.remove('nav-open');
        this.island.classList.add('compact');

        const toggle = this.island.querySelector('.island-menu-toggle');
        if (toggle) toggle.innerHTML = this.icons.menu;
    }
}

// Auto-initialize
const dynamicIsland = new DynamicIsland();
export default dynamicIsland;
