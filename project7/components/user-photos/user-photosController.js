'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource',
  function($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;

    $scope.model = {}; 

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
