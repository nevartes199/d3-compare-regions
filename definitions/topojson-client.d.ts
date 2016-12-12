declare namespace Topojson {
	export interface Base {
		version: string
		feature(topology: any, object: any): any
	}
}

declare module 'topojson-client' {
	let topojson: Topojson.Base
	export = topojson
}
