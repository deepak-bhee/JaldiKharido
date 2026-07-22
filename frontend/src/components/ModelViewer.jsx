import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ModelViewer = ({
  modelType = 'headphones',
  width = 400,
  height = 400,
  autoRotate = true,
  autoRotateSpeed = 0.5,
  showScreenshotButton = false
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf97316, 0.6);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // 3. Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(2.2, 2.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.7;
    scene.add(shadowMesh);

    // 4. Model Pivot Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    if (modelType === 'headphones') {
      // Headband
      const headbandGeo = new THREE.TorusGeometry(0.7, 0.07, 16, 32, Math.PI);
      const headbandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
      const headband = new THREE.Mesh(headbandGeo, headbandMat);
      headband.position.y = 0.35;
      modelGroup.add(headband);

      // Left Earcup
      const earcupGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.22, 32);
      const earcupMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
      const leftCup = new THREE.Mesh(earcupGeo, earcupMat);
      leftCup.rotation.z = Math.PI / 2;
      leftCup.position.x = -0.7;
      modelGroup.add(leftCup);

      // Left LED Ring
      const ringGeo = new THREE.TorusGeometry(0.38, 0.03, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const leftRing = new THREE.Mesh(ringGeo, ringMat);
      leftRing.rotation.y = Math.PI / 2;
      leftRing.position.x = -0.82;
      modelGroup.add(leftRing);

      // Right Earcup
      const rightCup = new THREE.Mesh(earcupGeo, earcupMat);
      rightCup.rotation.z = Math.PI / 2;
      rightCup.position.x = 0.7;
      modelGroup.add(rightCup);

      // Right LED Ring
      const rightRing = new THREE.Mesh(ringGeo, ringMat);
      rightRing.rotation.y = Math.PI / 2;
      rightRing.position.x = 0.82;
      modelGroup.add(rightRing);
    } else if (modelType === 'watch') {
      // Watch Case
      const caseGeo = new THREE.BoxGeometry(0.8, 1.0, 0.22);
      const caseMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.95, roughness: 0.1 });
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      modelGroup.add(caseMesh);

      // Screen
      const screenGeo = new THREE.PlaneGeometry(0.68, 0.85);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.12;
      modelGroup.add(screen);

      // Crown
      const crownGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.1, 16);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.9 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.rotation.z = Math.PI / 2;
      crown.position.set(0.44, 0.2, 0);
      modelGroup.add(crown);
    } else {
      // Cyber Gem
      const gemGeo = new THREE.OctahedronGeometry(0.75, 0);
      const gemMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.5, roughness: 0.1 });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      modelGroup.add(gem);

      // Orbit Ring
      const ringGeo = new THREE.TorusGeometry(1.1, 0.025, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      modelGroup.add(ring);
    }

    // 5. Mouse & Touch Interactions
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      modelGroup.rotation.y += deltaX * 0.01;
      modelGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 6. Animation Loop
    let animId;
    const animate = () => {
      if (autoRotate && !isDragging) {
        modelGroup.rotation.y += 0.01 * autoRotateSpeed;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelType, width, height, autoRotate, autoRotateSpeed]);

  const capture = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const urlPNG = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'model.png';
    a.href = urlPNG;
    a.click();
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      {showScreenshotButton && (
        <button
          onClick={capture}
          style={{
            position: 'absolute', border: '1px solid rgba(249,115,22,0.5)', right: 12, top: 12, zIndex: 10,
            cursor: 'pointer', padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.6)',
            color: '#f97316', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)'
          }}
        >
          📷 Screenshot
        </button>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
    </div>
  );
};

export default ModelViewer;
