import React, { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export default function CustomModelLoader({
  url,
  file,
  wireframe = false,
  onLoaded,
}) {
  const [modelScene, setModelScene] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    let objectUrl = null;

    if (file) {
      objectUrl = URL.createObjectURL(file);
    } else if (url) {
      objectUrl = url;
    }

    if (!objectUrl) return;

    loader.load(
      objectUrl,
      (gltf) => {
        const scene = gltf.scene;

        // Normalize scale and position
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target height ~1.68m
        const targetHeight = 1.68;
        const scale = size.y > 0 ? targetHeight / size.y : 1;

        scene.scale.setScalar(scale);
        scene.position.x = -center.x * scale;
        scene.position.y = -box.min.y * scale - 0.84;
        scene.position.z = -center.z * scale;

        // Enable shadows and apply wireframe if needed
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (wireframe && child.material) {
              child.material.wireframe = true;
            }
          }
        });

        setModelScene(scene);
        if (onLoaded) onLoaded(gltf);
      },
      undefined,
      (err) => {
        console.error("Error loading custom model:", err);
        setError(err.message);
      },
    );

    return () => {
      if (file && objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url, file, wireframe]);

  if (error) {
    return null;
  }

  return modelScene ? <primitive object={modelScene} /> : null;
}
