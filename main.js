// Loading screen logic
window.addEventListener("load", () => {
  const startupText = document.getElementById("startupText");
  const mainContent = document.getElementById("mainContent");

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
    this.frames = 0;
    this.lastTime = performance.now();
    this.startCountingFPS();
  }

  startCountingFPS() {
    const updateFPS = () => {
      const now = performance.now();
      const elapsed = now - this.lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((this.frames * 1000) / elapsed);
        this.element.textContent = `FPS: ${fps}`;
        
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