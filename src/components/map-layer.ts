import 'styles/layers.scss'

import { ComponentBase, D3Selection, Map } from 'components'

export abstract class MapLayer extends ComponentBase {
	animateBoundaries = false
	features: any
	
	constructor(
		root: D3Selection,
		private map: Map,
		private type: LayerType,
		private name: string
	) {
		super(root)
		this.wrapper = {
			type: 'g',
			classes: ['layer', type]
		}
	}
	
	onInit() {
		this.features = this.data.getFeatures(this.type)
		let itemClass = this.name
		
		let selectionCallback = this.map.select
		
		let itemGroups = this.root
			.selectAll('.' + itemClass)
			.data(this.features)
			.enter()
			.append('g')
			.classed(itemClass, true)
			.attr('data-name', d => d[this.name])
			.on('click', function (data) {
				selectionCallback(data, this as Element)
			})
		
		let itemShapes = itemGroups.append('path')
		
		this.addResizer(() => {
			itemShapes.attr('d', this.map.path)
		})
	}
	
	select() {
		this.updateSelection(true)
	}
	
	deselect() {
		this.updateSelection(false)
	}
	
	private updateSelection(selected: boolean) {
		this.root.classed('current', selected)
	}
}
