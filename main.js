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
    // Remove init call from here since it's already self-initializing in cats.js
  }, 4000);
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

// Add video mode functionality
window.addEventListener('keydown', (event) => {
  if (event.key === 'F9' || event.keyCode === 120) {
    document.body.classList.toggle('video-mode');
  }
});

// Update cat quantity display
const catQuantityInput = document.getElementById('catQuantity');
const catQuantityValue = document.getElementById('catQuantityValue');

catQuantityInput.addEventListener('input', (e) => {
  catQuantityValue.textContent = e.target.value;
});
