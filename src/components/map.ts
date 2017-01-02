import * as d3 from 'd3'

import 'styles/map.scss'

import { ComponentBase, MapLayer, D3Selection } from 'components'

export const LAYER_ORDER: LayerType[] = ['region', 'country', 'state']
export const ROTATION: [number, number] = [-11, 0]

const EQR_WIDTH = 640
const ASPECT_RATIO = 2.57617729 // Approximated map aspect ratio after removing Antartica
const PRECISION = .05
const ZOOM_DURATION = 600
const MIN_SCALE = 0.5
const MAX_SCALE = 48

export interface MapSelection {
	data: Feature,
	shape: D3Selection,
	layer: MapLayer
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
	rightBound = 0
	
	selection: MapSelection
	
	worldLand: Feature
	ready = false
	
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
		
		if (!this.ready) {
			this.ready = true
			this.cameraFocus(this.worldLand)
		}
	}
	
	onCameraAnimationStart = () => {
		this.root.classed('animating', true)
	}
	
	onCameraAnimationEnd = () => {
		this.root.classed('animating', false)
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
	
	select = (target: Feature, shape: D3Selection) => {
		if (this.selection) {
			this.selection.shape.classed('selected', false)
		}
		shape.classed('selected', true)
		
		this.layerIndex = LAYER_ORDER.indexOf(target.properties.type)
		
		this.selection = {
			data: target,
			shape: shape,
			layer: this.layers[this.layerIndex]
		}
		
		this.cameraFocus(target)
		this.removeExtraLayers()
		
		if (this.selection.data.properties.has_sublayer) {
			this.initLayer(this.layerIndex + 1, this.selection)
		}
	}
	
	clearSelection = () => {
		if (this.selection) {
			this.selection.shape.classed('selected', false)
		}
		
		this.layerIndex = 0
		this.selection = null
		this.cameraFocus(this.worldLand)
		this.removeExtraLayers()
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
	
	cameraRefresh() {
		if (this.selection) {
			this.cameraFocus(this.selection.data)
		} else {
			this.cameraFocus(this.worldLand)
		}
	}
	
	cameraFocus = (feature: Feature) => {
		this.cameraAdjustBounds()
		let width = this.rect.width - this.leftBound - this.rightBound
		let margin = .05
		
		let height = this.rect.height
		let center = this.leftBound + width / 2
		
		let transforms = this.fitGeometry(feature, width, height, margin, center)
		let transformation = d3.zoomIdentity
			.translate(transforms.translate[0], transforms.translate[1])
			.scale(transforms.scale)
		
		this.onCameraAnimationStart()
		this.root.transition()
			.duration(ZOOM_DURATION)
			.call(this.zoom.transform, transformation)
			.on('end', this.onCameraAnimationEnd)
	}
	
	fitGeometry(geometry: Feature, width: number, height: number, margin = 0, center?: number) {
		if (!center) {
			center = width / 2
		}
		
		let bounds = this.path.bounds(geometry as any),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, (1 - margin) / Math.max(dx / width, dy / height))),
			translate = [center - scale * x, height / 2 - scale * y]
		
		return { scale, translate }
	}
	
	private cameraAdjustBounds() {
		let sidebar = d3.select('.info-box.expanded:not(.pinned)').node()
		let panels = d3.selectAll('.info-box.pinned').nodes()
		
		this.rightBound = 0
		if (sidebar) {
			let sidebarRect = (sidebar as Element).getBoundingClientRect()
			let sidebarMargin = this.rect.right - sidebarRect.right
			this.rightBound += sidebarRect.width + sidebarMargin
		}
		
		this.leftBound = 0
		if (panels.length) {
			let panelRect = (panels[0] as Element).getBoundingClientRect()
			this.leftBound += panelRect.width * panels.length
		}
	}
}
