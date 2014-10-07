angular.module('tdb.services', ['ngResource'])

.factory('Employee', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'addNew': { method:'PUT', data:{full_name:'@full_name'}, isArray: false },
        'update': { method:'PUT', data:{full_name:'@full_name', hire_date: '@hire_date', departure_date: '@departure_date'}, isArray: false }
    };
    var res = $resource('/api/v1/employees/:id/', {id:'@id'}, actions);
    return res;
}])

.factory('Assessment', ['$resource', '$http', function($resource, $http) {
    var res = $resource('/api/v1/assessment/employees/:id/', {id:'@id'});
    return res;
}])

.factory('EmployeeMBTI', ['$resource', '$http', function($resource, $http) {
    var res = $resource('/api/v1/assessment/mbti/employees/:id/', {id:'@id'});
    return res;
}])

.factory('TeamMBTI', ['$resource', '$http', function($resource, $http) {
    var res = $resource('/api/v1/assessment/mbti/teams/:id/', {id:'@id'});
    return res;
}])


.factory('TeamMembers', ['$resource', '$http', function($resource, $http) {
    var res = $resource('/api/v1/team-members/:id/', {id:'@id'});
    return res;
}])

.factory('EmployeeLeader', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'addNew': { method:'POST', data:{leader:'@leader_id'}, isArray: false }
    };
    var res = $resource('/api/v1/leaderships/employees/:id', {id:'@id'}, actions);
    return res;
}])

.factory('Coach', ['$resource', '$http', function($resource, $http) {
    var Coach = $resource('/api/v1/coaches\\/');

    return Coach;
}])

.factory('Mentorship', ['$resource', '$http', function($resource, $http) {
    var Mentorship = $resource('/api/v1/mentorships/:id');

    Mentorship.getMentorshipsForMentee = function(id) { return this.query({mentee_id: id}); };

    return Mentorship;
}])

.factory('Leadership', ['$resource', '$http', function($resource, $http) {
    var Leadership = $resource('/api/v1/leaderships/:id');

    Leadership.getLeadershipsForEmployee = function(id) { return this.query({employee_id: id}); };
    Leadership.getCurrentLeader = function(id) { return this.query({employee_id: id}); };
    Leadership.getLeadershipsForLeader = function(id) { return this.query({leader_id: id}); };

    return Leadership;
}])

.factory('Attribute', ['$resource', '$http', function($resource, $http) {
    var Attribute = $resource('/api/v1/attributes\\/');

    Attribute.getAttributtesForEmployee = function(employee_id, category_id) { return this.query({employee_id: employee_id, category_id: category_id}); };

    return Attribute;
}])

.factory('Team', ['$resource', '$http', function($resource, $http) {
    var Team = $resource('/api/v1/teams/:id');
	
	return Team;
}])

.factory('CompSummary', ['$resource', '$http', function($resource, $http) {
    var CompSummary = $resource('/api/v1/compensation-summaries\\/');

    CompSummary.getAllSummariesForEmployee = function(id) { return this.query({employee_id: id}); };

    return CompSummary;
}])

.factory('PvpEvaluation', ['$resource', '$http', function($resource, $http) {
    var PvpEvaluation = $resource('/api/v1/pvp-evaluations\\/');

    PvpEvaluation.getAllEvaluationsForEmployee = function(id) {
        return this.query({ employee_id: id });
    };

    PvpEvaluation.getCurrentEvaluations = function() {
        var params = { current_round: true };
        return this.query(params);
    };

    PvpEvaluation.getCurrentEvaluationsForTalentCategory = function(talent_category, team_id) {
        var params = { talent_category: talent_category, current_round: true };
        if(team_id) {
            params['team_id'] = team_id;
        }
        return this.query(params);
    };
    return PvpEvaluation;
}])

.factory('TeamLeads', ['$resource', '$http', function($resource, $http) {
    var TeamLeads = $resource('/api/v1/team-leads\\/');

    TeamLeads.getCurrentEvaluationsForTeamLeads = function(team_id) {
        return this.query({team_id: team_id});
    };
    return TeamLeads;
}])

.factory('TalentCategoryReport', ['$resource', '$http', function($resource, $http) {
    TalentCategoryReport = $resource('/api/v1/talent-category-reports/:id/:teamId');

    TalentCategoryReport.getReportForTeam = function(teamId, success, failure) { return this.get({ id: 'teams', teamId: teamId }, success, failure); };
    TalentCategoryReport.getReportForCompany = function(success, failure) { return this.get({ id: 'all-employees' }, success, failure); };

    return TalentCategoryReport;
}])

.factory('HappinessReport', ['$resource', '$http', function($resource, $http) {
    HappinessReport = $resource('/api/v1/happiness-reports/:id');

    HappinessReport.getReportForCompany = function(days_ago, neglected) {
        var params = {id: 'all-employees', days_ago: days_ago, 'neglected': neglected };
        return this.query(params);
    };

    return HappinessReport;
}])

.factory('PhotoUpload', ['$resource', '$http', function($resource, $http) {
    return function(model, files) {
        var actions = {
            'update': {
                method:'POST',
                transformRequest: function () {
                    var formData = new FormData();
                    //need to convert our json object to a string version of json otherwise
                    // the browser will do a 'toString()' on the object which will result
                    // in the value '[Object object]' on the server.
                    formData.append("model", angular.toJson(model));
                    //now add all of the assigned files
                    for (var i = 0; i < files.length; i++) {
                        //add each file to the form data and iteratively name them
                        console.log(files[i]);
                        formData.append("file" + i, files[i]);

                    }
                    return formData;
                },
                data: { model: model, files: files },
                isArray: false,
                headers:{'Content-Type':false}
            },
            'remove': { method:'DELETE' }
        };
        var res = $resource('/api/v1/image-upload/employees/:id', {id:'@id'}, actions);

        return res;
    }
}])

.factory('EmployeeToDo', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'addNew': { method:'POST', data:{description:'@description', completed: '@completed', assigned_to_id: '@assigned_to_id', due_date: '@due_date', owner_id: '@owner_id'}, isArray: false },
        'update': { method:'PUT', data:{description:'@description'}, isArray: false },
        'remove': { method:'DELETE' },
    }
    var EmployeeToDo = $resource('/api/v1/tasks/employees/:id', {id:'@id', completed: '@completed'}, actions);

    EmployeeToDo.getReportForCompany = function(days_ahead) {
        var params = {id: 'all-employees', days_ahead: days_ahead};
        return this.query(params);
    };

    return EmployeeToDo;
}])

.factory('PeopleReport', ['$resource', '$http', function($resource, $http) {
    PeopleReport = $resource('/api/v1/employee-comment-reports/:id');

    PeopleReport.getReportForCompany = function(days_ago, success, failure) { return this.get({ id: 'all-employees', days_ago: days_ago }, success, failure); };

    return PeopleReport;
}])

.factory('EngagementReport', ['$resource', '$http', function($resource, $http) {
    EngagementReport = $resource('/api/v1/employee-engagement-reports/:id');

    EngagementReport.getReportForCompany = function(days_ago, success, failure) { return this.get({ id: 'all-employees', days_ago: days_ago }, success, failure); };

    return EngagementReport;
}])

.factory('SalaryReport', ['$resource', '$http', function($resource, $http) {
    SalaryReport = $resource('/api/v1/salary-reports/:id/:teamId');

    SalaryReport.getReportForTeam = function(teamId, success, failure) { return this.get({ id: 'teams', teamId: teamId }, success, failure); };
    SalaryReport.getReportForCompany = function(success, failure) { return this.get({ id: 'company' }, success, failure); };

    return SalaryReport;
}])

.factory('TalentCategoryColors', [function() {
    var TalentCategoryColors = {
        colors: ['#008000','#00f500','#91fa00','#ffca00','#ff4600','#ff0000'],
        getColorByTalentCategory: function(category) {
            return this.colors[category - 1];
        }
    };

    return TalentCategoryColors;
}])

.factory('Engagement', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'addNew': { method:'POST', data:{assessed_by_id: '@assessed_by_id', assessment: '@assessment'}, isArray: false },
        'update': { method:'PUT', data:{assessed_by_id: '@assessed_by_id', assessment: '@assessment'}, isArray: false },
        'remove': { method:'DELETE' },
    }

    var Engagement = $resource('/api/v1/engagement/employees/:id', {id:'@id'}, actions);
    Engagement.getCurrentEngagement = function(id, success, failure) { return this.get({ id: id, current: true }, success, failure); };

    return Engagement;
}])

.factory('ToDo', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'update': { method:'PUT', data:{description:'@description', completed: '@completed', assigned_to_id: '@assigned_to_id', due_date: '@due_date'}, isArray: false },
        'remove': { method:'DELETE' },
    }
    var res = $resource('/api/v1/tasks/:id', {id:'@id'}, actions);
    return res;
}])

.factory('MyToDos', ['$resource', '$http', function($resource, $http) {
    var MyToDos = $resource('/api/v1/tasks\\/');
    return MyToDos;
}])

.factory('EmployeeComments', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'addNew': { method:'POST' },
    }
    var res = $resource('/api/v1/comments/employees/:id', {id:'@id'}, actions);
    return res;
}])

.factory('TeamComments', ['$resource', '$http', function($resource, $http) {
    var actions = {
        'addNew': { method:'POST' },
    }
    var res = $resource('/api/v1/comments/teams/:id', {id:'@id'}, actions);
    return res;
}])

.factory('SubComments', ['$resource', '$http', function($resource, $http) {
    var subComments = $resource('/api/v1/comments/subcomments/:id');

    return subComments;
}])

.factory('Comment', ['$resource', '$http', function($resource, $http) {
    var actions = {                   
        'update': { method:'PUT', data:{content:'@content'}, isArray: false },  
        'remove': { method:'DELETE' },  
    };
    var res = $resource('/api/v1/comments/:id', {id:'@id'}, actions);
    return res;
}])

.factory('User', ['$resource', '$http', function($resource, $http) {
    var currentUser = $resource('api/v1/user-status\\/');

    return currentUser;
}])

.factory('Site', ['$resource', '$http', function($resource, $http) {
    var currentSite = $resource('api/v1/current_site\\/');

    return currentSite;
}])

.factory('KPIIndicator', ['$resource', '$http', function($resource, $http) {
    var res = $resource('/api/v1/kpi-indicator\\/');
    return res;
}])

.factory('KPIPerformance', ['$resource', '$http', function($resource, $http) {
    var res = $resource('/api/v1/kpi-performance\\/');
    return res;
}])

.factory('fileReader', ['$q', '$log', function ($q, $log) {

        var onLoad = function(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };

        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };

        var onProgress = function(reader, scope) {
            return function (event) {
                scope.$broadcast("fileProgress",
                    {
                        total: event.total,
                        loaded: event.loaded
                    });
            };
        };

        var getReader = function(deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            reader.onprogress = onProgress(reader, scope);
            return reader;
        };

        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();

            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);

            return deferred.promise;
        };

        return {
            readAsDataUrl: readAsDataURL
        };
}]);

angular.module('analytics', ['ng'])

.service('analytics', ['$window', function($window) {
    return {
        trackPage: function (scope, absoluteUrl, locationPath) {

          if (absoluteUrl.indexOf("0.0.0.0") < 0 && absoluteUrl.indexOf("localhost") < 0) {
            scope.$on('$viewContentLoaded', function(event) {
              $window._gaq.push(['_trackPageview', locationPath]);
            });
          } else {
            console.log('not tracked', locationPath);
          }
        }
    };
}]);