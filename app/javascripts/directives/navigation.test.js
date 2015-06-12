// describe keyword is used to define a test suite (group of tests)
describe('navigation directive', function() {

    // declare some global vars to be used in the tests
    var elm,        // our directive jqLite element
        scope;      // the scope where our directive is inserted

    // load the modules we want to test
    beforeEach(module('navigation'));

    // before each test
    // creates a fresh scope
    beforeEach(inject(function(_$rootScope_, $compile) {
        scope = _$rootScope_.$new();
        scope.testModel = 42;
    }));

    function compileDirective(tpl) {
        // compile a fresh directive with the given template, or default
        // compile the tpl with the $rootScope created above
        // wrap our directive inside a form to be able to test
        // that our form integration works well (via ngModelController)
        if (!tpl) tpl = '<div mle-input-integer ng-model="testModel"></div>';
        tpl = '<form name="form">' + tpl + '</form>';
        // inject allows you to use AngularJS dependency injection
        // to retrieve and use other services
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$digest();
    }

    describe('initialisation', function() {
        // before each test in this block, generates a fresh directive
        beforeEach(function() {
            compileDirective();
        });
        // a single test example
        it('should produce 2 buttons and a input', function() {
            expect(elm[0].querySelectorAll('.input-group-addon').length).toEqual(2);
            expect(elm.find('input').length).toEqual(1);
        });
        it('should check validity on init', function() {
            expect(scope.form.$valid).toBeTruthy();
        });
    });
    describe('bounds detection for MIN', function() {
        it('should update form validity initialy', function() {
            scope.testMin = 45;
            compileDirective('<mle-input-integer min="testMin" ng-model="testModel"></mle-input-integer>');
            expect(scope.form.$valid).toBeFalsy();
        });
        it('should expose isOverMin method on the isolated scope', function() {
            compileDirective();
            expect(elm.isolateScope().isOverMin).toBeDefined();
        });
        it('isOverMin method should return false when no min defined', function() {
            compileDirective();
            expect(elm.isolateScope().isOverMin()).toBeFalsy();
        });
        it('isOverMin method should return false when min not reached', function() {
            compileDirective('<div mle-input-integer min="40" ng-model="testModel"></div>');
            expect(elm.isolateScope().isOverMin()).toBeFalsy();
        });
        it('isOverMin method should return true when min reached', function() {
            compileDirective('<div mle-input-integer min="45" ng-model="testModel"></div>');
            expect(elm.isolateScope().isOverMin()).toBeTruthy();
        });
        it('decrease button should be disabled when min reached.', function() {
            compileDirective('<div mle-input-integer min="40" ng-model="testModel"></div>');
            var buttonDown = elm[0].querySelectorAll('.input-group-addon')[0];
            expect(buttonDown).toBeDefined();
            var aElmAttr = angular.element(buttonDown).attr('disabled');
            expect(aElmAttr).not.toBeDefined();


            scope.testModel = 40;
            scope.$digest();

            buttonDown = elm[0].querySelectorAll('.input-group-addon')[0];
            expect(buttonDown).toBeDefined();
            aElmAttr = angular.element(buttonDown).attr('disabled');
            expect(aElmAttr).toEqual('disabled');
        });
        it('min can be updated dynamically and update button disabled status', function() {
            scope.testMin = 42;
            compileDirective('<div mle-input-integer min="testMin" ng-model="testModel"></div>');

            var buttonDown = elm[0].querySelectorAll('.input-group-addon')[0];
            expect(buttonDown).toBeDefined();
            var aElmAttr = angular.element(buttonDown).attr('disabled');
            expect(aElmAttr).toBeDefined();
            expect(aElmAttr).toEqual('disabled');

            scope.testMin = 40;
            scope.$digest();

            buttonDown = elm[0].querySelectorAll('.input-group-addon')[0];
            expect(buttonDown).toBeDefined();
            aElmAttr = angular.element(buttonDown).attr('disabled');
            expect(aElmAttr).not.toBeDefined();
        });
    });
    describe('bounds detection for MAX', function() {
        it('should update form validity initialy', function() {
            scope.testMax = 40;
            compileDirective('<div mle-input-integer max="testMax" ng-model="testModel"></div>');
            expect(scope.form.$valid).toBeFalsy();
        });
        it('should expose isOverMax method on the isolated scope', function() {
            compileDirective();
            expect(elm.isolateScope().isOverMax).toBeDefined();
        });
        it('isOverMax method should return false when no max defined', function() {
            compileDirective();
            expect(elm.isolateScope().isOverMax()).toBeFalsy();
        });
        it('isOverMax method should return false when max not reached', function() {
            compileDirective('<div mle-input-integer max="50" ng-model="testModel"></div>');
            expect(elm.isolateScope().isOverMax()).toBeFalsy();
        });
        it('isOverMax method should return true when max reached', function() {
            compileDirective('<div mle-input-integer max="35" ng-model="testModel"></div>');
            expect(elm.isolateScope().isOverMax()).toBeTruthy();
        });
        it('decrease button should be disabled when max reached.', function() {
            compileDirective('<div mle-input-integer max="45" ng-model="testModel"></div>');
            expect(angular.element(elm[0].querySelectorAll('.input-group-addon')[1]).attr('disabled')).not.toBeDefined();
            scope.testModel = 45;
            scope.$digest();
            expect(angular.element(elm[0].querySelectorAll('.input-group-addon')[1]).attr('disabled')).toEqual('disabled');
        });
        it('max can be updated dynamically and update button disabled status', function() {
            scope.testMax = 42;
            compileDirective('<div mle-input-integer max="testMax" ng-model="testModel"></div>');
            expect(angular.element(elm[0].querySelectorAll('.input-group-addon')[1]).attr('disabled')).toEqual('disabled');
            scope.testMax = 50;
            scope.$digest();
            expect(angular.element(elm[0].querySelectorAll('.input-group-addon')[1]).attr('disabled')).not.toBeDefined();
        });
    });
    describe('ngModel integration', function() {
        it('should update form validity when min changes', function() {
            scope.testMin = 40;
            compileDirective('<div mle-input-integer min="testMin" ng-model="testModel"></div>');
            expect(scope.form.$valid).toBeTruthy();
            scope.testMin =45;
            scope.$digest();
            expect(scope.form.$valid).toBeFalsy();
        });
        it('should update form validity when max changes', function() {
            scope.testMax = 50;
            compileDirective('<div mle-input-integer max="testMax" ng-model="testModel"></div>');
            expect(scope.form.$valid).toBeTruthy();
            scope.testMax =35;
            scope.$digest();
            expect(scope.form.$valid).toBeFalsy();
        });
        it('should update form validity when model changes', function() {
            scope.testMin = 40;
            compileDirective('<div mle-input-integer min="testMin" ng-model="testModel"></div>');
            expect(scope.form.$valid).toBeTruthy();
            scope.testModel = 35;
            scope.$digest();
            expect(scope.form.$valid).toBeFalsy();
        });
        // same for MAX
    });
    describe('increment', function() {
        it('should increment value', function() {
            compileDirective();
            elm.isolateScope().increment();
            expect(scope.testModel).toEqual(43);
        });
        it('should update form dirty state', function() {
            compileDirective();
            expect(scope.form.$dirty).toBeFalsy();
            elm.isolateScope().increment();
            expect(scope.form.$dirty).toBeTruthy();
        });
    });
    describe('decrement', function() {
        it('should decrement value', function() {
            compileDirective();
            elm.isolateScope().decrement();
            expect(scope.testModel).toEqual(41);
        });
        it('should update form dirty state', function() {
            compileDirective();
            expect(scope.form.$dirty).toBeFalsy();
            elm.isolateScope().decrement();
            expect(scope.form.$dirty).toBeTruthy();
        });
    });

});
