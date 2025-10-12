// Device Detection Utility
// This utility helps identify different device types and capabilities

// Import useState and useEffect for the hook
import { useState, useEffect } from 'react';

export const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    const isTablet = /iPad/.test(userAgent) || (isAndroid && /Mobile/.test(userAgent) === false);
    const isDesktop = !isMobile;

    // Get memory info if available
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available

    // Get connection info if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

    return {
        isIOS,
        isAndroid,
        isMobile,
        isTablet,
        isDesktop,
        memory,
        isSlowConnection,
        userAgent,
        // Determine if we should use progressive loading
        shouldUseProgressiveLoading: isIOS || memory < 4 || isSlowConnection
    };
};

// Hook to use device info in React components
export const useDeviceInfo = () => {
    const [deviceInfo, setDeviceInfo] = useState(null);

    useEffect(() => {
        const info = getDeviceInfo();
        setDeviceInfo(info);

        // Log device info for debugging
        console.log('🔍 Device Info:', {
            platform: info.isIOS ? 'iOS' : info.isAndroid ? 'Android' : 'Desktop',
            memory: `${info.memory}GB`,
            progressiveLoading: info.shouldUseProgressiveLoading,
            connection: info.isSlowConnection ? 'Slow' : 'Normal'
        });
    }, []);

    return deviceInfo;
};
