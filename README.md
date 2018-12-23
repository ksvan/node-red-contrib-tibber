# Node-red-contrib-tibber w/ tibberLib

These nodes are for using the Tibber APIs. For now, this means fetching data about the site, consumption and energyprices.
Tibber is a norwegian energy provider, made for people with smart houses, wanting to save on intelligent consume of electricity.

Very EARLY stage development!

[![Build Status](https://travis-ci.com/ksvan/node-red-contrib-tibber.svg?branch=master)](https://travis-ci.com) [![Greenkeeper badge](https://badges.greenkeeper.io/ksvan/node-red-contrib-tibber.svg)](https://greenkeeper.io/)

# Install
To install (node-red)
To install the stable version use the `Menu - Manage palette` option and search for `node-red-contrib-verisure`, or run the following command in your Node-RED user directory (typically `~/.node-red`):

    $ npm i node-red-contrib-verisure
    
Or, to install, download the files to a local folder, same structure. In this packages directory, run npm install or link. Switch to your .node-red directory and use npm link node-red-contrib-verisure (or npm install). Link is good if you want change the code and test.
[NPMJS link](https://www.npmjs.com/package/node-red-contrib-verisure)


# Nodes and functions

## Config node
This node holds the credentials for accessing the Tibber API and your settings.

## Data node
This node provides consumption, home or pricing data and statistics for the house. Which dataset you want is defined by 'msg.payload' content sent to the node. The nodes expect json input. Yet quite simple, but this is to cater for soon to come needs to given parameters like time resolution, home ID etc etc
    
    msg.payload = {type: 'homes'};
    msg.payload = {type: 'pricing'};
    msg.payload = {type: 'consumption'};
    msg.payload = {type: 'heatingSource'};
    msg.payload = {type: 'currentUser'};


## Query node
This nodes lets you perform your own GraphQL queries. Look up Tibber API documentation and especially their API explorer to get going.
In the future, this node is meant to also have features to make it easier to work with the data and incorporate it in the flows, hence separated from the data node. 

The node expects json wrapped graphQL queries. This is to open for more parameters in the object in the future, without having breaking changes in the node

    msg.payload = { 'query': '{ viewer { name }}'};
    msg.payload = { 'query': '{ viewer { homes { primaryHeatingSource } } }' };

## Return objects & values
This will follow the Tibber datamodel for GraphQL and be highly dependent on your actually query. It's not as fixed as when working with REST APIs.
In general, all returns top node is "data", and the next level will be dependent on what you are doing. A straigth forward query, as the built in ones, will then have a Viewer object. This contains your result. A mutation will probably have the specific results asked directly under the data object.
In general, tibberLib returns whatever is below the Data object.

An example of payload after a successful mutation for sending push notification to Tibber app.

    { payload:   { sendPushNotification: { successful: true, pushedToNumberOfDevices: 1 } }

## Error return values
Errors are returned as json objects with the following format

    {error: true, details: errorobject}

One example of error object, if you chose the predefined query 'error', you will get this
    
    [ { message: 'Cannot query field "generate" on type "Query".',
    locations: [ [Object] ],
    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } } ]

In general, the node code and tibberLib seeks to surface the underlying issues and propagate the full error stack. 

## Tibberlib
Simple nodejs module used across the nodes for different functions. Meant to cater for Tibber usage in other scenarios than node-red usage and to simplify, yet provide flexibility by having direct query possibilities too.

* Get config from file
* Set and get config
* Get Home overview 
* Get statistics
* Get consumption
* Execute grapql query

 The predefined query returns an array with home objects mostly. Use the 'get()'' function for this

    tibberLib.get('homes'); // a list of your homes and details for them all
    tibberLib.get('consumption'); // consumption data pr day for last 7 days
    tibberLib.get('pricing'); // current pricing
    tibberLib.get('heatingSource'); //primary source
    tibberLib.get('currentUser'); // active user performing this queries

The query function will return the resulting data set below result.data.viewer in the dataset from Tibber. Try their API Explorer to figure it out.


### Token
To use Tibbers API, you would need to get a token from them. The simplest way is to register at http://developer.tibber.com and get a personal long lived token. They also provide the possibility to register an Oauth client with them to make more user friendly applications. The test code in this repo uses the demo token from Tibber.

### Config of TibberLib
The lib can get endpoint config from a file in the running directory called .envt. Method ''readConfig() will load endpoint and token from this file

    {
    "token": "5asaee58823X4WE3349447a8eafd923346c433e2c23355321h24c880cf46289t",
    "url": "https://api.tibber.com/v1-beta/gql"
    }

Used with nodered, the config node will provide this by calling 'setConfig(options)'.
    
    let conf = tibberLib.setConfig({ url: 'https://bull.noshit', token: '8488484842394949jjfig3j' });

In node-red, configure the configuration node with these parameters.

URL setting can be used if you want to provide endpoint for another version, like beta usage. Look up endpoints at http://developer.tibber.com

# Technical details
* Tibber API is GraphQL based
* Https connection for these nodes are done async with node-fetch.
* Token needed is provided by Tibber at their developer portal. They also provide a demo/test token there, used in my test code here as well

## What is GraphQL
GraphQL is a query language for your API, and a server-side runtime for executing queries by using a type system you define for your data. GraphQL isn't tied to any specific database or storage engine and is instead backed by your existing code and data.

GraphQL is used like you would use REST APIs, to get data or execute function. You will connect with HTTPS and send JSON, but there is only one shared endpoint for all purposes. Getting different data is done by changing your query, not the endpoint. 

[[https://graphql.org/learn/]]

# Troubleshooting
* As always, networking issues might occur. These will be surfaced, but connection timeouts will be as slow as configured in your OS
* GraphQL errors will mostly return 400 bad query. You could debug your query with Tibbers GraphQL explorer or debug the error object and dig into the details element of it. The nodes and tibberlib will try to surface underlying errors here.
* 





