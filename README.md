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

> npm package [https://www.npmjs.com/package/myenergi-api](https://www.npmjs.com/package/myenergi-api)

```
npm install myenergi-api
```

## Usage

### Create an instance of MyEnergi class.
Here you find all methods needed to communicate with your myenergi hub. You will have to create one instance per hub if you have more than one.
```typescript
const myenergi = new MyEnergi("1234567", "!3uper3ecretPassw0rd");
```

### Get status of all myenergi devices
Return status of all myenergi devices connected to the hub. Zappi, Eddi and Harvi
```typescript
const statusAll = await myenergi.getStatusAll();
console.log(statusAll);
```

### Get status of all Zappi devices.
Return status of all Zappi devices connected to the hub.
```typescript
const zappiAll: Zappi[] = await myenergi.getStatusZappiAll();
console.log(zappiAll);
```

### Get status of one Zappi device.
Return status of a Zappi device with the provided serial number.
```typescript
const sno = '1234567';
const statusZappi: Zappi = await myenergi.getStatusZappi(sno);
console.log(statusZappi);

```

### Set Zappi charge mode.
Set the current charge mode for the specified Zappi device. You can also use this function to stop charging. See [Charge Mode](#charge_mode) in the documentation below for more details.
```typescript
const sno = '1234567';
const chargeMode = ZappiChargeMode.EcoPlus;
const result = await myenergi.setZappiChargeMode(sno, chargeMode);
console.log(result);

```

### Set Zappi minimum green level (MGL)
Set minimum green level to decide how much grid power zappi uses to keep the 1.4kW minimum charge rate going. See [MGL](#mgl) in the documentation below for more details.
```typescript
const result = await myenergi.setZappiGreenLevel(sno, 75);
console.log(result);
```

### Set Zappi boost mode
In ECO and ECO+ you can use the boosts to top up your battery quickly.  There are three different boosts available. See [Boost Mode](#boost_mode) in the documentation below for more details.
```typescript
const result = await myenergi.setZappiBoostMode(sno, ZappiBoostMode.Smart, 22, '0615');
console.log(result);
```
### Get Zappi boost times
Gets the boost charge times schedule. Returns the times as list of 4 available slots.
```typescript
const result = await myenergi.getZappiBoostTimes(sno);
console.log(result);
```
### Set Zappi boost time
Sets the boost time schedule. 

The arguments are:
1. Serial number of zappi device
2. The slot number (obtained by calling getZappiBoostTimes and likely to be 11-14)
3. Start hour (0-23)
4. Start minutes (must be 0, 15, 30 or 45)
5. Duration hours (0-9)
6. Duration minutes (must be 0, 15, 30 or 45)
7. Day enablements (always starts with zero and the following seven digits are Monday-Sunday))

```typescript
const result = await myenergi.setZappiBoostTime(sno, 11, 23, 45, 2, 30, '01111111');
console.log(result);
```

### Get status for all Harvi devices
Return status of all Harvi devices connected to the hub.
```typescript
const result = await myenergi.getStatusHarviAll();
console.log(result);
```
### Get status of a specific Harvi device
Return status of a Harvi device with the provided serial number.
```typescript
const sno = '1234567';
const result = await myenergi.getStatusHarvi(sno);
console.log(result);
```
### Get status for all Eddi devices
Return status of all Eddi devices connected to the hub.
```typescript
const result = await myenergi.getStatusEddiAll();
console.log(result);
```
### Get status of a specific Eddi device
Return status of a Eddi device with the provided serial number.
```typescript
const sno = '1234567';
const result = await myenergi.getStatusEddi(sno);
console.log(result);
```


## From myenergi documentation
<a name="myenergi_documentation"></a>
<a name="charge_mode"></a>
### Zappi charge modes.
zappi has four charge modes to help you charge your EV

| Mode | Description |
|------|-------------|
| FAST | Charge your EV as fast as possible – this is just like a dumb charger.  As soon as your EV is plugged it it will start charging and draw as much power as it can |
| ECO  | In this mode, zappi will try to control the power going to your EV to match any surplus generation. However, as the EV charging standard says that the minimum charge rate is 1.4kW. If your surplus generation goes below this then the car will continue charging, taking extra power from the grid as needed to get to the 1.4kW minimum charge rateIf you want to charge your car quickly (for instance to top up the battery with cheap overnight electricity) then use one of the boosts to charge it at full power |
| ECO+ 	| Like ECO, zappi will control the power going to your EV to match the surplus generation. However, if the surplus power goes below 1.4kW then zappi will pause the charge so you are not taking power from the grid. (*** See MGL below ***) If you want to charge your car quickly (for instance to top up the battery with cheap overnight electricity) then use one of the boosts to charge it at full power |
| STOP  | In STOP mode zappi will not charge your car Boosts are also blocked. |

<a name="boost_mode"></a>
### Zappi boost modes.
In ECO and ECO+ you can use the boosts to top up your battery quickly.  There are three different boosts available
| Mode | Description |
|------|-------------|
| Manual | Charge your EV straight away with a set amount of energy (kWh) Use the slider in the app or touch on the boost power number to set an exact charge energy |
| Smart | With Smart Boost you tell zappi how much energy you want to add to your battery and the target time. Zappi will start a quick charge at full power to test the charge speed but then goes back to the normal operation for ECO and ECO+, matching the charge rate to your spare generation. A boost at full power will then take place to top up your battery to the target value by the time set. With Smart Boost your charge will be as green as possible whilst making sure your battery has the desired energy added to it |
| Scheduled | With Scheduled Boost you can set up to four time periods when the zappi will charge your EV at full power. This is useful for charging your car when electricity is cheap, but we would recommend you use the “My Flexible Tariff” settings in the myenergi online account (myaccount.myenergi.com) so these are set for you automatically. |

<a name="mgl"></a>
### Minimum Green Level (MGL)
Minimum Green Level allows you to decide how much grid power zappi uses to keep the 1.4kW minimum charge rate going.
The feature only works in ECO+ and was introduced for those people who want to squeeze as much of their surplus generation into the EV battery.

With MGL set to 100% all the power going to your EV will come from the local generation.
If you have less than 1.4kW of local surplus generation available then zappi will pause the charge.  Of course this means that you could be exporting some surplus generation to the grid…

With MGL set to 50% then zappi will take up to 700W from the grid to keep the charge going

If you want to make sure that all your surplus generation is used to charge your EV, then try setting MGL to 1%
