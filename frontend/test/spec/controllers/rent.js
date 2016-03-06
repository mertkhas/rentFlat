'use strict';

describe('Controller: RentCtrl', function () {

  // load the controller's module
  beforeEach(module('rentFlatApp'));

  var RentCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RentCtrl = $controller('RentCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
