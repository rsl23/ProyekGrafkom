import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000033); // Dark blue for night

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 5); // Spawn user outside the fence

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.intensity = 0.05; // Almost no ambient light
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

// Load grass texture
const grassTexture = new THREE.TextureLoader().load("./public/grass.jpg");

// Update floor material to use grass texture
const floorMat = new THREE.MeshStandardMaterial({ map: grassTexture });

const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
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
    scene.add(panel);
  }
}

// Remove the original large floor
scene.remove(floor);

// Ubah batas map menjadi lebih kecil
const mapBoundary = 30; // Map dari -30 sampai 30 pada sumbu x dan z
const fenceHeight = 1;
const fenceLength = 0.4;
const fenceModelScale = 0.2;

const adjustedFenceHeight = fenceHeight * fenceModelScale;
const adjustedFenceLength = fenceLength * fenceModelScale;

// Atur jumlah fence yang lebih sedikit (misalnya hanya 12 per sisi)
const segmentCount = 35;
const totalLength = mapBoundary * 2;
const step = totalLength / segmentCount;

const fenceLoader = new GLTFLoader();
fenceLoader.load(
  "./public/fence_1.glb",
  (gltf) => {
    const fenceModel = gltf.scene;

    // North side
    for (let i = 0; i < segmentCount; i++) {
      const x = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.position.set(x, adjustedFenceHeight / 2, -mapBoundary + 1);
      scene.add(segment);
    }
    // Add half-size fence at the end of North side
    const northHalfSegment = fenceModel.clone();
    northHalfSegment.scale.set(
      adjustedFenceLength / 2,
      adjustedFenceHeight,
      fenceModelScale
    );
    northHalfSegment.position.set(
      mapBoundary,
      adjustedFenceHeight / 2,
      -mapBoundary + 1
    );
    scene.add(northHalfSegment);

    // South side
    for (let i = 0; i < segmentCount; i++) {
      const x = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.position.set(x, adjustedFenceHeight / 2, mapBoundary + 1);
      scene.add(segment);
    }
    // Add half-size fence at the end of South side
    const southHalfSegment = fenceModel.clone();
    southHalfSegment.scale.set(
      adjustedFenceLength / 2,
      adjustedFenceHeight,
      fenceModelScale
    );
    southHalfSegment.position.set(
      mapBoundary,
      adjustedFenceHeight / 2,
      mapBoundary + 1
    );
    scene.add(southHalfSegment);

    // East side
    for (let i = -1; i <= segmentCount; i++) {
      const z = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.rotation.y = Math.PI / 2;
      segment.position.set(mapBoundary, adjustedFenceHeight / 2, z);
      scene.add(segment);
    }
    // Add half-size fence at the end of East side
    const eastHalfSegment = fenceModel.clone();
    eastHalfSegment.scale.set(
      adjustedFenceLength,
      adjustedFenceHeight,
      fenceModelScale / 2
    );
    eastHalfSegment.rotation.y = Math.PI / 2;
    eastHalfSegment.position.set(
      mapBoundary,
      adjustedFenceHeight / 2,
      mapBoundary
    );
    scene.add(eastHalfSegment);

    // West side
    for (let i = 0; i < segmentCount; i++) {
      const z = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.rotation.y = Math.PI / 2;
      segment.position.set(-mapBoundary2, adjustedFenceHeight / 2, z);
      scene.add(segment);
    }
    // Add half-size fence at the end of West side
    const westHalfSegment = fenceModel.clone();
    westHalfSegment.scale.set(
      adjustedFenceLength,
      adjustedFenceHeight,
      fenceModelScale / 2
    );
    westHalfSegment.rotation.y = Math.PI / 2;
    westHalfSegment.position.set(
      -mapBoundary,
      adjustedFenceHeight / 2,
      mapBoundary
    );
    scene.add(westHalfSegment);
  },
  undefined,
  (error) => {
    console.error("Terjadi error saat memuat fence:", error);
  }
);

// Fungsi untuk menangani collision fence dengan cara membatasi posisi pemain
function handleFenceCollision() {
  const playerPos = controls.getObject().position;
  const margin = 1; // margin kecil agar pemain tidak terlalu dekat dengan fence

  // Only restrict movement if the player is within the map boundaries
  if (
    playerPos.x >= -mapBoundary - margin &&
    playerPos.x <= mapBoundary + margin &&
    playerPos.z >= -mapBoundary - margin &&
    playerPos.z <= mapBoundary + margin
  ) {
    playerPos.x = Math.max(
      Math.min(playerPos.x, mapBoundary - margin),
      -mapBoundary + margin
    );
    playerPos.z = Math.max(
      Math.min(playerPos.z, mapBoundary - margin),
      -mapBoundary + margin
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

// Add F key for toggling flashlight
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyF") {
    flashlightOn = !flashlightOn;
    if (flashlightOn) {
      flashlight.intensity = 3;
      flashlightBulb.intensity = 0.5;
    } else {
      flashlight.intensity = 0;
      flashlightBulb.intensity = 0;
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
  }
}

// Update animate function to include jump handling, stairs collision handling, fence collision handling, and grave collision handling
function animate() {
  requestAnimationFrame(animate);
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
    handleSofaCollision(); // Add sofa collision handling
    updateFlashlight();
  }

  // Update flashlight position and target every frame
  updateFlashlight();

  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Sofa
const sofaLoader = new GLTFLoader();
let sofaBoundingBox; // Variable to store sofa bounding box

sofaLoader.load(
  "./public/sofa_web.glb",
  (gltf) => {
    const sofaModel = gltf.scene;
    sofaModel.position.set(0, 0, 5); // Place the sofa at the user's spawn position
    sofaModel.scale.set(0.003, 0.003, 0.003); // Reduce the scale of the sofa
    scene.add(sofaModel);
    // Create bounding box for sofa
    sofaBoundingBox = new THREE.Box3().setFromObject(sofaModel);

    // Add visual helper for the bounding box (for debugging)
    // const boxHelper = new THREE.Box3Helper(sofaBoundingBox, 0xff0000);
    // scene.add(boxHelper);

    // Add a small buffer around the sofa (making collision area slightly larger)
    sofaBoundingBox.min.x -= 0.5;
    sofaBoundingBox.min.z -= 0.5;
    sofaBoundingBox.max.x += 0.5;
    sofaBoundingBox.max.z += 0.5;

    console.log(
      "Sofa model loaded successfully with collision bounds:",
      sofaBoundingBox
    );
  },
  undefined,
  (error) => {
    console.error("Error loading sofa asset:", error);
  }
);

// Function to handle sofa collision
function handleSofaCollision() {
  if (sofaBoundingBox) {
    const playerPosition = controls.getObject().position;
    const prevPosition = {
      x: playerPosition.x,
      z: playerPosition.z,
    };

    // Check if player is within sofa bounding box (x and z axes only)
    if (
      playerPosition.x >= sofaBoundingBox.min.x &&
      playerPosition.x <= sofaBoundingBox.max.x &&
      playerPosition.z >= sofaBoundingBox.min.z &&
      playerPosition.z <= sofaBoundingBox.max.z
    ) {
      // Calculate direction vector from sofa center to player
      const sofaCenter = new THREE.Vector3();
      sofaBoundingBox.getCenter(sofaCenter);

      const directionX = playerPosition.x - sofaCenter.x;
      const directionZ = playerPosition.z - sofaCenter.z;

      // Normalize direction
      const length = Math.sqrt(
        directionX * directionX + directionZ * directionZ
      );
      const normalizedDirX = directionX / length;
      const normalizedDirZ = directionZ / length;

      // Push player outside the bounding box
      const pushDistance = 0.5; // Distance to push player away
      playerPosition.x =
        sofaCenter.x +
        (normalizedDirX * (sofaBoundingBox.max.x - sofaBoundingBox.min.x)) / 2 +
        normalizedDirX * pushDistance;
      playerPosition.z =
        sofaCenter.z +
        (normalizedDirZ * (sofaBoundingBox.max.z - sofaBoundingBox.min.z)) / 2 +
        normalizedDirZ * pushDistance;

      // If player is stuck, just restore previous position
      if (
        playerPosition.x >= sofaBoundingBox.min.x &&
        playerPosition.x <= sofaBoundingBox.max.x &&
        playerPosition.z >= sofaBoundingBox.min.z &&
        playerPosition.z <= sofaBoundingBox.max.z
      ) {
        playerPosition.x = prevPosition.x;
        playerPosition.z = prevPosition.z;
      }
    }
  }
}
