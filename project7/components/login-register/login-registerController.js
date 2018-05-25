'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$location', '$resource', 
    function ($scope, $location, $resource) {
      
        $scope.login = {};
        $scope.register = {};
        $scope.login.requestLogin = function () {
            var User = $resource("/admin/login");
            User.save({login_name: $scope.login.username, password: $scope.login.password})
                .$promise.then(function(user) {
                    if (typeof user === "undefined") {
                        // display error TODO
                        console.log("TODO");
                    } else {
                        $scope.$parent.admin.firstname = user.first_name;
                        $scope.$parent.admin.isLoggedIn = true;
                        $location.path("/users/" + user._id);
                    }
             });
        };
        $scope.login.requestRegister = function () {
            //TODO reject if password fields don't match
            var User = $resource("/user");
            User.save({login_name: $scope.register.username,
                       password: $scope.register.password,
                       first_name: $scope.register.firstname,
                       last_name: $scope.register.lastname,
                       user_location: $scope.register.user_location,
                       occupation: $scope.register.occuption,
                       description: $scope.register.description
                })
                .$promise.then(function(user) {
                    if (typeof user === "undefined") {
                        // display error TODO
                        console.log("TODO");
                    } else {
                        $scope.$parent.admin.firstname = user.first_name;
                        $scope.$parent.admin.isLoggedIn = true;
                        $location.path("/users/" + user._id);
                    }
             });
        };

}]);
