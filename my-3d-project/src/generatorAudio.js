// Generator Audio System - Improved Version
// Import this file in main.js and replace the existing audio system

import * as THREE from "three";

// Dictionary to store audio sources for each generator
const generatorSounds = {};

// Dictionary to track generator active status
let generatorStatus = {};

// Audio preload status
let isAudioLoaded = false;
let audioBuffer = null;

/**
 * Initialize the audio system with an audio listener
 * @param {THREE.AudioListener} audioListener - The audio listener attached to the camera
 */
export function initAudioSystem(audioListener) {
  // Try to load the audio file from multiple possible paths
  const possiblePaths = [
    "./public/suara_generator.mp3",
    "/public/suara_generator.mp3",
    "suara_generator.mp3",
    "./suara_generator.mp3",
    "../public/suara_generator.mp3",
  ];

  tryLoadAudio(possiblePaths, audioListener);

  // Set up fallback if audio fails to load after 5 seconds
  setTimeout(() => {
    if (!isAudioLoaded) {
      console.warn(
        "Audio file failed to load after timeout, creating fallback sound"
      );
      audioBuffer = createFallbackSound();
      isAudioLoaded = true;
      console.log("Fallback sound created and ready to use");
    }
  }, 5000);

  return {
    attachSoundToGenerator,
    updateGeneratorSounds,
    setGeneratorStatus,
    getAudioLoadStatus: () => isAudioLoaded,
  };
}

/**
 * Try loading audio from multiple possible paths
 */
function tryLoadAudio(paths, audioListener) {
  if (paths.length === 0) {
    console.error("All audio paths failed, will fallback to generated sound");
    audioBuffer = createFallbackSound();
    isAudioLoaded = true;
    return;
  }

  const currentPath = paths[0];
  const remainingPaths = paths.slice(1);

  console.log(`Trying to load audio from: ${currentPath}`);
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load(
    currentPath,
    function (buffer) {
      audioBuffer = buffer;
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

      // Try next path if available
      if (remainingPaths.length > 0) {
        console.log("Trying next path...");
        tryLoadAudio(remainingPaths, audioListener);
      } else {
        // If all paths fail, use fallback sound
        audioBuffer = createFallbackSound();
        isAudioLoaded = true;
      }
    }
  );
}

/**
 * Create a fallback procedural sound if audio file loading fails
 */
function createFallbackSound() {
  const audioContext = THREE.AudioContext.getContext();
  const bufferSize = audioContext.sampleRate; // 1 second buffer
  const buffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate
  );
  const channelData = buffer.getChannelData(0);

  // Generate a simple generator sound (white noise + low frequency)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / audioContext.sampleRate;
    const noise = Math.random() * 0.1;
    const lowFreq = Math.sin(2 * Math.PI * 50 * t) * 0.05;
    const midFreq = Math.sin(2 * Math.PI * 120 * t) * 0.03;
    const modulation = 0.7 + 0.3 * Math.sin(2 * Math.PI * 4 * t);

    channelData[i] = (noise + lowFreq + midFreq) * modulation;
  }

  console.log("Created fallback generator sound");
  return buffer;
}

/**
 * Attach a positional audio source to a generator object
 * @param {THREE.Object3D} generator - The generator object
 * @param {number} index - The index of the generator
 * @param {THREE.AudioListener} audioListener - The audio listener
 */
function attachSoundToGenerator(generator, index, audioListener) {
  if (!isAudioLoaded || !audioBuffer) return false;

  // Create new positional audio for this generator
  const sound = new THREE.PositionalAudio(audioListener);
  sound.setBuffer(audioBuffer);
  sound.setLoop(true);
  sound.setVolume(0); // Start silent
  sound.setRefDistance(1);
  sound.setDistanceModel("exponential");
  sound.setRolloffFactor(0.8); // Lower for more gradual falloff
  sound.setMaxDistance(25);

  // Add sound to the generator object
  generator.add(sound);
  generatorSounds[index] = sound;

  console.log(`Attached sound to generator ${index}`);
  return true;
}

/**
 * Update all generator sounds based on player position
 * @param {THREE.Vector3} playerPosition - The current player position
 */
function updateGeneratorSounds(playerPosition) {
  if (!isAudioLoaded) return;

  Object.keys(generatorSounds).forEach((index) => {
    const sound = generatorSounds[index];
    const isActive = generatorStatus[index] === true;
    if (isActive) {
      // Get distance to generator
      const generator = sound.parent;
      const distance = playerPosition.distanceTo(generator.position);

      // Define maximum audible distance - beyond this distance no sound will be heard
      const maxAudibleDistance = 15; // Jarak maksimum dimana suara masih bisa terdengar

      if (distance <= maxAudibleDistance) {
        // Only play sound if within audible range
        if (!sound.isPlaying) {
          sound.play();
        }

        // Use inverse square law for volume
        const interactionRadius = 8; // Extended radius (adjusted from 1)
        const falloffFactor = 1.2; // Lower = slower falloff (more audible at distance)
        const normalizedDistance = Math.min(distance / interactionRadius, 1.0);
        const inverseSquareVolume =
          1.0 / (1.0 + falloffFactor * Math.pow(normalizedDistance, 2));

        // Calculate final volume with minimum threshold for distant sounds
        const minVolume = 0.05; // Minimum volume at edge of audible range
        const maxVolume = 1.0; // Maximum volume when very close
        const volume =
          minVolume + (maxVolume - minVolume) * inverseSquareVolume;

        sound.setVolume(volume);

        console.log(
          `Generator ${index} sound volume: ${volume.toFixed(
            2
          )} (distance: ${distance.toFixed(2)})`
        );
      } else {
        // If beyond audible range, stop sound completely
        if (sound.isPlaying) {
          sound.stop();
          console.log(
            `Generator ${index} sound stopped - too far away (${distance.toFixed(
              2
            )} units)`
          );
        }
      }
    } else {
      // If generator not active, stop sound
      if (sound.isPlaying) {
        sound.stop();
      }
    }
  });
}

/**
 * Update the active status of a generator
 * @param {number} index - The generator index
 * @param {boolean} active - Whether the generator is active
 */
function setGeneratorStatus(index, active) {
  generatorStatus[index] = active;

  // If we have a sound for this generator, handle it
  if (generatorSounds[index]) {
    const sound = generatorSounds[index];

    if (active) {
      if (!sound.isPlaying) {
        sound.play();
      }
    } else {
      // Gradually fade out
      const fadeInterval = setInterval(() => {
        const currentVolume = sound.getVolume();
        if (currentVolume > 0.05) {
          sound.setVolume(currentVolume - 0.05);
        } else {
          sound.stop();
          clearInterval(fadeInterval);
        }
      }, 50);
    }
  }
}
