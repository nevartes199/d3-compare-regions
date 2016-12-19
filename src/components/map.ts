import * as d3 from 'd3'

import { ComponentBase, MapLayer, D3Selection } from 'components'

const EQR_WIDTH = 640
const LNG_OFFSET = -11
const PRECISION = .05
const LAYER_ORDER: LayerType[] = ['world', 'regions', 'countries', 'states']
const SIDEBAR_WIDTH = 300
const ZOOM_DURATION = 750

export interface MapSelection {
	type: LayerType,
	selection: D3Selection,
	data: any,
	layer: MapLayer
}

export class Map extends ComponentBase {
	wrapper = { type: 'svg', id: 'map' }
	
	projection: d3.GeoProjection
	path: d3.GeoPath<any, d3.GeoPermissibleObjects>
	zoom: d3.ZoomBehavior<any, any>
	
	layers: MapLayer[] = []
	layersRoot: D3Selection
	
	onInit() {
		this.initGeo()
		this.initLayers()
		this.initZoom()
	}
	
	onResize(rect) {
		this.layers.forEach(l => l.resize(rect))
	}
	
	initGeo() {
		this.projection = d3.geoEquirectangular()
			.rotate([LNG_OFFSET, 0])
			.precision(PRECISION)
		
		this.path = d3.geoPath()
			.projection(this.projection)
		
		this.addResizer((rect) => {
			this.projection
				.scale((rect.width / EQR_WIDTH) * 100)
				.translate([rect.width / 2, rect.height / 2])
		})
	}
	
	initLayers() {
		let ocean = this.root
			.append('rect')
			.classed('ocean', true)
			.on('click', this.deselect)
		
		this.addResizer((rect) => {
			ocean
				.attr('width', rect.width)
				.attr('height', rect.height)
		})
		
		this.layersRoot = this.root
			.append('g')
			.classed('layers', true)
		
		this.layers = [
			this.initLayer(LAYER_ORDER[0]),
			this.initLayer(LAYER_ORDER[1]),
			this.initLayer(LAYER_ORDER[2]),
			this.initLayer(LAYER_ORDER[3]),
		]
	}
	
	initZoom() {
		let zoomCallback = this.onZoom
		this.zoom = d3.zoom()
			.scaleExtent([1, 8])
			.on('zoom', function () {
				zoomCallback(d3.event.transform)
			})
	}
	
	select = (feature: Feature, path: SVGPathElement) => {
		
	}
	
	deselect = () => {
		this.zoomReset() // Replace with zoom out
	}
	
	onZoom = (transform: d3.ZoomTransform) => {
		this.layersRoot.attr('transform', transform as any)
	}
	
	zoomIn = (feature: any) => {
		let width = this.rect.width - SIDEBAR_WIDTH,
			height = this.rect.height,
			bounds = this.path.bounds(feature),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
			translate = [width / 2 - scale * x, height / 2 - scale * y]
		
		let transformation = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, transformation)
	}

	zoomReset() {
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, d3.zoomIdentity)
	}
	
	initLayer(type: LayerType) {
		let layer = new MapLayer(this.layersRoot, this, type)
		layer.init()
		
		return layer
	}
}
