import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'


// Scene
const scene = new THREE.Scene()


// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 2, 5)


// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000)
document.body.appendChild(renderer.domElement)


// Texture
const textureLoader = new THREE.TextureLoader()


// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})


// Controls
const controls = new OrbitControls(camera, renderer.domElement)


// Planet
const planetTexture = textureLoader.load('/earth_daymap.jpg')

const planetMaterial = new THREE.MeshStandardMaterial({
  map: planetTexture,
  color: 0xffffff
})

const planet = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  planetMaterial
)

scene.add(planet)


// Moon
const moonTexture = textureLoader.load('/moon.jpg')

const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture
})

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 32, 32),
  moonMaterial
)

scene.add(moon)


// Lights
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

// Directional Light (sunlight)
const sunLight = new THREE.DirectionalLight(0xffffff, 2)
sunLight.position.set(5, 5, 5)


// Shadows
sunLight.castShadow = true

sunLight.shadow.mapSize.width = 1024
sunLight.shadow.mapSize.height = 1024

scene.add(sunLight)


renderer.shadowMap.enabled = true

// Planet
planet.castShadow = true
planet.receiveShadow = true

// Moon
moon.castShadow = true
moon.receiveShadow = true

// Sun
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.3),
  new THREE.MeshBasicMaterial({ color: 0xffffaa })
)

sunMesh.position.copy(sunLight.position)
scene.add(sunMesh)


// Model (tree)
const loader = new GLTFLoader()

loader.load('/low_poly_tree.glb', (gltf) => {
  const model = gltf.scene

  model.scale.set(0.06, 0.06, 0.06)

  // rotation
  model.rotation.set(0, 0, 0)

  // rotates the model so the front faces the positive Z-axis
  model.rotateY(-Math.PI / 2)

  // bounding box
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model)
  const height = box.max.y - box.min.y

  // move the model so the bottom of the tree is at y=0
  model.position.y = height / 2

  // pivot - allows the tree to rotate around its base instead of its center
  const pivot = new THREE.Group()
  pivot.position.set(0, 0.5, 0)

  pivot.add(model)

  planet.add(pivot)
})


// Stars
const starGeometry = new THREE.BufferGeometry()
const starCount = 1000

const positions = []

for (let i = 0; i < starCount; i++) {
  positions.push(
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 200
  )
}

starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
)

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5
})

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)


// Animations
function animate() {
  requestAnimationFrame(animate)

  // Planet rotation
  planet.rotation.y += 0.002

  // Stars rotation
  stars.rotation.y += 0.0005

  // Sun orbit
  sunLight.position.x = Math.sin(Date.now() * 0.001) * 5
  sunLight.position.z = Math.cos(Date.now() * 0.001) * 5

  sunMesh.position.copy(sunLight.position)

  // Moon orbit
  const time = Date.now() * 0.001
  moon.position.x = Math.cos(time) * 3
  moon.position.z = Math.sin(time) * 3

  renderer.render(scene, camera)
}

animate()