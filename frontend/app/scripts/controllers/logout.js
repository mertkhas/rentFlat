'use strict';

angular.module('rentFlatApp')
  .controller('LogoutCtrl', function (authToken,$state) {
    authToken.removeToken();
    $state.go('main');
  });
