import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const LOCAL_POWERLINE_SCALE = 0.22
const LOCAL_POWERLINE_COUNT = 4
const LOCAL_POWERLINE_START_X = 22
const LOCAL_POWERLINE_START_Z = -2
const LOCAL_POWERLINE_SPACING_Z = 6

export default class LocalPowerLines {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/local_powerline.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			const reference = gltf.scene.clone(true)
			reference.scale.setScalar(LOCAL_POWERLINE_SCALE)
			const referenceBounds = new THREE.Box3().setFromObject(reference)
			const baseYOffset = -referenceBounds.min.y
			const sharedGroundY = Landscape.getHeight(
				LOCAL_POWERLINE_START_X,
				LOCAL_POWERLINE_START_Z
			)

			for (let index = 0; index < LOCAL_POWERLINE_COUNT; index += 1) {
				const instance = gltf.scene.clone(true)
				instance.scale.setScalar(LOCAL_POWERLINE_SCALE)

				const x = LOCAL_POWERLINE_START_X
				const z = LOCAL_POWERLINE_START_Z + index * LOCAL_POWERLINE_SPACING_Z
				instance.position.set(x, sharedGroundY + baseYOffset, z)

				instance.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				this.group.add(instance)
			}
		})
	}
}
