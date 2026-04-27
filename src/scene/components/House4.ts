import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const HOUSE_4_SCALE = 1
const HOUSE_4_X = 38
const HOUSE_4_Z = -17
const HOUSE_4_Y_ROTATION = Math.PI

export default class House4 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_4.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			this.model = gltf.scene
			this.model.scale.setScalar(HOUSE_4_SCALE)

			const groundY = Landscape.getHeight(HOUSE_4_X, HOUSE_4_Z)
			this.model.position.set(HOUSE_4_X, groundY, HOUSE_4_Z)
			this.model.rotation.y = HOUSE_4_Y_ROTATION

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
