angular.module('CarFinderApp', ['ngRoute', 'LocalStorageModule', 'ui.bootstrap']);

angular.module('CarFinderApp').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {

    $routeProvider.when("/", {
        templateUrl: "/NgApps/views/carFinder.html"
    });

    $routeProvider.when("/login", {
        templateUrl: "/NgApps/views/Login.html"
    });

    $routeProvider.when("/register", {
        templateUrl: "/NgApps/views/register.html"
    });

    $routeProvider.otherwise({ redirectTo: "/" });
    $httpProvider.interceptors.push('authInterceptorService');
}]);


angular.module('CarFinderApp').run(['authService', function (authService) {
    authService.fillAuthData();
}]);

angular.module('CarFinderApp')
    .factory('carSvc', ['$http', function ($http) {
        var factory = {};
        factory.getYears = function () {
            return $http.get('/api/Car/GetYears')
                .then(function (response) { return response.data });
        }
        factory.getMakes = function (year) {
            var options = { params: { year: year } };
            return $http.get('/api/Car/GetMakes', options)
                .then(function (response) { return response.data });
        }
        factory.getModels = function (year, make) {
            var options = { params: { year: year, make: make } };
            return $http.get('/api/Car/GetModels', options)
                .then(function (response) { return response.data });
        }
        factory.getTrims = function (year, make, model) {
            var options = { params: { year: year, make: make, model: model } };
            return $http.get('/api/Car/GetTrims', options)
                .then(function (response) { return response.data });
        }
        factory.getRecalls = function (year, make, model) {
            return $http.jsonp('https://api.usa.gov/recalls/search?' + 'model=' + model.toUpperCase() + '&callback=JSON_CALLBACK')
                .then(function (response) {
                    return response;
                });
        }
        factory.getCar = function (year, make, model, trim) {
            var options = { params: { year: year, make: make, model: model, trim: trim } };
            return $http.get('/api/Car/GetCar', options)
                .then(function (response) { return response.data });
        }
        return factory;
    }]);
angular.module('CarFinderApp').filter('noEquals', ['$scope', function ($scope) {
    return function (value) {
        value = value.toString();
        if (value.indexOf("=") == 0) {
            return '';
        } else if (value != $scope.selected.year && value != $scope.selected.make && value != $scope.selected.model && $scope.selected.trim != value) {
            return '';
        }
        return value;
    };
}]);

angular.module('CarFinderApp')
    .controller('DisplayController', ['$scope', '$http', 'carSvc', function ($scope, $http, cSvc) {
        $('#stats').hide();
        $scope.selected = {
            year: '=year',
            make: '=make',
            model: '=model',
            trim: '=trim'
        };
        $scope.imageUrls = [];
        $scope.recalls = [];
        $scope.car = new Object();
        $scope.makeHide = true;
        $scope.modelHide = true;
        $scope.trimHide = true;
        $scope.yearHide = true;
        $scope.trimPicked = true;
        $scope.imageHide = false;
        $scope.yearPlaceholder = "Year";
        $scope.makePlaceholder = "Make";
        $scope.modelPlaceholder = "Model";
        $scope.trimPlaceholder = "Trim";
        $scope.recallsHidden = true;

        $scope.noImage = function () {
            $('#recallDisplay').attr("class", "col-sm-7");
            $('#dataDisplay').attr("class", "col-sm-5");
            $scope.imageUrls = [];
            $scope.imageHide = true;
            $scope.showStats();
        };

        $scope.newImage = function () {
            $('#recallDisplay').attr("class", "col-md-12");
            $('#dataDisplay').attr("class", "col-md-7");
            $scope.imageHide = false;
        }

        $scope.showStats = function () {
            $('#stats').show();
            if ($scope.recallsHidden && $scope.imageHide) {
                $('#dataDisplay').attr("class", "col-xs-12");
                $('.tableSeparator').attr("class", "col-md-6 tableSeparator");
            } else if ($scope.recallsHidden) {
                $('#dataDisplay').attr('class', 'col-md-7');
                $('.tableSeparator').attr("class", "col-md-12 tableSeparator");
            } else if ($scope.imageHide) {
                $('#recallDisplay').attr("class", "col-md-5");
                $('#dataDisplay').attr("class", "col-md-7");
            } else {
                $('#dataDisplay').attr('class', 'col-md-7');
                $('.tableSeparator').attr("class", "col-md-12 tableSeparator");
                $('#recallDisplay').attr("class", "col-md-12");
            }
            
        };
        $scope.hideStats = function () {
            $('#stats').hide();
            $('#dataDisplay').attr('class', 'col-md-7');
            $('.tableSeparator').attr("class", "col-md-12 tableSeparator");
        };

        $scope.yearChange = function () {
            $scope.yearHide = false;
            $scope.modelHide = true;
            $scope.makeHide = false;
            $scope.trimHide = true;
            $scope.hideStats();
            $scope.recallsHidden = true;
            $scope.model = "";
            $scope.trims = "";
            $scope.car = "";
            $scope.selected.make = "";
            $scope.selected.model = "";
            $scope.selected.trim = "";
            $scope.imageUrls = [];
            $scope.recalls = [];

            $scope.getMakes();
        };
        $scope.makeChange = function () {
            $scope.trimHide = true;
            $scope.modelHide = false;
            $scope.model = "";
            $scope.trims = "";
            $scope.car = "";
            $scope.imageUrls = [];
            $scope.recalls = [];
            $scope.selected.trim = "";
            $scope.selected.model = "";
            $scope.hideStats();
            $scope.recallsHidden = true;

            $scope.getModels();
        };
        $scope.modelChange = function () {
            $scope.imageUrls = [];
            $scope.recallsHidden = true;
            $scope.trims = "";
            $scope.trimHide = false;
            $scope.selected.trim = '';
            $scope.imageHide = true;
            $scope.hideStats();
            $scope.getImage();
            $scope.getTrims();
        };
        $scope.trimChange = function () {
            $scope.trimPicked = true;
            $scope.recallsHidden = true;
            $scope.getCar();
            $scope.getRecalls();
        };
        $scope.getYears = function () {
            $scope.model = "";
            $scope.trims = "";
            $scope.car = "";
            $scope.imageUrls = [];
            $scope.recalls = [];
            cSvc.getYears().then(function (data) {
                $scope.years = data;
            });
        };
        $scope.getMakes = function () {

            cSvc.getMakes($scope.selected.year).then(function (data) {
                $scope.makes = data;
            });

        };
        $scope.getModels = function () {
            cSvc.getModels($scope.selected.year, $scope.selected.make).then(function (data) {
                $scope.models = data;
            });
        };
        $scope.getTrims = function () {
            cSvc.getTrims($scope.selected.year, $scope.selected.make, $scope.selected.model).then(function (data) {
                if (data.length > 0) {
                    $scope.trimPlaceholder = "Trim";
                    $scope.trims = data;
                    $scope.trimHide = false;
                    if (data.length == 1) {
                        $scope.selected.trim = data[0];
                        $scope.trims = data;
                        $scope.trimChange();
                    }
                } else {
                    $scope.trimHide = false;
                    $scope.getCar();
                    $scope.showStats();
                    $scope.imageHide = false;
                    $scope.trimPlaceholder = "No Trim Options";
                }
            });
        };
        $scope.getRecalls = function () {
            cSvc.getRecalls($scope.selected.year, $scope.selected.make, $scope.selected.model).then(function (data) {
                var theData = data.data.success.results;
                var toRet = [];
                for (i = 0; i < theData.length; i++) {
                    for (j = 0; j < theData[i].records.length; j++) {
                        if (theData[i].records[j].model == $scope.selected.model.toUpperCase() && theData[i].records[j].year == $scope.selected.year) {
                            if (toRet.indexOf(theData[i]) < 0) {
                                toRet.push(theData[i]);
                            }
                        }
                    }
                }
                $scope.recalls = toRet;
                if (toRet.length < 1) {
                    $scope.recallsHidden = true;
                } else {
                    $scope.recallsHidden = false;
                }
                
            }).then(function () { $scope.showStats(); });
        };
        $scope.getCar = function () {
            cSvc.getCar($scope.selected.year, $scope.selected.make, $scope.selected.model, $scope.selected.trim).then(function (data) {
                $scope.car = data;
            });
        };
        $scope.getImage = function () {
            var res = new EDMUNDSAPI('9c7mrbr3e3pjzpvgj693x69a');
            res.api('/api/vehicle/v2/' + $scope.selected.make + '/' + $scope.selected.model + '/' + $scope.selected.year, null, success, fail);
            function success(response1) {
                if (response1.status == undefined) {
                    $scope.getImageById(response1.styles);
                } else {
                    $scope.noImage();
                }
            }
            function fail(data) {
                console.log('FAIL!!!!!!!!!!!!!!!' + data);
            }
        };
        $scope.getImageById = function (styles) {
            for (k = 0; k < styles.length; k++) {
                var res = new EDMUNDSAPI('9c7mrbr3e3pjzpvgj693x69a');
                res.api('/v1/api/vehiclephoto/service/findphotosbystyleid', { styleId: styles[k].id }, success, fail);
                function success(response) {
                    var theImage = '';
                    for (i = 0; i < response.length && i < 5; i++) {
                        if (response[i].subType == "exterior" && (response[i].shotTypeAbbreviation == "S" || response[i].shotTypeAbbreviation == "FQ")) {
                            for (j = 0; j < response[i].photoSrcs.length && j < 5; j++) {
                                if (response[i].photoSrcs[j].indexOf("400") > 0) {
                                    theImage = response[i].photoSrcs[j];
                                }
                            }
                        }
                    }
                    if ($scope.imageUrls.indexOf('http://media.ed.edmunds-media.com' + theImage) < 0 && theImage != '') {
                        $scope.imageUrls.push('http://media.ed.edmunds-media.com' + theImage);
                        $scope.newImage();
                    }

                }
                function fail(data) {
                    console.log("Fail. " + data);
                    if ($scope.imageUrls.length < 1) {
                        $scope.noImage();
                    }
                }
            }

            $scope.$apply();
        }

        $scope.getYears();
    }]);