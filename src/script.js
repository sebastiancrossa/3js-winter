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

for (let index = 0; index < 200; index++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );

  cube.position.x = Math.floor(Math.random() * 200 - 50);
  cube.position.y = Math.floor(Math.random() * 150 - 75);
  cube.position.z = Math.floor(Math.random() * 150 - 75);

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

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

let loadedModel;
let tween;
const loader = new GLTFLoader();

loader.load("/models/ship.glb", (gltf) => {
  loadedModel = gltf;

  gltf.scene.scale.set(6, 6, 6);
  gltf.scene.rotation.reorder("YXZ");
  gltf.scene.rotation.y = Math.PI / 2;

  scene.add(gltf.scene);
  camera.lookAt(gltf.scene.position);
});

document.addEventListener("keydown", (event) => {
  const keyName = event.key;

  if (keyName === "ArrowUp") {
    if (tween) tween.stop();

    tween = new TWEEN.Tween()
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        loadedModel.scene.position.y += 0.2;
        // loadedModel.scene.rotation.x -= 0.001;
      })
      .start();
  } else if (keyName === "ArrowDown") {
    if (tween) tween.stop();

    tween = new TWEEN.Tween()
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        loadedModel.scene.position.y -= 0.2;
        // loadedModel.scene.rotation.x += 0.001;
      })
      .start();
  }
});

// stop tween on keyup
document.addEventListener("keyup", (event) => {
  if (tween) tween.stop();

  tween = new TWEEN.Tween()
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      loadedModel.scene.rotation.x = 0;
    })
    .start();
});

// initiate clock
const clock = new THREE.Clock();

const tick = () => {
  for (let index = 0; index < stars.length; index++) {
    const star = stars[index];
    star.position.x = star.position.x - 0.9;

    if (star.position.x < -100) {
      scene.remove(star);

      const i = stars.indexOf(star);
      stars.splice(i, 1);

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );

      cube.position.x = 100;
      cube.position.y = Math.floor(Math.random() * 150 - 75);
      cube.position.z = Math.floor(Math.random() * 150 - 75);

      stars.push(cube);
      scene.add(cube);
    }
  }

  if (loadedModel) {
    loadedModel.scene.rotation.x = Math.sin(clock.getElapsedTime() * 1.3) * 0.1;
    loadedModel.scene.rotation.z = Math.sin(clock.getElapsedTime() * 1.3) * 0.3;
  }

  // Update controls
  controls.update();

  // Update tween
  TWEEN.update();

  // Update mixer
  // mixer.update(elapsedTime);

  // render
  renderer.render(scene, camera);

  // call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
