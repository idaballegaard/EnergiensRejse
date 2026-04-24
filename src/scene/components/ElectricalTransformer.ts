import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const ELECTRICAL_TRANSFORMER_SCALE = 0.5

export default class ElectricalTransformer {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/electrical_transformer.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene

			this.model.scale.setScalar(ELECTRICAL_TRANSFORMER_SCALE)

			const x = 5
			const z = 1
			const groundY = Landscape.getHeight(x, z)
			this.model.position.set(x, groundY, z)

			this.model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true
					child.receiveShadow = true
				}
			})

			// Lift the model so its lowest vertex sits on the terrain surface.
			const bounds = new THREE.Box3().setFromObject(this.model)
			this.model.position.y += groundY - bounds.min.y

			scene.add(this.model)
		})
	}
}
