import * as THREE from 'three'
import WindTurbine from './components/WindTurbine'
import Landscape from './components/Landscape'
import Sky from './components/Sky'
import ElectricalTransformer from './components/ElectricalTransformer'
import PowerLines from './components/PowerLines'
import TransformerStation from './components/TransformerStation'

export default class World {
  turbine: WindTurbine
  sky: Sky
  transformer: ElectricalTransformer
  powerLines: PowerLines
  transformerStation: TransformerStation

  constructor(scene: THREE.Scene) {
    new Landscape(scene)
    this.sky = new Sky(scene)
    this.turbine = new WindTurbine(scene)
    this.transformer = new ElectricalTransformer(scene)
    this.powerLines = new PowerLines(scene)
    this.transformerStation = new TransformerStation(scene)
  }

  update(camera: THREE.Camera) {
    this.sky.update(camera)
    this.turbine.update()
  }
}