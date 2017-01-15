#d3-compare-region

## Map Data
The map data is mostly manipulated/tweaked using a mapshaper script to simplify the actual implementation of the app as much as we can.
More documentation can be found on the [script file](data/parse) itself

The parse operation generates a [`map.json`](data/map.json) file which is bundled within the app the next the it is built.
Everytime you edit something on the data folder or the parse script, run `npm run parse` to generate the file again.

## Custom Data
Each map item contains at least two fields:
 - A `type` which can be either "region", "country" or "state"
 - A `name` which is the country's name, that can be an abbreviation if the name is too long

Regions can identified by their name.

Countries have a field `country_code` which is its [alpha-3 code](https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes).

States have a `state_code` which is a two letter ZIP code designed for that state. Not all countries have a two letter ZIP code for their states available, but at least for the countries that we are using now, all of them have state codes.

The application has a [data provider](src/data.ts) and there you can find how the map data is loaded.

## Components
The implementation is divided into [several components](src/components).
The curent hierarchy is as follow:
- app.ts Takes care of the selection logic and orchestrates the map and overlay behaviors
    - map.ts Handles the camera
        - map-layer.ts

Each component have its implementation divided in several methods as well to improve readability of the code.
Since most methods are self-explanatory I've only added documentation to the more unintuitive parts and I can add more documentation to specific parts upon request.

## Technology stack
The main technologies used in this app (aside D3.js of course) are [TypeScript](https://www.typescriptlang.org/docs/tutorial.html), [Sass](http://sass-lang.com/guide) and [Webpack](https://webpack.js.org/concepts/).

### TypeScript
Regular JavaScript can be used within `.ts` files.
If you ran into any issues with TypeScript, it is most likely that you can workaround it by simply removing type safety checks.

### Sass
Just like TypeScript, regular CSS can be used on `.scss` files so no mystery here either.

### Webpack
All configurations needed are at webpack.config.js for you to use.

## Running locally
1 - Make sure you have the latest source version from your branch and have all dependencies installed:
 - `npm install;`
 
2 - Start the development server:
 - `npm run start:hmr;`

3 - Access the app at:
 - http://localhost:8080

## Building
Build the visualization with `npm run build;`. Once it is complete, a "dist" folder will be created.

### Base Url
One **very important** setting for publishing the visualization somewhere else is this line from the [webpack config](webpack.config.js):
```
const PROD_HREF = '/d3-compare-regions/'
```


