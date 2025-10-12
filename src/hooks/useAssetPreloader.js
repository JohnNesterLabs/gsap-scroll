import { useState, useEffect, useCallback } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

// Global image cache for preloaded images
window.preloadedImages = window.preloadedImages || new Map();

// Generate PNG frame paths
const generatePNGFramePaths = (totalFrames = 328, folderPath = '/frames-journey/') => {
    const frames = [];
    for (let i = 1; i <= totalFrames; i++) {
        const frameNumber = i.toString().padStart(4, '0');
        frames.push(`${folderPath}frame_${frameNumber}.png`);
    }
    return frames;
};

// Generate WebP mobile frame paths
const generateWebPMobileFramePaths = (totalFrames = 436, folderPath = '/frames-mobile-30fps/') => {
    const frames = [];
    for (let i = 1; i <= totalFrames; i++) {
        const frameNumber = i.toString().padStart(4, '0');
        frames.push(`${folderPath}mobile_frame_${frameNumber}.webp`);
    }
    return frames;
};

// Define critical assets that must load first (for iOS progressive loading)
const CRITICAL_ASSETS = [
    // Logo assets (essential for UI)
    '/Logo-color.svg',
    '/kahuna-logo-3.svg',
    '/final-logo.svg',
    '/LinkedIn-Icon.png',
];

// Define large assets that can be loaded progressively
const LARGE_ASSETS = [
    // Main demo video (21.4MB - this is the problematic one)
    '/hero4.mp4',
    '/demo1.mp4',
    '/Final-Ticket-1-(WIP).mp4', // Video popup
];

// Define all assets that need to be preloaded (for non-iOS devices)
const ALL_ASSETS = [
    ...CRITICAL_ASSETS,
    ...LARGE_ASSETS,
    // PNG Sequence frames (all 328 frames for desktop)
    ...generatePNGFramePaths(328, '/frames-journey/'),
    // WebP Mobile Sequence frames (all 436 frames for mobile)
    ...generateWebPMobileFramePaths(436, '/frames-mobile-30fps/'),
];

export const useAssetPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadedAssets, setLoadedAssets] = useState(new Set());
    const [error, setError] = useState(null);
    const [loadingPhase, setLoadingPhase] = useState('initializing'); // Track loading phase
    const [deviceInfo, setDeviceInfo] = useState(null);

    const preloadAsset = useCallback((src) => {
        return new Promise((resolve, reject) => {
            // Determine asset type
            const isVideo = src.includes('.mp4');
            const isImage = src.includes('.jpg') || src.includes('.png') || src.includes('.gif') || src.includes('.svg') || src.includes('.webp');
            const isPNGFrame = src.includes('/frames-journey/frame_');
            const isWebPFrame = src.includes('/frames-mobile-30fps/mobile_frame_');

            if (isVideo) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    console.log(`✓ Video loaded: ${src}`);
                    resolve(src);
                };
                video.onerror = () => {
                    console.warn(`✗ Failed to load video: ${src}`);
                    reject(new Error(`Failed to load video: ${src}`));
                };
                video.src = src;
            } else if (isImage) {
                const img = new Image();
                img.onload = () => {
                    // Store the loaded image in global cache
                    window.preloadedImages.set(src, img);

                    if (isPNGFrame) {
                        console.log(`✓ PNG frame loaded: ${src}`);
                    } else if (isWebPFrame) {
                        console.log(`✓ WebP mobile frame loaded: ${src}`);
                    } else {
                        console.log(`✓ Image loaded: ${src}`);
                    }
                    resolve(src);
                };
                img.onerror = () => {
                    console.warn(`✗ Failed to load image: ${src}`);
                    reject(new Error(`Failed to load image: ${src}`));
                };
                img.src = src;
            } else {
                // For other assets (SVG, etc.), try to fetch them
                fetch(src)
                    .then(response => {
                        if (response.ok) {
                            console.log(`✓ Asset loaded: ${src}`);
                            resolve(src);
                        } else {
                            console.warn(`✗ Failed to load asset: ${src}`);
                            reject(new Error(`Failed to load asset: ${src}`));
                        }
                    })
                    .catch(error => {
                        console.warn(`✗ Network error loading: ${src}`, error);
                        reject(error);
                    });
            }
        });
    }, []);

    // Progressive loading for iOS devices
    const loadCriticalAssetsFirst = useCallback(async () => {
        setLoadingPhase('critical');
        console.log('📦 Loading critical assets first (iOS optimized)...');

        let loadedCount = 0;
        const totalCritical = CRITICAL_ASSETS.length;

        for (const asset of CRITICAL_ASSETS) {
            try {
                await preloadAsset(asset);
                loadedCount++;
                setLoadedAssets(prev => new Set([...prev, asset]));
                // Show progress based on critical assets only
                setProgress(Math.round((loadedCount / totalCritical) * 100));
            } catch (error) {
                console.warn(`Failed to preload critical asset ${asset}:`, error);
                loadedCount++;
                setProgress(Math.round((loadedCount / totalCritical) * 100));
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('✅ Critical assets loaded, allowing app to start...');
        return loadedCount;
    }, [preloadAsset]);

    // Load large assets after critical assets are done
    const loadLargeAssetsProgressively = useCallback(async () => {
        setLoadingPhase('large');
        console.log('🎬 Loading large assets progressively...');

        let loadedCount = 0;
        const totalLarge = LARGE_ASSETS.length;

        for (const asset of LARGE_ASSETS) {
            try {
                await preloadAsset(asset);
                loadedCount++;
                setLoadedAssets(prev => new Set([...prev, asset]));
                setProgress(Math.round((loadedCount / totalLarge) * 100));
            } catch (error) {
                console.warn(`Failed to preload large asset ${asset}:`, error);
                loadedCount++;
                setProgress(Math.round((loadedCount / totalLarge) * 100));
            }
            // Longer delay for large assets
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('✅ Large assets loaded progressively');
        return loadedCount;
    }, [preloadAsset]);

    // Standard loading for non-iOS devices
    const loadAllAssetsStandard = useCallback(async () => {
        setLoadingPhase('standard');
        console.log('🎬 Loading all assets (standard mode)...');

        const totalAssets = ALL_ASSETS.length;
        let loadedCount = 0;

        // Load critical assets first
        const criticalAssets = ALL_ASSETS.slice(0, CRITICAL_ASSETS.length);
        const frameAssets = ALL_ASSETS.slice(CRITICAL_ASSETS.length);

        // Load critical assets
        for (const asset of criticalAssets) {
            try {
                await preloadAsset(asset);
                loadedCount++;
                setLoadedAssets(prev => new Set([...prev, asset]));
                setProgress(Math.round((loadedCount / totalAssets) * 100));
            } catch (error) {
                console.warn(`Failed to preload critical asset ${asset}:`, error);
                loadedCount++;
                setProgress(Math.round((loadedCount / totalAssets) * 100));
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Load frame sequences in batches
        const batchSize = 20;
        const totalBatches = Math.ceil(frameAssets.length / batchSize);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIndex = batchIndex * batchSize;
            const endIndex = Math.min(startIndex + batchSize, frameAssets.length);
            const batch = frameAssets.slice(startIndex, endIndex);

            const batchPromises = batch.map(async (asset) => {
                try {
                    await preloadAsset(asset);
                    return { success: true, asset };
                } catch (error) {
                    console.warn(`Failed to preload frame ${asset}:`, error);
                    return { success: false, asset, error };
                }
            });

            const batchResults = await Promise.allSettled(batchPromises);

            let batchLoadedCount = 0;
            const batchLoadedAssets = [];

            batchResults.forEach((result) => {
                batchLoadedCount++;
                if (result.status === 'fulfilled' && result.value.success) {
                    batchLoadedAssets.push(result.value.asset);
                }
            });

            loadedCount += batchLoadedCount;
            setLoadedAssets(prev => new Set([...prev, ...batchLoadedAssets]));
            setProgress(Math.round((loadedCount / totalAssets) * 100));

            if (batchIndex < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ All assets loaded successfully!');
        return loadedCount;
    }, [preloadAsset]);

    const preloadAssets = useCallback(async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);
        setLoadedAssets(new Set());
        setLoadingPhase('initializing');

        // Get device info
        const device = getDeviceInfo();
        setDeviceInfo(device);

        console.log('🔍 Device detected:', {
            platform: device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : 'Desktop',
            memory: `${device.memory}GB`,
            progressiveLoading: device.shouldUseProgressiveLoading
        });

        try {
            if (device.shouldUseProgressiveLoading) {
                // iOS Progressive Loading Strategy
                console.log('📱 Using iOS progressive loading strategy...');

                // Phase 1: Load critical assets first
                await loadCriticalAssetsFirst();

                // Allow app to start with critical assets
                setIsLoading(false);
                setProgress(100);

                // Phase 2: Load large assets in background (after a delay)
                setTimeout(async () => {
                    console.log('🔄 Starting background loading of large assets...');
                    await loadLargeAssetsProgressively();
                }, 2000); // 2 second delay

            } else {
                // Standard loading for Android/Desktop
                console.log('🖥️ Using standard loading strategy...');
                await loadAllAssetsStandard();
                setIsLoading(false);
            }

        } catch (error) {
            console.error('Asset preloading failed:', error);
            setError(error);
            setIsLoading(false);
        }
    }, [preloadAsset, loadCriticalAssetsFirst, loadLargeAssetsProgressively, loadAllAssetsStandard]);

    // Start preloading when hook is first used
    useEffect(() => {
        preloadAssets();
    }, [preloadAssets]);

    return {
        progress,
        isLoading,
        loadedAssets,
        error,
        retry: preloadAssets,
        totalAssets: deviceInfo?.shouldUseProgressiveLoading ? CRITICAL_ASSETS.length : ALL_ASSETS.length,
        loadedCount: loadedAssets.size,
        loadingPhase,
        deviceInfo,
        isProgressiveLoading: deviceInfo?.shouldUseProgressiveLoading || false
    };
};
