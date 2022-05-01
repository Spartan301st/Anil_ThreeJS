import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";

// refactor to its own module later
import { projects, contacts } from "./projects";
// for projects start
const projectsContainer = document.querySelector("#projects");
projects.forEach((project) => {
  const { name, url, img } = project;
  projectsContainer.innerHTML += `
  <div class="projs-thumbnails">
    <a href="${url}">
      <img src="${img}" alt="${name}">
    </a>
  </div>
  `;
});
// for projects end
// for contacts
const contactsContainer = document.querySelector("#contacts");
contacts.forEach((contact) => {
  const { name, url, img } = contact;
  contactsContainer.innerHTML += `
  <div class="conts-thumbnails">
    <a href="${url}">
      <img src="${img}" alt="${name}">
    </a>
  </div>
  `;
});

// refactor to its own module later
/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#d0ea71",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

// Textures
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// declaring some materials
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

/**
 * Meshes
 */
const objectsDistance = 4;
// creating some meshes for our scene
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 64), material);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

let allMeshes = [mesh1, mesh2, mesh3];
allMeshes.forEach((mesh) => {
  allMeshes.indexOf(mesh) % 2 === 0
    ? (mesh.position.x = 2)
    : (mesh.position.x = -2);
  // console.log(allMeshes.indexOf(mesh));
});

// mesh1.position.x = -2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */
// Geometry \\
// total number of particles
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
// randomly placing the particles
for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
// Material \\
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});
// Mesh \\
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
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

/**
 * Camera
 */

// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
// scene.add(camera);
// adding camera to the group and not directly on the scene
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
// same as setting alpha above
// renderer.setClearAlpha(1);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
// for tracking the section scrolled
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  // calculating whether we are in a new section
  let newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    currentSection = newSection;
    // using the gsap library to add a twist effect to the objects
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }

  // console.log(newSection);
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;
// listening for mouse move
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
  // console.log(cursor);
});
/**
 * Animate
 */
const clock = new THREE.Clock();
let prevTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  // Animate/move the camera as you scroll divided by the viewport height and bultiplied by the distance between sections
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate meshes
  sectionMeshes.forEach((mesh) => {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
    // mesh.rotation.x = elapsedTime * 0.1;
    // mesh.rotation.y = elapsedTime * 0.12;
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// so far we created websites entirely based on webgl/threeJS, where canvas covered the whole screen.
// now however will integrate it to a classic website's background
// passing position fixed to canvas in css makes it stay on the background
// Note that some users might experience a white page when they scroll further below and above, depending on their browsers. Instead of changing the background-color of the entire page to the same value, we can set alpha: true when declaring the webgl renderer, which is 0 by def
// remeber that meshToonMaterial only is visible when there is a light source available
// we can add shades to MeshToonMaterial by the gradient images provided
// When the MeshToonMaterial receives light it tries to apply the gradient jpg file that we pass to it, which is a very small px image. By default WebGL/Three.js will merge the contrast colors and blend them to create one common color that is applied as a texture. If our goal is to apply the instant color change we should assing NearestFilter to the magFilter prop of the loaded texture
// In three.js field of view is vertical. If you put one object at the top and one at the bottom and then resize the window, objs will stay at the top and bottom. So we don't have to constantly reconfigure the scene for the objects visibility
// Note that to move the camera down while scrolling we should listen for scroll event and save the value of window scroll on each scroll. The nin tick function we should modify the position of our camera to that value's negative
// Note also that we defined distance between objects to be 4 which is equivalent to 1 viewport, but when we scroll camera moves too fast, so we need to calculate the camera speed mathematically.
// Parallax - action of seeing one object through different observation points. Naturally done by our eyes, and feel the depth of things.
// We can apply the parallax effect by making the camera move horiz and vert when we move the mouse by tracking clientX & clientY vals
// as we have already applied the scroll effect on the camera we won't be able to apply the parallax effect on it. For that we can put the camera within a group and apply the parallax effect on the group on the tick function and retain the scroll on the camera.
// We need to add an easing/smoothing/lerping effect to the parallax.
// On high freq screens, the tick function would be called more often resulting in camera moving faster towards the target. It's prefferable to have the same result across all devices whether they are high or low freq. 1st we should know how much time has passed since the last frame render, delta time. Next we have to multiply the camera position by that delta val, but as delta val is very small (0.016sec for 60fps screens) we have to multiply the whole val by larger val
// Adding some particles on the background will add a depth effect.
