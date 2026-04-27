import * as THREE from 'three'
import WindTurbine from './components/WindTurbine'
import Landscape from './components/Landscape'
import Sky from './components/Sky'
import ElectricalTransformer from './components/ElectricalTransformer'
import PowerLines from './components/PowerLines'
import TransformerStation from './components/TransformerStation'
import House1 from './components/House1'
import House2 from './components/House2'
import House3 from './components/House3'
import House4 from './components/House4'
import House5 from './components/House5'
import LocalPowerLines from './components/LocalPowerLines'

export default class World {
  turbine: WindTurbine
  sky: Sky
  transformer: ElectricalTransformer
  powerLines: PowerLines
  transformerStation: TransformerStation
  house1: House1
  house2: House2
  house3: House3
  house4: House4
  house5: House5
  localPowerLines: LocalPowerLines

  constructor(scene: THREE.Scene) {
    new Landscape(scene)
    this.sky = new Sky(scene)
    this.turbine = new WindTurbine(scene)
    this.transformer = new ElectricalTransformer(scene)
    this.powerLines = new PowerLines(scene)
    this.transformerStation = new TransformerStation(scene)
    this.house1 = new House1(scene)
    this.house2 = new House2(scene)
    this.house3 = new House3(scene)
    this.house4 = new House4(scene)
    this.house5 = new House5(scene)
    this.localPowerLines = new LocalPowerLines(scene)
  }

  update(camera: THREE.Camera) {
    this.sky.update(camera)
    this.turbine.update()
  }
}