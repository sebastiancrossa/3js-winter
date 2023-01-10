import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const group = new THREE.Group();
// scene.add(group);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
cube1.position.x = -1.5;

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
cube3.position.x = 1.5;

group.add(cube1);
group.add(cube2);
group.add(cube3);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

/**
 * Cursor
 * */
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

// Camera
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.set(0, 0, 10);

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

const loader = new GLTFLoader();
loader.load("/models/ship.glb", (gltf) => {
  gltf.scene.scale.set(0.5, 0.5, 0.5);
  scene.add(gltf.scene);
  camera.lookAt(gltf.scene.position);
});

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update objects
  group.rotation.y = Math.sin(elapsedTime * 0.1);
  group.rotation.x = Math.cos(elapsedTime * 0.1);

  // update camera
  camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 4;
  camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 4;
  camera.position.y = cursor.y * 10;
  camera.lookAt(group.position);

  // update controls
  controls.update();

  // render
  renderer.render(scene, camera);

  // call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
