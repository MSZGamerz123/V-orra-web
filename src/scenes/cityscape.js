/**
 * V-ORRA 3D Cityscape Scene
 * Interactive city with dynamic enforcement zones
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class CityScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.city = null;
        this.roads = [];
        this.buildings = [];
        this.vehicles = [];
        this.zones = [];
        this.lights = [];
        this.particles = null;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();
        this.scrollProgress = 0;

        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createCity();
        this.createRoads();
        this.createZones();
        this.createVehicles();
        this.createParticles();
        this.createGridFloor();
        this.isVisible = true;
        this.observer = null;
        this.frameCount = 0;
        this.bindEvents();
        this.initVisibilityCheck();
        this.animate();
    }

    initVisibilityCheck() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0 });

        this.observer.observe(this.container);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);
    }

    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 25, 35);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(1); // Force 1x pixel ratio for performance
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Keep soft shadows but optimized map size
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }

    createLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x1a1a2e, 0.4);
        this.scene.add(ambient);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(20, 40, 20);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;
        this.scene.add(mainLight);

        // Blue accent light
        const blueLight = new THREE.PointLight(0x00a3ff, 2, 50);
        blueLight.position.set(-15, 10, -15);
        this.scene.add(blueLight);
        this.lights.push(blueLight);

        // Purple accent light
        const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 50);
        purpleLight.position.set(15, 10, 15);
        this.scene.add(purpleLight);
        this.lights.push(purpleLight);

        // System green highlight
        const greenLight = new THREE.PointLight(0x00ff88, 1.5, 30);
        greenLight.position.set(0, 5, 0);
        this.scene.add(greenLight);
        this.lights.push(greenLight);
    }

    createCity() {
        this.city = new THREE.Group();

        // Create building variations
        const buildingTypes = [
            { width: 2, depth: 2, height: 8 },
            { width: 3, depth: 3, height: 12 },
            { width: 2.5, depth: 2.5, height: 15 },
            { width: 4, depth: 3, height: 20 },
            { width: 2, depth: 4, height: 10 },
            { width: 3, depth: 2, height: 6 }
        ];

        // Building material with emissive windows
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a28,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x0a0a1f,
            emissiveIntensity: 0.2
        });

        // Create city grid
        const gridSize = 4;
        const spacing = 6;

        for (let x = -gridSize; x <= gridSize; x++) {
            for (let z = -gridSize; z <= gridSize; z++) {
                // Leave space for roads
                if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
                if (x === 0 || z === 0) continue;

                // Random building type
                const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
                const geometry = new THREE.BoxGeometry(type.width, type.height, type.depth);

                const building = new THREE.Mesh(geometry, buildingMaterial.clone());
                building.position.set(x * spacing, type.height / 2, z * spacing);
                building.castShadow = true;
                building.receiveShadow = true;

                // Add window lights
                this.addBuildingWindows(building, type);

                this.buildings.push(building);
                this.city.add(building);
            }
        }

        this.scene.add(this.city);
    }

    addBuildingWindows(building, type) {
        const windowGeometry = new THREE.PlaneGeometry(0.3, 0.4);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffb800,
            transparent: true,
            opacity: Math.random() > 0.4 ? 0.8 : 0.2
        });

        // Add windows on one side
        const rows = Math.floor(type.height / 1.5);
        const cols = Math.floor(type.width / 0.8);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (Math.random() > 0.7) continue;

                const window = new THREE.Mesh(windowGeometry, windowMaterial.clone());
                window.position.set(
                    (col - cols / 2 + 0.5) * 0.6,
                    -type.height / 2 + (row + 1) * 1.2,
                    type.depth / 2 + 0.01
                );
                building.add(window);
            }
        }
    }

    createRoads() {
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x1f1f2e,
            metalness: 0.2,
            roughness: 0.9
        });

        // Main roads
        const roadWidth = 4;
        const roadLength = 70;

        // Horizontal road
        const hRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(roadLength, roadWidth),
            roadMaterial
        );
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.y = 0.01;
        hRoad.receiveShadow = true;
        this.scene.add(hRoad);
        this.roads.push(hRoad);

        // Vertical road
        const vRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(roadWidth, roadLength),
            roadMaterial
        );
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.y = 0.01;
        vRoad.receiveShadow = true;
        this.scene.add(vRoad);
        this.roads.push(vRoad);

        // Road markings
        this.addRoadMarkings();
    }

    addRoadMarkings() {
        const markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });

        // Dashed center lines
        for (let i = -30; i < 30; i += 2) {
            const marking = new THREE.Mesh(
                new THREE.PlaneGeometry(0.8, 0.1),
                markingMaterial
            );
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(i, 0.02, 0);
            this.scene.add(marking);

            const marking2 = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 0.8),
                markingMaterial
            );
            marking2.rotation.x = -Math.PI / 2;
            marking2.position.set(0, 0.02, i);
            this.scene.add(marking2);
        }
    }

    createZones() {
        const zoneTypes = [
            { name: 'hospital', color: 0xff3b3b, position: { x: -12, z: -8 } },
            { name: 'school', color: 0xffb800, position: { x: 12, z: -12 } },
            { name: 'court', color: 0x00a3ff, position: { x: -8, z: 12 } }
        ];

        zoneTypes.forEach(zoneType => {
            const zone = this.createZone(zoneType);
            this.zones.push(zone);
        });
    }

    createZone(config) {
        const group = new THREE.Group();

        // Zone base (circular area)
        const zoneGeometry = new THREE.CircleGeometry(5, 32);
        const zoneMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });

        const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
        zoneMesh.rotation.x = -Math.PI / 2;
        zoneMesh.position.y = 0.02;
        group.add(zoneMesh);

        // Zone ring
        const ringGeometry = new THREE.RingGeometry(4.8, 5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        group.add(ring);

        // Zone icon (simplified building)
        const iconGeometry = new THREE.BoxGeometry(2, 3, 2);
        const iconMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 0.3
        });

        const icon = new THREE.Mesh(iconGeometry, iconMaterial);
        icon.position.y = 1.5;
        icon.castShadow = true;
        group.add(icon);

        // Zone pulse effect
        const pulseRing = new THREE.Mesh(
            new THREE.RingGeometry(4.5, 5, 32),
            new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            })
        );
        pulseRing.rotation.x = -Math.PI / 2;
        pulseRing.position.y = 0.04;
        group.add(pulseRing);

        // Animate pulse
        gsap.to(pulseRing.scale, {
            x: 1.5,
            y: 1.5,
            duration: 2,
            repeat: -1,
            ease: 'power2.out'
        });

        gsap.to(pulseRing.material, {
            opacity: 0.6,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut'
        });

        group.position.set(config.position.x, 0, config.position.z);
        group.userData = { type: 'zone', name: config.name, color: config.color };

        this.scene.add(group);

        return group;
    }

    createVehicles() {
        const vehicleCount = 8;
        const colors = [0xffffff, 0x3b82f6, 0xef4444, 0x10b981];

        for (let i = 0; i < vehicleCount; i++) {
            const vehicle = this.createVehicle(colors[i % colors.length]);

            // Random position on roads
            const onHorizontal = Math.random() > 0.5;
            if (onHorizontal) {
                vehicle.position.set(
                    (Math.random() - 0.5) * 50,
                    0.3,
                    (Math.random() - 0.5) * 3
                );
                vehicle.userData.direction = new THREE.Vector3(Math.random() > 0.5 ? 1 : -1, 0, 0);
            } else {
                vehicle.position.set(
                    (Math.random() - 0.5) * 3,
                    0.3,
                    (Math.random() - 0.5) * 50
                );
                vehicle.rotation.y = Math.PI / 2;
                vehicle.userData.direction = new THREE.Vector3(0, 0, Math.random() > 0.5 ? 1 : -1);
            }

            vehicle.userData.speed = 0.03 + Math.random() * 0.02;
            this.vehicles.push(vehicle);
            this.scene.add(vehicle);
        }
    }

    createVehicle(color) {
        const group = new THREE.Group();

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.8,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);

        // Car roof
        const roofGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.7);
        const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
        roof.position.y = 0.65;
        roof.castShadow = true;
        group.add(roof);

        // Headlights
        const lightGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.2);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });

        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(0.75, 0.25, 0.25);
        group.add(leftLight);

        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(0.75, 0.25, -0.25);
        group.add(rightLight);

        // Taillights
        const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });

        const leftTail = new THREE.Mesh(lightGeometry, tailMaterial);
        leftTail.position.set(-0.75, 0.25, 0.25);
        group.add(leftTail);

        const rightTail = new THREE.Mesh(lightGeometry, tailMaterial);
        rightTail.position.set(-0.75, 0.25, -0.25);
        group.add(rightTail);

        return group;
    }

    createParticles() {
        const particleCount = 80; // Reduced from 200 for better performance
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [
            new THREE.Color(0x00a3ff),
            new THREE.Color(0x8b5cf6),
            new THREE.Color(0x00ff88)
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createGridFloor() {
        const gridHelper = new THREE.GridHelper(100, 50, 0x1a1a28, 0x0f0f18);
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);

        // Floor plane
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            roughness: 0.9,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.01;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Scroll progress
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = window.scrollY / scrollHeight;
        });
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    updateCamera() {
        // Scroll-based camera movement
        const targetY = 25 - this.scrollProgress * 10;
        const targetZ = 35 - this.scrollProgress * 15;

        this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.05;

        // Mouse-based subtle rotation
        const targetRotX = this.mouse.y * 0.1;
        const targetRotY = this.mouse.x * 0.1;

        this.camera.rotation.x += (targetRotX - this.camera.rotation.x) * 0.02;
        this.city.rotation.y += (targetRotY - this.city.rotation.y) * 0.02;
    }

    updateVehicles() {
        this.vehicles.forEach(vehicle => {
            // Move vehicle
            vehicle.position.add(
                vehicle.userData.direction.clone().multiplyScalar(vehicle.userData.speed)
            );

            // Check zone intersection
            this.zones.forEach(zone => {
                const distance = vehicle.position.distanceTo(zone.position);
                if (distance < 5) {
                    // Vehicle in zone - slow down
                    vehicle.userData.speed = Math.max(vehicle.userData.speed * 0.98, 0.01);

                    // Visual feedback
                    const zoneColor = new THREE.Color(zone.userData.color);
                    vehicle.children[0].material.emissive = zoneColor;
                    vehicle.children[0].material.emissiveIntensity = 0.3;
                } else {
                    vehicle.userData.speed = Math.min(vehicle.userData.speed * 1.01, 0.05);
                    vehicle.children[0].material.emissiveIntensity = 0;
                }
            });

            // Wrap around
            if (Math.abs(vehicle.position.x) > 35) {
                vehicle.position.x *= -0.9;
            }
            if (Math.abs(vehicle.position.z) > 35) {
                vehicle.position.z *= -0.9;
            }
        });
    }

    updateParticles() {
        const time = this.clock.getElapsedTime();
        const positions = this.particles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i) * 0.01;

            if (positions[i + 1] > 30) positions[i + 1] = 0;
            if (positions[i + 1] < 0) positions[i + 1] = 30;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.y += 0.0002;
    }

    updateLights() {
        const time = this.clock.getElapsedTime();

        this.lights.forEach((light, i) => {
            light.intensity = 1.5 + Math.sin(time * 0.5 + i) * 0.5;
        });
    }

    animate() {
        // Store ID to cancel on destroy
        this.rafId = requestAnimationFrame(this.animate.bind(this));

        // Skip rendering completely if not visible
        if (!this.isVisible || !this.scene || !this.camera || !this.renderer) return;

        // Frame throttling: only update every 2nd frame for non-critical updates
        this.frameCount++;
        const isFullUpdate = this.frameCount % 2 === 0;

        this.updateCamera();

        // Throttle non-critical updates
        if (isFullUpdate) {
            this.updateVehicles();
            this.updateParticles();
            this.updateLights();
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Zone activation on scroll
    activateZone(zoneName) {
        const zone = this.zones.find(z => z.userData.name === zoneName);
        if (zone) {
            gsap.to(zone.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.5,
                ease: 'power2.out'
            });

            // Focus camera on zone
            gsap.to(this.camera.position, {
                x: zone.position.x * 0.5,
                z: zone.position.z + 15,
                duration: 1.5,
                ease: 'power3.inOut'
            });
        }
    }

    deactivateZone(zoneName) {
        const zone = this.zones.find(z => z.userData.name === zoneName);
        if (zone) {
            gsap.to(zone.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        this.renderer.dispose();
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        // Remove canvas
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}
