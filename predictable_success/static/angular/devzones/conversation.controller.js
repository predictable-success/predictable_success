    angular
        .module('devzones')
        .controller('ConversationController', ConversationController);

    function ConversationController(analytics, ConversationService, DevZoneService, Notification, $location, $modal, $parse, $rootScope, $routeParams, $scope, $window) {
        analytics.trackPage($scope, $location.absUrl(), $location.url());
        var vm = this;
        vm.is_employee = false;
        vm.is_org_dev = false;
        vm.is_development_lead = false;
        vm.selfie = null;
        vm.busy = false;
        vm.employee = null;
        vm.conversation = null;
        vm.development_lead = null;
        vm.collapseLeadershipAdvice = true;
        vm.collapseEmployeeAdvice = true;
        vm.collapseSelfie = true;
        vm.collapseLeadershipPerception = true;
        vm.giveLeaderPerception = giveLeaderPerception;
        vm.goBack = goBack;
        vm.gotoID = gotoID;
        vm.sendToEmployee = sendToEmployee;
        vm.replaceTemplateTags = replaceTemplateTags;

        activate();

        function activate() {
            getConversation();
        }

        function getConversation() {
            ConversationService.get($routeParams.conversationId)
                .then(function(conversation){
                    vm.conversation = conversation;
                    vm.advice = conversation.advice;
                    vm.selfie = conversation.employee_assessment;
                    vm.employee = conversation.employee;
                    vm.development_lead = conversation.development_lead;
                    if (vm.employee.id == $rootScope.currentUser.employee.id) {
                        vm.is_employee = true;
                    } else if (vm.development_lead.id == $rootScope.currentUser.employee.id) {
                        vm.is_development_lead = true;
                    }
                    if ($rootScope.currentUser.permissions.indexOf("org.view_employees") > -1) {
                        vm.is_org_dev = true;
                    }
                },
                function() {
                    Notification.error("You don't have access to this selfie.")
                }
            )
        }

        function giveLeaderPerception(conversation, compact, panel) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: '/static/angular/devzones/partials/_modals/leader-assessment.html',
                controller: 'LeaderAssessmentController as leaderAssessment',
                resolve: {
                    compactView: function () {
                        return compact
                    },
                    conversation: function () {
                        return conversation
                    },
                    panel: function () {
                        return panel
                    }
                }
            });
            modalInstance.result.then(
                function (conversation) {
                    console.log(conversation);
                    vm.conversation = conversation;
                }
            );
        }

        function sendToEmployee() {
            if ($window.confirm("Be sure you've had your development conversation with " + vm.conversation.employee.first_name + " before sending them your notes.  You can't edit your notes or development zone once you've sent them. Are you sure you want to proceed?")) {
                DevZoneService.shareEmployeeZone({id: vm.conversation.development_lead_assessment.id})
                    .then(function (employeeZone) {
                        Notification.success('Saved and sent to ' + vm.conversation.employee.full_name)
                        gotoID();
                    })
            }
        }

        function gotoID() {
            $location.path('/id/');
        }

        function goBack() {
            $window.history.back();
        }

        function replaceTemplateTags(html) {
            var template = $parse(html);
            return template(vm);
        }
    }