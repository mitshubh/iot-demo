"use strict";

// Position control
const DefaultLatitude = 47.4760675;
const DefaultLongitude = -122.192026;
const DistanceVariation = 10;

//Altitude control
const DefaultAltitude = 0.0;
const AverageAltitude = 499.99;
const AltitudeVariation = 5;

// Velocity control
const AverageVelocity = 60.00;
const MinVelocity = 20.00;
const MaxVelocity = 120.00;
const VelocityVariation = 5;

// Acceleration control
const AverageAcceleration = 2.50;
const MinAcceleration = 0.01;
const MaxAcceleration = 9.99;
const AccelerationVariation = 1;

// Display control for position and other attributes
const GeoSpatialPrecision = 6;
const DecimalPrecision = 2;

//Default state
var state = {
  velocity: 0.0,
  velocity_unit: 'mm/sec',
  acceleration: 0.0,
  acceleration_unit: "mm/sec^2",
  latitude: DefaultLatitude,
  longitude: DefaultLongitude,
  altitude: DefaultAltitude
};

//Default device properties
var properties = {};

/**
* Restore the global state using data from the previous iteration.
*
* @param previousState device state from the previous iteration
* @param previousProperties device properties from the previous iteration
*
* */

function restoreSimulation(previousState, previousProperties) {
  // If the previous state is null, force a deafult state
  if (previousState) {
    state = previousState;
  } else {
    log("Using default state");
  }

  if (previousProperties) {
    properties = previousProperties;
  } else {
    log("Using default properties");
  }
}

/**
* Simple formula generating a random value around the AverageAltitude
* in between min and max
* */
function vary(avg, percentage, min, max) {
  log("Varying values");
  var value = avg * (1 + ((percentage/100) * (2 * Math.random()-1)));
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
}

/**
* Entry point function called by the simulation engine.
* Returns updated simulation state.
* Device property updates must call updateProperties() to persist.
*
* @param context             The context contains current time, device model and id
* @param previousState       The device state since the last iteration
* @param previousProperties  The device properties since the last iteration
* */

/*jslint unparam: true */
function main(context, previousState, previousProperties) {

  // Restore the global state before generating the new telemetry, so that
  // the telemetry can apply changes using previous function state.
  restoreSimulation(previousState, previousProperties);

  state.acceleration = vary(AverageAcceleration, AccelerationVariation, MinAcceleration, MaxAcceleration).toFixed(DecimalPrecision);
  state.velocity = vary(AverageVelocity, VelocityVariation, MinVelocity, MaxVelocity).toFixed(DecimalPrecision);


  // use the last coordinate to calculate the next set with a given variation
  var coords = varylocation(Number(state.latitude), Number(state.longitude), DistanceVariation);
  state.latitude = Number(coords.latitude).toFixed(GeoSpatialPrecision);
  state.longitude = Number(coords.longitude).toFixed(GeoSpatialPrecision);

  //Fluctuate altitude between given variation constant by more or less
  state.altitude = vary(AverageAltitude, AltitudeVariation, AverageAltitude - AltitudeVariation, AverageAltitude + AltitudeVariation).toFixed(DecimalPrecision);

  updateState(state);
}
/**
* Generate a random geolocation at some distance (in miles)
* from a given location
**/

function varylocation(latitude, longitude, distance) {
  // Convert to meters, use Earth radius, convert to radians
  var radians = (distance * 1609.344 / 6378137) * (180 / Math.PI);
  return {
    latitude: latitude + radians,
    longitude: longitude + radians / Math.cos(latitude * Math.PI / 180)
  };
}