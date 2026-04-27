import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const WIND_TURBINE_SCALE = 10
const WIND_TURBINE_X = -24
const WIND_TURBINE_Z = 0

export default class WindTurbine {
  model: THREE.Group | null = null
  private mixer: THREE.AnimationMixer | null = null
  private clock = new THREE.Clock()

  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader()
    const modelUrl = `${import.meta.env.BASE_URL}models/wind_turbine.glb`

    loader.load(modelUrl, (gltf: GLTF) => {
      this.model = gltf.scene

      this.model.scale.setScalar(WIND_TURBINE_SCALE)

      const groundY = Landscape.getHeight(WIND_TURBINE_X, WIND_TURBINE_Z)
      this.model.position.set(WIND_TURBINE_X, groundY, WIND_TURBINE_Z)

      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.add(this.model)

      const clip = gltf.animations[0]
      if (clip) {
        this.mixer = new THREE.AnimationMixer(this.model)
        this.mixer.clipAction(clip).play()
      }
    })
  }

  update() {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta())
    }
  }
}