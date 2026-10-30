import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Studio3DSettings } from '../lib/cms';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  settings: Studio3DSettings;
}

/**
 * Generates an organic closed 2D topographic contour shape using Fourier harmonics
 * matching the cartographic elevation style of Matteo's CV.
 */
function createTopographicShape(
  baseRadius: number,
  seedPhase: number,
  elongationX = 1.25,
  elongationY = 0.88
): THREE.Shape {
  const shape = new THREE.Shape();
  const segments = 96;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const wave1 = Math.sin(theta * 2 + seedPhase) * 0.18;
    const wave2 = Math.cos(theta * 3 - seedPhase * 1.3) * 0.11;
    const wave3 = Math.sin(theta * 5 + seedPhase * 0.7) * 0.05;
    const r = baseRadius * (1 + wave1 + wave2 + wave3);

    const x = Math.cos(theta) * r * elongationX;
    const y = Math.sin(theta) * r * elongationY;

    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

export default function StudioMotionRig3D({ settings }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.engineMode === 'spline' && settings.splineUrl) return;
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer (Strictly adhering to CV palette: Navy, Cobalt, Ice, Coral, Paper)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.3, 9.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting (Zero gold - Pure white, ice blue, deep cobalt & warm coral)
    const ambientLight = new THREE.AmbientLight('#ffffff', 2.3);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight('#fffaf0', 2.8);
    sunKeyLight.position.set(6, 10, 7);
    scene.add(sunKeyLight);

    const iceRimLight = new THREE.DirectionalLight('#d9ebf4', 2.2);
    iceRimLight.position.set(-7, 4, -5);
    scene.add(iceRimLight);

    const cobaltFillLight = new THREE.PointLight('#304774', 3.4, 20);
    cobaltFillLight.position.set(-4, -5, 5);
    scene.add(cobaltFillLight);

    const coralAccentLight = new THREE.PointLight('#f29f8b', 2.4, 16);
    coralAccentLight.position.set(4, 3, 4);
    scene.add(coralAccentLight);

    // 3. Master 3D Topographic Assembly
    const worldRoot = new THREE.Group();
    const baseOffsetX = settings.sceneOffsetX ?? 2.55;
    const baseOffsetY = settings.sceneOffsetY ?? -0.1;
    const updateResponsivePlacement = () => {
      const w = window.innerWidth;
      worldRoot.position.x = w >= 1280 ? baseOffsetX : w >= 1024 ? 2.1 : 0;
      worldRoot.position.y = w >= 1024 ? baseOffsetY : -0.5;
      const scale = w >= 1280 ? 0.92 : w >= 768 ? 0.76 : 0.58;
      worldRoot.scale.setScalar(scale);
    };
    updateResponsivePlacement();
    worldRoot.rotation.x = 0.52;
    worldRoot.rotation.z = -0.18;
    scene.add(worldRoot);

    // 4. Stepped Topographic Elevation Strata matching the CV Palette (NO GOLD)
    const strataGroup = new THREE.Group();
    worldRoot.add(strataGroup);

    const strataConfigs = [
      { radius: 2.65, phase: 0.2, color: '#172a3b', edgeColor: '#304774', roughness: 0.45 },
      { radius: 2.32, phase: 0.85, color: '#304774', edgeColor: '#d9ebf4', roughness: 0.35 },
      { radius: 1.98, phase: 1.5, color: '#d9ebf4', edgeColor: '#304774', roughness: 0.25 },
      { radius: 1.66, phase: 2.2, color: '#ffffff', edgeColor: '#304774', roughness: 0.2 },
      { radius: 1.34, phase: 2.9, color: '#304774', edgeColor: '#d9ebf4', roughness: 0.32 },
      { radius: 1.02, phase: 3.6, color: '#d9ebf4', edgeColor: '#f29f8b', roughness: 0.22 },
      { radius: 0.68, phase: 4.3, color: '#fbd5cd', edgeColor: '#f29f8b', roughness: 0.2 },
    ];

    interface StratumLayer {
      group: THREE.Group;
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
      baseY: number;
      index: number;
    }

    const strataLayers: StratumLayer[] = [];

    strataConfigs.forEach((cfg, idx) => {
      const shape = createTopographicShape(cfg.radius, cfg.phase);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.14,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.035,
        bevelSegments: 3,
        curveSegments: 48,
      });
      geo.rotateX(-Math.PI / 2);

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        roughness: cfg.roughness,
        metalness: 0.08,
      });

      const mesh = new THREE.Mesh(geo, mat);

      const edgesGeo = new THREE.EdgesGeometry(geo, 22);
      const edgesMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cfg.edgeColor),
        transparent: true,
        opacity: 0.55,
      });
      const edgesLine = new THREE.LineSegments(edgesGeo, edgesMat);

      const layerGroup = new THREE.Group();
      const baseY = (idx - 3) * 0.22;
      layerGroup.position.y = baseY;
      layerGroup.add(mesh);
      layerGroup.add(edgesLine);
      strataGroup.add(layerGroup);

      strataLayers.push({
        group: layerGroup,
        mesh,
        mat,
        baseY,
        index: idx,
      });
    });

    // 5. 3D Objects: Non-Gold Palette Materials
    const objectsGroup = new THREE.Group();
    worldRoot.add(objectsGroup);

    const navyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#172a3b'),
      metalness: 0.75,
      roughness: 0.32,
    });
    const cobaltMetalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#304774'),
      metalness: 0.65,
      roughness: 0.28,
    });
    const iceMetalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d9ebf4'),
      metalness: 0.45,
      roughness: 0.25,
    });
    const coralGlossMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f29f8b'),
      metalness: 0.1,
      roughness: 0.18,
      clearcoat: 0.9,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d9ebf4'),
      transmission: 0.8,
      roughness: 0.08,
      ior: 1.5,
      clearcoat: 1,
    });
    const lightDiffuserMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
    });

    // 3D Object A: Summit 3D Motion Knot (Cobalt & Coral, No Gold)
    const summitObject = new THREE.Group();
    summitObject.position.set(0, 1.35, 0);
    const knotGeo = new THREE.TorusKnotGeometry(0.34, 0.085, 96, 16);
    const knotMesh = new THREE.Mesh(knotGeo, cobaltMetalMat);
    summitObject.add(knotMesh);

    const haloRingGeo = new THREE.TorusGeometry(0.62, 0.018, 16, 80);
    const haloRing = new THREE.Mesh(haloRingGeo, coralGlossMat);
    haloRing.rotation.x = Math.PI / 2;
    summitObject.add(haloRing);
    objectsGroup.add(summitObject);

    // 3D Object B: Modular 3D Cinema Camera + Studio Video Light on the Side
    const cameraRigGroup = new THREE.Group();
    cameraRigGroup.position.set(-2.25, 0.45, 0.9);

    // --- CINEMA CAMERA ---
    const cameraBodyGroup = new THREE.Group();

    // 1. Camera Main Chassis (RED / ARRI Cinema Box Body)
    const bodyGeo = new THREE.BoxGeometry(0.58, 0.44, 0.68);
    const bodyMesh = new THREE.Mesh(bodyGeo, navyMat);
    cameraBodyGroup.add(bodyMesh);

    // 2. Side Cheeseplates & Control Screen
    const screenGeo = new THREE.BoxGeometry(0.04, 0.24, 0.36);
    const screenMesh = new THREE.Mesh(screenGeo, iceMetalMat);
    screenMesh.position.set(-0.3, 0.02, 0.05);
    cameraBodyGroup.add(screenMesh);

    // 3. Top Handle Rig
    const handleBarGeo = new THREE.BoxGeometry(0.1, 0.06, 0.52);
    const handleBarMesh = new THREE.Mesh(handleBarGeo, cobaltMetalMat);
    handleBarMesh.position.set(0, 0.34, -0.05);
    cameraBodyGroup.add(handleBarMesh);

    const handlePost1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), cobaltMetalMat);
    handlePost1.position.set(0, 0.25, 0.14);
    cameraBodyGroup.add(handlePost1);

    const handlePost2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), cobaltMetalMat);
    handlePost2.position.set(0, 0.25, -0.22);
    cameraBodyGroup.add(handlePost2);

    // 4. Cinema Prime Lens Barrel
    const lensBarrelGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.42, 32);
    lensBarrelGeo.rotateX(Math.PI / 2);
    const lensBarrelMesh = new THREE.Mesh(lensBarrelGeo, cobaltMetalMat);
    lensBarrelMesh.position.set(0, 0, 0.52);
    cameraBodyGroup.add(lensBarrelMesh);

    // Lens Focus Gear Rings
    const gearRingGeo = new THREE.TorusGeometry(0.26, 0.022, 16, 40);
    const gearRing1 = new THREE.Mesh(gearRingGeo, coralGlossMat);
    gearRing1.position.set(0, 0, 0.46);
    cameraBodyGroup.add(gearRing1);

    const gearRing2 = new THREE.Mesh(gearRingGeo, iceMetalMat);
    gearRing2.position.set(0, 0, 0.6);
    cameraBodyGroup.add(gearRing2);

    // Front Optical Glass Element
    const frontGlassGeo = new THREE.SphereGeometry(0.2, 24, 24);
    frontGlassGeo.scale(1, 1, 0.35);
    const frontGlassMesh = new THREE.Mesh(frontGlassGeo, glassMat);
    frontGlassMesh.position.set(0, 0, 0.72);
    cameraBodyGroup.add(frontGlassMesh);

    // Cinema Matte Box Hood
    const matteBoxGeo = new THREE.BoxGeometry(0.56, 0.44, 0.14);
    const matteBoxMesh = new THREE.Mesh(matteBoxGeo, navyMat);
    matteBoxMesh.position.set(0, 0, 0.78);
    cameraBodyGroup.add(matteBoxMesh);

    // Matte Box Top French Flag
    const frenchFlagGeo = new THREE.BoxGeometry(0.54, 0.02, 0.18);
    const frenchFlagMesh = new THREE.Mesh(frenchFlagGeo, cobaltMetalMat);
    frenchFlagMesh.position.set(0, 0.24, 0.82);
    frenchFlagMesh.rotation.x = -0.25;
    cameraBodyGroup.add(frenchFlagMesh);

    // 5. Rear V-Mount Battery Pack
    const vBatteryGeo = new THREE.BoxGeometry(0.42, 0.34, 0.18);
    const vBatteryMesh = new THREE.Mesh(vBatteryGeo, cobaltMetalMat);
    vBatteryMesh.position.set(0, -0.02, -0.42);
    cameraBodyGroup.add(vBatteryMesh);

    // 6. 15mm Baseplate Support Rods
    const rodGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.05, 16);
    rodGeo.rotateX(Math.PI / 2);
    const rodLeft = new THREE.Mesh(rodGeo, iceMetalMat);
    rodLeft.position.set(-0.16, -0.26, 0.22);
    const rodRight = new THREE.Mesh(rodGeo, iceMetalMat);
    rodRight.position.set(0.16, -0.26, 0.22);
    cameraBodyGroup.add(rodLeft);
    cameraBodyGroup.add(rodRight);

    cameraRigGroup.add(cameraBodyGroup);

    // --- STUDIO VIDEO LIGHT (Positioned on the side of the camera) ---
    const videoLightGroup = new THREE.Group();
    videoLightGroup.position.set(-0.88, 0.22, 0.18);
    videoLightGroup.rotation.y = 0.48; // Angled inward toward the subject & camera
    videoLightGroup.rotation.x = 0.15;

    // 1. Light Panel Enclosure
    const lightHousingGeo = new THREE.BoxGeometry(0.52, 0.42, 0.16);
    const lightHousingMesh = new THREE.Mesh(lightHousingGeo, navyMat);
    videoLightGroup.add(lightHousingMesh);

    // 2. Rear Heat Sink Cooling Fins
    for (let f = 0; f < 4; f++) {
      const finGeo = new THREE.BoxGeometry(0.46, 0.02, 0.08);
      const finMesh = new THREE.Mesh(finGeo, cobaltMetalMat);
      finMesh.position.set(0, (f - 1.5) * 0.09, -0.11);
      videoLightGroup.add(finMesh);
    }

    // 3. Frosted Diffuser Emissive Face
    const diffuserGeo = new THREE.PlaneGeometry(0.46, 0.36);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, lightDiffuserMat);
    diffuserMesh.position.set(0, 0, 0.085);
    videoLightGroup.add(diffuserMesh);

    // Actual PointLight emanating from the video light panel face
    const panelBeamLight = new THREE.PointLight(
      settings.videoLightColor || '#d9ebf4',
      settings.videoLightIntensity ?? 3.0,
      9
    );
    panelBeamLight.position.set(0, 0, 0.2);
    videoLightGroup.add(panelBeamLight);

    // 4. Four Articulated Barn Doors (Top, Bottom, Left, Right)
    const topBarnDoorGeo = new THREE.BoxGeometry(0.48, 0.18, 0.015);
    const topBarnDoor = new THREE.Mesh(topBarnDoorGeo, cobaltMetalMat);
    topBarnDoor.position.set(0, 0.27, 0.14);
    topBarnDoor.rotation.x = -0.58;
    videoLightGroup.add(topBarnDoor);

    const btmBarnDoor = new THREE.Mesh(topBarnDoorGeo, cobaltMetalMat);
    btmBarnDoor.position.set(0, -0.27, 0.14);
    btmBarnDoor.rotation.x = 0.58;
    videoLightGroup.add(btmBarnDoor);

    const sideBarnDoorGeo = new THREE.BoxGeometry(0.18, 0.38, 0.015);
    const leftBarnDoor = new THREE.Mesh(sideBarnDoorGeo, cobaltMetalMat);
    leftBarnDoor.position.set(-0.31, 0, 0.14);
    leftBarnDoor.rotation.y = 0.58;
    videoLightGroup.add(leftBarnDoor);

    const rightBarnDoor = new THREE.Mesh(sideBarnDoorGeo, cobaltMetalMat);
    rightBarnDoor.position.set(0.31, 0, 0.14);
    rightBarnDoor.rotation.y = -0.58;
    videoLightGroup.add(rightBarnDoor);

    // 5. Yoke Bracket & Light Stand Mount
    const yokePostGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.6, 16);
    const yokePost = new THREE.Mesh(yokePostGeo, cobaltMetalMat);
    yokePost.position.set(0, -0.38, 0);
    videoLightGroup.add(yokePost);

    const yokeKnobGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16);
    yokeKnobGeo.rotateZ(Math.PI / 2);
    const yokeKnob = new THREE.Mesh(yokeKnobGeo, coralGlossMat);
    yokeKnob.position.set(-0.3, 0, 0);
    videoLightGroup.add(yokeKnob);

    cameraRigGroup.scale.setScalar(settings.cameraRigScale ?? 1.15);
    cameraRigGroup.add(videoLightGroup);
    objectsGroup.add(cameraRigGroup);

    // 3D Object C: Global UN Geodesic Node & Latitude Rings
    const globeObject = new THREE.Group();
    globeObject.position.set(2.25, -0.1, 1.1);
    const geoSphere = new THREE.IcosahedronGeometry(0.38, 1);
    const geoMesh = new THREE.Mesh(geoSphere, coralGlossMat);
    const geoWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(geoSphere),
      new THREE.LineBasicMaterial({ color: '#172a3b', transparent: true, opacity: 0.45 })
    );
    globeObject.add(geoMesh);
    globeObject.add(geoWire);

    const orbitRingGeo = new THREE.TorusGeometry(0.58, 0.016, 12, 64);
    const orbitRing = new THREE.Mesh(orbitRingGeo, iceMetalMat);
    orbitRing.rotation.x = Math.PI / 3;
    orbitRing.rotation.y = Math.PI / 6;
    globeObject.add(orbitRing);
    objectsGroup.add(globeObject);

    // 6. Floating Topographic Elevation Markers (No Gold - Cobalt & Warm Coral)
    const pinsGroup = new THREE.Group();
    worldRoot.add(pinsGroup);
    const pinMeshes: THREE.Mesh[] = [];
    const pinGeo = new THREE.OctahedronGeometry(0.11, 0);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 2.85 + (i % 2) * 0.45;
      const pin = new THREE.Mesh(pinGeo, i % 2 === 0 ? coralGlossMat : cobaltMetalMat);
      pin.position.set(
        Math.cos(angle) * dist * 1.15,
        (i - 3.5) * 0.24,
        Math.sin(angle) * dist * 0.8
      );
      pinsGroup.add(pin);
      pinMeshes.push(pin);
    }

    // 7. GSAP ScrollTrigger Choreography
    const scrollState = {
      progress: 0,
      explodeAmount: 0,
      rotYTarget: 0,
      rotZTarget: -0.18,
      shiftXTarget: 0,
    };

    const intensity = settings.scrollMorphIntensity || 1.0;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.85,
        onUpdate: (self) => {
          const p = self.progress;
          scrollState.progress = p;
          scrollState.rotYTarget = p * Math.PI * 2.2 * intensity;
          scrollState.rotZTarget = -0.18 + Math.sin(p * Math.PI * 2) * 0.14;
          scrollState.explodeAmount = Math.sin(p * Math.PI * 3) * 0.5 + 0.45;
          scrollState.shiftXTarget = Math.cos(p * Math.PI * 2) * 0.45;
        },
      });
    });

    // 8. Pointer Parallax & Contact Form 3D Sync
    const pointer = { x: 0, y: 0, lerpedX: 0, lerpedY: 0 };
    const contactBoost = {
      spread: 0,
      targetSpread: 0,
      lightPulse: 0,
      targetLightPulse: 0,
      cameraYaw: 0,
      targetCameraYaw: 0,
    };

    const onPointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onContactInteraction = (e: Event) => {
      const detail = (e as CustomEvent)?.detail || {};
      if (typeof detail.elevationProgress === 'number') {
        contactBoost.targetSpread = detail.elevationProgress * 0.45;
      }
      if (typeof detail.lightPulse === 'number') {
        contactBoost.targetLightPulse = detail.lightPulse;
      }
      if (typeof detail.cameraYaw === 'number') {
        contactBoost.targetCameraYaw = detail.cameraYaw;
      }
      if (detail.lightColor && panelBeamLight && diffuserMesh) {
        panelBeamLight.color.set(detail.lightColor);
        (diffuserMesh.material as THREE.MeshStandardMaterial).emissive.set(detail.lightColor);
      }
    };
    window.addEventListener('portfolio:contact-interaction', onContactInteraction);

    // 9. Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      updateResponsivePlacement();
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    let reqId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = prefersReducedMotion ? 0 : clock.getElapsedTime();

      pointer.lerpedX += (pointer.x - pointer.lerpedX) * 0.06;
      pointer.lerpedY += (pointer.y - pointer.lerpedY) * 0.06;

      contactBoost.spread += (contactBoost.targetSpread - contactBoost.spread) * 0.08;
      contactBoost.lightPulse += (contactBoost.targetLightPulse - contactBoost.lightPulse) * 0.1;
      contactBoost.targetLightPulse *= 0.94;
      contactBoost.cameraYaw += (contactBoost.targetCameraYaw - contactBoost.cameraYaw) * 0.08;

      const totalSpread = 1 + scrollState.explodeAmount * 1.15 + contactBoost.spread;

      // Animate each 3D topographic elevation slab
      strataLayers.forEach((layer) => {
        const waveOffset = prefersReducedMotion
          ? 0
          : Math.sin(t * 1.4 + layer.index * 0.55) * (0.04 + contactBoost.lightPulse * 0.05);
        const targetY = layer.baseY * totalSpread + waveOffset;
        layer.group.position.y += (targetY - layer.group.position.y) * 0.08;
        layer.group.rotation.y =
          scrollState.rotYTarget * (0.25 + layer.index * 0.06) +
          pointer.lerpedX * 0.22 +
          contactBoost.cameraYaw * 0.35;
      });

      // Float the summit sculpture
      summitObject.position.y = 1.15 * totalSpread + Math.sin(t * 1.8) * 0.08;
      knotMesh.rotation.x = t * 0.45 + scrollState.rotYTarget;
      knotMesh.rotation.y = t * 0.6;
      haloRing.rotation.z = -t * 0.5;

      // Float and orient the Cinema Camera & Studio Video Light Rig
      cameraRigGroup.position.y = 0.35 * totalSpread + Math.cos(t * 1.5) * 0.07;
      cameraRigGroup.rotation.y =
        Math.sin(t * 0.8) * 0.35 + pointer.lerpedX * 0.35 + contactBoost.cameraYaw;
      cameraRigGroup.rotation.x = pointer.lerpedY * 0.2;

      // Gentle subtle breathing movement + form interaction pulse on the video light
      videoLightGroup.rotation.y = 0.48 + Math.sin(t * 1.2) * 0.06 + contactBoost.lightPulse * 0.18;
      panelBeamLight.intensity =
        (settings.videoLightIntensity ?? 2.8) + contactBoost.lightPulse * 2.4;

      // Float the globe node
      globeObject.position.y = -0.15 * totalSpread + Math.sin(t * 1.3 + 1) * 0.07;
      globeObject.rotation.y = t * 0.38 + scrollState.rotYTarget * 0.5;
      orbitRing.rotation.z = t * 0.65;

      pinMeshes.forEach((pin, idx) => {
        pin.rotation.y = t * 0.7 + idx;
        pin.position.y =
          (idx - 3.5) * 0.24 * totalSpread + Math.sin(t * 2 + idx) * 0.05;
      });

      worldRoot.rotation.z = scrollState.rotZTarget + pointer.lerpedX * 0.08;
      worldRoot.rotation.x = 0.52 + pointer.lerpedY * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('portfolio:contact-interaction', onContactInteraction);
      window.removeEventListener('resize', onResize);
      ctx.revert();
      renderer.dispose();
    };
  }, [settings]);

  if (settings.engineMode === 'spline' && settings.splineUrl) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <iframe
          src={settings.splineUrl}
          title="Matteo Casling 3D Spline Topographic Rig"
          className="w-full h-full border-0 pointer-events-auto opacity-85"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
