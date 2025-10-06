// ScrollSyncModel.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import './ScrollSyncModel.css';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const ScrollSyncModelGsap = () => {
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

    // GSAP ScrollTrigger animations
    const scrollContainer = scrollContainerRef.current;
    
    // Create a timeline for smooth scroll-based animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrubbing effect (1 second delay)
        scroller: scrollContainer,
      }
    });

    // Animate model position through all sections
    tl.to(model.position, {
      x: 3,
      y: 0,
      duration: 1,
      ease: 'power2.inOut'
    })
    .to(model.position, {
      x: 0,
      y: -3,
      duration: 1,
      ease: 'power2.inOut'
    })
    .to(model.position, {
      x: -3,
      y: 0,
      duration: 1,
      ease: 'power2.inOut'
    })
    .to(model.position, {
      x: 0,
      y: 3,
      duration: 1,
      ease: 'power2.inOut'
    });

    // Animate color changes
    const colorTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        scroller: scrollContainer,
      }
    });

    colorTimeline
      .to(model.material.color, {
        r: 1,
        g: 0,
        b: 0.533,
        duration: 1
      })
      .to(model.material.color, {
        r: 1,
        g: 1,
        b: 0,
        duration: 1
      })
      .to(model.material.color, {
        r: 0,
        g: 1,
        b: 1,
        duration: 1
      })
      .to(model.material.color, {
        r: 1,
        g: 0.533,
        b: 0,
        duration: 1
      });

    // Animate scale
    const scaleTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        scroller: scrollContainer,
      }
    });

    scaleTimeline
      .to(model.scale, {
        x: 1.3,
        y: 1.3,
        z: 1.3,
        duration: 2
      })
      .to(model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 2
      });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
        Scroll to see the model move through sections (GSAP Powered)
      </div>
    </div>
  );
};

export default ScrollSyncModelGsap;
