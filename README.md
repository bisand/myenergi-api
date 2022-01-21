# myenergi-api

[![DeepScan grade](https://deepscan.io/api/teams/16513/projects/19831/branches/520479/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16513&pid=19831&bid=520479)
![GitHub last commit](https://img.shields.io/github/last-commit/bisand/myenergi-api)
[![Node.js CI](https://github.com/bisand/myenergi-api/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/bisand/myenergi-api/actions/workflows/node.js.yml)
[![Node.js Package](https://github.com/bisand/myenergi-api/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/bisand/myenergi-api/actions/workflows/npm-publish.yml)
![npm](https://img.shields.io/npm/v/myenergi-api)
![npm](https://img.shields.io/npm/dw/myenergi-api)
![NPM](https://img.shields.io/npm/l/myenergi-api)

NodeJS implementation of MyEnergi API for controlling Zappi, Eddi and other MyEnergi products

## General
This node.js module is used for communicating with [myenergi](https://myenergi.com/) API. It enables you to communicate, retrieve data and control some of the myeneri products like [Zappi](https://myenergi.com/product/zappi/) and [Eddi](https://myenergi.com/product/eddi/).

[Zappi](https://myenergi.com/product/zappi/) is a smart EV charger that is able to charge your EV using solar enegy or other renewable energy sources which saves energy and money. [Eddi](https://myenergi.com/product/eddi/) is a power diverter that controls up to two heating sources. It works in the same way as Zappi by diverting generated renewable enegy directly to the heating source and potentially draw the rest of the energy from the grid.

## Prerequisites
In order to use this module you have to own a myenergi [hub](https://myenergi.com/product/hub/). This will have to be registered to the [myenergi My Account](https://myaccount.myenergi.com/).
The hubs serial is used for the username and the password is the password you created when registering the product on [myenergi My Account](https://myaccount.myenergi.com/location#devices).
## Installation
> npm package [https://www.npmjs.com/package/myenergi.api](https://www.npmjs.com/package/myenergi.api)
```
npm install myenergi-api
```
## Usage
