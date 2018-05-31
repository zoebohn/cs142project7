'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$rootScope', '$location', '$resource', 
    function ($scope, $rootScope, $location, $resource) {
      
        $scope.login = {};
        $scope.login.loginError = false;
        $scope.register = {};
        $scope.registerError = false;
        $scope.registerSuccess = false;

        $scope.login.requestLogin = function () {
            $scope.register.registerError = false;
            $scope.register.registerSuccess = false;
            $scope.login.loginError = false;
            var User = $resource("/admin/login");
            User.save({login_name: $scope.login.username, password: $scope.login.password})
                .$promise.then(function(user) {
                     $scope.$parent.admin.firstname = user.first_name;
                     $scope.$parent.admin.isLoggedIn = true;
                     $rootScope.$broadcast('login', user);
                     $location.path("/users/" + user._id);
             }, function(error) {
                 $scope.login.loginError = true;
             });
        };
        $scope.login.requestRegister = function () {
            $scope.login.loginError = false;
            $scope.register.registerError = false;
            $scope.register.registerSuccess = false;
            if ($scope.register.password !== $scope.register.passwordcpy) {
                $scope.register.registerError = true;
                $scope.register.errorMessage = "Error: passwords don't match.";
                return;
            }
            $scope.register.registerError = false;
            var User = $resource("/user");
            User.save({login_name: $scope.register.username,
                       password: $scope.register.password,
                       first_name: $scope.register.firstname,
                       last_name: $scope.register.lastname,
                       user_location: $scope.register.user_location,
                       occupation: $scope.register.occupation,
                       description: $scope.register.description
                })
                .$promise.then(function(user) {
                 $scope.register.registerSuccess = true;
                 $scope.register.successMessage = "Successfully registered " + user.login_name + "! Please login above.";
                 $scope.register.username = "";
                 $scope.register.password = "";
                 $scope.register.passwordcpy = "";
                 $scope.register.firstname = "";
                 $scope.register.lastname = "";
                 $scope.register.user_location = "";
                 $scope.register.occupation = "";
                 $scope.register.occupation = "";
                 $scope.register.description = "";
             }, function (error) {
                 $scope.register.registerError = true;
                 $scope.register.errorMessage = "Error: registration failed. " + error.data;
             });
        };

}]);
