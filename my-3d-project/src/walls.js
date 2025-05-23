// Enhanced wall configuration for a more immersive environment
// This file contains a comprehensive configuration array for placing brick walls
// throughout the 3D environment with strategic placement for gameplay and aesthetics

// Import necessary Three.js modules
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Function to add brick and stone walls to the scene
 * @param {THREE.Scene} scene - The Three.js scene to add walls to
 * @param {Array} collisionBoxes - Array to store collision boxes
 */
export function addBrickWalls(scene, collisionBoxes) {
  // Load wall model
  const wallLoader = new GLTFLoader();
  wallLoader.load(
    "./public/brick_and_stone_wall.glb",
    (gltf) => {
      const wallModel = gltf.scene; // Comprehensive array configuration for wall positions
      const wallConfigurations = [
        // ===== CAMPFIRE AREA - SEMI-ENCLOSED REST AREA =====
        // Main campfire perimeter walls - reconfigured to only use 0 and Math.PI/2 rotations
        { position: { x: 5, y: 0, z: 17 }, rotation: 0, scale: 1.5 },
        {
          position: { x: -19, y: 0, z: 18 },
          rotation: Math.PI / 2,
          scale: 1.5,
        },
        {
          position: { x: -19, y: 0, z: 25 },
          rotation: Math.PI / 2,
          scale: 1.5,
        },
        // { position: { x: -8, y: 0, z: 12 }, rotation: Math.PI / 2, scale: 1.5 },
        // Additional walls to create seating areas around campfire
        // { position: { x: 0, y: 0, z: 18 }, rotation: 0, scale: 1.3 },
        // { position: { x: 3, y: 0, z: 17 }, rotation: 0, scale: 1.3 },
        // { position: { x: -3, y: 0, z: 17 }, rotation: 0, scale: 1.5 },
        // // ===== GRAVEYARD AREA - BOUNDARY WALLS =====
        // Main perimeter
        { position: { x: -22, y: 0, z: -10 }, rotation: 0, scale: 1.5 },
        {
          position: { x: -22, y: 0, z: -18 },
          rotation: Math.PI / 2,
          scale: 1.5,
        },
        { position: { x: -22, y: 0, z: -25 }, rotation: 0, scale: 1.5 },
        // {
        //   position: { x: -20, y: 0, z: -22 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        // },
        // {
        //   position: { x: -17, y: 0, z: -22 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        // },
        // {
        //   position: { x: -14, y: 0, z: -22 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        // },
        // // Additional graveyard boundary walls for a more enclosed feel
        // {
        //   position: { x: -12, y: 0, z: -22 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        // },
        // {
        //   position: { x: -10, y: 0, z: -22 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        // },
        // { position: { x: -22, y: 0, z: -12 }, rotation: 0, scale: 1.2 },
        // { position: { x: -21, y: 0, z: -10 }, rotation: 0, scale: 1.2 }, // ===== GENERATOR AREAS - PROTECTIVE BARRIERS =====
        // // Generator area 1 (near x:5, z:-10)
        // { position: { x: 7, y: 0, z: -12 }, rotation: 0, scale: 1.3 },
        // { position: { x: 3, y: 0, z: -12 }, rotation: 0, scale: 1.3 },
        // { position: { x: 8, y: 0, z: -8 }, rotation: Math.PI / 2, scale: 1.3 },
        // { position: { x: 2, y: 0, z: -8 }, rotation: Math.PI / 2, scale: 1.3 },

        // // Generator area 2 (near x:22, z:-20)
        // {
        //   position: { x: 24, y: 0, z: -18 },
        //   rotation: Math.PI / 2,
        //   scale: 1.3,
        // },
        // {
        //   position: { x: 20, y: 0, z: -18 },
        //   rotation: Math.PI / 2,
        //   scale: 1.3,
        // },

        // // Generator area 3 (near x:-14, z:-25)
        // { position: { x: -12, y: 0, z: -27 }, rotation: 0, scale: 1.3 },
        // { position: { x: -16, y: 0, z: -27 }, rotation: 0, scale: 1.3 },

        // // Generator area 4 (near x:15, z:25)
        // { position: { x: 17, y: 0, z: 23 }, rotation: Math.PI / 2, scale: 1.3 },
        // { position: { x: 13, y: 0, z: 23 }, rotation: Math.PI / 2, scale: 1.3 },

        // // Generator area 5 (near x:-20, z:25)
        // { position: { x: -18, y: 0, z: 27 }, rotation: 0, scale: 1.3 },
        // { position: { x: -22, y: 0, z: 27 }, rotation: 0, scale: 1.3 }, // ===== DESTROYED BUILDING AREA - COLLAPSED WALLS =====
        // // Main collapsed structure walls - adjusted for straight orientation
        // {
        //   position: { x: 23, y: -0.3, z: -8 },
        //   rotation: 0,
        //   scale: 1.4,
        //   scaleY: 0.8,
        // },
        // {
        //   position: { x: 17, y: -0.5, z: -13 },
        //   rotation: 0,
        //   scale: 1.2,
        //   scaleY: 0.6,
        // },
        // {
        //   position: { x: 22, y: -0.4, z: -13 },
        //   rotation: Math.PI / 2,
        //   scale: 1.3,
        //   scaleY: 0.7,
        // },
        // // Additional destroyed walls with more dramatic collapse
        // {
        //   position: { x: 19, y: -0.6, z: -15 },
        //   rotation: 0,
        //   scale: 1.4,
        //   scaleY: 0.4,
        // },
        // {
        //   position: { x: 25, y: -0.2, z: -11 },
        //   rotation: Math.PI / 2,
        //   scale: 1.5,
        //   scaleY: 0.9,
        // },
        // {
        //   position: { x: 21, y: -0.7, z: -9 },
        //   rotation: 0,
        //   scale: 1.3,
        //   scaleY: 0.5,
        // },
        // {
        //   position: { x: 18, y: 0, z: -6 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        //   scaleY: 0.3,
        // }, // ===== DECORATIVE WALLS THROUGHOUT THE MAP =====
        // // General decorative elements
        // { position: { x: 15, y: 0, z: 15 }, rotation: 0, scale: 1.3 },
        // {
        //   position: { x: -15, y: 0, z: 20 },
        //   rotation: Math.PI / 2,
        //   scale: 1.4,
        // },
        // { position: { x: -10, y: 0, z: -5 }, rotation: 0, scale: 1.2 },
        // { position: { x: 20, y: 0, z: 5 }, rotation: Math.PI / 2, scale: 1.3 },

        // // Center area decorative elements
        // { position: { x: 5, y: 0, z: 0 }, rotation: 0, scale: 1.2 },
        // { position: { x: -5, y: 0, z: 0 }, rotation: 0, scale: 1.2 },
        // { position: { x: 0, y: 0, z: 5 }, rotation: 0, scale: 1.2 },
        // { position: { x: 0, y: 0, z: -5 }, rotation: 0, scale: 1.2 },

        // // Random scattered walls for more environment details
        // { position: { x: 12, y: 0, z: -15 }, rotation: 0, scale: 1.1 },
        // { position: { x: -8, y: 0, z: 18 }, rotation: Math.PI / 2, scale: 1.2 },
        // { position: { x: 25, y: 0, z: 15 }, rotation: 0, scale: 1.3 },
        // { position: { x: -25, y: 0, z: 5 }, rotation: Math.PI / 2, scale: 1.4 },
        // { position: { x: 8, y: 0, z: -25 }, rotation: 0, scale: 1.2 }, // ===== BOUNDARY WALLS FOR SPECIFIC AREAS =====
        // // Structural boundary walls
        // {
        //   position: { x: -15, y: 0, z: -10 },
        //   rotation: Math.PI / 2,
        //   scale: 1.4,
        // },
        // {
        //   position: { x: -15, y: 0, z: -15 },
        //   rotation: Math.PI / 2,
        //   scale: 1.4,
        // },
        // { position: { x: 10, y: 0, z: -20 }, rotation: 0, scale: 1.3 },
        // { position: { x: 15, y: 0, z: -20 }, rotation: 0, scale: 1.3 },

        // // Path guiding walls
        // { position: { x: 5, y: 0, z: -5 }, rotation: 0, scale: 1.2 },
        // { position: { x: 10, y: 0, z: 0 }, rotation: Math.PI / 2, scale: 1.3 },
        // { position: { x: -10, y: 0, z: 10 }, rotation: 0, scale: 1.3 },
        // { position: { x: -5, y: 0, z: 5 }, rotation: Math.PI / 2, scale: 1.2 }, // ===== PARTIALLY DESTROYED/TILTED WALLS FOR ATMOSPHERE =====
        // // Various partially destroyed walls scattered around
        // {
        //   position: { x: -18, y: -0.3, z: 15 },
        //   rotation: 0,
        //   scale: 1.3,
        //   scaleY: 0.7,
        // },
        // {
        //   position: { x: 15, y: -0.4, z: -18 },
        //   rotation: Math.PI / 2,
        //   scale: 1.2,
        //   scaleY: 0.6,
        // },
        // {
        //   position: { x: 28, y: -0.3, z: 10 },
        //   rotation: 0,
        //   scale: 1.4,
        //   scaleY: 0.8,
        // },
        // {
        //   position: { x: -25, y: -0.2, z: -6 },
        //   rotation: Math.PI / 2,
        //   scale: 1.3,
        //   scaleY: 0.9,
        // },
        // {
        //   position: { x: 0, y: -0.5, z: -15 },
        //   rotation: 0,
        //   scale: 1.1,
        //   scaleY: 0.5,
        // },
      ];

      // Create each wall based on configuration
      wallConfigurations.forEach((config, index) => {
        // Create wall instance
        const wallInstance = index === 0 ? wallModel : wallModel.clone();

        // Set wall position
        wallInstance.position.set(
          config.position.x,
          config.position.y,
          config.position.z
        );

        // Set wall rotation
        wallInstance.rotation.y = config.rotation;

        // Set wall scale (special case for collapsed walls with different Y scale)
        if (config.scaleY !== undefined) {
          wallInstance.scale.set(config.scale, config.scaleY, config.scale);

          // Add slight random rotation for collapsed walls to look more natural
          if (config.scaleY < 1) {
            wallInstance.rotation.x = (Math.random() - 0.5) * 0.2;
            wallInstance.rotation.z = (Math.random() - 0.5) * 0.3;
          }
        } else {
          wallInstance.scale.set(config.scale, config.scale, config.scale);
        }

        // Add to scene
        scene.add(wallInstance);
        // Set shadow untuk semua mesh pada wall
        setShadowRecursively(wallInstance);

        // Create bounding box for collision detection
        const wallBox = new THREE.Box3().setFromObject(wallInstance);
        wallBox.expandByVector(new THREE.Vector3(0.5, 2, 0.5));
        collisionBoxes.push(wallBox);
      });

      console.log(
        "Brick and stone walls loaded successfully - total walls:",
        wallConfigurations.length
      );
    },
    undefined,
    (error) => {
      console.error("Error loading brick and stone wall asset:", error);
    }
  );
}

// Utility: Set castShadow & receiveShadow untuk semua mesh dalam objek (rekursif)
function setShadowRecursively(object, cast = true, receive = true) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
      // Untuk material transparan, aktifkan shadow
      if (child.material) {
        child.material.shadowSide = THREE.FrontSide;
      }
    }
  });
}
