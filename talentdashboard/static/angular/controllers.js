angular.module('tdb.controllers', [])

.controller('BaseAppCtrl', ['$rootScope', '$location', '$document', 'User', 'Customers', function($rootScope, $location, $document, User, Customers) {
    $rootScope.$on("$routeChangeError", function() {
        window.location = '/account/login?next=' + $location.path();
    });
    Customers.get(function(data) {
            $rootScope.customer = data;
       }
    );
    $document.on('click',function(event){
        element = angular.element(event.target);
        if ((!element.hasClass('nav-item-icon') && !element.hasClass('nav-input')) && $rootScope.activeTab) {
            $rootScope.activeTab = null
            $rootScope.$apply();
        }
    });
    // parse a date in yyyy-mm-dd format
    $rootScope.parseDate = function (input) {
      if (input) {
          var parts = input.match(/(\d+)/g);
          // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
          return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
      }
      return input;
    };
    $rootScope.scrubDate = function (input, display) {
        var date = new Date(input);
        if (isNaN(date)) { return null};
        var day = date.getDate();
        var month = date.getMonth() + 1; //Months are zero based
        var year = date.getFullYear();
        if (display) {
            scrubbed_Date = month + "/" +  day + "/" + year;
        } else {
            scrubbed_Date = year + "-" + month + "-" +  day;
        }
        return scrubbed_Date;
    };
    $rootScope.now = function () {
        return new Date();
    };
    $rootScope.engagement_choices = [
        {id: 5, title: 'Very Happy', css: 'veryhappy'},
        {id: 4, title: 'Happy', css: 'happy'},
        {id: 3, title: 'Indifferent', css: 'indifferent'},
        {id: 2, title: 'Unhappy', css: 'unhappy'},
        {id: 1, title: 'Very Unhappy', css: 'veryunhappy'}
    ];
    $rootScope.lazyround = function (num) {
        return Math.abs(Number(num)) >= 1.0e+9

        ? Math.abs(Number(num)) / 1.0e+9 + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(num)) >= 1.0e+6

        ? Math.abs(Number(num)) / 1.0e+6 + "M"
        // Three Zeroes for Thousands
        : Math.abs(Number(num)) >= 1.0e+3

        ? Math.abs(Number(num)) / 1.0e+3 + "K"

        : Math.abs(Number(num));

    };
}])

.controller('MyCoacheesEvaluationListCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'MyCoacheesPvpEvaluation', 'Team', 'Customers', 'TalentCategories', 'analytics', function($scope, $rootScope, $location, $routeParams, MyCoacheesPvpEvaluation, Team, Customers, TalentCategories, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    Customers.get(function (data) {
        $scope.customer = data;
    });
    $scope.hideTeamMenu = true;
    $scope.kolbe_values=[0,1,2,3];
    $scope.vops_values=[0,320,6400,960];
    $scope.kolbe_fact_finder_labels=['simplify','explain','specify'];
    $scope.kolbe_follow_thru_labels=['adapt','maintain','systemize'];
    $scope.kolbe_quick_start_labels=['improvise','modify','stabilize'];
    $scope.kolbe_implementor_labels=['imagine','restore','build'];
    $scope.evaluations = MyCoacheesPvpEvaluation.getCurrentEvaluations();
    $scope.teamId = $routeParams.team_id;
    $scope.talentCategory = $routeParams.talent_category;
    $scope.categoryName  = TalentCategories.getLabelByTalentCategory($scope.talentCategory)
    $scope.happy = $routeParams.happy;
    $scope.days_since_happy = $routeParams.days_since_happy;
    $scope.fact_finder = $routeParams.fact_finder;
    $scope.follow_thru = $routeParams.follow_thru;
    $scope.quick_start = $routeParams.quick_start;
    $scope.implementor = $routeParams.implementor;
    $scope.vops={visionary:false,operator:false,processor:false,synergist:false};
    $scope.teamName='';
    $scope.staleDays=360;
    $scope.staleDate = new Date();
    $scope.staleDate.setDate($scope.staleDate.getDate() - $scope.staleDays);
    if ($routeParams.team_id){
        Team.get(
            {id: $routeParams.team_id},
            function(data) {
                $scope.teamName = data.name
                $scope.teamId = data.id
            }
        );
    }
    $scope.menu = {show: false};
    $scope.clearSynegistStyle = function() {
        $scope.vops={visionary:false,operator:false,processor:false,synergist:false};
    };
    $scope.setTeamFilter = function(id, name) {
        $scope.teamId=id;
        $scope.teamName=name;
    };

    $scope.staleHappy = function(date) {
        return ($rootScope.parseDate(date) < $scope.staleDate)
    };
    $scope.sortHappy = function(evaluation) {
        if (evaluation.employee.happiness && $rootScope.parseDate(evaluation.employee.happiness_date) > $scope.staleDate) {
            return -evaluation.employee.happiness;
        } else {
            return -1;
        }
    }
}])

.controller('MyTeamEvaluationListCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'MyTeamPvpEvaluation', 'Team', 'Customers', 'TalentCategories', 'analytics', function($scope, $rootScope, $location, $routeParams, MyTeamPvpEvaluation, Team, Customers, TalentCategories, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    Customers.get(function (data) {
        $scope.customer = data;
    });
    $scope.hideTeamMenu = true;
    $scope.kolbe_values=[0,1,2,3];
    $scope.kolbe_fact_finder_labels=['simplify','explain','specify'];
    $scope.kolbe_follow_thru_labels=['adapt','maintain','systemize'];
    $scope.kolbe_quick_start_labels=['improvise','modify','stabilize'];
    $scope.kolbe_implementor_labels=['imagine','restore','build'];
    $scope.evaluations = MyTeamPvpEvaluation.getCurrentEvaluations();
    $scope.teamId = $routeParams.team_id;
    $scope.talentCategory = $routeParams.talent_category;
    $scope.categoryName  = TalentCategories.getLabelByTalentCategory($scope.talentCategory)
    $scope.happy = $routeParams.happy;
    $scope.days_since_happy = $routeParams.days_since_happy;
    $scope.fact_finder = $routeParams.fact_finder;
    $scope.follow_thru = $routeParams.follow_thru;
    $scope.quick_start = $routeParams.quick_start;
    $scope.implementor = $routeParams.implementor;
    $scope.vops={visionary:false,operator:false,processor:false,synergist:false};
    $scope.teamName='';
    $scope.staleDays=360;
    $scope.staleDate = new Date();
    $scope.staleDate.setDate($scope.staleDate.getDate() - $scope.staleDays);
    if ($routeParams.team_id){
        Team.get(
            {id: $routeParams.team_id},
            function(data) {
                $scope.teamName = data.name
                $scope.teamId = data.id
            }
        );
    }
    $scope.menu = {show: false};
    $scope.clearSynegistStyle = function() {
        $scope.vops={visionary:false,operator:false,processor:false,synergist:false};
    };
    $scope.setTeamFilter = function(id, name) {
        $scope.teamId=id;
        $scope.teamName=name;
    };

    $scope.staleHappy = function(date) {
        return ($rootScope.parseDate(date) < $scope.staleDate)
    };
    $scope.sortHappy = function(evaluation) {
        if (evaluation.employee.happiness && $rootScope.parseDate(evaluation.employee.happiness_date) > $scope.staleDate) {
            return -evaluation.employee.happiness;
        } else {
            return -1;
        }
    }
}])

.controller('EvaluationListCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'PvpEvaluation', 'Team', 'Customers', 'TalentCategories', 'analytics', function($scope, $rootScope, $location, $routeParams, PvpEvaluation, Team, Customers, TalentCategories, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    Customers.get(function (data) {
        $scope.customer = data;
    });
    $scope.happiness = '';
    $scope.hideTeamMenu = false;
    $scope.kolbe_values=[0,1,2,3];
    $scope.kolbe_fact_finder_labels=['simplify','explain','specify'];
    $scope.kolbe_follow_thru_labels=['adapt','maintain','systemize'];
    $scope.kolbe_quick_start_labels=['improvise','modify','stabilize'];
    $scope.kolbe_implementor_labels=['imagine','restore','build'];
    $scope.evaluations = PvpEvaluation.getCurrentEvaluations();
    $scope.teamId = $routeParams.team_id;
    $scope.talentCategory = $routeParams.talent_category.toString();
    $scope.categoryName  = TalentCategories.getLabelByTalentCategory($scope.talentCategory);
    $scope.days_since_happy = $routeParams.days_since_happy;
    $scope.fact_finder = angular.copy($scope.kolbe_fact_finder_labels);
    $scope.follow_thru = angular.copy($scope.kolbe_follow_thru_labels);
    $scope.quick_start = angular.copy($scope.kolbe_quick_start_labels);
    $scope.implementor = angular.copy($scope.kolbe_implementor_labels);
    $scope.vops={visionary:false,operator:false,processor:false,synergist:false};
    $scope.teamName='';
    $scope.staleDays=360;
    $scope.staleDate = new Date();
    $scope.staleDate.setDate($scope.staleDate.getDate() - $scope.staleDays);
    if ($routeParams.team_id){
        Team.get(
            {id: $routeParams.team_id},
            function(data) {
                $scope.teamName = data.name
                $scope.teamId = data.id
            }
        );
    }

    $scope.menu = {show: false};
    $scope.clearSynegistStyle = function() {
        $scope.vops={visionary:false,operator:false,processor:false,synergist:false};
    };
    $scope.setTeamFilter = function(id, name) {
        $scope.teamId=id;
        $scope.teamName=name;
    };
    $scope.setHappyFilter = function(id, name) {
        $scope.happy=id;
        $scope.happyName=name;
    };
    $scope.staleHappy = function(date) {
        return ($rootScope.parseDate(date) < $scope.staleDate)
    };
    $scope.sortHappy = function(evaluation) {
        if (evaluation.employee.happiness && $rootScope.parseDate(evaluation.employee.happiness_date) > $scope.staleDate) {
            return -evaluation.employee.happiness;
        } else {
            return -1;
        }
    }
}])

.controller('NavigationCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'Employee', 'Customers', 'Team', function($scope, $rootScope, $routeParams, $window, $location, Employee, Customers, Team) {
    
    $scope.$window = $window;

    //search
    if (!$scope.employees) {
        $scope.employees = Employee.query({
        random:Math.floor((Math.random()*1000000000))
        }); //!important browser cache buster
    }
    Customers.get(function (data) {
        $scope.customer = data;
    });


    //teams
    $scope.teams = Team.query();
    $scope.modalEmployeeShown = false;
    $scope.newEmployeeBlank = {
        id:0,full_name:'',
        first_name:'',
        last_name:'', 
        email:'', 
        team:{id:0, name:''}, 
        hire_date:'',
        departure_date:'', 
        avatar:'https://hippoculture.s3.amazonaws.com/media/avatars/geneRick.jpg'
    };
    $scope.newEmployee = $scope.newEmployeeBlank;

    $scope.newLeadership = {
        id:0,
        leader:{full_name:''}
    };  

    $scope.startsWith  = function(expected, actual){
        if(expected && actual){
            return expected.toLowerCase().indexOf(actual.toLowerCase()) == 0;
        }
        return true;
    }

    $scope.clearAddModal = function() {
        $scope.newEmployee = angular.copy($scope.newEmployeeBlank);
    }

    //show add employee modal 
    $scope.toggleAddEmployeeModal = function() {
        $scope.clearAddModal();
        $scope.modalEmployeeShown = !$scope.modalEmployeeShown;
    };  

    //clear search
    $scope.navQuery = '';

    //set active tab
    $rootScope.activeTab = null;

    //tabs
    $scope.zonesTab = 'zones';
    $scope.teamsTab = 'teams';
    $scope.settingsTab = 'settings';
    $scope.searchTab = 'search';

    $scope.setActiveTab = function (tab) {
        if ($rootScope.activeTab == tab) {
            $rootScope.activeTab = null;
        } else {
            $rootScope.activeTab = tab;
        }    
    };
}])

.controller('TeamListCtrl', ['$scope', 'Team', function($scope, Team) {
    $scope.teams = Team.query();
    $scope.teamQuery = $scope.teams[0];
    $scope.teamMenu = {show: false};
    $scope.startsWith  = function(expected, actual){
        if(expected && actual){
            return expected.toLowerCase().indexOf(actual.toLowerCase()) == 0;
        }
        return true;
    }
}])

.controller('EmployeeDetailCtrl', ['$rootScope', '$scope', '$location', '$routeParams', '$window', '$modal', 'User', 'Employee', 'Team', 'Engagement', 'SendEngagementSurvey', 'EmployeeLeader', 'Attribute', '$http', 'Customers', 'analytics','EmployeeMBTI', 'Notification', function($rootScope, $scope, $location, $routeParams, $window, $modal, User, Employee, Team, Engagement, SendEngagementSurvey, EmployeeLeader, Attribute, $http, Customers, analytics, EmployeeMBTI, Notification) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    Customers.get(function (data) {
        $scope.customer = data;
    });
    $rootScope.$watch('currentUser', function(newVal, oldVal){
        if (newVal != oldVal) {
            $scope.currentUser = $rootScope.currentUser;
        }
    },true);

    $scope.dynamicTooltipText = "LOGOUT";

    $scope.modalEmployeeShown = false;
    $scope.toggleEditEmployeeModal = function() {
        $scope.modalEmployeeShown = !$scope.modalEmployeeShown;
    };
    $scope.modalHappyShown = false;
    $scope.toggleHappyModal = function() {
        $scope.modalHappyShown = !$scope.modalHappyShown;
    };
    $scope.modalSurveyShown = false;
    $scope.toggleSurveyModal = function() {
        $scope.modalSurveyShown = !$scope.modalSurveyShown;
    };
    $scope.leadership=[];
    Team.query(function(data) {
        $scope.teams = data;
    });
    if (!$scope.employees && $rootScope.currentUser && $rootScope.currentUser.can_view_company_dashboard) {
         $scope.employees = Employee.query();
     }
    Employee.get(
        {id: $routeParams.id},
        function(data) {
            $scope.employee = data;
            $scope.employee.hire_date = $rootScope.parseDate($scope.employee.hire_date);
        }
    );

    EmployeeLeader.get(
       {id: $routeParams.id},
       function(data) {
            $scope.leadership = data;
            $scope.showCompensation = false;
            if ($scope.leadership.leader.id == $rootScope.currentUser.employee.id){
                $scope.showCompensation = true;
            }
        }
    );
    $scope.happyIndex=0;
    Engagement.query(
        {id:$routeParams.id},
        function(data) {
            $scope.happys = data;
        }
    );
    $scope.isSurveySending=false;
    $scope.sendSurvey = function(){
      $scope.isSurveySending=true;
      var data = {id: $routeParams.id, _sent_from_id: $rootScope.currentUser.employee.id, _override:true};

      SendEngagementSurvey.addNew(data, function() {
          $scope.isSurveySending=false;
          Notification.success("Your survey was sent.");
      },function(){
          $scope.isSurveySending=false;
          Notification.error("There was an error sending your survey.");
      });
    };

    $scope.clicked_happy;

    EmployeeMBTI.get(
        {id: $routeParams.id},
        function(data) {
            $scope.mbti = data;
            if ($scope.mbti.description){
                $scope.has_mbti = true;
            }
        }
    );

    $scope.selected=0;
    $scope.set_choice = function(value) {
        $scope.selected=value;
    };
    $scope.is_selected = function(value) {
        return $scope.selected==value;
    };

    $scope.super_powers = Attribute.getAttributtesForEmployee($routeParams.id, 2);
    $scope.skills = Attribute.getAttributtesForEmployee($routeParams.id, 3);
    $scope.employeeEdit = false;

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
    $scope.formats = ['yyyy-mm-dd', 'mm/dd/yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
}])

.controller('ShowAttributesCtrl', ['$scope', '$routeParams', '$modalInstance', '$sce', 'Assessment', 'view', 'category', 'mbti', function($scope, $routeParams, $modalInstance, $sce, Assessment, view, category, mbti) {
    $scope.view = view;
    $scope.category = category;
    if (mbti) {
        $scope.mbti = mbti;
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.getMbtiDescription = function() {
        if ($scope.mbti) {
            return $sce.trustAsHtml($scope.mbti.description);
        } else {
            return null;
        }
    };
    Assessment.query(
        {id:$routeParams.id, category:$scope.category},
        function(data) {
            $scope.assessments = data;
            if ($scope.assessments){
                $scope.name = $scope.assessments[0].name
                $scope.description = $scope.assessments[0].description
            }
        }
    );
    $scope.getDescription = function() {
        return $sce.trustAsHtml($scope.description);
    };
}])

.controller('UploadDataCtrl', ['$scope', 'ImportData','Notification','EmployeeNames', function($scope, ImportData, Notification, EmployeeNames) {
    $scope.data;
    $scope.importData = [];
    $scope.hasColumnHeaders=true;
    $scope.hot;
    $scope.columns = [];
    $scope.importing = false;
    $scope.validTable = false;
    $scope.import = function() {
        $scope.importing = true;
        if ($scope.validTable) {
            // ignore first row
            ImportData.addNew($scope.hot.getData().slice(1)).$promise.then(function(data) {
                EmployeeNames.query(function(data) {
                    $scope.employee_autocomplete_values = data;
                });

                // check promise
                if (!data.$resolved) {
                    Notification.warning("Awesome but we ran into some errors. Make your corrections below.");
                } else {
                    $scope.hot.destroy();
                    Notification.success("Your data imported successfully.");
                }

                $scope.importing = false;
                $scope.data = angular.copy($scope.importData);
                // $scope.renderTable();
            },function(){
                $scope.isSurveySending=false;
                Notification.error("There was an error importing your data.");
                $scope.importing = false;
            });
        }
        else {
            Notification.warning("Awesome but we ran into some errors. Make your corrections below.");
        }
    };
}])

.controller('CoachDetailCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'User', 'Employee', 'Coachees', 'TalentReport', '$http', 'analytics', function($scope, $rootScope, $location, $routeParams, User, Employee, Coachees, TalentReport, $http, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    $scope.coach= $rootScope.currentUser.employee;

    Coachees.query({ id: $routeParams.id }).$promise.then(function(response) {
        $scope.employees = response;
    });
    $scope.talentReport = TalentReport.myCoachees();
}])


.controller('EmployeeCompSummariesCtrl', ['$scope', '$routeParams', 'CompSummary', function($scope, $routeParams, CompSummary) {
    $scope.compSummaries = CompSummary.getAllSummariesForEmployee($routeParams.id);
}])

.controller('EmployeePvpEvaluationsCtrl', ['$scope', '$routeParams', 'PvpEvaluation', function($scope, $routeParams, PvpEvaluation) {
    $scope.pvpIndex = 0;
    PvpEvaluation.getAllEvaluationsForEmployee($routeParams.id).$promise.then(function(response) {
        $scope.pvps = response;
    });

    $scope.selectPvP = function(index) {
        $scope.pvpIndex = index;
    }
}])

.controller('ReportsCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'EmployeeSearch', 'TalentCategories', 'analytics', function($scope, $rootScope, $location, $routeParams, EmployeeSearch, TalentCategories, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    $scope.busy = true;
    EmployeeSearch.query().$promise.then(function(response) {
            $scope.evaluations = response;
            var i = 0;
            angular.forEach($scope.evaluations, function (evaluation) {
                evaluation.index = i;
                i = i + 1;
            })
            $scope.evaluations_sort = angular.copy($scope.evaluations)
            $scope.csv = []
            buildCSV();
            $scope.busy = false;
    });
    var happyToString = function(happy){
        switch (happy) {
            case '1':
                return 'Very Unhappy';
                break;
            case '2':
                return 'Unhappy';
                break;
            case '3':
                return 'Indifferent';
                break;
            case '4':
                return 'Happy';
                break;
            case '5':
                return 'Very Happy';
                break;
            case '0':
                return 'No Data';
                break;
        }
    };
    $scope.orderValue = '';
    $scope.order = function(orderValue){
        $scope.orderValue = orderValue;
        switch(orderValue) {
            case 'name':
                $scope.evaluations_sort.sort(orderByName);
                break;
            case 'talent':
                $scope.evaluations_sort.sort(orderByTalent);
                break;
            case 'happy':
                $scope.evaluations_sort.sort(orderByHappy);
                break;
            case 'date':
                $scope.evaluations_sort.sort(orderByDate);
                break;
            default:
                $scope.evaluations_sort.sort(orderByName);
                break;
        }

        var i = 0;
        angular.forEach($scope.evaluations_sort, function (evaluation) {
            $scope.evaluations[evaluation.index].index = i;
            i = i + 1;
        })
        buildCSV();
    }
    var buildCSV = function() {
        $scope.csv = []
        angular.forEach($scope.evaluations_sort, function(employee) {
            var row = {};
            row.name = employee.full_name;
            row.talent = TalentCategories.getLabelByTalentCategory(employee.talent_category);
            row.happy = happyToString(employee.happiness);
            row.date = $rootScope.scrubDate(employee.happiness_date);
            $scope.csv.push(row);
        });
    }
    var orderByName = function(a,b){
        var aValue = a.full_name;
        var bValue = b.full_name;
        return ((aValue < bValue) ? -1 : ((aValue > bValue) ? 1 : 0));
    }
    var orderByTalent= function(a,b){
        var noDataValue=8;
        var aValue = (a.talent_category===0) ? noDataValue : a.talent_category;
        var bValue = (b.talent_category===0) ? noDataValue : b.talent_category;
        var aName = a.full_name;
        var bName = b.full_name;
        if (aValue === bValue) {
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        } else {
            return aValue - bValue;
        }
    }
    var orderByHappy= function(a,b){
        var aValue = a.happiness;
        var bValue = b.happiness;
        var aName = a.full_name;
        var bName = b.full_name;
        if (aValue === bValue) {
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        } else {
            return bValue - aValue;
        }
    }
    var orderByDate= function(a,b){
        var aValue = Date.parse(a.happiness_date) || 0;
        var bValue = Date.parse(b.happiness_date) || 0;
        var aName = a.full_name;
        var bName = b.full_name;
        if (aValue === bValue) {
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        } else {
            return bValue - aValue;
        }
    }

}])

.controller('CompanyOverviewCtrl', ['$rootScope', '$scope', '$location', '$routeParams', 'KPIIndicator', 'KPIPerformance', 'analytics', 'TalentReport', 'User', function($rootScope, $scope, $location, $routeParams, KPIIndicator, KPIPerformance, analytics, TalentReport, User) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());

    var defaultTemplate = "/static/angular/partials/company-overview.html";

    User.get(function(data) {
        if(data.preferences) {
            switch(data.preferences.dashboard_view){
                case 2:
                    $scope.templateUrl = "/static/angular/partials/stats-focused-dashboard.html";
                    break;
                default:
                    $scope.templateUrl = defaultTemplate;
                    break;
            }

        } else {
            $scope.templateUrl = defaultTemplate;
        }
    });
    KPIIndicator.get(function(data) {
            $scope.indicator = data;
       }
    );
    KPIPerformance.get(function(data) {
            $scope.performance = data;
            $scope.performance.value = $rootScope.lazyround($scope.performance.value);
            $scope.performance.date = $rootScope.scrubDate($scope.performance.date, true);
       }
    );
    $scope.talentReport = TalentReport.query();
}])

.controller('PeopleReportCtrl', ['$scope', '$rootScope', '$location', '$routeParams', 'HappinessReport', 'EngagementReport', 'TalentCategoryReport', 'Engagement', 'analytics', function($scope, $rootScope, $location, $routeParams, HappinessReport, EngagementReport, TalentCategoryReport, Engagement, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    $scope.days_ago = 120;
    EngagementReport.getReportForCompany($scope.days_ago, function(data) {
        $scope.talentCategoryReport = data;
    });

    HappinessReport.getReportForCompany($scope.days_ago, true).$promise.then(function(response) {
        $scope.neglectedEmployees = response;
        angular.forEach($scope.neglectedEmployees, function(neglected) {
            neglected.happy = Engagement.getCurrentEngagement(neglected.employee.id);
        });
    });
}])

.controller('ToDoReportCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$window', 'EmployeeToDo', 'ToDo', function($scope, $rootScope, $location, $routeParams, $window, EmployeeToDo, ToDo) {
    $scope.todos = EmployeeToDo.getReportForCompany(7);
    $scope.deleteToDo = function(todo) {
        if ($window.confirm('Are you sure you want to delete this To Do?')) {
            var data = {id: todo.id};
            var todo_index = $scope.todos.indexOf(todo);
            var deleteSuccess = function() {
                $scope.todos.splice(todo_index, 1);
            };

            ToDo.remove(data, function() {
                    deleteSuccess();
                });
        }
    }
}])

.controller('LeaderOverviewCtrl', ['$scope', '$location', '$routeParams', 'TalentReport', 'TeamLeadEmployees', 'User', 'analytics', function($scope, $location, $routeParams, TalentReport, TeamLeadEmployees, User, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());

    $scope.talentReport = TalentReport.myTeam();

    User.get(
        function(data) {
            $scope.lead = data.employee;
            $scope.employees = TeamLeadEmployees.getEmployees($scope.lead.id);
        }
    );
}])

.controller('TeamOverviewCtrl', ['$scope', '$location', '$routeParams', 'Team', 'TeamMembers', 'TeamMBTI', 'Customers', 'TeamLeads', 'analytics', 'TalentReport', function($scope, $location, $routeParams, Team, TeamMembers, TeamMBTI, Customers, TeamLeads, analytics, TalentReport) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());

    Customers.get(function (data) {
        $scope.customer = data;
    });
    $scope.teamId = $routeParams.id;
    $scope.employees = TeamLeads.getCurrentEvaluationsForTeamLeads($scope.teamId)

    $scope.talentReport = TalentReport.query({team_id: $routeParams.id});

    Team.get(
        {id: $routeParams.id},
        function(data) {
            $scope.team = data;
            $scope.team_name = data.name;
        }
    );

    TeamMBTI.get(
        {id: $routeParams.id},
        function(data) {
            $scope.mbti = data;
            angular.forEach($scope.mbti.mbtis, function(mbti_type) {
                if (mbti_type.type=='istj'){ $scope.istj=mbti_type }
                if (mbti_type.type=='isfj'){ $scope.isfj=mbti_type }
                if (mbti_type.type=='infj'){ $scope.infj=mbti_type }
                if (mbti_type.type=='intj'){ $scope.intj=mbti_type }
                if (mbti_type.type=='istp'){ $scope.istp=mbti_type }
                if (mbti_type.type=='isfp'){ $scope.isfp=mbti_type }
                if (mbti_type.type=='infp'){ $scope.infp=mbti_type }
                if (mbti_type.type=='intp'){ $scope.intp=mbti_type }
                if (mbti_type.type=='estp'){ $scope.estp=mbti_type }
                if (mbti_type.type=='esfp'){ $scope.esfp=mbti_type }
                if (mbti_type.type=='enfp'){ $scope.enfp=mbti_type }
                if (mbti_type.type=='entp'){ $scope.entp=mbti_type }
                if (mbti_type.type=='estj'){ $scope.estj=mbti_type }
                if (mbti_type.type=='esfj'){ $scope.esfj=mbti_type }
                if (mbti_type.type=='enfj'){ $scope.enfj=mbti_type }
                if (mbti_type.type=='entj'){ $scope.entj=mbti_type }
            });

        }
    );

    $scope.show_discussions = true;
    $scope.show_vops = false;
    $scope.show_kolbe = false;
    $scope.show_myers_briggs = false;
    $scope.click_discussions= function() {
        $scope.show_discussions = true;
        $scope.show_vops = false;
        $scope.show_kolbe = false;
        $scope.show_myers_briggs = false;
        $scope.show_todos = false;
    };
    $scope.click_bio= function() {
        $scope.show_discussions = false;
        $scope.show_vops = false;
        $scope.show_kolbe = false;
        $scope.show_myers_briggs = false;
        $scope.show_todos = false;
    };
    $scope.click_vops= function() {
        $scope.show_discussions = false;
        $scope.show_vops = true;
        $scope.show_kolbe = false;
        $scope.show_myers_briggs = false;
        $scope.show_todos = false;
    };
    $scope.click_kolbe= function() {
        $scope.show_discussions = false;
        $scope.show_vops = false;
        $scope.show_kolbe = true;
        $scope.show_myers_briggs = false;
        $scope.show_todos = false;
    };
    $scope.click_myers_briggs= function() {
        $scope.show_discussions = false;
        $scope.show_vops = false;
        $scope.show_kolbe = false;
        $scope.show_myers_briggs = true;
        $scope.show_todos = false;
    };
}])

.controller('EmployeeToDoListCtrl', ['$scope', '$routeParams', '$window', 'EmployeeToDo', 'ToDo', 'User', function($scope, $routeParams, $window, EmployeeToDo, ToDo, User) {
    EmployeeToDo.query({ id: $routeParams.id }).$promise.then(function(response) {
            $scope.todos = response;
        }
    );
    $scope.completed_todos = EmployeeToDo.query({ id: $routeParams.id, completed: true });
    $scope.addToDo = function(id) {
        var newToDo = {};
        newToDo.id = -1;
        newToDo.description = "";
        newToDo.assigned_to_id = -1;
        newToDo.employee_id = id;
        newToDo.due_date = null;
        newToDo.completed = "";
        newToDo.edit = true;
        newToDo.created_by = User.get();
        $scope.todos.push(newToDo);
    }
    $scope.deleteToDo = function(todo) {
        if ($window.confirm('Are you sure you want to delete this To Do?')) {
            var data = {id: todo.id};
            var todo_index = $scope.todos.indexOf(todo);
            var deleteSuccess = function() {
                $scope.todos.splice(todo_index, 1);
            };

            ToDo.remove(data, function() {
                    deleteSuccess();
                });
        }
    }
    $scope.scrubToDo = function(todo) {
        if (!todo.description) {
            var todo_index = $scope.todos.indexOf(todo);
            $scope.todos.splice(todo_index, 1);
        }
    }
}])

.controller('EmployeeToDoCtrl', ['$rootScope', '$scope', '$window', 'Employee', 'ToDo', 'EmployeeToDo', 'Coach', function($rootScope, $scope, $window, Employee, ToDo, EmployeeToDo, Coach) {
    $scope.currentToDo = {due_date:null};
    $scope.$window = $window;
    $scope.$watch('currentToDo.due_date', function(newVal, oldVal){
        if (newVal != oldVal) {
            $scope.saveToDo();
        }
    },true);
    $scope.offsetTop=0;
    $scope.scrollIntoView=false;

    $scope.toggleAssigneeMenu = function () {

        $scope.openAssigneeMenu = !$scope.openAssigneeMenu;
        $scope.scrollIntoView = $scope.openAssigneeMenu;
        if ($scope.openAssigneeMenu ) {
            $scope.$window.onclick = function (event) {
                closeAssigneeWindow(event, $scope.toggleAssigneeMenu);
            };
        } else {
            $scope.openAssigneeMenu = true;
            $scope.$window.onclick = null;
            $scope.$$phase || $scope.$apply(); //--> trigger digest cycle and make angular aware.
        }
    };
    $scope.closeAssigneeMenu = function() {
        $scope.openAssigneeMenu  = false;
        $scope.$window.onclick = null;
    };
    function closeAssigneeWindow(event, callbackOnClose) {
        var clickedElement = event.target;
        if (!clickedElement) return;

        var elementClasses = clickedElement.classList;
        var clickedOnAssigneeMenu = elementClasses.contains('assignee_menu');
        if (!clickedOnAssigneeMenu) {
            callbackOnClose();
        }
    }
    $scope.saveToDo = function() {
        if (!$scope.saving) {
            //$scope.currentToDo.edit = false;
            $scope.saving = true;
            var assigned_to_id = null;
            if ($scope.currentToDo.assigned_to) {
                assigned_to_id = $scope.currentToDo.assigned_to.id;
            }
            var due_date = null;
            if ($scope.currentToDo.due_date) {
                due_date = $rootScope.scrubDate($scope.currentToDo.due_date, false);
            }

            var data = {id: $scope.currentToDo.id, _description: $scope.currentToDo.description, _completed: $scope.currentToDo.completed, _assigned_to_id: assigned_to_id, _due_date: due_date, _employee_id: $scope.currentToDo.employee_id, _owner_id: $scope.currentToDo.created_by.id};
            if ($scope.currentToDo.id != -1) {
                ToDo.update(data, function (response) {
                    $scope.saving = false;
                });
            } else {
                if ($scope.currentToDo.description) {
                    data.id = $scope.currentToDo.employee_id;
                    EmployeeToDo.addNew(data, function (response) {
                        $scope.currentToDo.id = response.id;
                        $scope.saving = false;
                    });
                } else {

                }
            }
        }
    }
    $scope.assigneeMenu = {show: false};
    $scope.assignees = Coach.query();
    $scope.startsWith  = function(expected, actual){
        if(expected && actual){
            return expected.toLowerCase().indexOf(actual.toLowerCase()) == 0;
        }
        return true;
    }

    $scope.today = function() {
        $scope.dt = new Date();
    };

    $scope.showWeeks = false;
    $scope.toggleWeeks = function () {
        $scope.showWeeks = ! $scope.showWeeks;
    };

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = ( $scope.minDate ) ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function($event) {
        if (!$scope.opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
            $scope.scrollIntoView = true;
        } else {
            $scope.opened = false;
            $scope.scrollIntoView = false;
        }

    };

    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.format = $scope.formats[0];
}])

.controller('DailyDigestCtrl', ['$scope', '$modalInstance', 'Employee', function($scope, $modalInstance, Employee) {
    $scope.members = Employee.query({group_name:'Daily Digest Subscribers',show_hidden:true});
    $scope.cancel = function () {
        $modalInstance.dismiss();
    }
}])

.controller('EngagementSurveyCtrl', ['$scope', '$window', '$routeParams', '$location', 'EngagementSurvey', 'analytics', function($scope, $window, $routeParams, $location, EngagementSurvey, analytics){
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    $scope.employee_id = $routeParams.employeeId;
    $scope.survey_id = $routeParams.surveyId;
    $scope.first_load = true;
    $scope.error=false;
    EngagementSurvey.getSurvey($scope.employee_id, $scope.survey_id).$promise.then(function(response) {
            $scope.survey = response;
        }, function(response){$scope.error=true}
    );
    $scope.happy = {assessment:0};
    $scope.happy.comment = {visibility:3,content:''};

    $scope.save_engagement = function() {
        var data = {id: $scope.employee_id, survey_id: $scope.survey_id, _assessment: $scope.happy.assessment, _content:$scope.happy.comment.content};
        EngagementSurvey.save(data, function (response) {
            $scope.survey = response;
            $scope.first_load = false;
        });
    };
}])

.controller('PvpEvaluationTodosCtrl', ['$scope', '$filter', '$routeParams', '$window', '$interval', '$location', 'PvpEvaluation', 'PvpDescriptions', 'EmployeeComments', 'User', 'analytics', function($scope, $filter, $routeParams, $window, $interval, $location, PvpEvaluation, PvpDescriptions, EmployeeComments, User, analytics) {
    analytics.trackPage($scope, $location.absUrl(), $location.url());
    $scope.pvps = [];
    $scope.currentItemIndex = null;
    $scope.isDirty = false;
    $scope.originalPotential = 0;
    $scope.originalPerformance = 0;
    $scope.show = false;
    $scope.hide = false;
    $scope.last_index = 0;
    $scope.pvp_descriptions = null;
    $scope.pvp_description = null;
    $scope.currentPvP = null;
    $scope.isAnimating = false;

    setToIsClean = function(pvp) {
         if (!pvp.comment) {
            pvp.comment = {originalContent: "", content: "", id: -1};
        } else {
            pvp.comment.originalContent = pvp.comment.content;
        }
        pvp.originalPotential = pvp.potential;
        pvp.originalPerformance = pvp.performance;
        return pvp;
    };

    PvpEvaluation.getToDos().$promise.then(function(response) {
        $scope.currentItemIndex = 0;
        $scope.pvps = response.map(function(pvp) {
            return setToIsClean(pvp);
        });

        $scope.last_index = $scope.pvps.length -1;
    });

    PvpDescriptions.query().$promise.then(function(response) {
            $scope.pvp_descriptions = response;
        }
    );
    $scope.saving = false;
    $scope.save = function() {
        if (!$scope.saving) {
            $scope.saving = true
            _pvp = $scope.currentPvP;
            if ($scope.currentPvP.comment.content) {
                var data = {id: _pvp.id, _potential: _pvp.potential, _performance: _pvp.performance, _content: _pvp.comment.content};
                PvpEvaluation.update(data, function () {
                    $scope.saving = false;
                });
            } else {
                data = {id: _pvp.id, _potential: _pvp.potential, _performance: _pvp.performance};
                PvpEvaluation.update(data, function () {
                    $scope.saving = false;
                });
            }
            $scope.currentPvP = setToIsClean($scope.currentPvP);
        }
    };

    $scope.isDirty = function() {
        return $scope.currentPvP.originalPotential != $scope.currentPvP.potential || $scope.currentPvP.originalPerformance != $scope.currentPvP.performance || $scope.currentPvP.comment.originalContent != $scope.currentPvP.comment.content;
    };

    $interval(function() {
        if ($scope.isDirty()){
            $scope.save();
        }
    }, 2000);

    $scope.forward = function() {
        $scope.isAnimating = true;
        if($scope.isDirty()) {
            $scope.save();
        }
        $scope.click_prev=false;
        $scope.click_next=true;
        if(($scope.currentItemIndex+1) < $scope.pvps.length) {
            $scope.currentItemIndex++;
        } else {
            $scope.currentItemIndex=0;
        }
    };
    $scope.$watch('currentItemIndex', function(newVal, oldVal){
        if (newVal != oldVal) {
            $scope.currentPvP = $scope.pvps[$scope.currentItemIndex];
        }
    },true);
    $scope.backward = function() {
        $scope.isAnimating = true;
        if($scope.isDirty()) {
            $scope.save();
        }
        $scope.click_next=false;
        $scope.click_prev=true;
        if($scope.currentItemIndex > 0) {
            $scope.currentItemIndex--;
        } else {
            $scope.currentItemIndex=$scope.pvps.length-1;
        }
    };
    $scope.addComment = function() {
        var newComment = {};
        newComment.id = -1;
        newComment.content = $scope.pvp.comment;
        newComment.modified_date = new Date().toJSON();
        newComment.owner = User.get();
        newComment.newSubCommentText="";
        newComment.subcomments=[];
        newComment.visibility=2; // People team

        var data = {id: newComment.id, _model_name: "employee", _object_id: 0, _content: newComment.content, _visibility: newComment.visibility};

        data.id = $scope.pvp.employee.id;
        EmployeeComments.save(data, function(response) {
            newComment.id = response.id;
            $scope.newCommentText = "";
        });
    }

}]);
