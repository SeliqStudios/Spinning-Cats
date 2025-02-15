const catVariants = [
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

export function createCat(variant) {
  const group = new THREE.Group();
  group.userData = { 
    variant: variant,
    points: 1,  
    isPoppable: true
  };

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

  // Eyes and Pupils
  const eyeGeometry = new THREE.SphereGeometry(0.05, 32, 32);
  const eyeMaterial = new THREE.MeshPhongMaterial({color: variant.eyeColor});
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(0.75, 0.35, 0.12);
  group.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.set(0.75, 0.35, -0.12);
  group.add(rightEye);

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

export function createCats(scene, raycaster, camera) {
  const cats = [];
  let index = 0;
  const MAX_CATS = 10;

  function spawnNextCat() {
    // Remove oldest cat if max limit is reached
    if (cats.length >= MAX_CATS) {
      const oldestCat = cats.shift();
      scene.remove(oldestCat);
    }

    if (index >= catVariants.length) index = 0;
    const cat = createCat(catVariants[index]);
    scene.add(cat);
    cats.push(cat);

    setTimeout(() => {
      if (scene.children.includes(cat)) {
        scene.remove(cat);
        const catIndex = cats.indexOf(cat);
        if (catIndex !== -1) {
          cats.splice(catIndex, 1);
        }
      }
    }, 30000);

    index++;
    setTimeout(spawnNextCat, 1000);
  }

  spawnNextCat();
  return cats;
}

export function setupCatInteraction(scene, camera, renderer, updateScore) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    intersects.forEach(intersect => {
      let cat = intersect.object;
      
      // Traverse up to find the group (cat)
      while (cat && !cat.userData?.variant) {
        cat = cat.parent;
      }

      if (cat && cat.userData?.isPoppable) {
        // Prevent multiple clicks
        cat.userData.isPoppable = false;

        // Update score
        if (updateScore) {
          updateScore(cat.userData.points);
        }

        // Pop animation
        cat.scale.set(1.2, 1.2, 1.2);
        cat.children.forEach(child => {
          child.material.opacity = 0;
          child.material.transparent = true;
        });

        // Remove from scene after animation
        setTimeout(() => {
          scene.remove(cat);
        }, 300);
      }
    });
  }

  renderer.domElement.addEventListener('click', onMouseClick, false);
}
