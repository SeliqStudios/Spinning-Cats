// Loading screen logic
window.addEventListener("load", () => {
  const startupText = document.getElementById("startupText");
  const mainContent = document.getElementById("mainContent");
  const backgroundColorInput = document.getElementById('backgroundColor');

  // Set initial background color based on saved preference (if any)
  const savedBackgroundColor = localStorage.getItem('backgroundColor');
  if (savedBackgroundColor) {
    document.body.style.backgroundColor = savedBackgroundColor;
    backgroundColorInput.value = savedBackgroundColor;
  }

  // Save background color preference when changed
  backgroundColorInput.addEventListener('input', (e) => {
    localStorage.setItem('backgroundColor', e.target.value);
  });

  // Fade-in text effect
  setTimeout(() => {
    startupText.classList.add("fade-in");
  }, 1000);

  // Wait for fade-in and then switch to main content
  setTimeout(() => {
    startupText.style.display = "none";
    mainContent.style.display = "block";
  }, 4000);

  // Create audio elements
  const buttonSoundEffect = new Audio('https://seliqstudios.github.io/Spinning-Cats/Assets/roblox-button-sfx.mp3');
  const catMeowSound = new Audio('https://seliqstudios.github.io/Spinning-Cats/Assets/cat-meow-mp3.mp3');
  
  buttonSoundEffect.volume = 0.5;
  catMeowSound.volume = 0.5;

  // Function to play button sound
  function playButtonSound() {
    buttonSoundEffect.currentTime = 0;
    buttonSoundEffect.play().catch(error => {
      console.warn('Error playing button sound:', error);
    });
  }

  // Function to play cat meow sound
  function playCatMeowSound() {
    catMeowSound.currentTime = 0;
    catMeowSound.play().catch(error => {
      console.warn('Error playing cat meow sound:', error);
    });
  }

  // Add sound to various buttons
  const buttonsWithSound = [
    'settingsToggle',
    'startStopButton', 
    'resetButton', 
    'spawnCatButton', 
    'crazyModeButton', 
    'saveCustomBreedButton',
    'customBreedButton'
  ];

  buttonsWithSound.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', playButtonSound);
    }
  });

  // Add sound to toggle switches
  const togglesWithSound = [
    'gameModeToggle',
    'fpsDisplayToggle'
  ];

  togglesWithSound.forEach(toggleId => {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener('change', playButtonSound);
    }
  });

  // Attach cat meow sound to cat interactions
  window.attachCatInteractionSound = function(renderer) {
    if (!renderer) return;

    const domElement = renderer.domElement;

    // Mouse events
    domElement.addEventListener('mousedown', playCatMeowSound);
    domElement.addEventListener('mousemove', (event) => {
      if (event.buttons !== 0) {  // Check if mouse button is held down (dragging)
        playCatMeowSound();
      }
    });

    // Touch events
    domElement.addEventListener('touchstart', playCatMeowSound, { passive: false });
    domElement.addEventListener('touchmove', playCatMeowSound, { passive: false });
  };
});

window.addEventListener('resize', () => {
  if (CatSimulation.camera && CatSimulation.renderer) {
    CatSimulation.camera.aspect = window.innerWidth / window.innerHeight;
    CatSimulation.camera.updateProjectionMatrix();
    CatSimulation.renderer.setSize(window.innerWidth, window.innerHeight);
  }
});

class FPSCounter {
  constructor() {
    this.element = document.getElementById('fpsCounter');
    this.settingsElement = document.getElementById('settingsFpsCounter');
    this.displayToggle = document.getElementById('fpsDisplayToggle');
    this.frames = 0;
    this.lastTime = performance.now();
    this.startCountingFPS();

    // Setup visibility toggle
    if (this.displayToggle) {
      this.displayToggle.addEventListener('change', () => {
        const isChecked = this.displayToggle.checked;
        this.element.style.display = isChecked ? 'block' : 'none';
        
        // Optionally save preference in localStorage
        localStorage.setItem('fpsDisplayVisible', isChecked);
      });

      // Restore previous visibility preference
      const savedVisibility = localStorage.getItem('fpsDisplayVisible');
      if (savedVisibility !== null) {
        const isVisible = savedVisibility === 'true';
        this.displayToggle.checked = isVisible;
        this.element.style.display = isVisible ? 'block' : 'none';
      }
    }
  }

  startCountingFPS() {
    const updateFPS = () => {
      const now = performance.now();
      const elapsed = now - this.lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((this.frames * 1000) / elapsed);
        
        // Update both FPS counters
        if (this.element) {
          this.element.textContent = `FPS: ${fps}`;
        }
        if (this.settingsElement) {
          this.settingsElement.textContent = fps;
        }
        
        this.frames = 0;
        this.lastTime = now;
      }

      this.frames++;
      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }
}

// Initialize FPS counter when Three.js simulation loads
window.addEventListener('load', () => {
  setTimeout(() => {
    new FPSCounter();
  }, 200);
});

// Update cat quantity display
const catQuantityInput = document.getElementById('catQuantity');
const catQuantityValue = document.getElementById('catQuantityValue');

catQuantityInput.addEventListener('input', (e) => {
  catQuantityValue.textContent = e.target.value;
});

// Add a global CSS class toggle utility
window.toggleCSSClass = function(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.classList.toggle(className);
  });
};

// Add keyboard shortcut for CSS class toggle
window.addEventListener('keydown', (event) => {
  // Toggle different CSS classes based on key combinations
  switch(event.key) {
    case 'F9':  // Video mode toggle
      document.body.classList.toggle('video-mode');
      break;
    case 'F10': // Debug mode toggle
      window.toggleCSSClass('body', 'debug-mode');
      break;
    case 'F4': // High contrast mode toggle
      window.toggleCSSClass('body', 'high-contrast-mode');
      break;
  }
});
