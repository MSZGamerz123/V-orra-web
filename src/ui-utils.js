/**
 * UI Utilities for V-orra
 * Handles premium glass popups and notifications
 */

export function showGlassPopup(title, message, type = 'info', actionCallback = null, actionText = 'OK') {
    // Remove existing popup if any
    const existing = document.getElementById('glass-popup-overlay');
    if (existing) existing.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'glass-popup-overlay';
    overlay.className = 'glass-popup-overlay';

    // Icon based on type
    let icon = '✨';
    let iconClass = 'info';
    if (type === 'success') { icon = '✓'; iconClass = 'success'; }
    if (type === 'error') { icon = '✕'; iconClass = 'error'; }
    if (type === 'warning') { icon = '!'; iconClass = 'warning'; }

    // Create content
    overlay.innerHTML = `
        <div class="glass-popup-content">
            <div class="glass-popup-icon ${iconClass}">${icon}</div>
            <h3 class="glass-popup-title">${title}</h3>
            <p class="glass-popup-message">${message}</p>
            <div class="glass-popup-actions">
                <button id="glass-popup-btn" class="glass-popup-btn">${actionText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animation entry
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });

    // Handlers
    const closeBtn = overlay.querySelector('#glass-popup-btn');
    const close = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
        if (actionCallback) actionCallback();
    };

    closeBtn.onclick = close;
    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };
}

/**
 * Shows a toast notification
 */
export function showToast(message, type = 'info') {
    // Implementation for smaller non-blocking notifications could go here
    console.log(`Toast [${type}]: ${message}`);
}
