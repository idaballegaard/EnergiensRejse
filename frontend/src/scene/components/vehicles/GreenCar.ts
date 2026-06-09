import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from '../environment/Landscape'

const CAR_TARGET_HEIGHT = 0.6
const CAR_SPEED = 6.6
const CAR_HEADING_OFFSET = 0
const GREEN_CAR_START_DISTANCE_RATIO = 0.72

const ROAD_LOOP_POINTS: [number, number][] = [
	[-48.5, -45.7], // done
	[41, -45.7], // done
	[41, 33], // done
	[-8.5, 33], // done
	[-8.5, 23.5], // done
	[-25, 23.5], // done
	[-25, -12.5], // done
	[-48.5, -12.5],
	[-48.5, -45.7],
]

function getMaterials(mesh: THREE.Mesh): THREE.Material[] {
	return Array.isArray(mesh.material) ? mesh.material : [mesh.material]
}

function hideLikelyArtifactPlanes(root: THREE.Object3D) {
	root.updateMatrixWorld(true)

	root.traverse((child) => {
		if (!(child instanceof THREE.Mesh)) {
			return
		}

		const geometry = child.geometry
		if (!geometry.boundingBox) {
			geometry.computeBoundingBox()
		}
		if (!geometry.boundingBox) {
			return
		}

		const size = new THREE.Vector3()
		geometry.boundingBox.getSize(size)
		const maxSize = Math.max(size.x, size.y, size.z)
		const minSize = Math.min(size.x, size.y, size.z)
		const isVeryFlat = maxSize > 0 && minSize / maxSize < 0.03

		const materials = getMaterials(child)
		const hasAlphaMaterial = materials.some(
			(material) =>
				('transparent' in material && material.transparent) ||
				('opacity' in material && material.opacity < 0.999) ||
				('alphaMap' in material && Boolean(material.alphaMap))
		)

		const nameHint = `${child.name.toLowerCase()} ${materials
			.map((material) => material.name.toLowerCase())
			.join(' ')}`
		const hasShadowHint =
			nameHint.includes('shadow') ||
			nameHint.includes('plane') ||
			nameHint.includes('ground')

		if (isVeryFlat && (hasAlphaMaterial || hasShadowHint)) {
			child.visible = false
		}
	})
}

function computeVisibleBounds(root: THREE.Object3D): THREE.Box3 | null {
	root.updateMatrixWorld(true)

	let hasAny = false
	const worldBounds = new THREE.Box3()

	root.traverse((child) => {
		if (!(child instanceof THREE.Mesh) || !child.visible) {
			return
		}

		const geometry = child.geometry
		if (!geometry.boundingBox) {
			geometry.computeBoundingBox()
		}
		if (!geometry.boundingBox) {
			return
		}

		const meshBounds = geometry.boundingBox.clone().applyMatrix4(child.matrixWorld)
		if (!hasAny) {
			worldBounds.copy(meshBounds)
			hasAny = true
		} else {
			worldBounds.union(meshBounds)
		}
	})

	return hasAny ? worldBounds : null
}

function brightenCarMaterials(root: THREE.Object3D) {
	root.traverse((child) => {
		if (!(child instanceof THREE.Mesh)) {
			return
		}

		const materials = getMaterials(child)
		for (const material of materials) {
			if ('color' in material && material.color instanceof THREE.Color) {
				material.color.multiplyScalar(1.42)
			}

			if ('emissive' in material && material.emissive instanceof THREE.Color) {
				material.emissive = new THREE.Color('#2a2a2a')
				;(material as THREE.Material & { emissiveIntensity?: number }).emissiveIntensity = 0.28
			}

			if ('metalness' in material && typeof material.metalness === 'number') {
				material.metalness = Math.min(material.metalness, 0.55)
			}

			if ('roughness' in material && typeof material.roughness === 'number') {
				material.roughness = Math.min(material.roughness, 0.75)
			}
		}
	})
}

export default class GreenCar {
	model: THREE.Group | null = null
	private carRoot: THREE.Group | null = null
	private clock = new THREE.Clock()
	private routePoints: THREE.Vector3[] = []
	private routeLengths: number[] = []
	private routeTotalLength = 0
	private traveledDistance = 0
	private headingY = 0

	constructor(scene: THREE.Scene, startDistanceRatio = GREEN_CAR_START_DISTANCE_RATIO) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/simple_car_low_poly_-_rigged.glb`
		this.initializeRoadPath()
		this.traveledDistance = this.routeTotalLength * startDistanceRatio

		loader.load(
			modelUrl,
			(gltf: GLTF) => {
				this.model = gltf.scene

				const initialBounds = new THREE.Box3().setFromObject(this.model)
				const initialHeight = Math.max(initialBounds.max.y - initialBounds.min.y, 0.001)
				const scale = CAR_TARGET_HEIGHT / initialHeight
				this.model.scale.setScalar(scale)
				hideLikelyArtifactPlanes(this.model)

				this.model.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				const centeredBounds =
					computeVisibleBounds(this.model) ?? new THREE.Box3().setFromObject(this.model)
				const center = centeredBounds.getCenter(new THREE.Vector3())
				this.model.position.x -= center.x
				this.model.position.z -= center.z
				this.model.position.y -= centeredBounds.min.y
				brightenCarMaterials(this.model)

				this.carRoot = new THREE.Group()
				this.carRoot.add(this.model)
				this.placeCarAtDistance(this.traveledDistance)
				this.headingY = this.carRoot.rotation.y

				scene.add(this.carRoot)
			},
			undefined,
			(error: unknown) => {
				console.error('Failed to load GreenCar model:', error)
			}
		)
	}

	update() {
		if (!this.carRoot || this.routeTotalLength <= 0) {
			return
		}

		const delta = this.clock.getDelta()
		this.traveledDistance += CAR_SPEED * delta
		this.placeCarAtDistance(this.traveledDistance)
	}

	private initializeRoadPath() {
		this.routePoints = ROAD_LOOP_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z))
		if (this.routePoints.length < 2) {
			return
		}

		this.routeLengths = [0]
		let total = 0

		for (let i = 0; i < this.routePoints.length; i += 1) {
			const previous = this.routePoints[i]
			const current = this.routePoints[(i + 1) % this.routePoints.length]
			if (!previous || !current) {
				continue
			}
			const segmentLength = previous.distanceTo(current)
			total += segmentLength
			this.routeLengths.push(total)
		}

		this.routeTotalLength = total
	}

	private placeCarAtDistance(distance: number) {
		if (!this.carRoot || this.routeTotalLength <= 0 || this.routePoints.length < 2) {
			return
		}

		const wrappedDistance =
			((distance % this.routeTotalLength) + this.routeTotalLength) % this.routeTotalLength

		let segmentIndex = 0
		let previousLength = 0
		for (let i = 1; i < this.routeLengths.length; i += 1) {
			const segmentEndLength = this.routeLengths[i] ?? 0
			if (wrappedDistance <= segmentEndLength) {
				segmentIndex = i - 1
				previousLength = this.routeLengths[i - 1] ?? 0
				break
			}
		}

		const startPoint = this.routePoints[segmentIndex]
		const endPoint = this.routePoints[(segmentIndex + 1) % this.routePoints.length]
		if (!startPoint || !endPoint) {
			return
		}

		const segmentLength = Math.max(startPoint.distanceTo(endPoint), 0.0001)
		const t = THREE.MathUtils.clamp((wrappedDistance - previousLength) / segmentLength, 0, 1)
		const x = THREE.MathUtils.lerp(startPoint.x, endPoint.x, t)
		const z = THREE.MathUtils.lerp(startPoint.z, endPoint.z, t)
		const groundY = Landscape.getHeight(x, z)
		this.carRoot.position.set(x, groundY, z)

		const targetHeading = Math.atan2(endPoint.x - startPoint.x, endPoint.z - startPoint.z) + CAR_HEADING_OFFSET
		this.headingY = targetHeading
		this.carRoot.rotation.y = this.headingY
	}
}