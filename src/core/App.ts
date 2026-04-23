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
    this.scene.background = new THREE.Color('#87ceeb')
    this.scene.fog = new THREE.Fog('#87ceeb', 30, 80)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0, 2, 6)

    // Lighting — sun
    const sun = new THREE.DirectionalLight('#fff4e0', 3.0)
    sun.position.set(15, 20, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 80
    sun.shadow.camera.left = -30
    sun.shadow.camera.right = 30
    sun.shadow.camera.top = 30
    sun.shadow.camera.bottom = -30
    sun.shadow.bias = -0.001
    this.scene.add(sun)

    // Lighting — sky light
    const skyLight = new THREE.HemisphereLight('#87ceeb', '#4a8c3f', 1.2)
    this.scene.add(skyLight)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
    this.world.update(this.camera)
    this.renderer.render(this.scene, this.camera)
  }
}