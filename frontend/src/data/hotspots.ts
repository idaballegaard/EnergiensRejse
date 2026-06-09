import * as THREE from 'three'
import { type Hotspot } from '../ui/InfoOverlay'

export const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    label: 'Vindmøllen producerer strøm',
    description: 'Vinden får møllens vinger til at dreje rundt. En generator i møllen omdanner bevægelsen til elektricitet. <br><br> Jo stærkere vinden blæser, desto mere strøm kan møllen producere. Vindenergi er en vedvarende energikilde, fordi vinden hele tiden bliver skabt af solens opvarmning af Jorden.',
    worldPosition: new THREE.Vector3(-30, 7, -31),
    cameraPosition: new THREE.Vector3(-18, 8, -20),
    cameraLookAt: new THREE.Vector3(-30, 2, -31),
  },
  {
    id: 2,
    label: 'Strømmen bliver opgraderet i transformeren',
    description: 'En transformer ved møllen øger spændingen, så strømmen kan sendes langt af sted med mindre tab. <br><br> Når spændingen hæves, går mindre energi tabt som varme i kablerne. Det gør transporten af strøm mere effektiv og billigere.',
    worldPosition: new THREE.Vector3(-18, 4, -23),
    cameraPosition: new THREE.Vector3(-9, 5, -14),
    cameraLookAt: new THREE.Vector3(-18, 1, -23),
  },
  {
    id: 3,
    label: 'Strømmen sendes ud i elnettet via højspænding',
    description: 'Strømmen sendes ud i højspændingsnettet (typisk 60–400 kV) gennem store elmaster over store afstande. <br><br> Højspændingsnettet fungerer som elektricitetens motorvej. Det forbinder kraftværker, vindmøller og byer i hele landet, så strømmen kan transporteres derhen, hvor der er brug for den.',
    worldPosition: new THREE.Vector3(-8, 5, 5),
    cameraPosition: new THREE.Vector3(2, 7, 14),
    cameraLookAt: new THREE.Vector3(-8, 2, 5),
  },
  {
    id: 4,
    label: 'På en transformerstation bliver spændingen sænket',
    description: 'På transformerstationen bliver spændingen sænket til et niveau, der kan sendes sikkert videre ud i lokalnettet. <br><br> Transformerstationer fungerer som knudepunkter i elnettet. Her fordeles strømmen videre til forskellige områder og byer.',
    worldPosition: new THREE.Vector3(10, 4, 25),
    cameraPosition: new THREE.Vector3(14, 7, 36),
    cameraLookAt: new THREE.Vector3(10, 1, 25),
  },
  {
    id: 5,
    label: 'Strømmen sendes videre ud i lokalnettet',
    description: 'Strømmen sendes gennem mindre kabler og luftledninger ud til byer, landsbyer og boliger. <br><br> Lokalnettet er den del af elnettet, som bringer strømmen tæt på forbrugerne. Her er spændingen lavere end i højspændingsnettet, så strømmen kan bruges sikkert.',
    worldPosition: new THREE.Vector3(15, 5, 10),
    cameraPosition: new THREE.Vector3(24, 6, 20),
    cameraLookAt: new THREE.Vector3(15, 1, 10),
  },
  {
    id: 6,
    label: 'Strømmen kommer ind i dit hus',
    description: 'Strømmen går ind i din bolig gennem eltavlen. Herfra kan du bruge strømmen til lys, varme, computere og meget andet. <br><br> Eltavlen fordeler strømmen rundt i husets forskellige kredsløb. På den måde får alle stikkontakter og elektriske apparater adgang til strøm.',
    worldPosition: new THREE.Vector3(33, 7, -14),
    cameraPosition: new THREE.Vector3(22, 6, -4),
    cameraLookAt: new THREE.Vector3(33, 1, -14),
  },
]
