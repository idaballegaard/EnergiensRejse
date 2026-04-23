import * as THREE from 'three'
import WindTurbine from './components/WindTurbine'
import Landscape from './components/Landscape'

export default class World {
  turbine: WindTurbine

  constructor(scene: THREE.Scene) {
    new Landscape(scene)
    this.turbine = new WindTurbine(scene)
  }

  update() {
    this.turbine.update()
  }
}