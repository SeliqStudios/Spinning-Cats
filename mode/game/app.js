import { createCats, setupCatInteraction } from './catCreation.js';

function init() {
  const mainContent = document.getElementById('mainContent');
  const scoreValue = document.getElementById('scoreValue');

  let score = 0;

  function updateScore(points) {
    score += points;
    scoreValue.textContent = score;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  mainContent.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  const cats = createCats(scene);
  setupCatInteraction(scene, camera, renderer, updateScore);

  function animate() {
    requestAnimationFrame(animate);
    cats.forEach(cat => {
      cat.rotation.x += 0.01;
      cat.rotation.y += 0.01;
      
      // Optional: animated tail and pupil movements
      if (cat.children[8]) {
        cat.children[8].rotation.z = Math.sin(Date.now() * 0.005) * 0.2;
      }
      
      if (cat.children[4] && cat.children[5]) {
        const pupilOffset = Math.sin(Date.now() * 0.003) * 0.01;
        cat.children[4].position.x = 0.78 + pupilOffset;
        cat.children[5].position.x = 0.78 + pupilOffset;
      }
    });
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Initialize immediately on script load
init();
