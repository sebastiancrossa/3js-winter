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

//Array of stars
const stars = []

//Initial set of stars
for (let index = 0; index < 200; index++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  cube.position.x = Math.floor((Math.random() * 200) - 50)
  cube.position.y = Math.floor((Math.random() * 150) - 75)
  stars.push(cube)
  scene.add(cube)
}

//Yellow cube in the middle
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(20, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(cube)

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

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

const tick = () => {
  //move stars
  for (let index = 0; index < stars.length; index++) {
    const star = stars[index];
    star.position.x = star.position.x - 0.5
    if (star.position.x < -100) {
      scene.remove(star)
      const i = stars.indexOf(star)
      stars.splice(i, 1)
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      cube.position.x = 100
      cube.position.y = Math.floor((Math.random() * 150) - 75)
      stars.push(cube)
      scene.add(cube)
    }
  }

  // render
  renderer.render(scene, camera);

  // call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
