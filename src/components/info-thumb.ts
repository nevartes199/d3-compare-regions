import * as d3 from 'd3'

import '../styles/info-thumb.scss'

import { ComponentBase, D3Selection } from 'components'

const THUMB_HEIGHT = 100
const EQR_WIDTH = 640
const ASPECT_RATIO = 2.57617729 // Approximated map aspect ratio after removing Antartica

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
		this.projection = d3.geoEquirectangular()
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
			// let transforms = this.app.map.fitGeometry(geometry, EQR_WIDTH, EQR_WIDTH / ASPECT_RATIO)
			// shapeRoot.attr('transform', `translate(${transforms.translate.join(',')}) scale(${transforms.scale})`)
			
			shape.attr('d', path)
		}, true)
	}
	
	updateProjection(rect: ClientRect) {
		// Blank space left in projection due to removal of Antartica
		let blankSpace = rect.height - (rect.width / ASPECT_RATIO)
		
		this.projection
			.scale((rect.width / EQR_WIDTH) * 100)
			.translate([
				rect.width / 2,
				(rect.height + (blankSpace / 2)) / 2
			])
	}
}
