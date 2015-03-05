angular.module('CarFinderApp').controller('LoginController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

    $scope.loginData = {
        UserName: "",
        Password: ""
    };

    $scope.message = "";
    $scope.isError = false;

    $scope.login = function () {

        authService.login($scope.loginData).then(function (response) {

            $location.path('/');

        },
         function (err) {
             $scope.message = err.error_description;
             $scope.isError = true;
         });
    };

}]);