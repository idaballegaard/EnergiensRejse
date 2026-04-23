import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class WindTurbine {
  model: THREE.Group | null = null
  private mixer: THREE.AnimationMixer | null = null
  private clock = new THREE.Clock()

  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader()
    const modelUrl = `${import.meta.env.BASE_URL}models/wind_turbine.glb`

    loader.load(modelUrl, (gltf: GLTF) => {
      this.model = gltf.scene
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