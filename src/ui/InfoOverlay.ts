import * as THREE from 'three'

export interface Hotspot {
  id: number
  label: string
  description: string
  worldPosition: THREE.Vector3
  cameraPosition: THREE.Vector3
  cameraLookAt: THREE.Vector3
}

export default class InfoOverlay {
  private hotspots: Hotspot[]
  private markers: HTMLElement[] = []
  private container: HTMLElement
  private factBox: HTMLElement
  private factContent: HTMLElement
  private onHotspotClick: (hotspot: Hotspot) => void
  private onClose: () => void

  constructor(hotspots: Hotspot[], onHotspotClick: (hotspot: Hotspot) => void, onClose: () => void) {
    this.hotspots = hotspots
    this.onHotspotClick = onHotspotClick
    this.onClose = onClose

    this.container = document.createElement('div')
    this.container.id = 'overlay-container'
    document.body.appendChild(this.container)

    for (const hotspot of hotspots) {
      const marker = document.createElement('button')
      marker.className = 'hotspot-marker'
      marker.textContent = String(hotspot.id)
      marker.setAttribute('aria-label', hotspot.label)
      marker.addEventListener('click', () => {
        this.showFactBox(hotspot)
        this.onHotspotClick(hotspot)
      })
      this.container.appendChild(marker)
      this.markers.push(marker)
    }

    this.factBox = document.createElement('div')
    this.factBox.id = 'fact-box'

    const closeBtn = document.createElement('button')
    closeBtn.id = 'fact-box-close'
    closeBtn.textContent = '\u2715'
    closeBtn.addEventListener('click', () => {
      this.hideFactBox()
      this.onClose()
    })

    this.factContent = document.createElement('div')
    this.factContent.id = 'fact-box-content'

    this.factBox.appendChild(closeBtn)
    this.factBox.appendChild(this.factContent)
    document.body.appendChild(this.factBox)
  }

  private showFactBox(hotspot: Hotspot): void {
    this.factContent.innerHTML = `
      <div class="fact-badge">${hotspot.id}</div>
      <h2 class="fact-title">${hotspot.label}</h2>
      <p class="fact-desc">${hotspot.description}</p>
    `
    this.factBox.classList.add('visible')
  }

  private hideFactBox(): void {
    this.factBox.classList.remove('visible')
  }

  update(camera: THREE.Camera): void {
    const width = window.innerWidth
    const height = window.innerHeight

    for (let i = 0; i < this.hotspots.length; i++) {
      const hotspot = this.hotspots[i]
      const marker = this.markers[i]
      if (!hotspot || !marker) continue

      const worldPos = hotspot.worldPosition.clone()
      worldPos.project(camera)

      if (worldPos.z > 1) {
        marker.style.display = 'none'
        continue
      }

      const x = (worldPos.x * 0.5 + 0.5) * width
      const y = (-worldPos.y * 0.5 + 0.5) * height
      marker.style.display = 'flex'
      marker.style.left = `${x}px`
      marker.style.top = `${y}px`
    }
  }
}
