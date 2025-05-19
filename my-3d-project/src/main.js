import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010); // Lebih gelap dari sebelumnya

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.0001,
  1000
);
camera.position.set(0, 1.6, 15); // Spawn user dekat dengan api unggun

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
ambientLight.intensity = 0.001; // Hampir tidak ada cahaya ambient
ambientLight.color.set(0x222233); // Biru gelap
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
    scene.add(eastHalfSegment); // West side
    for (let i = 0; i < segmentCount; i++) {
      const z = -mapBoundary + i * step + step / 2;
      const segment = fenceModel.clone();
      segment.scale.set(
        adjustedFenceLength,
        adjustedFenceHeight,
        fenceModelScale
      );
      segment.rotation.y = Math.PI / 2;
      segment.position.set(-mapBoundary, adjustedFenceHeight / 2, z);
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
        // Variasi rotasi untuk kesan natural
        graveInstance.rotation.y = Math.random() * Math.PI * 2;
        // Sesuaikan scale jika diperlukan
        graveInstance.scale.set(0.5, 0.5, 0.5);
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

// Tambahkan array untuk menyimpan posisi generator
const generatorObjects = [];

// Load audio untuk generator
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Dictionary untuk menyimpan status generator (aktif/nonaktif)
const generatorStatus = {};

// Inisialisasi variabel status untuk audio
let isAudioLoaded = false;

// Memuat suara generator dengan handling kesalahan
const generatorSound = new THREE.Audio(audioListener);
const audioLoader = new THREE.AudioLoader();

// Tambahkan debugging untuk memastikan file audio dimuat dengan benar
console.log("Loading audio file from:", "./public/suara_generator.mp3");

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

  let minDistance = Infinity;
  let closestGenerator = null;
  let isLookingAtGenerator = false;

  // Threshold for dot product to determine if player is looking at generator
  // Higher value = narrower field of view (more accurate aiming required)
  const lookingThreshold = 0.85; // Increased from 0.7 for more precise cursor aiming

  generatorObjects.forEach((generator, index) => {
    const distance = playerPos.distanceTo(generator.position);

    // Check if generator is within interaction radius
    if (distance <= 5) {
      // Calculate normalized vector from player to generator
      const directionToGenerator = new THREE.Vector3()
        .subVectors(generator.position, playerPos)
        .normalize();

      // Calculate cosine of angle between camera direction and direction to generator
      const dotProduct = cameraDirection.dot(directionToGenerator);

      // Player is looking at generator if dot product exceeds threshold
      if (dotProduct > lookingThreshold) {
        isLookingAtGenerator = true;
        if (distance < minDistance) {
          minDistance = distance;
          closestGenerator = { position: generator.position, index: index };
        }
      }
    }
  });

  // Only show prompt when player is correctly looking at a generator (using cursor)
  if (minDistance <= 5 && closestGenerator && isLookingAtGenerator) {
    const promptElement = document.getElementById("interactionPrompt");
    promptElement.style.display = "block";

    // Show different prompt based on generator status
    if (generatorStatus[closestGenerator.index]) {
      promptElement.innerHTML =
        '<span style="color: #ff6600;">[E]</span> Nonaktifkan Generator';
    } else {
      promptElement.innerHTML =
        '<span style="color: #ff6600;">[E]</span> Aktifkan Generator';
    } // Adjust volume based on distance if generator is active
    if (generatorStatus[closestGenerator.index] && isAudioLoaded) {
      const volume = Math.min(1.0, 1 - minDistance / 5); // Volume between 0-1 based on distance
      console.log(
        `Generator proximity: setting volume to ${volume} (distance: ${minDistance})`
      );

      // Ensure the sound is playing
      if (!generatorSound.isPlaying) {
        generatorSound.play();
      }

      generatorSound.setVolume(volume);
    }

    return closestGenerator;
  } else {
    // Hide prompt when not looking at any generator
    document.getElementById("interactionPrompt").style.display = "none"; // Check for active generators in radius for sound adjustment
    let activeVolumeSet = false;

    if (isAudioLoaded) {
      generatorObjects.forEach((generator, index) => {
        if (generatorStatus[index]) {
          const distance = playerPos.distanceTo(generator.position);
          if (distance <= 5) {
            const volume = Math.min(1.0, 1 - distance / 5);
            console.log(
              `Active generator nearby: setting volume to ${volume} (distance: ${distance})`
            );

            // Ensure the sound is playing
            if (!generatorSound.isPlaying) {
              generatorSound.play();
            }

            generatorSound.setVolume(volume);
            activeVolumeSet = true;
          }
        }
      });

      if (!activeVolumeSet && generatorSound.isPlaying) {
        console.log("No audible generators nearby, volume set to 0");
        generatorSound.setVolume(0); // No audible generators
      }
    }

    return null;
  }
}

// Event listener untuk tombol E (interaksi)
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyE") {
    const closestGenerator = checkGeneratorProximity();
    if (closestGenerator) {
      const index = closestGenerator.index;
      const promptElement = document.getElementById("interactionPrompt");

      // Toggle status generator
      generatorStatus[index] = !generatorStatus[index];

      // Visual feedback animation for the prompt
      promptElement.style.transform = "translateX(-50%) scale(1.1)";
      setTimeout(() => {
        promptElement.style.transform = "translateX(-50%) scale(0.95)";
      }, 100);
      if (generatorStatus[index]) {
        console.log(`Generator ${index + 1} diaktifkan!`);

        // Tambahkan visual feedback saat generator aktif
        promptElement.style.border = "2px solid #00ff00";
        promptElement.style.boxShadow = "0 0 15px rgba(0, 255, 0, 0.6)";
        promptElement.innerHTML =
          '<span style="color: #00ff00;">[E]</span> Generator Aktif';

        // Pastikan audio sudah dimuat sebelum memutar
        if (isAudioLoaded) {
          // Jika tidak sedang diputar, putar ulang
          if (!generatorSound.isPlaying) {
            generatorSound.play();
          }

          // Audio sudah diplay di awal, hanya perlu mengatur volume
          const distance = controls
            .getObject()
            .position.distanceTo(closestGenerator.position);
          const volume = Math.min(1.0, 1 - distance / 5); // Pastikan volume tidak melebihi 1.0

          console.log(
            `Setting generator sound volume to: ${volume} (distance: ${distance})`
          );
          generatorSound.setVolume(volume);
        } else {
          console.warn("Audio not loaded yet, cannot play generator sound");
        }

        // Reset visual style after feedback
        setTimeout(() => {
          if (generatorStatus[index]) {
            promptElement.style.border = "2px solid #ff6600";
            promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Nonaktifkan Generator';
          }
        }, 1000);
      } else {
        console.log(`Generator ${index + 1} dinonaktifkan!`);

        // Visual feedback for deactivation
        promptElement.style.border = "2px solid #ff0000";
        promptElement.style.boxShadow = "0 0 15px rgba(255, 0, 0, 0.6)";
        promptElement.innerHTML =
          '<span style="color: #ff0000;">[E]</span> Generator Nonaktif';

        // Gradually reduce volume if audio is loaded
        if (isAudioLoaded) {
          const fadeInterval = setInterval(() => {
            const currentVolume = generatorSound.getVolume();
            if (currentVolume > 0.05) {
              generatorSound.setVolume(currentVolume - 0.05);
              console.log(
                `Fading out generator sound: ${currentVolume - 0.05}`
              );
            } else {
              generatorSound.setVolume(0);
              clearInterval(fadeInterval);
              console.log("Generator sound volume set to 0");
            }
          }, 50);
        }

        // Reset UI after feedback
        setTimeout(() => {
          if (!generatorStatus[index]) {
            promptElement.style.border = "2px solid #ff6600";
            promptElement.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.4)";
            promptElement.innerHTML =
              '<span style="color: #ff6600;">[E]</span> Aktifkan Generator';
          }
        }, 1000);
      }
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

// Load 5 generators with random positions
const generatorLoader = new GLTFLoader();
generatorLoader.load(
  "./public/generator.glb",
  (gltf) => {
    const generatorModel = gltf.scene;

    // Create 5 generators at random positions
    const generatorPositions = [
      { x: 5, y: 0.5, z: -10 }, // Position of the first generator
      { x: 22, y: 0.5, z: -20 }, // Other generators at random positions
      { x: -14, y: 0.5, z: -25 }, // across the map
      { x: 15, y: 0.5, z: 25 },
      { x: -20, y: 0.5, z: 25 },
    ];

    // Create and add each generator
    generatorPositions.forEach((pos, index) => {
      const generatorInstance = generatorModel.clone();

      // Add slight randomization to positions
      const randomOffset = Math.random() * 3 - 1.5; // Between -1.5 and 1.5
      pos.x += randomOffset;
      pos.z += randomOffset; // Position the generator and add to scene
      generatorInstance.position.set(pos.x, pos.y, pos.z);
      generatorInstance.scale.set(0.01, 0.01, 0.01);
      generatorInstance.rotation.y = Math.random() * Math.PI * 2; // Random rotation
      scene.add(generatorInstance); // Simpan referensi generator untuk interaksi
      generatorObjects.push(generatorInstance);
      generatorStatus[index] = false; // Set status awal ke nonaktif

      // Add collision detection for generator
      const generatorBox = new THREE.Box3().setFromObject(generatorInstance);
      generatorBox.expandByVector(new THREE.Vector3(0.5, 2, 0.5)); // Add buffer
      graveCollisionBoxes.push(generatorBox); // Use same collision system as graves

      console.log(
        `Generator ${index + 1} loaded successfully at position:`,
        generatorInstance.position
      );
    });
  },
  undefined,
  (error) => {
    console.error("Error loading generator assets:", error);
  }
);

// --- TREE SPAWNING WITH SPACING AND COLLISION ---
const treeTypes = [
  { file: "./public/ancient_tree.glb", count: 65, scale: [0.007, 0.007, 0.007] },
  // { file: "./public/oak_tree.glb", count: 25, scale: [5, 5, 5] },
  { file: "./public/tree_1.glb", count: 75, scale: [0.4, 0.5, 0.4] },
];

const treeLoader = new GLTFLoader();
const treeAreaMargin = 4; // Hindari area tengah dan objek penting
const minTreeDistance = 6; // Minimal jarak antar pohon

// Kumpulkan posisi objek penting (generator, campfire, bangunan, grave, bangunan hancur)
const importantBoxes = [];
// Generator
function addImportantBoxFromObject(obj) {
  if (!obj) return;
  const box = new THREE.Box3().setFromObject(obj);
  importantBoxes.push(box);
}
generatorObjects.forEach(addImportantBoxFromObject);
// Campfire
let campfireBox = null;
if (typeof campfireModel !== 'undefined') {
  campfireBox = new THREE.Box3().setFromObject(campfireModel);
  importantBoxes.push(campfireBox);
}
// Bangunan hancur
let bangunanHancurBox = null;
if (typeof bangunanHancurModel !== 'undefined') {
  bangunanHancurBox = new THREE.Box3().setFromObject(bangunanHancurModel);
  importantBoxes.push(bangunanHancurBox);
}
// Graveyard
for (const box of graveCollisionBoxes) {
  importantBoxes.push(box.clone());
}

// Simpan posisi tree yang sudah ditempatkan
const placedTreePositions = [];

function isFarFromOtherTrees(x, z) {
  for (const pos of placedTreePositions) {
    const dx = x - pos.x;
    const dz = z - pos.z;
    if (Math.sqrt(dx * dx + dz * dz) < minTreeDistance) return false;
  }
  return true;
}

function isFarFromImportantObjects(x, z) {
  const testPoint = new THREE.Vector3(x, 0, z);
  for (const box of importantBoxes) {
    if (box.containsPoint(testPoint)) return false;
    // Buffer: jika terlalu dekat dengan bounding box
    const expandBox = box.clone().expandByScalar(2.5);
    if (expandBox.containsPoint(testPoint)) return false;
  }
  return true;
}

function getRandomTreePositionSafe() {
  let x, z, tries = 0;
  const playerSpawn = { x: 0, z: 15, radius: 5 };
  let valid = false;
  while (!valid && tries < 200) {
    x = Math.random() * (mapBoundary * 2) - mapBoundary;
    z = Math.random() * (mapBoundary * 2) - mapBoundary;
    tries++;
    const distToSpawn = Math.sqrt((x - playerSpawn.x) ** 2 + (z - playerSpawn.z) ** 2);
    valid =
      (Math.abs(x) >= treeAreaMargin || Math.abs(z) >= treeAreaMargin) &&
      (x <= -10 || x >= 10 || z <= 5 || z >= 15) &&
      isFarFromOtherTrees(x, z) &&
      isFarFromImportantObjects(x, z) &&
      distToSpawn >= playerSpawn.radius;
  }
  // Jika gagal dapat posisi valid setelah 200 kali, spawn saja di posisi random di pinggir map
  if (!valid) {
    x = (Math.random() < 0.5 ? -1 : 1) * (mapBoundary - 2);
    z = (Math.random() < 0.5 ? -1 : 1) * (mapBoundary - 2);
  }
  return { x, y: 0, z };
}

treeTypes.forEach((treeType) => {
  treeLoader.load(
    treeType.file,
    (gltf) => {
      for (let i = 0; i < treeType.count; i++) {
        const tree = gltf.scene.clone();
        const pos = getRandomTreePositionSafe();
        tree.position.set(pos.x, pos.y, pos.z);
        tree.scale.set(...treeType.scale);
        tree.rotation.y = Math.random() * Math.PI * 2;
        scene.add(tree);
        placedTreePositions.push({ x: pos.x, z: pos.z });
        // Tambahkan collision box hanya pada batang (trunk) jika ada
        let treeBox = null;
        let trunk = tree.getObjectByName('trunk') || tree.getObjectByName('Trunk') || tree.getObjectByName('batang');
        if (trunk) {
          treeBox = new THREE.Box3().setFromObject(trunk);
        } else {
          // Jika tidak ada trunk, gunakan bounding box model tapi diperkecil pada X dan Z
          treeBox = new THREE.Box3().setFromObject(tree);
          const center = new THREE.Vector3();
          treeBox.getCenter(center);
          const size = new THREE.Vector3();
          treeBox.getSize(size);
          // Perkecil X dan Z (hanya batang)
          size.x *= 0.3;
          size.z *= 0.3;
          treeBox.min.x = center.x - size.x / 2;
          treeBox.max.x = center.x + size.x / 2;
          treeBox.min.z = center.z - size.z / 2;
          treeBox.max.z = center.z + size.z / 2;
        }
        graveCollisionBoxes.push(treeBox);
      }
      console.log(`${treeType.file} loaded and scattered as forest`);
    },
    undefined,
    (error) => {
      console.error(`Error loading tree asset ${treeType.file}:`, error);
    }
  );
});
// --- END TREE SPAWNING ---

// --- STREET LAMP SPAWNING WITH LIGHT & COLLISION ---
const streetLampLoader = new GLTFLoader();
const streetLampCount = 5;
const streetLampScale = [1.7, 1.7, 1.7];
const placedLampPositions = [];

function isFarFromOtherLamps(x, z) {
  for (const pos of placedLampPositions) {
    const dx = x - pos.x;
    const dz = z - pos.z;
    if (Math.sqrt(dx * dx + dz * dz) < 8) return false;
  }
  return true;
}

function getRandomLampPositionSafe() {
  let x, z, tries = 0;
  let valid = false;
  while (!valid && tries < 200) {
    x = Math.random() * (mapBoundary * 2) - mapBoundary;
    z = Math.random() * (mapBoundary * 2) - mapBoundary;
    tries++;
    valid =
      isFarFromOtherLamps(x, z) &&
      isFarFromOtherTrees(x, z) &&
      isFarFromImportantObjects(x, z);
  }
  if (!valid) {
    x = (Math.random() < 0.5 ? -1 : 1) * (mapBoundary - 3);
    z = (Math.random() < 0.5 ? -1 : 1) * (mapBoundary - 3);
  }
  return { x, y: 0, z };
}

streetLampLoader.load(
  './public/standart_street_lamp.glb',
  (gltf) => {
    for (let i = 0; i < streetLampCount; i++) {
      const lamp = gltf.scene.clone();
      const pos = getRandomLampPositionSafe();
      lamp.position.set(pos.x, pos.y, pos.z);
      lamp.scale.set(...streetLampScale);
      lamp.rotation.y = Math.random() * Math.PI * 2;
      scene.add(lamp);
      placedLampPositions.push({ x: pos.x, z: pos.z });
      // Tambahkan collision box hanya pada tiang lampu (trunk/pole)
      let lampBox = null;
      let pole = lamp.getObjectByName('trunk') || lamp.getObjectByName('Trunk') || lamp.getObjectByName('pole') || lamp.getObjectByName('Pole');
      if (pole) {
        lampBox = new THREE.Box3().setFromObject(pole);
      } else {
        lampBox = new THREE.Box3().setFromObject(lamp);
        const center = new THREE.Vector3();
        lampBox.getCenter(center);
        const size = new THREE.Vector3();
        lampBox.getSize(size);
        size.x *= 0.25;
        size.z *= 0.25;
        lampBox.min.x = center.x - size.x / 2;
        lampBox.max.x = center.x + size.x / 2;
        lampBox.min.z = center.z - size.z / 2;
        lampBox.max.z = center.z + size.z / 2;
      }
      graveCollisionBoxes.push(lampBox);
      // Tambahkan lampu menyala di atas lampu jalan
      // Cari node "lamp_head" atau "Lamp_Head" jika ada, jika tidak pakai posisi paling atas
      let lampHead = lamp.getObjectByName('lamp_head') || lamp.getObjectByName('Lamp_Head');
      let lampLightPos;
      if (lampHead) {
        lampHead.updateWorldMatrix(true, false);
        lampLightPos = new THREE.Vector3();
        lampHead.getWorldPosition(lampLightPos);
      } else {
        // Ambil bounding box paling atas
        lampBox.getCenter(lampLightPos = new THREE.Vector3());
        lampLightPos.y = lampBox.max.y + 0.5;
      }
      const lampLight = new THREE.PointLight(0xfff2b0, 2.5, 7, 2);
      lampLight.position.copy(lampLightPos);
      lampLight.castShadow = false;
      scene.add(lampLight);
      // Tambahkan efek glow (optional):
      const lampGlow = new THREE.PointLight(0xfff2b0, 0.7, 5);
      lampGlow.position.copy(lampLightPos);
      scene.add(lampGlow);
    }
    console.log('Street lamps loaded and scattered around the map');
  },
  undefined,
  (error) => {
    console.error('Error loading street lamp asset:', error);
  }
);
// --- END STREET LAMP SPAWNING ---

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
    handleGraveCollision(previousPos);

    // Check generator proximity for interaction and update cursor
    const closestGenerator = checkGeneratorProximity();

    // Update cursor dot color based on whether player is looking at a generator
    const cursorDot = document.getElementById("cursorDot");
    if (closestGenerator) {
      // Change cursor color when looking at interactive object
      cursorDot.style.backgroundColor = "#ff6600";
      cursorDot.style.boxShadow = "0 0 5px rgba(255, 102, 0, 0.8)";
      cursorDot.style.width = "8px";
      cursorDot.style.height = "8px";
    } else {
      // Reset to default when not looking at anything interactive
      cursorDot.style.backgroundColor = "white";
      cursorDot.style.boxShadow = "none";
      cursorDot.style.width = "6px";
      cursorDot.style.height = "6px";
    }
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

// Add campfire
const campfireLoader = new GLTFLoader();
campfireLoader.load(
  "./public/campfire.glb",
  (gltf) => {
    const campfireModel = gltf.scene;
    campfireModel.position.set(0, 0, 10); // Place the campfire where the sofa was
    campfireModel.scale.set(2, 2, 2); // Adjust scale as needed
    scene.add(campfireModel);

    // Add a flickering point light for the campfire
    const campfireLight = new THREE.PointLight(0xff6600, 2, 10);
    campfireLight.position.set(0, 1, 10); // Slightly above the campfire
    scene.add(campfireLight);

    // Create a flickering effect for the campfire light
    function animateCampfire() {
      // Random intensity between 1.5 and 2.5
      campfireLight.intensity = 1.5 + Math.random();
      setTimeout(animateCampfire, 1000 + Math.random() * 150);
    }
    animateCampfire();

    // Add collision detection for campfire
    const campfireBox = new THREE.Box3().setFromObject(campfireModel);
    campfireBox.expandByVector(new THREE.Vector3(0.5, 2, 0.5)); // Add buffer
    graveCollisionBoxes.push(campfireBox); // Use same collision system as graves

    console.log("Campfire loaded successfully");
  },
  undefined,
  (error) => {
    console.error("Error loading campfire asset:", error);
  }
);

// Tambahkan bangunan hancur
const bangunanHancurLoader = new GLTFLoader();
bangunanHancurLoader.load(
  "./public/bangunan_hancur.glb",
  (gltf) => {
    const bangunanHancurModel = gltf.scene;
    // Posisikan bangunan hancur di sisi berlawanan dari makam
    bangunanHancurModel.position.set(20, 0, -10);
    // Sesuaikan ukuran bangunan hancur
    bangunanHancurModel.scale.set(0.5, 0.5, 0.5);
    // Rotasi agar tampak lebih alami
    bangunanHancurModel.rotation.y = Math.PI / 2; // Rotasi 45 derajat
    scene.add(bangunanHancurModel);

    // Buat bounding box untuk collision detection
    const bangunanHancurBox = new THREE.Box3().setFromObject(
      bangunanHancurModel
    );
    bangunanHancurBox.expandByVector(new THREE.Vector3(0.5, 2, 0.5)); // Tambahkan buffer
    graveCollisionBoxes.push(bangunanHancurBox); // Gunakan sistem collision yang sama dengan makam

    console.log("Bangunan hancur loaded successfully");
  },
  undefined,
  (error) => {
    console.error("Error loading bangunan hancur asset:", error);
  }
);
