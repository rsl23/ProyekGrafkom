import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const canvas = document.getElementById('bg');
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
const floorMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

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

// Pointer Lock Controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener('click', () => {
  controls.lock();
});

// Movement
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const speed = 5 * delta;

  if (controls.isLocked) {
    if (keys['KeyW']) controls.moveForward(speed);
    if (keys['KeyS']) controls.moveForward(-speed);
    if (keys['KeyA']) controls.moveRight(-speed);
    if (keys['KeyD']) controls.moveRight(speed);
  }

  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
