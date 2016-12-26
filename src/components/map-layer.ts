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
		
		let itemGroups = this.root
			.selectAll('g')
			.data(this.features)
			.enter()
			.append('g')
			.attr('data-name', (d: Feature) => d.properties.name)
		
		let itemShapes = itemGroups
			.append('path')
			.on('click', function (data) {
				selectionCallback(data as Feature, this as SVGPathElement)
			})
		
		this.addResizer(() => {
			itemShapes.attr('d', this.map.path)
		})
	}
}
