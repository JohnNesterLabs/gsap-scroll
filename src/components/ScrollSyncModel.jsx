import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function ScrollSyncModel() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Create a colorful 3D model (torus knot)
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x002211,
      specular: 0xffffff,
      shininess: 100
    });
    const model = new THREE.Mesh(geometry, material);
    scene.add(model);
    modelRef.current = model;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 1);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate model slightly for visual appeal
      if (modelRef.current) {
        modelRef.current.rotation.x += 0.005;
        modelRef.current.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Scroll handler
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer || !modelRef.current) return;

      const scrollTop = scrollContainer.scrollTop;
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const scrollProgress = scrollTop / maxScroll;

      // Define positions for each section (0 to 1 represents sections 1 to 5)
      const positions = [
        { x: 0, y: 0 },      // Section 1 - Center
        { x: 3, y: 0 },      // Section 2 - Right
        { x: 0, y: -3 },     // Section 3 - Bottom
        { x: -3, y: 0 },     // Section 4 - Left
        { x: 0, y: 3 }       // Section 5 - Top
      ];

      // Calculate which section we're in and interpolate
      const sectionIndex = scrollProgress * 4; // 0 to 4
      const currentSection = Math.floor(sectionIndex);
      const nextSection = Math.min(currentSection + 1, 4);
      const sectionProgress = sectionIndex - currentSection;

      // Interpolate between current and next position
      const currentPos = positions[currentSection];
      const nextPos = positions[nextSection];

      modelRef.current.position.x = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      modelRef.current.position.y = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

      // Change color based on section
      const colors = [0x00ff88, 0xff0088, 0xffff00, 0x00ffff, 0xff8800];
      const currentColor = new THREE.Color(colors[currentSection]);
      const nextColor = new THREE.Color(colors[nextSection]);
      modelRef.current.material.color.copy(currentColor).lerp(nextColor, sectionProgress);

      // Scale effect
      const scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;
      modelRef.current.scale.set(scale, scale, scale);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const sections = [
    { title: 'Section 1', subtitle: 'Model at Center', gradient: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.2))' },
    { title: 'Section 2', subtitle: 'Model moves Right', gradient: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.2), rgba(131, 24, 67, 0.2))' },
    { title: 'Section 3', subtitle: 'Model moves Down', gradient: 'linear-gradient(to bottom right, rgba(234, 179, 8, 0.2), rgba(113, 63, 18, 0.2))' },
    { title: 'Section 4', subtitle: 'Model moves Left', gradient: 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(21, 94, 117, 0.2))' },
    { title: 'Section 5', subtitle: 'Model moves Up', gradient: 'linear-gradient(to bottom right, rgba(249, 115, 22, 0.2), rgba(124, 45, 18, 0.2))' }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Fixed Canvas */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      
      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflowY: 'scroll',
          scrollBehavior: 'smooth'
        }}
      >
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: section.gradient
            }}
          >
            <div style={{
              textAlign: 'center',
              zIndex: 10,
              padding: '2rem',
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                fontSize: '3.75rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1rem'
              }}>{section.title}</h2>
              <p style={{
                fontSize: '1.5rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>{section.subtitle}</p>
              <div style={{ marginTop: '1.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <p style={{ fontSize: '0.875rem' }}>
                  Scroll {index < sections.length - 1 ? '↓' : 'up ↑'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.875rem'
      }}>
        Scroll to see the model move through sections
      </div>
    </div>
  );
}

export default ScrollSyncModel;
