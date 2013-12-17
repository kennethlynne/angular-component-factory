(function (angular) {
    'use strict';

    var componentFactoryProvider = function () {

        var componentBaseViewPath = 'views/components/';

        //Default component view path factory
        var componentViewPathFactory = function (componentSnakeName, componentName) {
            return componentBaseViewPath + componentSnakeName + '/' + componentSnakeName + '.html';
        };

        this.setViewPath = function (args) {
            if (typeof args == 'string') {
                componentBaseViewPath = args;
            }
            else if(typeof args == 'function')
            {
                componentViewPathFactory = args;
            }
        };

        var componentFactory = function (componentName, constructor) {

            var ctor = constructor || {};

            if (ctor.template === undefined) {
                var componentSnakeName = componentName
                    .replace(/(?:[A-Z]+)/g, function (match) { //camelCase -> snake-case
                        return "-" + match.toLowerCase();
                    })
                    .replace(/^-/, ''); // CamelCase -> -snake-case -> snake-case

                componentSnakeName = componentSnakeName.replace(/-component/, '');
                ctor.componentSnakeName = componentSnakeName;
                ctor.templateUrl = ctor.templateUrl || componentViewPathFactory(componentSnakeName, componentName);
            }
            else if (ctor.template === null) {
                ctor.template = undefined;
            };

            if (ctor.replace === undefined) {
                ctor.replace = true;
            };

            ctor.scope = ctor.scope || {};
            ctor.restrict = ctor.restrict || 'E';

            return ctor
        };

        this.$get = function () {
            return componentFactory;
        }
    };

    var decorateModule = function (module) {

        //We need to handle components that might be registered before angular has finished loading
        var queue = [];
        //This only pushes constructors to a queue, and when angular is ready it registers the directives
        module.component = function (name, constructor) {
            queue.push({name: name, constructor: constructor});
        };

        module.config(['$compileProvider', function ($compileProvider) {
            module.component = function (name, constructor) {
                //Register decorated directives
                $compileProvider.directive((name + 'Component'), ['$injector', 'componentFactory', function ($injector, componentFactory) {
                    return componentFactory(name, $injector.invoke(constructor || angular.noop) || {});
                }]);
                return module; //To allow chaining
            };

            //Registered queued components
            angular.forEach(queue, function (component) {
                module.component(component.name, component.constructor);
            });
        }]);

        module.provider('componentFactory', componentFactoryProvider);
    };

    //Expose provider as a angular module
    angular.module('componentFactory', []).provider('componentFactory', componentFactoryProvider);

    //Expose decorator
    angular.componentFactory = {
        moduleDecorator: decorateModule
    }

}(angular));
