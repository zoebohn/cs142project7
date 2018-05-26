'use strict';

cs142App.controller('UserListController', ['$scope', '$resource',
    function ($scope, $resource) {
        $scope.main.title = 'Users';
        
        $scope.model = {}; 

        $scope.loadList = function() {
            var Users = $resource("/user/list");
            Users.query({}).$promise.then(function(users) {
                $scope.model.users = users;
            });
            $scope.showProfile = function (userID) {
                location.hash = "!/users/" + userID;
            };
        };
        $scope.loadList();
        $scope.$on('login', $scope.loadList);
        $scope.$on('logout', function(str) {
            $scope.model.users = undefined;
        });
    }]);

