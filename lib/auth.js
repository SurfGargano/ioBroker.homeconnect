'use strict';

const request = require('request');

function authUriGet(scope, clientID) {

  let param = "client_id=" + clientID + "&scope" + scope;

  return new Promise((resolve, reject) => {

    request({
        method: 'POST',
        url: 'https://api.home-connect.com/security/oauth/device_authorization',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: param
      },

      function (error, response, body) {

        if (!error && response.statusCode != 200) {
          let statusPost = response.statusCode;
          reject(statusPost);
        } else {

          let obj = JSON.parse(body);
          let authUri = obj.verification_uri_complete;
          let devCode = obj.device_code;
          let pollInterval = obj.interval;
          resolve([authUri, devCode, pollInterval]);

        }

      }

    );
  });
}

function tokenGet(deviceCode, clientID) {

  let param = "grant_type=device_code&device_code=" + deviceCode + "&client_id=" + clientID;

  return new Promise((resolve, reject) => {

    request({
        method: 'POST',
        url: 'https://api.home-connect.com/security/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: param
      },

      function (error, response, body) {

        if (!error && response.statusCode != 200) {
          let statusPost = response.statusCode;
          reject(statusPost);
        } else {

          let obj = JSON.parse(body);

          let token = obj.access_token;
          let refreshToken = obj.refresh_token;
          let expires = obj.expires_in;
          let tokenScope = obj.scope;
          resolve([token, refreshToken, expires, tokenScope]);

        }

      }

    );
  });
}

function getAppliances(token) {

  let param = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.bsh.sdk.v1+json'
  };

  return new Promise((resolve, reject) => {

    request({
        method: 'GET',
        url: 'https://api.home-connect.com/api/homeappliances',
        headers: param
      },
      function (error, response, body) {
        try {
          if (!error && response.statusCode != 200) {
            let statusGet = response.statusCode;
            let errorString = JSON.parse(body);
            let description = errorString.error.description;
            reject([statusGet, description]);
          } else {
            let appliances = JSON.parse(body);
            resolve(appliances);
          }
        } catch (error) {
          reject([0, body])
        }

      }

    );
  });
}


function tokenRefresh(refreshToken) {

  let param = "grant_type=refresh_token&refresh_token=" + refreshToken;

  return new Promise((resolve, reject) => {

    request({
        method: 'POST',
        url: 'https://api.home-connect.com/security/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: param
      },

      function (error, response, body) {
        try {
          if (!error && response.statusCode != 200) {
            let statusGet = response.statusCode;
            let errorString = JSON.parse(body);
            let description = errorString.error.description;
            reject([statusGet, description]);
          } else {
            let obj = JSON.parse(body);
            let token = obj.access_token;
            let refreshToken = obj.refresh_token;
            let expires = obj.expires_in;
            let tokenScope = obj.scope;
            resolve([token, refreshToken, expires, tokenScope]);
          }
        } catch (error) {
          reject([0, body])
        }


      }

    );
  });
}



module.exports.authUriGet = authUriGet;
module.exports.tokenGet = tokenGet;
module.exports.getAppliances = getAppliances;
module.exports.tokenRefresh = tokenRefresh;