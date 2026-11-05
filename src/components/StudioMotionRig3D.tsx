import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
 * Radial bounds are strictly controlled so the outer topographic contour (R <= 2.18)
 * never touches the planetary orbital ring (R = 3.22).
 */
function createTopographicShape(
  baseRadius: number,
  seedPhase: number,
  elongationX = 1.04,
  elongationY = 0.92
): THREE.Shape {
  const shape = new THREE.Shape();
  const segments = 96;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const wave1 = Math.sin(theta * 2 + seedPhase) * 0.09;
    const wave2 = Math.cos(theta * 3 - seedPhase * 1.3) * 0.05;
    const wave3 = Math.sin(theta * 5 + seedPhase * 0.7) * 0.02;
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

/**
 * Builds a real HDR Studio Environment using PMREMGenerator (from MengTo/Skills 3d-metal-material).
 * High-radiance softbox window cards in a dark studio give metallic and glass surfaces authentic
 * structured specular reflections and crisp bevel highlights.
 */
function buildStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0.035, 0.05, 0.08);
  const disposables: { geo: THREE.BufferGeometry; mat: THREE.Material }[] = [];

  const addLightCard = (
    w: number,
    h: number,
    pos: [number, number, number],
    radiance: [number, number, number]
  ) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(radiance[0], radiance[1], radiance[2]),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
    disposables.push({ geo, mat });
  };

  // 4x3 Mullioned Studio Window Softbox Array (Key Highlight Reflection)
  const windowFrame = new THREE.Group();
  windowFrame.position.set(-5.0, 4.4, 5.2);
  windowFrame.lookAt(0, 0, 0);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const geo = new THREE.PlaneGeometry(1.06, 1.18);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(3.6, 3.5, 3.25),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const pane = new THREE.Mesh(geo, mat);
      pane.position.set((col - 1.5) * 1.28, (row - 1) * 1.44, 0);
      windowFrame.add(pane);
      disposables.push({ geo, mat });
    }
  }
  studio.add(windowFrame);

  // Cool Glacier-Ice Side Fill Card (#d9ebf4)
  addLightCard(3.6, 5.8, [6.2, 1.8, 2.6], [0.85, 1.05, 1.35]);
  // Warm Coral Back Rim Card (#f29f8b)
  addLightCard(2.8, 4.8, [2.8, 2.4, -5.5], [1.75, 1.02, 0.85]);
  // Deep Cobalt Lower Bounce Card (#304774)
  addLightCard(8.5, 8.5, [0, -4.2, 0], [0.2, 0.32, 0.52]);
  // Overhead Soft Strip
  addLightCard(7.5, 2.5, [0, 6.2, 0], [0.95, 1.02, 1.15]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(studio, 0.006, 0.1, 40);
  pmrem.dispose();
  disposables.forEach(({ geo, mat }) => {
    geo.dispose();
    mat.dispose();
  });

  return envTarget.texture;
}

/**
 * Helper to create a finely knurled cylindrical lens ring (for Sony G-Master zoom, focus & iris rings).
 */
function createKnurledLensRing(
  radius: number,
  width: number,
  ridgeCount: number,
  ringMat: THREE.Material,
  ridgeMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const baseCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, 48),
    ringMat
  );
  baseCyl.rotation.x = Math.PI / 2;
  group.add(baseCyl);

  const ridgeGeo = new THREE.BoxGeometry(0.006, 0.006, width * 0.92);
  for (let i = 0; i < ridgeCount; i++) {
    const a = (i / ridgeCount) * Math.PI * 2;
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(Math.cos(a) * (radius + 0.002), Math.sin(a) * (radius + 0.002), 0);
    ridge.rotation.z = a;
    group.add(ridge);
  }
  return group;
}

/**
 * Builds an anatomically accurate, studio-detailed Sony FX6 (ILME-FX6) Full-Frame Cinema Camera
 * with Sony FE 24-70mm f/2.8 GM II Lens, Petal Lens Hood, Smart Top Handle, Dual XLR Audio Unit,
 * Shotgun Microphone with Foam Windscreen, 3.5" LCD Viewfinder, Rotatable Smart Grip,
 * Left-Side Electronic Variable ND Filter Wheel, 6 Silver Assignable Buttons, and BP-U60 Battery.
 */
function buildSonyFX6Camera(materials: {
  fx6BodyMat: THREE.Material;
  anodizedBlackMat: THREE.Material;
  brushedCobaltMat: THREE.Material;
  machinedSilverMat: THREE.Material;
  coralCinemaMat: THREE.Material;
  opticalGlassMat: THREE.Material;
  matteFoamMat: THREE.Material;
  lcdScreenMat: THREE.Material;
}): THREE.Group {
  const {
    fx6BodyMat,
    anodizedBlackMat,
    brushedCobaltMat,
    machinedSilverMat,
    coralCinemaMat,
    opticalGlassMat,
    matteFoamMat,
    lcdScreenMat,
  } = materials;

  // Center the assembly near (0,0,0) so its bounding radius is compact (~0.56 units)
  const fx6Root = new THREE.Group();
  const innerRig = new THREE.Group();
  innerRig.position.set(0, -0.04, -0.14);
  innerRig.scale.setScalar(0.84);
  fx6Root.add(innerRig);

  // ==========================================================================
  // 1. SONY FX6 MAGNESIUM BODY CHASSIS (114mm x 116mm x 153mm compact cube-box)
  // ==========================================================================
  const mainChassis = new THREE.Mesh(
    new RoundedBoxGeometry(0.48, 0.49, 0.62, 6, 0.038),
    fx6BodyMat
  );
  innerRig.add(mainChassis);

  // Front Stepped Sensor Block & Cooling Intake Louvers
  const frontBlock = new THREE.Mesh(
    new RoundedBoxGeometry(0.44, 0.44, 0.08, 4, 0.022),
    anodizedBlackMat
  );
  frontBlock.position.set(0, -0.01, 0.31);
  innerRig.add(frontBlock);

  // Right-side diagonal heatsink cooling vents (Signature FX6 thermal Exhaust/Intake channel)
  for (let v = 0; v < 7; v++) {
    const fin = new THREE.Mesh(
      new RoundedBoxGeometry(0.02, 0.014, 0.24, 2, 0.003),
      anodizedBlackMat
    );
    fin.position.set(-0.242, 0.14 - v * 0.038, 0.08);
    innerRig.add(fin);
  }

  // Top-front SONY brow badge & Cinema Line FX6 side badge
  const sonyBrowBadge = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.028, 0.012, 2, 0.003),
    machinedSilverMat
  );
  sonyBrowBadge.position.set(0, 0.195, 0.348);
  innerRig.add(sonyBrowBadge);

  const fx6SideBadge = new THREE.Mesh(
    new RoundedBoxGeometry(0.01, 0.045, 0.095, 2, 0.003),
    coralCinemaMat
  );
  fx6SideBadge.position.set(0.242, 0.16, 0.18);
  innerRig.add(fx6SideBadge);

  const sensorPin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.01, 16),
    machinedSilverMat
  );
  sensorPin.position.set(0.18, 0.248, 0.14);
  innerRig.add(sensorPin);

  // ==========================================================================
  // 2. LEFT-SIDE OPERATOR PANEL (+X side: Electronic Variable ND Wheel & 6 Buttons)
  // ==========================================================================
  const ndHousing = new THREE.Mesh(
    new RoundedBoxGeometry(0.035, 0.16, 0.14, 4, 0.012),
    anodizedBlackMat
  );
  ndHousing.position.set(0.245, 0.02, 0.18);
  innerRig.add(ndHousing);

  const ndWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.022, 32),
    machinedSilverMat
  );
  ndWheel.rotation.z = Math.PI / 2;
  ndWheel.position.set(0.258, 0.02, 0.21);
  innerRig.add(ndWheel);

  const sideRecBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.018, 24),
    machinedSilverMat
  );
  sideRecBezel.rotation.z = Math.PI / 2;
  sideRecBezel.position.set(0.246, -0.11, 0.22);
  innerRig.add(sideRecBezel);

  const sideRecBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.024, 24),
    coralCinemaMat
  );
  sideRecBtn.rotation.z = Math.PI / 2;
  sideRecBtn.position.set(0.248, -0.11, 0.22);
  innerRig.add(sideRecBtn);

  // Row of 6 Signature FX6 Round Silver Assignable Function Buttons
  for (let b = 0; b < 6; b++) {
    const btnGuard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.019, 0.014, 20),
      anodizedBlackMat
    );
    btnGuard.rotation.z = Math.PI / 2;
    btnGuard.position.set(0.244, -0.16, 0.12 - b * 0.056);
    innerRig.add(btnGuard);

    const btnCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.02, 20),
      machinedSilverMat
    );
    btnCap.rotation.z = Math.PI / 2;
    btnCap.position.set(0.246, -0.16, 0.12 - b * 0.056);
    innerRig.add(btnCap);
  }

  for (let ch = 0; ch < 2; ch++) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.022, 20),
      machinedSilverMat
    );
    pot.rotation.z = Math.PI / 2;
    pot.position.set(0.248, 0.05 - ch * 0.05, 0.02);
    innerRig.add(pot);
  }

  const mediaCardDoor = new THREE.Mesh(
    new RoundedBoxGeometry(0.02, 0.22, 0.16, 3, 0.006),
    brushedCobaltMat
  );
  mediaCardDoor.position.set(0.242, 0.01, -0.16);
  innerRig.add(mediaCardDoor);

  // ==========================================================================
  // 3. REAR BATTERY CAVITY (Sony BP-U60 Battery) & SDI / HDMI / TC Connectors
  // ==========================================================================
  const batteryPack = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.34, 0.18, 4, 0.02),
    anodizedBlackMat
  );
  batteryPack.position.set(-0.04, 0.01, -0.36);
  innerRig.add(batteryPack);

  for (let l = 0; l < 4; l++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.012, 0.008),
      lcdScreenMat
    );
    led.position.set(-0.04, -0.06 + l * 0.028, -0.452);
    innerRig.add(led);
  }

  for (let bnc = 0; bnc < 2; bnc++) {
    const bncCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.06, 20),
      machinedSilverMat
    );
    bncCyl.rotation.x = Math.PI / 2;
    bncCyl.position.set(0.14, -0.06 + bnc * 0.09, -0.33);
    innerRig.add(bncCyl);
  }

  // ==========================================================================
  // 4. SONY E-MOUNT LOCKING LEVER RING + FE 24-70mm f/2.8 GM II LENS & PETAL HOOD
  // ==========================================================================
  const lensGroup = new THREE.Group();
  lensGroup.position.set(0, -0.01, 0.35);

  const eMountFlange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.175, 0.185, 0.045, 48),
    machinedSilverMat
  );
  eMountFlange.rotation.x = Math.PI / 2;
  eMountFlange.position.set(0, 0, 0.02);
  lensGroup.add(eMountFlange);

  const lockLever = new THREE.Mesh(
    new RoundedBoxGeometry(0.08, 0.028, 0.025, 2, 0.005),
    machinedSilverMat
  );
  lockLever.position.set(0.19, 0.06, 0.02);
  lockLever.rotation.z = 0.35;
  lensGroup.add(lockLever);

  const rearBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.182, 0.175, 0.11, 48),
    anodizedBlackMat
  );
  rearBarrel.rotation.x = Math.PI / 2;
  rearBarrel.position.set(0, 0, 0.09);
  lensGroup.add(rearBarrel);

  const irisRing = createKnurledLensRing(
    0.186,
    0.065,
    60,
    anodizedBlackMat,
    fx6BodyMat
  );
  irisRing.position.set(0, 0, 0.16);
  lensGroup.add(irisRing);

  const midBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.192, 0.186, 0.09, 48),
    fx6BodyMat
  );
  midBarrel.rotation.x = Math.PI / 2;
  midBarrel.position.set(0, 0, 0.23);
  lensGroup.add(midBarrel);

  const gMasterBadge = new THREE.Mesh(
    new RoundedBoxGeometry(0.012, 0.042, 0.042, 2, 0.004),
    coralCinemaMat
  );
  gMasterBadge.position.set(0.19, 0.03, 0.23);
  lensGroup.add(gMasterBadge);

  const zoomRing = createKnurledLensRing(
    0.198,
    0.14,
    72,
    anodizedBlackMat,
    brushedCobaltMat
  );
  zoomRing.position.set(0, 0, 0.34);
  lensGroup.add(zoomRing);

  const silverAccentRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.199, 0.199, 0.016, 48),
    machinedSilverMat
  );
  silverAccentRing.rotation.x = Math.PI / 2;
  silverAccentRing.position.set(0, 0, 0.42);
  lensGroup.add(silverAccentRing);

  const focusRing = createKnurledLensRing(
    0.202,
    0.12,
    72,
    anodizedBlackMat,
    fx6BodyMat
  );
  focusRing.position.set(0, 0, 0.49);
  lensGroup.add(focusRing);

  // Sculpted Petal-Shaped Lens Hood (ALC-SH168 style bayonet hood)
  const hoodBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.226, 0.204, 0.08, 48, 1, false),
    anodizedBlackMat
  );
  hoodBase.rotation.x = Math.PI / 2;
  hoodBase.position.set(0, 0, 0.59);
  lensGroup.add(hoodBase);

  const createHoodPetal = (
    arcAngle: number,
    centerAngle: number,
    length: number
  ) => {
    const petalGeo = new THREE.CylinderGeometry(
      0.242,
      0.226,
      length,
      28,
      1,
      true,
      centerAngle - arcAngle / 2,
      arcAngle
    );
    petalGeo.rotateX(Math.PI / 2);
    const petalMat = anodizedBlackMat.clone();
    petalMat.side = THREE.DoubleSide;
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(0, 0, 0.63 + length / 2);
    return petal;
  };
  lensGroup.add(createHoodPetal(Math.PI * 0.42, 0, 0.095));
  lensGroup.add(createHoodPetal(Math.PI * 0.42, Math.PI, 0.095));
  lensGroup.add(createHoodPetal(Math.PI * 0.32, Math.PI * 0.5, 0.055));
  lensGroup.add(createHoodPetal(Math.PI * 0.32, Math.PI * 1.5, 0.055));

  // Deep Multi-Element Optical Glass Assembly + 11-Blade Aperture Iris Stop
  const innerBaffle = new THREE.Mesh(
    new THREE.CircleGeometry(0.192, 36),
    matteFoamMat
  );
  innerBaffle.position.set(0, 0, 0.595);
  lensGroup.add(innerBaffle);

  const irisStopRing = new THREE.Mesh(
    new THREE.RingGeometry(0.072, 0.175, 11),
    brushedCobaltMat
  );
  irisStopRing.position.set(0, 0, 0.602);
  lensGroup.add(irisStopRing);

  const innerLensGeo = new THREE.SphereGeometry(
    0.11,
    32,
    20,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.38
  );
  innerLensGeo.rotateX(Math.PI / 2);
  innerLensGeo.scale(1, 1, 0.5);
  const innerLens = new THREE.Mesh(innerLensGeo, opticalGlassMat);
  innerLens.position.set(0, 0, 0.57);
  lensGroup.add(innerLens);

  const frontGlassGeo = new THREE.SphereGeometry(
    0.188,
    40,
    28,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.44
  );
  frontGlassGeo.rotateX(Math.PI / 2);
  frontGlassGeo.scale(1, 1, 0.55);
  const frontGlass = new THREE.Mesh(frontGlassGeo, opticalGlassMat);
  frontGlass.position.set(0, 0, 0.585);
  lensGroup.add(frontGlass);

  const filterRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.196, 0.009, 16, 48),
    machinedSilverMat
  );
  filterRim.position.set(0, 0, 0.625);
  lensGroup.add(filterRim);

  innerRig.add(lensGroup);

  // ==========================================================================
  // 5. SONY FX6 SMART TOP HANDLE + XLR AUDIO BOX + SHOTGUN MIC + 3.5" LCD MONITOR
  // ==========================================================================
  const topHandleGroup = new THREE.Group();

  const frontRiser = new THREE.Mesh(
    new RoundedBoxGeometry(0.095, 0.16, 0.11, 4, 0.015),
    anodizedBlackMat
  );
  frontRiser.position.set(0, 0.31, 0.18);
  topHandleGroup.add(frontRiser);

  const rearRiser = new THREE.Mesh(
    new RoundedBoxGeometry(0.08, 0.14, 0.09, 4, 0.015),
    anodizedBlackMat
  );
  rearRiser.position.set(0, 0.3, -0.18);
  topHandleGroup.add(rearRiser);

  const topGripBar = new THREE.Mesh(
    new RoundedBoxGeometry(0.082, 0.062, 0.64, 5, 0.022),
    fx6BodyMat
  );
  topGripBar.position.set(0, 0.4, -0.02);
  topHandleGroup.add(topGripBar);

  const rearTailHook = new THREE.Mesh(
    new RoundedBoxGeometry(0.08, 0.09, 0.07, 4, 0.018),
    fx6BodyMat
  );
  rearTailHook.position.set(0, 0.43, -0.32);
  topHandleGroup.add(rearTailHook);

  // Integrated Dual-XLR Audio Box on Right Side of Top Handle (-X side)
  const xlrBox = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.11, 0.24, 4, 0.016),
    anodizedBlackMat
  );
  xlrBox.position.set(-0.1, 0.38, 0.12);
  topHandleGroup.add(xlrBox);

  for (let x = 0; x < 2; x++) {
    const xlrSocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.03, 24),
      machinedSilverMat
    );
    xlrSocket.rotation.z = Math.PI / 2;
    xlrSocket.position.set(-0.172, 0.38, 0.17 - x * 0.095);
    topHandleGroup.add(xlrSocket);

    const xlrCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.034, 20),
      matteFoamMat
    );
    xlrCore.rotation.z = Math.PI / 2;
    xlrCore.position.set(-0.172, 0.38, 0.17 - x * 0.095);
    topHandleGroup.add(xlrCore);
  }

  // Shock-Isolated Shotgun Microphone Holder Clamp & Sony ECM Shotgun Mic (-X side)
  const micClamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.042, 0.09, 24),
    anodizedBlackMat
  );
  micClamp.rotation.x = Math.PI / 2;
  micClamp.position.set(-0.22, 0.42, 0.16);
  topHandleGroup.add(micClamp);

  const shotgunTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.34, 24),
    fx6BodyMat
  );
  shotgunTube.rotation.x = Math.PI / 2;
  shotgunTube.position.set(-0.22, 0.42, 0.22);
  topHandleGroup.add(shotgunTube);

  const windscreenGeo = new THREE.CapsuleGeometry(0.042, 0.26, 16, 28);
  windscreenGeo.rotateX(Math.PI / 2);
  const windscreen = new THREE.Mesh(windscreenGeo, matteFoamMat);
  windscreen.position.set(-0.22, 0.42, 0.48);
  topHandleGroup.add(windscreen);

  // ==========================================================================
  // 5B. ATOMOS NINJA V 5.2" 4K HDR MONITOR-RECORDER (True 151mm x 91.5mm Scale)
  // ==========================================================================
  // Relative to the Sony FX6 body (114mm x 116mm => 0.48 x 0.49 units), the 5.2" Atomos Ninja V
  // (151mm x 91.5mm x 31.5mm) is 0.56 units wide x 0.34 units tall x 0.056 units deep.
  const magicArmBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.03, 0.04, 20),
    machinedSilverMat
  );
  magicArmBase.position.set(0.03, 0.445, 0.17);
  topHandleGroup.add(magicArmBase);

  const magicArmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.03, 0.45, 0.17),
    new THREE.Vector3(0.18, 0.48, 0.21),
    new THREE.Vector3(0.32, 0.46, 0.24),
  ]);
  const magicArmStrut = new THREE.Mesh(
    new THREE.TubeGeometry(magicArmCurve, 16, 0.016, 12, false),
    anodizedBlackMat
  );
  topHandleGroup.add(magicArmStrut);

  const magicArmKnob = new THREE.Mesh(
    new RoundedBoxGeometry(0.045, 0.022, 0.028, 3, 0.005),
    coralCinemaMat
  );
  magicArmKnob.position.set(0.18, 0.495, 0.21);
  topHandleGroup.add(magicArmKnob);

  // Atomos Ninja V Assembly angled toward the viewer on the side-front of the FX6
  const ninjaVGroup = new THREE.Group();
  ninjaVGroup.position.set(0.37, 0.45, 0.26);
  ninjaVGroup.rotation.y = 0.48;  // Swiveled toward viewer to match heroYawOffset (-0.52)
  ninjaVGroup.rotation.x = -0.15; // Tilted slightly up to face the camera squarely

  // 1. Sleek Stealth-Grey Chamfered Aluminum Frame (151mm x 91.5mm = 0.56 x 0.34)
  const ninjaOuterFrame = new THREE.Mesh(
    new RoundedBoxGeometry(0.56, 0.34, 0.052, 5, 0.022),
    fx6BodyMat
  );
  ninjaVGroup.add(ninjaOuterFrame);

  // 2. Flush Edge-to-Edge Matte Black Glass Front Bezel (no bulky hood flaps)
  const ninjaGlassBezel = new THREE.Mesh(
    new RoundedBoxGeometry(0.538, 0.318, 0.012, 4, 0.014),
    anodizedBlackMat
  );
  ninjaGlassBezel.position.set(0, 0, 0.023);
  ninjaVGroup.add(ninjaGlassBezel);

  // 3. Top & Bottom Atomos Brass/Silver 1/4"-20 Anti-Rotation Mount Bosses & Cooling Vents
  const topMountBoss = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.008, 20),
    machinedSilverMat
  );
  topMountBoss.position.set(0, 0.172, 0);
  ninjaVGroup.add(topMountBoss);

  const bottomMountBoss = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.008, 20),
    machinedSilverMat
  );
  bottomMountBoss.position.set(-0.05, -0.172, 0);
  ninjaVGroup.add(bottomMountBoss);

  for (let v = -3; v <= 3; v++) {
    if (v === 0) continue;
    const ventSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.006, 0.022),
      anodizedBlackMat
    );
    ventSlot.position.set(v * 0.055, 0.171, -0.005);
    ninjaVGroup.add(ventSlot);
  }

  // 4. Right-Side Power Button & Left-Side Dual HDMI 2.0 In/Out Connectors
  const ninjaPowerBtn = new THREE.Mesh(
    new RoundedBoxGeometry(0.008, 0.038, 0.018, 2, 0.003),
    machinedSilverMat
  );
  ninjaPowerBtn.position.set(0.282, 0.08, 0);
  ninjaVGroup.add(ninjaPowerBtn);

  for (let h = 0; h < 2; h++) {
    const hdmiPlug = new THREE.Mesh(
      new RoundedBoxGeometry(0.032, 0.026, 0.018, 2, 0.004),
      anodizedBlackMat
    );
    hdmiPlug.position.set(-0.29, 0.05 - h * 0.09, 0);
    ninjaVGroup.add(hdmiPlug);
  }

  // Coiled HDMI 2.0 Cable from Ninja V HDMI-In to Sony FX6 HDMI-Out
  const hdmiCableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.11, 0.42, 0.16),
    new THREE.Vector3(0.04, 0.25, 0.02),
    new THREE.Vector3(-0.08, 0.06, -0.18),
  ]);
  const hdmiCable = new THREE.Mesh(
    new THREE.TubeGeometry(hdmiCableCurve, 20, 0.009, 10, false),
    anodizedBlackMat
  );
  topHandleGroup.add(hdmiCable);

  // 5. Rear AtomX SSDmini Drive Caddy + Sony NP-F750 Battery Pack on Back of Ninja V
  const atomxSsd = new THREE.Mesh(
    new RoundedBoxGeometry(0.21, 0.24, 0.028, 3, 0.008),
    machinedSilverMat
  );
  atomxSsd.position.set(-0.12, 0, -0.036);
  ninjaVGroup.add(atomxSsd);

  const npfBattery = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.25, 0.065, 4, 0.012),
    anodizedBlackMat
  );
  npfBattery.position.set(0.11, 0, -0.054);
  ninjaVGroup.add(npfBattery);

  // 6. Active 5.2" 16:9 Touchscreen Display Panel (0.496 x 0.279)
  const lcdPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.496, 0.279),
    lcdScreenMat
  );
  lcdPanel.position.set(0, 0.004, 0.03);
  ninjaVGroup.add(lcdPanel);

  topHandleGroup.add(ninjaVGroup);
  innerRig.add(topHandleGroup);

  // ==========================================================================
  // 6. SONY FX6 ROTATABLE ERGONOMIC SMART GRIP (Right-Hand Side Rosette Grip)
  // ==========================================================================
  const smartGripGroup = new THREE.Group();
  smartGripGroup.position.set(-0.28, -0.06, 0.08);

  const rosetteJoint = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.08, 28),
    anodizedBlackMat
  );
  rosetteJoint.rotation.z = Math.PI / 2;
  smartGripGroup.add(rosetteJoint);

  const gripBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.052, 0.19, 16, 24),
    fx6BodyMat
  );
  gripBody.position.set(-0.06, -0.04, 0.11);
  gripBody.rotation.x = 0.55;
  gripBody.rotation.z = -0.12;
  smartGripGroup.add(gripBody);

  const gripHead = new THREE.Mesh(
    new RoundedBoxGeometry(0.095, 0.085, 0.12, 4, 0.022),
    anodizedBlackMat
  );
  gripHead.position.set(-0.05, 0.05, 0.08);
  smartGripGroup.add(gripHead);

  const gripRecBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.016, 20),
    coralCinemaMat
  );
  gripRecBtn.position.set(-0.05, 0.096, 0.1);
  smartGripGroup.add(gripRecBtn);

  const strapTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.115, 0.014, 12, 36, Math.PI * 1.05),
    brushedCobaltMat
  );
  strapTorus.position.set(-0.08, -0.03, 0.1);
  strapTorus.rotation.y = Math.PI / 2;
  strapTorus.rotation.x = 0.55;
  smartGripGroup.add(strapTorus);

  innerRig.add(smartGripGroup);

  // ==========================================================================
  // 7. CINEMA QUICK-RELEASE BASEPLATE & DUAL 15MM TITANIUM RODS
  // ==========================================================================
  const qrBaseplate = new THREE.Mesh(
    new RoundedBoxGeometry(0.46, 0.05, 0.54, 4, 0.012),
    brushedCobaltMat
  );
  qrBaseplate.position.set(0, -0.27, 0.04);
  innerRig.add(qrBaseplate);

  const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.96, 24);
  rodGeo.rotateX(Math.PI / 2);
  const rodL = new THREE.Mesh(rodGeo, machinedSilverMat);
  rodL.position.set(-0.15, -0.28, 0.18);
  const rodR = new THREE.Mesh(rodGeo, machinedSilverMat);
  rodR.position.set(0.15, -0.28, 0.18);
  innerRig.add(rodL);
  innerRig.add(rodR);

  return fx6Root;
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
      34,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Real HDR Studio Reflection Environment (MengTo/Skills 3d-metal-material)
    const studioEnv = buildStudioEnvironment(renderer);
    scene.environment = studioEnv;

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.9);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight('#fffaf5', 2.8);
    sunKeyLight.position.set(6, 10, 8);
    scene.add(sunKeyLight);

    const iceRimLight = new THREE.DirectionalLight('#d9ebf4', 2.2);
    iceRimLight.position.set(-8, 5, -6);
    scene.add(iceRimLight);

    const cobaltFillLight = new THREE.PointLight('#304774', 3.2, 22);
    cobaltFillLight.position.set(-4, -5, 6);
    scene.add(cobaltFillLight);

    const focalStageLight = new THREE.PointLight('#ffffff', 3.2, 16);
    focalStageLight.position.set(1.0, 1.8, 6.0);
    scene.add(focalStageLight);

    // 3. Master 3D Topographic Assembly & Responsive Viewport Framing (Mobile + Tablet + Desktop)
    const worldRoot = new THREE.Group();
    scene.add(worldRoot);

    const TILT_X = 0.26;

    const layoutState = {
      frontFocusAngle: -0.06,
      orbitRadiusX: 3.12,
      orbitRadiusZ: 3.02,
      isMobile: false,
    };

    const updateResponsivePlacement = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight || 1;
      const aspect = w / h;

      if (w < 768 || aspect < 0.85) {
        // Mobile Portrait / Narrow Viewport:
        // Centered horizontally & vertically so the spinning orbital ring and focused model sit right in the middle of the screen
        layoutState.isMobile = true;
        layoutState.frontFocusAngle = 0;
        layoutState.orbitRadiusX = 2.95;
        layoutState.orbitRadiusZ = 2.95;

        const mobileScale = w < 420 ? 0.56 : 0.62;
        worldRoot.position.set(0, 0.46, 0);
        worldRoot.scale.setScalar(mobileScale);

        camera.fov = 38;
        const camZ = Math.min(13.8, Math.max(10.2, 5.4 / Math.max(0.38, aspect)));
        camera.position.set(0, 1.9, camZ);
        camera.lookAt(0, 0.35, 0);
      } else if (w < 1280) {
        // Tablet / Compact Laptop:
        layoutState.isMobile = false;
        layoutState.frontFocusAngle = -0.04;
        layoutState.orbitRadiusX = 3.06;
        layoutState.orbitRadiusZ = 2.98;

        worldRoot.position.set(0.32, 0.46, 0);
        worldRoot.scale.setScalar(0.74);

        camera.fov = 35;
        camera.position.set(0, 1.88, 10.1);
        camera.lookAt(0, 0.35, 0);
      } else {
        // Desktop Widescreen:
        // Positioned centrally with a gentle right bias so the focused front model sits near the center of the screen
        layoutState.isMobile = false;
        layoutState.frontFocusAngle = -0.06;
        layoutState.orbitRadiusX = 3.12;
        layoutState.orbitRadiusZ = 3.02;

        const baseOffsetX = Math.min(settings.sceneOffsetX ?? 0.65, 0.72);
        const baseOffsetY = (settings.sceneOffsetY ?? 0) + 0.48;
        worldRoot.position.set(baseOffsetX, baseOffsetY, 0);
        worldRoot.scale.setScalar(0.84);

        camera.fov = 34;
        camera.position.set(0, 1.85, 9.8);
        camera.lookAt(0, 0.35, 0);
      }
      camera.updateProjectionMatrix();
    };

    updateResponsivePlacement();
    worldRoot.rotation.x = TILT_X;
    worldRoot.rotation.z = -0.06;

    // 4. Stepped Topographic Elevation Strata matching the CV Palette (NO GOLD)
    // Strictly bounded within R <= 2.15 so the outer planetary orbit (R >= 2.95) never touches it!
    const strataGroup = new THREE.Group();
    worldRoot.add(strataGroup);

    const strataConfigs = [
      { radius: 1.82, phase: 0.2, color: '#172a3b', edgeColor: '#304774', roughness: 0.42 },
      { radius: 1.6, phase: 0.85, color: '#304774', edgeColor: '#d9ebf4', roughness: 0.34 },
      { radius: 1.38, phase: 1.5, color: '#d9ebf4', edgeColor: '#304774', roughness: 0.24 },
      { radius: 1.16, phase: 2.2, color: '#ffffff', edgeColor: '#304774', roughness: 0.2 },
      { radius: 0.94, phase: 2.9, color: '#304774', edgeColor: '#d9ebf4', roughness: 0.3 },
      { radius: 0.72, phase: 3.6, color: '#d9ebf4', edgeColor: '#f29f8b', roughness: 0.22 },
      { radius: 0.5, phase: 4.3, color: '#fbd5cd', edgeColor: '#f29f8b', roughness: 0.18 },
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
      // Total slab thickness = 0.10 + 2 * 0.022 = 0.144 units; step = 0.25 units -> permanent air gap!
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.022,
        bevelSize: 0.022,
        bevelSegments: 4,
        curveSegments: 56,
      });
      geo.rotateX(-Math.PI / 2);

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        roughness: cfg.roughness,
        metalness: 0.12,
        envMap: studioEnv,
        envMapIntensity: 0.55,
      });

      const mesh = new THREE.Mesh(geo, mat);

      const edgesGeo = new THREE.EdgesGeometry(geo, 24);
      const edgesMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cfg.edgeColor),
        transparent: true,
        opacity: 0.48,
      });
      const edgesLine = new THREE.LineSegments(edgesGeo, edgesMat);

      const layerGroup = new THREE.Group();
      const baseY = (idx - 3) * 0.25;
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

    // 5. Studio-Grade PBR Materials
    const objectsGroup = new THREE.Group();
    worldRoot.add(objectsGroup);

    const fx6BodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1d2b3a'),
      metalness: 0.78,
      roughness: 0.32,
      clearcoat: 0.28,
      clearcoatRoughness: 0.35,
      envMap: studioEnv,
      envMapIntensity: 1.1,
    });

    const anodizedBlackMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#111c27'),
      metalness: 0.86,
      roughness: 0.24,
      anisotropy: 0.65,
      clearcoat: 0.3,
      envMap: studioEnv,
      envMapIntensity: 1.15,
    });

    const matteFoamMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0c151f'),
      metalness: 0.08,
      roughness: 0.92,
      envMap: studioEnv,
      envMapIntensity: 0.2,
    });

    const brushedCobaltMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#304774'),
      metalness: 0.88,
      roughness: 0.22,
      anisotropy: 0.75,
      clearcoat: 0.25,
      envMap: studioEnv,
      envMapIntensity: 1.15,
    });

    const machinedSilverMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d9ebf4'),
      metalness: 0.95,
      roughness: 0.13,
      anisotropy: 0.65,
      envMap: studioEnv,
      envMapIntensity: 1.3,
    });

    const coralCinemaMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f29f8b'),
      metalness: 0.38,
      roughness: 0.16,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1,
      envMap: studioEnv,
      envMapIntensity: 1.15,
    });

    const opticalGlassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d9ebf4'),
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.65,
      thickness: 0.38,
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#f29f8b'),
      clearcoat: 1.0,
      envMap: studioEnv,
      envMapIntensity: 1.75,
    });

    const frostedGlassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d9ebf4'),
      transmission: 0.64,
      opacity: 1,
      transparent: true,
      roughness: 0.2,
      ior: 1.48,
      thickness: 0.22,
      clearcoat: 0.85,
      envMap: studioEnv,
      envMapIntensity: 1.25,
    });

    const lcdScreenMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d9ebf4'),
      emissive: new THREE.Color('#4aa8ff'),
      emissiveIntensity: 0.95,
      roughness: 0.18,
    });

    // ============================================================================
    // ATOMOS NINJA V 5.2" HDR MONITOR-RECORDER
    // Plays clips ONLY from:
    //  1) Nuclear & Related Techniques for Climate Action in Food and Agriculture (EDaApuJ4syo)
    //  2) Inside FINS Initiative — Animated Segments (w0tVfjOWbm8)
    // ============================================================================
    interface PublishedVideoSnippet {
      id: string;
      title: string;
      agency: string;
      videoUrl: string;
      posterUrl: string;
      posterImg?: HTMLImageElement;
    }

    const publishedClips: PublishedVideoSnippet[] = [
      {
        id: 'EDaApuJ4syo-1',
        title: 'Nuclear & Related Techniques for Climate Action',
        agency: 'IAEA · FAO (COP28)',
        videoUrl: '/assets/videos/nuclear-1.mp4?v=2',
        posterUrl: '/assets/projects/iaea-nuclear-climate-video.png',
      },
      {
        id: 'w0tVfjOWbm8-1',
        title: 'Inside FINS Initiative — Tax-to-GDP Motion Graphics',
        agency: 'UN DESA · FINS Animation',
        videoUrl: '/assets/videos/fins-anim-1.mp4?v=2',
        posterUrl: '/assets/projects/inside-fins-dominican-republic-undesa/sids-finance.webp',
      },
      {
        id: 'EDaApuJ4syo-2',
        title: 'Nuclear Techniques — Plant Breeding & Drone Telemetry',
        agency: 'IAEA · FAO (COP28)',
        videoUrl: '/assets/videos/nuclear-2.mp4?v=2',
        posterUrl: '/assets/projects/iaea-nuclear-climate-video.png',
      },
      {
        id: 'w0tVfjOWbm8-2',
        title: 'Inside FINS Initiative — National Financing Frameworks',
        agency: 'UN DESA · FINS Animation',
        videoUrl: '/assets/videos/fins-anim-2.mp4?v=2',
        posterUrl: '/assets/projects/inside-fins-dominican-republic-undesa/sids-finance.webp',
      },
      {
        id: 'EDaApuJ4syo-3',
        title: 'Nuclear Techniques — Global Food Security & Agronomy',
        agency: 'IAEA · FAO (COP28)',
        videoUrl: '/assets/videos/nuclear-3.mp4?v=2',
        posterUrl: '/assets/projects/iaea-nuclear-climate-video.png',
      },
      {
        id: 'w0tVfjOWbm8-3',
        title: 'Inside FINS Initiative — Policy Coherence Animation',
        agency: 'UN DESA · FINS Animation',
        videoUrl: '/assets/videos/fins-anim-3.mp4?v=2',
        posterUrl: '/assets/projects/inside-fins-dominican-republic-undesa/sids-finance.webp',
      },
    ];

    // Preload poster images for seamless instant fallback between clip transitions
    publishedClips.forEach((clip) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = clip.posterUrl;
      clip.posterImg = img;
    });

    let isDisposed = false;

    // Hidden HTML5 video player cycling through the Nuclear & FINS Animated clips
    const fx6VideoEl = document.createElement('video');
    fx6VideoEl.muted = true;
    fx6VideoEl.playsInline = true;
    fx6VideoEl.crossOrigin = 'anonymous';
    fx6VideoEl.preload = 'auto';
    fx6VideoEl.setAttribute('muted', '');
    fx6VideoEl.setAttribute('playsinline', '');

    let activeClipIdx = 0;
    let lastClipSwitchTime = 0;

    const playClipAtIndex = (idx: number) => {
      if (isDisposed || publishedClips.length === 0) return;
      activeClipIdx = ((idx % publishedClips.length) + publishedClips.length) % publishedClips.length;
      const clip = publishedClips[activeClipIdx];
      if (fx6VideoEl.src !== window.location.origin + clip.videoUrl) {
        fx6VideoEl.src = clip.videoUrl;
        fx6VideoEl.currentTime = 0;
        fx6VideoEl.play().catch(() => {});
      }
    };

    fx6VideoEl.addEventListener('ended', () => {
      playClipAtIndex(activeClipIdx + 1);
    });
    playClipAtIndex(0);

    // Offscreen 16:9 Canvas + THREE.CanvasTexture for the Atomos Ninja V 5.2" HDR Touchscreen
    const fx6MonitorCanvas = document.createElement('canvas');
    fx6MonitorCanvas.width = 512;
    fx6MonitorCanvas.height = 288;
    const fx6MonitorCtx = fx6MonitorCanvas.getContext('2d');

    const fx6MonitorTexture = new THREE.CanvasTexture(fx6MonitorCanvas);
    fx6MonitorTexture.colorSpace = THREE.SRGBColorSpace;
    fx6MonitorTexture.minFilter = THREE.LinearFilter;
    fx6MonitorTexture.magFilter = THREE.LinearFilter;

    const fx6MonitorVideoMat = new THREE.MeshBasicMaterial({
      map: fx6MonitorTexture,
      toneMapped: false,
    });

    const updateFX6MonitorCanvas = (t: number) => {
      if (!fx6MonitorCtx) return;
      // Rotate to the next snippet every 7.5 seconds
      if (t - lastClipSwitchTime > 7.5) {
        lastClipSwitchTime = t;
        playClipAtIndex(activeClipIdx + 1);
      }

      const clip = publishedClips[activeClipIdx] || publishedClips[0];
      const W = fx6MonitorCanvas.width;
      const H = fx6MonitorCanvas.height;

      // 1. Draw live video frame (or animated Ken Burns poster frame while buffering)
      if (fx6VideoEl.readyState >= 2 && !fx6VideoEl.paused && fx6VideoEl.videoWidth > 0) {
        fx6MonitorCtx.drawImage(fx6VideoEl, 0, 0, W, H);
      } else if (clip.posterImg && clip.posterImg.complete && clip.posterImg.naturalWidth > 0) {
        const zoom = 1.06 + Math.sin(t * 0.8) * 0.04;
        const sw = W * zoom;
        const sh = H * zoom;
        const sx = (W - sw) * 0.5 + Math.cos(t * 0.6) * 8;
        const sy = (H - sh) * 0.5 + Math.sin(t * 0.5) * 5;
        fx6MonitorCtx.drawImage(clip.posterImg, sx, sy, sw, sh);
      } else {
        fx6MonitorCtx.fillStyle = '#101d29';
        fx6MonitorCtx.fillRect(0, 0, W, H);
      }

      // 2. Atomos AtomOS 11 Top & Bottom Dark Translucent Header/Footer Bars
      fx6MonitorCtx.fillStyle = 'rgba(12, 16, 22, 0.84)';
      fx6MonitorCtx.fillRect(0, 0, W, 30);
      fx6MonitorCtx.fillRect(0, H - 36, W, 36);

      // 3. Signature Atomos Ninja V Red Recording Tally Frame Outline
      fx6MonitorCtx.strokeStyle = 'rgba(239, 68, 68, 0.88)';
      fx6MonitorCtx.lineWidth = 3;
      fx6MonitorCtx.strokeRect(1.5, 1.5, W - 3, H - 3);

      // 4. AtomOS Top Bar: IN: HDMI 4K24 -> REC: ProRes HQ + Timecode + SSD Remaining
      fx6MonitorCtx.fillStyle = '#ef4444';
      fx6MonitorCtx.beginPath();
      fx6MonitorCtx.roundRect(10, 5, 42, 20, 3);
      fx6MonitorCtx.fill();

      fx6MonitorCtx.fillStyle = '#ffffff';
      fx6MonitorCtx.font = 'bold 11px monospace';
      fx6MonitorCtx.fillText('REC', 18, 19);

      fx6MonitorCtx.fillStyle = '#facc15';
      fx6MonitorCtx.font = 'bold 10px monospace';
      fx6MonitorCtx.fillText('IN 4K23.98p', 60, 19);

      fx6MonitorCtx.fillStyle = '#38bdf8';
      fx6MonitorCtx.fillText('ProRes 422 HQ', 142, 19);

      const totalFrames = Math.floor(t * 24);
      const ff = String(totalFrames % 24).padStart(2, '0');
      const ss = String(Math.floor(totalFrames / 24) % 60).padStart(2, '0');
      const mm = String((14 + Math.floor(totalFrames / 1440)) % 60).padStart(2, '0');
      fx6MonitorCtx.fillStyle = '#f8fafc';
      fx6MonitorCtx.font = 'bold 12px monospace';
      fx6MonitorCtx.fillText(`01:${mm}:${ss}:${ff}`, 248, 19);

      fx6MonitorCtx.fillStyle = '#a3e635';
      fx6MonitorCtx.font = 'bold 10px monospace';
      fx6MonitorCtx.fillText('SSD 02h14m · NINJA V', W - 138, 19);

      // 5. Right-Edge AtomOS Stereo Audio Level Meter (CH1 / CH2)
      for (let ch = 0; ch < 2; ch++) {
        const mx = W - 18 + ch * 6;
        const level = 0.45 + 0.45 * Math.abs(Math.sin(t * 6.2 + ch * 1.1));
        const segments = 14;
        for (let s = 0; s < segments; s++) {
          const sy = H - 46 - s * 8;
          const active = s / segments <= level;
          fx6MonitorCtx.fillStyle = !active
            ? 'rgba(255,255,255,0.16)'
            : s > 11
              ? '#ef4444'
              : s > 8
                ? '#facc15'
                : '#22c55e';
          fx6MonitorCtx.fillRect(mx, sy, 4, 5);
        }
      }

      // 6. AtomOS Bottom Bar: Active Video Agency + Title + ATOMOS Wordmark
      fx6MonitorCtx.fillStyle = '#f29f8b';
      fx6MonitorCtx.font = 'bold 10px sans-serif';
      fx6MonitorCtx.fillText(clip.agency.toUpperCase(), 12, H - 21);

      fx6MonitorCtx.fillStyle = '#ffffff';
      fx6MonitorCtx.font = 'bold 12px sans-serif';
      const maxTitle = clip.title.length > 46 ? clip.title.slice(0, 44) + '…' : clip.title;
      fx6MonitorCtx.fillText(maxTitle, 12, H - 7);

      fx6MonitorCtx.fillStyle = 'rgba(255,255,255,0.65)';
      fx6MonitorCtx.font = 'bold 10px monospace';
      fx6MonitorCtx.fillText('ATOMOS', W - 56, H - 12);

      fx6MonitorTexture.needsUpdate = true;
    };

    // ============================================================================
    // SUMMIT CROWN: Kinetic 3D Motion Sculpture (Elevated above Topographic Peak)
    // ============================================================================
    const summitObject = new THREE.Group();
    summitObject.position.set(0, 1.58, 0);
    const knotGeo = new THREE.TorusKnotGeometry(0.24, 0.062, 128, 24);
    const knotMesh = new THREE.Mesh(knotGeo, brushedCobaltMat);
    summitObject.add(knotMesh);

    const haloRingGeo = new THREE.TorusGeometry(0.44, 0.014, 20, 96);
    const haloRing = new THREE.Mesh(haloRingGeo, coralCinemaMat);
    haloRing.rotation.x = Math.PI / 2;
    summitObject.add(haloRing);
    objectsGroup.add(summitObject);

    // ============================================================================
    // ORBITAL ELEMENT 0: SONY FX6 FULL-FRAME CINEMA CAMERA
    // ============================================================================
    const fx6StationGroup = new THREE.Group();
    const fx6CameraMeshGroup = buildSonyFX6Camera({
      fx6BodyMat,
      anodizedBlackMat,
      brushedCobaltMat,
      machinedSilverMat,
      coralCinemaMat,
      opticalGlassMat,
      matteFoamMat,
      lcdScreenMat: fx6MonitorVideoMat,
    });
    fx6StationGroup.add(fx6CameraMeshGroup);
    objectsGroup.add(fx6StationGroup);

    // ============================================================================
    // ORBITAL ELEMENT 1: COMMUNICATIONS STRATEGIES (Parabolic Dish & Signal Nodes)
    // ============================================================================
    const commsStationGroup = new THREE.Group();

    const dishAssembly = new THREE.Group();
    dishAssembly.rotation.y = -0.35;
    dishAssembly.rotation.x = -0.18;

    const dishPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const r = (i / 24) * 0.42;
      const z = r * r * 0.92;
      dishPoints.push(new THREE.Vector2(r, z));
    }
    dishPoints.push(new THREE.Vector2(0.435, 0.18));
    dishPoints.push(new THREE.Vector2(0.41, 0.15));
    const dishLatheGeo = new THREE.LatheGeometry(dishPoints, 56);
    dishLatheGeo.rotateX(Math.PI / 2);
    const dishMesh = new THREE.Mesh(dishLatheGeo, machinedSilverMat);
    dishAssembly.add(dishMesh);

    for (let rib = 0; rib < 8; rib++) {
      const a = (rib / 8) * Math.PI * 2;
      const ribMesh = new THREE.Mesh(
        new RoundedBoxGeometry(0.015, 0.34, 0.028, 2, 0.004),
        brushedCobaltMat
      );
      ribMesh.position.set(Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0.035);
      ribMesh.rotation.z = a + Math.PI / 2;
      dishAssembly.add(ribMesh);
    }

    const dishHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.14, 0.12, 28),
      fx6BodyMat
    );
    dishHub.rotation.x = Math.PI / 2;
    dishHub.position.set(0, 0, -0.06);
    dishAssembly.add(dishHub);

    for (let s = 0; s < 4; s++) {
      const a = (s / 4) * Math.PI * 2 + Math.PI / 4;
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.36, 12),
        brushedCobaltMat
      );
      strut.position.set(Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.17);
      strut.lookAt(0, 0, 0.34);
      strut.rotateX(Math.PI / 2);
      dishAssembly.add(strut);
    }

    const feedHorn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.06, 0.08, 24),
      coralCinemaMat
    );
    feedHorn.rotation.x = Math.PI / 2;
    feedHorn.position.set(0, 0, 0.33);
    dishAssembly.add(feedHorn);

    const signalWaveRings: THREE.Mesh[] = [];
    for (let w = 0; w < 3; w++) {
      const waveRingGeo = new THREE.TorusGeometry(0.14 + w * 0.095, 0.01, 16, 64);
      const waveRing = new THREE.Mesh(
        waveRingGeo,
        w % 2 === 0 ? coralCinemaMat : lcdScreenMat
      );
      waveRing.position.set(0, 0, 0.42 + w * 0.12);
      dishAssembly.add(waveRing);
      signalWaveRings.push(waveRing);
    }

    const dishPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.17, 0.32, 28),
      fx6BodyMat
    );
    dishPedestal.position.set(0, -0.3, -0.04);
    commsStationGroup.add(dishPedestal);
    commsStationGroup.add(dishAssembly);

    const strategyNodesGroup = new THREE.Group();
    strategyNodesGroup.position.set(-0.38, 0.2, 0.28);
    const nodeOffsets: [number, number, number][] = [
      [0, 0, 0],
      [-0.26, 0.18, 0.12],
      [-0.14, -0.2, 0.18],
      [0.2, 0.22, -0.1],
      [0.22, -0.15, 0.14],
    ];
    nodeOffsets.forEach((pos, idx) => {
      const nodeSphere = new THREE.Mesh(
        new THREE.SphereGeometry(idx === 0 ? 0.068 : 0.048, 24, 24),
        idx === 0 ? coralCinemaMat : idx % 2 === 0 ? machinedSilverMat : brushedCobaltMat
      );
      nodeSphere.position.set(pos[0], pos[1], pos[2]);
      strategyNodesGroup.add(nodeSphere);

      if (idx > 0) {
        const curve = new THREE.LineCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(pos[0], pos[1], pos[2])
        );
        const linkTube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 8, 0.009, 12, false),
          machinedSilverMat
        );
        strategyNodesGroup.add(linkTube);
      }
    });
    commsStationGroup.add(strategyNodesGroup);
    objectsGroup.add(commsStationGroup);

    // ============================================================================
    // ORBITAL ELEMENT 2: DIGITAL MARKETING (3D Growth Graph & Optical Magnifier Glass)
    // ============================================================================
    const marketingStationGroup = new THREE.Group();

    const analyticsDeck = new THREE.Mesh(
      new RoundedBoxGeometry(0.84, 0.05, 0.5, 4, 0.015),
      fx6BodyMat
    );
    analyticsDeck.position.set(0, -0.22, -0.06);
    marketingStationGroup.add(analyticsDeck);

    const barHeights = [0.16, 0.25, 0.22, 0.36, 0.5];
    const analyticsBars: THREE.Mesh[] = [];
    barHeights.forEach((h, idx) => {
      const colGeo = new RoundedBoxGeometry(0.1, h, 0.1, 4, 0.016);
      const colMat =
        idx === 4
          ? coralCinemaMat
          : idx % 2 === 1
            ? brushedCobaltMat
            : frostedGlassMat;
      const colMesh = new THREE.Mesh(colGeo, colMat);
      const xPos = (idx - 2) * 0.145;
      colMesh.position.set(xPos, -0.195 + h / 2, -0.09);
      marketingStationGroup.add(colMesh);
      analyticsBars.push(colMesh);
    });

    const trendCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.31, -0.06, 0.04),
      new THREE.Vector3(-0.15, 0.06, 0.06),
      new THREE.Vector3(0.0, 0.04, 0.06),
      new THREE.Vector3(0.15, 0.21, 0.06),
      new THREE.Vector3(0.31, 0.38, 0.04),
    ]);
    const trendTubeGeo = new THREE.TubeGeometry(trendCurve, 40, 0.021, 16, false);
    const trendTubeMesh = new THREE.Mesh(trendTubeGeo, coralCinemaMat);
    marketingStationGroup.add(trendTubeMesh);

    const arrowHeadGeo = new THREE.ConeGeometry(0.052, 0.12, 24);
    const arrowHeadMesh = new THREE.Mesh(arrowHeadGeo, coralCinemaMat);
    arrowHeadMesh.position.set(0.34, 0.42, 0.04);
    arrowHeadMesh.rotation.z = -0.68;
    marketingStationGroup.add(arrowHeadMesh);

    // Precision 3D Magnifying Glass (replaces the old cone/funnel mesh)
    // Positioned in front of the growth graph so its optical lens zooms the graph & topographic background behind it!
    const LENS_RADIUS = 0.215;
    const magnifierRenderTarget = new THREE.WebGLRenderTarget(512, 512, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    const lensZoomCamera = new THREE.PerspectiveCamera(10, 1, 0.1, 100);
    const lensFrameCamera = new THREE.PerspectiveCamera(10, 1, 0.1, 100);
    const lensFrameProjViewMatrix = new THREE.Matrix4();

    const magnifierZoomMat = new THREE.ShaderMaterial({
      uniforms: {
        tZoomMap: { value: magnifierRenderTarget.texture },
        uFrameProjViewMatrix: { value: lensFrameProjViewMatrix },
        uZoomStrength: { value: 1.0 },
      },
      vertexShader: `
        uniform mat4 uFrameProjViewMatrix;
        varying vec2 vFrameNdc;
        varying vec2 vLocalUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vLocalUv = uv * 2.0 - 1.0;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vec4 frameClip = uFrameProjViewMatrix * worldPos;
          vFrameNdc = frameClip.xy / max(0.0001, frameClip.w);
          vec4 mvPos = viewMatrix * worldPos;
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D tZoomMap;
        uniform float uZoomStrength;
        varying vec2 vFrameNdc;
        varying vec2 vLocalUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float r2 = dot(vLocalUv, vLocalUv);
          // Convex optical barrel curvature inside the lens
          vec2 distortedNdc = vFrameNdc * (1.0 - 0.16 * r2);
          vec2 sampleUv = clamp(distortedNdc * 0.5 + 0.5, 0.02, 0.98);

          // Subtle optical chromatic dispersion near rim
          vec2 caOffset = vLocalUv * 0.0045 * r2 * uZoomStrength;
          float colR = texture2D(tZoomMap, clamp(sampleUv + caOffset, 0.02, 0.98)).r;
          vec4 colG = texture2D(tZoomMap, sampleUv);
          float colB = texture2D(tZoomMap, clamp(sampleUv - caOffset, 0.02, 0.98)).b;
          vec3 zoomedBg = vec3(colR, colG.g, colB);

          // Crisp glass reflection & Fresnel rim highlight
          float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.4);
          float specularBand = smoothstep(0.52, 0.58, vLocalUv.x + vLocalUv.y * 0.65)
                             * (1.0 - smoothstep(0.66, 0.74, vLocalUv.x + vLocalUv.y * 0.65))
                             * (1.0 - smoothstep(0.75, 0.98, r2));
          float innerReticle = smoothstep(0.74, 0.76, sqrt(r2)) * (1.0 - smoothstep(0.76, 0.78, sqrt(r2)));

          vec3 glassTint = vec3(0.86, 0.94, 0.98);
          vec3 finalColor = mix(zoomedBg, glassTint, fresnel * 0.34);
          finalColor += vec3(1.0) * (specularBand * 0.24 + innerReticle * 0.18);

          gl_FragColor = vec4(finalColor, 0.98);
        }
      `,
      transparent: true,
      depthWrite: true,
    });

    const magnifierGroup = new THREE.Group();
    magnifierGroup.position.set(-0.04, 0.08, 0.24);

    // 1. Machined Silver Outer Rim & Cylindrical Lens Barrel
    const magOuterRim = new THREE.Mesh(
      new THREE.TorusGeometry(LENS_RADIUS, 0.022, 28, 72),
      machinedSilverMat
    );
    magnifierGroup.add(magOuterRim);

    const magBarrelSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(LENS_RADIUS + 0.016, LENS_RADIUS + 0.016, 0.044, 64, 1, true),
      fx6BodyMat
    );
    magBarrelSleeve.rotation.x = Math.PI / 2;
    magnifierGroup.add(magBarrelSleeve);

    // 2. Inner Brushed Cobalt Retaining Bezel
    const magInnerBezel = new THREE.Mesh(
      new THREE.TorusGeometry(LENS_RADIUS - 0.018, 0.009, 20, 64),
      brushedCobaltMat
    );
    magInnerBezel.position.z = 0.012;
    magnifierGroup.add(magInnerBezel);

    // 3. Bi-Convex Optical Magnifier Lens (samples the live zoomed background)
    const magnifierLensGeo = new THREE.SphereGeometry(LENS_RADIUS - 0.012, 48, 32);
    magnifierLensGeo.scale(1, 1, 0.16);
    const magnifierLensMesh = new THREE.Mesh(magnifierLensGeo, magnifierZoomMat);
    magnifierGroup.add(magnifierLensMesh);

    // 4. Angled Ergonomic Handle & Silver Ferrule Collar
    const handlePivot = new THREE.Group();
    handlePivot.rotation.z = 0.72; // Classic 41° lower-right magnifier handle angle
    magnifierGroup.add(handlePivot);

    const ferruleCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.027, 0.075, 24),
      machinedSilverMat
    );
    ferruleCollar.position.set(0, -(LENS_RADIUS + 0.045), 0);
    handlePivot.add(ferruleCollar);

    const coralAccentRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.027, 0.006, 16, 32),
      coralCinemaMat
    );
    coralAccentRing.rotation.x = Math.PI / 2;
    coralAccentRing.position.set(0, -(LENS_RADIUS + 0.082), 0);
    handlePivot.add(coralAccentRing);

    const magHandleShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.033, 0.32, 28),
      fx6BodyMat
    );
    magHandleShaft.position.set(0, -(LENS_RADIUS + 0.24), 0);
    handlePivot.add(magHandleShaft);

    for (let g = 0; g < 4; g++) {
      const gripRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.03, 0.0035, 12, 32),
        machinedSilverMat
      );
      gripRing.rotation.x = Math.PI / 2;
      gripRing.position.set(0, -(LENS_RADIUS + 0.15 + g * 0.055), 0);
      handlePivot.add(gripRing);
    }

    const handlePommel = new THREE.Mesh(
      new THREE.SphereGeometry(0.033, 24, 24),
      machinedSilverMat
    );
    handlePommel.position.set(0, -(LENS_RADIUS + 0.4), 0);
    handlePivot.add(handlePommel);

    marketingStationGroup.add(magnifierGroup);
    objectsGroup.add(marketingStationGroup);

    // ============================================================================
    // ORBITAL ELEMENT 3: MEDIA ENGAGEMENT (Broadcast Microphone & 20-Bar 3D EQ Ring)
    // ============================================================================
    const mediaStationGroup = new THREE.Group();

    const micAssembly = new THREE.Group();
    micAssembly.rotation.z = -0.1;

    const micBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.095, 0.38, 36),
      fx6BodyMat
    );
    micAssembly.add(micBody);

    const innerCapsule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.062, 0.062, 0.17, 24),
      coralCinemaMat
    );
    innerCapsule.position.set(0, 0.25, 0);
    micAssembly.add(innerCapsule);

    const capsuleGrilleGeo = new THREE.SphereGeometry(0.106, 32, 24);
    capsuleGrilleGeo.scale(1, 1.45, 1);
    const capsuleGrille = new THREE.Mesh(capsuleGrilleGeo, machinedSilverMat);
    capsuleGrille.position.set(0, 0.24, 0);
    micAssembly.add(capsuleGrille);

    const capsuleWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(capsuleGrilleGeo, 12),
      new THREE.LineBasicMaterial({ color: '#304774', transparent: true, opacity: 0.45 })
    );
    capsuleWire.position.set(0, 0.24, 0);
    micAssembly.add(capsuleWire);

    const micBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.108, 0.014, 16, 48),
      coralCinemaMat
    );
    micBand.rotation.x = Math.PI / 2;
    micBand.position.set(0, 0.18, 0);
    micAssembly.add(micBand);

    const shockUpperRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.175, 0.012, 16, 48),
      brushedCobaltMat
    );
    shockUpperRing.rotation.x = Math.PI / 2;
    shockUpperRing.position.set(0, 0.05, 0);
    micAssembly.add(shockUpperRing);

    const shockLowerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.175, 0.012, 16, 48),
      brushedCobaltMat
    );
    shockLowerRing.rotation.x = Math.PI / 2;
    shockLowerRing.position.set(0, -0.12, 0);
    micAssembly.add(shockLowerRing);

    for (let strutIdx = 0; strutIdx < 4; strutIdx++) {
      const a = (strutIdx / 4) * Math.PI * 2 + Math.PI / 4;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.22, 12),
        machinedSilverMat
      );
      post.position.set(Math.cos(a) * 0.175, -0.035, Math.sin(a) * 0.175);
      micAssembly.add(post);
    }

    const eqRingGroup = new THREE.Group();
    eqRingGroup.position.set(0, 0.04, 0);
    const eqBars: THREE.Mesh[] = [];
    const barCount = 20;
    for (let b = 0; b < barCount; b++) {
      const angle = (b / barCount) * Math.PI * 2;
      const r = 0.39;
      const barGeo = new RoundedBoxGeometry(0.028, 0.16, 0.028, 3, 0.007);
      const barMat =
        b % 3 === 0 ? coralCinemaMat : b % 2 === 0 ? brushedCobaltMat : machinedSilverMat;
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      barMesh.rotation.y = -angle;
      eqRingGroup.add(barMesh);
      eqBars.push(barMesh);
    }
    micAssembly.add(eqRingGroup);
    mediaStationGroup.add(micAssembly);
    objectsGroup.add(mediaStationGroup);

    // ============================================================================
    // PLANETARY CAROUSEL ORBIT SYSTEM (4 Elements Spaced 90° Apart Around Strata)
    // Guaranteed Zero Collisions:
    // - Topographic core max radius = 2.15
    // - Planetary orbit radius = 2.95..3.18
    // - Chord distance between adjacent 90° stations = 4.35 units (> 3.5x object size!)
    // ============================================================================
    const TWO_PI = Math.PI * 2;
    const STEP_ANGLE = TWO_PI / 4; // 90 degrees (1.5708 rad) per station

    interface OrbitalStation {
      index: number;
      group: THREE.Group;
      baseAngle: number;
      baseScale: number;
      heroYawOffset: number;
      heroPitchOffset: number;
    }

    const baseCameraScale = settings.cameraRigScale ?? 1.0;

    const orbitalStations: OrbitalStation[] = [
      {
        index: 0, // Sony FX6 Cinema Camera (First Object in Focus: Hero, Showreel & Videos)
        group: fx6StationGroup,
        baseAngle: 0 * STEP_ANGLE,
        baseScale: 0.92 * baseCameraScale,
        heroYawOffset: -0.52, // Shows 3/4 front lens + shotgun mic + LCD + left-side ND controls
        heroPitchOffset: 0.08,
      },
      {
        index: 1, // Communications Strategies (Animation/3D & Brochures)
        group: commsStationGroup,
        baseAngle: 1 * STEP_ANGLE,
        baseScale: 0.92,
        heroYawOffset: 0.25,
        heroPitchOffset: 0.06,
      },
      {
        index: 2, // Digital Marketing (Websites & Portals)
        group: marketingStationGroup,
        baseAngle: 2 * STEP_ANGLE,
        baseScale: 0.94,
        heroYawOffset: -0.22,
        heroPitchOffset: 0.1,
      },
      {
        index: 3, // Media Engagement (Podcasts, Stories, Experience & Contact)
        group: mediaStationGroup,
        baseAngle: 3 * STEP_ANGLE,
        baseScale: 0.94,
        heroYawOffset: -0.18,
        heroPitchOffset: 0.08,
      },
    ];

    const scrollState = {
      progress: 0,
      explodeAmount: 0.2,
      targetOrbitAngle: 0, // Starts at 0 so Sony FX6 (Station 0) is immediately in focus at the top!
      currentOrbitAngle: 0,
    };

    const updateTargetOrbitFromScroll = () => {
      const vh = window.innerHeight || 1;
      const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const globalProgress = THREE.MathUtils.clamp(scrollY / maxScroll, 0, 1);

      const intensity = settings.scrollMorphIntensity || 1.0;
      scrollState.progress = globalProgress * intensity;
      scrollState.explodeAmount = 0.16 + Math.sin(globalProgress * Math.PI) * 0.34;

      // Measure the scrollY where each station's section group is centered in the viewport
      const getGroupScrollCenter = (selectors: string[], fallbackRatio: number) => {
        let minTop = Infinity;
        let maxBottom = -Infinity;
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const elTop = rect.top + scrollY;
          const elBottom = rect.bottom + scrollY;
          if (elTop < minTop) minTop = elTop;
          if (elBottom > maxBottom) maxBottom = elBottom;
        }
        if (minTop < Infinity && maxBottom > minTop) {
          const centerDocY = (minTop + maxBottom) * 0.5;
          return THREE.MathUtils.clamp(centerDocY - vh * 0.5, 0, maxScroll);
        }
        return fallbackRatio * maxScroll;
      };

      // Strictly increasing scrollY milestones from top (0) to bottom (maxScroll)
      // Station 0 (Sony FX6) starts at scrollY = 0 (angle = 0) so it never reverses direction on initial scroll!
      const s0 = 0;
      const rawS1 = getGroupScrollCenter(['#chapter-02', '#chapter-03'], 0.32);
      const rawS2 = getGroupScrollCenter(['#chapter-04'], 0.58);
      const rawS3 = getGroupScrollCenter(['#chapter-05', '#experience'], 0.82);
      const s4 = maxScroll;

      const s1 = THREE.MathUtils.clamp(rawS1, maxScroll * 0.2, maxScroll * 0.45);
      const s2 = THREE.MathUtils.clamp(Math.max(s1 + maxScroll * 0.16, rawS2), maxScroll * 0.45, maxScroll * 0.72);
      const s3 = THREE.MathUtils.clamp(Math.max(s2 + maxScroll * 0.16, rawS3), maxScroll * 0.7, maxScroll * 0.92);

      const milestones = [
        { s: s0, angle: 0 * STEP_ANGLE },        // Sony FX6 Cinema Camera (Hero, Showreel & Video)
        { s: s1, angle: -1 * STEP_ANGLE },       // Communications Strategies (Animation/3D & Brochures)
        { s: s2, angle: -2 * STEP_ANGLE },       // Digital Marketing (Websites & Portals)
        { s: s3, angle: -3 * STEP_ANGLE },       // Media Engagement (Podcasts, Stories & Experience)
        { s: s4, angle: -3.65 * STEP_ANGLE },    // Continuous completion through Documents & Contact
      ];

      let milestoneAngle = 0;
      for (let i = 0; i < milestones.length - 1; i++) {
        const curr = milestones[i];
        const next = milestones[i + 1];
        if (scrollY >= curr.s && scrollY <= next.s) {
          const span = Math.max(1, next.s - curr.s);
          const t = (scrollY - curr.s) / span;
          milestoneAngle = THREE.MathUtils.lerp(curr.angle, next.angle, t);
          break;
        }
      }
      if (scrollY >= s4) {
        milestoneAngle = milestones[milestones.length - 1].angle;
      }

      // Blend section-aligned milestone angle with pure uniform scroll progression for silky, consistent speed all the way around
      const uniformAngle = -globalProgress * 3.65 * STEP_ANGLE;
      scrollState.targetOrbitAngle = THREE.MathUtils.lerp(milestoneAngle, uniformAngle, 0.35);
    };

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: () => {
          updateTargetOrbitFromScroll();
        },
      });
    });

    window.addEventListener('scroll', updateTargetOrbitFromScroll, { passive: true });
    updateTargetOrbitFromScroll();
    // Initialize currentOrbitAngle to targetOrbitAngle immediately so there is zero jump on load
    scrollState.currentOrbitAngle = scrollState.targetOrbitAngle;

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
        contactBoost.targetSpread = detail.elevationProgress * 0.3;
      }
      if (typeof detail.lightPulse === 'number') {
        contactBoost.targetLightPulse = detail.lightPulse;
      }
      if (typeof detail.cameraYaw === 'number') {
        contactBoost.targetCameraYaw = detail.cameraYaw;
      }
      if (detail.lightColor) {
        focalStageLight.color.set(detail.lightColor);
      }
    };
    window.addEventListener('portfolio:contact-interaction', onContactInteraction);

    // 9. Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      renderer.setSize(container.clientWidth, container.clientHeight);
      updateResponsivePlacement();
      updateTargetOrbitFromScroll();
    };
    window.addEventListener('resize', onResize);

    const updateOrbitalStations = (t: number, effectiveOrbitAngle: number, snap: boolean) => {
      const rx = layoutState.orbitRadiusX;
      const rz = layoutState.orbitRadiusZ;
      const tiltCompensation = Math.tan(TILT_X);

      orbitalStations.forEach((st) => {
        // Angle on the orbit where layoutState.frontFocusAngle is the front-most focal spot
        const theta = st.baseAngle + effectiveOrbitAngle + layoutState.frontFocusAngle;
        const deltaAngle = theta - layoutState.frontFocusAngle;

        // Alignment with front focal spot: +1 when right in front of the viewer, -1 when behind the topographic model
        const frontAlignment = Math.cos(deltaAngle);
        const focusWeight = Math.pow(Math.max(0, (frontAlignment + 0.25) / 1.25), 2.0);
        // Smooth zoom peak when the model spins into the front focus zone
        const zoomBoost = Math.pow(Math.max(0, frontAlignment), 2.8);

        const x = Math.sin(theta) * rx;
        // Slight forward dolly (+Z toward camera) when focused so it zooms closer without touching the core
        const z = Math.cos(theta) * rz + zoomBoost * 0.42;

        // Counteract worldRoot's forward X-tilt (z * tan(TILT_X)) so the entire 360° orbit stays
        // vertically centered on screen instead of dropping to the bottom!
        const bob = prefersReducedMotion ? 0 : Math.sin(t * 1.3 + st.index * 1.25) * 0.032;
        const y = z * tiltCompensation + 0.22 + zoomBoost * 0.1 + bob;

        st.group.position.set(x, y, z);

        // Scale up with a smooth zoom-in when spinning into the front focal zone, scale down when orbiting behind
        const targetScale = st.baseScale * (0.7 + focusWeight * 0.42 + zoomBoost * 0.42);
        const currentScale = snap
          ? targetScale
          : st.group.scale.x + (targetScale - st.group.scale.x) * 0.12;
        st.group.scale.setScalar(currentScale);

        // Continuous, monotonic orientation around the orbit (never snaps or reverses direction)
        const continuousTurn = Math.sin(deltaAngle) * 0.28;
        const targetRotY =
          st.heroYawOffset +
          continuousTurn +
          pointer.lerpedX * 0.18 * focusWeight +
          (prefersReducedMotion ? 0 : Math.sin(t * 0.65 + st.index) * 0.04) +
          contactBoost.cameraYaw * focusWeight;

        const targetRotX =
          THREE.MathUtils.lerp(0.03, st.heroPitchOffset, focusWeight) +
          pointer.lerpedY * 0.1 * focusWeight;

        if (snap) {
          st.group.rotation.y = targetRotY;
          st.group.rotation.x = targetRotX;
        } else {
          st.group.rotation.y += (targetRotY - st.group.rotation.y) * 0.12;
          st.group.rotation.x += (targetRotX - st.group.rotation.x) * 0.12;
        }
      });
    };

    // Pre-position all 4 stations at their exact initial state before the first frame
    updateOrbitalStations(0, scrollState.currentOrbitAngle, true);

    // 10. Animation Loop — Planetary Spin Around Topographic Core
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

      // Smoothly damp the master orbital spin angle toward the scroll-targeted angle
      scrollState.currentOrbitAngle +=
        (scrollState.targetOrbitAngle - scrollState.currentOrbitAngle) * 0.085;

      // Pure monotonic orbital angle (no oscillating idleSpin that fights scroll direction)
      const effectiveOrbitAngle = scrollState.currentOrbitAngle + pointer.lerpedX * 0.06;

      // Strictly clamp totalSpread >= 1.15 so topographic slabs NEVER touch vertically
      const totalSpread = Math.max(
        1.15,
        1.15 + scrollState.explodeAmount * 0.62 + contactBoost.spread
      );

      // Animate each 3D topographic elevation slab
      strataLayers.forEach((layer) => {
        const waveOffset = prefersReducedMotion
          ? 0
          : Math.sin(t * 1.3 + layer.index * 0.35) * 0.018;
        const targetY = layer.baseY * totalSpread + waveOffset;
        layer.group.position.y += (targetY - layer.group.position.y) * 0.09;
        // Topographic strata counter-rotate gently as the outer elements spin around them
        layer.group.rotation.y =
          -effectiveOrbitAngle * (0.14 + layer.index * 0.025) +
          contactBoost.cameraYaw * 0.2;
      });

      // Summit Sculpture above the top stratum
      const topSlabY = strataLayers[strataLayers.length - 1].group.position.y;
      summitObject.position.y =
        Math.max(topSlabY + 0.72, 1.35 * totalSpread) + Math.sin(t * 1.6) * 0.04;
      knotMesh.rotation.x = t * 0.4 - effectiveOrbitAngle * 0.4;
      knotMesh.rotation.y = t * 0.55;
      haloRing.rotation.z = -t * 0.45;

      // Sub-element animations
      signalWaveRings.forEach((ring, idx) => {
        const pulse = (t * 0.65 + idx * 0.33) % 1;
        ring.position.z = 0.36 + pulse * 0.36;
        ring.scale.setScalar(0.65 + pulse * 0.6);
      });
      strategyNodesGroup.rotation.y = t * 0.35;

      eqRingGroup.rotation.y = t * 0.45;
      eqBars.forEach((bar, bIdx) => {
        bar.scale.y = 0.5 + 0.72 * Math.abs(Math.sin(t * 3.4 + bIdx * 0.55));
      });

      // Sweep the Magnifying Glass across the growth bars & topographic background
      magnifierGroup.position.x = Math.sin(t * 0.9) * 0.17;
      magnifierGroup.position.y = 0.08 + Math.cos(t * 0.65) * 0.07;
      magnifierGroup.rotation.z = Math.sin(t * 0.75) * 0.08;

      analyticsBars.forEach((bar, idx) => {
        bar.scale.y = 1 + Math.sin(t * 2.1 + idx * 0.6) * 0.09;
      });

      // Update Sony FX6 Side LCD Monitor with live video snippets from Matteo's published videos
      updateFX6MonitorCanvas(t);

      // Update the 4 Orbiting Elements around the Topographic Model
      updateOrbitalStations(t, effectiveOrbitAngle, false);

      worldRoot.rotation.x = TILT_X + pointer.lerpedY * 0.05;
      worldRoot.rotation.z = -0.06 + pointer.lerpedX * 0.04;

      // Optical Magnifier Lens Real-Time Background Zoom Pass:
      // When the Digital Marketing / Magnifier station comes into view, capture the 3D background
      // directly behind the lens with a 2.5x optical zoom!
      scene.updateMatrixWorld(true);
      const lensWorldPos = new THREE.Vector3();
      magnifierLensMesh.getWorldPosition(lensWorldPos);

      const station2Theta = orbitalStations[2].baseAngle + effectiveOrbitAngle + layoutState.frontFocusAngle;
      const station2Align = Math.cos(station2Theta - layoutState.frontFocusAngle);
      const station2Focus = Math.pow(Math.max(0, (station2Align + 0.35) / 1.35), 1.6);
      const zoomFactor = 1.45 + station2Focus * 1.15; // Ramps up to 2.6x zoom when in focus!
      magnifierZoomMat.uniforms.uZoomStrength.value = station2Focus;

      const distToLens = Math.max(1.5, camera.position.distanceTo(lensWorldPos));
      const worldLensRadius =
        LENS_RADIUS * worldRoot.scale.x * marketingStationGroup.scale.x;
      const halfConeTan = Math.max(0.008, worldLensRadius / distToLens);
      const unzoomedFovDeg = THREE.MathUtils.radToDeg(2 * Math.atan(halfConeTan));
      const zoomedFovDeg = THREE.MathUtils.radToDeg(
        2 * Math.atan(halfConeTan / zoomFactor)
      );

      // 1. Frame camera (1x physical cone) maps the 3D lens disc vertices to [-1, 1] screen-aligned UVs
      lensFrameCamera.position.copy(camera.position);
      lensFrameCamera.up.copy(camera.up);
      lensFrameCamera.fov = unzoomedFovDeg;
      lensFrameCamera.aspect = 1.0;
      lensFrameCamera.lookAt(lensWorldPos);
      lensFrameCamera.updateProjectionMatrix();
      lensFrameCamera.updateMatrixWorld();
      lensFrameProjViewMatrix.multiplyMatrices(
        lensFrameCamera.projectionMatrix,
        lensFrameCamera.matrixWorldInverse
      );

      // 2. Zoom camera (2.6x tighter cone) renders the magnified background behind the lens
      lensZoomCamera.position.copy(camera.position);
      lensZoomCamera.up.copy(camera.up);
      lensZoomCamera.fov = zoomedFovDeg;
      lensZoomCamera.aspect = 1.0;
      lensZoomCamera.lookAt(lensWorldPos);
      lensZoomCamera.updateProjectionMatrix();
      lensZoomCamera.updateMatrixWorld();

      magnifierGroup.visible = false;
      renderer.setRenderTarget(magnifierRenderTarget);
      renderer.setClearColor(0xeef3f7, 1);
      renderer.clear();
      renderer.render(scene, lensZoomCamera);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      magnifierGroup.visible = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(reqId);
      fx6VideoEl.pause();
      fx6VideoEl.removeAttribute('src');
      fx6VideoEl.load();
      window.removeEventListener('scroll', updateTargetOrbitFromScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('portfolio:contact-interaction', onContactInteraction);
      window.removeEventListener('resize', onResize);
      ctx.revert();
      fx6MonitorTexture.dispose();
      magnifierRenderTarget.dispose();
      studioEnv.dispose();
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
