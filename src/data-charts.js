/**
 * Data Charts - Premium Responsive Line Chart for Data & Insights Page
 * SVG-based animated line chart with smooth curves, interactive tooltips,
 * gradient fills, and full mobile/touch support
 */

const trendData = [
    { year: '2021', accidents: 412432, fatalities: 153972, injuries: 384448 },
    { year: '2022', accidents: 461312, fatalities: 168491, injuries: 443366 },
    { year: '2023', accidents: 480583, fatalities: 172890, injuries: 462825 }
];

const seriesConfig = [
    { key: 'accidents', label: 'Accidents', color: '#4285F4', glowColor: 'rgba(66,133,244,0.5)' },
    { key: 'injuries', label: 'Injuries', color: '#FF9F43', glowColor: 'rgba(255,159,67,0.5)' },
    { key: 'fatalities', label: 'Fatalities', color: '#FF6B6B', glowColor: 'rgba(255,107,107,0.5)' }
];

/** Create a smooth Catmull-Rom to Bezier curve through the points */
function smoothLine(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        const tension = 0.3;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
}

/** Approximate polyline length (with extra for bezier) */
function approxLen(pts) {
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.ceil(len * 1.5);
}

/** Format large numbers for axis labels */
function formatNum(val) {
    if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
    if (val >= 1000) return Math.round(val / 1000) + 'K';
    return Math.round(val).toString();
}

/** Format number with Indian locale commas */
function formatFull(val) {
    return val.toLocaleString('en-IN');
}

const NS = 'http://www.w3.org/2000/svg';

/**
 * Initialize the responsive SVG line chart
 */
export function initTrendChart() {
    const container = document.getElementById('trendBarChart');
    if (!container) return;

    // Hide original canvas
    const canvas = document.getElementById('trendChart');
    if (canvas) canvas.style.display = 'none';

    // Clear & setup wrapper
    container.innerHTML = '';
    container.className = 'line-chart-wrapper';

    // Determine if mobile
    const isMobile = window.innerWidth <= 600;

    // Chart layout — responsive padding
    const padding = isMobile
        ? { top: 24, right: 16, bottom: 44, left: 48 }
        : { top: 40, right: 50, bottom: 60, left: 80 };

    const width = isMobile ? 480 : 750;
    const height = isMobile ? 380 : 420;
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Y-axis range with clean breakpoints
    const allValues = trendData.flatMap(d => seriesConfig.map(s => d[s.key]));
    const rawMax = Math.max(...allValues);
    const rawMin = Math.min(...allValues);
    // Round to clean L (lakh) boundaries
    const maxVal = Math.ceil(rawMax / 50000) * 50000;
    const minVal = Math.floor(rawMin / 50000) * 50000;

    const scaleY = (val) => chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
    const scaleX = (i) => (i / (trendData.length - 1)) * chartW;

    // ─── Build SVG ───
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'line-chart-svg');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = 'auto';

    // ─── Defs: gradients, filters, clip ───
    const defs = document.createElementNS(NS, 'defs');

    // Area gradients for each series
    seriesConfig.forEach(s => {
        const grad = document.createElementNS(NS, 'linearGradient');
        grad.setAttribute('id', `area-${s.key}`);
        grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
        grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');

        const s1 = document.createElementNS(NS, 'stop');
        s1.setAttribute('offset', '0%');
        s1.setAttribute('stop-color', s.color);
        s1.setAttribute('stop-opacity', '0.35');

        const s2 = document.createElementNS(NS, 'stop');
        s2.setAttribute('offset', '100%');
        s2.setAttribute('stop-color', s.color);
        s2.setAttribute('stop-opacity', '0.02');

        grad.appendChild(s1); grad.appendChild(s2);
        defs.appendChild(grad);
    });

    // Enhanced glow filter
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', 'line-glow');
    filter.setAttribute('x', '-30%'); filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%'); filter.setAttribute('height', '160%');

    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    blur.setAttribute('result', 'glow');

    const merge = document.createElementNS(NS, 'feMerge');
    ['glow', 'SourceGraphic'].forEach(name => {
        const mn = document.createElementNS(NS, 'feMergeNode');
        mn.setAttribute('in', name);
        merge.appendChild(mn);
    });
    filter.appendChild(blur); filter.appendChild(merge);
    defs.appendChild(filter);

    // Dot pulse animation filter
    const pulseFilter = document.createElementNS(NS, 'filter');
    pulseFilter.setAttribute('id', 'dot-pulse');
    pulseFilter.setAttribute('x', '-50%'); pulseFilter.setAttribute('y', '-50%');
    pulseFilter.setAttribute('width', '200%'); pulseFilter.setAttribute('height', '200%');
    const pulseBlur = document.createElementNS(NS, 'feGaussianBlur');
    pulseBlur.setAttribute('stdDeviation', '2');
    pulseBlur.setAttribute('result', 'pulse');
    const pulseMerge = document.createElementNS(NS, 'feMerge');
    ['pulse', 'SourceGraphic'].forEach(name => {
        const mn = document.createElementNS(NS, 'feMergeNode');
        mn.setAttribute('in', name);
        pulseMerge.appendChild(mn);
    });
    pulseFilter.appendChild(pulseBlur); pulseFilter.appendChild(pulseMerge);
    defs.appendChild(pulseFilter);

    svg.appendChild(defs);

    // ─── Grid layer ───
    const gridG = document.createElementNS(NS, 'g');
    gridG.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);

    // Horizontal gridlines + Y labels
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
        const y = (i / gridCount) * chartH;
        const val = maxVal - (i / gridCount) * (maxVal - minVal);

        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', 0); line.setAttribute('x2', chartW);
        line.setAttribute('y1', y); line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(255,255,255,0.06)');
        line.setAttribute('stroke-dasharray', '4 6');
        gridG.appendChild(line);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', -12); label.setAttribute('y', y + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'chart-axis-label');
        label.textContent = formatNum(val);
        gridG.appendChild(label);
    }

    // X-axis year labels + subtle vertical guides
    trendData.forEach((d, i) => {
        const x = scaleX(i);

        const vLine = document.createElementNS(NS, 'line');
        vLine.setAttribute('x1', x); vLine.setAttribute('x2', x);
        vLine.setAttribute('y1', 0); vLine.setAttribute('y2', chartH);
        vLine.setAttribute('stroke', 'rgba(255,255,255,0.04)');
        gridG.appendChild(vLine);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', x); label.setAttribute('y', chartH + 30);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'chart-x-label');
        label.textContent = d.year;
        gridG.appendChild(label);
    });

    // Bottom axis line
    const axisLine = document.createElementNS(NS, 'line');
    axisLine.setAttribute('x1', 0); axisLine.setAttribute('x2', chartW);
    axisLine.setAttribute('y1', chartH); axisLine.setAttribute('y2', chartH);
    axisLine.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    axisLine.setAttribute('stroke-width', '1');
    gridG.appendChild(axisLine);

    // Left axis line
    const leftAxis = document.createElementNS(NS, 'line');
    leftAxis.setAttribute('x1', 0); leftAxis.setAttribute('x2', 0);
    leftAxis.setAttribute('y1', 0); leftAxis.setAttribute('y2', chartH);
    leftAxis.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    leftAxis.setAttribute('stroke-width', '1');
    gridG.appendChild(leftAxis);

    svg.appendChild(gridG);

    // ─── Data series layer ───
    const dataG = document.createElementNS(NS, 'g');
    dataG.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);

    // Store all computed points for tooltip lookup
    const allPoints = [];

    seriesConfig.forEach((s, seriesIdx) => {
        const points = trendData.map((d, i) => ({
            x: scaleX(i), y: scaleY(d[s.key]), val: d[s.key],
            year: d.year, label: s.label, color: s.color
        }));

        allPoints.push({ series: s, points });

        // Smooth curve path
        const curveD = smoothLine(points);

        // Area fill
        const areaPath = document.createElementNS(NS, 'path');
        const areaD = curveD +
            ` L ${points[points.length - 1].x} ${chartH}` +
            ` L ${points[0].x} ${chartH} Z`;
        areaPath.setAttribute('d', areaD);
        areaPath.setAttribute('fill', `url(#area-${s.key})`);
        areaPath.setAttribute('class', 'line-area');
        areaPath.setAttribute('data-delay', seriesIdx * 200 + 400);
        dataG.appendChild(areaPath);

        // Line stroke — thicker with glow
        const linePath = document.createElementNS(NS, 'path');
        linePath.setAttribute('d', curveD);
        linePath.setAttribute('fill', 'none');
        linePath.setAttribute('stroke', s.color);
        linePath.setAttribute('stroke-width', isMobile ? '2.5' : '3');
        linePath.setAttribute('stroke-linecap', 'round');
        linePath.setAttribute('stroke-linejoin', 'round');
        linePath.setAttribute('filter', 'url(#line-glow)');
        linePath.setAttribute('class', 'line-path');
        linePath.setAttribute('data-delay', seriesIdx * 200);

        // Dash animation setup
        const len = approxLen(points);
        linePath.setAttribute('stroke-dasharray', len);
        linePath.setAttribute('stroke-dashoffset', len);
        dataG.appendChild(linePath);

        // Data dots
        const dotRadius = isMobile ? '5' : '5';
        points.forEach((p, i) => {
            // Outer ring (pulsing)
            const ring = document.createElementNS(NS, 'circle');
            ring.setAttribute('cx', p.x); ring.setAttribute('cy', p.y);
            ring.setAttribute('r', isMobile ? '12' : '14');
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', s.color);
            ring.setAttribute('stroke-width', '1.5');
            ring.setAttribute('opacity', '0');
            ring.setAttribute('class', 'dot-ring');
            ring.setAttribute('data-delay', seriesIdx * 200 + 700 + i * 150);
            dataG.appendChild(ring);

            // Main dot
            const dot = document.createElementNS(NS, 'circle');
            dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
            dot.setAttribute('r', dotRadius);
            dot.setAttribute('fill', s.color);
            dot.setAttribute('stroke', '#0a0a14');
            dot.setAttribute('stroke-width', '2.5');
            dot.setAttribute('opacity', '0');
            dot.setAttribute('filter', 'url(#dot-pulse)');
            dot.setAttribute('class', 'line-dot');
            dot.setAttribute('data-delay', seriesIdx * 200 + 600 + i * 150);
            dataG.appendChild(dot);
        });
    });

    svg.appendChild(dataG);

    // ─── Crosshair + Tooltip overlay ───
    const overlayG = document.createElementNS(NS, 'g');
    overlayG.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);
    overlayG.setAttribute('class', 'chart-overlay-group');

    // Vertical crosshair line
    const crosshair = document.createElementNS(NS, 'line');
    crosshair.setAttribute('x1', 0); crosshair.setAttribute('x2', 0);
    crosshair.setAttribute('y1', 0); crosshair.setAttribute('y2', chartH);
    crosshair.setAttribute('stroke', 'rgba(255,255,255,0.25)');
    crosshair.setAttribute('stroke-width', '1');
    crosshair.setAttribute('stroke-dasharray', '4 4');
    crosshair.setAttribute('class', 'chart-crosshair');
    crosshair.style.opacity = '0';
    crosshair.style.transition = 'opacity 0.2s ease';
    overlayG.appendChild(crosshair);

    // Invisible interaction rects for each year column
    trendData.forEach((d, i) => {
        const x = scaleX(i);
        const colW = chartW / trendData.length;
        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', x - colW / 2);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', colW);
        rect.setAttribute('height', chartH);
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('class', 'hover-zone');
        rect.setAttribute('data-index', i);
        overlayG.appendChild(rect);
    });

    svg.appendChild(overlayG);
    container.appendChild(svg);

    // ─── HTML Tooltip (positioned above SVG) ───
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'chart-tooltip';
    tooltipEl.style.opacity = '0';
    tooltipEl.innerHTML = '<div class="chart-tooltip-inner"></div>';
    container.appendChild(tooltipEl);

    // ─── Tooltip interaction logic ───
    function showTooltip(yearIndex) {
        if (yearIndex < 0 || yearIndex >= trendData.length) return;

        const d = trendData[yearIndex];
        const xPos = scaleX(yearIndex);

        // Move crosshair
        crosshair.setAttribute('x1', xPos);
        crosshair.setAttribute('x2', xPos);
        crosshair.style.opacity = '1';

        // Build tooltip content
        const inner = tooltipEl.querySelector('.chart-tooltip-inner');
        inner.innerHTML = `
            <div class="tooltip-year">${d.year}</div>
            ${seriesConfig.map(s => `
                <div class="tooltip-row">
                    <span class="tooltip-dot" style="background:${s.color}"></span>
                    <span class="tooltip-label">${s.label}</span>
                    <span class="tooltip-value" style="color:${s.color}">${formatFull(d[s.key])}</span>
                </div>
            `).join('')}
        `;

        // Position tooltip relative to container
        const svgRect = svg.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const svgScale = svgRect.width / width;
        const tooltipX = (padding.left + xPos) * svgScale + (svgRect.left - containerRect.left);
        const tooltipY = padding.top * svgScale;

        const tooltipWidth = tooltipEl.offsetWidth || 180;
        let left = tooltipX - tooltipWidth / 2;

        // Keep tooltip in bounds
        if (left < 8) left = 8;
        if (left + tooltipWidth > containerRect.width - 8) {
            left = containerRect.width - tooltipWidth - 8;
        }

        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${Math.max(0, tooltipY - 10)}px`;
        tooltipEl.style.opacity = '1';
        tooltipEl.style.transform = 'translateY(0)';

        // Highlight dots for this year
        highlightYear(yearIndex);
    }

    function hideTooltip() {
        crosshair.style.opacity = '0';
        tooltipEl.style.opacity = '0';
        tooltipEl.style.transform = 'translateY(6px)';
        unhighlightAll();
    }

    function highlightYear(yearIdx) {
        // Scale up dots at this year index
        const dots = svg.querySelectorAll('.line-dot');
        const rings = svg.querySelectorAll('.dot-ring');
        dots.forEach((dot, i) => {
            const ptIdx = i % trendData.length;
            if (ptIdx === yearIdx) {
                dot.setAttribute('r', isMobile ? '7' : '8');
            }
        });
        rings.forEach((ring, i) => {
            const ptIdx = i % trendData.length;
            if (ptIdx === yearIdx) {
                ring.setAttribute('opacity', '0.5');
                ring.setAttribute('r', isMobile ? '16' : '20');
            }
        });
    }

    function unhighlightAll() {
        svg.querySelectorAll('.line-dot').forEach(dot => {
            dot.setAttribute('r', isMobile ? '5' : '5');
        });
        svg.querySelectorAll('.dot-ring').forEach(ring => {
            ring.setAttribute('opacity', '0.2');
            ring.setAttribute('r', isMobile ? '12' : '14');
        });
    }

    // Mouse events
    svg.querySelectorAll('.hover-zone').forEach(rect => {
        rect.addEventListener('mouseenter', (e) => {
            showTooltip(parseInt(rect.getAttribute('data-index')));
        });
        rect.addEventListener('mouseleave', hideTooltip);
    });

    // Touch events for mobile
    svg.addEventListener('touchstart', handleTouch, { passive: true });
    svg.addEventListener('touchmove', handleTouch, { passive: true });
    svg.addEventListener('touchend', () => {
        setTimeout(hideTooltip, 1500);
    });

    function handleTouch(e) {
        const touch = e.touches[0];
        const svgRect = svg.getBoundingClientRect();
        const svgScale = width / svgRect.width;
        const touchX = (touch.clientX - svgRect.left) * svgScale - padding.left;

        // Find nearest year
        let nearest = 0;
        let minDist = Infinity;
        trendData.forEach((d, i) => {
            const dist = Math.abs(scaleX(i) - touchX);
            if (dist < minDist) { minDist = dist; nearest = i; }
        });

        showTooltip(nearest);
    }

    // ─── Animate everything in with IntersectionObserver ───
    const animateChart = () => {
        // Lines draw in
        svg.querySelectorAll('.line-path').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.1, 1)';
                el.setAttribute('stroke-dashoffset', '0');
            }, delay);
        });

        // Areas fade in
        svg.querySelectorAll('.line-area').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 1.2s ease-out';
                el.style.opacity = '0.7';
            }, delay);
        });

        // Dots pop in
        svg.querySelectorAll('.line-dot').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 0.4s ease, r 0.3s ease';
                el.setAttribute('opacity', '1');
            }, delay);
        });

        // Rings fade in with pulse class
        svg.querySelectorAll('.dot-ring').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 0.6s ease';
                el.setAttribute('opacity', '0.2');
            }, delay);
        });
    };

    // Use IntersectionObserver so animation triggers when scrolled into view
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(animateChart);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });
        observer.observe(container);
    } else {
        // Fallback
        requestAnimationFrame(animateChart);
    }

    // ─── Handle resize ───
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initTrendChart();
        }, 300);
    });
}
