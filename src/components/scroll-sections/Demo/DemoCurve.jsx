import React, { useEffect, useRef, useState, useCallback } from "react";
import AnimatedSection from "../../AnimatedSection/AnimatedSection";
import "./Demo.css";
import InfiniteWordLoop from "../InfiniteWordLoop/InfiniteWordLoop";
import WebPSequence from "../WebPSequence/WebPSequence";
import { useAssetPreloader } from "../../../hooks/useAssetPreloader";

// Curve-based scroll speed control functions
const curveFunctions = {
    // Smooth acceleration curves
    smoothAcceleration: (t) => t * t * (3 - 2 * t), // Smooth step
    smoothAcceleration2: (t) => t * t * t * (t * (t * 6 - 15) + 10), // Smoother step

    // Exponential curves
    exponentialIn: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    exponentialOut: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    exponentialInOut: (t) => {
        if (t === 0 || t === 1) return t;
        if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
        return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },

    // Sine curves
    sineIn: (t) => 1 - Math.cos((t * Math.PI) / 2),
    sineOut: (t) => Math.sin((t * Math.PI) / 2),
    sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

    // Custom scroll-specific curves
    scrollSlowStart: (t) => t * t * t, // Slow start, fast end
    scrollSlowEnd: (t) => 1 - Math.pow(1 - t, 3), // Fast start, slow end
    scrollSmooth: (t) => t * t * (3 - 2 * t), // Smooth throughout
    scrollBounce: (t) => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    },

    // Elastic curves
    elasticIn: (t) => {
        if (t === 0 || t === 1) return t;
        return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    elasticOut: (t) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },

    // Back curves
    backIn: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    },
    backOut: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
};

// Get initial video position and size for section 1 based on screen size
const getInitialVideoConfig = () => {
    const viewport = (() => {
        const width = window.innerWidth;
        if (width <= 480) return "mobile-small";
        if (width <= 767) return "mobile-large";
        if (width <= 1023) return "tablet";
        if (width <= 1924) return "desktop";
        return "large-desktop";
    })();

    const positionConfigs = {
        "mobile-small": { x: 20, y: 90 },
        "mobile-large": { x: 50, y: 50 },
        tablet: { x: 50, y: 60 },
        desktop: { x: 45, y: 110 },
        "large-desktop": { x: 45, y: 110 },
    };

    const sizeConfigs = {
        "mobile-small": { width: 1520, height: "auto" },
        "mobile-large": { width: 700, height: "auto" },
        tablet: { width: 800, height: "auto" },
        desktop: { width: 1700, height: "auto" },
        "large-desktop": { width: 2200, height: "auto" },
    };

    return {
        position: positionConfigs[viewport] || positionConfigs["desktop"],
        size: sizeConfigs[viewport] || sizeConfigs["desktop"],
    };
};

export default function DemoCurve() {
    const videoRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [, setScrollProgress] = useState(0);

    // Get initial config based on screen size
    const initialConfig = getInitialVideoConfig();

    const [videoPosition, setVideoPosition] = useState({
        x: initialConfig.position.x,
        y: initialConfig.position.y,
        scale: 1,
        rotation: 0,
    });
    const [videoSize, setVideoSize] = useState({
        width: initialConfig.size.width,
        height: initialConfig.size.height
    });
    const [activeSection, setActiveSection] = useState(0);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [sectionProgress, setSectionProgress] = useState(0);

    // Curve control state
    const [curveType, setCurveType] = useState('scrollSmooth');
    const [curveIntensity, setCurveIntensity] = useState(1.0);
    const [reverseCurve, setReverseCurve] = useState(false);

    // Use the asset preloader hook to preload all frames
    const { progress: preloadProgress, isLoading: isPreloading, error: preloadError } = useAssetPreloader();
    const [isInitialized, setIsInitialized] = useState(false);

    // Video preloading state
    const [isVideoPreloaded, setIsVideoPreloaded] = useState(false);
    const [videoPreloadProgress, setVideoPreloadProgress] = useState(0);
    const preloadVideoRef = useRef(null);

    // Configuration objects (same as original)
    const PNG_SEQUENCE_CONFIG = {
        startSection: 4,
        totalFrames: 378,
        framePrefix: "frame_",
        frameSuffix: ".png",
        folderPath: "/frames-journey/",
    };

    const DESKTOP_WEBP_SEQUENCE_CONFIG = {
        startSection: 4,
        totalFrames: 428,
        framePrefix: "frame_",
        frameSuffix: ".webp",
        folderPath: "/frames-desktop-webp/",
    };

    const getScrollStopConfig = () => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            return {
                stopFrame: 234,
                timelineDuration: 5000,
                timelinePosition: { top: "92%", left: "50%" },
                playButtonPosition: { top: "58%", left: "80%" },
            };
        } else {
            return {
                stopFrame: 234,
                timelineDuration: 5000,
                timelinePosition: { top: "80%", left: "77.5%" },
                playButtonPosition: { top: "29%", left: "47%" },
            };
        }
    };

    const [scrollStopConfig, setScrollStopConfig] = useState(getScrollStopConfig);

    useEffect(() => {
        const handleResize = () => {
            setScrollStopConfig(getScrollStopConfig());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobileDevice = () => {
        const width = window.innerWidth;
        return width <= 768;
    };

    // All the configuration functions (same as original)
    const getVideoSizeConfig = useCallback(() => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const configs = {
            "mobile-small": {
                section1: { width: 1520, height: "auto" },
                section2: { width: 1820, height: "auto" },
                section3: { width: 2020, height: "auto" },
                section4: { width: 800, height: "auto" },
                section5: { width: 2100, height: "auto" },
                section6: { width: 0, height: "auto" },
                section7: { width: 0, height: "auto" },
            },
            "mobile-large": {
                section1: { width: 700, height: "auto" },
                section2: { width: 400, height: "auto" },
                section3: { width: 500, height: "auto" },
                section4: { width: 380, height: "auto" },
                section5: { width: 380, height: "auto" },
                section6: { width: 0, height: "auto" },
                section7: { width: 0, height: "auto" },
            },
            tablet: {
                section1: { width: 800, height: "auto" },
                section2: { width: 800, height: "auto" },
                section3: { width: 1000, height: "auto" },
                section4: { width: 700, height: "auto" },
                section5: { width: 700, height: "auto" },
                section6: { width: 0, height: "auto" },
                section7: { width: 0, height: "auto" },
            },
            desktop: {
                section1: { width: 1700, height: "auto" },
                section2: { width: 1800, height: "auto" },
                section3: { width: 2500, height: "auto" },
                section4: { width: 1080, height: "auto" },
                section5: { width: 2150, height: "auto" },
                section6: { width: 0, height: "auto" },
                section7: { width: 0, height: "auto" },
            },
            "large-desktop": {
                section1: { width: 2200, height: "auto" },
                section2: { width: 2300, height: "auto" },
                section3: { width: 3000, height: "auto" },
                section4: { width: 2380, height: "auto" },
                section5: { width: 3250, height: "auto" },
                section6: { width: 0, height: "auto" },
                section7: { width: 0, height: "auto" },
            },
        };
        return configs[viewport] || configs["desktop"];
    }, []);

    const getPositionConfig = useCallback(() => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const positionConfigs = {
            "mobile-small": [
                { x: 20, y: 90 },
                { x: 110, y: 70 },
                { x: 40, y: 50 },
                { x: 38, y: 50 },
                { x: 40, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
            ],
            "mobile-large": [
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
            ],
            tablet: [
                { x: 50, y: 60 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
            ],
            desktop: [
                { x: 45, y: 110 },
                { x: 90, y: 65 },
                { x: 50, y: 50 },
                { x: 45, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
            ],
            "large-desktop": [
                { x: 45, y: 110 },
                { x: 90, y: 65 },
                { x: 50, y: 50 },
                { x: 45, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
                { x: 50, y: 50 },
            ],
        };
        return positionConfigs[viewport] || positionConfigs["desktop"];
    }, []);

    const getRotationConfig = useCallback(() => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const rotationConfigs = {
            "mobile-small": [0, 0, 0, 0, 0, 0, 0],
            "mobile-large": [0, 0, 0, 0, 0, 0, 0],
            tablet: [0, 0, 0, 0, 0, 0, 0],
            desktop: [0, 0, 0, 0, 0, 0, 0],
            "large-desktop": [0, 0, 0, 0, 0, 0, 0],
        };
        return rotationConfigs[viewport] || rotationConfigs["desktop"];
    }, []);

    const getTextPositionConfig = () => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const textPositionConfigs = {
            "mobile-small": ["top", "top", "center", "center", "center", "center"],
            "mobile-large": ["center", "center", "center", "center", "center", "center"],
            tablet: ["top", "left", "center", "right", "bottom", "top-left"],
            desktop: ["top", "left", "center", "right", "bottom", "top-left"],
            "large-desktop": ["top", "left", "center", "right", "bottom", "top-left"],
        };
        return textPositionConfigs[viewport] || textPositionConfigs["desktop"];
    };

    const getTextAlignConfig = () => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const textAlignConfigs = {
            "mobile-small": ["center", "left", "center", "center", "center", "center"],
            "mobile-large": ["center", "center", "center", "center", "center", "center"],
            tablet: ["center", "left", "center", "right", "center", "left"],
            desktop: ["center", "left", "center", "center", "center", "left"],
            "large-desktop": ["center", "left", "center", "center", "center", "left"],
        };
        return textAlignConfigs[viewport] || textAlignConfigs["desktop"];
    };

    const getFontSizeConfig = () => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const fontSizeConfigs = {
            "mobile-small": ["26px", "26px", "36px", "24px", "24px", "26px"],
            "mobile-large": ["32px", "28px", "36px", "30px", "32px", "30px"],
            tablet: ["48px", "32px", "52px", "40px", "44px", "40px"],
            desktop: ["60px", "36px", "60px", "36px", "36px", "36px"],
            "large-desktop": ["72px", "42px", "76px", "56px", "60px", "56px"],
        };
        return fontSizeConfigs[viewport] || fontSizeConfigs["desktop"];
    };

    const getFontWeightConfig = () => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        const fontWeightConfigs = {
            "mobile-small": ["500", "500", "500", "500", "500", "500"],
            "mobile-large": ["500", "500", "600", "500", "500", "500"],
            tablet: ["500", "500", "600", "500", "500", "500"],
            desktop: ["500", "500", "600", "500", "500", "500"],
            "large-desktop": ["500", "500", "600", "500", "500", "500"],
        };
        return fontWeightConfigs[viewport] || fontWeightConfigs["desktop"];
    };

    const getSection1TextSets = () => {
        const viewport = (() => {
            const width = window.innerWidth;
            if (width <= 480) return "mobile-small";
            if (width <= 767) return "mobile-large";
            if (width <= 1023) return "tablet";
            if (width <= 1924) return "desktop";
            return "large-desktop";
        })();

        if (viewport === "mobile-small" || viewport === "mobile-large") {
            return {
                firstSet: ["Vast and intricate products never stop evolving."],
                secondSet: ["Enterprise customers have an endless spectrum of realities."]
            };
        }

        return {
            firstSet: ["Vast and intricate,", "products never stop evolving."],
            secondSet: ["Enterprise customers have an", "endless spectrum of realities."]
        };
    };

    // CURVE-BASED SCROLL HANDLER
    const handleScroll = useCallback(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer || !videoRef.current) {
            return;
        }

        const scrollTop = scrollContainer.scrollTop;
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

        if (maxScroll <= 0) {
            return;
        }

        const rawScrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));

        // Apply curve function to control scroll speed
        const curveFunction = curveFunctions[curveType];
        let curvedProgress = curveFunction(rawScrollProgress);

        // Apply intensity
        curvedProgress = rawScrollProgress + (curvedProgress - rawScrollProgress) * curveIntensity;

        // Apply reverse if enabled
        if (reverseCurve) {
            curvedProgress = 1 - curvedProgress;
        }

        const scrollProgress = Math.max(0, Math.min(1, curvedProgress));

        requestAnimationFrame(() => {
            setScrollProgress(scrollProgress);

            const positions = getPositionConfig();
            const rotations = getRotationConfig();
            const videoSizeConfig = getVideoSizeConfig();

            const totalSections = 7;
            const sectionIndex = scrollProgress * (totalSections - 1);
            const currentSection = Math.floor(sectionIndex);
            const nextSection = Math.min(currentSection + 1, totalSections - 1);
            const sectionProgress = sectionIndex - currentSection;

            if (currentSection !== activeSection) {
                setActiveSection(currentSection);
            }
            setSectionProgress(sectionProgress);

            const currentPos = positions[currentSection];
            const nextPos = positions[nextSection];

            const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
            const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

            const currentRotation = rotations[currentSection];
            const nextRotation = rotations[nextSection];
            const newRotation = currentRotation + (nextRotation - currentRotation) * sectionProgress;

            let scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;

            const sizeKeys = ["section1", "section2", "section3", "section4", "section5", "section6", "section7"];
            const currentSizeKey = sizeKeys[currentSection];
            const nextSizeKey = sizeKeys[nextSection];

            const currentSize = videoSizeConfig[currentSizeKey];
            const nextSize = videoSizeConfig[nextSizeKey];

            const newWidth = currentSize.width + (nextSize.width - currentSize.width) * sectionProgress;

            setVideoPosition({ x: newX, y: newY, scale, rotation: newRotation });
            setVideoSize({ width: newWidth, height: "auto" });
            setHeaderVisible(scrollProgress < 0.02);
        });
    }, [activeSection, getPositionConfig, getRotationConfig, getVideoSizeConfig, curveType, curveIntensity, reverseCurve]);

    // Setup scroll listener
    useEffect(() => {
        const setupScrollListener = async () => {
            let attempts = 0;
            while (!scrollContainerRef.current && attempts < 50) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                attempts++;
            }

            const scrollContainer = scrollContainerRef.current;
            if (!scrollContainer) {
                console.error("Scroll container not found after 5 seconds");
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 200));

            console.log("Setting up Curve Demo scroll listener...");

            let ticking = false;
            const throttledHandleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            scrollContainer.addEventListener("scroll", throttledHandleScroll, {
                passive: true,
            });

            handleScroll();

            setTimeout(() => {
                setIsInitialized(true);
                console.log("Curve Demo scroll listener attached successfully");
            }, 100);
        };

        setupScrollListener();

        return () => {
            // Cleanup handled by async function scope
        };
    }, [handleScroll]);

    // Video preloading
    useEffect(() => {
        const preloadVideo = () => {
            const video = document.createElement('video');
            video.src = '/Ticket1_web.mp4';
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;

            preloadVideoRef.current = video;

            video.addEventListener('loadstart', () => {
                console.log('Video preloading started...');
            });

            video.addEventListener('progress', () => {
                if (video.buffered.length > 0) {
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                    const duration = video.duration;
                    if (duration > 0) {
                        const progress = (bufferedEnd / duration) * 100;
                        setVideoPreloadProgress(progress);
                        console.log(`Video preload progress: ${progress.toFixed(1)}%`);
                    }
                }
            });

            video.addEventListener('canplaythrough', () => {
                console.log('Video preloading completed!');
                setIsVideoPreloaded(true);
                setVideoPreloadProgress(100);
            });

            video.addEventListener('error', (e) => {
                console.error('Video preloading failed:', e);
                setIsVideoPreloaded(true);
            });

            video.load();
        };

        preloadVideo();

        return () => {
            if (preloadVideoRef.current) {
                preloadVideoRef.current.remove();
                preloadVideoRef.current = null;
            }
        };
    }, []);

    // Initialize video
    useEffect(() => {
        if (!isInitialized) return;

        const video = videoRef.current;
        if (!video) return;

        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "auto";

        video.addEventListener("loadeddata", () => {
            console.log("Curve Demo video loaded successfully");
            video.play().catch((err) => {
                console.warn("Autoplay failed:", err);
            });
        });

        video.addEventListener("error", (e) => {
            console.error("Video loading error:", e);
        });
    }, [isInitialized]);

    return (
        <div className="demo-container">
            {/* Curve Controls */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                fontFamily: 'monospace',
                maxWidth: '300px'
            }}>
                <h3>Curve Controls</h3>

                <div style={{ marginBottom: '10px' }}>
                    <label>Curve Type:</label>
                    <select
                        value={curveType}
                        onChange={(e) => setCurveType(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '100%' }}
                    >
                        <optgroup label="Scroll-Specific">
                            <option value="scrollSlowStart">Slow Start</option>
                            <option value="scrollSlowEnd">Slow End</option>
                            <option value="scrollSmooth">Smooth</option>
                            <option value="scrollBounce">Bounce</option>
                        </optgroup>
                        <optgroup label="Smooth Acceleration">
                            <option value="smoothAcceleration">Smooth Step</option>
                            <option value="smoothAcceleration2">Smoother Step</option>
                        </optgroup>
                        <optgroup label="Exponential">
                            <option value="exponentialIn">Exponential In</option>
                            <option value="exponentialOut">Exponential Out</option>
                            <option value="exponentialInOut">Exponential In/Out</option>
                        </optgroup>
                        <optgroup label="Sine">
                            <option value="sineIn">Sine In</option>
                            <option value="sineOut">Sine Out</option>
                            <option value="sineInOut">Sine In/Out</option>
                        </optgroup>
                        <optgroup label="Elastic">
                            <option value="elasticIn">Elastic In</option>
                            <option value="elasticOut">Elastic Out</option>
                        </optgroup>
                        <optgroup label="Back">
                            <option value="backIn">Back In</option>
                            <option value="backOut">Back Out</option>
                        </optgroup>
                    </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Intensity: {curveIntensity.toFixed(1)}</label>
                    <input
                        type="range"
                        min="0.0"
                        max="2.0"
                        step="0.1"
                        value={curveIntensity}
                        onChange={(e) => setCurveIntensity(parseFloat(e.target.value))}
                        style={{ width: '100%', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={reverseCurve}
                            onChange={(e) => setReverseCurve(e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        Reverse Curve
                    </label>
                </div>

                <div style={{ fontSize: '12px', color: '#ccc' }}>
                    <div>• 0.0 = No curve effect</div>
                    <div>• 1.0 = Full curve effect</div>
                    <div>• 2.0 = Exaggerated curve</div>
                </div>
            </div>

            {/* Background Layer */}
            <div className="demo-background-layer" />

            {/* Fixed Video */}
            {isInitialized && (
                <video
                    ref={videoRef}
                    src="/hero4.mp4"
                    className="demo-fixed-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disablePictureInPicture
                    controls={false}
                    style={{
                        position: "fixed",
                        zIndex: 2,
                        pointerEvents: "none",
                        left: `${videoPosition.x}%`,
                        top: `${videoPosition.y}%`,
                        transform: `translate(-50%, -50%) scale(${videoPosition.scale}) rotate(${videoPosition.rotation}deg)`,
                        width: `${videoSize.width}px`,
                        height: videoSize.height,
                        opacity: isInitialized ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        touchAction: 'pan-y',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                    }}
                />
            )}

            {/* Header */}
            {isInitialized && (
                <div className={`demo-header ${headerVisible ? "visible" : "hidden"}`}>
                    <div className="demo-header-left">
                        <img
                            src="/kahuna-logo-3.svg"
                            alt="Kahuna Logo"
                            className="demo-header-logo"
                        />
                    </div>
                    <a
                        href="mailto:info@kahunalabs.ai"
                        onClick={() => {
                            console.log("Let's Talk button clicked!");
                        }}
                        className="demo-header-button"
                    >
                        Let's Talk
                    </a>
                </div>
            )}

            {/* Scrollable Content */}
            <div
                ref={scrollContainerRef}
                className="demo-scroll-container"
                style={{
                    height: "100vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                <AnimatedSection
                    sectionNumber={1}
                    textPosition={getTextPositionConfig()[0]}
                    textAlign={getTextAlignConfig()[0]}
                    fontSize={getFontSizeConfig()[0]}
                    fontWeight={getFontWeightConfig()[0]}
                    firstSet={getSection1TextSets().firstSet}
                    secondSet={getSection1TextSets().secondSet}
                />
                <AnimatedSection
                    sectionNumber={2}
                    textPosition={getTextPositionConfig()[1]}
                    textAlign={getTextAlignConfig()[1]}
                    fontSize={getFontSizeConfig()[1]}
                    fontWeight={getFontWeightConfig()[1]}
                    firstSet={["The support landscape is", "boundless and shifting"]}
                    secondSet={["You're lost.", "", "Outdated, laborious", "and fractional knowledge", "cripple frontline actions."]}
                />
                <AnimatedSection
                    sectionNumber={3}
                    textPosition={getTextPositionConfig()[2]}
                    textAlign={getTextAlignConfig()[2]}
                    fontSize={getFontSizeConfig()[2]}
                    fontWeight={getFontWeightConfig()[2]}
                    firstSet={["Meet Kahuna AI"]}
                />
                <InfiniteWordLoop
                    sectionNumber={4}
                    words={["Secure", "Private", "Enterprise Grade", "Comprehensive"]}
                />

                {/* WebP Sequence */}
                {isMobileDevice() ? (
                    <WebPSequence
                        startSection={PNG_SEQUENCE_CONFIG.startSection}
                        totalFrames={1367}
                        framePrefix="mobile_frame_"
                        frameSuffix=".webp"
                        folderPath="/frames-mobile-30fps/"
                        activeSection={activeSection}
                        sectionProgress={sectionProgress}
                        stopFrame={320}
                        timelineDuration={scrollStopConfig.timelineDuration}
                        timelinePosition={scrollStopConfig.timelinePosition}
                        playButtonPosition={scrollStopConfig.playButtonPosition}
                        videoSrc="/Ticket1_web.mp4"
                        showVideoPopup={true}
                        isVideoPreloaded={isVideoPreloaded}
                        videoPreloadProgress={videoPreloadProgress}
                        onTimelineComplete={() => {
                            console.log("Mobile WebP sequence timeline completed");
                        }}
                        onPlayButtonClick={() => {
                            console.log("Mobile WebP sequence play button clicked");
                        }}
                    />
                ) : (
                    <WebPSequence
                        startSection={DESKTOP_WEBP_SEQUENCE_CONFIG.startSection}
                        totalFrames={DESKTOP_WEBP_SEQUENCE_CONFIG.totalFrames}
                        framePrefix={DESKTOP_WEBP_SEQUENCE_CONFIG.framePrefix}
                        frameSuffix={DESKTOP_WEBP_SEQUENCE_CONFIG.frameSuffix}
                        folderPath={DESKTOP_WEBP_SEQUENCE_CONFIG.folderPath}
                        activeSection={activeSection}
                        sectionProgress={sectionProgress}
                        stopFrame={scrollStopConfig.stopFrame}
                        timelineDuration={scrollStopConfig.timelineDuration}
                        timelinePosition={scrollStopConfig.timelinePosition}
                        playButtonPosition={scrollStopConfig.playButtonPosition}
                        videoSrc="/Ticket1_web.mp4"
                        showVideoPopup={true}
                        isVideoPreloaded={isVideoPreloaded}
                        videoPreloadProgress={videoPreloadProgress}
                        onTimelineComplete={() => {
                            console.log("Desktop WebP sequence timeline completed");
                        }}
                        onPlayButtonClick={() => {
                            console.log("Desktop WebP sequence play button clicked");
                        }}
                    />
                )}

                <AnimatedSection
                    sectionNumber={5}
                    textPosition={getTextPositionConfig()[3]}
                    textAlign={getTextAlignConfig()[3]}
                    fontSize={getFontSizeConfig()[3]}
                    fontWeight={getFontWeightConfig()[3]}
                    firstSet={[]}
                />

                {/* Last Frame Display */}
                {isMobileDevice() ? (
                    <div className="demo-section last-frame-section">
                        <img
                            src="/frames-mobile-30fps/mobile_frame_0536.webp"
                            alt="Mobile Journey Final Frame"
                            className="last-frame-image"
                        />
                    </div>
                ) : (
                    <div className="demo-section last-frame-section">
                        <img
                            src="/frames-journey/frame_0328.png"
                            alt="Desktop Journey Final Frame"
                            className="last-frame-image"
                        />
                    </div>
                )}

                {/* Footer Section */}
                <div className="demo-section demo-footer">
                    <div className="footer-container">
                        <img
                            src="/final-logo.svg"
                            alt="Kahuna Labs"
                            className="footer-logo-bg"
                        />
                        <div className="footer-tagline">
                            <div className="footer-tagline-text">
                                <div className="footer-tagline-line">
                                    Secure. Private. Comprehensive. Enterprise Grade.
                                </div>
                            </div>
                        </div>
                        <div className="footer-content">
                            <div className="footer-links">
                                <div className="footer-column">
                                    <h3 className="footer-column-title">TECHNOLOGY</h3>
                                    <ul className="footer-links-list">
                                        <li>
                                            <a
                                                href="https://form.jotform.com/251278392049160"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="footer-link"
                                            >
                                                How Complex is Your Support?
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="footer-column">
                                    <h3 className="footer-column-title">COMPANY</h3>
                                    <ul className="footer-links-list">
                                        <li>
                                            <a
                                                href="mailto:info@kahunalabs.ai"
                                                className="footer-link"
                                            >
                                                Contact us
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="mailto:careers@kahunalabs.ai"
                                                className="footer-link"
                                            >
                                                Careers
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="footer-column">
                                    <a
                                        href="https://linkedin.com/company/kahuna-labs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-linkedin"
                                    >
                                        <img
                                            src="/LinkedIn-Icon.png"
                                            alt="LinkedIn"
                                            className="footer-linkedin-icon"
                                        />
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                            <div className="footer-logo-section">
                                <div className="footer-logo-container">
                                    <img src="/kahuna-logo-3.svg" alt="Kahuna Labs" />
                                </div>
                            </div>
                        </div>
                        <div className="footer-copyright">
                            <div className="footer-copyright-text">
                                <div>
                                    <p>
                                        Kahuna AI and its components are trademarks of Kahuna Labs.
                                    </p>
                                    <p>
                                        The proprietary technology of Kahuna AI is protected by
                                        multiple issued and pending U.S. and international patents
                                        owned by Kahuna Labs.
                                    </p>
                                </div>
                                <p>All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
