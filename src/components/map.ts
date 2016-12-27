import * as d3 from 'd3'

import { ComponentBase, MapLayer, D3Selection } from 'components'

const EQR_WIDTH = 640
const ASPECT_RATIO = 2.57617729 // Approximated map aspect ratio after removing Antartica
const ROTATION: [number, number] = [-11, 0]
const PRECISION = .05
const LAYER_ORDER: LayerType[] = ['regions', 'countries', 'states']
const SIDEBAR_WIDTH = 300
const ZOOM_DURATION = 750

export interface Selection {
	data: Feature,
	target: D3Selection
}

export class Map extends ComponentBase {
	wrapper = { type: 'svg', id: 'map' }
	
	projection: d3.GeoProjection
	path: d3.GeoPath<any, d3.GeoPermissibleObjects>
	zoom: d3.ZoomBehavior<any, any>
	
	layers: MapLayer[] = []
	layersRoot: D3Selection
	layerIndex: number = 0
	
	selection: Selection
	
	onInit() {
		this.projection = d3.geoEquirectangular()
			.rotate(ROTATION)
			.precision(PRECISION)
		
		this.path = d3.geoPath()
			.projection(this.projection)
		
		let layersRoot = this.layersRoot = this.root
			.append('g')
			.classed('layers', true)
		
		this.initBaseLayers()
		
		this.zoom = d3.zoom()
			.scaleExtent([1, 8])
			.on('zoom', function () {
				layersRoot.attr('transform', d3.event.transform)
			})
		
		this.initLayer(this.layerIndex)
	}
	
	onResize(rect) {
		let blankSpace = rect.height - (rect.width / ASPECT_RATIO)
		this.projection
			.scale((rect.width / EQR_WIDTH) * 100)
			.translate([
				rect.width / 2,
				(rect.height + (blankSpace / 2)) / 2
			])
		
		this.layers.forEach(l => l.resize(rect))
	}
	
	select = (feature: Feature, path: SVGPathElement) => {
		if (this.selection) {
			if (this.selection.data === feature) {
				this.deselect()
				return
			} else {
				this.selection.target.classed('selected', false)
			}
		}

		this.cameraFocus(feature)
		
		let target = d3.select(path)
		target.classed('selected', true)
		
		this.selection = {
			data: feature,
			target: target
		}
	}
	
	deselect = () => {
		this.cameraReset()
		
		if (this.selection) {
			this.selection.target.classed('selected', false)
		}
		
		this.selection = null
	}
	
	initBaseLayers() {
		let baseLayers = this.layersRoot
			.append('g')
			.classed('base-layers', true)
		
		let ocean = baseLayers
			.append('rect')
			.classed('ocean', true)
			.on('click', this.deselect)
		
		let world = this.data.getFeatures('world')[0]
		let land = baseLayers
			.append('path')
			.datum(world)
			.classed('world', true)
		
		this.addResizer((rect) => {
			ocean
				.attr('width', rect.width)
				.attr('height', rect.height)
			
			land
				.attr('d', this.path)
		})
	}
	
	initLayer(index: number) {
		if (!this.layers[index]) {
			let layerType = LAYER_ORDER[index]
			this.layers[index] = new MapLayer(this.layersRoot, this, layerType)
		}
		
		return this.layers[index]
	}
	
	cameraFocus = (feature: Feature) => {
		let width = this.rect.width - SIDEBAR_WIDTH,
			height = this.rect.height,
			bounds = this.path.bounds(feature as any),
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
	
	cameraReset() {
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, d3.zoomIdentity)
	}
}
