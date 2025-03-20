import Phaser from 'phaser';
const config = {
    canvas: {
      width: () => window.innerWidth * 0.8,
      height: () => window.innerHeight * 0.6,
      minWidth: 320,
      minHeight: 240
    },
    
    
    game: {
      initialSeeds: 3,
      seedsPerHarvest: 2,
      minGrowthForHarvest: 0.6,
      growthIncrement: 0.1
    },
    
    assets: {
      images:{
          background: "/docs/assets/images/bg.png",
          machine: "/docs/assets/images/machine.png",
          seed1: "/docs/assets/images/seed1.png",
          seed2: "/docs/assets/images/seed2.png",
          pot2: "/docs/assets/images/pot2.png",
          pot1: "/docs/assets/images/pot1.png",
          pot3: "/docs/assets/images/pot3.png",
          pot4: "/docs/assets/images/pot4.png",
          bench1: "/docs/assets/images/bench1.png",
          bench2: "/docs/assets/images/bench2.png",
          duck: "/docs/assets/images/duck.png",
          flower: "/docs/assets/images/flower.png",
          turtle: "/docs/assets/images/turtle.png",
          man: "/docs/assets/images/man.png",
          leaf1: "/docs/assets/images/leaf1.png",
          leaf2: "/docs/assets/images/leaf2.png",
          creature1: "/docs/assets/images/creature1.png",
        },
      audio: {
        backgroundMusic: "/docs/assets/audio/slowlife.mp3",
        backgroundMusic1: "/docs/assets/audio/dawnofchange.mp3",
        plantSound: "/docsassets/audio/plant.mp3",
        harvestSound: "/docsassets/audio/harvest.mp3",
        waterSound: "/docsassets/audio/water.mp3"

      }
    },
    
    ui: {
      fontFamily: "'Alice', serif",
      colors: {
        primary: " #8a4f7d",
        primaryLight: " #9a5f8d",
        accent: " #c9a0dc",
        accentLight: " #d9b0ec",
        textPrimary: " #4a2c40",
        textLight: " #f8dac5",
        textDark: " #ffffff",
        backgroundOverlay: "rgba(248, 218, 197, 0.8)"
      },
      buttonDimensions: {
        width: 180,
        height: 60,
        borderRadius: 16
      }
    },
    
    // Phaser specific configuration
    phaser: {
      type: Phaser.AUTO,
      parent: 'gameCanvas',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    },
    
    // Accessibility options
    accessibility: {
      minFontSize: 16,
      highContrast: false,
      textToSpeech: false
    }
  };
  
  export default config;