import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HalfScroll.css';

gsap.registerPlugin(ScrollTrigger);

const HalfScroll = () => {
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
        <h2 className="section-title">Half Scroll Section 1</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">1</span>
        <span className="slash slash1"></span>
        <span className="ten">10</span>
      </section>
      <section className="section two">
        <h2 className="section-title">Half Scroll Section 2</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">2</span>
        <span className="slash slash2"></span>
        <span className="ten">10</span>
      </section>
      <section className="section three">
        <h2 className="section-title">Half Scroll Section 3</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">3</span>
        <span className="slash slash3"></span>
        <span className="ten">10</span>
      </section>
      <section className="section four">
        <h2 className="section-title">Half Scroll Section 4</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">4</span>
        <span className="slash slash4"></span>
        <span className="ten">10</span>
      </section>
      <section className="section five">
        <h2 className="section-title">Half Scroll Section 5</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">5</span>
        <span className="slash slash5"></span>
        <span className="ten">10</span>
      </section>
      <section className="section six">
        <h2 className="section-title">Half Scroll Section 6</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">6</span>
        <span className="slash slash6"></span>
        <span className="ten">10</span>
      </section>
      <section className="section seven">
        <h2 className="section-title">Half Scroll Section 7</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">7</span>
        <span className="slash slash7"></span>
        <span className="ten">10</span>
      </section>
      <section className="section eight">
        <h2 className="section-title">Half Scroll Section 8</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">8</span>
        <span className="slash slash8"></span>
        <span className="ten">10</span>
      </section>
      <section className="section nine">
        <h2 className="section-title">Half Scroll Section 9</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">9</span>
        <span className="slash slash9"></span>
        <span className="ten">10</span>
      </section>
      <section className="section last">
        <h2 className="section-title">Half Scroll Section 10</h2>
        <p className="section-subtitle">Scroll once for 50% → Scroll again for 100% → Next section</p>
        <span className="number">10</span>
        <span className="slash slash10"></span>
        <span className="ten">10</span>
      </section>
    </div>
  );
};

export default HalfScroll;
