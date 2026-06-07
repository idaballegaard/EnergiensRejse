import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

type TreeInstance = [number, number, number, number]
type KeepOutPoint = [number, number, number]
type RoadSegment = [number, number, number, number, number]
type ObstacleSegment = [number, number, number, number, number]

const FOREST_CORNER_X = -58
const FOREST_CORNER_Z = 58
const FOREST_FADE_DISTANCE = 82
const FOREST_MAX_DISTANCE_FROM_CORNER = 90
const FOREST_MIN_X = -58
const FOREST_MAX_X = -12
const FOREST_MIN_Z = -4
const FOREST_MAX_Z = 58
const FOREST_LEFT_OF_ROAD_X = -10
const FOREST_GRID_STEP = 1.9
const CORE_MIN_SPACING = 1.18
const EDGE_MIN_SPACING = 5.1
const TREE_SCALE_MIN = 0.94
const TREE_SCALE_MAX = 1.08
const TREE_SIZE_MULTIPLIER = 2
const SCATTERED_TREE_SPACING = 2.35

const TREE_GROUP_CENTERS: [number, number, number][] = [
	// Back/right side, more sparse
	[10, 42, 4],
	[22, 8, 3],
	[40, -34, 2],
	[48, 18, 4],
	[50, -6, 2],
	[48, -30, 2],
	[56, -22, 2],
	[47.5, 46.5, 4],
	[54, 53, 3],

	// Lower edge strip: between bottom road and map border
	[-53, -55, 5],
	[-46, -52.5, 4],
	[-38, -55.5, 6],
	[-30, -52.8, 3],
	[-21, -55.2, 5],
	[-12, -53.4, 4],
	[-2, -55.8, 6],
	[10, -54.5, 5],
	[24, -55.6, 4],
	[36, -54.2, 6],
	[49, -55.4, 5],
]

const TREE_GROUP_OFFSETS: [number, number][] = [
	[0, 0],
	[1.9, 1.2],
	[-1.7, 1.6],
	[1.4, -1.8],
	[-1.9, -1.2],
]

const SOLO_TREE_POSITIONS: [number, number][] = [
	// Transition belt and natural side
	[-54, -12],
	[-48, -24],
	[-42, -34],
	[-30, -10],
	[-24, -40],
	[-32, -2],
	[-8, -26],
	[-2, -18],
	[2, -36],
	[-18, -6],
	[-10, -14],

	// Front/city end singles
	[0, -10],
	[6, -22],
	[10, -6],
	[16, -30],
	[20, -14],
	[26, -20],
	[30, -12],
	[34, -24],
	[38, -10],
	[46, -20],
	[52, -12],

	// Back/right side sparse
	[-4, 26],
	[4, 24],
	[12, -40],
	[18, -26],
	[24, 44],
	[28, 6],
	[34, -34],
	[42, -26],
	[50, -36],
	[44, 30],
	[54, -18],
	[52, 40],
	[45.5, 50.5],
	[56, 49],
	[53, 56],

	// Sparse singles between clusters for a natural look
	[-51, -49],
	[-34, -50],
	[-18, -49],
	[-6, -50],
	[14, -49],
	[27, -50],
	[44, -49],
]

// [x, z, radius] around rock instances.
const ROCK_KEEP_OUT_POINTS: KeepOutPoint[] = [
	[50, 50, 0.62],
	[48.6, 49.4, 0.58],
	[51.5, 49.1, 0.6],
	[49.2, 51.3, 0.64],
	[52.1, 51.6, 0.56],
	[47.8, 50.9, 0.58],
	[50.8, 52.2, 0.62],
	[48.9, 48.1, 0.55],
]

// [x, z, radius] around static scene objects.
const KEEP_OUT_POINTS: KeepOutPoint[] = [
	[-15, -15, 4.5],
	[12, 20, 4.8],
	[-22, -28, 6.8],
	[-22, -35, 6.8],
	[-30, -24, 6.8],
	[-30, -31, 6.8],
	[-30, -38, 6.8],
	[-38, -28, 6.8],
	[-38, -35, 6.8],
	[28, -9.5, 3.8],
	[23.5, -28.5, 3.8],
	[28, -15.5, 3.8],
	[44, -23, 3.8],
	[23, -17, 3.8],
	[33, -9.7, 3.8],
	[38, -20, 3.8],
	[33, -15.7, 3.8],
	[32.5, -34.5, 3.8],
	[23, -9.5, 3.8],
	[38, -9, 3.8],
	[38, -3, 3.8],
	[38, -15, 3.8],
	[44, -28, 3.8],
	[37.5, -34.5, 3.8],
	[16.5, -20.5, 3.8],
	[16.5, -15, 3.8],
	[22, -23, 3.8],
	[33, -29, 3.8],
	[43.5, -17, 3.8],
	[27, -34, 3.8],
	[17, -30, 3.8],
	[37.5, -24.5, 3.8],
	[28, -28, 3.8],
	[38, -28, 3.8],
	[44.5, -12, 3.8],
	[22, -35, 3.8],
	[16, -25, 3.8],
]

// [x1, z1, x2, z2, halfWidth] road corridors to avoid.
const ROAD_SEGMENTS: RoadSegment[] = [
	[18.45, -32.8, 34.9, -32.8, 1.5],
	[18.5, -25.7, 18.5, -11.3, 1.5],
	[18.5, -13.7, 34.95, -13.7, 1.5],
	[39.71, -40, 39.71, 34.6, 1.5],
	[-49.6, -47, 35.01, -47, 1.5],
	[-49.5, -40, -49.5, -11.2, 1.5],
	[-49.55, -13.655, -30.8, -13.655, 1.5],
	[-26.09, -6.5, -26.09, 25, 1.5],
	[-26.1, 22.43, -14.35, 22.43, 1.5],
	[-9.56, 29.6, -9.56, 34.4, 1.5],
	[-9.56, 32, 35.41, 32, 1.5],
]

// [x1, z1, x2, z2, halfWidth] infrastructure corridors to keep trees away from.
const OBSTACLE_SEGMENTS: ObstacleSegment[] = [
	// Local power lines near the city.
	[20, -10, 20, 4.6, 2.8],
	// Main power line corridor across the map.
	[-12.8, -1.8, -25.5, 23.5, 3.2],
]

function distance2D(ax: number, az: number, bx: number, bz: number): number {
	return Math.hypot(ax - bx, az - bz)
}

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value))
}

function lerp(from: number, to: number, t: number): number {
	return from + (to - from) * t
}

function hash2D(x: number, z: number): number {
	const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123
	return s - Math.floor(s)
}

function isInsideForestShape(x: number, z: number): boolean {
	const offsetX = x - FOREST_CORNER_X
	const offsetZ = FOREST_CORNER_Z - z
	if (offsetX < 0 || offsetZ < 0) {
		return false
	}

	const zProgress = clamp01(offsetZ / (FOREST_CORNER_Z - FOREST_MIN_Z))
	const xProgress = clamp01(offsetX / (FOREST_MAX_X - FOREST_CORNER_X))
	const widthNoise = (hash2D(x * 0.08 + 11.3, z * 0.09 - 4.7) - 0.5) * 7.5
	const depthNoise = (hash2D(x * 0.07 - 8.2, z * 0.1 + 3.6) - 0.5) * 9.5

	const maxWidthAtZ = lerp(44, 18, Math.pow(zProgress, 1.18)) + widthNoise
	const maxDepthAtX = lerp(60, 16, Math.pow(xProgress, 1.05)) + depthNoise

	return offsetX <= maxWidthAtZ && offsetZ <= maxDepthAtX
}

function distanceToSegment2D(
	px: number,
	pz: number,
	x1: number,
	z1: number,
	x2: number,
	z2: number
): number {
	const dx = x2 - x1
	const dz = z2 - z1
	const lenSq = dx * dx + dz * dz
	if (lenSq === 0) {
		return distance2D(px, pz, x1, z1)
	}
	const t = Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / lenSq))
	const cx = x1 + t * dx
	const cz = z1 + t * dz
	return distance2D(px, pz, cx, cz)
}

export default class OakTrees {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)
		const instances = this.buildTreeInstances()

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/low_poly_oak_tree.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation, scale] of instances) {
				const tree = gltf.scene.clone(true)
				tree.scale.setScalar(scale * TREE_SIZE_MULTIPLIER)

				const groundY = Landscape.getHeight(x, z)
				tree.position.set(x, groundY, z)
				tree.rotation.y = yRotation

				tree.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				const bounds = new THREE.Box3().setFromObject(tree)
				tree.position.y += groundY - bounds.min.y

				this.group.add(tree)
			}
		})
	}

	private buildTreeInstances(): TreeInstance[] {
		const accepted: TreeInstance[] = []
		for (let z = FOREST_MIN_Z; z <= FOREST_MAX_Z; z += FOREST_GRID_STEP) {
			for (let x = FOREST_MIN_X; x <= FOREST_MAX_X; x += FOREST_GRID_STEP) {
				const jitterX = (hash2D(x, z) - 0.5) * 1.05
				const jitterZ = (hash2D(z, x) - 0.5) * 1.05
				const treeX = x + jitterX
				const treeZ = z + jitterZ

				if (!isInsideForestShape(treeX, treeZ)) {
					continue
				}

				const fromCorner = distance2D(
					treeX,
					treeZ,
					FOREST_CORNER_X,
					FOREST_CORNER_Z
				)
				if (fromCorner > FOREST_MAX_DISTANCE_FROM_CORNER) {
					continue
				}

				const edgeFactor = clamp01(fromCorner / FOREST_FADE_DISTANCE)
				const edgeNoise = hash2D(treeX * 0.19 + 14.2, treeZ * 0.17 - 9.4)
				const breakupNoise = hash2D(treeX * 0.63 - 5.1, treeZ * 0.61 + 7.7)
				const noisyEdgeFactor = clamp01(
					edgeFactor + (edgeNoise - 0.5) * 0.22 + (breakupNoise - 0.5) * 0.12
				)
				const keepChance = 1 - Math.pow(noisyEdgeFactor, 2.35)
				if (hash2D(treeX * 1.7, treeZ * 2.3) > keepChance) {
					continue
				}

				const minSpacing = lerp(
					CORE_MIN_SPACING,
					EDGE_MIN_SPACING,
					Math.pow(noisyEdgeFactor, 1.35)
				)
				if (!this.isValidTreePosition(treeX, treeZ, accepted, minSpacing)) {
					continue
				}

				const rotation = hash2D(treeZ * 0.8, treeX * 1.9) * Math.PI * 2
				const scaleNoise = hash2D(treeX * 3.1, treeZ * 2.6)
				const scale = lerp(TREE_SCALE_MIN, TREE_SCALE_MAX, scaleNoise)
				accepted.push([treeX, treeZ, rotation, scale])
			}
		}

		for (const [centerX, centerZ, count] of TREE_GROUP_CENTERS) {
			for (let index = 0; index < count; index += 1) {
				const offset = TREE_GROUP_OFFSETS[index]
				if (!offset) {
					continue
				}
				const [dx, dz] = offset
				const jitterX = (hash2D(centerX + index * 3.2, centerZ - index * 1.7) - 0.5) * 0.9
				const jitterZ = (hash2D(centerZ - index * 2.6, centerX + index * 1.4) - 0.5) * 0.9
				const treeX = centerX + dx + jitterX
				const treeZ = centerZ + dz + jitterZ
				if (!this.isValidTreePosition(treeX, treeZ, accepted, SCATTERED_TREE_SPACING, true)) {
					continue
				}

				const rotation = hash2D(treeZ * 0.8, treeX * 1.9) * Math.PI * 2
				const scaleNoise = hash2D(treeX * 2.3, treeZ * 2.1)
				const scale = lerp(TREE_SCALE_MIN, TREE_SCALE_MAX, scaleNoise)
				accepted.push([treeX, treeZ, rotation, scale])
			}
		}

		for (const [baseX, baseZ] of SOLO_TREE_POSITIONS) {
			const jitterX = (hash2D(baseX * 1.2, baseZ * 0.7) - 0.5) * 0.8
			const jitterZ = (hash2D(baseZ * 1.4, baseX * 0.9) - 0.5) * 0.8
			const treeX = baseX + jitterX
			const treeZ = baseZ + jitterZ
			if (!this.isValidTreePosition(treeX, treeZ, accepted, SCATTERED_TREE_SPACING, true)) {
				continue
			}

			const rotation = hash2D(treeZ * 0.8, treeX * 1.9) * Math.PI * 2
			const scaleNoise = hash2D(treeX * 2.8, treeZ * 2.4)
			const scale = lerp(TREE_SCALE_MIN, TREE_SCALE_MAX, scaleNoise)
			accepted.push([treeX, treeZ, rotation, scale])
		}

		return accepted
	}

	private isValidTreePosition(
		x: number,
		z: number,
		accepted: TreeInstance[],
		minSpacing: number,
		allowOutsideForest = false
	): boolean {
		if (x < -58 || x > 58 || z < -58 || z > 58) {
			return false
		}

		if (!allowOutsideForest && x > FOREST_LEFT_OF_ROAD_X) {
			return false
		}

		for (const [ox, oz, radius] of KEEP_OUT_POINTS) {
			if (distance2D(x, z, ox, oz) < radius) {
				return false
			}
		}

		for (const [ox, oz, radius] of ROCK_KEEP_OUT_POINTS) {
			if (distance2D(x, z, ox, oz) < radius) {
				return false
			}
		}

		for (const [x1, z1, x2, z2, halfWidth] of ROAD_SEGMENTS) {
			if (distanceToSegment2D(x, z, x1, z1, x2, z2) < halfWidth + 1.0) {
				return false
			}
		}

		for (const [x1, z1, x2, z2, halfWidth] of OBSTACLE_SEGMENTS) {
			if (distanceToSegment2D(x, z, x1, z1, x2, z2) < halfWidth) {
				return false
			}
		}

		for (const [tx, tz] of accepted) {
			if (distance2D(x, z, tx, tz) < minSpacing) {
				return false
			}
		}

		return true
	}
}
