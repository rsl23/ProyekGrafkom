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

// Add a startup sound effect for generator
let startupSoundBuffer = null;
let isStartupSoundLoaded = false;

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

  // Try to load the startup sound
  const startupPaths = [
    "./public/suara_generator.mp3",
    "/public/suara_generator.mp3",
    "suara_generator.mp3",
    "./suara_generator.mp3",
  ];

  tryLoadAudio(possiblePaths, audioListener);
  tryLoadStartupSound(startupPaths, audioListener);

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

    if (!isStartupSoundLoaded) {
      console.warn("Startup sound failed to load, creating fallback");
      startupSoundBuffer = createStartupFallbackSound();
      isStartupSoundLoaded = true;
    }
  }, 5000);

  return {
    attachSoundToGenerator,
    updateGeneratorSounds,
    setGeneratorStatus,
    playGeneratorStartupSound,
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
 * Try loading startup sound from multiple possible paths
 */
function tryLoadStartupSound(paths, audioListener) {
  if (paths.length === 0) {
    console.error("All startup sound paths failed, will use fallback");
    startupSoundBuffer = createStartupFallbackSound();
    isStartupSoundLoaded = true;
    return;
  }

  const currentPath = paths[0];
  const remainingPaths = paths.slice(1);

  console.log(`Trying to load startup sound from: ${currentPath}`);
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load(
    currentPath,
    function (buffer) {
      startupSoundBuffer = buffer;
      isStartupSoundLoaded = true;
      console.log(`Generator startup sound loaded from: ${currentPath}`);
    },
    function (xhr) {
      if (xhr.loaded > 0) {
        console.log(
          `Startup sound loading from ${currentPath}: ${
            (xhr.loaded / xhr.total) * 100
          }%`
        );
      }
    },
    function (error) {
      console.error(`Error loading startup sound from ${currentPath}:`, error);

      // Try next path if available
      if (remainingPaths.length > 0) {
        console.log("Trying next startup sound path...");
        tryLoadStartupSound(remainingPaths, audioListener);
      } else {
        // If all paths fail, use fallback sound
        startupSoundBuffer = createStartupFallbackSound();
        isStartupSoundLoaded = true;
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
 * Create a fallback startup sound
 */
function createStartupFallbackSound() {
  const audioContext = THREE.AudioContext.getContext();
  const bufferSize = audioContext.sampleRate * 2; // 2 second buffer
  const buffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate
  );
  const channelData = buffer.getChannelData(0);

  // Generate a startup sound effect (increasing pitch plus mechanical sounds)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / audioContext.sampleRate;

    // Startup whine - increasing frequency over time
    const whineFreq = 100 + t * 300; // 100 to 400 Hz
    const whine = Math.sin(2 * Math.PI * whineFreq * t) * 0.3;

    // Mechanical clicking
    const click = Math.random() > 0.995 ? Math.random() * 0.8 : 0;

    // Engine rumble
    const rumble = Math.random() * 0.1 * Math.min(1.0, t * 2); // increase over time

    // Combine sounds with envelope
    let envelope = 0;
    if (t < 0.1) envelope = t * 10; // quick fade-in
    else if (t > 1.8) envelope = (2.0 - t) * 5; // fade-out at end
    else envelope = 1.0;

    // Combine all elements
    channelData[i] = (whine + click + rumble) * envelope * 0.7;
  }

  console.log("Created fallback generator startup sound");
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
 * Play the generator startup sound effect
 * @param {number} index - The generator index
 */
function playGeneratorStartupSound(index) {
  if (!isStartupSoundLoaded || !startupSoundBuffer) {
    console.warn("Startup sound not loaded yet");
    return;
  }

  // If we have a sound for this generator, attach startup sound to its position
  if (generatorSounds[index] && generatorSounds[index].parent) {
    const generator = generatorSounds[index].parent;
    const audioListener = generatorSounds[index].listener;

    // Create new non-looping sound for the startup effect
    const startupSound = new THREE.PositionalAudio(audioListener);
    startupSound.setBuffer(startupSoundBuffer);
    startupSound.setLoop(false);
    startupSound.setVolume(1.0);
    startupSound.setRefDistance(1);
    startupSound.setDistanceModel("exponential");
    startupSound.setRolloffFactor(0.8);
    startupSound.setMaxDistance(30); // Can hear startup from further away

    // Add to generator
    generator.add(startupSound);
    startupSound.play();

    // Remove the sound object after it's done playing
    setTimeout(() => {
      if (generator) {
        generator.remove(startupSound);
      }
    }, startupSoundBuffer.duration * 1000 + 100);

    console.log(`Playing startup sound for generator ${index}`);
  }
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
