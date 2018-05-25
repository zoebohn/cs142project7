'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource',
  function ($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    
    $scope.model = {}; 
    var User = $resource("/user/" + userId);
    User.get({}).$promise.then(function(user) {
        $scope.model.user = user;
    });
    $scope.getPhotoLink = function () {
        return location.href.replace(window.location.hash, "#!/photos/" + userId);
    };

  }]);
