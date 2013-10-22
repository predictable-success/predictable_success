angular.module('tdb.controllers', [])

.controller('EvaluationListCtrl', ['$scope', '$routeParams', 'PvpEvaluation', function($scope, $routeParams, PvpEvaluation) {
    $scope.evaluations = PvpEvaluation.getCurrentEvaluationsForTalentCategory($routeParams.talent_category);
}])

.controller('EvaluationListCtrl', ['$scope', '$routeParams', 'PvpEvaluation', 'Team', function($scope, $routeParams, PvpEvaluation, Team) {
    $scope.evaluations = PvpEvaluation.getCurrentEvaluationsForTalentCategory($routeParams.talent_category, $routeParams.team_id);
	$scope.intialQuery ={};
	$scope.intialQuery.teamId = $routeParams.team_id;
    $scope.talentCategory = $routeParams.talent_category;
	$scope.byTeam = { };
	$scope.byTeam.employee = { };
	$scope.byTeam.employee.team = { };
	if ($routeParams.team_id){
		Team.get(
			{id: $routeParams.team_id},
			function(data) {
				$scope.byTeam.employee.team.name = data.name
				$scope.byTeam.employee.team.id = data.id
			}
		);
	} else {
		$scope.byTeam.employee.team.name = "";
		$scope.byTeam.employee.team.id = "";
	}	
	$scope.menu = {show: false};
}])

.controller('EmployeeListCtrl', ['$scope', 'Employee', function($scope, Employee) {
    $scope.employees = Employee.query();
	$scope.employeeMenu = {show: false};
	$scope.teamMenu = {show: false};
	$scope.startsWith  = function(expected, actual){
		if(expected && actual){
			return expected.toLowerCase().indexOf(actual.toLowerCase()) == 0;
		}
		return true;
	}
}])

.controller('TeamListCtrl', ['$scope', 'Team', function($scope, Team) {
    $scope.teams = Team.query();
	$scope.teamMenu = {show: false};
	$scope.startsWith  = function(expected, actual){
		if(expected && actual){
			return expected.toLowerCase().indexOf(actual.toLowerCase()) == 0;
		}
		return true;
	}
}])

.controller('EmployeeDetailCtrl', ['$scope', '$routeParams', 'Employee', 'Mentorship', 'CompSummary', '$http', function($scope, $routeParams, Employee, Mentorship, CompSummary, $http) {
    Employee.get(
        {id: $routeParams.id},
        function(data) {
            $scope.employee = data;
            if(data.team && data.team.leader) {
                $http.get(data.team.leader).success(function(data) {
                    $scope.team_lead = data;
                });
            }
        }
    );
    $scope.mentorships = Mentorship.getMentorshipsForMentee($routeParams.id);
}])

.controller('EmployeeCompSummariesCtrl', ['$scope', '$routeParams', 'CompSummary', function($scope, $routeParams, CompSummary) {
    $scope.compSummaries = CompSummary.getAllSummariesForEmployee($routeParams.id);
}])

.controller('EmployeePvpEvaluationsCtrl', ['$scope', '$routeParams', 'PvpEvaluation', function($scope, $routeParams, PvpEvaluation) {
    $scope.pvp = PvpEvaluation.getAllEvaluationsForEmployee($routeParams.id);
	$scope.currentIndex = 0;
}])

.controller('CompanyOverviewCtrl', ['$scope', '$routeParams', 'TalentCategoryReport', 'SalaryReport', function($scope, $routeParams, TalentCategoryReport, SalaryReport) {
    TalentCategoryReport.getReportForCompany(function(data) {
        $scope.talentCategoryReport = data;
    });
    SalaryReport.getReportForCompany(function(data) {
        $scope.salaryReport = data;
    });
}])

.controller('TeamOverviewCtrl', ['$scope', '$routeParams', 'TalentCategoryReport', 'SalaryReport', 'Team', function($scope, $routeParams, TalentCategoryReport, SalaryReport, Team) {
    $scope.teamId = $routeParams.id;
    SalaryReport.getReportForTeam($routeParams.id, function(data) {
        $scope.salaryReport = data;
    });

    TalentCategoryReport.getReportForTeam($routeParams.id, function(data) {
        $scope.talentCategoryReport = data;
    });
	
    Team.get(
        {id: $routeParams.id},
        function(data) {
            $scope.team = data;
        }
    );
}])

.controller('EmployeeCommentsCtrl', ['$scope', '$routeParams', 'EmployeeComments', 'Comment', function($scope, $routeParams, EmployeeComments, Comment) {
    $scope.employeeId = $routeParams.id;
    $scope.commentIndex = 0; 
    EmployeeComments.query({ id: $scope.employeeId }).$then(function(response) {
        $scope.comments = response.data;
        $scope.originalComments = angular.copy($scope.comments);
        $scope.currentComment = $scope.comments[$scope.commentIndex];
    });

    $scope.selectComment = function(index) {
        $scope.commentIndex = index;
        $scope.currentComment = $scope.comments[$scope.commentIndex];
    }

    $scope.getAuthorName = function() {
        var name = "";
        if ($scope.currentComment.owner) {
            if ($scope.currentComment.owner.first_name) {
                name = $scope.currentComment.owner.first_name + " ";
            }
             if ($scope.currentComment.owner.last_name) {
                name += $scope.currentComment.owner.last_name;
            }
            return name.trim() || $scope.currentComment.owner.username || "Unknown";
        }
        return "No Owner";
    }

    $scope.isClean = function() {
        return angular.equals($scope.comments[$scope.commentIndex], $scope.originalComments[$scope.commentIndex]);
    }

    $scope.startEdit = function(e) {
        $scope.currentComment.isEditing = true;
    }

    $scope.cancelEdit = function(e) {
        $scope.currentComment.isEditing = false;
        $scope.currentComment.content = $scope.originalComments[$scope.commentIndex].content;
    }

    $scope.addComment = function(equals) {
        var newComment = {};
        newComment.id = -1;
        newComment.isEditing = true;
        newComment.content = "new comment #" + ($scope.comments.length+1);
        newComment.modified_date = new Date().toJSON();
        newComment.owner = {};
        newComment.owner.username = "admin";  // Fill in later with auth service.
        $scope.comments.push(newComment);
        $scope.originalComments.push(angular.copy(newComment));
        $scope.selectComment($scope.comments.length-1);
    }

    $scope.deleteComment = function(e) {
        var comment = $scope.currentComment;
        var data = {id: comment.id};

        var deleteSuccess = function() {
            $scope.currentComment.isEditing = false;
            $scope.comments.splice($scope.commentIndex, 1);
            $scope.originalComments.splice($scope.commentIndex, 1);
            $scope.selectComment(0);
        }

        if (data.id != -1) { 
            Comment.remove(data, function() {
                deleteSuccess();
            });
        }
        else { // never saved.
           deleteSuccess();
        }
    }

    $scope.saveComment = function(e) {
        var comment = $scope.currentComment;
        var data = {id: comment.id, _content: comment.content};

        if (data.id != -1) {
            Comment.update(data, function() {
                $scope.currentComment.isEditing = false;
                $scope.originalComments[$scope.commentIndex].content = $scope.currentComment.content;
            });
        }   
        else {
            data.id = $scope.employeeId;
            EmployeeComments.save(data, function(response) {
                $scope.currentComment.isEditing = false;
                $scope.currentComment.id = response.id;
                $scope.originalComments[$scope.commentIndex].content = $scope.currentComment.content;
            });
        }
    }
}]);
