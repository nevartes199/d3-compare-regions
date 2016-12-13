declare type LayerType = 'regions' | 'countries' | 'states'

declare interface TopoObject<DataType> {
	features: TopoFeature<DataType>[]
}

declare interface TopoFeature<DataType> {
	arcs: any[]
	properties: DataType
}

declare interface RegionData {
	region: string
}

declare interface CountryData extends RegionData {
	country: string
	country_code: string
}

declare interface StateData extends CountryData {
	state: string
	state_code: string
}

declare interface MapTransform {
	scale?: number[]
	translate?: number[]
}
