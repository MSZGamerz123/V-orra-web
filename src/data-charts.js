/**
 * Data Charts - Premium Line Chart for Data & Insights Page
 * SVG-based animated line chart with smooth curves, tooltips, and gradient fills
 */

const trendData = [
    { year: '2021', accidents: 412432, fatalities: 153972, injuries: 384448 },
    { year: '2022', accidents: 461312, fatalities: 168491, injuries: 443366 },
    { year: '2023', accidents: 480583, fatalities: 172890, injuries: 462825 }
];

const seriesConfig = [
    { key: 'accidents', label: 'Accidents', color: '#4285F4', glowColor: 'rgba(66,133,244,0.4)' },
    { key: 'injuries', label: 'Injuries', color: '#FF9F43', glowColor: 'rgba(255,159,67,0.4)' },
    { key: 'fatalities', label: 'Fatalities', color: '#FF6B6B', glowColor: 'rgba(255,107,107,0.4)' }
];

/**
 * Create a smooth bezier curve through given points
 */
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

/**
 * Initialize the SVG line chart
 */
export function initTrendChart() {
    const container = document.getElementById('trendBarChart');
    if (!container) return;

    const canvas = document.getElementById('trendChart');
    if (canvas) canvas.style.display = 'none';

    // Chart layout
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 750;
    const height = 400;
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Y-axis range
    const allValues = trendData.flatMap(d => seriesConfig.map(s => d[s.key]));
    const maxVal = Math.max(...allValues) * 1.08;
    const minVal = Math.min(...allValues) * 0.82;

    const scaleY = (val) => chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
    const scaleX = (i) => (i / (trendData.length - 1)) * chartW;

    // ─── Build SVG ───
    container.innerHTML = '';
    container.className = 'line-chart-wrapper';

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'line-chart-svg');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // ─── Defs ───
    const defs = document.createElementNS(NS, 'defs');

    // Area gradients
    seriesConfig.forEach(s => {
        const grad = document.createElementNS(NS, 'linearGradient');
        grad.setAttribute('id', `area-${s.key}`);
        grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
        grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');

        const s1 = document.createElementNS(NS, 'stop');
        s1.setAttribute('offset', '0%');
        s1.setAttribute('stop-color', s.color);
        s1.setAttribute('stop-opacity', '0.3');

        const s2 = document.createElementNS(NS, 'stop');
        s2.setAttribute('offset', '100%');
        s2.setAttribute('stop-color', s.color);
        s2.setAttribute('stop-opacity', '0.02');

        grad.appendChild(s1); grad.appendChild(s2);
        defs.appendChild(grad);
    });

    // Glow filter
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', 'line-glow');
    filter.setAttribute('x', '-20%'); filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%'); filter.setAttribute('height', '140%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3');
    blur.setAttribute('result', 'glow');
    const merge = document.createElementNS(NS, 'feMerge');
    const mn1 = document.createElementNS(NS, 'feMergeNode');
    mn1.setAttribute('in', 'glow');
    const mn2 = document.createElementNS(NS, 'feMergeNode');
    mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1); merge.appendChild(mn2);
    filter.appendChild(blur); filter.appendChild(merge);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // ─── Grid ───
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
        line.setAttribute('stroke-dasharray', '6 4');
        gridG.appendChild(line);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', -14); label.setAttribute('y', y + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'chart-axis-label');
        label.textContent = formatNum(val);
        gridG.appendChild(label);
    }

    // X-axis year labels + vertical lines
    trendData.forEach((d, i) => {
        const x = scaleX(i);

        const vLine = document.createElementNS(NS, 'line');
        vLine.setAttribute('x1', x); vLine.setAttribute('x2', x);
        vLine.setAttribute('y1', 0); vLine.setAttribute('y2', chartH);
        vLine.setAttribute('stroke', 'rgba(255,255,255,0.04)');
        gridG.appendChild(vLine);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', x); label.setAttribute('y', chartH + 32);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'chart-x-label');
        label.textContent = d.year;
        gridG.appendChild(label);
    });

    // Bottom axis line
    const axisLine = document.createElementNS(NS, 'line');
    axisLine.setAttribute('x1', 0); axisLine.setAttribute('x2', chartW);
    axisLine.setAttribute('y1', chartH); axisLine.setAttribute('y2', chartH);
    axisLine.setAttribute('stroke', 'rgba(255,255,255,0.12)');
    axisLine.setAttribute('stroke-width', '1');
    gridG.appendChild(axisLine);

    svg.appendChild(gridG);

    // ─── Data series ───
    const dataG = document.createElementNS(NS, 'g');
    dataG.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);

    seriesConfig.forEach((s, seriesIdx) => {
        const points = trendData.map((d, i) => ({
            x: scaleX(i), y: scaleY(d[s.key]), val: d[s.key]
        }));

        // Smooth curve path string
        const curveD = smoothLine(points);

        // Area fill (close the path to bottom)
        const areaPath = document.createElementNS(NS, 'path');
        const areaD = curveD +
            ` L ${points[points.length - 1].x} ${chartH}` +
            ` L ${points[0].x} ${chartH} Z`;
        areaPath.setAttribute('d', areaD);
        areaPath.setAttribute('fill', `url(#area-${s.key})`);
        areaPath.setAttribute('class', 'line-area');
        areaPath.setAttribute('data-delay', seriesIdx * 250 + 500);
        dataG.appendChild(areaPath);

        // Line stroke
        const linePath = document.createElementNS(NS, 'path');
        linePath.setAttribute('d', curveD);
        linePath.setAttribute('fill', 'none');
        linePath.setAttribute('stroke', s.color);
        linePath.setAttribute('stroke-width', '2.5');
        linePath.setAttribute('stroke-linecap', 'round');
        linePath.setAttribute('stroke-linejoin', 'round');
        linePath.setAttribute('filter', 'url(#line-glow)');
        linePath.setAttribute('class', 'line-path');
        linePath.setAttribute('data-delay', seriesIdx * 250);

        // Dash animation
        const len = approxLen(points);
        linePath.setAttribute('stroke-dasharray', len);
        linePath.setAttribute('stroke-dashoffset', len);
        dataG.appendChild(linePath);

        // Dots + tooltips
        points.forEach((p, i) => {
            // Outer glow ring
            const ring = document.createElementNS(NS, 'circle');
            ring.setAttribute('cx', p.x); ring.setAttribute('cy', p.y);
            ring.setAttribute('r', '10');
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', s.color);
            ring.setAttribute('stroke-width', '1');
            ring.setAttribute('opacity', '0');
            ring.setAttribute('class', 'dot-ring');
            ring.setAttribute('data-delay', seriesIdx * 250 + 800 + i * 120);
            dataG.appendChild(ring);

            // Data point dot
            const dot = document.createElementNS(NS, 'circle');
            dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
            dot.setAttribute('r', '4.5');
            dot.setAttribute('fill', s.color);
            dot.setAttribute('stroke', '#0a0a12');
            dot.setAttribute('stroke-width', '2.5');
            dot.setAttribute('opacity', '0');
            dot.setAttribute('class', 'line-dot');
            dot.setAttribute('data-delay', seriesIdx * 250 + 700 + i * 120);
            dataG.appendChild(dot);

            // Value tooltip (always shown after animation)
            const valText = document.createElementNS(NS, 'text');
            valText.setAttribute('x', p.x);
            valText.setAttribute('y', p.y - 18);
            valText.setAttribute('text-anchor', 'middle');
            valText.setAttribute('class', 'dot-value-label');
            valText.setAttribute('data-delay', seriesIdx * 250 + 900 + i * 120);
            valText.textContent = p.val.toLocaleString('en-IN');
            dataG.appendChild(valText);
        });
    });

    svg.appendChild(dataG);
    container.appendChild(svg);

    // ─── Animate everything in ───
    requestAnimationFrame(() => {
        // Lines draw in
        svg.querySelectorAll('.line-path').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.15, 1)';
                el.setAttribute('stroke-dashoffset', '0');
            }, delay);
        });

        // Area fades in
        svg.querySelectorAll('.line-area').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 1s ease-out';
                el.style.opacity = '1';
            }, delay);
        });

        // Dots pop in
        svg.querySelectorAll('.line-dot').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 0.3s ease, r 0.2s ease';
                el.setAttribute('opacity', '1');
            }, delay);
        });

        // Rings fade in 
        svg.querySelectorAll('.dot-ring').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease';
                el.setAttribute('opacity', '0.25');
            }, delay);
        });

        // Value labels fade in
        svg.querySelectorAll('.dot-value-label').forEach(el => {
            const delay = parseInt(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease';
                el.style.opacity = '1';
            }, delay);
        });
    });
}

/** Approximate polyline length */
function approxLen(pts) {
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.ceil(len * 1.3); // extra for bezier curves
}

/** Format large numbers */
function formatNum(val) {
    if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
    if (val >= 1000) return Math.round(val / 1000) + 'K';
    return Math.round(val).toString();
}
