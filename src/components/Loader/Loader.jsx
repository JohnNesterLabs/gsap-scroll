import React, { useState, useEffect } from 'react';
import './Loader.css';

const Loader = ({
    onComplete,
    progress = 0,
    fadeOut = false,
    loadedCount = 0,
    totalAssets = 0,
    error = null,
    loadingPhase = 'initializing',
    isProgressiveLoading = false,
    deviceInfo = null
}) => {
    const [displayProgress, setDisplayProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing...');

    // Smooth progress animation
    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayProgress(prev => {
                if (prev < progress) {
                    return Math.min(prev + 1, progress);
                }
                return prev;
            });
        }, 20);

        return () => clearInterval(timer);
    }, [progress]);

    // Update loading text based on progress and loading strategy
    useEffect(() => {
        if (isProgressiveLoading) {
            // iOS Progressive Loading Messages
            if (loadingPhase === 'initializing') {
                setLoadingText('Initializing Kahuna AI...');
            } else if (loadingPhase === 'critical') {
                if (progress < 25) {
                    setLoadingText('Loading essential assets...');
                } else if (progress < 50) {
                    setLoadingText('Preparing interface...');
                } else if (progress < 75) {
                    setLoadingText('Almost ready...');
                } else if (progress < 100) {
                    setLoadingText('Finalizing...');
                } else {
                    setLoadingText('Welcome to Kahuna AI');
                }
            } else if (loadingPhase === 'large') {
                setLoadingText('Loading additional content...');
            }
        } else {
            // Standard Loading Messages
            if (progress < 5) {
                setLoadingText('Initializing Kahuna AI...');
            } else if (progress < 30) {
                setLoadingText('Loading demo video...');
            } else if (progress < 70) {
                setLoadingText('Loading assets...');
            } else if (progress < 95) {
                setLoadingText('Almost ready...');
            } else if (progress < 100) {
                setLoadingText('Finalizing...');
            } else {
                setLoadingText('Welcome to Kahuna AI');
            }
        }
    }, [progress, loadedCount, totalAssets, loadingPhase, isProgressiveLoading]);

    return (
        <div className={`loader-container ${fadeOut ? 'fade-out' : ''}`}>
            {/* Main loader content */}
            <div className="loader-content">
                {/* Logo/Brand */}
                <div className="loader-logo">
                    <img
                        src="/Logo-color.svg"
                        alt="Kahuna AI"
                        className="loader-logo-svg"
                    />
                </div>

                {/* Progress bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${displayProgress}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        {displayProgress}%
                    </div>
                </div>

                {/* Loading text */}
                <div className="loading-text">
                    {loadingText}
                </div>

                {/* Debug info for testing (remove in production) */}
                {deviceInfo && (
                    <div style={{
                        fontSize: '12px',
                        opacity: 0.7,
                        marginTop: '10px',
                        textAlign: 'center'
                    }}>
                        Device: {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Desktop'} |
                        Strategy: {isProgressiveLoading ? 'Progressive' : 'Standard'} |
                        Phase: {loadingPhase}
                    </div>
                )}

                {/* Animated dots */}
                {/* <div className="loading-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                </div> */}
            </div>

            {/* Error message */}
            {error && (
                <div className="loader-error">
                    <p>Some assets failed to load, but you can continue:</p>
                    <p className="error-details">{error.message}</p>
                </div>
            )}

        </div>
    );
};

export default Loader;
