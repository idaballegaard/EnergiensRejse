import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const LOCAL_POWERLINE_SCALE = 0.18
const LOCAL_POWERLINE_COUNT = 4
const LOCAL_POWERLINE_START_X = 12
const LOCAL_POWERLINE_START_Z = -9
const LOCAL_POWERLINE_SPACING_Z = 4.86

export default class LocalPowerLines {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/local_powerline.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (let index = 0; index < LOCAL_POWERLINE_COUNT; index += 1) {
				const instance = gltf.scene.clone(true)
				instance.scale.setScalar(LOCAL_POWERLINE_SCALE)

				const x = LOCAL_POWERLINE_START_X
				const z = LOCAL_POWERLINE_START_Z + index * LOCAL_POWERLINE_SPACING_Z
				const groundY = Landscape.getHeight(x, z)
				instance.position.set(x, groundY, z)

				instance.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				const bounds = new THREE.Box3().setFromObject(instance)
				instance.position.y += groundY - bounds.min.y

				this.group.add(instance)
			}
		})
	}
}
