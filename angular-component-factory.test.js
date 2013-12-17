'use strict';

describe('Service: componentFactory', function () {

    var componentFactory;

    beforeEach(function () {
        module('componentFactory');

        inject(function (_componentFactory_) {
            componentFactory = _componentFactory_;
        });
    });

    it('should be truthy', function () {
        expect(!!componentFactory).toBeTruthy();
    });

    it('should return a default directive definition object with templateUrl when it receives an empty object', function () {
        expect(componentFactory('test', {}).templateUrl).toEqual('views/components/test/test.html');
    });

    it('should return a default directive definition object with restrict E, when it receives an empty object', function () {
        expect(componentFactory('test', {}).restrict).toEqual('E');
    });

    it('should not attach any convention templateUrl if template is set to false', function () {
        expect(componentFactory('test', {
            template: 'false'
        }).templateUrl).toBeUndefined();
    });

    it('should set template back to undefined if template was set to null', function () {
        expect(componentFactory('test', {
            template: null
        }).template).toBeUndefined();
    });

    it('should not override templateUrl if one is specified', function () {
        expect(componentFactory('test', {
            templateUrl: 'a'
        }).templateUrl).toEqual('a');
    });

    it('should not override templateUrl if template is specified', function () {
        expect(componentFactory('test', {
            template: 'a'
        }).templateUrl).toBeUndefined();
    });

    it('should attach a new scope if scope is not defined', function () {
        expect(componentFactory('test', {
        }).scope).not.toBeUndefined();
    });

    it('should NOT attach a new scope if scope is defined', function () {
        expect(componentFactory('test', {
            scope: {a: 'yup'}
        }).scope.a).toEqual('yup');
    });

    it('should pass replace along, and only if it was undefined set it to true', function () {
        expect(componentFactory('test', {}).replace).toBe(true);
        expect(componentFactory('test', {replace: undefined}).replace).toBe(true);
        expect(componentFactory('test', {replace: true}).replace).toBe(true);
    });

    it('should pass orig replace value along, if it was not undefined', function () {
        expect(componentFactory('test', {replace: false}).replace).toBe(false);
        expect(componentFactory('test', {replace: ''}).replace).toBe('');
        expect(componentFactory('test', {replace: {'a': 'b'}}).replace.a).toBe('b');
    });


    it('should apply snake-case to component name - ex. snakeCase -> snake-case', function () {
        expect(componentFactory('snakeCase', {}).templateUrl).toBe('views/components/snake-case/snake-case.html');
        expect(componentFactory('snakeCaseCase', {}).templateUrl).toBe('views/components/snake-case-case/snake-case-case.html');
        expect(componentFactory('snakeCaseCaseSnake', {}).templateUrl).toBe('views/components/snake-case-case-snake/snake-case-case-snake.html');
    });

    it('should not split multiple capital letters into camelCase (i.e. NameXML -> name-xml', function () {
        expect(componentFactory('nameXML', {}).componentSnakeName).toBe('name-xml');
    });

    it('should not snake case the first letter', function () {
        expect(componentFactory('NameXML', {}).componentSnakeName).toBe('name-xml');
    });

    it('should remove "Component" suffix from templateUrl', function () {
        expect(componentFactory('testComponent', {}).templateUrl).toBe('views/components/test/test.html');
    });

});

describe('Provider: componentFactoryProvider', function () {

    var componentFactoryProvider, componentFactory;

    beforeEach(function () {
        module('componentFactory', function (_componentFactoryProvider_) {
            componentFactoryProvider = _componentFactoryProvider_;
        });

        inject(function (_componentFactory_) {
            componentFactory = _componentFactory_;
        });

    });

    it('should use the provided value as template url', function () {
        componentFactoryProvider.setViewPath('CONFIGURED/');
        expect(componentFactory('test', {}).templateUrl).toBe('CONFIGURED/test/test.html');
    });

    it('should handle functions as template urls', function () {
        componentFactoryProvider.setViewPath(function (snakeCased, original) {
            return 'components/' + snakeCased + '/some-path/views/' + original + '.html';
        });
        expect(componentFactory('testThing', {}).templateUrl).toBe('components/test-thing/some-path/views/testThing.html');
    })
});

describe('Module decorator', function () {

    var $compileProvider, testModule, componentFactory, $injector;

    beforeEach(function () {
        testModule = angular.module('testModule', []);
        angular.componentFactory.moduleDecorator(testModule);

        componentFactory = jasmine.createSpy('componentFactory').andReturn('directive definition object');

        module('testModule', function (_$compileProvider_, $provide) {
            $compileProvider = _$compileProvider_;
            spyOn($compileProvider, 'directive');

            $provide.value('componentFactory', componentFactory);
        });

        inject(function (_$injector_) {$injector = _$injector_});
    })

    it('should decorate module with component namespace', function () {
        expect(typeof testModule.component).toBe('function');
    });

    it('should register a directive when component is called', function () {

        var injector = {
            invoke: angular.noop
        }

        testModule.component('test');

        var call = $compileProvider.directive.mostRecentCall.args;
        var name = call[0];
        var factory = call[1][2];

        expect(name).toEqual('testComponent');
        expect(factory(injector, componentFactory)).toEqual('directive definition object');
    });

    it('should inject componentFactory into the decorated module', function() {
        expect($injector.has('componentFactory')).toBeTruthy();
    });
});