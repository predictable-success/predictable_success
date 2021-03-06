angular.module('tdb.org.controllers', [])

    .controller('LeaderOverviewCtrl', ['$scope', '$location', '$routeParams', 'Employee', 'SalaryReport', 'TalentReport', 'User', 'analytics', 'TemplatePreferences', function ($scope, $location, $routeParams, Employee, SalaryReport, TalentReport, User, analytics, TemplatePreferences) {
        analytics.trackPage($scope, $location.absUrl(), $location.url());

        TemplatePreferences.getPreferredTemplate('team-lead-overview')
            .then(
            function (template) {
                $scope.templateUrl = template;
            }
        );

        Employee.get(
            {id: $routeParams.id},
            function (data) {
                $scope.myTeam = false;
                $scope.lead = data;
            }
        );

        $scope.talentReport = TalentReport.leadEmployees({id: $routeParams.id});
        $scope.salaryReport = SalaryReport.leadEmployees({id: $routeParams.id});
    }])

    .controller('MyTeamOverviewCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'Employee', 'SalaryReport', 'TalentReport', 'User', 'analytics', 'TemplatePreferences', function ($scope, $rootScope, $location, $routeParams, Employee, SalaryReport, TalentReport, User, analytics, TemplatePreferences) {
        /* Since this page can be the root for some users let's make sure we capture the correct page */
        var location_url = $location.url().indexOf('/my-team') < 0 ? '/my-team' : $location.url();
        analytics.trackPage($scope, $location.absUrl(), location_url);

        TemplatePreferences.getPreferredTemplate('team-lead-overview')
            .then(
            function (template) {
                $scope.templateUrl = template;
            }
        );

        User.get(
            function (data) {
                $scope.myTeam = true;
                $scope.lead = data.employee;
                $scope.employees =  Employee.query({show_hidden: true, u: $rootScope.currentUser.id});
            }
        );

        $scope.talentReport = TalentReport.myTeam();
        $scope.salaryReport = SalaryReport.myTeam();
    }])

    .controller('TeamOverviewCtrl', ['$scope', '$location', '$routeParams', 'Team', 'TeamMBTI', 'Customers', 'analytics', 'SalaryReport', 'TalentReport', 'TemplatePreferences', function ($scope, $location, $routeParams, Team, TeamMBTI, Customers, analytics, SalaryReport, TalentReport, TemplatePreferences) {
        analytics.trackPage($scope, $location.absUrl(), $location.url());

        TemplatePreferences.getPreferredTemplate('team-overview')
            .then(
            function (template) {
                $scope.templateUrl = template;
            }
        );

        Customers.get(function (data) {
            $scope.customer = data;
        });

        $scope.talentReport = TalentReport.query({team_id: $routeParams.teamId});
        $scope.salaryReport = SalaryReport.query({team_id: $routeParams.teamId});

        Team.get(
            {id: $routeParams.teamId},
            function (data) {
                $scope.team = data;
                $scope.teamId = data.id;
                $scope.team_name = data.name;
            }
        );

        $scope.show_discussions = true;
        $scope.show_vops = false;
        $scope.show_kolbe = false;
        $scope.show_myers_briggs = false;
        $scope.click_discussions = function () {
            $scope.show_discussions = true;
            $scope.show_vops = false;
            $scope.show_kolbe = false;
            $scope.show_myers_briggs = false;
            $scope.show_todos = false;
        };
        $scope.click_bio = function () {
            $scope.show_discussions = false;
            $scope.show_vops = false;
            $scope.show_kolbe = false;
            $scope.show_myers_briggs = false;
            $scope.show_todos = false;
        };
        $scope.click_vops = function () {
            $scope.show_discussions = false;
            $scope.show_vops = true;
            $scope.show_kolbe = false;
            $scope.show_myers_briggs = false;
            $scope.show_todos = false;
        };
        $scope.click_kolbe = function () {
            $scope.show_discussions = false;
            $scope.show_vops = false;
            $scope.show_kolbe = true;
            $scope.show_myers_briggs = false;
            $scope.show_todos = false;
        };
        $scope.click_myers_briggs = function () {
            $scope.show_discussions = false;
            $scope.show_vops = false;
            $scope.show_kolbe = false;
            $scope.show_myers_briggs = true;
            $scope.show_todos = false;
        };
    }])

    .controller('CoachDetailCtrl', ['analytics', 'Coachees', 'SalaryReport', 'TalentReport', '$location', '$modal', '$rootScope', '$routeParams', '$scope', function (analytics, Coachees, SalaryReport, TalentReport, $location, $modal, $rootScope, $routeParams, $scope) {
        /* Since this page can be the root for some users let's make sure we capture the correct page */
        var location_url = $location.url().indexOf('/my-coachees') < 0 ? '/my-coachees' : $location.url();
        analytics.trackPage($scope, $location.absUrl(), location_url);
        $scope.coach = $rootScope.currentUser.employee;
        Coachees.query({ id: $routeParams.id }).$promise.then(function (response) {
            $scope.employees = response;
        });
        $scope.talentReport = TalentReport.myCoachees();
        $scope.salaryReport = SalaryReport.myCoachees();
        if ($routeParams.edit_profile=='true') {
            editProfile();
        }

        function editProfile() {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: '/static/angular/profile/partials/_modals/add-edit-coach-profile.html',
                controller: 'CoachProfileController as coachProfile',
                resolve: {
                    employeeId: function () {
                        return $scope.coach.id;
                    },
                    showPrivate: function () {
                        return false
                    }
                }
            });
        };
    }])

    .controller('AddEditBioCtrl', ['$scope', '$rootScope', '$routeParams', '$modalInstance', '$location', 'employee', 'leadership', 'employees', 'teams', 'Employee', 'EmployeeLeader', 'EmployeeSearch', 'fileReader', 'PhotoUpload', function($scope, $rootScope, $routeParams, $modalInstance, $location, employee, leadership, employees, teams, Employee, EmployeeLeader, EmployeeSearch, fileReader, PhotoUpload) {
        $scope.employee = angular.copy(employee);
        $scope.leadership = angular.copy(leadership);
        $scope.teams = teams;

        EmployeeSearch.query(function(data) {
                $scope.employees = data;
                $scope.coaches = angular.copy($scope.employees);
        });

        $scope.image = {
            uploadedImg: '',
            croppedImg: $scope.employee.avatar
        }; // have to use this format for ng-img-crop to work
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
        $scope.formats = ['dd-MMM-yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };
        $scope.datepickers = {
            hire_date: false,
            depart_date: false
        }
        $scope.open = function ($event, which) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.datepickers[which] = true;
        };
        $scope.showHireDatePicker = false;
        $scope.showDepartDatePicker = false;
        $scope.toggleHireDatePicker = function () {
            $scope.showDepartDatePicker = false;
            $scope.showHireDatePicker = !$scope.showHireDatePicker;
        };
        $scope.toggleDepartDatePicker = function () {
            $scope.showHireDatePicker = false;
            $scope.showDepartDatePicker = !$scope.showDepartDatePicker;
        };

        $scope.$watch("employee.departure_date",function(newValue,OldValue,scope) {
            if (newValue) {
                $scope.showDepartDatePicker = false;
            }
        });
        $scope.$watch("employee.hire_date",function(newValue,OldValue,scope) {
            if (newValue) {
                $scope.showHireDatePicker = false;
            }
        });

        $scope.saveEmployee = function () {
            var data = getData();
            if ($scope.employee.id > 0) {
                Employee.update(data, function (response) {
                    $scope.employee = response;
                    saveOtherInfo(false);
                });
            } else {
                Employee.addNew(data, function (response) {
                    $scope.employee = response;
                    saveOtherInfo(true);
                });
            }
        };
        var saveOtherInfo = function (addNew) {
            if ($scope.image.croppedImg != $scope.employee.avatar) {
                var upload_data = {id: $scope.employee.id};
                var newfile = [dataURItoBlob($scope.image.croppedImg)];
                PhotoUpload($scope.model, newfile).update(upload_data, function (data) {
                    $scope.employee.avatar = data.avatar;
                });
            }
            $modalInstance.close($scope.employee);
            if (addNew) {
                changeLocation('employees/' + $scope.employee.id, false);
            }
        };
        var dataURItoBlob = function(dataURI) {
            var byteString = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ab = new ArrayBuffer(byteString.length);
            var dw = new DataView(ab);
            for(var i = 0; i < byteString.length; i++) {
                dw.setUint8(i, byteString.charCodeAt(i));
            }
            return new Blob([ab], {type: mimeString});
        }

        var getData = function () {
            var data = {id: $scope.employee.id};
            data.first_name = $scope.employee.first_name;
            data.last_name = $scope.employee.last_name;
            data.email = $scope.employee.email;
            data.hire_date = ($scope.employee.hire_date) ? $rootScope.scrubDate($scope.employee.hire_date, false) : null;
            data.departure_date = ($scope.employee.departure_date) ? $rootScope.scrubDate($scope.employee.departure_date, false) : null;
            data.team = ($scope.employee.team && $scope.employee.team.name) ? $scope.employee.team.id : null;
            data.coach = ($scope.employee.coach && $scope.employee.coach.full_name) ? ($scope.employee.coach.pk ? $scope.employee.coach.pk: $scope.employee.coach.id) : null;
            data.leader = ($scope.employee.leader && $scope.employee.leader.full_name) ? ($scope.employee.leader.pk ? $scope.employee.leader.pk: $scope.employee.leader.id) : null;
            data.display = true;
            return data;
        };


        $scope.uploadFile = function (files) {
            $scope.files = files;
            fileReader.readAsDataUrl($scope.files[0], $scope)
                .then(function (result) {
                    $scope.image.uploadedImg = result;
                    $scope.image.croppedImg = result;
                });
        };
        var changeLocation = function (url, force) {
            //this will mark the URL change
            $location.path(url); //use $location.path(url).replace() if you want to replace the location instead
            $scope = $scope || angular.element(document).scope();
        };


        $scope.startsWith = function (expected, actual) {
            if (expected && actual) {
                return expected.toLowerCase().indexOf(actual.toLowerCase()) == 0;
            }
            return true;
        }
    }])

    .controller('EmployeeDetailCtrl', ['$rootScope', '$scope', '$location', '$routeParams', '$window', '$modal', 'User', 'Employee', 'Team', 'Engagement', 'SendEngagementSurvey', 'EmployeeLeader', 'Attribute', '$http', 'Customers', 'analytics', 'EmployeeMBTI', 'Notification', 'CompSummary', function ($rootScope, $scope, $location, $routeParams, $window, $modal, User, Employee, Team, Engagement, SendEngagementSurvey, EmployeeLeader, Attribute, $http, Customers, analytics, EmployeeMBTI, Notification, CompSummary) {
        analytics.trackPage($scope, $location.absUrl(), $location.url());
        $scope.compSummaries = {};
        Customers.get(function (data) {
            $scope.customer = data;
        });

        $scope.loadCompensation = function() {
            if ($scope.customer.show_individual_comp) {
                $scope.compSummaries = CompSummary.getAllSummariesForEmployee($routeParams.id);
            }
        }

        $rootScope.$watch('currentUser', function (newVal, oldVal) {
            if (newVal != oldVal) {
                $scope.currentUser = $rootScope.currentUser;
            }
        }, true);

        $scope.loadEmployeePvPs = function() {
            $scope.$broadcast('loadEmployeePvPs');
        }

        $scope.dynamicTooltipText = "LOGOUT";

        $scope.modalHappyShown = false;
        $scope.toggleHappyModal = function () {
            $scope.modalHappyShown = !$scope.modalHappyShown;
        };
        $scope.modalSurveyShown = false;
        $scope.toggleSurveyModal = function () {
            $scope.modalSurveyShown = !$scope.modalSurveyShown;
        };
        $scope.leadership = [];
        Team.query(function (data) {
            $scope.teams = data;
        });

        $scope.employees = Employee.query({u: $rootScope.currentUser.id});

        Employee.get(
            {id: $routeParams.id},
            function (data) {
                $scope.employee = data;
                $scope.employee.hire_date = $rootScope.parseDate($scope.employee.hire_date);
            }
        );

        $scope.happyIndex = 0;
        $scope.loadHappiness = function () {
            Engagement.query(
                {id: $routeParams.id},
                function (data) {
                    $scope.happys = data;
                }
            );
        }
        $scope.isSurveySending = false;
        $scope.sendSurvey = function () {
            $scope.isSurveySending = true;
            var data = {id: $routeParams.id, _sent_from_id: $rootScope.currentUser.employee.id, _override: true};

            SendEngagementSurvey.addNew(data, function () {
                $scope.isSurveySending = false;
                Notification.success("Your survey was sent.");
            }, function () {
                $scope.isSurveySending = false;
                Notification.error("There was an error sending your survey.");
            });
        };

        $scope.clicked_happy;

        EmployeeMBTI.get(
            {id: $routeParams.id},
            function (data) {
                $scope.mbti = data;
                if ($scope.mbti.description) {
                    $scope.has_mbti = true;
                }
            }
        );

        $scope.selected = 0;
        $scope.set_choice = function (value) {
            $scope.selected = value;
        };
        $scope.is_selected = function (value) {
            return $scope.selected == value;
        };
        Attribute.getAttributesForEmployee($routeParams.id).$promise.then(function(response) {
            $scope.attributes = response;
            var is_even = ($scope.attributes.length % 2 == 0);
            if ($scope.customer.show_vops) {
                if (!is_even)
                    $scope.vops_class = 'shaded';
                is_even = !is_even;
            }
            if ($scope.customer.show_mbti) {
                if (!is_even)
                    $scope.mbti_class = 'shaded';
                is_even = !is_even;
            }
            if ($scope.customer.show_kolbe) {
                if (!is_even)
                    $scope.kolbe_class = 'shaded';
            }
        });

        $scope.showAttributes = function (view, category) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/static/angular/partials/_modals/show-attributes.html',
                controller: 'ShowAttributesCtrl',
                resolve: {
                    category: function () {
                        return category
                    },
                    view: function () {
                        return view
                    },
                    mbti: function () {
                        return $scope.mbti
                    }
                }
            });
        };
        $scope.editEmployee = function (employee, leadership, employees, teams) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: '/static/angular/org/partials/_modals/add-edit-employee.html',
                controller: 'AddEditBioCtrl',
                resolve: {
                    employee: function () {
                        return employee
                    },
                    leadership: function () {
                        return leadership
                    },
                    employees: function () {
                        return employees
                    },
                    teams: function () {
                        return teams
                    }
                }
            });
            modalInstance.result.then(
                function (e, l) {
                    $scope.employee = e;
                }
            );
        };
        $scope.formats = ['yyyy-mm-dd', 'mm/dd/yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
    }])

    .controller('ShowAttributesCtrl', ['$scope', '$routeParams', '$modalInstance', '$sce', 'Assessment', 'view', 'category', 'mbti', function ($scope, $routeParams, $modalInstance, $sce, Assessment, view, category, mbti) {
        $scope.view = view;
        $scope.category = category;
        if (mbti) {
            $scope.mbti = mbti;
        }
        ;
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
        $scope.getMbtiDescription = function () {
            if ($scope.mbti) {
                return $sce.trustAsHtml($scope.mbti.description);
            } else {
                return null;
            }
        };
        Assessment.query(
            {id: $routeParams.id, category: $scope.category},
            function (data) {
                $scope.assessments = data;
                if ($scope.assessments) {
                    $scope.name = $scope.assessments[0].name
                    $scope.description = $scope.assessments[0].description
                }
            }
        );
        $scope.getDescription = function () {
            return $sce.trustAsHtml($scope.description);
        };
    }])

    .controller('EmployeesSnapshotCtrl', ['$scope', '$routeParams', 'Event', '$rootScope', '$location', 'User', 'Employee', 'TeamLeadService', 'Coachees', function ($scope, $routeParams, Event, $rootScope, $location, User, Employee, TeamLeadService, Coachees) {
        $scope.busy = true;

        if ($scope.view == 'team-view') {
            $scope.teamId = $routeParams.teamId;
            TeamLeadService.getLeadsForTeam($routeParams.teamId)
                .then(function (data) {
                    $scope.snapshotEmployees = data;
                }
        ); }
        else if ($scope.view == 'lead-view') {
            if ($routeParams.id) {
                TeamLeadService.getEmployeesForTeamLead($routeParams.id)
                    .then(function (data) {
                        $scope.snapshotEmployees = data;
                    }
                );
            } else {
                TeamLeadService.getMyEmployees()
                    .then(function (data) {
                        $scope.snapshotEmployees = data;
                        return $scope.snapshotEmployees;
                    });
            }
        }
        else if ($scope.view == 'coach-view') {
            $scope.snapshotEmployees = Coachees.query();
        }

        $scope.filteredZoneType = '';
        $scope.filteredHappinessType = '';
        $scope.sortorder = 'last_checkin_date';
        $scope.busy = false;
    }])

    .controller('ChangeCoachController', ['$modal', '$modalInstance', 'CoachService', 'currentCoach', function($modal, $modalInstance, CoachService, currentCoach) {
        var vm = this;
        vm.availableCoaches = [];
        vm.coachClusters = [];
        vm.currentCoach = currentCoach;
        vm.showProfile = showProfile;
        vm.newCoach = null;
        vm.save = save;
        vm.cancel = cancel;

        activate();

        function activate() {
            CoachService.getAvailableCoaches()
                .then(function(data) {
                    vm.availableCoaches = data;
                    var i,j,temparray,chunk = 3;
                    for (i=0,j=vm.availableCoaches.length; i<j; i+=chunk) {
                        temparray = vm.availableCoaches.slice(i,i+chunk);
                        vm.coachClusters.push(temparray)
                     }
                });
        }

        function showProfile(employeeId) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/static/angular/profile/partials/_modals/coach-profile.html',
                controller: 'CoachProfileController as coachProfile',
                resolve: {
                    employeeId: function () {
                        return employeeId
                    },
                    showPrivate: function () {
                        return false
                    }
                }
            });
        }

        function save(form) {
            if(form.$invalid) return;
            CoachService.changeCoach(vm.newCoach);
            $modalInstance.close(vm.newCoach);
        }

        function cancel() {
            $modalInstance.dismiss();
        }
    }])
;