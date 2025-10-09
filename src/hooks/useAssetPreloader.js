import { useState, useEffect, useCallback } from 'react';

// Define all assets that need to be preloaded
const ASSETS_TO_PRELOAD = [
    // Main video
    '/map-alive-test.mp4',

    // PNG sequence frames (all 153 frames for Section 5)
    ...Array.from({ length: 153 }, (_, i) => `/frames/frame_${String(i + 1).padStart(4, '0')}.png`),

    // Logo assets
    '/Logo-color.svg',
    '/kahuna-logo-3.svg',
    '/final-logo.svg',
    '/LinkedIn-Icon.png',
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
            const isImage = src.includes('.jpg') || src.includes('.png') || src.includes('.gif') || src.includes('.svg');
            const isPNGFrame = src.includes('/frames/frame_');

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
                    if (isPNGFrame) {
                        console.log(`✓ PNG frame loaded: ${src}`);
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
            // Prioritize critical assets first
            const criticalAssets = ASSETS_TO_PRELOAD.filter(asset =>
                asset.includes('.mp4') || asset.includes('.svg') || asset.includes('.png')
            ).filter(asset => !asset.includes('/frames/frame_'));

            const pngFrames = ASSETS_TO_PRELOAD.filter(asset => asset.includes('/frames/frame_'));

            // Load critical assets first (batch size 2 for better reliability)
            console.log('🎬 Loading critical assets first...');
            for (let i = 0; i < criticalAssets.length; i += 2) {
                const batch = criticalAssets.slice(i, i + 2);
                await Promise.allSettled(batch.map(async (asset) => {
                    try {
                        await preloadAsset(asset);
                        loadedCount++;
                        setLoadedAssets(prev => new Set([...prev, asset]));
                        setProgress(Math.round((loadedCount / totalAssets) * 100));
                        return asset;
                    } catch (error) {
                        console.warn(`Failed to preload critical asset ${asset}:`, error);
                        loadedCount++;
                        setProgress(Math.round((loadedCount / totalAssets) * 100));
                        return null;
                    }
                }));
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Then load PNG frames in smaller batches (batch size 5 for performance)
            console.log('🖼️ Loading PNG sequence frames...');
            for (let i = 0; i < pngFrames.length; i += 5) {
                const batch = pngFrames.slice(i, i + 5);
                await Promise.allSettled(batch.map(async (asset) => {
                    try {
                        await preloadAsset(asset);
                        loadedCount++;
                        setLoadedAssets(prev => new Set([...prev, asset]));
                        setProgress(Math.round((loadedCount / totalAssets) * 100));
                        return asset;
                    } catch (error) {
                        console.warn(`Failed to preload PNG frame ${asset}:`, error);
                        loadedCount++;
                        setProgress(Math.round((loadedCount / totalAssets) * 100));
                        return null;
                    }
                }));
                // Smaller delay for PNG frames to speed up loading
                await new Promise(resolve => setTimeout(resolve, 20));
            }

            // Ensure progress reaches 100%
            setProgress(100);

            // Small delay before completing to show 100% briefly
            await new Promise(resolve => setTimeout(resolve, 500));

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
