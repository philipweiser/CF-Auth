'use strict';
angular.module('CarFinderApp').factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {

    var serviceBase = 'http://localhost:56387';
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        username: "",
        name: "",
        token: "",
        claims: {}
    };

    var _register = function (registration) {

        _logOut();

        return $http.post(serviceBase + '/api/Account/Register', registration).then(function (response) {
            return response;
        });

    };

    var _deserializeClaims = function (claimsString) {
        var claimsArray = eval(claimsString);
        var claimsDict = {};
        for(var i = 0; i < claimsArray.length; i++)
        {
            if (typeof claimsDict[claimsArray.ClaimType] === 'undefined')
                claimsDict[claimsArray[i].ClaimType] = [];
            claimsDict[claimsArray[i].ClaimType].push(claimsArray[i].ClaimValue);
        }
        return claimsDict;
    }

    var _login = function (loginData) {

        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

        var deferred = $q.defer();

        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            var claims = _deserializeClaims(response.claims);

            _authentication.isAuth = true;
            _authentication.username = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'][0];
            _authentication.name = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'][0];
            _authentication.claims = claims;
            _authentication.token = response.access_token;
            
            localStorageService.set('authorizationData', _authentication);

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.name = "";
        _authentication.claims = null;
        _authentication.token = "";

    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.username = authData.claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'][0];
            _authentication.name = authData.claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'][0];
            _authentication.claims = authData.claims;
            _authentication.token = authData.token;
        }

    }

    authServiceFactory.register = _register;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;

    return authServiceFactory;
}]);

