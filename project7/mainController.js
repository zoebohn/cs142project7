'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$location', '$rootScope', '$resource', 
    function ($scope, $location, $rootScope, $resource) {
        $scope.main = {};
        $scope.main.title = 'Users';
        
        $scope.admin = {};
        $scope.admin.firstname = "";
        $scope.admin.isLoggedIn = false;
        $scope.admin.savedPath = $location.path();

        var Login = $resource("/admin/info");
        Login.get({}).$promise.then(function(user) {
            $scope.admin.isLoggedIn = true;
            $scope.admin.firstname = user.first_name;
            $rootScope.$broadcast('login', user); //TODO finish this
            $location.path($scope.admin.savedPath);
        });

        $scope.admin.requestLogout = function () {
            var Logout = $resource("/admin/logout");
            Logout.get({}).$promise.then(function() {
                $scope.admin.isLoggedIn = false;
                $scope.admin.firstname = "";
                $rootScope.$broadcast('logout', "hi");
                $location.path("/login-register");
            }); 
        };  

        $rootScope.$on("$routeChangeStart", 
            function(event, next, current) {
                if (!$scope.admin.isLoggedIn) {
                    if (next.templateUrl !== 
                      "components/login-register/login-registerTemplate.html") {
                        $location.path("/login-register");
                    }           
                }
            }
        );

        var Test = $resource("/test/info");
        Test.get({}).$promise.then(function (info) {
            $scope.versionNumber = info.__v;
        });
        
        $scope.myName = "Zoë Bohn";

        var getCurrentContext = function () {
            if (location.hash === undefined) {
                $scope.currentContext = "";
            }
            var userId;
            var User;
            var photoHash = "!/photos/";
            var userHash = "!/users/";
            if (location.hash.includes(photoHash)) {
                userId = location.hash.split(photoHash)[1];
                User = $resource("/user/" + userId);
                User.get({}).$promise.then(function (user) {
                    $scope.currentContext = "Photos of " + 
                        user.first_name + " " + user.last_name;
                });
            } else if (location.hash.includes(userHash)) {
                userId = location.hash.split(userHash)[1];
                User = $resource("/user/" + userId);
                User.get({}).$promise.then(function(user) {
                    $scope.currentContext = user.first_name + 
                        " " + user.last_name; 
                });
            } else {
                $scope.currentContext = "Users"; 
            }
        };
        $scope.$on('$locationChangeSuccess', getCurrentContext);
        $scope.currentContext = ""; 

    }]);
