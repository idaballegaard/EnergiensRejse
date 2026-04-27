import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const HOUSE_5_SCALE = 1
const HOUSE_5_X = 33
const HOUSE_5_Z = -25
const HOUSE_5_Y_ROTATION = -Math.PI / 2

export default class House5 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_5.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene
			this.model.scale.setScalar(HOUSE_5_SCALE)

			const groundY = Landscape.getHeight(HOUSE_5_X, HOUSE_5_Z)
			this.model.position.set(HOUSE_5_X, groundY, HOUSE_5_Z)
			this.model.rotation.y = HOUSE_5_Y_ROTATION

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
