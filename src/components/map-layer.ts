import 'styles/layers.scss'

import { ComponentBase, D3Selection, Map } from 'components'

export class MapLayer extends ComponentBase {
	features: any
	
	constructor(root: D3Selection, private map: Map, private type: LayerType) {
		super(root)
		this.wrapper = {
			type: 'g',
			classes: ['layer', type]
		}
		
		this.init()
	}
	
	onInit() {
		this.features = this.data.getFeatures(this.type)
		
		let selectionCallback = this.map.select
		
		let layerChilds = this.root
			.selectAll('g')
			.data(this.features)
			.enter()
			.append('g')
			.attr('data-name', (d: Feature) => d.properties.name)
		
		let land = layerChilds
			.append('path')
			.classed('land', true)
			.on('click', function (data) {
				selectionCallback(data as Feature, this as SVGPathElement)
			})
		
		let boundaryData = this.app.data.getBoundaries(this.type)
		let boundaries = this.root
			.append('path')
			.datum(boundaryData)
			.classed('boundaries', true)
		
		this.addResizer(() => {
			land.attr('d', this.map.path)
			boundaries.attr('d', this.map.path)
		})
	}
}
