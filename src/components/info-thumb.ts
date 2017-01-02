import * as d3 from 'd3'

import '../styles/info-thumb.scss'

import { ComponentBase, D3Selection, ROTATION } from 'components'

export class InfoThumb extends ComponentBase {
	wrapper = {
		type: 'svg',
		classes: ['thumb']
	}
	
	projection: any
	
	constructor(root: D3Selection, public data: Feature) {
		super(root)
		this.init()
	}
	
	onInit() {
		this.projection = d3
			.geoEquirectangular()
			.rotate(ROTATION)
		
		let path = d3.geoPath()
			.projection(this.projection)
		
		let geometry = this.data as any
		// geometry = this.app.data.getShapes('world')
		
		let host = this.root.node() as Element
		let shapeRoot = this.root.append('g')
		let shape = shapeRoot
			.append('path')
			.datum(geometry)
		
		this.addResizer(() => {
			let rect = host.getBoundingClientRect()
			this.projection.fitSize([rect.width, rect.height], geometry)
			
			shape.attr('d', path)
		}, true)
	}
}
