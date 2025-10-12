import './App.css';
import AnimatedSection from './components/AnimatedSection/AnimatedSection';
import Loader from './components/Loader/Loader';
import Demo from './components/scroll-sections/Demo/Demo';
import ScrollSyncModel from './components/scroll-sections/ScrollSyncModel/ScrollSyncModel';
import { useAssetPreloader } from './hooks/useAssetPreloader';
import { useState, useEffect } from 'react';

function App() {

  const [showLoader, setShowLoader] = useState(true);
  const [loaderFadeOut, setLoaderFadeOut] = useState(false);
  const {
    progress,
    isLoading,
    error,
    loadedCount,
    totalAssets,
    loadingPhase,
    deviceInfo,
    isProgressiveLoading
  } = useAssetPreloader();

  // Handle loader completion
  const handleLoaderComplete = () => {
    console.log('🎉 Loader completed, transitioning to main app...');
    setLoaderFadeOut(true);
    // Wait for fade out animation to complete
    setTimeout(() => {
      setShowLoader(false);
    }, 500);
  };

  // Auto-complete loader when assets are loaded
  useEffect(() => {
    if (!isLoading && progress === 100 && !error) {
      console.log(`✅ Assets loaded: ${loadedCount}/${totalAssets}`);
      console.log(`📱 Device: ${deviceInfo?.isIOS ? 'iOS' : deviceInfo?.isAndroid ? 'Android' : 'Desktop'}`);
      console.log(`🔄 Loading strategy: ${isProgressiveLoading ? 'Progressive' : 'Standard'}`);

      // For progressive loading, show 100% for a shorter time since we're only loading critical assets
      const delay = isProgressiveLoading ? 400 : 800;
      setTimeout(() => {
        handleLoaderComplete();
      }, delay);
    }
  }, [isLoading, progress, error, loadedCount, totalAssets, deviceInfo, isProgressiveLoading]);

  // Handle errors by allowing user to skip
  useEffect(() => {
    if (error) {
      console.warn('⚠️ Asset loading error, allowing user to skip:', error);
    }
  }, [error]);
  return (
    <div className="App">
      {showLoader && (
        <Loader
          progress={progress}
          onComplete={handleLoaderComplete}
          fadeOut={loaderFadeOut}
          loadedCount={loadedCount}
          totalAssets={totalAssets}
          error={error}
          loadingPhase={loadingPhase}
          isProgressiveLoading={isProgressiveLoading}
          deviceInfo={deviceInfo}
        />
      )}

      {!showLoader && (
        <Demo />
      )}
    </div>
  );
}

export default App;
