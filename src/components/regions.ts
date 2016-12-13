import { Map, MapLayer, D3Selection } from 'components'

export class Regions extends MapLayer {
	constructor(root: D3Selection, map: Map) {
		super(root, map, 'regions', 'region')
	}
}
