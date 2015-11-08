'use strict';

describe('Directive: groupedBubbleChart', function () {

  // load the directive's module
  beforeEach(module('verkamiExplorerApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<grouped-bubble-chart></grouped-bubble-chart>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the groupedBubbleChart directive');
  }));
});
