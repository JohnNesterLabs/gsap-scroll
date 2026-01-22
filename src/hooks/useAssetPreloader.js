import { useState, useEffect, useCallback } from 'react';

// Global image cache for preloaded images
window.preloadedImages = window.preloadedImages || new Map();

// Device detection utility
const isMobileDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
           window.innerWidth <= 768 ||
           ('ontouchstart' in window);
};

// PNG frame generation removed - not used in current implementation

// Get device-specific assets to preload
const getAssetsToPreload = () => {
    const isMobile = isMobileDevice();
    const baseAssets = [
        '/hero4.mp4',
        '/demo1.mp4',
        '/Ticket1.mp4',
        '/Ticket1_web.mp4',
        '/Logo-color.svg',
        '/kahuna-logo-3.svg',
        '/final-logo.svg',
        '/LinkedIn-Icon.png',
    ];

    if (isMobile) {
        console.log('📱 Mobile device detected - loading mobile frames only');
        return [
            ...baseAssets,
            ...generateWebPMobileFramePaths(1367, '/frames-mobile-30fps/')
        ];
    } else {
        console.log('🖥️ Desktop device detected - loading desktop frames only');
        return [
            ...baseAssets,
            ...generateWebPDesktopFramePaths(728, '/frames-desktop-webp/')
        ];
    }
};

// Generate WebP mobile frame paths
const generateWebPMobileFramePaths = (totalFrames = 1367, folderPath = '/frames-mobile-30fps/') => {
    const frames = [];
    for (let i = 1; i <= totalFrames; i++) {
        const frameNumber = i.toString().padStart(4, '0');
        // For frames 321-420, use mobile_frame_0320.webp (duplicate frame 320)
        if (i >= 321 && i <= 420) {
            frames.push(`${folderPath}mobile_frame_0320.webp`);
        }
        // For frames 421-1367, duplicate each frame from 420-587 by 5 times for smooth scrolling
        else if (i >= 421) {
            // Calculate which original frame this corresponds to
            const originalFrameStart = 420; // Start of the range to duplicate
            const originalFrameEnd = 587;   // End of the range to duplicate
            const duplicatesPerFrame = 5;   // Each frame duplicated 5 times
            // Calculate which original frame this virtual frame corresponds to
            const virtualFrameIndex = i - 420; // 0-based index from frame 421
            const originalFrameIndex = Math.floor(virtualFrameIndex / duplicatesPerFrame);
            const originalFrame = originalFrameStart + originalFrameIndex;
            // Ensure we don't go beyond the original frame range
            const clampedOriginalFrame = Math.min(originalFrame, originalFrameEnd);
            const originalFrameNumber = clampedOriginalFrame.toString().padStart(4, '0');
            frames.push(`${folderPath}mobile_frame_${originalFrameNumber}.webp`);
        }
        // For all other frames (1-320), use the actual frame number
        else {
            frames.push(`${folderPath}mobile_frame_${frameNumber}.webp`);
        }
    }
    return frames;
};

// Generate WebP desktop frame paths
const generateWebPDesktopFramePaths = (totalFrames = 728, folderPath = '/frames-desktop-webp/') => {
    const frames = [];
    for (let i = 1; i <= totalFrames; i++) {
        const frameNumber = i.toString().padStart(4, '0');
        frames.push(`${folderPath}frame_${frameNumber}.webp`);
    }
    return frames;
};

// Assets are now loaded dynamically based on device type using getAssetsToPreload()

export const useAssetPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadedAssets, setLoadedAssets] = useState(new Set());
    const [error, setError] = useState(null);

    const preloadAsset = useCallback((src) => {
        return new Promise((resolve, reject) => {
            // Determine asset type
            const isVideo = src.includes('.mp4');
            const isImage = src.includes('.jpg') || src.includes('.png') || src.includes('.gif') || src.includes('.svg') || src.includes('.webp');
            // PNG frame detection removed - no longer used
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

                    if (isWebPFrame) {
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

    const preloadAssets = useCallback(async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);
        setLoadedAssets(new Set());

        const assetsToPreload = getAssetsToPreload();
        const totalAssets = assetsToPreload.length;
        let loadedCount = 0;

        try {
            console.log('🎬 Loading Demo assets...');
            console.log(`📊 Total assets to load: ${totalAssets}`);

            // Separate critical assets from frame sequences
            const criticalAssets = assetsToPreload.slice(0, 8); // First 8 are critical (videos + logos)
            const frameAssets = assetsToPreload.slice(8); // Rest are frame sequences

            // Load critical assets first
            console.log('📦 Loading critical assets...');
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

            // Load frame sequences in batches for better performance
            console.log('🖼️ Loading frame sequences in batches...');
            const batchSize = 20; // Load 20 frames at a time
            const totalBatches = Math.ceil(frameAssets.length / batchSize);

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIndex = batchIndex * batchSize;
                const endIndex = Math.min(startIndex + batchSize, frameAssets.length);
                const batch = frameAssets.slice(startIndex, endIndex);

                // Load batch in parallel
                const batchPromises = batch.map(async (asset) => {
                    try {
                        await preloadAsset(asset);
                        return { success: true, asset };
                    } catch (error) {
                        console.warn(`Failed to preload frame ${asset}:`, error);
                        return { success: false, asset, error };
                    }
                });

                // Wait for all promises in batch to complete
                const batchResults = await Promise.allSettled(batchPromises);

                // Update progress for each completed asset
                let batchLoadedCount = 0;
                const batchLoadedAssets = [];

                batchResults.forEach((result) => {
                    batchLoadedCount++;
                    if (result.status === 'fulfilled' && result.value.success) {
                        batchLoadedAssets.push(result.value.asset);
                    }
                });

                // Update counters
                loadedCount += batchLoadedCount;
                setLoadedAssets(prev => new Set([...prev, ...batchLoadedAssets]));
                setProgress(Math.round((loadedCount / totalAssets) * 100));

                // Small delay between batches to prevent overwhelming the network
                if (batchIndex < totalBatches - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            // Ensure progress reaches 100%
            setProgress(100);

            // Small delay before completing to show 100% briefly
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('✅ All assets loaded successfully!');
            setIsLoading(false);
        } catch (error) {
            console.error('Asset preloading failed:', error);
            setError(error);
            setIsLoading(false);
        }
    }, [preloadAsset]);

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
        totalAssets: getAssetsToPreload().length,
        loadedCount: loadedAssets.size
    };
};
