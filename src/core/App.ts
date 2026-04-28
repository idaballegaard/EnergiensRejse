import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import World from '../scene/World'
import CameraController from '../interaction/CameraController'
import InfoOverlay, { type Hotspot } from '../ui/InfoOverlay'

const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    label: 'Vindmøllen producerer strøm',
    description: 'Vinden får møllens vinger til at dreje rundt. En generator i møllen omdanner bevægelsen til elektricitet.',
    worldPosition: new THREE.Vector3(-30, 7, -31),
    cameraPosition: new THREE.Vector3(-18, 8, -20),
    cameraLookAt: new THREE.Vector3(-30, 2, -31),
  },
  {
    id: 2,
    label: 'Strømmen bliver opgraderet i transformeren',
    description: 'En transformer ved møllen øger spændingen, så strømmen kan sendes langt af sted med mindre tab.',
    worldPosition: new THREE.Vector3(-15, 4, -15),
    cameraPosition: new THREE.Vector3(-6, 5, -6),
    cameraLookAt: new THREE.Vector3(-15, 1, -15),
  },
  {
    id: 3,
    label: 'Strømmen sendes ud i elnettet via højspænding',
    description: 'Strømmen sendes ud i højspændingsnettet (typisk 60–400 kV) gennem store elmaster over store afstande.',
    worldPosition: new THREE.Vector3(-8, 5, 5),
    cameraPosition: new THREE.Vector3(2, 7, 14),
    cameraLookAt: new THREE.Vector3(-8, 2, 5),
  },
  {
    id: 4,
    label: 'På en transformerstation bliver spændingen sænket',
    description: 'På transformerstationen bliver spændingen sænket til et niveau, der kan sendes sikkert videre ud i lokalnettet.',
    worldPosition: new THREE.Vector3(10, 4, 25),
    cameraPosition: new THREE.Vector3(14, 7, 36),
    cameraLookAt: new THREE.Vector3(10, 1, 25),
  },
  {
    id: 5,
    label: 'Strømmen sendes videre ud i lokalnettet',
    description: 'Strømmen sendes gennem mindre kabler og luftledninger ud til byer, landsbyer og boliger.',
    worldPosition: new THREE.Vector3(15, 5, 10),
    cameraPosition: new THREE.Vector3(24, 6, 20),
    cameraLookAt: new THREE.Vector3(15, 1, 10),
  },
  {
    id: 6,
    label: 'Strømmen kommer ind i dit hus',
    description: 'Strømmen går ind i din bolig gennem eltavlen. Herfra kan du bruge strømmen til lys, varme, computere og meget andet.',
    worldPosition: new THREE.Vector3(33, 7, -14),
    cameraPosition: new THREE.Vector3(22, 6, -4),
    cameraLookAt: new THREE.Vector3(33, 1, -14),
  },
]

const OVERVIEW_CAMERA_POSITION = new THREE.Vector3(0, 20, 42)
const OVERVIEW_CAMERA_LOOK_AT = new THREE.Vector3(0, 0, 5)

export default class App {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  world: World
  cameraController: CameraController
  overlay: InfoOverlay

  constructor() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#87ceeb')
    this.scene.fog = new THREE.Fog('#87ceeb', 70, 180)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      220
    )
    this.camera.position.copy(OVERVIEW_CAMERA_POSITION)
    this.camera.lookAt(OVERVIEW_CAMERA_LOOK_AT)

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
    this.renderer.localClippingEnabled = true
    document.body.appendChild(this.renderer.domElement)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.target.copy(OVERVIEW_CAMERA_LOOK_AT)

    // Camera controller
    this.cameraController = new CameraController(this.camera, this.controls)

    // Info overlay
    this.overlay = new InfoOverlay(
      HOTSPOTS,
      (hotspot) => {
        this.cameraController.moveTo(hotspot.cameraPosition, hotspot.cameraLookAt)
      },
      () => {
        this.cameraController.moveTo(OVERVIEW_CAMERA_POSITION, OVERVIEW_CAMERA_LOOK_AT)
      }
    )

    // World
    this.world = new World(this.scene)

    // Resize
    window.addEventListener('resize', this.onResize)

    // Start loop
    this.animate()
  }

  onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    this.controls.update()
    this.cameraController.update()
    this.world.update(this.camera)
    this.overlay.update(this.camera)
    this.renderer.render(this.scene, this.camera)
  }
}