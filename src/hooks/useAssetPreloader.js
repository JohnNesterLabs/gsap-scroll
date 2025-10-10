import { useState, useEffect, useCallback } from 'react';

// Define all assets that need to be preloaded
const ASSETS_TO_PRELOAD = [
    // Main demo video
    '/hero4.mp4',

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
            console.log('🎬 Loading Demo assets...');
            
            // Load all assets sequentially for Demo
            for (const asset of ASSETS_TO_PRELOAD) {
                try {
                    await preloadAsset(asset);
                    loadedCount++;
                    setLoadedAssets(prev => new Set([...prev, asset]));
                    setProgress(Math.round((loadedCount / totalAssets) * 100));
                } catch (error) {
                    console.warn(`Failed to preload asset ${asset}:`, error);
                    loadedCount++;
                    setProgress(Math.round((loadedCount / totalAssets) * 100));
                }
                // Small delay between assets
                await new Promise(resolve => setTimeout(resolve, 100));
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
