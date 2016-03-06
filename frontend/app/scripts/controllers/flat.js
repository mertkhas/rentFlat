'use strict';

angular.module('rentFlatApp')
  .controller('FlatCtrl', function ($scope,$http,API_URL,alert,authToken) {

    $scope.isAuthenticated = authToken.isAuthenticated;
    $scope.selectedRow = null;

    function fetchList(){
      $http.get(API_URL + 'getFlats').success(function (flats) {
        $scope.flats = flats;
      }).error(function (err) {
        if (err) {
          alert('warning', 'Unable to get jobs', err.message);
        }
      });
    }

    fetchList();

    $scope.setClickedRow = function (index) {
      if(index !== $scope.selectedRow)
      {
        $scope.selectedRow = index;
      }else{
        makeDefault();
      }
    };

    $scope.clickedRow = function (id) {
      $scope.hiddenId = id;
      $http.post(API_URL + 'getFlat',{
        id:id
      }).success(function (flat) {
        if($scope.selectedRow !== null){
          $scope.editName = flat[0].flatName;
          $scope.editDescription = flat[0].flatDescription;
        }
      }).error(function (err) {
        if (err) {
          $scope.editName ='';
          $scope.editDescription ='';
          $scope.hiddenId = null;
        }
      });
    };


    $scope.edt = function () {
      $http.post(API_URL + 'editFlat',{
         id : $scope.hiddenId,
         flatName : $scope.editName,
         flatDescription: $scope.editDescription
      }).success(function () {
          makeDefault();
          fetchList();
         alert('success','Güncelleme işlemi başarılı...');
      }).error(function (err) {
        alert('warning', 'Güncelleme işlemi başarısız...', err.message);
      });
    };


    $scope.add = function () {
      $http.post(API_URL + 'addFlat',{
        flatName : $scope.flatName,
        flatDescription : $scope.flatDescription
      }).success(function (res) {
        console.log(res);
        $scope.flats.push(res);
        $scope.flatName = '';
        $scope.flatDescription = '';
        alert('success', 'Daire eklendi');
      }).error(function (err) {
        console.log(err);
        alert('warning', 'Daire eklemede hata');
      });
    };

    $scope.refreshList = function () {
      $http.post(API_URL + 'getFlatsWithParam',{
        search:$scope.search
      }).success(function (flats) {
        $scope.flats = flats;
      }).error(function (err) {
        if (err) {
          alert('warning', 'Unable to get jobs', err.message);
        }
      });
    };


    function makeDefault(){
      $scope.selectedRow = null;
      $scope.editName ='';
      $scope.editDescription ='';
      $scope.hiddenId = null;
    }




  });
