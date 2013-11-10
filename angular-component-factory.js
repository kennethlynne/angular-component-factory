'use strict';

angular.module('socklessJS.utils.componentFactory', [])
    .factory('componentFactory', function() {
        return {
            createComponent: function(componentName, constructor) {

                var componentViewPath = 'views/components/'; //Change this variable to fit your needs

                if(!constructor.template && constructor.template !== 'false')
                {
                    var componentSnakeName = componentName.replace(/[A-Z]/g, function (match) {
                        return "-"+match.toLowerCase();
                    });

                    componentSnakeName = componentSnakeName.replace(/-component/,'');
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
    });