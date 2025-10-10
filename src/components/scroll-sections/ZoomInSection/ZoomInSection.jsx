import { useEffect, useRef, useState } from "react";

export default function ZoomInSection({ sectionNumber, text }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      });
    }, options);

    if (sectionRef.current) {
      observerRef.current.observe(sectionRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const gradients = [
    "linear-gradient(to bottom right, #667eea, #764ba2, #f093fb)",
    "linear-gradient(to bottom right, #4facfe, #00f2fe, #43e97b)",
    "linear-gradient(to bottom right, #fa709a, #fee140, #30cfd0)",
    "linear-gradient(to bottom right, #a8edea, #fed6e3, #fbc2eb)",
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: gradients[(sectionNumber - 1) % gradients.length],
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            position: "relative",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isVisible && (
            <h1
              style={{
                fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                animation: "zoom-in 0.6s ease-out forwards",
                zIndex: 10,
              }}
            >
              {text}
            </h1>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "1.125rem",
              fontWeight: "300",
            }}
          >
            Section {sectionNumber}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
};
