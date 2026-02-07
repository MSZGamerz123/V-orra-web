/**
 * Particle Morphing Shape Definitions
 * Each shape is an array of normalized coordinates {x, y} from -1 to 1
 * 
 * Shape Order: V-orra Logo → Car/Bike Vehicles → Globe (FULL SCREEN)
 */

// Generate V-orra "V" logo shape - EXTRA THICK geometric V
export function generateLogoShape(count) {
    const points = [];

    // V-orra logo is a VERY THICK geometric V with angular strokes
    // Much bolder than before to match reference image

    const strokeThickness = 0.22; // VERY thick stroke width

    // Distribute particles across the V shape polygon
    // The V is made of two thick diagonal bars

    // Left bar of V: from top-left going down to bottom-center
    const leftBarParticles = Math.floor(count * 0.5);
    for (let i = 0; i < leftBarParticles; i++) {
        const t = i / leftBarParticles;

        // Outer edge of left bar (wider V)
        const outerX = -0.55 + t * 0.55;  // -0.55 to 0
        const outerY = 0.55 - t * 1.1;     // 0.55 to -0.55

        // Inner edge (parallel, shifted right by stroke thickness)
        const innerX = outerX + strokeThickness;
        const innerY = outerY;

        // Random position between outer and inner edge for thickness
        const blend = Math.random();
        const x = outerX + (innerX - outerX) * blend;
        const y = outerY + (Math.random() - 0.5) * 0.03;

        points.push({ x, y });
    }

    // Right bar of V: from top-right going down to bottom-center  
    const rightBarParticles = count - leftBarParticles;
    for (let i = 0; i < rightBarParticles; i++) {
        const t = i / rightBarParticles;

        // Outer edge of right bar (wider V)
        const outerX = 0.55 - t * 0.55;   // 0.55 to 0
        const outerY = 0.55 - t * 1.1;     // 0.55 to -0.55

        // Inner edge (parallel, shifted left by stroke thickness)
        const innerX = outerX - strokeThickness;
        const innerY = outerY;

        // Random position between outer and inner edge for thickness
        const blend = Math.random();
        const x = outerX + (innerX - outerX) * blend;
        const y = outerY + (Math.random() - 0.5) * 0.03;

        points.push({ x, y });
    }

    return points.slice(0, count);
}

// Generate clean CAR outline - simple sedan shape
export function generateCarShape(count) {
    const points = [];

    // Simple, clean car outline following the reference image
    // The car faces LEFT

    // Number of points per section
    const bodyPoints = Math.floor(count * 0.4);
    const roofPoints = Math.floor(count * 0.2);
    const wheelPoints = Math.floor(count * 0.2);
    const detailPoints = count - bodyPoints - roofPoints - wheelPoints;

    // BODY - lower body line (smooth curve from front to back)
    for (let i = 0; i < bodyPoints; i++) {
        const t = i / bodyPoints;
        // Front bumper curve to rear
        const x = -0.5 + t * 1.0;  // -0.5 to 0.5
        let y;

        if (t < 0.15) {
            // Front bumper curve up
            y = -0.15 + Math.pow(t / 0.15, 0.5) * 0.05;
        } else if (t > 0.85) {
            // Rear bumper curve up
            y = -0.15 + Math.pow((1 - t) / 0.15, 0.5) * 0.05;
        } else {
            // Straight bottom line
            y = -0.1;
        }

        points.push({ x, y: y + (Math.random() - 0.5) * 0.01 });
    }

    // ROOF - cabin top line (curved like sedan)
    for (let i = 0; i < roofPoints; i++) {
        const t = i / roofPoints;
        // Hood, windshield, roof, rear window, trunk
        let x, y;

        if (t < 0.2) {
            // Hood (front sloping up)
            x = -0.4 + t * 1.5;
            y = 0 + t * 0.5;
        } else if (t < 0.35) {
            // Windshield 
            x = -0.1 + (t - 0.2) * 0.8;
            y = 0.1 + (t - 0.2) * 1.2;
        } else if (t < 0.65) {
            // Flat roof
            x = 0.02 + (t - 0.35) * 0.5;
            y = 0.28;
        } else if (t < 0.8) {
            // Rear window slope down
            x = 0.17 + (t - 0.65) * 0.8;
            y = 0.28 - (t - 0.65) * 1.2;
        } else {
            // Trunk
            x = 0.29 + (t - 0.8) * 1.0;
            y = 0.1 - (t - 0.8) * 0.8;
        }

        points.push({ x, y: y + (Math.random() - 0.5) * 0.01 });
    }

    // WHEELS - two circles
    const wheelRadius = 0.08;
    const halfWheelPoints = Math.floor(wheelPoints / 2);

    // Front wheel at x = -0.25
    for (let i = 0; i < halfWheelPoints; i++) {
        const angle = (i / halfWheelPoints) * Math.PI * 2;
        points.push({
            x: -0.28 + Math.cos(angle) * wheelRadius,
            y: -0.12 + Math.sin(angle) * wheelRadius
        });
    }

    // Rear wheel at x = 0.25
    for (let i = 0; i < halfWheelPoints; i++) {
        const angle = (i / halfWheelPoints) * Math.PI * 2;
        points.push({
            x: 0.28 + Math.cos(angle) * wheelRadius,
            y: -0.12 + Math.sin(angle) * wheelRadius
        });
    }

    // DETAILS - windows, door lines
    for (let i = 0; i < detailPoints; i++) {
        const t = i / detailPoints;
        // Windows area
        points.push({
            x: -0.05 + t * 0.22 + (Math.random() - 0.5) * 0.02,
            y: 0.12 + (Math.random() - 0.5) * 0.08
        });
    }

    return points.slice(0, count);
}

// Generate clean MOTORCYCLE outline
export function generateBikeShape(count) {
    const points = [];

    // Motorcycle facing LEFT
    const wheelPoints = Math.floor(count * 0.4);
    const bodyPoints = Math.floor(count * 0.4);
    const detailPoints = count - wheelPoints - bodyPoints;

    const halfWheelPoints = Math.floor(wheelPoints / 2);
    const wheelRadius = 0.12;

    // FRONT WHEEL (larger, positioned left)
    for (let i = 0; i < halfWheelPoints; i++) {
        const angle = (i / halfWheelPoints) * Math.PI * 2;
        points.push({
            x: -0.3 + Math.cos(angle) * wheelRadius,
            y: -0.08 + Math.sin(angle) * wheelRadius
        });
    }

    // REAR WHEEL
    for (let i = 0; i < halfWheelPoints; i++) {
        const angle = (i / halfWheelPoints) * Math.PI * 2;
        points.push({
            x: 0.3 + Math.cos(angle) * wheelRadius,
            y: -0.08 + Math.sin(angle) * wheelRadius
        });
    }

    // BODY - frame, tank, seat
    for (let i = 0; i < bodyPoints; i++) {
        const t = i / bodyPoints;
        let x, y;

        if (t < 0.15) {
            // Front fork (diagonal from handlebar to front wheel)
            x = -0.25 + t * 0.4;
            y = 0.2 - t * 1.8;
        } else if (t < 0.25) {
            // Handlebar
            x = -0.3 + (t - 0.15) * 1.0;
            y = 0.22 + (Math.random() - 0.5) * 0.04;
        } else if (t < 0.4) {
            // Tank (curved hump)
            x = -0.15 + (t - 0.25) * 1.3;
            y = 0.12 + Math.sin((t - 0.25) / 0.15 * Math.PI) * 0.08;
        } else if (t < 0.6) {
            // Seat (flat then sloping down)
            x = 0.05 + (t - 0.4) * 1.0;
            y = 0.15 - (t - 0.4) * 0.3;
        } else if (t < 0.75) {
            // Rear fender
            x = 0.25 + (t - 0.6) * 0.5;
            y = 0.05 - (t - 0.6) * 0.5;
        } else if (t < 0.85) {
            // Engine block (lower center)
            x = -0.05 + (t - 0.75) * 1.5;
            y = -0.02 + (Math.random() - 0.5) * 0.04;
        } else {
            // Exhaust pipes
            x = 0.15 + (t - 0.85) * 1.2;
            y = -0.15 + (Math.random() - 0.5) * 0.03;
        }

        points.push({ x, y });
    }

    // DETAILS - headlight, mirrors
    for (let i = 0; i < detailPoints; i++) {
        const t = i / detailPoints;
        if (t < 0.5) {
            // Headlight
            points.push({
                x: -0.32 + (Math.random() - 0.5) * 0.03,
                y: 0.12 + (Math.random() - 0.5) * 0.03
            });
        } else {
            // Taillight
            points.push({
                x: 0.35 + (Math.random() - 0.5) * 0.02,
                y: 0.02 + (Math.random() - 0.5) * 0.02
            });
        }
    }

    return points.slice(0, count);
}

// Combine car and bike shapes - car on top, bike below
export function generateCombinedVehicles(count) {
    const carPoints = Math.floor(count * 0.5);
    const bikePoints = count - carPoints;

    const car = generateCarShape(carPoints);
    const bike = generateBikeShape(bikePoints);

    const combined = [];

    // Car positioned in upper area
    for (const p of car) {
        combined.push({
            x: p.x * 0.7,      // Slightly smaller
            y: p.y * 0.7 + 0.2  // Move up
        });
    }

    // Bike positioned in lower area
    for (const p of bike) {
        combined.push({
            x: p.x * 0.7,       // Slightly smaller
            y: p.y * 0.7 - 0.25  // Move down
        });
    }

    return combined;
}

// Generate 3D globe shape - LARGE to fill screen
export function generateGlobeShape(count) {
    const points = [];

    for (let i = 0; i < count; i++) {
        // Fibonacci sphere distribution for even coverage
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        const x = Math.cos(theta) * Math.sin(phi);
        const y = Math.cos(phi);
        const z = Math.sin(theta) * Math.sin(phi);

        // FULL SCREEN RADIUS - 1.0 for maximum screen coverage
        const radius = 1.0;
        points.push({
            x: x * radius,
            y: y * radius,
            z: z * radius,
            origX: x * radius,
            origY: y * radius,
            origZ: z * radius
        });
    }

    return points;
}

// Interpolate between two shape arrays
export function lerpShapes(from, to, t) {
    const result = [];
    const count = Math.min(from.length, to.length);

    for (let i = 0; i < count; i++) {
        result.push({
            x: from[i].x + (to[i].x - from[i].x) * t,
            y: from[i].y + (to[i].y - from[i].y) * t,
            z: (from[i].z || 0) + ((to[i].z || 0) - (from[i].z || 0)) * t
        });
    }

    return result;
}

// Easing functions
export const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2
};
