// Create a namespace for the cat simulation
const CatSimulation = {
  scene: null,
  camera: null,
  renderer: null,
  cats: [],
  raycaster: null,
  mouse: null,
  selectedCat: null,
  dragPlane: null,
  intersects: [],
  settings: {
    movementSpeed: 0.01,
    spinRate: 0.01,
    spawnRate: 1000,
    catLifetime: 30000
  },
  catVariants: [
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
  ],
  isRunning: true,
  crazyMode: false,
  crazyIntensity: 0,
  fps: 0,
  times: [],

  init() {
    // Only initialize if not already initialized and on mobile/tablet
    if (this.scene || !window.isMobileOrTablet()) return;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("mainContent").appendChild(this.renderer.domElement);

    // Initialize raycaster and mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    // Add touch event listeners
    this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
    this.renderer.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
    this.renderer.domElement.addEventListener('touchend', () => this.onTouchEnd(), false);

    // Initialize FPS counter
    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fpsCounter';
    fpsCounter.textContent = 'FPS: 0';
    document.body.appendChild(fpsCounter);
    
    this.animate();
    this.spawnCats();
  },

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
  },

  updateSettings(settings) {
    Object.assign(this.settings, settings);
  },

  stop() {
    this.isRunning = false;
  },

  reset() {
    this.cats.forEach(cat => this.scene.remove(cat));
    this.cats = [];
    this.isRunning = true;
    this.crazyMode = false;
  },

  spawnCat(breedIndex) {
    if (!this.isRunning) return;
    const cat = this.createCat(this.catVariants[breedIndex]);
    this.scene.add(cat);
    this.cats.push(cat);
    
    setTimeout(() => {
      this.scene.remove(cat);
      this.cats = this.cats.filter(c => c !== cat);
    }, this.settings.catLifetime);
  },

  spawnCats() {
    let index = 0;
    const spawnNextCat = () => {
      if (index >= this.catVariants.length) index = 0;
      this.spawnCat(index);
      index++;
      setTimeout(spawnNextCat, this.settings.spawnRate);
    };
    spawnNextCat();
  },

  toggleCrazyMode() {
    this.crazyMode = !this.crazyMode;
    const crazyMeter = document.getElementById('crazyMeter');
    
    if (this.crazyMode) {
      crazyMeter.classList.add('visible');
      this.crazyIntensity = 0;
      this.updateCrazyIntensity();
    } else {
      crazyMeter.classList.remove('visible');
      this.settings.movementSpeed = this.settings.movementSpeed / (1 + this.crazyIntensity);
      this.settings.spinRate = this.settings.spinRate / (1 + this.crazyIntensity);
      this.crazyIntensity = 0;
    }
  },

  updateCrazyIntensity() {
    if (this.crazyMode) {
      this.crazyIntensity = Math.min(this.crazyIntensity + 0.01, 5);
      const crazyFill = document.getElementById('crazyFill');
      crazyFill.style.width = `${(this.crazyIntensity / 5) * 100}%`;
      
      this.settings.movementSpeed = 0.01 * (1 + this.crazyIntensity);
      this.settings.spinRate = 0.01 * (1 + this.crazyIntensity);
      
      setTimeout(() => this.updateCrazyIntensity(), 100);
    }
  },

  addBreed(name, color, eyeColor) {
    // Convert hex colors to integer values
    const colorInt = parseInt(color.replace('#', ''), 16);
    const eyeColorInt = parseInt(eyeColor.replace('#', ''), 16);
    
    // Create new breed variant
    const newBreed = {
      name: name,
      color: colorInt,
      eyeColor: eyeColorInt
    };
    
    // Add to variants array
    this.catVariants.push(newBreed);
    
    // Update breed selection dropdown
    const breedSelect = document.getElementById('catBreed');
    const option = document.createElement('option');
    option.value = (this.catVariants.length - 1).toString();
    option.textContent = name;
    breedSelect.appendChild(option);
    
    // Select the new breed
    breedSelect.value = (this.catVariants.length - 1).toString();
    
    return this.catVariants.length - 1;
  },

  onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    this.intersects = this.raycaster.intersectObjects(this.cats, true);

    if (this.intersects.length > 0) {
      // Find the parent cat group
      let currentObject = this.intersects[0].object;
      while (currentObject.parent && !this.cats.includes(currentObject)) {
        currentObject = currentObject.parent;
      }
      
      if (this.cats.includes(currentObject)) {
        this.selectedCat = currentObject;
        // Set up the drag plane
        this.dragPlane.setFromNormalAndCoplanarPoint(
          this.camera.getWorldDirection(new THREE.Vector3()),
          this.selectedCat.position
        );
      }
    }
  },

  onTouchMove(event) {
    event.preventDefault();
    if (!this.selectedCat) return;

    const touch = event.touches[0];
    this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const intersect = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, intersect)) {
      // Keep the z position constant to maintain depth
      intersect.z = this.selectedCat.position.z;
      this.selectedCat.position.copy(intersect);
    }
  },

  onTouchEnd() {
    this.selectedCat = null;
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Calculate FPS
    const now = performance.now();
    while (this.times.length > 0 && this.times[0] <= now - 1000) {
      this.times.shift();
    }
    this.times.push(now);
    this.fps = this.times.length;
    
    // Update FPS counter
    document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
    
    if (this.isRunning) {
      this.cats.forEach(cat => {
        if (cat !== this.selectedCat) {
          cat.rotation.x += this.settings.spinRate;
          cat.rotation.y += this.settings.spinRate;
          
          if (this.crazyMode) {
            const intensity = Math.min(1 + this.crazyIntensity, 6);
            cat.position.x += (Math.random() - 0.5) * this.settings.movementSpeed * intensity;
            cat.position.y += (Math.random() - 0.5) * this.settings.movementSpeed * intensity;
            cat.position.z += (Math.random() - 0.5) * this.settings.movementSpeed * intensity;
          }
        }
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
  // Wait a bit to make sure Three.js is loaded and check for mobile/tablet
  if (window.isMobileOrTablet()) {
    setTimeout(() => CatSimulation.init(), 100);
  }
});
