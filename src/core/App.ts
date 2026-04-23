import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import World from '../scene/World'

export default class App {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  world: World

  constructor() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#dff1ff')

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0, 2, 6)

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.8)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight('#ffffff', 2.5)
    directionalLight.position.set(5, 10, 7)
    this.scene.add(directionalLight)

    const fillLight = new THREE.HemisphereLight('#fff7d6', '#7aa6d9', 1.4)
    this.scene.add(fillLight)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    document.body.appendChild(this.renderer.domElement)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    // World
    this.world = new World(this.scene)

    // Start loop
    this.animate()
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    this.controls.update()
    this.world.update()
    this.renderer.render(this.scene, this.camera)
  }
}