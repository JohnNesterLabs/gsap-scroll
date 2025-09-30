import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollSnapSections.css';  // CSS file we’ll make

gsap.registerPlugin(ScrollTrigger);

const ScrollSnapSections = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray('.section');
    const slashes = gsap.utils.toArray('.slash');

    // Optional: set default ScrollTrigger options
    ScrollTrigger.defaults({
      toggleActions: "restart pause resume pause",
    });

    slashes.forEach((slash, index) => {
      gsap.to(slash, {
        rotation: 380,
        duration: 1,
        scrollTrigger: {
          trigger: sections[index],
          start: 'top center', 
          end: 'bottom center',
          // you can adjust these as needed
        },
      });
    });

    // Clean up when unmounting
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      <section className="section one">
        <span className="number">1</span>
        <span className="slash slash1"></span>
        <span className="ten">10</span>
      </section>
      <section className="section two">
        <span className="number">2</span>
        <span className="slash slash2"></span>
        <span className="ten">10</span>
      </section>
      <section className="section three">
        <span className="number">3</span>
        <span className="slash slash3"></span>
        <span className="ten">10</span>
      </section>
      <section className="section four">
        <span className="number">4</span>
        <span className="slash slash4"></span>
        <span className="ten">10</span>
      </section>
      <section className="section five">
        <span className="number">5</span>
        <span className="slash slash5"></span>
        <span className="ten">10</span>
      </section>
      <section className="section six">
        <span className="number">6</span>
        <span className="slash slash6"></span>
        <span className="ten">10</span>
      </section>
      <section className="section seven">
        <span className="number">7</span>
        <span className="slash slash7"></span>
        <span className="ten">10</span>
      </section>
      <section className="section eight">
        <span className="number">8</span>
        <span className="slash slash8"></span>
        <span className="ten">10</span>
      </section>
      <section className="section nine">
        <span className="number">9</span>
        <span className="slash slash9"></span>
        <span className="ten">10</span>
      </section>
      <section className="section last">
        <span className="number">10</span>
        <span className="slash slash10"></span>
        <span className="ten">10</span>
      </section>
    </div>
  );
};

export default ScrollSnapSections;
