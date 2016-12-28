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
	target: D3Selection
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
		MapLayer.parent = this
		
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
	
	select = (feature: Feature, target: SVGPathElement) => {
		if (this.selection) {
			if (this.selection.data === feature) {
				// If the seletected feature has no sublayers select the parent
				let currentLayer = this.layers[this.layerIndex]
				this.select(currentLayer.context.data, currentLayer.context.target.node() as SVGPathElement)
				return
			} else {
				this.selection.target.classed('selected', false)
			}
		}
		
		let newIndex = LAYER_ORDER.indexOf(feature.properties.type)
		if (newIndex < this.layerIndex) {
			// When selection goes to a layer above the current one
			// remove all extra layers
			let layersToRemove = this.layers.splice(newIndex + 1, this.layerIndex - newIndex)
			layersToRemove.forEach(layer => {
				if (layer.context.data === feature) {
					this.layers.push(layer)
				} else {
					layer.destroy()
				}
			})
			
			this.layerIndex = this.layers.length - 2
		}
		
		let targetSelection = d3.select(target)
		targetSelection.classed('selected', true)
		
		this.cameraFocus(feature)
		this.selection = {
			data: feature,
			target: targetSelection
		}
	}
	
	deselect = () => {
		if (this.layerIndex) {
			// Select parent of the current layer
			let layer = this.layers[this.layerIndex]
			this.select(layer.context.data, layer.context.target.node() as SVGPathElement)
		} else {
			this.cameraReset()
			this.selection = null
		}
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
	
	onCameraAnimationStart = () => {
		this.root.classed('animating', true)
	}
	
	onCameraAnimationEnd = () => {
		this.root.classed('animating', false)
		
		if (this.selection && this.selection.data.properties.has_sublayer) {
			setTimeout(() => {
				this.layerIndex++
				this.initLayer(this.layerIndex, this.selection)
			}, 100)
		}
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
