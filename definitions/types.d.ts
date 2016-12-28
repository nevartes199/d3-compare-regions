declare type LayerType = 'world' | 'regions' | 'countries' | 'states'

declare interface TopoObject {
	features: Feature[]
}

declare interface FeatureCollection {
	features: Feature[]
	type: string
}

declare interface Feature {
	geometry?: any
	properties: FeatureData
	type?: string
}

declare interface FeatureData {
	name: string
	type: string
	has_sublayer: boolean
}

declare interface RegionData {
	region: string
}

declare interface CountryData extends RegionData {
	country: string
	country_code: string
	region: string
}

declare interface StateData {
	country: string
	state: string
	state_code: string
}

declare interface MapTransform {
	scale?: number[]
	translate?: number[]
}
