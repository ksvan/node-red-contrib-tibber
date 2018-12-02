# Node-red-contrib-tibber w/ tibberLib

These nodes are for using the Tibber APIs. For now, this means fetching data about the site, consumption and energyprices.
Tibber is a norwegian energy provider, made for people with smart houses, wanting to save on intelligent consume of electricity.

Very EARLY stage development!

[![Build Status](https://travis-ci.com/ksvan/node-red-contrib-tibber.svg?branch=master)](https://travis-ci.com)

# Install



# Nodes and functions

## Config node
This node holds the credentials for accessing the Tibber API and your settings.

## Data node
This node provides consumption, home or pricing data and statistics for the house. Which dataset you want is defined by 'msg.payload' content sent to the node. The nodes expect json input. Yet quite simple, but this is to cater for soon to come needs to given parameters like time resolution, home ID etc etc
    
    msg.payload = '{type: 'homes'}';
    msg.payload = '{type: 'pricing'}';
    msg.payload = '{type: 'consumption'}';
    msg.payload = '{type: 'heatingSource'}';
    msg.payload = '{type: 'currentUser'}';


## Query node
This nodes lets you perform your own queries. Look up Tibber API documentation and especially their API explorer to get going.

## Error return values
Errors are returned as json objects with the following format

    {error: true, message: errorobject}

## Tibberlib
Nodejs simple module used across the nodes for different functions. Meant to cater for Tibber usage in other scenarios than node-red usage and to simplify, yet provide flexibility by having direct query possibilities too.

* Get config from file
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
To use Tibbers API, you would need to get a token from them. The simplest way is to register at http://developer.tibber.com and get a personal long lived token. They also provide the possibility to register an Oauth client with them to make more user friendly applications.

### Config of TibberLib
The lib can get endpoint config from a file in the running directory called .envt. Method ''readConfig() will load endpoint and token from this file

    {
    "token": "5aaaee58880ae4533495d97a8eafd92d7b6c433e2c2c93512174c880cf46188e",
    "url": "https://api.tibber.com/v1-beta/gql"
    }

Used with nodered, the config node should usually provide this by calling 'config(options)'.
    
    let conf = tibberLib.config({ url: 'https://bull.noshit', token: '8488484842394949jjfig3j' });

URL setting can be used if you want to provide endpoint for another version, like beta usage. Look up endpoints at http://developer.tibber.com

# Technical details
* Tibber API is GraphQL based and all
* Https connection is done async with node-fetch.

