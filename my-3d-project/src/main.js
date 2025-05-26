// Import Three.js
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { initAudioSystem } from "./generatorAudio.js";

// Inisialisasi variable untuk tracking animation frame and jumpscare
let animationFrameId;
window.jumpscareTriggered = false; // Flag untuk memastikan jumpscare hanya terjadi sekali

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Aktifkan shadow pada renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x212121);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 15); // Spawn user dekat dengan api unggun

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.intensity = 0.1; // Almost no ambient light
ambientLight.color.set(0x404040); // Softer, cooler light
scene.add(ambientLight);

// Set all main lights to zero so the scene is dark except for flashlight
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.intensity = 0; // Turn off to make the flashlight more dramatic
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
scene.add(dirLight);

// Additional Directional Light (turned off for flashlight effect)
const additionalDirLight = new THREE.DirectionalLight(0xffffff, 0);
additionalDirLight.position.set(-10, 15, -10);
scene.add(additionalDirLight);

// Floor (luar rumah)
const floorGeo = new THREE.PlaneGeometry(1000, 1000);
const grassTexture = new THREE.TextureLoader().load("./public/grass.jpg");
const floorMat = new THREE.MeshStandardMaterial({ map: grassTexture });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true; // Agar tanah menerima shadow
scene.add(floor);

// Create a grid of smaller grass panels
const panelSize = 10;
const gridSize = 10;

for (let i = -gridSize / 2; i < gridSize / 2; i++) {
  for (let j = -gridSize / 2; j < gridSize / 2; j++) {
    const panelGeo = new THREE.PlaneGeometry(panelSize, panelSize);
    const panelMat = new THREE.MeshStandardMaterial({ map: grassTexture });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.rotation.x = -Math.PI / 2;
    panel.position.set(i * panelSize, 0, j * panelSize);
    panel.receiveShadow = true; // Setiap panel grass menerima shadow
    scene.add(panel);
  }
}

// Remove the original large floor
scene.remove(floor);

// Add corpse at spawn position
const corpseLoader = new GLTFLoader();
corpseLoader.load(
  "./public/corpse.glb",
  (gltf) => {
    const corpseModel = gltf.scene;
    corpseModel.position.set(0, 0, 5); // Place corpse at player spawn
    corpseModel.scale.set(2, 2, 2); // Adjust scale as needed
    corpseModel.rotation.y = Math.PI / 2; // Rotate for better visibility
    scene.add(corpseModel);

    // Add collision for the corpse so player can't walk through it
    const corpseBox = new THREE.Box3().setFromObject(corpseModel);
    corpseBox.expandByVector(new THREE.Vector3(0.2, 0.5, 0.2)); // Add small buffer
    graveCollisionBoxes.push(corpseBox); // Use same collision system as graves

    console.log("Corpse loaded successfully at spawn position");
  },
  undefined,
  (error) => {
    console.error("Error loading corpse model:", error);
  }
);

// Ubah batas map menjadi lebih kecil
const mapBoundary = 30; // Map dari -30 sampai 30 pada sumbu x dan z
const fenceHeight = 2;
const fenceLength = 3;
const fenceModelScale = 1;

const adjustedFenceHeight = fenceHeight * fenceModelScale;
const adjustedFenceLength = fenceLength * fenceModelScale;

// Atur jumlah fence yang lebih sedikit (misalnya hanya 12 per sisi)
const segmentCount = 35;
const totalLength = mapBoundary * 2;
const step = totalLength / segmentCount;

const fenceLoader = new GLTFLoader();
fenceLoader.load(
  "./public/brick_and_stone_wall.glb",
  (gltf) => {
    const fenceModel = gltf.scene; // North side
    for (let i = 0; i <= segmentCount + 2; i = i + 3) {
      const x = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.rotation.y = Math.PI; // Rotate 180 degrees
      segment.position.set(x+5, adjustedFenceHeight / 2, -mapBoundary +2); // Updated z by +1
      scene.add(segment);
    }
    // Add half-size fence at the end of North side
    const northHalfSegment = fenceModel.clone();
    northHalfSegment.scale.set(
      adjustedFenceLength / 2,
      adjustedFenceHeight,
      fenceModelScale
    );
    northHalfSegment.rotation.y = Math.PI; // Rotate 180 degrees
    northHalfSegment.position.set(
      mapBoundary,
      adjustedFenceHeight / 2,
      -mapBoundary // Updated z by +1
    );
    scene.add(northHalfSegment);

    // South side
    for (let i = -3; i < segmentCount; i = i + 3) {
      const x = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.position.set(x, adjustedFenceHeight / 2, mapBoundary -1);
      scene.add(segment);
    }

    // East side
    for (let i = 0; i <= segmentCount + 4; i = i + 3) {
      const z = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.rotation.y = Math.PI / 2;
      segment.position.set(mapBoundary-1, adjustedFenceHeight / 2, z);
      scene.add(segment);
    } // West side
    for (let i = -3; i <= segmentCount + 3; i = i + 3) {
      const z = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.rotation.y = Math.PI * 1.5; // Rotate 180 degrees (Math.PI/2 + Math.PI)
      segment.position.set(-mapBoundary, adjustedFenceHeight / 2, z); // Moved west wall by -1 on x-axis
      scene.add(segment);
    }
  },
  undefined,
  (error) => {
    console.error("Terjadi error saat memuat fence:", error);
  }
);

// Tambahkan array global untuk menyimpan bounding box grave
const graveCollisionBoxes = [];

const graveyardLoader = new GLTFLoader();
graveyardLoader.load(
  "./public/grave.glb",
  (gltf) => {
    const graveModel = gltf.scene;
    // Ubah rentang graveyard agar lebih sempit (pastikan didalam mapBoundary yang = 30)
    const startX = -25,
      endX = -14;
    const startZ = -22,
      endZ = -12;
    // Tingkatkan jumlah baris dan kolom agar jaraknya jadi lebih rapat
    const rows = 4;
    const cols = 5;
    const xStep = (endX - startX) / (cols - 1);
    const zStep = (endZ - startZ) / (rows - 1);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const graveInstance = graveModel.clone();
        graveInstance.position.set(startX + j * xStep, 0, startZ + i * zStep);
        graveInstance.rotation.y = Math.random() * Math.PI * 2;
        graveInstance.scale.set(0.5, 0.5, 0.5);
        // Aktifkan shadow pada semua mesh di kuburan
        graveInstance.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // Pastikan grave berada di dalam mapBoundary
        if (
          graveInstance.position.x >= -mapBoundary &&
          graveInstance.position.x <= mapBoundary &&
          graveInstance.position.z >= -mapBoundary &&
          graveInstance.position.z <= mapBoundary
        ) {
          scene.add(graveInstance);
          // Buat bounding box dan expand sumbu Y agar mencakup posisi pemain (misal sampai y=2)
          const box = new THREE.Box3().setFromObject(graveInstance);
          box.expandByVector(new THREE.Vector3(0, 2, 0));
          graveCollisionBoxes.push(box);
        }
      }
    }
    console.log("Graveyard loaded successfully");
  },
  undefined,
  (error) => {
    console.error("Terjadi error saat memuat graveyard:", error);
  }
);

// Fungsi untuk menangani collision graveyard
function handleGraveCollision(previousPos) {
  const playerPos = controls.getObject().position;
  const newPos = playerPos.clone();

  graveCollisionBoxes.forEach((box) => {
    // Cek collision 2D (sumbu X dan Z)
    if (
      newPos.x >= box.min.x &&
      newPos.x <= box.max.x &&
      newPos.z >= box.min.z &&
      newPos.z <= box.max.z
    ) {
      // Hitung pusat dan setengah ukuran (extent) pada sumbu X dan Z
      const center = new THREE.Vector3();
      box.getCenter(center);
      const halfSizeX = (box.max.x - box.min.x) / 2;
      const halfSizeZ = (box.max.z - box.min.z) / 2;

      // Selisih dari pusat box
      const dx = newPos.x - center.x;
      const dz = newPos.z - center.z;

      const overlapX = halfSizeX - Math.abs(dx);
      const overlapZ = halfSizeZ - Math.abs(dz);

      // Resolusi: kembalikan sumbu dengan penetrasi lebih sedikit agar pemain bisa "slide"
      if (overlapX < overlapZ) {
        // Kembalikan pergerakan pada sumbu X, biarkan Z tetap untuk slide
        newPos.x = previousPos.x;
      } else {
        // Kembalikan pergerakan pada sumbu Z
        newPos.z = previousPos.z;
      }
    }
  });
  controls.getObject().position.copy(newPos);
}

// Fungsi untuk menangani collision fence dengan cara membatasi posisi pemain
function handleFenceCollision() {
  const playerPos = controls.getObject().position;
  const margin = 0.5; // reduced margin to allow player to get closer to walls
  // Only restrict movement if the player is within the map boundaries
  if (
    playerPos.x >= -mapBoundary - 1 - margin && // Adjusted for west wall moved by -1
    playerPos.x <= mapBoundary + margin &&
    playerPos.z >= -mapBoundary + 1 - margin && // Adjusted for north wall moved by +1
    playerPos.z <= mapBoundary + margin
  ) {
    playerPos.x = Math.max(
      Math.min(playerPos.x, mapBoundary - margin),
      -mapBoundary - 1 + margin // Adjusted for west wall moved by -1
    );
    playerPos.z = Math.max(
      Math.min(playerPos.z, mapBoundary - margin),
      -mapBoundary + 1 + margin // Adjusted for north wall moved by +1
    );
  }
}

// Add bounding box for stairs
let stairsBoundingBox;

// // Load 3D house model with error handling
const loader = new GLTFLoader();
loader.load(
  "./public/grave.glb",
  (gltf) => {
    const houseModel = gltf.scene;
    houseModel.position.set(-20, 0, -26); // Position the house
    houseModel.scale.set(0.5, 0.5, 0.5); // Double the size of the house
    scene.add(houseModel);

    // Assuming stairs are part of the house model, calculate bounding box
    stairsBoundingBox = new THREE.Box3().setFromObject(
      houseModel.getObjectByName("Stairs")
    );

    console.log("House model loaded successfully");
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the house model:", error);
  }
);

// const loa = new GLTFLoader();
// loa.load(
//   "./public/spooky_fetch.glb",
//   (gltf) => {
//     const houseModel = gltf.scene;
//     houseModel.position.set(-10, 0, -26); // Position the house
//     houseModel.scale.set(0.5, 0.5, 0.5); // Double the size of the house
//     scene.add(houseModel);

//     // Assuming stairs are part of the house model, calculate bounding box
//     stairsBoundingBox = new THREE.Box3().setFromObject(
//       houseModel.getObjectByName("Stairs")
//     );

//     console.log("House model loaded successfully");
//   },
//   undefined,
//   (error) => {
//     console.error("An error occurred while loading the house model:", error);
//   }
// );

// Pointer Lock Controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener("click", () => {
  controls.lock();

  // Play background horror sound on user interaction
  if (isBackgroundAudioLoaded && !backgroundSound.isPlaying) {
    backgroundSound.play();
    console.log("Background horror sound started playing");
  }
});

// Movement
const keys = {};
document.addEventListener("keydown", (e) => (keys[e.code] = true));
document.addEventListener("keyup", (e) => (keys[e.code] = false));

// Add jump functionality
let velocityY = 0;
const gravity = -9.8;
const jumpStrength = 5;
let isOnGround = true;

function handleJump(delta) {
  if (!isOnGround) {
    velocityY += gravity * delta;
    controls.getObject().position.y += velocityY * delta;

    if (controls.getObject().position.y <= 1.6) {
      // Reset to ground level
      controls.getObject().position.y = 1.6;
      velocityY = 0;
      isOnGround = true;
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && isOnGround) {
    velocityY = jumpStrength;
    isOnGround = false;
  }
});

const clock = new THREE.Clock();

function handleStairsCollision() {
  if (stairsBoundingBox) {
    const playerPosition = controls.getObject().position;
    if (
      playerPosition.x >= stairsBoundingBox.min.x &&
      playerPosition.x <= stairsBoundingBox.max.x &&
      playerPosition.z >= stairsBoundingBox.min.z &&
      playerPosition.z <= stairsBoundingBox.max.z
    ) {
      // Adjust player's height to simulate climbing stairs
      playerPosition.y = Math.max(playerPosition.y, stairsBoundingBox.max.y);
    }
  }
}

// Flashlight (Spotlight) - dimodifikasi agar lebih besar dan lebih terang
const flashlight = new THREE.SpotLight(
  0xffffff,
  40,
  80,
  Math.PI / 8,
  0.95,
  1.7
);
flashlight.position.copy(camera.position);
flashlight.target.position.set(
  camera.position.x + camera.getWorldDirection(new THREE.Vector3()).x * 10,
  camera.position.y + camera.getWorldDirection(new THREE.Vector3()).y * 10,
  camera.position.z + camera.getWorldDirection(new THREE.Vector3()).z * 10
);
flashlight.castShadow = true;
scene.add(flashlight);
scene.add(flashlight.target);

// Update flashlightBulb (simulasi glow) - lebih besar dan lebih terang
const flashlightBulb = new THREE.PointLight(0xffffaa, 1, 5);
flashlightBulb.position.copy(camera.position);
scene.add(flashlightBulb);

// Flashlight toggle state
let flashlightOn = true;

// Add gasoline counter
let gasolineCollected = 0;
const requiredGasoline = 5; // Number of gasoline cans needed to run the generator
// Track if generator has been filled with gasoline
let generatorFilled = false;
// Track how many gasoline units have been added to the generator
let generatorFilledAmount = 0;

// Flashlight dimming variables
const dimmingDuration = 50; // Durasi dimming (detik)
const maxIntensity = 20; // Intensitas maksimum
const minIntensity = 10; // Intensitas minimum (mati)
let dimmingStartTime = Date.now(); // Waktu mulai dimming
let isDimming = true; // Status dimming
let isRecharging = false; // Status recharging
const rechargeDuration = 5; // Durasi recharge (detik)
let rechargeStartTime = 0; // Waktu mulai recharge
let currentFlashlightIntensity = maxIntensity; // Intensitas awal
let lastBatteryLevel = 1.0; // Track battery level when flashlight is turned off
let elapsedDimmingTime = 0; // Track elapsed dimming time when flashlight is turned off

// Add F key for toggling flashlight
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyF") {
    // Block turning flashlight back on if battery is depleted
    if (isRecharging) {
      // Battery is depleted permanently, don't toggle
      const lowBatteryWarning = document.getElementById("lowBatteryWarning");
      if (lowBatteryWarning) {
        // Flash the warning to emphasize it's not working
        lowBatteryWarning.style.animation = "pulseWarning 0.3s 3";
        setTimeout(() => {
          lowBatteryWarning.style.animation = "pulseWarning 2s infinite";
        }, 900);
      }
      return;
    }

    flashlightOn = !flashlightOn;
    if (flashlightOn) {
      // When turning back on, use the saved battery level
      isDimming = true;
      isRecharging = false;

      // Calculate how much time has already passed (in seconds) for dimming
      const remainingPercentage = lastBatteryLevel;
      elapsedDimmingTime = dimmingDuration * (1 - remainingPercentage);

      // Set the new dimming start time based on the elapsed time
      dimmingStartTime = Date.now() - elapsedDimmingTime * 1000;

      // Set the correct intensity based on the saved battery level
      currentFlashlightIntensity = maxIntensity * remainingPercentage;

      flashlight.intensity = currentFlashlightIntensity;
      flashlightBulb.intensity = currentFlashlightIntensity / 6; // Bulb is dimmer than spotlight

      // Update battery UI with the saved level
      updateBatteryUI(lastBatteryLevel);

      // Remove any existing warning
      const lowBatteryWarning = document.getElementById("lowBatteryWarning");
      if (lowBatteryWarning) {
        lowBatteryWarning.remove();
      }
    } else {
      // Save current battery level when turning off
      if (isDimming) {
        lastBatteryLevel =
          1 - (Date.now() - dimmingStartTime) / 1000 / dimmingDuration;
        lastBatteryLevel = Math.max(0, Math.min(1, lastBatteryLevel)); // Clamp between 0 and 1
      }

      flashlight.intensity = 0;
      flashlightBulb.intensity = 0;

      // Hide battery UI when flashlight is off
      const batteryIndicator = document.getElementById("batteryIndicator");
      if (batteryIndicator) {
        batteryIndicator.style.display = "none";
      }

      // Remove any existing warning
      const lowBatteryWarning = document.getElementById("lowBatteryWarning");
      if (lowBatteryWarning) {
        lowBatteryWarning.remove();
      }
    }
  }
});

// Update flashlight position and target in the animate function
function updateFlashlight() {
  if (flashlightOn) {
    // Position the flashlight at camera position
    flashlight.position.copy(camera.position);

    // Get camera direction as a normalized vector
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());

    // Set target position 10 units ahead in camera direction
    flashlight.target.position.set(
      camera.position.x + cameraDirection.x * 10,
      camera.position.y + cameraDirection.y * 10,
      camera.position.z + cameraDirection.z * 10
    );

    // Update bulb position with slight offset to appear in front of camera
    flashlightBulb.position.set(
      camera.position.x + cameraDirection.x * 0.5,
      camera.position.y + cameraDirection.y * 0.5 - 0.2, // Slightly below camera
      camera.position.z + cameraDirection.z * 0.5
    );

    // Handle flashlight dimming effect
    if (isDimming) {
      // Calculate time elapsed since dimming started
      const elapsedTime = (Date.now() - dimmingStartTime) / 1000; // Convert to seconds

      // Calculate current intensity based on elapsed time
      if (elapsedTime < dimmingDuration) {
        // Linear interpolation from max to min intensity
        const dimmingProgress = elapsedTime / dimmingDuration;
        currentFlashlightIntensity = maxIntensity * (1 - dimmingProgress);

        // Visual feedback when flashlight is getting dim
        if (
          currentFlashlightIntensity < 1.0 &&
          !document.getElementById("lowBatteryWarning")
        ) {
          // Create low battery warning element
          const lowBatteryWarning = document.createElement("div");
          lowBatteryWarning.id = "lowBatteryWarning";
          lowBatteryWarning.innerHTML = "Low Battery!";
          lowBatteryWarning.style.position = "absolute";
          lowBatteryWarning.style.top = "10%";
          lowBatteryWarning.style.left = "50%";
          lowBatteryWarning.style.transform = "translateX(-50%)";
          lowBatteryWarning.style.color = "#ff3300";
          lowBatteryWarning.style.fontFamily = "Arial, sans-serif";
          lowBatteryWarning.style.fontSize = "24px";
          lowBatteryWarning.style.fontWeight = "bold";
          lowBatteryWarning.style.textShadow = "0 0 5px rgba(255, 51, 0, 0.7)";
          lowBatteryWarning.style.padding = "10px";
          lowBatteryWarning.style.borderRadius = "5px";
          lowBatteryWarning.style.zIndex = "1000";
          document.body.appendChild(lowBatteryWarning);
        }
      } else {
        // Flashlight completely dimmed
        currentFlashlightIntensity = minIntensity;
        isDimming = false;
        isRecharging = true;
        rechargeStartTime = Date.now();

        // Update warning to "Recharging..."
        const lowBatteryWarning = document.getElementById("lowBatteryWarning");
        if (lowBatteryWarning) {
          lowBatteryWarning.innerHTML = "No Battery";
          lowBatteryWarning.style.color = "#ffcc00";
        }
      }
    }
    if (isRecharging) {
      // Battery is permanently depleted - no recharging
      currentFlashlightIntensity = minIntensity;
      flashlightOn = false; // Force flashlight to remain off

      // Check if jumpscare has already been triggered
      if (!window.jumpscareTriggered) {
        window.jumpscareTriggered = true;

        // Trigger jumpscare
        triggerJumpscare();
      }
    } // Update flashlight and bulb intensities
    flashlight.intensity = currentFlashlightIntensity;
    flashlightBulb.intensity = currentFlashlightIntensity / 6; // Bulb is dimmer than spotlight

    // Add random subtle flicker for realism
    if (currentFlashlightIntensity > 0) {
      // More dramatic flickering when battery is low
      const flickerAmount = currentFlashlightIntensity < 1 ? 0.3 : 0.1;
      const randomFlicker = (Math.random() - 0.5) * flickerAmount;
      flashlight.intensity += randomFlicker;
      flashlightBulb.intensity += randomFlicker / 6;
    }

    // Update battery UI
    if (isDimming) {
      const batteryLevel =
        1 - (Date.now() - dimmingStartTime) / 1000 / dimmingDuration;
      updateBatteryUI(Math.max(0, Math.min(1, batteryLevel)));
    } else if (isRecharging) {
      // Battery is depleted permanently, always show 0%
      updateBatteryUI(0);
    }
  }
}

// Utility: Set shadow for all loaded objects (call after all loaders, or after scene setup)
function setShadowForAllObjects() {
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}
// Panggil sekali setelah semua objek utama sudah dimuat (misal di akhir semua loader atau di akhir animate pertama)
setTimeout(setShadowForAllObjects, 2000); // 2 detik setelah start, agar semua objek sudah ada

// Pastikan flashlight (SpotLight) shadow map besar dan optimal
flashlight.castShadow = true;
flashlight.shadow.mapSize.width = 2048;
flashlight.shadow.mapSize.height = 2048;
flashlight.shadow.bias = -0.002;

// PASTIKAN: Semua objek utama (gasoline, tree, generator, street_lamp, roundabout, grave, corpse, campfire, fence, dll) sudah traverse dan set castShadow = true, receiveShadow = true pada semua mesh-nya.
// Sudah dilakukan pada loader masing-masing, tapi pastikan juga di bawah ini:
// function setShadowForAllObjects() {
//   scene.traverse((obj) => {
//     if (obj.isMesh) {
//       obj.castShadow = true;
//       obj.receiveShadow = true;
//     }
//   });
// }
// setShadowForAllObjects();

// PASTIKAN: Renderer shadowMap sudah aktif dan tipe PCFSoftShadowMap (SUDAH)
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// PASTIKAN: Flashlight (SpotLight) sudah castShadow = true dan shadow map besar
flashlight.castShadow = true;
flashlight.shadow.mapSize.width = 2048;
flashlight.shadow.mapSize.height = 2048;
flashlight.shadow.bias = -0.002;

// PASTIKAN: Semua lampu lain (point light street lamp) juga castShadow = true dan shadow map besar (SUDAH)
// Sudah di loader street lamp

// TIPS: Untuk performa, jika ingin, bisa traverse dan set castShadow hanya pada objek yang dekat dengan player/flashlight, tapi untuk hasil maksimal, aktifkan saja semuanya.

// Selesai. Dengan pengaturan di atas, semua objek yang disinari flashlight akan memunculkan shadow dinamis di belakangnya sesuai arah sinar dan posisi player.
// Jika shadow masih kurang jelas, bisa tambahkan plane ground (grass panel) dengan receiveShadow = true (SUDAH), dan pastikan tidak ada ambient light terlalu terang.
// Jika ingin shadow lebih tajam, bisa naikkan flashlight.shadow.mapSize.width/height ke 4096, tapi hati-hati performa.

// Tambahkan array untuk menyimpan posisi generator
const generatorObjects = [];

// Load audio untuk generator
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Add background horror atmosphere sound
const backgroundSound = new THREE.Audio(audioListener);
const backgroundAudioLoader = new THREE.AudioLoader();
let isBackgroundAudioLoaded = false;

// Load and play background horror sound
backgroundAudioLoader.load(
  "./public/horror atmosphere.mp3",
  function (buffer) {
    backgroundSound.setBuffer(buffer);
    backgroundSound.setLoop(true);
    backgroundSound.setVolume(0.3); // Set volume level (0.0 to 1.0)
    isBackgroundAudioLoaded = true;
    // Don't play automatically - we'll play on user interaction
    console.log("Background horror sound loaded successfully");
  },
  function (xhr) {
    console.log(
      `Background audio loading: ${(xhr.loaded / xhr.total) * 100}% loaded`
    );
  },
  function (error) {
    console.error("Error loading background horror sound:", error);
  }
);

// Add random creepy sound effects
const creepySound = new THREE.Audio(audioListener);
const creepyAudioLoader = new THREE.AudioLoader();
let isCreepySoundLoaded = false;

// Load creepy sound effect
creepyAudioLoader.load(
  "./public/creepy_sound.mp3",
  function (buffer) {
    creepySound.setBuffer(buffer);
    creepySound.setLoop(false); // Only play once when triggered
    creepySound.setVolume(initialCreepySoundVolume); // Start with very low volume
    isCreepySoundLoaded = true;
    console.log("Creepy sound effect loaded successfully");

    // Start playing random creepy sounds after user interaction
    setTimeout(playRandomCreepySound, getRandomInterval());
  },
  function (xhr) {
    console.log(
      `Creepy sound loading: ${(xhr.loaded / xhr.total) * 100}% loaded`
    );
  },
  function (error) {
    console.error("Error loading creepy sound effect:", error);
  }
);

// Track the number of times creepy sound has played for volume progression
let creepySoundPlayCount = 0;
const maxCreepySoundVolume = 0.7; // Maximum volume creepy sound will reach
const creepySoundVolumeStep = 0.1; // Amount to increase volume each time
const initialCreepySoundVolume = 0.1; // Starting volume (very quiet)

// Function to play creepy sound at random intervals with gradually increasing volume
function playRandomCreepySound() {
  if (isCreepySoundLoaded && !creepySound.isPlaying) {
    // Calculate current volume based on play count (increases each time)
    const currentVolume = Math.min(
      initialCreepySoundVolume + creepySoundPlayCount * creepySoundVolumeStep,
      maxCreepySoundVolume
    );

    // Set the new volume
    creepySound.setVolume(currentVolume);

    // Play the sound
    creepySound.play();

    // Increment the play counter for next time
    creepySoundPlayCount++;

    console.log(
      `Playing creepy sound effect (volume: ${currentVolume.toFixed(2)})`
    );
  }

  // Schedule next creepy sound with timing that gets shorter as game progresses
  setTimeout(playRandomCreepySound, getRandomInterval());
}

// Get random interval that decreases slightly each time (from 30-50s to 20-40s)
function getRandomInterval() {
  // Base interval gets shorter as play count increases (min 20 seconds)
  const baseTime = Math.max(30000 - creepySoundPlayCount * 1000, 20000);
  return Math.random() * 15000 + baseTime;
}

// Initialize the audio system
const audioSystem = initAudioSystem(audioListener);
const isAudioSystemReady = () => audioSystem.getAudioLoadStatus();

// Dictionary untuk menyimpan status generator (aktif/nonaktif)
const generatorStatus = {};

// Create a positional audio object rather than a standard audio object
// This will allow for proper 3D spatial audio
const generatorSound = new THREE.PositionalAudio(audioListener);
const audioLoader = new THREE.AudioLoader();

// Configure audio for better spatial positioning
// These settings will make the sound more directional and have improved distance falloff
const configureSpatialAudio = () => {
  if (generatorSound && generatorSound.panner) {
    // Set how quickly the volume reduces as source moves away
    generatorSound.setDistanceModel("exponential");

    // Set the maximum distance at which the sound can be heard
    generatorSound.setMaxDistance(25);

    // Set reference distance for reducing volume
    generatorSound.setRefDistance(1);

    // Set how quickly the sound gets quieter based on source/listener angle
    generatorSound.setRolloffFactor(1.2);

    // Set directional sound cone for more realistic position (optional)
    // More focused at source, gradually spreading out
    generatorSound.setDirectionalCone(180, 230, 0.8);

    console.log(
      "Spatial audio settings configured for improved distance-based audio"
    );
  } else {
    console.warn("Could not configure spatial audio - panner not available");
  }
};

// Tambahkan debugging untuk memastikan file audio dimuat dengan benar
console.log("Loading audio file from:", "./public/suara_generator.mp3");
let isAudioLoaded = true; // Track if audio is loaded successfully
// Coba beberapa path yang mungkin untuk file audio
const tryLoadAudio = (paths) => {
  if (paths.length === 0) {
    console.error("All audio paths failed, will fallback to generated sound");
    return;
  }

  const currentPath = paths[0];
  const remainingPaths = paths.slice(1);

  console.log(`Trying to load audio from: ${currentPath}`);
  audioLoader.load(
    currentPath,
    function (buffer) {
      generatorSound.setBuffer(buffer);
      generatorSound.setLoop(true);
      generatorSound.setVolume(0);

      // Apply spatial audio configuration
      configureSpatialAudio();

      generatorSound.play(); // Putar dari awal tapi dengan volume 0
      isAudioLoaded = true;
      console.log(`Generator sound loaded successfully from: ${currentPath}`);
    },
    function (xhr) {
      if (xhr.loaded > 0) {
        console.log(
          `Audio loading progress from ${currentPath}: ${
            (xhr.loaded / xhr.total) * 100
          }%`
        );
      }
    },
    function (error) {
      console.error(
        `Error loading generator sound from ${currentPath}:`,
        error
      );

      // Coba path selanjutnya jika ada
      if (remainingPaths.length > 0) {
        console.log("Trying next path...");
        tryLoadAudio(remainingPaths);
      }
    }
  );
};

// Daftar path yang mungkin untuk mencoba
const possiblePaths = [
  "./public/suara_generator.mp3",
  "/public/suara_generator.mp3",
  "suara_generator.mp3",
  "./suara_generator.mp3",
  "../public/suara_generator.mp3",
];

// Coba load dari semua path yang mungkin
tryLoadAudio(possiblePaths);

// Fungsi untuk membuat suara generator sederhana jika file audio tidak bisa dimuat
function createFallbackSound() {
  // Buat AudioContext baru
  const audioContext = THREE.AudioContext.getContext();

  // Panjang buffer (sekitar 1 detik pada 44100 Hz)
  const bufferSize = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate
  );

  // Dapatkan channel data untuk diisi
  const channelData = buffer.getChannelData(0);

  // Hasilkan suara generator sederhana (white noise dengan modulasi)
  for (let i = 0; i < bufferSize; i++) {
    // Gabungkan white noise dengan beberapa frekuensi untuk suara generator
    const t = i / audioContext.sampleRate;
    const noise = Math.random() * 0.1;
    const lowFreq = Math.sin(2 * Math.PI * 50 * t) * 0.05;
    const midFreq = Math.sin(2 * Math.PI * 120 * t) * 0.03;

    // Modulasi amplitudo
    const modulation = 0.7 + 0.3 * Math.sin(2 * Math.PI * 4 * t);

    // Gabungkan semua
    channelData[i] = (noise + lowFreq + midFreq) * modulation;
  }

  console.log("Created fallback generator sound");
  return buffer;
}

// Cek status audio setelah beberapa detik
setTimeout(() => {
  if (!isAudioLoaded) {
    console.warn(
      "Audio file failed to load after timeout, creating fallback sound"
    );
    const fallbackBuffer = createFallbackSound();
    generatorSound.setBuffer(fallbackBuffer);
    generatorSound.setLoop(true);
    generatorSound.setVolume(0);

    // Apply spatial audio configuration to fallback sound
    configureSpatialAudio();

    isAudioLoaded = true;
    console.log("Fallback sound created and ready to use");
  }
}, 5000); // Tunggu 5 detik

// --- AUDIO GENERATOR: pastikan tidak double play dan context selalu aktif ---
let generatorSoundInitialized = false;
document.addEventListener("click", () => {
  if (!generatorSoundInitialized && isAudioLoaded) {
    try {
      if (!generatorSound.isPlaying) generatorSound.play();
      generatorSound.setVolume(0); // Mulai dengan volume 0
      generatorSoundInitialized = true;
      console.log("Generator sound context initialized after user click");
    } catch (e) {
      console.warn("Failed to play generator sound on user click:", e);
    }
  }
});

// Fungsi untuk mengecek jarak ke generator terdekat
function checkGeneratorProximity() {
  if (!controls.isLocked) return;

  const playerPos = controls.getObject().position;
  const cameraDirection = camera.getWorldDirection(new THREE.Vector3());

  // Only check the single remaining generator (index 0)
  if (generatorObjects.length > 0) {
    const generator = generatorObjects[0];
    const index = 0;
    const distance = playerPos.distanceTo(generator.position);

    // Increased interaction radius for audio detection
    const interactionRadius = 20; // Increased to make generator easier to find
    const visualInteractionRadius = 5; // Keep visual/interaction radius at 5

    // Use the larger radius for audio detection
    if (distance <= interactionRadius) {
      // If within visual interaction radius, allow player interaction with cursor
      if (distance <= visualInteractionRadius) {
        // Calculate normalized vector from player to generator
        const directionToGenerator = new THREE.Vector3()
          .subVectors(generator.position, playerPos)
          .normalize();

        // Calculate cosine of angle between camera direction and direction to generator
        const dotProduct = cameraDirection.dot(directionToGenerator); // Player is looking at generator if dot product exceeds threshold
        const lookingThreshold = 0.85;
        if (dotProduct > lookingThreshold) {
          // Handle visual interaction
          const promptElement = document.getElementById("interactionPrompt");
          promptElement.style.display = "block"; // Show different prompt based on generator status
          if (generatorStatus[index]) {
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Nonaktifkan Generator';
          } else if (generatorFilled) {
            // Generator has all gasoline but is not activated
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Aktifkan Generator';
          } else if (gasolineCollected >= 1) {
            // Player has gasoline - allow filling
            promptElement.innerHTML = `<span style="color: #ffcc00;">[E]</span> Fill Generator (${generatorFilledAmount}/${requiredGasoline})`;
          } else {
            // No gasoline collected yet
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Need gasoline to fill generator';
          }

          return { position: generator.position, index: index };
        }
      } else if (generatorStatus[index] && isAudioSystemReady()) {
        // Audio-only detection (player can hear but not interact)
        return {
          position: generator.position,
          index: index,
          audioOnly: true,
        };
      }
    }
  }

  // Always update audio system with player position
  if (isAudioSystemReady()) {
    audioSystem.updateGeneratorSounds(playerPos);
  }

  // Hide prompt when not looking at the generator
  document.getElementById("interactionPrompt").style.display = "none";
  return null;
}

// Event listener untuk tombol E (interaksi)
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyE") {
    // First check for generator interaction
    const closestGenerator = checkGeneratorProximity();
    if (closestGenerator && !closestGenerator.audioOnly) {
      const index = closestGenerator.index;
      const promptElement = document.getElementById("interactionPrompt");

      // Different interactions based on generator state
      if (generatorStatus[index]) {
        // Generator is already running - turn it off
        generatorStatus[index] = false;

        // Update status in the audio system
        if (isAudioSystemReady()) {
          audioSystem.setGeneratorStatus(index, false);
        } // Visual feedback for deactivation
        promptElement.style.transform = "translateX(-50%) scale(1.1)";
        promptElement.style.border = "2px solid #ff0000";
        promptElement.style.boxShadow = "0 0 15px rgba(255, 0, 0, 0.6)";
        promptElement.innerHTML =
          '<span style="color: #ff0000;">[E]</span> Generator Nonaktif';

        console.log(`Generator dinonaktifkan!`);

        // Reset UI after feedback
        setTimeout(() => {
          if (!generatorStatus[index]) {
            promptElement.style.border = "2px solid #ff6600";
            promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Aktifkan Generator';
          }
        }, 1000);
      } else if (generatorFilled) {
        // Generator has been filled with gasoline - activate it
        generatorStatus[index] = true; // Play generator startup sound
        if (isAudioSystemReady()) {
          audioSystem.playGeneratorStartupSound(index);
        }

        // Update status in the audio system
        if (isAudioSystemReady()) {
          audioSystem.setGeneratorStatus(index, true);
        }

        // Visual feedback animation for the prompt
        promptElement.style.transform = "translateX(-50%) scale(1.1)";
        promptElement.style.border = "2px solid #00ff00";
        promptElement.style.boxShadow = "0 0 15px rgba(0, 255, 0, 0.6)";
        promptElement.innerHTML =
          '<span style="color: #00ff00;">[E]</span> Generator Aktif';

        console.log(`Generator diaktifkan!`);

        // Reset visual style after feedback
        setTimeout(() => {
          if (generatorStatus[index]) {
            promptElement.style.border = "2px solid #ff6600";
            promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Nonaktifkan Generator';
          }
          promptElement.style.transform = "translateX(-50%) scale(0.95)";
        }, 1000);
      } else if (gasolineCollected >= 1 && !generatorFilled) {
        // Directly fill generator
        gasolineCollected--;
        generatorFilledAmount++;
        updateGasolineUI();

        // Visual feedback for partial fill
        promptElement.style.transform = "translateX(-50%) scale(1.1)";
        promptElement.style.border = "2px solid #ffcc00";
        promptElement.style.boxShadow = "0 0 15px rgba(255, 204, 0, 0.6)";
        promptElement.innerHTML = `<span style="color: #ffcc00;">[E]</span> Generator Filled (${generatorFilledAmount}/${requiredGasoline})`;

        console.log(
          `Generator filled: ${generatorFilledAmount}/${requiredGasoline}`
        );

        // Only set generator as filled when we have all required gasoline
        if (generatorFilledAmount >= requiredGasoline) {
          generatorFilled = true;
          // Update prompt to activate
          setTimeout(() => {
            promptElement.style.border = "2px solid #ff6600";
            promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Aktifkan Generator';
            promptElement.style.transform = "translateX(-50%) scale(0.95)";
          }, 1000);
        } else {
          // Reset UI after feedback
          setTimeout(() => {
            promptElement.style.transform = "translateX(-50%) scale(0.95)";
            promptElement.style.border = "2px solid #ff6600";
            promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
          }, 1000);
        }
      } else {
        // No gasoline - show warning
        promptElement.style.transform = "translateX(-50%) scale(1.1)";
        promptElement.style.border = "2px solid #ff3300";
        promptElement.style.boxShadow = "0 0 15px rgba(255, 51, 0, 0.6)";
        promptElement.innerHTML =
          '<span style="color: #ff3300;">[!]</span> Need at least 1 gasoline can';

        // Reset UI after feedback
        setTimeout(() => {
          promptElement.style.border = "2px solid #ff6600";
          promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
          promptElement.innerHTML =
            '<span style="color: #ff6600;">[E]</span> Need gasoline to fill generator';
          promptElement.style.transform = "translateX(-50%) scale(0.95)";
        }, 2000);
      }
      return; // Stop here if interacting with generator
    } // Check for gasoline interaction if not interacting with generator
    const nearbyGasoline = checkGasolineProximity();
    if (nearbyGasoline) {
      const promptElement = document.getElementById("interactionPrompt");

      // Visual feedback for gasoline pickup
      promptElement.style.transform = "translateX(-50%) scale(1.1)";
      promptElement.style.border = "2px solid #00ff00";
      promptElement.style.boxShadow = "0 0 15px rgba(0, 255, 0, 0.6)";
      promptElement.innerHTML =
        '<span style="color: #00ff00;">[E]</span> Gasoline Diambil!';

      // Remove the gasoline from the scene
      scene.remove(nearbyGasoline.object);

      // Increment gasoline counter
      gasolineCollected++;
      console.log(
        `Gasoline ${nearbyGasoline.id} diambil! Total: ${gasolineCollected}/${requiredGasoline}`
      );

      // Update gasoline counter UI
      updateGasolineUI();

      // Hide prompt after a short delay
      setTimeout(() => {
        promptElement.style.display = "none";
        promptElement.style.transform = "translateX(-50%) scale(0.95)";
      }, 1000);
    }
  }
});

// Tambahkan elemen UI untuk interaksi
const interactionPrompt = document.createElement("div");
interactionPrompt.id = "interactionPrompt";
interactionPrompt.style.position = "absolute";
interactionPrompt.style.bottom = "20%";
interactionPrompt.style.left = "50%";
interactionPrompt.style.transform = "translateX(-50%) scale(0.95)";
interactionPrompt.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
interactionPrompt.style.color = "white";
interactionPrompt.style.padding = "12px 20px";
interactionPrompt.style.borderRadius = "8px";
interactionPrompt.style.display = "none";
interactionPrompt.style.fontFamily = "Arial, sans-serif";
interactionPrompt.style.fontSize = "20px";
interactionPrompt.style.fontWeight = "bold";
interactionPrompt.style.zIndex = "1000";
interactionPrompt.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8)";
interactionPrompt.style.border = "2px solid #ff6600";
interactionPrompt.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
interactionPrompt.style.transition = "all 0.2s ease-in-out";
interactionPrompt.style.opacity = "0.95";
document.body.appendChild(interactionPrompt);

// Add a cursor dot in the center of the screen for better aiming
const cursorDot = document.createElement("div");
cursorDot.id = "cursorDot";
cursorDot.style.position = "absolute";
cursorDot.style.top = "50%";
cursorDot.style.left = "50%";
cursorDot.style.width = "6px";
cursorDot.style.height = "6px";
cursorDot.style.borderRadius = "50%";
cursorDot.style.backgroundColor = "white";
cursorDot.style.transform = "translate(-50%, -50%)";
cursorDot.style.zIndex = "1000";
cursorDot.style.opacity = "0.7";
cursorDot.style.pointerEvents = "none"; // Ensure it doesn't interfere with clicking
document.body.appendChild(cursorDot);

// Add a battery indicator UI element
const batteryIndicator = document.createElement("div");
batteryIndicator.id = "batteryIndicator";
batteryIndicator.style.position = "absolute";
batteryIndicator.style.bottom = "30px";
batteryIndicator.style.right = "30px";
batteryIndicator.style.width = "150px";
batteryIndicator.style.height = "20px";
batteryIndicator.style.border = "2px solid white";
batteryIndicator.style.borderRadius = "10px";
batteryIndicator.style.overflow = "hidden";
batteryIndicator.style.zIndex = "1000";

// Battery level (inner div)
const batteryLevel = document.createElement("div");
batteryLevel.id = "batteryLevel";
batteryLevel.style.height = "100%";
batteryLevel.style.width = "100%";
batteryLevel.style.backgroundColor = "#ffcc00";
batteryLevel.style.transition = "width 0.5s, background-color 0.5s";
batteryIndicator.appendChild(batteryLevel);

// Battery label
const batteryLabel = document.createElement("div");
batteryLabel.id = "batteryLabel";
batteryLabel.innerHTML = "BATTERY";
batteryLabel.style.position = "absolute";
batteryLabel.style.top = "50%";
batteryLabel.style.left = "50%";
batteryLabel.style.transform = "translate(-50%, -50%)";
batteryLabel.style.color = "black";
batteryLabel.style.fontFamily = "Arial, sans-serif";
batteryLabel.style.fontSize = "12px";
batteryLabel.style.fontWeight = "bold";
batteryLabel.style.textShadow = "0 0 2px rgba(255, 255, 255, 0.7)";
batteryLabel.style.pointerEvents = "none";
batteryIndicator.appendChild(batteryLabel);

document.body.appendChild(batteryIndicator);

// Create gasoline indicator UI
const gasolineIndicator = document.createElement("div");
gasolineIndicator.id = "gasolineIndicator";
gasolineIndicator.style.position = "absolute";
gasolineIndicator.style.top = "20px";
gasolineIndicator.style.right = "20px";
gasolineIndicator.style.width = "150px";
gasolineIndicator.style.height = "40px";
gasolineIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
gasolineIndicator.style.borderRadius = "5px";
gasolineIndicator.style.padding = "10px";
gasolineIndicator.style.display = "flex";
gasolineIndicator.style.alignItems = "center";
gasolineIndicator.style.justifyContent = "center";
gasolineIndicator.style.gap = "10px";
gasolineIndicator.style.zIndex = "1000";
gasolineIndicator.style.border = "2px solid #ffcc00";
gasolineIndicator.style.boxShadow = "0 0 10px rgba(255, 204, 0, 0.4)";

// Create gasoline icon
const gasolineIcon = document.createElement("div");
gasolineIcon.style.width = "20px";
gasolineIcon.style.height = "20px";
gasolineIcon.style.backgroundImage =
  'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffcc00"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>\')';
gasolineIcon.style.backgroundSize = "contain";
gasolineIcon.style.backgroundRepeat = "no-repeat";
gasolineIndicator.appendChild(gasolineIcon);

// Create gasoline count text
const gasolineCountText = document.createElement("div");
gasolineCountText.id = "gasolineCount";
gasolineCountText.style.color = "#ffcc00";
gasolineCountText.style.fontFamily = "Arial, sans-serif";
gasolineCountText.style.fontSize = "18px";
gasolineCountText.style.fontWeight = "bold";
gasolineCountText.style.textShadow = "0 0 3px rgba(0, 0, 0, 0.8)";
gasolineCountText.innerHTML = `0/${requiredGasoline}`;
gasolineIndicator.appendChild(gasolineCountText);

document.body.appendChild(gasolineIndicator);

// Create slider mini-game UI for filling the generator
const sliderGameContainer = document.createElement("div");
sliderGameContainer.id = "sliderGameContainer";
sliderGameContainer.style.position = "absolute";
sliderGameContainer.style.top = "50%";
sliderGameContainer.style.left = "50%";
sliderGameContainer.style.width = "400px";
sliderGameContainer.style.height = "100px";
sliderGameContainer.style.transform = "translate(-50%, -50%)";
sliderGameContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
sliderGameContainer.style.borderRadius = "10px";
sliderGameContainer.style.padding = "20px";
sliderGameContainer.style.display = "none";
sliderGameContainer.style.flexDirection = "column";
sliderGameContainer.style.alignItems = "center";
sliderGameContainer.style.justifyContent = "center";
sliderGameContainer.style.zIndex = "1001";
sliderGameContainer.style.border = "2px solid #ffcc00";
sliderGameContainer.style.boxShadow = "0 0 15px rgba(255, 204, 0, 0.6)";

// Title for the mini-game
const sliderGameTitle = document.createElement("div");
sliderGameTitle.innerHTML = "Fill Generator - Press SPACE in the target zone!";
sliderGameTitle.style.color = "white";
sliderGameTitle.style.fontFamily = "Arial, sans-serif";
sliderGameTitle.style.fontSize = "16px";
sliderGameTitle.style.fontWeight = "bold";
sliderGameTitle.style.marginBottom = "15px";
sliderGameContainer.appendChild(sliderGameTitle);

// Slider bar
const sliderBar = document.createElement("div");
sliderBar.id = "sliderBar";
sliderBar.style.width = "350px";
sliderBar.style.height = "20px";
sliderBar.style.backgroundColor = "#333";
sliderBar.style.borderRadius = "10px";
sliderBar.style.position = "relative";
sliderBar.style.overflow = "hidden";
sliderGameContainer.appendChild(sliderBar);

// Target zone on the slider
const targetZone = document.createElement("div");
targetZone.id = "targetZone";
targetZone.style.position = "absolute";
targetZone.style.width = "50px"; // Initial width - will get smaller with each attempt
targetZone.style.height = "100%";
targetZone.style.backgroundColor = "#00ff00";
targetZone.style.left = "150px"; // Center initially
targetZone.style.borderRadius = "10px";
sliderBar.appendChild(targetZone);

// Moving slider indicator
const sliderIndicator = document.createElement("div");
sliderIndicator.id = "sliderIndicator";
sliderIndicator.style.position = "absolute";
sliderIndicator.style.width = "10px";
sliderIndicator.style.height = "100%";
sliderIndicator.style.backgroundColor = "#ffffff";
sliderIndicator.style.borderRadius = "5px";
sliderIndicator.style.left = "0px";
sliderBar.appendChild(sliderIndicator);

// Instruction text
const instructionText = document.createElement("div");
instructionText.id = "instructionText";
instructionText.innerHTML =
  "Press SPACE when the white marker is in the green zone";
instructionText.style.color = "white";
instructionText.style.fontFamily = "Arial, sans-serif";
instructionText.style.fontSize = "14px";
instructionText.style.marginTop = "10px";
sliderGameContainer.appendChild(instructionText);

document.body.appendChild(sliderGameContainer);

// Function to update gasoline UI
function updateGasolineUI() {
  const gasolineCountElement = document.getElementById("gasolineCount");
  if (gasolineCountElement) {
    gasolineCountElement.innerHTML = `${gasolineCollected}/${requiredGasoline}`;

    // Change color based on how much collected
    if (gasolineCollected >= requiredGasoline) {
      gasolineCountElement.style.color = "#00ff00"; // Green when enough
      gasolineIndicator.style.border = "2px solid #00ff00";
      gasolineIndicator.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.4)";
    } else {
      gasolineCountElement.style.color = "#ffcc00"; // Yellow when collecting
      gasolineIndicator.style.border = "2px solid #ffcc00";
      gasolineIndicator.style.boxShadow = "0 0 10px rgba(255, 204, 0, 0.4)";
    }
  }
}

// Function to update battery UI
function updateBatteryUI(level) {
  const batteryLevel = document.getElementById("batteryLevel");
  const batteryLabel = document.getElementById("batteryLabel");
  const batteryIndicator = document.getElementById("batteryIndicator");

  // Show battery indicator when flashlight is on
  if (batteryIndicator && flashlightOn) {
    batteryIndicator.style.display = "block";
  }

  if (batteryLevel) {
    // Update battery level width (0-100%)
    batteryLevel.style.width = `${level * 100}%`;

    // Change color based on level
    if (level > 0.6) {
      batteryLevel.style.backgroundColor = "#33cc33"; // Green
    } else if (level > 0.3) {
      batteryLevel.style.backgroundColor = "#ffcc00"; // Yellow
    } else {
      batteryLevel.style.backgroundColor = "#ff3300"; // Red

      // Add pulsing effect when battery is low
      if (level < 0.2) {
        batteryLevel.style.animation = "pulseBattery 1s infinite";
        if (!document.getElementById("batteryKeyframes")) {
          const style = document.createElement("style");
          style.id = "batteryKeyframes";
          style.innerHTML = `
            @keyframes pulseBattery {
              0% { opacity: 1; }
              50% { opacity: 0.6; }
              100% { opacity: 1; }
            }
          `;
          document.head.appendChild(style);
        }
      } else {
        batteryLevel.style.animation = "none";
      }
    }
  }
  // Update label text when battery is depleted
  if (batteryLabel) {
    if (isRecharging) {
      batteryLabel.innerHTML = "EMPTY";
    } else {
      batteryLabel.innerHTML = "BATTERY";
    }
  }
}

// Load 1 generator and 5 gasoline with positions
const generatorLoader = new GLTFLoader();
const gasolineLoader = new GLTFLoader();

// First load the generator
generatorLoader.load(
  "./public/generator.glb",
  (gltf) => {
    const generatorModel = gltf.scene;

    // Only one generator at a strategic position
    const generatorPosition = { x: 5, y: 1, z: -10 }; // Keep only the first generator

    // Add slight randomization to position
    const randomOffset = Math.random() * 3 - 1.5; // Between -1.5 and 1.5
    generatorPosition.x += randomOffset;
    generatorPosition.z += randomOffset;

    // Position the generator and add to scene
    const generatorInstance = generatorModel.clone();
    generatorInstance.position.set(
      generatorPosition.x,
      generatorPosition.y,
      generatorPosition.z
    );
    generatorInstance.scale.set(0.03, 0.03, 0.03);
    generatorInstance.userData.generatorId = "generator-0";

    scene.add(generatorInstance);

    // Store reference for interaction
    generatorObjects.push(generatorInstance);
    generatorStatus[0] = false; // Set status awal ke nonaktif

    // Attach audio to this generator
    if (isAudioSystemReady()) {
      audioSystem.attachSoundToGenerator(generatorInstance, 0, audioListener);
    }

    // Add collision detection for generator
    const generatorBox = new THREE.Box3().setFromObject(generatorInstance);
    graveCollisionBoxes.push(generatorBox); // Use same collision system as graves

    console.log(
      "Generator loaded successfully at position:",
      generatorInstance.position
    );
  },
  undefined,
  (error) => {
    console.error("Error loading generator asset:", error);
  }
);

// Then load gasoline cans
gasolineLoader.load(
  "./public/gasoline.glb",
  (gltf) => {
    const gasolineModel = gltf.scene;

    // Create 4 gasoline at fixed positions (replacing previous generators)
    const gasolinePositions = [
      { x: 22, y: 0, z: -20 }, // Northeast gasoline
      { x: -14, y: 0, z: -25 }, // Northwest gasoline
      { x: 15, y: 0, z: 25 }, // Southeast gasoline
      { x: -20, y: 0, z: 25 }, // Southwest gasoline
    ];

    // Create and add each fixed gasoline
    gasolinePositions.forEach((pos, index) => {
      const gasolineInstance = gasolineModel.clone();

      // Add slight randomization to positions
      const randomOffset = Math.random() * 3 - 1.5; // Between -1.5 and 1.5
      pos.x += randomOffset;
      pos.z += randomOffset;

      // Position the gasoline and add to scene
      gasolineInstance.position.set(pos.x, pos.y, pos.z);
      gasolineInstance.scale.set(2, 2, 2); // Adjust scale to look appropriate
      gasolineInstance.rotation.y = Math.random() * Math.PI * 2; // Random rotation for variety
      gasolineInstance.userData.gasolineId = `gasoline-fixed-${index}`;

      scene.add(gasolineInstance);

      // Add collision detection for gasoline
      const gasolineBox = new THREE.Box3().setFromObject(gasolineInstance);
      gasolineBox.expandByVector(new THREE.Vector3(0.2, 0.2, 0.2)); // Add small buffer
      graveCollisionBoxes.push(gasolineBox); // Use same collision system as graves

      console.log(
        `Fixed Gasoline ${index + 1} placed at position:`,
        gasolineInstance.position
      );
    });

    // Create a fifth gasoline in a completely random position across the map
    let randomPosX, randomPosZ;
    let validPosition = false;
    let attempts = 0;
    const maxAttempts = 50;

    // Keep trying until we find a valid position or reach max attempts
    while (!validPosition && attempts < maxAttempts) {
      // Generate random position across the entire map
      randomPosX = (Math.random() * 2 - 1) * (mapBoundary - 5);
      randomPosZ = (Math.random() * 2 - 1) * (mapBoundary - 5);

      // Make sure it's not too close to existing objects
      let tooClose = false;

      // Check distance from generators
      generatorObjects.forEach((generator) => {
        const distance = Math.sqrt(
          Math.pow(randomPosX - generator.position.x, 2) +
            Math.pow(randomPosZ - generator.position.z, 2)
        );
        if (distance < 10) tooClose = true; // Keep at least 10 units away
      });

      // Check distance from spawn point
      const spawnDistance = Math.sqrt(
        Math.pow(randomPosX - 0, 2) + Math.pow(randomPosZ - 15, 2)
      );
      if (spawnDistance < 15) tooClose = true; // Keep away from spawn

      if (!tooClose) validPosition = true;
      attempts++;
    }

    // Create the random gasoline
    const randomGasoline = gasolineModel.clone();
    randomGasoline.position.set(randomPosX, 0.2, randomPosZ);
    randomGasoline.scale.set(1, 1, 1);
    randomGasoline.rotation.y = Math.random() * Math.PI * 2;
    randomGasoline.userData.gasolineId = "gasoline-random";

    scene.add(randomGasoline);

    // Add collision detection
    const randomGasolineBox = new THREE.Box3().setFromObject(randomGasoline);
    randomGasolineBox.expandByVector(new THREE.Vector3(0.2, 0.2, 0.2)); // Add small buffer
    graveCollisionBoxes.push(randomGasolineBox);

    console.log("Random Gasoline placed at position:", randomGasoline.position);
  },
  undefined,
  (error) => {
    console.error("Error loading gasoline assets:", error);
  }
);

// --- TREE SPAWNING WITH STATIC POSITIONS, NO NEAR SPAWN/OBJECTS ---
const importantObjects = [
  { x: 0, z: 15 }, // spawn player
  { x: 0, z: 5 }, // corpse
  { x: 5, z: -10 }, // generator
  { x: 22, z: -20 }, // gasoline
  { x: -14, z: -25 }, // gasoline
  { x: 15, z: 25 }, // gasoline
  { x: -20, z: 25 }, // gasoline
  { x: -10, z: 10 }, // lamp
  { x: 15, z: -15 }, // lamp
  { x: -15, z: -15 }, // lamp
  { x: 20, z: 20 }, // lamp
  { x: -20, z: 20 }, // lamp
  { x: 0, z: -20 }, // lamp
  { x: 0, z: 25 }, // lamp
];

function isFarFromImportant(pos, minDist = 10) {
  for (const obj of importantObjects) {
    const dx = pos.x - obj.x;
    const dz = pos.z - obj.z;
    if (Math.sqrt(dx * dx + dz * dz) < minDist) return false;
  }
  return true;
}

function generateTreePositions(count, mapBoundary, minDist = 10) {
  const positions = [];
  let attempts = 0;
  while (positions.length < count && attempts < 2000) {
    // Meningkatkan jumlah percobaan maksimum
    const x = Math.round((Math.random() * 2 - 1) * (mapBoundary - 3));
    const z = Math.round((Math.random() * 2 - 1) * (mapBoundary - 3));
    const pos = { x, z };
    if (isFarFromImportant(pos, minDist)) {
      // Also avoid too close to other trees
      let tooClose = false;
      for (const t of positions) {
        if (Math.sqrt((t.x - x) ** 2 + (t.z - z) ** 2) < minDist * 0.75) {
          // Mengurangi faktor jarak minimum antar pohon
          tooClose = true;
          break;
        }
      }
      if (!tooClose) positions.push(pos);
    }
    attempts++;
  }
  return positions;
}

const treeTypes = [
  {
    file: "./public/ancient_tree.glb",
    count: 30,
    scale: [0.01, 0.02, 0.01],
    positions: generateTreePositions(60, mapBoundary, 10), // Meningkatkan jumlah pohon, mengurangi jarak minimum
  },
  {
    file: "./public/tree_1.glb",
    count: 20,
    scale: [0.7, 0.9, 0.7],
    positions: generateTreePositions(60, mapBoundary, 8), // Meningkatkan jumlah pohon, mengurangi jarak minimum
  },
  {
    file: "./public/oak_tree.glb", // Menambah jenis pohon baru (oak_tree)
    count: 30,
    scale: [0.5, 0.6, 0.5], // Skala yang sesuai untuk oak_tree
    positions: generateTreePositions(40, mapBoundary, 9),
  },
];

const treeLoader = new GLTFLoader();
for (const treeType of treeTypes) {
  treeLoader.load(treeType.file, (gltf) => {
    for (let i = 0; i < treeType.count; i++) {
      const pos = treeType.positions[i];
      if (!pos) continue;
      const tree = gltf.scene.clone();
      tree.position.set(pos.x, 0, pos.z);
      tree.scale.set(...treeType.scale);
      scene.add(tree); // Collision box presisi sesuai scale tree
      let box;
      if (treeType.file.includes("ancient_tree")) {
        // Ukuran asli ancient_tree.glb setelah scale 0.01
        box = new THREE.Box3(
          new THREE.Vector3(pos.x - 2.5, 0, pos.z - 2.5),
          new THREE.Vector3(pos.x + 2.5, 10, pos.z + 2.5)
        );
      } else if (treeType.file.includes("tree_1")) {
        // Ukuran asli tree_1.glb setelah scale 0.7
        box = new THREE.Box3(
          new THREE.Vector3(pos.x - 1.5, 0, pos.z - 1.5),
          new THREE.Vector3(pos.x + 1.5, 8, pos.z + 1.5)
        );
      } else if (treeType.file.includes("oak_tree")) {
        // Ukuran untuk oak_tree.glb setelah scale 0.5
        box = new THREE.Box3(
          new THREE.Vector3(pos.x - 2.0, 0, pos.z - 2.0),
          new THREE.Vector3(pos.x + 2.0, 9, pos.z + 2.0)
        );
      } else {
        // Fallback ke bounding box dari objek
        box = new THREE.Box3().setFromObject(tree);
      }
      graveCollisionBoxes.push(box);
    }
    console.log(`${treeType.file} loaded and placed at filtered positions.`);
  });
}

// Array for tracking gasoline objects
const gasolineObjects = [];

// Function to check if player is near a gasoline can
function checkGasolineProximity() {
  if (!controls.isLocked) return null;

  const playerPos = controls.getObject().position;
  const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
  const lookingThreshold = 0.85; // Same threshold as generator

  // Find all objects with gasolineId in their userData
  const gasolineCans = [];
  scene.traverse((object) => {
    if (object.userData && object.userData.gasolineId) {
      gasolineCans.push(object);
    }
  });

  // Check if player is looking at any gasoline can
  for (const gasoline of gasolineCans) {
    const distance = playerPos.distanceTo(gasoline.position);

    // Only check if within interaction distance
    if (distance <= 5) {
      // Calculate direction to gasoline
      const directionToGasoline = new THREE.Vector3()
        .subVectors(gasoline.position, playerPos)
        .normalize();

      // Check if player is looking at gasoline
      const dotProduct = cameraDirection.dot(directionToGasoline);

      if (dotProduct > lookingThreshold) {
        // Show pickup prompt
        const promptElement = document.getElementById("interactionPrompt");
        promptElement.style.display = "block";
        promptElement.innerHTML =
          '<span style="color: #ffcc00;">[E]</span> Ambil Gasoline';
        promptElement.style.border = "2px solid #ffcc00";
        promptElement.style.boxShadow = "0 0 15px rgba(255, 204, 0, 0.6)";

        return {
          object: gasoline,
          id: gasoline.userData.gasolineId,
        };
      }
    }
  }

  return null;
}

let roundaboutObject = null;
const roundaboutLoader = new GLTFLoader();
roundaboutLoader.load(
  "./public/roundabout_old.glb",
  (gltf) => {
    roundaboutObject = gltf.scene;
    roundaboutObject.position.set(10, 0.4, 23);
    roundaboutObject.scale.set(3, 3, 3);
    // Aktifkan castShadow dan receiveShadow pada semua mesh di roundabout
    roundaboutObject.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(roundaboutObject);

    // Buat bounding box collision seperti wall
    const roundaboutBox = new THREE.Box3().setFromObject(roundaboutObject);
    // Expand sedikit agar collision lebih nyaman
    roundaboutBox.expandByVector(new THREE.Vector3(0.2, 2, 0.2));
    // Simpan ke array collision box (gunakan sistem graveCollisionBoxes agar handleGraveCollision bisa dipakai)
    graveCollisionBoxes.push(roundaboutBox);
  },
  undefined,
  (error) => {
    console.error("Error loading roundabout model:", error);
  }
);

// Fungsi untuk collision roundabout: sliding (tidak bisa tembus, tapi bisa sliding di sisi)
// function handleRoundaboutCollision(previousPos) {
//   if (!roundaboutBox) return;
//   const playerPos = controls.getObject().position;
//   const newPos = playerPos.clone();
//   if (
//     newPos.x >= roundaboutBox.min.x &&
//     newPos.x <= roundaboutBox.max.x &&
//     newPos.z >= roundaboutBox.min.z &&
//     newPos.z <= roundaboutBox.max.z
//   ) {
//     // Hitung pusat dan setengah ukuran (extent) pada sumbu X dan Z
//     const center = new THREE.Vector3();
//     roundaboutBox.getCenter(center);
//     const halfSizeX = (roundaboutBox.max.x - roundaboutBox.min.x) / 2;
//     const halfSizeZ = (roundaboutBox.max.z - roundaboutBox.min.z) / 2;
//     // Selisih dari pusat box
//     const dx = newPos.x - center.x;
//     const dz = newPos.z - center.z;
//     const overlapX = halfSizeX - Math.abs(dx);
//     const overlapZ = halfSizeZ - Math.abs(dz);
//     // Resolusi: kembalikan sumbu dengan penetrasi lebih sedikit agar pemain bisa "slide"
//       if (overlapX < overlapZ) {
//         // Kembalikan pergerakan pada sumbu X, biarkan Z tetap untuk slide
//         newPos.x = previousPos.x;
//       } else {
//         // Kembalikan pergerakan pada sumbu Z
//         newPos.z = previousPos.z;
//       }
//     }
//   });
//   controls.getObject().position.copy(newPos);
// }

// Update animate function to include jump handling, stairs collision handling, fence collision handling, and grave collision handling
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const speed = 5 * delta;
  if (controls.isLocked) {
    const previousPos = controls.getObject().position.clone();

    if (keys["KeyW"]) controls.moveForward(speed);
    if (keys["KeyS"]) controls.moveForward(-speed);
    if (keys["KeyA"]) controls.moveRight(-speed);
    if (keys["KeyD"]) controls.moveRight(speed);

    handleJump(delta);
    handleStairsCollision();
    handleFenceCollision();
    handleGraveCollision(previousPos);
    handleRoundaboutCollision(previousPos); // Cegah pemain menabrak roundabout

    // Check for interactive objects
    const closestGenerator = checkGeneratorProximity();
    const nearbyGasoline = checkGasolineProximity();

    // Update cursor dot color based on whether player is looking at an interactive object
    const cursorDot = document.getElementById("cursorDot");
    if (closestGenerator && !closestGenerator.audioOnly) {
      cursorDot.style.backgroundColor = "#ff6600";
      cursorDot.style.boxShadow = "0 0 5px rgba(255, 102, 0, 0.8)";
      cursorDot.style.width = "8px";
      cursorDot.style.height = "8px";
    } else if (nearbyGasoline) {
      cursorDot.style.backgroundColor = "#ffcc00";
      cursorDot.style.boxShadow = "0 0 5px rgba(255, 204, 0, 0.8)";
      cursorDot.style.width = "8px";
      cursorDot.style.height = "8px";
    } else {
      cursorDot.style.backgroundColor = "white";
      cursorDot.style.boxShadow = "none";
      cursorDot.style.width = "6px";
      cursorDot.style.height = "6px";
    }
  }
  updateFlashlight();

  if (roundaboutObject) {
    roundaboutObject.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add campfire
// const campfireLoader = new GLTFLoader();
// campfireLoader.load(
//   "./public/campfire.glb",
//   (gltf) => {
//     const campfireModel = gltf.scene;
//     campfireModel.position.set(0, 0, 10); // Place the campfire where the sofa was
//     campfireModel.scale.set(2, 2, 2); // Adjust scale as needed
//     scene.add(campfireModel);

//     // Add a flickering point light for the campfire
//     const campfireLight = new THREE.PointLight(0xff6600, 2, 10);
//     campfireLight.position.set(0, 1, 10); // Slightly above the campfire
//     scene.add(campfireLight);

//     // Create a flickering effect for the campfire light
//     function animateCampfire() {
//       // Random intensity between 1.5 and 2.5
//       campfireLight.intensity = 1.5 + Math.random();
//       setTimeout(animateCampfire, 1000 + Math.random() * 150);
//     }
//     animateCampfire();

//     // Add collision detection for campfire
//     const campfireBox = new THREE.Box3().setFromObject(campfireModel);
//     campfireBox.expandByVector(new THREE.Vector3(0.5, 2, 0.5)); // Add buffer
//     graveCollisionBoxes.push(campfireBox); // Use same collision system as graves

//     console.log("Campfire loaded successfully");
//   },
//   undefined,
//   (error) => {
//     console.error("Error loading campfire asset:", error);
//   }
// );

// Bangunan hancur has been removed

// Street lamp loader
const streetLampLoader = new GLTFLoader();
streetLampLoader.load(
  "./public/standart_street_lamp.glb",
  (gltf) => {
    const streetLampModel = gltf.scene;

    // Define positions for street lamps
    const lampPositions = [
      { x: -10, z: 10 }, // Left side of spawn
      { x: 15, z: -15 }, // Northeast area
      { x: -15, z: -15 }, // Northwest area
      { x: 20, z: 20 }, // Southeast corner
      { x: -20, z: 20 }, // Southwest corner
      { x: 0, z: -20 }, // North center
      { x: 0, z: 25 }, // South center
    ];

    // Add each lamp to the scene
    lampPositions.forEach((pos) => {
      const lampInstance = streetLampModel.clone();
      lampInstance.position.set(pos.x, 0, pos.z);
      lampInstance.scale.set(2, 2, 2);
      lampInstance.rotation.y = Math.random() * Math.PI * 2;
      // Aktifkan shadow pada semua mesh lampu
      lampInstance.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(lampInstance);
      // Lampu utama
      const lampLight = new THREE.PointLight(0xffffcc, 1.5, 15);
      lampLight.position.set(pos.x, 4, pos.z);
      lampLight.castShadow = true; // Lampu memancarkan shadow
      lampLight.shadow.mapSize.width = 2048;
      lampLight.shadow.mapSize.height = 2048;
      lampLight.shadow.bias = -0.002;
      scene.add(lampLight); // Add dramatic flickering effect for horror atmosphere
      function animateLampLight() {
        // Generate random flicker patterns
        const flickerPattern = Math.random(); // Different flickering patterns for each lamp

        if (flickerPattern < 1) {
          // Occasional complete blackout (20% chance)
          lampLight.intensity = 0;
          setTimeout(() => {
            lampLight.intensity = 1.5 + Math.random() * 0.5;
          }, 800 + Math.random() * 2000); // Extended darkness period 800-2000ms
        }
        // else if (flickerPattern < 0.2) {
        //   // Dimming (20% chance)
        //   lampLight.intensity = 0; // Complete darkness instead of dim
        //   setTimeout(() => {
        //     lampLight.intensity = 1.5;
        //   }, 600 + Math.random() * 900); // Extended darkness period  600-1500ms
        // }
        else {
          // Subtle pulsing (30% chance)
          lampLight.intensity = 1.2 + Math.random() * 0.6;
        }

        // Set timing for next flicker event - all lamps flicker frequently now
        // Fixed to around 1 second (800-1200ms) as requested
        const nextFlickerTime = 800 + Math.random() * 400;

        setTimeout(animateLampLight, nextFlickerTime);
      }
      animateLampLight();

      // Add collision detection for the lamp

      const lampBox = new THREE.Box3().setFromObject(lampInstance);
      graveCollisionBoxes.push(lampBox); // Use same collision system as graves

      console.log(`Street lamp added at position (${pos.x}, ${pos.z})`);
    });

    console.log("Street lamps loaded successfully");
  },
  undefined,
  (error) => {
    console.error("Error loading street lamp asset:", error);
  }
);

// Tambahkan roundabout ke map


// Function to trigger jumpscare and game over
function triggerJumpscare() {
  console.log("Triggering jumpscare and game over");

  // Create full-screen overlay for the jumpscare
  const jumpscareOverlay = document.createElement("div");
  jumpscareOverlay.id = "jumpscareOverlay";
  jumpscareOverlay.style.position = "fixed";
  jumpscareOverlay.style.top = "0";
  jumpscareOverlay.style.left = "0";
  jumpscareOverlay.style.width = "100%";
  jumpscareOverlay.style.height = "100%";
  jumpscareOverlay.style.backgroundColor = "black";
  jumpscareOverlay.style.zIndex = "2000";
  jumpscareOverlay.style.display = "flex";
  jumpscareOverlay.style.justifyContent = "center";
  jumpscareOverlay.style.alignItems = "center";
  jumpscareOverlay.style.transition = "background-color 2s";
  document.body.appendChild(jumpscareOverlay);

  // Play jumpscare sound
  const jumpscareSound = new THREE.Audio(audioListener);
  const soundLoader = new THREE.AudioLoader();
  soundLoader.load(
    "./public/heartbeat.mp3", // Using heartbeat sound for jumpscare
    function (buffer) {
      jumpscareSound.setBuffer(buffer);
      jumpscareSound.setVolume(1.0);
      jumpscareSound.play();
    }
  );

  // Load jumpscare model
  const jumpscareLoader = new GLTFLoader();
  jumpscareLoader.load("./public/jumpscare.glb", function (gltf) {
    // Create a camera for rendering the jumpscare
    const jumpscareCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Create a separate scene for the jumpscare
    const jumpscareScene = new THREE.Scene();

    // Add dramatic lighting to jumpscare scene
    const redLight = new THREE.PointLight(0xff0000, 5, 100);
    redLight.position.set(0, 5, 10);
    jumpscareScene.add(redLight); // Set up the jumpscare model
    const jumpscareModel = gltf.scene;
    jumpscareModel.position.set(0, 0, -10); // Posisikan lebih jauh agar bisa "mendekat" ke pemain
    jumpscareModel.scale.set(5, 5, 5); // Perbesar skalanya untuk efek yang lebih mengerikan
    jumpscareScene.add(jumpscareModel);

    // Render the jumpscare to a canvas
    const jumpscareCanvas = document.createElement("canvas");
    jumpscareCanvas.width = window.innerWidth;
    jumpscareCanvas.height = window.innerHeight;
    jumpscareCanvas.style.width = "100%";
    jumpscareCanvas.style.height = "100%";
    jumpscareCanvas.style.position = "absolute";
    jumpscareCanvas.style.top = "0";
    jumpscareCanvas.style.left = "0";
    jumpscareCanvas.style.opacity = "0";
    jumpscareCanvas.style.transition = "opacity 0.2s";

    // Create renderer for jumpscare
    const jumpscareRenderer = new THREE.WebGLRenderer({
      canvas: jumpscareCanvas,
      alpha: true,
    });
    jumpscareRenderer.setSize(window.innerWidth, window.innerHeight);

    // Add canvas to overlay
    jumpscareOverlay.appendChild(jumpscareCanvas); // Create animation for jumpscare
    setTimeout(() => {
      // Flash the screen
      jumpscareOverlay.style.backgroundColor = "white";

      setTimeout(() => {
        // Layar menjadi hitam pekat terlebih dahulu
        jumpscareOverlay.style.backgroundColor = "black";

        // Tunggu beberapa saat kemudian baru munculkan jumpscare
        setTimeout(() => {
          jumpscareOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
          jumpscareCanvas.style.opacity = "1";

          // Animate the jumpscare model
          function animateJumpscare() {
            requestAnimationFrame(animateJumpscare);

            // Move the jumpscare model closer dengan gerakan yang lebih agresif
            if (jumpscareModel.position.z < 3) {
              // Gerakan maju semakin cepat saat mendekati kamera
              const speedMultiplier = 1 + (3 - jumpscareModel.position.z) * 0.2;
              jumpscareModel.position.z += 0.3 * speedMultiplier;
            }

            // Randomly rotate the model for creepy effect
            jumpscareModel.rotation.y += Math.sin(Date.now() * 0.008) * 0.1; // Rotasi lebih cepat
            jumpscareModel.rotation.x += Math.sin(Date.now() * 0.005) * 0.05; // Rotasi lebih intens

            // Render jumpscare scene
            jumpscareRenderer.render(jumpscareScene, jumpscareCamera);
          }
          animateJumpscare();

          // Show game over screen after jumpscare
          setTimeout(showGameOver, 3000);
        }, 1500); // Waktu untuk menampilkan model jumpscare setelah layar hitam (diperpanjang menjadi 1.5 detik)
      }, 100);
    }, 500);
  });
}

// Function to show game over screen
function showGameOver() {
  // Create game over screen
  const gameOverScreen = document.createElement("div");
  gameOverScreen.id = "gameOverScreen";
  gameOverScreen.style.position = "fixed";
  gameOverScreen.style.top = "0";
  gameOverScreen.style.left = "0";
  gameOverScreen.style.width = "100%";
  gameOverScreen.style.height = "100%";
  gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  gameOverScreen.style.color = "#ff0000";
  gameOverScreen.style.display = "flex";
  gameOverScreen.style.flexDirection = "column";
  gameOverScreen.style.justifyContent = "center";
  gameOverScreen.style.alignItems = "center";
  gameOverScreen.style.zIndex = "3000";
  gameOverScreen.style.fontFamily = "Arial, sans-serif";

  // Create game over text
  const gameOverText = document.createElement("h1");
  gameOverText.innerHTML = "GAME OVER";
  gameOverText.style.fontSize = "72px";
  gameOverText.style.marginBottom = "30px";
  gameOverText.style.textShadow = "0 0 20px #ff0000";
  gameOverText.style.animation = "pulse 2s infinite";

  // Create restart button
  const restartButton = document.createElement("button");
  restartButton.innerHTML = "Try Again";
  restartButton.style.padding = "15px 30px";
  restartButton.style.fontSize = "24px";
  restartButton.style.backgroundColor = "#ff0000";
  restartButton.style.color = "black";
  restartButton.style.border = "none";
  restartButton.style.borderRadius = "5px";
  restartButton.style.cursor = "pointer";
  restartButton.style.fontWeight = "bold";
  restartButton.style.margin = "20px";
  restartButton.style.transition = "all 0.3s";

  // Hover effect for button
  restartButton.onmouseover = function () {
    this.style.backgroundColor = "#ffffff";
  };
  restartButton.onmouseout = function () {
    this.style.backgroundColor = "#ff0000";
  };

  // Restart game when button is clicked
  restartButton.onclick = function () {
    location.reload();
  };

  // Add pulse animation for game over text
  if (!document.getElementById("pulseKeyframes")) {
    const style = document.createElement("style");
    style.id = "pulseKeyframes";
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  // Add elements to game over screen
  gameOverScreen.appendChild(gameOverText);
  gameOverScreen.appendChild(restartButton);
  document.body.appendChild(gameOverScreen);

  // Unlock controls to allow interaction with the game over screen
  controls.unlock();

  // Stop all animations and sounds
  cancelAnimationFrame(animationFrameId);
  if (backgroundSound && backgroundSound.isPlaying) {
    backgroundSound.stop();
  }

  // Play low ambient sound for game over screen
  const gameOverSound = new THREE.Audio(audioListener);
  const soundLoader = new THREE.AudioLoader();
  soundLoader.load("./public/horror atmosphere.mp3", function (buffer) {
    gameOverSound.setBuffer(buffer);
    gameOverSound.setLoop(true);
    gameOverSound.setVolume(0.3);
    gameOverSound.play();
  });
}

// Fungsi untuk menangani collision roundabout
function handleRoundaboutCollision(previousPos) {
    if (roundaboutObject) {
        const playerPos = controls.getObject().position;
        // Buat bounding box dari geometry roundabout (mengikuti rotasi dan scale)
        const box = new THREE.Box3().setFromObject(roundaboutObject);
        // Perluas box sedikit agar collision tidak terlalu "nempel"
        box.expandByScalar(0.2);
        if (box.containsPoint(playerPos)) {
          controls.getObject().position.copy(previousPos);
        }
    }
}
