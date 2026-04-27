import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const TRANSFORMER_STATION_TARGET_HEIGHT = 2
const TRANSFORMER_STATION_X = 18
const TRANSFORMER_STATION_Z = -2

export default class TransformerStation {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/transformer_station.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene

			const initialBounds = new THREE.Box3().setFromObject(this.model)
			const initialHeight = Math.max(initialBounds.max.y - initialBounds.min.y, 0.001)
			const scale = TRANSFORMER_STATION_TARGET_HEIGHT / initialHeight
			this.model.scale.setScalar(scale)

			const groundY = Landscape.getHeight(TRANSFORMER_STATION_X, TRANSFORMER_STATION_Z)
			this.model.position.set(TRANSFORMER_STATION_X, groundY, TRANSFORMER_STATION_Z)

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
