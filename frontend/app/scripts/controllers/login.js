'use strict';

angular.module('rentFlatApp')
  .controller('LoginCtrl', function ($scope,alert,auth) {
    $scope.submit = function(){

      auth.login($scope.email,$scope.password)
        .success(function (res) {
          alert('success','Teşekkürler ','Hoşgeldin, '+res.user.email +'!');
        })
        .error(function (err) {
          alert('warning','Hata meydana geldi :( ',err.message);
        });
    };
  });
