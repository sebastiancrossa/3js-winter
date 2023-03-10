import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Initial stars
const stars = [];

for (let index = 0; index < 800; index++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      specular: 0xffffff,
      shininess: 10,
    })
  );

  cube.position.x = Math.floor(Math.random() * 600);
  cube.position.y = Math.floor(Math.random() * 600 - 250);
  cube.position.z = Math.floor(Math.random() * 600 - 250);

  stars.push(cube);
  scene.add(cube);
}

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.set(0, 0, 100);
scene.add(camera);

/**
 * Orbit Controls
 * */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = false;
controls.enableZoom = false;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.render(scene, camera);

let loadedModel;
let tween;
const loader = new GLTFLoader();
let isKeyDown = false;
const cameraOffset = new THREE.Vector3(50.0, 20.0, 80.0);

loader.load("/models/ship.glb", (gltf) => {
  loadedModel = gltf;

  gltf.scene.scale.set(6, 6, 6);
  gltf.scene.rotation.reorder("YXZ");
  gltf.scene.rotation.y = Math.PI / 2;

  // receive shadows
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // create a point light and position it close to the ship
  const pointLight = new THREE.PointLight(0xffea00, 10, 0);
  pointLight.position
    .copy(gltf.scene.position)
    .add(new THREE.Vector3(10, 10, 10));

  // add the point light to the scene
  scene.add(pointLight);

  scene.add(gltf.scene);
  camera.position.copy(gltf.scene.position).add(cameraOffset);
  camera.lookAt(gltf.scene.position);
});

document.addEventListener("keydown", (event) => {
  const keyName = event.key;
  isKeyDown = true;

  if (keyName === "ArrowUp") {
    if (tween) tween.stop();

    tween = new TWEEN.Tween()
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        loadedModel.scene.position.y += 0.3;
        camera.position.y += 0.3;
        camera.lookAt(loadedModel.scene.position);
        loadedModel.scene.rotation.x -= 0.001;
      })
      .start();
  } else if (keyName === "ArrowDown") {
    if (tween) tween.stop();

    tween = new TWEEN.Tween()
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        loadedModel.scene.position.y -= 0.3;
        camera.position.y -= 0.3;
        camera.lookAt(loadedModel.scene.position);
        loadedModel.scene.rotation.x += 0.001;
      })
      .start();
  }
});

// stop tween on keyup
document.addEventListener("keyup", () => {
  if (tween) tween.stop();
  isKeyDown = false;

  tween = new TWEEN.Tween()
    .duration(10000000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      loadedModel.scene.rotation.x = 0;
      camera.position.copy(loadedModel.scene.position).add(cameraOffset);
      camera.lookAt(loadedModel.scene.position);
    })
    .start();
});

const clock = new THREE.Clock();

const tick = () => {
  for (let index = 0; index < stars.length; index++) {
    const star = stars[index];
    star.position.x = star.position.x - 2;

    if (star.position.x < -300) {
      scene.remove(star);

      const i = stars.indexOf(star);
      stars.splice(i, 1);

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          specular: 0xffffff,
          shininess: 10,
        })
      );

      cube.position.x = loadedModel.scene.position.x + 300;
      cube.position.y =
        loadedModel.scene.position.y + Math.floor(Math.random() * 600 - 250);
      cube.position.z =
        loadedModel.scene.position.z + Math.floor(Math.random() * 600 - 250);

      stars.push(cube);
      scene.add(cube);
    }
  }

  // Update controls
  controls.update();

  // Update tween
  TWEEN.update();

  // render
  renderer.render(scene, camera);

  if (loadedModel) {
    if (!isKeyDown) {
      loadedModel.scene.rotation.x =
        Math.sin(clock.getElapsedTime() * 1.1) * 0.1;
      loadedModel.scene.rotation.z =
        Math.sin(clock.getElapsedTime() * 1.1) * 0.1;
    }
  }

  // call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
