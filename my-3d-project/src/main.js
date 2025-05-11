import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0c8f0);

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
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
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

<<<<<<< HEAD
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

// Rumah sederhana
const houseGeo = new THREE.BoxGeometry(5, 3, 5);
const houseMat = new THREE.MeshStandardMaterial({ color: 0xa0522d });
const house = new THREE.Mesh(houseGeo, houseMat);
house.position.set(0, 1.5, -10);
scene.add(house);
=======
// Rumah
const houseWidth = 10;
const houseHeight = 5;
const houseDepth = 10;
const wallThickness = 0.5;
const houseZ = -20;
const houseY = houseHeight / 2;

const wallMatOutside = new THREE.MeshStandardMaterial({ color: 0xa0522d });
const wallMatInside = new THREE.MeshStandardMaterial({ color: 0xffffff });

// Dinding kiri
const leftWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, houseHeight, houseDepth),
  wallMatOutside
);
leftWall.position.set(-houseWidth / 2 + wallThickness / 2, houseY, houseZ);
scene.add(leftWall);

// Dinding kanan
const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, houseHeight, houseDepth),
  wallMatOutside
);
rightWall.position.set(houseWidth / 2 - wallThickness / 2, houseY, houseZ);
scene.add(rightWall);

// Dinding belakang
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(houseWidth, houseHeight, wallThickness),
  wallMatOutside
);
backWall.position.set(0, houseY, houseZ - houseDepth / 2 + wallThickness / 2);
scene.add(backWall);

// Atap (langit-langit dalam)
const topWall = new THREE.Mesh(
  new THREE.BoxGeometry(houseWidth, wallThickness, houseDepth),
  wallMatOutside
);
topWall.position.set(0, houseHeight, houseZ);
scene.add(topWall);

// Lantai dalam rumah
const houseFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(houseWidth - 1, houseDepth - 1),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
houseFloor.rotation.x = -Math.PI / 2;
houseFloor.position.set(0, 0.01, houseZ);
scene.add(houseFloor);

// Atap segitiga
const roofGeo = new THREE.ConeGeometry(houseWidth * 0.75, 3, 4);
const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
const roof = new THREE.Mesh(roofGeo, roofMat);
roof.position.set(0, houseHeight + 1.5, houseZ);
roof.rotation.y = Math.PI / 4;
scene.add(roof);

// Lampu dalam rumah
const pointLight = new THREE.PointLight(0xffffff, 1, 20);
pointLight.position.set(0, houseHeight - 1, houseZ);
scene.add(pointLight);
>>>>>>> 86d45a6f9f08928d9e4af051367c4e3a1716b062

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

// Update animate function to include jump handling
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
