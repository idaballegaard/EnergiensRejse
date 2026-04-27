import * as THREE from 'three'

type Cloud = {
	mesh: THREE.Mesh
	speed: number
}

export default class Sky {
	private clouds: Cloud[] = []
	private static readonly CLOUD_X_LIMIT = 140

	constructor(scene: THREE.Scene) {
		this.addSkyDome(scene)
		this.addCloudLayer(scene)
	}

	update(camera: THREE.Camera) {
		for (const cloud of this.clouds) {
			cloud.mesh.position.x += cloud.speed
			cloud.mesh.lookAt(camera.position)

			if (cloud.mesh.position.x > Sky.CLOUD_X_LIMIT) {
				cloud.mesh.position.x = -Sky.CLOUD_X_LIMIT
			}
		}
	}

	private addSkyDome(scene: THREE.Scene) {
		const geometry = new THREE.SphereGeometry(300, 48, 24)
		const material = new THREE.ShaderMaterial({
			side: THREE.BackSide,
			depthWrite: false,
			uniforms: {
				topColor: { value: new THREE.Color('#6fbdf5') },
				horizonColor: { value: new THREE.Color('#bfe8ff') },
				bottomColor: { value: new THREE.Color('#e6f6ff') },
			},
			vertexShader: `
				varying vec3 vWorldPosition;

				void main() {
					vec4 worldPosition = modelMatrix * vec4(position, 1.0);
					vWorldPosition = worldPosition.xyz;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform vec3 topColor;
				uniform vec3 horizonColor;
				uniform vec3 bottomColor;
				varying vec3 vWorldPosition;

				void main() {
					float h = normalize(vWorldPosition).y * 0.5 + 0.5;
					vec3 sky = mix(bottomColor, horizonColor, smoothstep(0.0, 0.45, h));
					sky = mix(sky, topColor, smoothstep(0.45, 1.0, h));
					gl_FragColor = vec4(sky, 1.0);
				}
			`,
		})

		const dome = new THREE.Mesh(geometry, material)
		scene.add(dome)
	}

	private addCloudLayer(scene: THREE.Scene) {
		const texture = this.createCloudTexture()
		const cloudCount = 7

		for (let index = 0; index < cloudCount; index += 1) {
			const size = 18 + Math.random() * 10
			const material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				opacity: 0.7,
				depthWrite: false,
			})
			const geometry = new THREE.PlaneGeometry(size * 2.4, size)
			const mesh = new THREE.Mesh(geometry, material)

			mesh.position.set(
				-Sky.CLOUD_X_LIMIT + (index / cloudCount) * (Sky.CLOUD_X_LIMIT * 2),
				26 + Math.random() * 10,
				-70 + Math.random() * 140
			)
			mesh.rotation.y = Math.PI

			this.clouds.push({
				mesh,
				speed: 0.02 + Math.random() * 0.02,
			})

			scene.add(mesh)
		}
	}

	private createCloudTexture() {
		const canvas = document.createElement('canvas')
		canvas.width = 512
		canvas.height = 256

		const context = canvas.getContext('2d')

		if (!context) {
			return new THREE.CanvasTexture(canvas)
		}

		context.clearRect(0, 0, canvas.width, canvas.height)

		const blobs = [
			{ x: 150, y: 150, r: 75 },
			{ x: 220, y: 120, r: 85 },
			{ x: 300, y: 145, r: 70 },
			{ x: 370, y: 140, r: 60 },
			{ x: 250, y: 170, r: 65 },
		]

		for (const blob of blobs) {
			const gradient = context.createRadialGradient(
				blob.x,
				blob.y,
				blob.r * 0.2,
				blob.x,
				blob.y,
				blob.r
			)
			gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

			context.fillStyle = gradient
			context.beginPath()
			context.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2)
			context.fill()
		}

		const texture = new THREE.CanvasTexture(canvas)
		texture.needsUpdate = true
		texture.minFilter = THREE.LinearFilter
		texture.magFilter = THREE.LinearFilter

		return texture
	}
}
