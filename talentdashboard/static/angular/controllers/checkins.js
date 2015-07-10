angular.module('tdb.controllers.checkins', [])

    .controller('AddEditCheckInCtrl', ['$rootScope', '$scope', '$q', '$routeParams', '$location', '$modal', 'CheckIn', 'CheckInType', 'Happiness', 'Task', 'Employee', function ($rootScope, $scope, $q, $routeParams, $location, $modal, CheckIn, CheckInType, Happiness, Task, Employee) {
        var initialize = function() {
            $scope.checkin = new CheckIn({date: new Date(Date.now())});
            $scope.happiness = new Happiness({assessment: 0});
            $scope.tasks = [];
            $scope.employeeSearch = '';
            $scope.selectedEmployee = null;
        };
        initialize();

        CheckInType.query({}, function(data) {
            $scope.checkinTypes = data;
        });

        // TODO: Solr-ize this
        if (!$scope.employees) {
            Employee.query({}, function(data) {
                $scope.employees = data;
            });
        }

        $scope.selectEmployee = function(employee) {
            $scope.employeeSearch = '';
            $scope.selectedEmployee = employee;
            $scope.checkin.employee = $scope.happiness.employee = employee.id;
        };

        $scope.addTask = function(form) {
            if(form.$invalid) return;
            $scope.newTask = new Task();
        };

        $scope.editTask = function(task) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/static/angular/partials/_widgets/add-edit-task.html',
                controller: 'AddEditTaskCtrl',
                resolve: {
                    task: function () {
                        return task;
                    }
                }
            });

            modalInstance.result.then(
                function (editedTask) {
                    $rootScope.replaceItemInList($scope.tasks, task, editedTask);
                }
            );
        };

        $scope.deleteTask = function(task) {
            $rootScope.removeItemFromList($scope.tasks, task);
        };

        $scope.addTask = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/static/angular/partials/_widgets/add-edit-task.html',
                controller: 'AddEditTaskCtrl',
                resolve: {
                    task: function () {
                        return new Task({employee: $scope.selectedEmployee.id});
                    }
                }
            });

            modalInstance.result.then(
                function (newTask) {
                    $scope.tasks.push(newTask);
                }
            );
        };

        $scope.save = function (form) {
            if(form.$invalid) return;

            var saveHappiness = function() {
                if($scope.happiness.assessment) {
                    return $scope.happiness.$save();
                } else {
                    var deferred = $q.defer();
                    deferred.resolve(null);
                    return deferred.promise;
                }
            };

            // Save the Happiness, if any
            saveHappiness()
            .then(function(newHappiness) {
                if(newHappiness) {
                    $scope.checkin.happiness = newHappiness.id;
                }
                // Save the CheckIn
                $scope.checkin.$save()
                .then(function(newCheckin) {
                    var promises = [];
                    // Save the Tasks, if any
                    angular.forEach($scope.tasks, function(task) {
                       task.checkin = newCheckin.id;
                       promises.push(task.$save());
                    });
                    $q.all(promises).then(function() {
                        // Redirect to the CheckIn detail
                        $location.path("/checkins/" + newCheckin.id);
                    });
                })
            });
        };

        $scope.cancel = function() {
            initialize();
        };
    }])

    .controller('CheckInDetailsCtrl', ['$scope', '$q', '$routeParams', '$location', 'CheckIn', 'CheckInType', 'Happiness', 'Employee', function ($scope, $q, $routeParams, $location, CheckIn, CheckInType, Happiness, Employee) {
        $scope.loadCheckin = CheckIn.get({ id : $routeParams.id }, function(data) {
            $scope.checkin = data;
        }, function(response) {
            if(response.status === 404) {
                 $location.url('/404');
            }
        });
    }])
