function isMobileOrTablet() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

// Loading screen logic
window.addEventListener("load", () => {
  const deviceMessage = document.getElementById("device-message");
  const startupText = document.getElementById("startupText");
  const mainContent = document.getElementById("mainContent");

  if (!isMobileOrTablet()) {
    deviceMessage.textContent = "This experience is only available on mobile devices and tablets. Please visit on a mobile device or tablet to view.";
    return;
  }

  // Fade-in text effect
  setTimeout(() => {
    startupText.classList.add("fade-in");
  }, 1000);

  // Wait for fade-in and then switch to main content
  setTimeout(() => {
    startupText.style.display = "none";
    mainContent.style.display = "block";
  }, 4000);
});

window.addEventListener('resize', () => {
  if (isMobileOrTablet() && CatSimulation.camera && CatSimulation.renderer) {
    CatSimulation.camera.aspect = window.innerWidth / window.innerHeight;
    CatSimulation.camera.updateProjectionMatrix();
    CatSimulation.renderer.setSize(window.innerWidth, window.innerHeight);
  }
});

function initControls() {
  const controlIds = [
    'spawnRate', 'movementSpeed', 'spinRate', 'despawnTime', 'catBreed', 
    'spawnCount', 'catSize', 'stopBtn', 'resetBtn', 'spawnBtn', 
    'crazyBtn', 'settingsButton', 'closeSettings', 'controls'
  ];

  const controls = {};
  const missingControls = [];

  // Dynamically populate controls object and track missing elements
  controlIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      controls[id] = element;
    } else {
      missingControls.push(id);
    }
  });

  // Log missing controls for debugging
  if (missingControls.length > 0) {
    console.error('Missing DOM elements:', missingControls);
    return; // Exit the function if critical elements are missing
  }

  const valueDisplays = {
    spawnRate: document.getElementById('spawnRateValue'),
    movementSpeed: document.getElementById('movementSpeedValue'),
    spinRate: document.getElementById('spinRateValue'),
    despawnTime: document.getElementById('despawnTimeValue'),
    spawnCount: document.getElementById('spawnCountValue'),
    catSize: document.getElementById('catSizeValue')  
  };

  // Add breed creator functionality
  const breedCreator = {
    dialog: document.getElementById('breedCreator'),
    createBtn: document.getElementById('createBreedBtn'),
    saveBtn: document.getElementById('saveBreed'),
    cancelBtn: document.getElementById('cancelBreed'),
    nameInput: document.getElementById('breedName'),
    colorInput: document.getElementById('breedColor'),
    eyeColorInput: document.getElementById('breedEyeColor')
  };

  breedCreator.createBtn.addEventListener('click', () => {
    breedCreator.dialog.classList.add('visible');
  });

  breedCreator.cancelBtn.addEventListener('click', () => {
    breedCreator.dialog.classList.remove('visible');
    // Reset inputs
    breedCreator.nameInput.value = '';
    breedCreator.colorInput.value = '#A0522D';
    breedCreator.eyeColorInput.value = '#00FF00';
  });

  breedCreator.saveBtn.addEventListener('click', () => {
    const name = breedCreator.nameInput.value.trim();
    if (name) {
      CatSimulation.addBreed(
        name,
        breedCreator.colorInput.value,
        breedCreator.eyeColorInput.value
      );
      breedCreator.dialog.classList.remove('visible');
      // Reset inputs
      breedCreator.nameInput.value = '';
      breedCreator.colorInput.value = '#A0522D';
      breedCreator.eyeColorInput.value = '#00FF00';
    } else {
      alert('Please enter a breed name');
    }
  });

  // Update simulation settings based on control values
  function updateSettings() {
    CatSimulation.updateSettings({
      spawnRate: 1000 / parseFloat(controls.spawnRate.value),
      movementSpeed: parseFloat(controls.movementSpeed.value),
      spinRate: parseFloat(controls.spinRate.value),
      catLifetime: parseFloat(controls.despawnTime.value) * 1000,
      catSize: parseFloat(controls.catSize.value)  
    });
  }

  // Update value displays
  function updateValueDisplay(id, value) {
    if (id === 'movementSpeed' || id === 'spinRate') {
      valueDisplays[id].textContent = parseFloat(value).toFixed(3);
    } else {
      valueDisplays[id].textContent = parseFloat(value).toFixed(1);
    }
  }

  // Add event listeners to all range inputs
  ['spawnRate', 'movementSpeed', 'spinRate', 'despawnTime', 'spawnCount', 'catSize'].forEach(id => {
    controls[id].addEventListener('input', () => {
      updateValueDisplay(id, controls[id].value);
      updateSettings();
    });
  });

  // Button actions
  controls.stopBtn.addEventListener('click', () => {
    CatSimulation.stop();
  });

  controls.resetBtn.addEventListener('click', () => {
    CatSimulation.reset();
  });

  controls.spawnBtn.addEventListener('click', () => {
    const breedIndex = controls.catBreed.value === 'random' 
      ? Math.floor(Math.random() * CatSimulation.catVariants.length)
      : parseInt(controls.catBreed.value);
    
    for (let i = 0; i < parseInt(controls.spawnCount.value); i++) {
      CatSimulation.spawnCat(breedIndex);
    }
  });

  controls.crazyBtn.addEventListener('click', () => {
    CatSimulation.toggleCrazyMode();
  });

  // Add settings toggle functionality
  controls.settingsButton.addEventListener('click', () => {
    controls.controls.classList.toggle('visible');
  });

  controls.closeSettings.addEventListener('click', () => {
    controls.controls.classList.remove('visible');
  });

  // Initialize with default values
  updateSettings();
}

// Initialize when document is loaded
window.addEventListener('load', () => {
  if (isMobileOrTablet()) {
    setTimeout(() => {
      CatSimulation.init();
      initControls();
    }, 100);
  }
});
