(function (angular) {
    'use strict';

    var componentFactoryProvider = function () {

        var componentViewPath = 'views/components/';

        this.setViewPath = function (path) {
            componentViewPath = path;
        };

        var componentFactory = function (componentName, constructor) {

            constructor = constructor || {};

            if (constructor.template === undefined) {
                var componentSnakeName = componentName
                    .replace(/(?:[A-Z]+)/g, function (match) { //camelCase -> snake-case
                        return "-" + match.toLowerCase();
                    })
                    .replace(/^-/, ''); // CamelCase -> -snake-case -> snake-case

                componentSnakeName = componentSnakeName.replace(/-component/, '');
                constructor.componentSnakeName = componentSnakeName;
                constructor.templateUrl = constructor.templateUrl || componentViewPath + componentSnakeName + '/' + componentSnakeName + '.html';
            }
            else if (constructor.template === null) {
                constructor.template = undefined;
            };

            if (constructor.replace === undefined) {
                constructor.replace = true;
            };

            constructor.scope = constructor.scope || {};
            constructor.restrict = constructor.restrict || 'E';

            return constructor
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
