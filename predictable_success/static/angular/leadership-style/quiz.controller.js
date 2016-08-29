angular
    .module('leadership-style')
    .controller('QuizController', QuizController);

function QuizController(analytics, LeadershipStyleService, Notification, leadershipStyle, $location, $modal, $modalInstance, $rootScope, $scope) {
    var location_url = '/quiz/' + leadershipStyle.id;
    analytics.trackPage($scope, $location.absUrl(), location_url);
    var vm = this;

    vm.leadershipStyle = leadershipStyle;
    vm.panel_index = 0;
    vm.busy = false;
    vm.cancel = cancel;
    vm.close = close;
    vm.answerQuestion = answerQuestion;
    vm.previousQuestion = previousQuestion;
    vm.startOver = startOver;
    vm.showWhoCanSeeThis = showWhoCanSeeThis;
    vm.finish = finish;
    vm.employee = $rootScope.currentUser.employee;
    vm.selectedAnswer = null;
    vm.scores = [];

    activate()

    function activate() {
        if (leadershipStyle.next_question) {
            vm.selectedAnswer = leadershipStyle.next_question.answer;
        }
        isComplete();
    }

    function isComplete() {
        if (vm.leadershipStyle.completed || !vm.leadershipStyle.next_question) {
            if (!vm.leadershipStyle.completed) {
                vm.leadershipStyle.assessor = vm.leadershipStyle.assessor.id;
                vm.leadershipStyle.completed = true;
                LeadershipStyleService.updateLeadershipStyle(vm.leadershipStyle)
                            .then(function(result){
                                vm.leadershipStyle = result;
                                vm.busy = false;
                            }
                        );
            }
            vm.scores.push({'style' : 'Visionary', 'score': vm.leadershipStyle.visionary_score});
            vm.scores.push({'style' : 'Operator', 'score': vm.leadershipStyle.operator_score});
            vm.scores.push({'style' : 'Processor', 'score': vm.leadershipStyle.processor_score});
            vm.scores.push({'style' : 'Synergist', 'score': vm.leadershipStyle.synergist_score});
        }
    }

    function cancel() {
        $modalInstance.dismiss();
    }

    function close() {
        $modalInstance.close(vm.leadershipStyle)
        if (!vm.leadershipStyle.completed) {
            Notification.success('Your progress has been saved.')
        }
    }

    function answerQuestion(answer) {
        vm.busy = true;
        vm.leadershipStyle.last_question_answered = vm.leadershipStyle.next_question.id;
        if (vm.leadershipStyle.next_question.answer) {
            if (vm.leadershipStyle.next_question.answer.id != answer.id) {
                var answers = [answer.id];
                angular.forEach(vm.leadershipStyle.answers, function (value) {
                    if (vm.leadershipStyle.next_question.answer.id != value) {
                        answers.push(value);
                    }
                })
                vm.leadershipStyle.answers = answers;
            }
        } else {
            vm.leadershipStyle.answers.push(answer.id);
        }
        vm.leadershipStyle.assessor = vm.leadershipStyle.assessor.id;
        LeadershipStyleService.updateLeadershipStyle(vm.leadershipStyle)
            .then(function(result){
                vm.leadershipStyle = result;
                isComplete();
                if (vm.leadershipStyle.next_question) {
                    vm.selectedAnswer = vm.leadershipStyle.next_question.answer;
                } else {
                    vm.selectedAnswer = null;
                }
                vm.busy = false;
            }
        );
    }

    function previousQuestion(){
        vm.busy = true;
        LeadershipStyleService.goToPreviousQuestion(vm.leadershipStyle)
            .then(function(result){
                vm.leadershipStyle = result;
                if (vm.leadershipStyle.next_question) {
                    vm.selectedAnswer = vm.leadershipStyle.next_question.answer;
                } else {
                    vm.selectedAnswer = null;
                }
                vm.busy = false;
            }
        );
    }

    function startOver() {
        vm.busy = true;
        LeadershipStyleService.retakeLeadershipStyle(vm.leadershipStyle)
            .then(function(result){
                vm.panel_index=0;
                vm.selectedAnswer=null;
                vm.leadershipStyle = result;
                vm.busy = false;
            }
        );
    }

    function finish() {
        vm.busy = true;
        LeadershipStyleService.updateEmployeeZone({id: vm.leadershipStyle.id, zone: vm.leadershipStyle.zone.id, notes: vm.leadershipStyle.notes, completed: true})
            .then(function(result){
                vm.leadershipStyle = result;
                Notification.success('Your quiz results has been shared.')
                $modalInstance.close(result);
                if (leadershipStyle.id) {
                    $location.path('/id/' + result.id);
                }
                vm.busy = false;
            }
        );
    }

    function showWhoCanSeeThis(employee_id, employee_view) {
        $modal.open({
            animation: true,
            backdrop: 'static',
            templateUrl: '/static/angular/partials/_modals/who-can-see-this.html',
            controller: 'SupportTeamCtrl',
            resolve: {
                employee_view: function () {
                    return employee_view
                },
                employee_id: function () {
                    return employee_id
                }
            }
        });
    }
}
