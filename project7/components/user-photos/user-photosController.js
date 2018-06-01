'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource',
  function($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;

    $scope.model = {}; 
    $scope.commenting = {};
    $scope.commenting.id = "";
    $scope.commenting.text = "";
    $scope.commenting.add = function (id) {
        if ($scope.commenting.id === id) {
            return;
        }
        $scope.commenting.text = "";
        $scope.commenting.id = id;
    };
    $scope.commenting.submit = function () {
        var Comment = $resource("/commentsOfPhoto/:id", {id: $scope.commenting.id});
        Comment.save({comment: $scope.commenting.text}).
            $promise.then(function() {
                /* Update photos. */
                var Photos = $resource("/photosOfUser/:id", {id: userId});
                Photos.query({}).$promise.then(function(photos) {
                    $scope.model.photos = photos;
                    $scope.commenting.id = "";
                    $scope.commenting.text = "";
                });
        });
    };
    $scope.commenting.cancel = function () {
        $scope.commenting.id = "";
        $scope.commenting.text = "";
    };

    var User = $resource("/user/" + userId);
    User.get({}).$promise.then(function(user) {
        $scope.model.user = user;
    });
    
    var Photos = $resource("/photosOfUser/" + userId);
    Photos.query({}).$promise.then(function(photos) {
        $scope.model.photos = photos;
    });


    $scope.switchToUserProfile = function (id) {
        return location.href.replace(window.location.hash, "#!/users/" + id);
    };

  }]);
