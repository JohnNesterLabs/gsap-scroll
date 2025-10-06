// ScrollSyncModel.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ScrollSyncModel.css';

const ScrollSyncModelNew = () => {
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
    { title: 'Section 1', subtitle: 'Model at Center', className: 'section-1' },
    { title: 'Section 2', subtitle: 'Model moves Right', className: 'section-2' },
    { title: 'Section 3', subtitle: 'Model moves Down', className: 'section-3' },
    { title: 'Section 4', subtitle: 'Model moves Left', className: 'section-4' },
    { title: 'Section 5', subtitle: 'Model moves Up', className: 'section-5' }
  ];

  return (
    <div className="scroll-sync-container">
      {/* Fixed Canvas */}
      <canvas ref={canvasRef} className="fixed-canvas" />
      
      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="scroll-content">
        {sections.map((section, index) => (
          <div key={index} className={`section ${section.className}`}>
            <div className="section-content">
              <h2 className="section-title">{section.title}</h2>
              <p className="section-subtitle">{section.subtitle}</p>
              <div className="scroll-hint">
                <p>{index < sections.length - 1 ? 'Scroll ↓' : 'Scroll up ↑'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        Scroll to see the model move through sections
      </div>
    </div>
  );
};

export default ScrollSyncModelNew;
