import { ComponentBase, D3Selection, Map } from 'components'

export class MapLayer extends ComponentBase {
	static parent: Map
	map: Map
	
	constructor(private type: LayerType, private context?: FeatureData) {
		super(MapLayer.parent.layersRoot)
		this.map = MapLayer.parent
		
		this.wrapper = {
			type: 'g',
			classes: ['layer', type]
		}
		
		this.init()
	}
	
	onInit() {
		let data = this.data.getShapes(this.type, this.context)
		let boundaryData = this.app.data.getBoundaries(this.type, this.context)
		
		let selectionCallback = this.map.select
		let introAnimationStarted = false
		
		let childs = this.root
			.selectAll('g')
			.data(data.features)
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
				boundaries.style('opacity', 0)
				
				setTimeout(() => {
					boundaries.classed('animated', true)
				}, 10)
				
				setTimeout(() => {
					boundaries.style('stroke-dasharray', `${length / 2} 0 ${length / 2}`)
					boundaries.style('opacity', 1)
					setTimeout(() => {
						boundaries.attr('style', null)
						boundaries.classed('animated', false)
					}, 1200)
				}, 300)
			}
		}, this.context !== undefined)
	}
}
