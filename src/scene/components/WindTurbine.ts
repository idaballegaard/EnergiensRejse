import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const WIND_TURBINE_SCALE = 10.5
const WIND_TURBINE_Y_ROTATION = Math.PI / 2 + Math.PI

// [x, z] positions for each turbine in the wind farm
const WIND_TURBINE_POSITIONS: [number, number][] = [
  [-22, -28],
  [-22, -35],
  [-30, -24],
  [-30, -31],
  [-30, -38],
  [-38, -28],
  [-38, -35],
]

export default class WindTurbine {
  private mixers: THREE.AnimationMixer[] = []
  private clock = new THREE.Clock()

  constructor(scene: THREE.Scene) {
    const modelUrl = `${import.meta.env.BASE_URL}models/wind_turbine.glb`

    for (const [x, z] of WIND_TURBINE_POSITIONS) {
      const loader = new GLTFLoader()
      loader.load(modelUrl, (gltf: GLTF) => {
        const model = gltf.scene

        model.scale.setScalar(WIND_TURBINE_SCALE)

        const groundY = Landscape.getHeight(x, z)
        model.position.set(x, groundY, z)
        model.rotation.y = WIND_TURBINE_Y_ROTATION

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        scene.add(model)

        const clip = gltf.animations[0]
        if (clip) {
          const mixer = new THREE.AnimationMixer(model)
          mixer.clipAction(clip).play()
          this.mixers.push(mixer)
        }
      })
    }
  }

  update() {
    const delta = this.clock.getDelta()
    for (const mixer of this.mixers) {
      mixer.update(delta)
    }
  }
}