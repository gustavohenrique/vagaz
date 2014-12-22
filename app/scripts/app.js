(function (angular) {
    'use strict';

    var app = angular.module('mainApp', ['utilApp', 'angucomplete']);

    app.service('mainService', ['$http', function ($http) {
        this.load = function (success, error) {
            $http.get('vagas.json').success(success).error(error);
        };
    }]);

    app.controller('MainCtrl', ['$scope', 'mainService', 'util', function ($scope, mainService, util) {
        
        $scope.isLoading = true;
        
        $scope.resultadosFiltro = [];
        
        $scope.filtro = {
            campo: '',
            empresa: '',
            titulo: '',
            local: ''
        };

        $scope.$watch('filtro.campo', function (newValue, oldValue) {
            $scope.resultadosFiltro = [];
        });

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
            var cargos = [];
            for (var c = 0; c < titulos.length; c++) {
                cargos.push({
                    titulo: titulos[c]
                });
            }

            localidades.sort(alphabetical);
            var cidades = [];
            for (var c = 0; c < localidades.length; c++) {
                cidades.push({
                    nome: localidades[c]
                });
            }
            
            $scope.cargos = cargos;
            $scope.cidades = cidades;
            $scope.isLoading = false;
            
        }, function () {});

        var _filtrar = function (chave) {
            var comparator = function (val, c, resultado) {
                return val.nome === job.nome;
            };
            
            var resultado = [],
                valor = $scope.filtro[chave].title;
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
                            var vagasExistentes = resultado[index].vagas;
                            // so add se vaga nao foi adicionada ainda
                            var indexVagaExistente = util.findIndex(vagasExistentes, function (v, c, r) {
                                return v.url === vaga.url;
                            });
                            if (indexVagaExistente < 0) {
                                vagasExistentes.push(vaga);
                            }
                        }
                    }
                }
            }
            $scope.resultadosFiltro = resultado;
        };

        $scope.filtrar = function () {
            _filtrar($scope.filtro.campo);
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


