# Node-red-contrib-tibber Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Future releases

## Addedd
* Oauth client, switch from manual token from Tibber
* Tibber graphQL query node - make your own requests
* Tibber pricing node - get forecast and current
* Tibber statistics node
* Support for Tibber grapql subscriptions and websockets
* Dedicated support for finding cheapest predicted price tomorrow and today, return when

## Changed
* Improved error handling
* Improved error messaging
* Query node support for variable input along with query or mutation.
* Further support/test of mutation

# 0.3.0
## Changed
- Removed bespoke fetch based graphql interface, replaced with apollo. For cache and subscription support
- new Tibberlib implementation, now as class

# 0.2.0
## Addedd
- tibber query node

## Changed

## Fixed
- error handling improved
- better test coverage

# 0.1.0 (09.12.18)

## Added
* Config node for node-red
* tibberLib.js for tibber integrations
* Tibber data node, node-red, for home, consumption and pricing



