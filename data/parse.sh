#!/usr/bin/env bash

# To add states for another country simple add its alpha-3 code to STATES_FOR, following the same format
# @see https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes
STATES_FOR='["USA", "JPN", "GBR", "CHN"]'

# Just a helper to is used in the script below
HAS_STATES_LAYER="$STATES_FOR.indexOf(this.properties.country_code) !== -1"

# Not sure the about the unit of this area, but its used to remove small countries/islands
MIN_AREA=1000000000

# Before executing the script checks if all dependencies are present
command -v npm >/dev/null 2>&1 || {
    echo >&2 "Please install Node.js v6.x!";
    exit 1;
}

command -v mapshaper >/dev/null 2>&1 || {
    echo "Installing mapshaper!";
    npm i -g mapshaper;
}

# I've removed this part for now because I had to simplify some portions of the map in a specific way to get better results
# mapshaper \
#    -i ./ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces.shp snap \
#    -simplify weighted 2.2% \
#    -o ./states-simplified.json format=geojson force

mapshaper \
    -i \
        ./states-simplified.json \
        ./ne_50m_admin_0_countries/ne_50m_admin_0_countries.shp \
        snap combine-files \
    -rename-layers raw,50m \
    -rename-fields target=raw country_code=adm0_a3,country=admin,state=name,state_code=postal \
    -rename-fields target=50m country_short=name \
    `#Fix some weirdnesses from the original data` \
    -each target=raw 'country="French Guiana"; country_code="GUF"' where='country_code==="FRA" && state_code==="CY"' \
    -each target=raw 'country_code="KAZ"' where='country_code==="KAB"' \
    -filter target=raw 'country_code!=="ATA"' \
    -filter target=raw 'type_en!=="Overseas department"' \
    `#Leave only relevant data fields` \
    -filter-fields target=raw country,country_code,state,state_code \
    `#Removes a overlap that exists between USA and Russia then clips the map to remove the north/south pole areas` \
    -erase bbox=-172,62.9,-168.5,63.9 \
    -clip bbox=-181,-57,181,87 \
    `#The 50m layer is only used because its country data is more simplified, so we join some of its data with our states data` \
    -join 50m target=raw keys=country_code,adm0_a3 fields=continent,region_un,subregion,country_short \
    -each target=raw "country=country_short" \
    `#Create a layer containing all states for the desired countries` \
    -filter target=raw "$HAS_STATES_LAYER" no-replace name=state \
    -filter-fields target=state country,state,state_code \
    -each target=state "type='state', name=state, has_sublayer=false" \
    `#From the raw layer, with all states, merge the relevant states into countries and save it on its own layer` \
    -rename-fields target=raw region=region_un,sub_region=subregion \
    -filter target=raw 'region !== null' \
    -filter target=raw 'region.indexOf("Seven") === -1' \
    -dissolve country_code target=raw no-replace copy-fields=country,region,sub_region name=country \
    `#Remove too small countries and small islands` \
    -filter-slivers target=country min-area=1 remove-empty \
    -filter-islands target=country min-area="$MIN_AREA" remove-empty \
    `#Split americas region by its subregions and update all countries to reflect this change` \
    -each target=country 'region="North America"' where='sub_region === "Northern America"'  \
    -each target=country 'region="Central America"' where='sub_region === "Caribbean" || sub_region === "Central America"' \
    -each target=country 'region="South America"' where='sub_region === "South America"' \
    `#Now we can merge all countries with the same region to create the regions layer` \
    -dissolve region target=country no-replace name=region \
    -each target=region "type='region', name=region, has_sublayer=true" \
    `#Leave only relevant data on the country layer and add some data to simplify the map implementation later on` \
    -filter-fields target=country country,country_code,region \
    -each target=country "type='country', name=country, has_sublayer=$HAS_STATES_LAYER" \
    `#Also store the resulting shape of all regions combined to be used as main bounds of the map camera` \
    -dissolve target=region no-replace name=world \
    -each target=world "type='world', name='World', has_sublayer=true" \
    `#Output the results to a file named map.json containing all relevant layers` \
    -o ./map.json format=topojson target=world,region,country,state bbox force
