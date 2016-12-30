import * as d3 from 'd3'

import 'styles/map.scss'

import { ComponentBase, MapLayer, D3Selection, MapOverlay } from 'components'

export const LAYER_ORDER: LayerType[] = ['region', 'country', 'state']

const EQR_WIDTH = 640
const ASPECT_RATIO = 2.57617729 // Approximated map aspect ratio after removing Antartica
const ROTATION: [number, number] = [-11, 0]
const PRECISION = .05
const ZOOM_DURATION = 600
const MIN_SCALE = 0.5
const MAX_SCALE = 48

const SIDEBAR_SIZE = 300
const SIDEBAR_MARGIN = 64

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
	
	leftBound = 0
	rightBound = SIDEBAR_SIZE
	
	selection: MapSelection
	
	worldLand: Feature
	
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
		this.cameraReset()
	}
	
	select = (target: Feature, targetEl: SVGPathElement): Feature => {
		if (this.selection) {
			if (this.selection.data === target) {
				// If the seletected feature has no sublayers select the parent
				let currentLayer = this.layers[this.layerIndex]
				this.select(currentLayer.parent.data, currentLayer.parent.element.node() as SVGPathElement)
				return currentLayer.parent.data
			} else {
				this.selection.element.classed('selected', false)
			}
		}
		
		this.layerIndex = LAYER_ORDER.indexOf(target.properties.type)
		
		let targetSelection = d3.select(targetEl)
		targetSelection.classed('selected', true)
		
		this.selection = {
			data: target,
			element: targetSelection
		}
		
		this.cameraFocus(target)
		
		this.removeExtraLayers()
		
		if (this.selection.data.properties.has_sublayer) {
			this.initLayer(this.layerIndex + 1, this.selection)
		}
	}
	
	deselect = (): Feature => {
		// Select the parent layer
		let layer = this.layers[this.layerIndex]
		let parent = layer.parent
		
		if (!parent) {
			this.clearSelection()
			return null
		}
		
		// Select parent of the current layer
		this.select(parent.data, parent.element.node() as SVGPathElement)
		return parent.data
	}
	
	clearSelection = () => {
		if (this.selection) {
			this.selection.element.classed('selected', false)
		}
		
		this.selection = null
		this.cameraReset()
		this.removeExtraLayers()
	}
	
	initBaseLayers() {
		let ocean = this.root
			.append('rect')
			.classed('ocean', true)
			.on('click', this.app.deselect)
		
		this.layersRoot = this.root
			.append('g')
			.classed('layers', true)
		 
		this.worldLand = this.app.data.getShapes('world').features[0]
		let world = this.layersRoot
			.append('g')
			.classed('world', true)
			.append('path')
			.datum(this.worldLand)
		
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
			if ((isBelowCurrent && !isDirectChild) || (!selection && idx > 0)) {
				layer.destroy()
				return false
			} else {
				return true
			}
		})
	}
	
	onCameraAnimationStart = () => {
		// this.app.info.clearLegend()
		this.root.classed('animating', true)
	}
	
	onCameraAnimationEnd = () => {
		this.root.classed('animating', false)
	}
	
	cameraFocus = (feature: Feature) => {
		let width = this.rect.width - this.leftBound
		let margin = .05
		
		if (this.selection) {
			width -= this.rightBound + SIDEBAR_MARGIN
			margin = .1
		}
		
		let center = this.leftBound + width / 2
		
		let height = this.rect.height,
			bounds = this.path.bounds(feature as any),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, (1 - margin) / Math.max(dx / width, dy / height))),
			translate = [center - scale * x, height / 2 - scale * y]
		
		let transformation = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		this.onCameraAnimationStart()
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, transformation)
			.on('end', this.onCameraAnimationEnd)
	}
	
	cameraReset() {
		this.cameraFocus(this.worldLand)
	}
	
	cameraAdjustBounds(refresh = false) {
		this.leftBound = this.app.info.comparison.length * SIDEBAR_SIZE
		if (refresh) {
			if (this.selection) {
				this.cameraFocus(this.selection.data)
			} else {
				this.cameraReset()
			}
		}
	}
}
