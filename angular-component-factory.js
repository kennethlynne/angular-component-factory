(function (angular) {
  'use strict';

  var originalModule = angular.module;
  angular.module = function () {
    var module = originalModule.apply(this, arguments);

    module.provider('componentFactory', componentFactoryProvider);

    module.component = function (name, factoryFn) {
      module.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.directive(name + 'Component', ['$injector', 'componentFactory', function ($injector, componentFactory) {
          return componentFactory(name, $injector.invoke(factoryFn || angular.noop) || {});
        }]);
      }]);
    };
    return module;
  };

  var componentFactoryProvider = function () {

    var componentBaseViewPath = 'views/components/';

    //Default component view path factory
    var componentViewPathFactory = function (componentSnakeName, componentName) {
        return componentBaseViewPath + componentSnakeName + '/' + componentSnakeName + '.html';
      },

      componentFactory = function (componentName, overrides) {

        var componentSnakeName = componentName
          .replace(/(?:[A-Z]+)/g, function (match) { //camelCase -> snake-case
            return "-" + match.toLowerCase();
          })
          .replace(/^-/, ''); // CamelCase -> -snake-case -> snake-case

        var _default = {
          templateUrl: componentViewPathFactory(componentSnakeName, componentName),
          replace: true,
          scope: {},
          restrict: 'E',
          componentSnakeName: componentSnakeName
        };

        if (overrides && overrides.template) delete _default.templateUrl;

        return angular.extend(_default, overrides);
      };

    this.setViewPath = function (args) {
      if (typeof args == 'string') {
        componentBaseViewPath = args;
      }
      else if (typeof args == 'function') {
        componentViewPathFactory = args;
      }
    };

    this.$get = function () {
      return componentFactory;
    }
  };

  //Expose provider as a angular module
  angular.module('kennethlynne.componentFactory', []).provider('componentFactory', componentFactoryProvider);

}(angular));
