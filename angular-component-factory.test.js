'use strict';

describe('Service: componentFactory', function () {

    var componentFactory;

    beforeEach(function () {
        module('socklessJS.utils.componentFactory');

        inject(function(_componentFactory_) {
            componentFactory = _componentFactory_;
        });
    });

    it('should be truthy', function () {
        expect(!!componentFactory).toBeTruthy();
    });

    it('should return a default directive definition object with templateUrl when it receives an empty object', function () {
        expect(componentFactory.createComponent('test',{}).templateUrl).toEqual('views/components/test/test.html');
    });

    it('should return a default directive definition object with restrict E, when it receives an empty object', function () {
        expect(componentFactory.createComponent('test',{}).restrict).toEqual('E');
    });

    it('should not attach any convention templateUrl if template is set to false', function () {
        expect(componentFactory.createComponent('test',{
            template: 'false'
        }).templateUrl).toBeUndefined();
    });

    it('should set template back to undefined if template was set to "false"', function () {
        expect(componentFactory.createComponent('test',{
            template: 'false'
        }).template).toBeUndefined();
    });

    it('should not override templateUrl if one is specified', function () {
        expect(componentFactory.createComponent('test',{
            templateUrl: 'a'
        }).templateUrl).toEqual('a');
    });

    it('should not override templateUrl if template is specified', function () {
        expect(componentFactory.createComponent('test',{
            template: 'a'
        }).templateUrl).toBeUndefined();
    });

    it('should attach a new scope if scope is not defined', function () {
        expect(componentFactory.createComponent('test',{
        }).scope).not.toBeUndefined();
    });

    it('should NOT attach a new scope if scope is defined', function () {
        expect(componentFactory.createComponent('test',{
            scope: {a:'yup'}
        }).scope.a).toEqual('yup');
    });

    it('should pass replace along, and only if it was undefined set it to true', function () {
        expect(componentFactory.createComponent('test',{}).replace).toBe(true);
        expect(componentFactory.createComponent('test',{replace: undefined}).replace).toBe(true);
        expect(componentFactory.createComponent('test',{replace:true}).replace).toBe(true);
    });

    it('should pass orig replace value along, if it was not undefined', function () {
        expect(componentFactory.createComponent('test',{replace:false}).replace).toBe(false);
        expect(componentFactory.createComponent('test',{replace:''}).replace).toBe('');
        expect(componentFactory.createComponent('test',{replace:{'a':'b'}}).replace.a).toBe('b');
    });


    it('should apply snake-case to component name - ex. snakeCase -> snake-case', function () {
        expect(componentFactory.createComponent('snakeCase',{}).templateUrl).toBe('views/components/snake-case/snake-case.html');
        expect(componentFactory.createComponent('snakeCaseCase',{}).templateUrl).toBe('views/components/snake-case-case/snake-case-case.html');
        expect(componentFactory.createComponent('snakeCaseCaseSnake',{}).templateUrl).toBe('views/components/snake-case-case-snake/snake-case-case-snake.html');
    });

    it('should not split multiple capital letters into camelCase (i.e. NameXML -> name-xml', function() {
        expect(componentFactory.createComponent('nameXML',{}).componentSnakeName).toBe('name-xml');
    });

    it('should not snake case the first letter', function() {
        expect(componentFactory.createComponent('NameXML',{}).componentSnakeName).toBe('name-xml');
    });

    it('should remove "Component" suffix from templateUrl', function () {
        expect(componentFactory.createComponent('testComponent',{}).templateUrl).toBe('views/components/test/test.html');
    });

});

describe('Module decorator', function () {

    var $compileProvider, testModule;

    beforeEach(function () {
        testModule = angular.module('testModule', []);
        angular.componentFactory.moduleDecorator(testModule);

        module('testModule',function (_$compileProvider_) {
            $compileProvider = _$compileProvider_;
            spyOn($compileProvider,'directive');
        });

        inject(function () {});
    })

    it('should decorate module with component namespace', function() {
        expect(typeof testModule.component).toBe('function');
    });

    it('should register a directive when component is called', function() {

        testModule.component('test', function (injectedThing) {
            return {
                link: function () {
                    injectedThing('Loaded!');
                }
            }
        });

        var call = $compileProvider.directive.mostRecentCall.args;
        var injectedThing = jasmine.createSpy('injectedThing');
        var name = call[0];
        var factory = call[1];

        var $injector = {
            invoke: function (constructor) {
                return constructor(injectedThing);
            }
        };
        var directive = factory($injector);
        directive.link();


        expect(name).toEqual('testComponent');
        expect(injectedThing).toHaveBeenCalled();
    });
});
