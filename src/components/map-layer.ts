import { ComponentBase, Map, MapSelection } from 'components'

const ANIMATION_DURATION = 300

export class MapLayer extends ComponentBase {
	static parent: Map
	map: Map
	
	constructor(private type: LayerType, public context?: MapSelection) {
		super(MapLayer.parent.layersRoot)
		this.map = MapLayer.parent
		
		this.wrapper = {
			type: 'g',
			classes: ['layer', type]
		}
		
		this.init()
	}
	
	onInit() {
		let contextData = this.context ? this.context.data.properties : undefined
		let data = this.data.getShapes(this.type, contextData)
		let boundaryData = this.app.data.getBoundaries(this.type, contextData)
		
		let childs = this.root
			.selectAll('g')
			.data(data.features)
			.enter()
			.append('g')
			.classed('land', true)
			.attr('data-name', (d: Feature) => d.properties.name)
		
		let select = this.map.select
		let land = childs
			.append('path')
			.on('click', function(feature) {
				select(feature, this as SVGPathElement)
			})
		
		let boundaries = this.root
			.append('g')
			.classed('boundaries', true)
			.append('path')
			.style('opacity', 0)
			.attr('vector-effect', 'non-scaling-stroke')
			.datum(boundaryData)
		
		boundaries
			.transition()
			.duration(ANIMATION_DURATION / 2)
			.style('opacity', 1)
		
		this.addResizer(() => {
			land.attr('d', this.map.path)
			boundaries.attr('d', this.map.path)
		}, this.context !== undefined)
	}
	
	destroy() {
		this.root.html('')
	}
}
