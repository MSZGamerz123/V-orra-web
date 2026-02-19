import { getGlobalStats } from '/src/firebase-config.js';

// Configuration
const CONFIG = {
    animationDuration: 2000,
    chartColors: {
        tickets: {
            bg: 'rgba(41, 151, 255, 0.2)',
            border: '#2997ff',
            glow: '#2997ff'
        },
        contacts: {
            bg: 'rgba(48, 209, 88, 0.2)',
            border: '#30d158',
            glow: '#30d158'
        }
    }
};

// State
let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
    initParallax();
    await loadDashboardData();
});

// Parallax Effect for Cards
function initParallax() {
    const cards = document.querySelectorAll('.glass-panel');

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        cards.forEach(card => {
            const speed = card.getAttribute('data-speed') || 1;
            const xOffset = x * speed;
            const yOffset = y * speed;

            // Subtle tilt
            card.style.transform = `perspective(1000px) rotateX(${yOffset * 0.05}deg) rotateY(${xOffset * 0.05}deg) translateY(-5px)`;
        });
    });
}

// Load Data
async function loadDashboardData() {
    const ticketsValueEl = document.getElementById('tickets-value');
    const contactsValueEl = document.getElementById('contacts-value');
    const ticketsRing = document.getElementById('tickets-ring');
    const contactsRing = document.getElementById('contacts-ring');
    const chartCtx = document.getElementById('dashboardChart').getContext('2d');

    try {
        const stats = await getGlobalStats();

        if (stats.success) {
            // Updated mock targets for progress rings (assuming 100k goal for visuals)
            const ticketGoal = 10000;
            const contactGoal = 5000;

            // Animate Numbers
            animateCount(ticketsValueEl, 0, stats.tickets, CONFIG.animationDuration);
            animateCount(contactsValueEl, 0, stats.contacts, CONFIG.animationDuration * 1.2);

            // Animate Rings
            setProgress(ticketsRing, Math.min((stats.tickets / ticketGoal) * 100, 100));
            setProgress(contactsRing, Math.min((stats.contacts / contactGoal) * 100, 100));

            // Render Premium Chart
            renderChart(chartCtx, stats);

        } else {
            handleError(ticketsValueEl, contactsValueEl);
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
        handleError(ticketsValueEl, contactsValueEl);
    }
}

function animateCount(el, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart

        el.textContent = Math.floor(ease * (end - start) + start).toLocaleString();

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            el.textContent = end.toLocaleString();
        }
    };
    window.requestAnimationFrame(step);
}

function setProgress(circle, percent) {
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    const offset = circumference - (percent / 100) * circumference;

    // Trigger layout reflow
    circle.getBoundingClientRect();

    circle.style.strokeDashoffset = offset;
}

function renderChart(ctx, stats) {
    // Destroy previous instance
    if (charts.main) charts.main.destroy();

    // Gradient 1
    const gradientTickets = ctx.createLinearGradient(0, 0, 0, 400);
    gradientTickets.addColorStop(0, 'rgba(41, 151, 255, 0.5)');
    gradientTickets.addColorStop(1, 'rgba(41, 151, 255, 0)');

    // Gradient 2
    const gradientContacts = ctx.createLinearGradient(0, 0, 0, 400);
    gradientContacts.addColorStop(0, 'rgba(48, 209, 88, 0.5)');
    gradientContacts.addColorStop(1, 'rgba(48, 209, 88, 0)');

    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';

    charts.main = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Tickets Generated', 'Community Contacts'],
            datasets: [{
                label: 'Global Impact',
                data: [stats.tickets, stats.contacts],
                backgroundColor: [gradientTickets, gradientContacts],
                borderColor: [CONFIG.chartColors.tickets.border, CONFIG.chartColors.contacts.border],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        borderDash: [5, 5]
                    },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}

function handleError(el1, el2) {
    const errHtml = '<span style="font-size: 1.5rem; color: var(--text-secondary)">-</span>';
    el1.innerHTML = errHtml;
    el2.innerHTML = errHtml;
}
