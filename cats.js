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
      despawnRate: 30,   // seconds before cats despawn
      catSize: 1         // default cat size
    };

    // Modify catVariants to be mutable
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

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedCat = null;
    this.offset = new THREE.Vector3();
    this.setupDragControls();

    // Add a new flag for crazy mode
    this.isCrazyModeActive = false;
    this.crazyModeCats = new Map(); // To track crazy mode cats
    
    this.isGameModeActive = false;
    this.gameScore = 0;

    // Add max cats setting
    this.maxCats = 50;  // Default max cats
    
    // Add gravity settings
    this.gravityEnabled = false;
    this.gravityStrength = 0.01;
    
    // Physics interaction properties
    this.objects = [];

    this.isTornadoModeActive = false;
    this.tornadoCenter = new THREE.Vector3(0, 0, 0);
    this.tornadoRadius = 3;
    this.tornadoHeight = 5;
    this.tornadoSpeed = 0.05;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
  }

  setupDragControls() {
    // Only setup if renderer exists
    if (!this.renderer) return;

    const domElement = this.renderer.domElement;

    // Mouse move event for dragging
    domElement.addEventListener('mousemove', (event) => {
      // Calculate mouse position in normalized device coordinates
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (this.selectedCat) {
        // Update the raycaster with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Create a plane at the cat's current position
        const intersectionPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          this.camera.getWorldDirection(new THREE.Vector3()),
          this.selectedCat.position
        );
        
        // Create a Vector3 to store the intersection point
        const intersectionPoint = new THREE.Vector3();
        
        // Use intersectPlane method correctly
        if (this.raycaster.ray.intersectPlane(intersectionPlane, intersectionPoint)) {
          // Move the selected cat to the intersection point offset
          const point = intersectionPoint.sub(this.offset);
          this.selectedCat.position.copy(point);
        }
      }
    });

    // Mouse down event to select a cat
    domElement.addEventListener('mousedown', (event) => {
      // Calculate mouse position in normalized device coordinates
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check for intersections with cats
      const intersects = this.raycaster.intersectObjects(this.cats, true);

      if (intersects.length > 0) {
        // Find the topmost parent (the cat group)
        this.selectedCat = intersects[0].object.parent;

        // Create a drag plane parallel to the camera
        this.dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          this.camera.getWorldDirection(new THREE.Vector3()),
          this.selectedCat.position
        );

        // Create a Vector3 to store the intersection point
        const intersectionPoint = new THREE.Vector3();
        
        // Calculate the offset between the mouse and the cat's position
        if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint)) {
          this.offset.copy(intersectionPoint.sub(this.selectedCat.position));
        }
      }
    });

    // Mouse up event to release the cat
    domElement.addEventListener('mouseup', () => {
      this.selectedCat = null;
    });

    // Touch events for mobile support
    domElement.addEventListener('touchstart', (event) => {
      // Prevent default touch behavior
      event.preventDefault();

      // Use the first touch point
      const touch = event.touches[0];
      
      // Calculate touch position in normalized device coordinates
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and touch position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check for intersections with cats
      const intersects = this.raycaster.intersectObjects(this.cats, true);

      if (intersects.length > 0) {
        // Find the topmost parent (the cat group)
        this.selectedCat = intersects[0].object.parent;

        // Create a drag plane parallel to the camera
        this.dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          this.camera.getWorldDirection(new THREE.Vector3()),
          this.selectedCat.position
        );

        // Create a Vector3 to store the intersection point
        const intersectionPoint = new THREE.Vector3();
        
        // Calculate the offset between the touch and the cat's position
        if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint)) {
          this.offset.copy(intersectionPoint.sub(this.selectedCat.position));
        }
      }
    }, { passive: false });

    domElement.addEventListener('touchmove', (event) => {
      // Prevent default touch behavior (scrolling)
      event.preventDefault();

      // Use the first touch point
      const touch = event.touches[0];
      
      // Calculate touch position in normalized device coordinates
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      if (this.selectedCat) {
        // Update the raycaster with the camera and touch position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Create a plane at the cat's current position
        const intersectionPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          this.camera.getWorldDirection(new THREE.Vector3()),
          this.selectedCat.position
        );
        
        // Create a Vector3 to store the intersection point
        const intersectionPoint = new THREE.Vector3();
        
        // Use intersectPlane method correctly
        if (this.raycaster.ray.intersectPlane(intersectionPlane, intersectionPoint)) {
          // Move the selected cat to the intersection point offset
          const point = intersectionPoint.sub(this.offset);
          this.selectedCat.position.copy(point);
        }
      }
    }, { passive: false });

    domElement.addEventListener('touchend', () => {
      this.selectedCat = null;
    });
  }

  generateRandomName() {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const nameLength = Math.floor(Math.random() * 4) + 3; // 3-6 letters
    let name = '';
    
    for (let i = 0; i < nameLength; i++) {
      if (i % 2 === 0) {
        name += consonants[Math.floor(Math.random() * consonants.length)];
      } else {
        name += vowels[Math.floor(Math.random() * vowels.length)];
      }
    }
    
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  setupHoverInfo() {
    if (!this.renderer) return;

    const infoDisplay = document.createElement('div');
    infoDisplay.id = 'catHoverInfo';
    infoDisplay.style.position = 'absolute';
    infoDisplay.style.top = '10px';
    infoDisplay.style.left = '50%';
    infoDisplay.style.transform = 'translateX(-50%)';
    infoDisplay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    infoDisplay.style.color = 'white';
    infoDisplay.style.padding = '10px';
    infoDisplay.style.borderRadius = '5px';
    infoDisplay.style.display = 'none';
    infoDisplay.style.zIndex = '1000';
    document.body.appendChild(infoDisplay);

    const domElement = this.renderer.domElement;

    domElement.addEventListener('mousemove', (event) => {
      // Calculate mouse position in normalized device coordinates
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check for intersections with cats
      const intersects = this.raycaster.intersectObjects(this.cats, true);

      if (intersects.length > 0) {
        // Find the topmost parent (the cat group)
        const cat = intersects[0].object.parent;
        
        // Get the breed of the cat (assuming it was saved during creation)
        const breed = cat.userData?.breed || 'Unknown';
        const name = cat.userData?.name || this.generateRandomName();

        // Update and show the info display
        infoDisplay.textContent = `Breed: ${breed} | Name: ${name}`;
        infoDisplay.style.display = 'block';
      } else {
        // Hide the info display
        infoDisplay.style.display = 'none';
      }
    });
  }

  createCat(variant, size = 1) {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({color: variant.color});
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1 * size, 0.8 * size, 1.2 * size);
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({color: variant.color});
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0.5 * size, 0.3 * size, 0);
    head.scale.set(1 * size, 0.9 * size, 0.9 * size);
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({color: variant.eyeColor});
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.75 * size, 0.35 * size, 0.12 * size);
    group.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.75 * size, 0.35 * size, -0.12 * size);
    group.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.02, 32, 32);
    const pupilMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0.78 * size, 0.35 * size, 0.12 * size);
    group.add(leftPupil);

    const rightPupil = leftPupil.clone();
    rightPupil.position.set(0.78 * size, 0.35 * size, -0.12 * size);
    group.add(rightPupil);

    // Ears
    const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(0.6 * size, 0.5 * size, 0.15 * size);
    leftEar.rotation.z = -Math.PI / 4;
    leftEar.scale.set(size, size, size);
    group.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.set(0.6 * size, 0.5 * size, -0.15 * size);
    rightEar.rotation.z = -Math.PI / 4;
    group.add(rightEar);

    // Tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5 * size, 0, 0),
      new THREE.Vector3(-0.7 * size, 0.2 * size, 0),
      new THREE.Vector3(-0.9 * size, 0.3 * size, 0),
      new THREE.Vector3(-0.8 * size, 0.4 * size, 0)
    ]);
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 20, 0.04 * size, 8, false);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    group.add(tail);

    // Paws
    const pawGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const pawMaterial = new THREE.MeshPhongMaterial({color: variant.color});
    const positions = [
      [-0.3 * size, -0.5 * size, 0.2 * size],
      [-0.3 * size, -0.5 * size, -0.2 * size],
      [0.3 * size, -0.5 * size, 0.2 * size],
      [0.3 * size, -0.5 * size, -0.2 * size]
    ];
    positions.forEach(pos => {
      const paw = new THREE.Mesh(pawGeometry, pawMaterial);
      paw.position.set(...pos);
      paw.scale.set(size, size, size);
      group.add(paw);
    });

    group.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );

    // Add breed and name to userData
    group.userData = {
      breed: variant.name,
      name: this.generateRandomName()
    };

    return group;
  }

  spawnRandomCat() {
    if (this.cats.length < this.maxCats) {
      const size = this.settings.catSize || 1;
      const randomVariant = this.catVariants[Math.floor(Math.random() * this.catVariants.length)];
      const cat = this.createCat(randomVariant, size);
      this.scene.add(cat);
      this.cats.push(cat);
      
      // If crazy mode is active, make the new cat crazy
      if (this.isCrazyModeActive) {
        this.makeCatCrazy(cat);
      }
      
      // Set despawn timeout
      setTimeout(() => {
        this.scene.remove(cat);
        this.cats = this.cats.filter(c => c !== cat);
        // Remove from crazy mode cats if applicable
        if (this.crazyModeCats.has(cat)) {
          this.crazyModeCats.delete(cat);
        }
      }, this.settings.despawnRate * 1000);
    }
  }

  spawnCats() {
    let index = 0;
    const spawnNextCat = () => {
      if (this.cats.length < this.maxCats) {
        if (index >= this.catVariants.length) index = 0;
        const cat = this.createCat(this.catVariants[index], this.settings.catSize || 1);
        this.scene.add(cat);
        this.cats.push(cat);
        
        // If crazy mode is active, make the new cat crazy
        if (this.isCrazyModeActive) {
          this.makeCatCrazy(cat);
        }
        
        setTimeout(() => {
          this.scene.remove(cat);
          this.cats = this.cats.filter(c => c !== cat);
          // Remove from crazy mode cats if applicable
          if (this.crazyModeCats.has(cat)) {
            this.crazyModeCats.delete(cat);
          }
        }, this.settings.despawnRate * 1000);

        index++;
        // Use the dynamic spawn rate from settings
        this.catSpawnTimeout = setTimeout(spawnNextCat, 1000 / this.settings.spawnRate);
      }
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
      despawnRate: 30,   
      catSize: 1        
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

    document.getElementById('catSize').value = this.settings.catSize;
    document.getElementById('catSizeValue').textContent = this.settings.catSize;

    // Restart to initial state by setting simulation running and spawning cats
    this.isSimulationRunning = true;
    this.spawnCats();
  }

  setupCustomBreedModal() {
    const customBreedButton = document.getElementById('customBreedButton');
    const customBreedModal = document.getElementById('customBreedModal');
    
    // Add null checks
    if (!customBreedButton || !customBreedModal) {
      console.warn('Custom breed modal elements not found');
      return;
    }

    const closeModalBtn = customBreedModal.querySelector('.close-modal');
    const saveCustomBreedButton = document.getElementById('saveCustomBreedButton');

    if (!closeModalBtn || !saveCustomBreedButton) {
      console.warn('Some custom breed modal elements are missing');
      return;
    }

    // Open modal
    customBreedButton.addEventListener('click', () => {
      customBreedModal.style.display = 'block';
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
      customBreedModal.style.display = 'none';
    });

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
      if (event.target === customBreedModal) {
        customBreedModal.style.display = 'none';
      }
    });

    // Save custom breed
    saveCustomBreedButton.addEventListener('click', () => {
      const breedNameInput = document.getElementById('customBreedName');
      const breedColorInput = document.getElementById('customBreedColor');
      const eyeColorInput = document.getElementById('customEyeColor');

      // Add null checks
      if (!breedNameInput || !breedColorInput || !eyeColorInput) {
        console.warn('Breed input elements not found');
        return;
      }

      const breedName = breedNameInput.value.trim();
      
      // Validate breed name
      if (!breedName) {
        alert('Please enter a breed name');
        return;
      }

      // Convert color from hex to decimal
      const breedColor = parseInt(breedColorInput.value.replace('#', ''), 16);
      const eyeColor = parseInt(eyeColorInput.value.replace('#', ''), 16);

      // Create new breed variant
      const newBreed = {
        name: breedName,
        color: breedColor,
        eyeColor: eyeColor
      };

      // Add to cat variants
      this.catVariants.push(newBreed);

      // Update breed select dropdown
      const breedSelect = document.getElementById('catBreedSelect');
      if (breedSelect) {
        const newOption = document.createElement('option');
        newOption.value = breedName;
        newOption.textContent = breedName;
        breedSelect.appendChild(newOption);
      }

      // Close modal and reset inputs
      customBreedModal.style.display = 'none';
      breedNameInput.value = '';
      breedColorInput.value = '#A0522D';
      eyeColorInput.value = '#00FF00';

      // Optional: Notify user
      alert(`New cat breed "${breedName}" has been added!`);
    });
  }

  init() {
    // Only initialize if not already initialized
    if (this.scene) return;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.getInitialFieldOfView(), window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("mainContent").appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    // Setup drag controls AFTER renderer is initialized
    this.setupDragControls();

    // Setup hover info AFTER renderer is initialized
    this.setupHoverInfo();

    // Add custom breed modal setup
    this.setupCustomBreedModal();

    this.setupGameMode();

    this.initPhysicsInteraction();

    this.animate();
    this.spawnCats();

    // Setup settings event listeners
    this.setupSettingsListeners();

    // Add tornado mode toggle setup
    this.addTornadoModeToggle();
  }

  setupSettingsListeners() {
    const spawnRateInput = document.getElementById('spawnRate');
    const speedRateInput = document.getElementById('speedRate');
    const spinRateInput = document.getElementById('spinRate');
    const despawnRateInput = document.getElementById('despawnRate');
    const catSizeInput = document.getElementById('catSize');
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

    // Cat size listener
    catSizeInput.addEventListener('input', (e) => {
      const size = parseFloat(e.target.value);
      document.getElementById('catSizeValue').textContent = size.toFixed(1);
      this.settings.catSize = size;
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

    const breedSelect = document.getElementById('catBreedSelect');
    const catQuantityInput = document.getElementById('catQuantity');
    const catQuantityValue = document.getElementById('catQuantityValue');
    const spawnCatButton = document.getElementById('spawnCatButton');

    // Update cat quantity display
    catQuantityInput.addEventListener('input', (e) => {
      catQuantityValue.textContent = e.target.value;
    });

    // Add breed selection listener
    spawnCatButton.addEventListener('click', () => {
      // Only spawn if simulation is running
      if (this.isSimulationRunning) {
        const selectedBreed = breedSelect.value;
        const catQuantity = parseInt(catQuantityInput.value, 10);
        
        // Ensure quantity is within reasonable bounds
        const quantity = Math.min(Math.max(1, catQuantity), 20);
        
        for (let i = 0; i < quantity; i++) {
          if (selectedBreed === 'random') {
            // Spawn a random cat breed
            this.spawnRandomCat();
          } else {
            // Find the variant corresponding to the selected breed
            const selectedVariant = this.catVariants.find(variant => variant.name === selectedBreed);
            
            if (selectedVariant) {
              // Create a cat with the specific breed
              const cat = this.createCat(selectedVariant, this.settings.catSize || 1);
              this.scene.add(cat);
              this.cats.push(cat);
              
              // If crazy mode is active, make the new cat crazy
              if (this.isCrazyModeActive) {
                this.makeCatCrazy(cat);
              }
              
              setTimeout(() => {
                this.scene.remove(cat);
                this.cats = this.cats.filter(c => c !== cat);
                // Remove from crazy mode cats if applicable
                if (this.crazyModeCats.has(cat)) {
                  this.crazyModeCats.delete(cat);
                }
              }, this.settings.despawnRate * 1000);
            }
          }
        }
      }
    });

    // Add Crazy Mode button
    const crazyModeButton = document.getElementById('crazyModeButton');
    crazyModeButton.addEventListener('click', () => {
      this.toggleCrazyMode();
      crazyModeButton.textContent = this.isCrazyModeActive ? 'Calm Down' : 'Crazy Mode';
      crazyModeButton.classList.toggle('active');
    });

    // Background color listener
    const backgroundColorInput = document.getElementById('backgroundColor');
    backgroundColorInput.addEventListener('input', (e) => {
      document.body.style.backgroundColor = e.target.value;
      
      // If scene exists, update scene background color
      if (this.scene) {
        this.scene.background = new THREE.Color(e.target.value);
      }
    });

    // Max cats input listener
    const maxCatsInput = document.getElementById('maxCatsInput');
    const maxCatsValue = document.getElementById('maxCatsValue');

    maxCatsInput.addEventListener('input', (e) => {
      const maxCats = parseInt(e.target.value, 10);
      this.maxCats = maxCats;
      maxCatsValue.textContent = maxCats;

      // Optional: Immediately remove excess cats if over new limit
      while (this.cats.length > this.maxCats) {
        const catToRemove = this.cats.pop();
        this.scene.remove(catToRemove);
      }
    });

    // Field of View listener
    const fieldOfViewInput = document.getElementById('fieldOfViewInput');
    const fieldOfViewValue = document.getElementById('fieldOfViewValue');

    fieldOfViewInput.addEventListener('input', (e) => {
      const fov = parseFloat(e.target.value);
      fieldOfViewValue.textContent = fov;
      
      // Update camera field of view
      if (this.camera) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
        
        // Save to local storage
        localStorage.setItem('fieldOfView', fov);
      }
    });

    // Set initial value from saved or default
    fieldOfViewInput.value = this.getInitialFieldOfView();
    fieldOfViewValue.textContent = this.getInitialFieldOfView();

    // Gravity toggle setup
    const gravityToggle = document.getElementById('gravityToggle');
    const gravityStrengthInput = document.getElementById('gravityStrength');
    const gravityStrengthValue = document.getElementById('gravityStrengthValue');

    gravityToggle.addEventListener('change', (event) => {
      this.gravityEnabled = event.target.checked;
      gravityStrengthInput.disabled = !this.gravityEnabled;
    });

    gravityStrengthInput.addEventListener('input', (e) => {
      const strength = parseFloat(e.target.value);
      this.gravityStrength = strength;
      gravityStrengthValue.textContent = strength.toFixed(3);
    });
  }

  getInitialFieldOfView() {
    const savedFOV = localStorage.getItem('fieldOfView');
    return savedFOV ? parseFloat(savedFOV) : 75;
  }

  setupGameMode() {
    const gameModeToggle = document.getElementById('gameModeToggle');
    const gameScoreDisplay = document.getElementById('gameScoreDisplay');
    const settingsInputs = document.querySelectorAll('#settingsTab input, #settingsTab select, #settingsTab button');
    const startStopButton = document.getElementById('startStopButton');
    const resetButton = document.getElementById('resetButton');
    const spawnCatButton = document.getElementById('spawnCatButton');
    const crazyModeButton = document.getElementById('crazyModeButton');

    let gameModeCatMovementInterval = null;

    // Remove existing event listeners to prevent multiple bindings
    const boundHandleCatPop = this.handleCatPop.bind(this);

    gameModeToggle.addEventListener('change', (event) => {
      this.isGameModeActive = event.target.checked;
      
      // Clear all existing cats first
      this.cats.forEach(cat => {
        this.scene.remove(cat);
      });
      this.cats = [];

      if (this.isGameModeActive) {
        // Disable all settings inputs
        settingsInputs.forEach(input => {
          if (input !== gameModeToggle) {
            input.disabled = true;
            input.classList.add('disabled');
          }
        });

        // Disable buttons
        startStopButton.disabled = true;
        resetButton.disabled = true;
        spawnCatButton.disabled = true;
        crazyModeButton.disabled = true;

        this.gameScore = 0;
        document.getElementById('gameScore').textContent = this.gameScore;
        
        // Spawn a new cat for game mode
        const randomVariant = this.catVariants[Math.floor(Math.random() * this.catVariants.length)];
        const gameCat = this.createCat(randomVariant, this.settings.catSize || 1);
        this.scene.add(gameCat);
        this.cats.push(gameCat);

        // Set up interval to move cat randomly every 5 seconds
        gameModeCatMovementInterval = setInterval(() => {
          if (this.isGameModeActive && this.cats.length > 0) {
            const cat = this.cats[0];
            // Random position within bounds
            cat.position.set(
              (Math.random() - 0.5) * 8,  // Wider x range
              (Math.random() - 0.5) * 8,  // Wider y range
              (Math.random() - 0.5) * 8   // Wider z range
            );
          }
        }, 5000);
        
        // Add click/tap event listener to pop cats
        this.renderer.domElement.addEventListener('click', boundHandleCatPop);
        this.renderer.domElement.addEventListener('touchstart', boundHandleCatPop, { passive: false });
      } else {
        // Clear the movement interval
        if (gameModeCatMovementInterval) {
          clearInterval(gameModeCatMovementInterval);
        }

        // Re-enable all settings inputs
        settingsInputs.forEach(input => {
          input.disabled = false;
          input.classList.remove('disabled');
        });

        // Re-enable buttons
        startStopButton.disabled = false;
        resetButton.disabled = false;
        spawnCatButton.disabled = false;
        crazyModeButton.disabled = false;

        // Clear any remaining cats
        this.cats.forEach(cat => {
          this.scene.remove(cat);
        });
        this.cats = [];

        // Remove event listeners when game mode is off
        this.renderer.domElement.removeEventListener('click', boundHandleCatPop);
        this.renderer.domElement.removeEventListener('touchstart', boundHandleCatPop);

        // Restart normal cat spawning
        this.spawnCats();
      }
    });
  }

  handleCatPop(event) {
    // Prevent default touch behavior for mobile
    if (event.type === 'touchstart') {
      event.preventDefault();
    }

    // Calculate mouse/touch position
    const mouse = new THREE.Vector2();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
  
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    this.raycaster.setFromCamera(mouse, this.camera);

    // Check for intersections with cats
    const intersects = this.raycaster.intersectObjects(this.cats, true);

    if (intersects.length > 0) {
      // Find the topmost parent (the cat group)
      const cat = intersects[0].object.parent;
        
      if (this.isGameModeActive) {
        // Animate pop and remove cat only in game mode
        this.popCat(cat);
        
        // Increment score
        this.gameScore++;
        document.getElementById('gameScore').textContent = this.gameScore;
      }
    }
  }

  popCat(cat) {
    // Add pop animation
    cat.children.forEach(child => {
      child.material.transparent = true;
      child.material.opacity = 1;
    });

    // Remove cat from scene and cats array only in game mode
    if (this.isGameModeActive) {
      this.scene.remove(cat);
      this.cats = this.cats.filter(c => c !== cat);
    
      // Remove from crazy mode cats if applicable
      if (this.crazyModeCats.has(cat)) {
        this.crazyModeCats.delete(cat);
      }
    }
  }

  createCatTrail(cat) {
    // Create a trail renderer for the cat
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = [];
    const trailColors = [];

    // Create initial positions and colors
    for (let i = 0; i < 20; i++) {
      trailPositions.push(cat.position.x, cat.position.y, cat.position.z);
      
      // Use the cat's base color with decreasing opacity
      const baseColor = cat.children[0].material.color;
      trailColors.push(baseColor.r, baseColor.g, baseColor.b, 1 - (i * 0.05));
    }

    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 4));

    const trailMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });

    const trail = new THREE.Points(trailGeometry, trailMaterial);
    this.scene.add(trail);

    return {
      trail,
      update: (newPosition) => {
        const positions = trail.geometry.attributes.position.array;
        const colors = trail.geometry.attributes.color.array;

        // Shift positions back
        for (let i = positions.length - 1; i >= 3; i--) {
          positions[i] = positions[i - 3];
        }

        // Set new position at the start
        positions[0] = newPosition.x;
        positions[1] = newPosition.y;
        positions[2] = newPosition.z;

        trail.geometry.attributes.position.needsUpdate = true;
      }
    };
  }

  toggleCrazyMode() {
    this.isCrazyModeActive = !this.isCrazyModeActive;

    if (this.isCrazyModeActive) {
      // Activate crazy mode for existing cats
      this.cats.forEach(cat => {
        this.makeCatCrazy(cat);
        
        // Create trail for each crazy cat
        cat.userData.trail = this.createCatTrail(cat);
      });
    } else {
      // Restore normal behavior
      this.crazyModeCats.forEach((crazyData, cat) => {
        // Reset velocity and remove crazy mode properties
        cat.userData.velocity = null;
        cat.userData.isCrazy = false;
        
        // Remove trail if exists
        if (cat.userData.trail) {
          this.scene.remove(cat.userData.trail.trail);
          cat.userData.trail = null;
        }
      });
      this.crazyModeCats.clear();
    }
  }

  updateCrazyModeCats() {
    if (!this.isCrazyModeActive) return;

    const bounds = 5;

    this.crazyModeCats.forEach((crazyData, cat) => {
      if (!cat.userData.velocity) return;

      cat.position.add(cat.userData.velocity);

      // Update trail if it exists
      if (cat.userData.trail) {
        cat.userData.trail.update(cat.position);
      }

      if (Math.abs(cat.position.x) > bounds) {
        cat.userData.velocity.x *= -1;
      }
      if (Math.abs(cat.position.y) > bounds) {
        cat.userData.velocity.y *= -1;
      }
      if (Math.abs(cat.position.z) > bounds) {
        cat.userData.velocity.z *= -1;
      }

      cat.rotation.x += Math.random() * 0.1 - 0.05;
      cat.rotation.y += Math.random() * 0.1 - 0.05;
      cat.rotation.z += Math.random() * 0.1 - 0.05;
    });

    if (this.camera) {
      const jitterIntensity = 0.05;
      this.camera.position.x += (Math.random() - 0.5) * jitterIntensity;
      this.camera.position.y += (Math.random() - 0.5) * jitterIntensity;
      this.camera.position.z += (Math.random() - 0.5) * jitterIntensity;
      
      this.camera.rotation.x += (Math.random() - 0.5) * 0.01;
      this.camera.rotation.y += (Math.random() - 0.5) * 0.01;
      this.camera.rotation.z += (Math.random() - 0.5) * 0.01;
    }
  }

  makeCatCrazy(cat) {
    if (!cat.userData) cat.userData = {};
    
    // Set crazy mode properties
    cat.userData.isCrazy = true;
    cat.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,  // Random x velocity
      (Math.random() - 0.5) * 0.5,  // Random y velocity
      (Math.random() - 0.5) * 0.5   // Random z velocity
    );

    // Store in crazy mode cats map
    this.crazyModeCats.set(cat, {
      originalPosition: cat.position.clone()
    });

    // Create trail for the cat
    cat.userData.trail = this.createCatTrail(cat);
  }

  initPhysicsInteraction() {
    this.objects = []; // Array to store interactive objects
    
    const knockoverButton = document.getElementById('knockoverObjectsButton');
    const knockoverModal = document.getElementById('knockoverModal');
    
    if (!knockoverButton || !knockoverModal) {
      console.warn('Physics interaction elements not found');
      return;
    }

    const closeModalBtn = knockoverModal.querySelector('.close-modal');
    const spawnObjectButton = document.getElementById('spawnObjectButton');
    const objectTypeSelect = document.getElementById('objectTypeSelect');
    const objectColorInput = document.getElementById('objectColorInput');
    const objectSizeInput = document.getElementById('objectSizeInput');
    const objectSizeValue = document.getElementById('objectSizeValue');

    if (!closeModalBtn || !spawnObjectButton || !objectTypeSelect || 
        !objectColorInput || !objectSizeInput || !objectSizeValue) {
      console.warn('Some physics interaction elements are missing');
      return;
    }

    objectSizeInput.addEventListener('input', (e) => {
      objectSizeValue.textContent = e.target.value;
    });

    knockoverButton.addEventListener('click', () => {
      knockoverModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
      knockoverModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === knockoverModal) {
        knockoverModal.style.display = 'none';
      }
    });

    spawnObjectButton.addEventListener('click', () => {
      const objectType = objectTypeSelect.value;
      const objectColor = parseInt(objectColorInput.value.replace('#', ''), 16);
      const objectSize = parseFloat(objectSizeInput.value);

      const object = this.createInteractiveObject(objectType, objectColor, objectSize);
      
      if (this.scene) {
        this.scene.add(object);
        this.objects.push(object);
      } else {
        console.warn('Cannot add object: scene not initialized');
      }
    });
  }

  createInteractiveObject(type, color, size = 1) {
    let geometry;
    switch(type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(size, size, size);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(size/2, size/2, size, 32);
        break;
      case 'pyramid':
        geometry = new THREE.ConeGeometry(size/2, size, 4);
        break;
      default:
        geometry = new THREE.BoxGeometry(size, size, size);
    }

    const material = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );

    mesh.userData = {
      isInteractive: true,
      velocity: new THREE.Vector3(0, 0, 0),
      mass: size
    };

    return mesh;
  }

  simulateObjectInteractions() {
    if (!this.isSimulationRunning) return;

    this.cats.forEach(cat => {
      this.objects.forEach(object => {
        const distance = cat.position.distanceTo(object.position);
        
        if (distance < 1) {
          const pushForce = new THREE.Vector3()
            .subVectors(object.position, cat.position)
            .normalize()
            .multiplyScalar(0.1 / object.userData.mass);
          
          object.userData.velocity.add(pushForce);
        }
      });
    });

    this.objects.forEach(object => {
      object.position.add(object.userData.velocity);

      object.userData.velocity.multiplyScalar(0.99);

      object.rotation.x += object.userData.velocity.x * 0.1;
      object.rotation.y += object.userData.velocity.y * 0.1;
      object.rotation.z += object.userData.velocity.z * 0.1;

      const bounds = 5;
      if (Math.abs(object.position.x) > bounds) object.userData.velocity.x *= -0.8;
      if (Math.abs(object.position.y) > bounds) object.userData.velocity.y *= -0.8;
      if (Math.abs(object.position.z) > bounds) object.userData.velocity.z *= -0.8;
    });
  }

  addTornadoModeToggle() {
    const tornadoModeToggle = document.getElementById('tornadoModeToggle');
    
    if (!tornadoModeToggle) {
      console.warn('Tornado mode toggle not found');
      return;
    }

    this.isTornadoModeActive = false;
    this.tornadoCenter = new THREE.Vector3(0, 0, 0);
    this.tornadoRadius = 3;
    this.tornadoHeight = 5;
    this.tornadoSpeed = 0.05;

    tornadoModeToggle.addEventListener('change', (event) => {
      this.isTornadoModeActive = event.target.checked;

      if (this.isTornadoModeActive) {
        // Disable other conflicting modes
        if (this.isCrazyModeActive) {
          const crazyModeButton = document.getElementById('crazyModeButton');
          crazyModeButton.click(); // Toggle off crazy mode
        }
      }
    });
  }

  updateTornadoModeCats() {
    if (!this.isTornadoModeActive) return;

    this.cats.forEach((cat, index) => {
      // Calculate tornado trajectory
      const angle = index * (Math.PI * 2 / this.cats.length) + Date.now() * this.tornadoSpeed * 0.01;
      const heightFactor = (cat.position.y + this.tornadoHeight / 2) / this.tornadoHeight;
      
      // Spiral movement
      cat.position.x = this.tornadoCenter.x + 
        Math.cos(angle) * this.tornadoRadius * (1 - heightFactor);
      cat.position.z = this.tornadoCenter.z + 
        Math.sin(angle) * this.tornadoRadius * (1 - heightFactor);
      
      // Vertical movement
      cat.position.y += this.tornadoSpeed * 0.1;
      
      // Reset position if cat goes too high
      if (cat.position.y > this.tornadoHeight) {
        cat.position.y = -this.tornadoHeight / 2;
      }

      // Spinning rotation
      cat.rotation.x += Math.sin(angle) * 0.1;
      cat.rotation.y += Math.cos(angle) * 0.1;
      cat.rotation.z += this.tornadoSpeed * 0.5;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.isSimulationRunning) {
      this.updateCrazyModeCats();
      this.updateTornadoModeCats();

      this.cats.forEach(cat => {
        if (this.gravityEnabled && !cat.userData?.isCrazy) {
          cat.position.y -= this.gravityStrength;
          
          if (cat.position.y < -5) {
            cat.position.y = -5;
            cat.rotation.x *= -0.5;
            cat.rotation.z *= -0.5;
          }
        }

        if (!cat.userData?.isCrazy) {
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
        }
      });
    }
    
    this.simulateObjectInteractions();
    
    this.renderer.render(this.scene, this.camera);
  }
};

// Initialize when document is loaded
window.addEventListener('load', () => {
  setTimeout(() => {
    const simulation = new CatSimulation();
    simulation.init();
  }, 100);
});
