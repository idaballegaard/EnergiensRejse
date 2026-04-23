import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class WindTurbine {
  model: THREE.Group | null = null

  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader()
    const modelUrl = `${import.meta.env.BASE_URL}models/wind_turbine.glb`

    loader.load(modelUrl, (gltf: GLTF) => {
      this.model = gltf.scene
      scene.add(this.model)
    })
  }

  update() {
    if (this.model) {
      this.model.rotation.y += 0.01
    }
  }
}