import { ComponentBase, D3Selection, Map } from 'components'

export class MapLayer extends ComponentBase {
	constructor(root: D3Selection, private map: Map, private type: LayerType) {
		super(root)
		this.wrapper = {
			type: 'g',
			classes: ['layer', type]
		}
		
		this.init()
	}
	
	onInit() {
		let introAnimationStarted = false
		
		let data = this.data.getFeatures(this.type)
		let boundaryData = this.app.data.getBoundaries(this.type)
		let selectionCallback = this.map.select
		
		let childs = this.root
			.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.classed('land', true)
			.attr('data-name', (d: Feature) => d.properties.name)
		
		let land = childs
			.append('path')
			.on('click', function (selectionData) {
				selectionCallback(selectionData as Feature, this as SVGPathElement)
			})
		
		let boundaries = this.root
			.append('g')
			.classed('boundaries', true)
			.append('path')
			.datum(boundaryData)
		
		this.addResizer(() => {
			land.attr('d', this.map.path)
			boundaries.attr('d', this.map.path)
			
			if (!introAnimationStarted) {
				introAnimationStarted = true
				
				let length = (boundaries.node() as SVGPathElement).getTotalLength()
				boundaries.style('stroke-dasharray', `0 ${length} 0`)
				boundaries.classed('animated', true)
				
				setTimeout(() => {
					boundaries.style('stroke-dasharray', `${length / 2} 0 ${length / 2}`)
					setTimeout(() => {
						boundaries.style('stroke-dasharray', `0`)
						boundaries.classed('animated', false)
					}, 1200)
				}, 300)
			}
		})
	}
}
