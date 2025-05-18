import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0c8f0); // Change the scene background to a bright color

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 5);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.intensity = 0.8; // Adjust ambient light for daytime
ambientLight.color.set(0xffffff);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.intensity = 1.5; // Adjust directional light for daytime
dirLight.color.set(0xffffff);
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
scene.add(dirLight);

// Floor (luar rumah)
const floorGeo = new THREE.PlaneGeometry(100, 100);

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
const fenceHeight = 5;
const fenceLength = mapBoundary * 2; // panjang fence = 60

// Faktor skala untuk mengecilkan model fence_1.glb
const fenceModelScale = 0.5;
const adjustedFenceHeight = fenceHeight * fenceModelScale;
const adjustedFenceLength = fenceLength * fenceModelScale;

const fenceLoader = new GLTFLoader();
fenceLoader.load(
  "./public/fence_1.glb",
  (gltf) => {
    const fenceModel = gltf.scene;
    // North fence (bagian utara)
    const northFence = fenceModel.clone();
    northFence.scale.set(adjustedFenceLength, adjustedFenceHeight, fenceModelScale);
    northFence.position.set(0, adjustedFenceHeight / 2, -mapBoundary);
    scene.add(northFence);

    // South fence (bagian selatan)
    const southFence = fenceModel.clone();
    southFence.scale.set(adjustedFenceLength, adjustedFenceHeight, fenceModelScale);
    southFence.position.set(0, adjustedFenceHeight / 2, mapBoundary);
    scene.add(southFence);

    // East fence (bagian timur)
    const eastFence = fenceModel.clone();
    eastFence.scale.set(adjustedFenceLength, adjustedFenceHeight, fenceModelScale);
    eastFence.rotation.y = Math.PI / 2;
    eastFence.position.set(mapBoundary, adjustedFenceHeight / 2, 0);
    scene.add(eastFence);

    // West fence (bagian barat)
    const westFence = fenceModel.clone();
    westFence.scale.set(adjustedFenceLength, adjustedFenceHeight, fenceModelScale);
    westFence.rotation.y = Math.PI / 2;
    westFence.position.set(-mapBoundary, adjustedFenceHeight / 2, 0);
    scene.add(westFence);
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
  playerPos.x = Math.max(Math.min(playerPos.x, mapBoundary - margin), -mapBoundary + margin);
  playerPos.z = Math.max(Math.min(playerPos.z, mapBoundary - margin), -mapBoundary + margin);
}

// Add bounding box for stairs
let stairsBoundingBox;

// Load 3D house model with error handling
const loader = new GLTFLoader();
loader.load(
  "./public/House.glb",
  (gltf) => {
    const houseModel = gltf.scene;
    houseModel.position.set(0, 2, -10); // Position the house
    houseModel.scale.set(20, 20, 20); // Double the size of the house
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

// Update animate function to include jump handling, stairs collision handling, and fence collision handling
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const speed = 5 * delta;

  if (controls.isLocked) {
    if (keys["KeyW"]) controls.moveForward(speed);
    if (keys["KeyS"]) controls.moveForward(-speed);
    if (keys["KeyA"]) controls.moveRight(-speed);
    if (keys["KeyD"]) controls.moveRight(speed);

    handleJump(delta);
    handleStairsCollision();
    handleFenceCollision();
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
