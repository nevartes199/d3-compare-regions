import { ComponentBase, Map, MapSelection } from 'components'

const ANIMATION_DURATION = 300

export class MapLayer extends ComponentBase {
	static parentComponent: Map
	map: Map
	
	constructor(private type: LayerType, public parent?: MapSelection) {
		super(MapLayer.parentComponent.layersRoot)
		this.map = MapLayer.parentComponent
		
		this.wrapper = {
			type: 'g',
			classes: ['layer', type]
		}
		
		this.init()
	}
	
	onInit() {
		let contextData = this.parent ? this.parent.data.properties : undefined
		let data = this.app.data.getShapes(this.type, contextData)
		let boundaryData = this.app.data.getBoundaries(this.type, contextData)
		
		let childs = this.root
			.selectAll('g')
			.data(data.features)
			.enter()
			.append('g')
			.classed('land', true)
			.attr('data-name', (d: Feature) => d.properties.name)
		
		let selectionCallback = this.app.select
		
		let land = childs
			.append('path')
			.on('click', function(feature) {
				selectionCallback(feature, this as SVGPathElement)
			})
			.on('mouseenter', this.app.info.showLegend)
			.on('mouseleave', this.app.info.removeLegend)
		
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
		}, this.parent !== undefined)
	}
	
	destroy() {
		this.root.html('')
	}
}
