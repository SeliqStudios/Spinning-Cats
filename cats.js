// Create a namespace for the cat simulation
class CatSimulation {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cats = [];
    this.isSimulationRunning = true;  // New flag to track simulation state

    // Settings with default values
    this.settings = {
      spawnRate: 1,      // cats per second
      speedRate: 0.01,   // movement speed
      spinRate: 0.01,    // spinning rate
      despawnRate: 30    // seconds before cats despawn
    };

    this.catVariants = [
      {name: 'Tabby', color: 0xA0522D, eyeColor: 0x00FF00},
      {name: 'Siamese', color: 0xFDF5E6, eyeColor: 0x0000FF}, 
      {name: 'Persian', color: 0xFFFFFF, eyeColor: 0xFFA500},
      {name: 'Bengal', color: 0xD2691E, eyeColor: 0xFFD700},
      {name: 'Sphynx', color: 0xFFC0CB, eyeColor: 0x00FFFF},
      {name: 'Scottish Fold', color: 0x808080, eyeColor: 0xFFFF00},
      {name: 'Maine Coon', color: 0x8B4513, eyeColor: 0x8B4513},
      {name: 'Russian Blue', color: 0x4682B4, eyeColor: 0x00FF00},
      {name: 'Ragdoll', color: 0xF0F8FF, eyeColor: 0x0000FF},
      {name: 'British Shorthair', color: 0x708090, eyeColor: 0xFFA500}
    ];
  }

  init() {
    // Only initialize if not already initialized
    if (this.scene) return;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("mainContent").appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    this.animate();
    this.spawnCats();

    // Setup settings event listeners
    this.setupSettingsListeners();
  }

  setupSettingsListeners() {
    const spawnRateInput = document.getElementById('spawnRate');
    const speedRateInput = document.getElementById('speedRate');
    const spinRateInput = document.getElementById('spinRate');
    const despawnRateInput = document.getElementById('despawnRate');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsTab = document.getElementById('settingsTab');

    // Update spawn rate display and setting
    spawnRateInput.addEventListener('input', (e) => {
      document.getElementById('spawnRateValue').textContent = e.target.value;
      this.settings.spawnRate = parseFloat(e.target.value);
      // Restart cat spawning with new rate
      this.stopSpawningCats();
      this.spawnCats();
    });

    // Update speed rate display and setting
    speedRateInput.addEventListener('input', (e) => {
      document.getElementById('speedRateValue').textContent = e.target.value;
      this.settings.speedRate = parseFloat(e.target.value);
    });

    // Update spin rate display and setting
    spinRateInput.addEventListener('input', (e) => {
      document.getElementById('spinRateValue').textContent = e.target.value;
      this.settings.spinRate = parseFloat(e.target.value);
    });

    // Despawn rate listener
    despawnRateInput.addEventListener('input', (e) => {
      document.getElementById('despawnRateValue').textContent = e.target.value;
      this.settings.despawnRate = parseFloat(e.target.value);
      // No immediate action needed, will affect future cat spawns
    });

    // Toggle settings tab
    settingsToggle.addEventListener('click', () => {
      settingsTab.classList.toggle('open');
    });

    const startStopButton = document.getElementById('startStopButton');
    const resetButton = document.getElementById('resetButton');

    // Start/Stop button logic
    startStopButton.addEventListener('click', () => {
      if (this.isSimulationRunning) {
        this.stopSimulation();
        startStopButton.textContent = 'Start';
      } else {
        this.startSimulation();
        startStopButton.textContent = 'Stop';
      }
    });

    // Reset button logic
    resetButton.addEventListener('click', () => {
      this.resetSimulation();
      startStopButton.textContent = 'Stop';
    });

    // Add Spawn Cat button listener
    const spawnCatButton = document.getElementById('spawnCatButton');
    spawnCatButton.addEventListener('click', () => {
      // Only spawn if simulation is running
      if (this.isSimulationRunning) {
        this.spawnRandomCat();
      }
    });
  }

  createCat(variant) {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({color: variant.color});
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 0.8, 1.2);
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({color: variant.color});
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.5, 0.3, 0);
    head.scale.set(1, 0.9, 0.9);
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({color: variant.eyeColor});
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.75, 0.35, 0.12);
    group.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.75, 0.35, -0.12);
    group.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.02, 32, 32);
    const pupilMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0.78, 0.35, 0.12);
    group.add(leftPupil);

    const rightPupil = leftPupil.clone();
    rightPupil.position.set(0.78, 0.35, -0.12);
    group.add(rightPupil);

    // Ears
    const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(0.6, 0.5, 0.15);
    leftEar.rotation.z = -Math.PI / 4;
    group.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.set(0.6, 0.5, -0.15);
    rightEar.rotation.z = -Math.PI / 4;
    group.add(rightEar);

    // Tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(-0.7, 0.2, 0),
      new THREE.Vector3(-0.9, 0.3, 0),
      new THREE.Vector3(-0.8, 0.4, 0)
    ]);
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 20, 0.04, 8, false);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    group.add(tail);

    // Paws
    const pawGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const pawMaterial = new THREE.MeshPhongMaterial({color: variant.color});
    const positions = [
      [-0.3, -0.5, 0.2],
      [-0.3, -0.5, -0.2],
      [0.3, -0.5, 0.2],
      [0.3, -0.5, -0.2]
    ];
    positions.forEach(pos => {
      const paw = new THREE.Mesh(pawGeometry, pawMaterial);
      paw.position.set(...pos);
      group.add(paw);
    });

    group.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );

    return group;
  }

  spawnRandomCat() {
    // Pick a random cat variant
    const randomVariant = this.catVariants[Math.floor(Math.random() * this.catVariants.length)];
    const cat = this.createCat(randomVariant);
    this.scene.add(cat);
    this.cats.push(cat);
    
    // Set despawn timeout
    setTimeout(() => {
      this.scene.remove(cat);
      this.cats = this.cats.filter(c => c !== cat);
    }, this.settings.despawnRate * 1000);
  }

  spawnCats() {
    let index = 0;
    const spawnNextCat = () => {
      if (index >= this.catVariants.length) index = 0;
      const cat = this.createCat(this.catVariants[index]);
      this.scene.add(cat);
      this.cats.push(cat);
      
      setTimeout(() => {
        this.scene.remove(cat);
        this.cats = this.cats.filter(c => c !== cat);
      }, this.settings.despawnRate * 1000);

      index++;
      // Use the dynamic spawn rate from settings
      this.catSpawnTimeout = setTimeout(spawnNextCat, 1000 / this.settings.spawnRate);
    };
    spawnNextCat();
  }

  stopSpawningCats() {
    // Clear any existing spawn timeout
    if (this.catSpawnTimeout) {
      clearTimeout(this.catSpawnTimeout);
    }
  }

  stopSimulation() {
    // Set flag to pause simulation
    this.isSimulationRunning = false;
    
    // Stop spawning cats
    this.stopSpawningCats();
  }

  startSimulation() {
    // Set flag to resume simulation
    this.isSimulationRunning = true;
    
    // Restart cat spawning
    this.spawnCats();
  }

  resetSimulation() {
    // Stop current simulation
    this.stopSimulation();
    
    // Remove all existing cats from the scene
    this.cats.forEach(cat => {
      this.scene.remove(cat);
    });
    
    // Clear the cats array
    this.cats = [];
    
    // Reset to default settings
    this.settings = {
      spawnRate: 1,      
      speedRate: 0.01,   
      spinRate: 0.01,    
      despawnRate: 30     
    };

    // Update input values to match default settings
    document.getElementById('spawnRate').value = this.settings.spawnRate;
    document.getElementById('spawnRateValue').textContent = this.settings.spawnRate;
    
    document.getElementById('speedRate').value = this.settings.speedRate;
    document.getElementById('speedRateValue').textContent = this.settings.speedRate;
    
    document.getElementById('spinRate').value = this.settings.spinRate;
    document.getElementById('spinRateValue').textContent = this.settings.spinRate;
    
    document.getElementById('despawnRate').value = this.settings.despawnRate;
    document.getElementById('despawnRateValue').textContent = this.settings.despawnRate;

    // Restart to initial state by setting simulation running and spawning cats
    this.isSimulationRunning = true;
    this.spawnCats();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.isSimulationRunning) {
      this.cats.forEach(cat => {
        // Only apply rotations and animations if simulation is running
        cat.rotation.x += this.settings.spinRate;
        cat.rotation.y += this.settings.spinRate;
        
        if (cat.children[8]) {
          cat.children[8].rotation.z = Math.sin(Date.now() * 0.005) * 0.2;
        }
        if (cat.children[4] && cat.children[5]) {
          const pupilOffset = Math.sin(Date.now() * 0.003) * 0.01;
          cat.children[4].position.x = 0.78 + pupilOffset;
          cat.children[5].position.x = 0.78 + pupilOffset;
        }
      });
    }
    
    this.renderer.render(this.scene, this.camera);
  }
};

// Initialize when document is loaded
window.addEventListener('load', () => {
  // Wait a bit to make sure Three.js is loaded
  setTimeout(() => {
    const simulation = new CatSimulation();
    simulation.init();
  }, 100);
});