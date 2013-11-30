(function (angular, undefined) {
    'use strict';

    var componentFactory = function() {
        return {
            createComponent: function(componentName, constructor) {

                var componentViewPath = 'views/components/'; //Change this variable to fit your needs

                if(!constructor.template && constructor.template !== 'false')
                {
                    var componentSnakeName = componentName
                        .replace(/(?:[A-Z]+)/g, function (match) { //camelCase -> snake-case
                            return "-"+match.toLowerCase();
                        })
                        .replace(/^-/, ''); // CamelCase -> -snake-case -> sake-case

                    componentSnakeName = componentSnakeName.replace(/-component/,'');
                    constructor.componentSnakeName = componentSnakeName;
                    constructor.templateUrl = constructor.templateUrl || componentViewPath + componentSnakeName + '/' + componentSnakeName + '.html';
                };

                if(constructor.template === 'false')
                {
                    constructor.template = undefined;
                };

                if(constructor.replace === undefined)
                {
                    constructor.replace = true;
                };

                constructor.scope = 	constructor.scope 		|| {};
                constructor.restrict = 	constructor.restrict 	|| 'E';

                return constructor
            }
        }
    };

    var decorateModule = function (module) {

        //We need to handle components that might be registered before angular has finished loading
        var queue = [];
        //This only pushes constructors to a queue, and when angular is ready it registers the directives
        module.component = function (name, constructor) {
            queue.push({name: name, constructor: constructor});
        };

        module.config(function ($compileProvider) {
            var compileProvider = $compileProvider;

            module.component = function (name, constructor) {
                //Register decorated directives
                compileProvider.directive( (name + 'Component'), function ($injector) {
                    return componentFactory().createComponent(name, $injector.invoke(constructor || angular.noop) || {});
                });
                return module; //To allow chaining
            };

            //Registered queued components
            angular.forEach(queue, function (component) {
                module.component(component.name,component.constructor);
            });
        });

    };

    //Expose factory to angular
    angular.module('socklessJS.utils.componentFactory', []).factory('componentFactory', componentFactory);

    //Expose decorator globally
    angular.componentFactory = {
        moduleDecorator: decorateModule
    }

}(angular));
