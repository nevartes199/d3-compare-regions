#d3-compare-regions

## Map Data
The map data is mostly manipulated/tweaked using a mapshaper script to simplify the actual implementation of the app as much as we can.
More documentation can be found on the [script file](data/parse) itself.

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
There you can find as well, placeholders for calculating the color of each map item in the heatmap, and a sample implementation for retrieving the details for the current selection.

## Components
The implementation is divided into [several components](src/components).
The curent hierarchy is as follow:
- app.ts Takes care of the selection logic and orchestrates the map and overlay behaviors
    - map.ts Handles the camera
        - map-layer.ts
    - overlay.ts Manages the creation and manipulation of info-boxes over the map
        - info-box.ts The legend, the sidebar and the comparison boxes are all infoboxes
            - info-thumb.ts Creates a thumbnail of the map item for the its parent infobox data
            - info-details.ts Fetch details of the current item and generate a visualization for it

Each component have its implementation divided in several methods as well to improve readability of the code.
Since most methods are self-explanatory I've only added documentation to the more unintuitive parts and I can add more documentation to specific parts upon request.

## Technology stack
The main technologies used in this app (aside D3.js of course) are [TypeScript](https://www.typescriptlang.org/docs/tutorial.html), [Sass](http://sass-lang.com/guide) and [Webpack](https://webpack.js.org/concepts/).

### TypeScript
Regular JavaScript can be used within `.ts` files. TypeScript basically only adds type safety to the code.

If you ran into any issues with TypeScript, it is most likely that you can workaround it by simply removing type safety checks. Let's say you get an error telling that `myMethod(foo)` is incompatible with something else, if you use `myMethod(foo as any)` it will not complain anymore.

### Sass
Just like TypeScript, regular CSS can be used on `.scss` files so no mystery here either.

### Webpack
Webpack in the other hand is quite difficult to learn and configure, however all configurations needed are [already here](webpack.config.js) for you to use. At least the user base of webpack is huge so it will be easy to find documentation for whatever changes you may need in the future.

## Running locally
1 - Make sure you have the latest source version from your branch:

 - `git fetch origin;`
 - `git checkout daniel;`
 - `git pull origin daniel;`
 
2 - And have all dependencies installed:
 - `npm install;`
 
3 - Then start the development server:
 - `npm run start:hmr;`

4 - Check if you can access the app at:
 - http://localhost:8080

You can contact me if you get in trouble in any of these steps.

## Developing
I'd recommend you to use a TypeScript aware editor. WebStorm and vscode are two good options.
Once you have the local server running you can edit whatever files you need and once you save them, webpack will detect the changes and reload the page in your web browser when needed.

## Building
You can build the visualization with `npm run build;`. Once it is complete, a "dist" folder will be created and its contents can be put on the document root of a webserver. The latest build output can be found, for example, in the [gh-pages](https://github.com/snolflake/d3-compare-regions/tree/gh-pages) branch of this repo.

### Base Url
One **very important** setting for publishing the visualization somewhere else is this line from the [webpack config](webpack.config.js):
```
const PROD_HREF = '/d3-compare-regions/'
```

Since Github pages publishes this repo's demo at "http://snolflake.github.io/d3-compare-regions/" we need to set `PROD_BASE_HREF` to "/d3-compare-regions/". If you're going to publish the visualization demo in another path set `PROD_BASE_HREF` to that path and, if doesn't have an URL prefix at all, set it to "/".

Once we have finished the visualization, if you want to consume it from within another application or something, we can tweak the build script to not generate the `index.html` and everything, instead to generate only a `viz.js` which can be initialized from regular JavaScript pretty much like what happends in the [`demo.ts`](src/demo.ts) file.


----------

Hopefully there is already info enough to get you started. If not don't worry, I will be available to clarify any questions.

Good luck!
