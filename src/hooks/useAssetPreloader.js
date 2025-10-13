import { useState, useEffect, useCallback } from 'react';

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

// Define all assets that need to be preloaded
const ASSETS_TO_PRELOAD = [
    // Main demo video
    '/hero4.mp4',
    '/demo1.mp4',
    '/Ticket1.mp4', // Video popup (legacy)
    '/Ticket1_web.mp4', // Video popup (new)

    // Logo assets
    '/Logo-color.svg',
    '/kahuna-logo-3.svg',
    '/final-logo.svg',
    '/LinkedIn-Icon.png',
    
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

    const preloadAssets = useCallback(async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);
        setLoadedAssets(new Set());

        const totalAssets = ASSETS_TO_PRELOAD.length;
        let loadedCount = 0;

        try {
            console.log('🎬 Loading Demo assets...');
            
            // Separate critical assets from frame sequences
            const criticalAssets = ASSETS_TO_PRELOAD.slice(0, 7); // First 7 are critical (videos + logos)
            const frameAssets = ASSETS_TO_PRELOAD.slice(7); // Rest are frame sequences (PNG + WebP)
            
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
        totalAssets: ASSETS_TO_PRELOAD.length,
        loadedCount: loadedAssets.size
    };
};
