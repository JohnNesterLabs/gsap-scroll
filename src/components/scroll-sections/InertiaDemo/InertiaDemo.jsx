import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createInertiaScroll, createHeavyAnimation } from "../../../utils/animations";
import "./InertiaDemo.css";

gsap.registerPlugin(ScrollTrigger);

const InertiaDemo = () => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const video = videoRef.current;

        if (!container || !video) return;

        // Create sections for testing
        const sections = gsap.utils.toArray(".inertia-section");

        // Test 1: Basic inertia scroll with different parameters
        createInertiaScroll(video, {
            damping: 0.85,
            stiffness: 0.15,
            mass: 1.2,
            property: 'y',
            range: [0, -100],
            trigger: sections[0]
        });

        // Test 2: Heavy feel animation with multiple properties
        createHeavyAnimation(video, {
            damping: 0.92,
            stiffness: 0.06,
            mass: 2.5,
            properties: {
                x: 200,
                y: -150,
                scale: 0.8
            },
            duration: 1,
            trigger: sections[1]
        });

        // Test 3: Very heavy feel (high mass, low stiffness)
        createHeavyAnimation(video, {
            damping: 0.95,
            stiffness: 0.03,
            mass: 4.0,
            properties: {
                x: -200,
                y: 100,
                scale: 1.2
            },
            duration: 1,
            trigger: sections[2]
        });

        // Test 4: Light feel (low mass, high stiffness)
        createHeavyAnimation(video, {
            damping: 0.8,
            stiffness: 0.2,
            mass: 0.5,
            properties: {
                x: 0,
                y: 0,
                scale: 1
            },
            duration: 1,
            trigger: sections[3]
        });

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach((st) => st.kill());
        };
    }, []);

    return (
        <div ref={containerRef} className="inertia-demo-container">
            {/* Hero Video */}
            <div className="inertia-hero-video">
                <img
                    ref={videoRef}
                    src="/new-model.png"
                    alt="3D Model with Inertia"
                    className="inertia-video-element"
                />
            </div>

            {/* Test Sections */}
            <section className="inertia-section section-1">
                <div className="section-content">
                    <h2>Test 1: Basic Inertia Scroll</h2>
                    <p>Damping: 0.85, Stiffness: 0.15, Mass: 1.2</p>
                    <p>This creates a smooth, natural feeling scroll with moderate inertia.</p>
                </div>
            </section>

            <section className="inertia-section section-2">
                <div className="section-content">
                    <h2>Test 2: Heavy Feel Animation</h2>
                    <p>Damping: 0.92, Stiffness: 0.06, Mass: 2.5</p>
                    <p>This creates a heavy, sluggish movement that feels weighty and substantial.</p>
                </div>
            </section>

            <section className="inertia-section section-3">
                <div className="section-content">
                    <h2>Test 3: Very Heavy Feel</h2>
                    <p>Damping: 0.95, Stiffness: 0.03, Mass: 4.0</p>
                    <p>This creates an extremely heavy feel with slow, deliberate movement.</p>
                </div>
            </section>

            <section className="inertia-section section-4">
                <div className="section-content">
                    <h2>Test 4: Light Feel</h2>
                    <p>Damping: 0.8, Stiffness: 0.2, Mass: 0.5</p>
                    <p>This creates a light, responsive feel with quick, snappy movement.</p>
                </div>
            </section>

            <section className="inertia-section section-5">
                <div className="section-content">
                    <h2>Scroll to see the inertia effects!</h2>
                    <p>The video above will move with different inertia characteristics as you scroll through each section.</p>
                    <p>Notice how the movement feels different in each section - some heavy and sluggish, others light and responsive.</p>
                </div>
            </section>
        </div>
    );
};

export default InertiaDemo;
