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

cs142App.controller('MainController', ['$scope', '$location', '$http', '$rootScope', '$resource', 
    function ($scope, $location, $http, $rootScope, $resource) {
        $scope.main = {};
        $scope.main.title = 'Users';
        
        var selectedPhotoFile;   // Holds the last file selected by the user
        
        $scope.admin = {};
        $scope.admin.firstname = "";
        $scope.admin.isLoggedIn = false;
        $scope.admin.savedPath = $location.path();
        $scope.admin.isUploading = false;
        $scope.admin.uploadingError = false;
        $scope.admin.addPhoto = function() {
            $scope.admin.uploadingError = false;
            $scope.admin.isUploading = true;
            selectedPhotoFile = undefined;
        };
        $scope.admin.cancelUpload = function() {
            $scope.admin.uploadingError = false;
            $scope.admin.isUploading = false;
            selectedPhotoFile = undefined;
        };


        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            $scope.admin.uploadingError = false;
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            $scope.admin.uploadingError = false;
            return !!selectedPhotoFile;
        };

        $scope.admin.upload = function () {
            $scope.admin.uploadingError = false;
            if (!$scope.inputFileNameSelected()) {
                console.error("uploadPhoto called will no selected file");
                return;
            }

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function successCallback(response){
                $scope.admin.isUploading = false;
                selectedPhotoFile = undefined;
            }, function errorCallback(response){
                $scope.admin.uploadingError = true;
                $scope.admin.uploadingErrorMsg = "Error uploading photo: " + response.data;
            });

        }; 

        var Login = $resource("/admin/info");
        Login.get({}).$promise.then(function(user) {
            $scope.admin.isLoggedIn = true;
            $scope.admin.firstname = user.first_name;
            $rootScope.$broadcast('login', user); 
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
                if (location.hash.includes("/login-register")) {
                    $scope.currentContext = "Login";
                } else {
                    $scope.currentContext = "Users"; 
                }
            }
        };
        $scope.$on('$locationChangeSuccess', getCurrentContext);
        $scope.currentContext = ""; 

    
}]);
