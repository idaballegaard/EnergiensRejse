import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const ELECTRICAL_TRANSFORMER_SCALE = 0.50
const ELECTRICAL_TRANSFORMER_X = -15
const ELECTRICAL_TRANSFORMER_Z = -15

export default class ElectricalTransformer {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/electrical_transformer.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene

			this.model.scale.setScalar(ELECTRICAL_TRANSFORMER_SCALE)

			const groundY = Landscape.getHeight(
				ELECTRICAL_TRANSFORMER_X,
				ELECTRICAL_TRANSFORMER_Z
			)
			this.model.position.set(
				ELECTRICAL_TRANSFORMER_X,
				groundY,
				ELECTRICAL_TRANSFORMER_Z
			)

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
