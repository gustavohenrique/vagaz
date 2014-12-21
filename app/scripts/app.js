(function (angular) {
    'use strict';

    var app = angular.module('mainApp', ['utilApp']);

    app.service('mainService', ['$http', function ($http) {
        this.load = function (success, error) {
            $http.get('vagas.json').success(success).error(error);
        };
    }]);

    app.controller('MainCtrl', ['$scope', 'mainService', 'util', function ($scope, mainService, util) {
        
        $scope.isLoading = true;
        
        $scope.filterOptions = {
            empresa: '',
            titulo: '',
            local: ''
        };
        $scope.resultadosFiltro = [];
        
        mainService.load(function (data) {
            $scope.jobs = [];
            var titulos = [],
                localidades = [];

            for (var i = 0; i < data.length; i++) {
                var job = data[i],
                    vagas = job.vagas;

                if (vagas.length > 0) {
                    $scope.jobs.push(job);

                    for (var x = 0; x < vagas.length; x++) {
                        vagas[x].titulo = vagas[x].titulo.trim();
                        var titulo = vagas[x].titulo;
                        if (titulos.indexOf(titulo) < 0) {
                            titulos.push(titulo);
                        }

                        vagas[x].local = vagas[x].local.replace('/ BR', '').trim();
                        var local = vagas[x].local;
                        if (localidades.indexOf(local) < 0) {
                            localidades.push(local);
                        }
                    }
                }
            }

            var alphabetical = function (a, b) {
                var A = a.toLowerCase(),
                    B = b.toLowerCase();
                if (A < B) return -1;
                if (A > B) return  1;
                return 0;
            };
            titulos.sort(alphabetical);
            localidades.sort(alphabetical);
            
            $scope.cargos = titulos;
            $scope.localidades = localidades;
            $scope.isLoading = false;
            
        }, function () {});

        var _filtrar = function (chave) {
            var comparator = function (val, c, resultado) {
                return val.nome === job.nome;
            };
            
            var resultado = [],
                valor = $scope.filterOptions[chave];
            for (var i = 0; i < $scope.jobs.length; i++) {
                var j = $scope.jobs[i],
                    job = {
                        id: i,
                        nome: j.nome,
                        url: j.url,
                        imagem: j.imagem,
                        vagas: []
                    };

                if (chave === 'empresa' && valor === job.nome) {
                    resultado = [j];
                    break;
                }

                for (var x = 0; x < j.vagas.length; x++) {
                    var vaga = j.vagas[x];

                    if (vaga[chave] === valor) {
                        var index = util.findIndex(resultado, comparator);

                        if (index < 0) {
                            job.vagas.push(vaga);
                            resultado.push(job);
                        }
                        else {
                            resultado[index].vagas.push(vaga);
                        }
                    }
                }
            }
            $scope.resultadosFiltro = resultado;
        };

        $scope.filtrarPorCargo = function () {
            _filtrar('titulo');
        };

        $scope.filtrarPorLocal = function () {
            _filtrar('local');
        };

        $scope.filtrarPorEmpresa = function () {
            _filtrar('empresa');
        };

    }]);

})(angular);

function changeTab (className) {
    'use strict';
    
    var f = function (el) {
        el.classList.remove('active');
    };
    Array.prototype.slice.call(document.querySelectorAll('a.item')).map(f);
    Array.prototype.slice.call(document.querySelectorAll('.tab.segment')).map(f);
    document.querySelector('.item.' + className).classList.add('active');
    document.querySelector('.tab.segment.' + className).classList.add('active');
}


