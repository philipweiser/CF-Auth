angular.module('CarFinderApp')
    .controller('registerController', ['$scope', '$location', '$timeout', 'authService', function ($scope, $location, $timeout, authService) {

            $scope.savedSuccessfully = false;
            $scope.message = "Register a new account";
            $scope.isError = false;

            $scope.registerData = {
                Email: "",
                Password: "",
                ConfirmPassword: ""
            };

            $scope.register = function () {

                authService.register($scope.registerData).then(function (response) {

                    $scope.savedSuccessfully = true;
                    $scope.message = "User has been registered successfully, you will be redirected to login page in 2 seconds.";
                    messageDelay(2, redirectCallback);
                },
                 function (response) {
                     var errors = [];
                     for (var key in response.data.ModelState) {
                         for (var i = 0; i < response.data.ModelState[key].length; i++) {
                             errors.push(response.data.ModelState[key][i]);
                         }
                     }
                     $scope.message = "Failed to register user due to:" + errors.join(' ');
                     $scope.isError = true;
                     messageDelay(2, registerErrorCallback);
                 });
            };

            //Turn this into a directive

            var messageDelay = function (interval, callBack) {
                var timer = $timeout(function () {
                    $timeout.cancel(timer);
                    //Anything I need to do
                    callBack();
                }, 1000 * interval);
            }

            var registerErrorCallback = function () {
                $scope.message = "Register a new account";
                $scope.isError = false;
            }

            var redirectCallback = function () {
                $scope.message = "Register a new account";
                $scope.isError = false;
                $location.path('/login');
            }
        }]).directive('passwordVerify', function () {
            return {
                templateUrl: 'clientApp/directives/templates/passwordVerifyTemplate.html',
                restrict: 'A', // only activate on element attribute
                require: '?ngModel', // get a hold of NgModelController
                link: function (scope, elem, attrs, ngModel) {
                    if (!ngModel) return; // do nothing if no ng-model
                    console.log(attrs);
                    // watch own value and re-validate on change
                    scope.$watch('registerData.p7assword', function () {
                        validate();
                    });

                    // observe the other value and re-validate on change
                    scope.$watch('registerData.confirmPassword', function (val) {
                        validate();
                    });

                    var validate = function () {
                        var val1 = scope.registerData.password;
                        var val2 = scope.registerData.confirmPassword;
                        // set validity
                        ngModel.$setValidity('passwordVerify', val1 === val2);
                    };
                }
            }
        });