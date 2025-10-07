// Font loading utility for Prodigy Sans
export const loadProdigySansFonts = () => {
  // Create font face objects and load them
  const fonts = [
    {
      family: 'Prodigy Sans',
      weight: 400,
      style: 'normal',
      src: './assets/fonts/ProdigySans-Regular.woff2'
    },
    {
      family: 'Prodigy Sans',
      weight: 500,
      style: 'normal',
      src: './assets/fonts/ProdigySans-Medium.woff2'
    },
    {
      family: 'Prodigy Sans',
      weight: 600,
      style: 'normal',
      src: './assets/fonts/ProdigySans-SemiBold.woff2'
    },
    {
      family: 'Prodigy Sans',
      weight: 700,
      style: 'normal',
      src: './assets/fonts/ProdigySans-Bold.woff2'
    }
  ];

  fonts.forEach(font => {
    const fontFace = new FontFace(font.family, `url(${font.src})`, {
      weight: font.weight,
      style: font.style,
      display: 'swap'
    });

    fontFace.load().then(loadedFont => {
      document.fonts.add(loadedFont);
      console.log(`Loaded ${font.family} ${font.weight}`);
    }).catch(error => {
      console.error(`Failed to load ${font.family} ${font.weight}:`, error);
    });
  });
};
