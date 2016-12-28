import * as d3 from 'd3'

import 'styles/map.scss'

import { ComponentBase, MapLayer, D3Selection } from 'components'

const EQR_WIDTH = 640
const ASPECT_RATIO = 2.57617729 // Approximated map aspect ratio after removing Antartica
const ROTATION: [number, number] = [-11, 0]
const PRECISION = .05
const LAYER_ORDER: LayerType[] = ['region', 'country', 'state']
const SIDEBAR_WIDTH = 300
const ZOOM_DURATION = 600
const MAX_SCALE = 48

export interface MapSelection {
	data: Feature,
	element: D3Selection
}

export class Map extends ComponentBase {
	wrapper = { type: 'svg', id: 'map' }
	
	projection: d3.GeoProjection
	path: d3.GeoPath<any, any>
	zoom: d3.ZoomBehavior<any, any>
	
	layers: MapLayer[] = []
	layersRoot: D3Selection
	layerIndex: number = 0
	
	selection: MapSelection
	
	onInit() {
		this.projection = d3.geoEquirectangular()
			.rotate(ROTATION)
			.precision(PRECISION)
		
		this.path = d3.geoPath()
			.projection(this.projection)
		
		this.initBaseLayers()
		
		let layersRoot = this.layersRoot
		MapLayer.parentComponent = this
		
		this.zoom = d3.zoom()
			.scaleExtent([1, MAX_SCALE])
			.on('zoom', function () {
				layersRoot.attr('transform', d3.event.transform)
			})
		
		this.initLayer(this.layerIndex)
	}
	
	onResize(rect) {
		// Blank space left in projection due to removal of Antartica
		let blankSpace = rect.height - (rect.width / ASPECT_RATIO)
		
		this.projection
			.scale((rect.width / EQR_WIDTH) * 100)
			.translate([
				rect.width / 2,
				(rect.height + (blankSpace / 2)) / 2
			])
		
		this.layers.forEach(l => l.resize(rect))
	}
	
	select = (target: Feature, targetEl: SVGPathElement) => {
		if (this.selection) {
			if (this.selection.data === target) {
				// If the seletected feature has no sublayers select the parent
				let currentLayer = this.layers[this.layerIndex]
				this.select(currentLayer.parent.data, currentLayer.parent.element.node() as SVGPathElement)
				return
			} else {
				this.selection.element.classed('selected', false)
			}
		}
		
		this.layerIndex = LAYER_ORDER.indexOf(target.properties.type)
		
		let targetSelection = d3.select(targetEl)
		targetSelection.classed('selected', true)
		
		this.cameraFocus(target)
		this.selection = {
			data: target,
			element: targetSelection
		}
		
		this.removeExtraLayers()
		
		if (this.selection.data.properties.has_sublayer) {
			this.initLayer(this.layerIndex + 1, this.selection)
		}
	}
	
	deselect = () => {
		// Select the parent layer
		let layer = this.layers[this.layerIndex]
		let parent = layer.parent
		
		if (!parent) {
			this.clearSelection()
			return
		}
		
		// Select parent of the current layer
		this.select(parent.data, parent.element.node() as SVGPathElement)
	}
	
	clearSelection = () => {
		if (this.selection) {
			this.selection.element.classed('selected', false)
		}
		
		this.cameraReset()
		this.selection = null
		this.removeExtraLayers()
	}
	
	initBaseLayers() {
		let ocean = this.root
			.append('rect')
			.classed('ocean', true)
			.on('click', this.deselect)
		
		this.layersRoot = this.root
			.append('g')
			.classed('layers', true)
		 
		let world = this.layersRoot
			.append('g')
			.classed('world', true)
			.append('path')
			.data(this.data.getShapes('world').features)
		
		this.addResizer((rect) => {
			ocean
				.attr('width', rect.width)
				.attr('height', rect.height)
			
			world
				.attr('d', this.path)
		})
	}
	
	initLayer(index: number, context?: MapSelection) {
		if (!this.layers[index]) {
			let layerType = LAYER_ORDER[index]
			this.layers[index] = new MapLayer(layerType, context)
		}
		
		return this.layers[index]
	}
	
	removeExtraLayers() {
		this.layers = this.layers.filter((layer, idx) => {
			let selection = this.selection ? this.selection.data : false
			let isDirectChild = layer.parent && layer.parent.data === selection
			let isBelowCurrent = idx > this.layerIndex
			if (isBelowCurrent && !isDirectChild) {
				layer.destroy()
				return false
			} else {
				return true
			}
		})
	}
	
	onCameraAnimationStart = () => {
		this.root.classed('animating', true)
	}
	
	onCameraAnimationEnd = () => {
		this.root.classed('animating', false)
	}
	
	cameraFocus = (feature: Feature) => {
		let width = this.rect.width - SIDEBAR_WIDTH,
			height = this.rect.height,
			bounds = this.path.bounds(feature as any),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.max(1, Math.min(MAX_SCALE, 0.9 / Math.max(dx / width, dy / height))),
			translate = [width / 2 - scale * x, height / 2 - scale * y]
		
		let transformation = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		this.onCameraAnimationStart()
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, transformation)
			.on('end', this.onCameraAnimationEnd)
	}
	
	cameraReset() {
		this.onCameraAnimationStart()
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, d3.zoomIdentity)
			.on('end', this.onCameraAnimationEnd)
	}
}
