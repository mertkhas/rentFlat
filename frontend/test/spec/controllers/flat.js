'use strict';

describe('Controller: FlatCtrl', function () {

  // load the controller's module
  beforeEach(module('rentFlatApp'));

  var FlatCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FlatCtrl = $controller('FlatCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
