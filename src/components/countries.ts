import { Map, MapLayer, D3Selection } from 'components'

export class Countries extends MapLayer {
	constructor(root: D3Selection, map: Map) {
		super(root, map, 'countries', 'country')
	}
}
