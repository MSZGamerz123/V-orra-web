import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initTrendChart() {
    const chartContainer = document.getElementById('trendBarChart');
    if (!chartContainer) return;

    const data = [
        { year: '2021', accidents: 412432, fatalities: 153972, injuries: 384448 },
        { year: '2022', accidents: 461312, fatalities: 168491, injuries: 443366 },
        { year: '2023', accidents: 480583, fatalities: 172890, injuries: 462825 }
    ];

    const maxVal = 600000; // Increased max for better headroom
    const steps = 6;
    const stepVal = maxVal / steps;

    chartContainer.innerHTML = '';

    // Create Y-Axis and Grid
    const gridContainer = document.createElement('div');
    gridContainer.className = 'chart-grid';

    for (let i = steps; i >= 0; i--) {
        const val = i * stepVal;
        const gridLine = document.createElement('div');
        gridLine.className = 'grid-line';
        gridLine.style.bottom = `${(i / steps) * 100}%`;

        const label = document.createElement('span');
        label.className = 'grid-label';
        label.textContent = val === 0 ? '0' : (val / 1000) + 'k';

        gridLine.appendChild(label);
        gridContainer.appendChild(gridLine);
    }
    chartContainer.appendChild(gridContainer);

    // Create Bars Container
    const barsArea = document.createElement('div');
    barsArea.className = 'chart-bars-area';

    data.forEach(item => {
        const group = document.createElement('div');
        group.className = 'bar-group';

        const label = document.createElement('div');
        label.className = 'year-label';
        label.textContent = item.year;

        const barsDiv = document.createElement('div');
        barsDiv.className = 'bars-container';

        // Accidents Bar
        barsDiv.appendChild(createBar(item.accidents, maxVal, 'accidents', 'Accidents: ' + item.accidents.toLocaleString()));
        // Fatalities Bar
        barsDiv.appendChild(createBar(item.fatalities, maxVal, 'fatalities', 'Fatalities: ' + item.fatalities.toLocaleString()));
        // Injuries Bar
        barsDiv.appendChild(createBar(item.injuries, maxVal, 'injuries', 'Injuries: ' + item.injuries.toLocaleString()));

        group.appendChild(barsDiv);
        group.appendChild(label);

        barsArea.appendChild(group);
    });

    chartContainer.appendChild(barsArea);

    // Animate bars on scroll
    gsap.utils.toArray('.bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-height'); // Changed to data-height for clarity
        gsap.fromTo(bar,
            { height: 0 },
            {
                height: width,
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: chartContainer,
                    start: 'top 80%'
                }
            }
        );
    });
}

function createBar(value, max, type, tooltipText) {
    const percentage = (value / max) * 100;
    const barWrapper = document.createElement('div');
    barWrapper.className = 'bar-wrapper';

    const bar = document.createElement('div');
    bar.className = `bar-fill ${type}`;
    bar.setAttribute('data-height', `${percentage}%`);
    // Initial state for animation
    bar.style.height = '0%';

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'bar-tooltip';
    tooltip.textContent = tooltipText;
    bar.appendChild(tooltip);

    barWrapper.appendChild(bar);
    return barWrapper;
}
