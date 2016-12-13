import { Map, MapLayer, D3Selection } from 'components'

export class States extends MapLayer {
	constructor(root: D3Selection, map: Map) {
		super(root, map, 'states', 'state')
	}
}
