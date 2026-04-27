import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const HOUSE_2_SCALE = 1
const HOUSE_2_X = 28
const HOUSE_2_Z = -17

export default class House2 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_2.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene
			this.model.scale.setScalar(HOUSE_2_SCALE)

			const groundY = Landscape.getHeight(HOUSE_2_X, HOUSE_2_Z)
			this.model.position.set(HOUSE_2_X, groundY, HOUSE_2_Z)

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
