import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const POWER_LINES_SCALE = 0.16
const POWER_LINES_X = -3
const POWER_LINES_Z = 0

export default class PowerLines {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/power_lines.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene
			this.model.scale.setScalar(POWER_LINES_SCALE)

			const groundY = Landscape.getHeight(POWER_LINES_X, POWER_LINES_Z)
			this.model.position.set(POWER_LINES_X, groundY, POWER_LINES_Z)

			this.model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true
					child.receiveShadow = true
				}
			})

			const bounds = new THREE.Box3().setFromObject(this.model)
			this.model.position.y += groundY - bounds.min.y

			scene.add(this.model)
		})
	}
}
