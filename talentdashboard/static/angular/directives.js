'use strict'

google.load('visualization', '1', {packages: ['corechart']});

angular.module('tdb.directives', [])

.directive('compensationHistoryChart', function() {
    return function(scope, element, attrs){
        var table = new google.visualization.DataTable();

        table.addColumn('string', 'Year');
        table.addColumn('number', 'Salary');
        table.addColumn('number','Bonus');
        table.addColumn('number','Discretionary');
        table.addColumn('number','Writer Payuments and Royalties');

        for(var i = 0; i < scope.compSummaries.length; i++) {
            var record = scope.compSummaries[i];
            var row = [record.year.toString(), record.salary, record.bonus, record.discretionary, record.writer_payments_and_royalties];
            table.addRow(row);
        }

        var currency_format = '$#,###';
        var formatter = new google.visualization.NumberFormat({pattern: currency_format});
        formatter.format(table, 1);
        formatter.format(table, 2);
        formatter.format(table, 3);
        formatter.format(table, 4);

        var options = {
          hAxis: {textStyle: {color: 'white'}},
          vAxis: {textStyle: {color: 'white'}, format: '$#,###'},
          backgroundColor: '#2a2a2a',
          legend: {position: 'none'},
          chartArea: {top: 10},
          isStacked: true,
          height: attrs['height'],
          width: attrs['width'],
        };

        var chart = new google.visualization.ColumnChart(element[0]);

        chart.draw(table, options);
    };
})

.directive('talentCategoryChart', ['$location', 'TalentCategoryColors', function($location, TalentCategoryColors) {
    return function(scope, element, attrs){
        scope.$watch("talentCategoryReport", function() {
            if(scope.talentCategoryReport) {
                var top = scope.talentCategoryReport.categories[1];
                var strong = scope.talentCategoryReport.categories[2];
                var good = scope.talentCategoryReport.categories[3];
                var lackspotential = scope.talentCategoryReport.categories[4];
                var wrongrole = scope.talentCategoryReport.categories[5];
                var needschange = scope.talentCategoryReport.categories[6];

                var data = new Array(['PvP', 'Employees', 'Talent Category'],['Top', top, 1],['Strong', strong, 2],['Good', good, 3],['Low Pot', lackspotential, 4],['Low Perf', wrongrole, 5],['Poor', needschange, 6]);
                var table = new google.visualization.arrayToDataTable(data);
                var options;
                if (attrs.size=='small'){
                    options = {
                        pieSliceText: 'label',
                        backgroundColor: '#2a2a2a',
                        tooltip:{text:'value'},
                        legend: 'none',
                        chartArea:{left:40,top:40,width: 620},
                        colors: TalentCategoryColors.colors
                    };                    
                } else {
                    options = {
                        pieSliceText: 'label',
                        backgroundColor: '#2a2a2a',
                        tooltip:{text:'value'},
                        legend:{textStyle:{color: 'white'}},
                        chartArea:{left:40,top:40,width: 620},
                        colors: TalentCategoryColors.colors
                    };
                }

                var chart = new google.visualization.PieChart(element[0]);

                google.visualization.events.addListener(chart, 'select', function(){
                    var selectedItem = chart.getSelection()[0];
                    if(selectedItem) {
                        var talent_category = table.getValue(selectedItem.row, 2);
                        var search = {talent_category: talent_category};
                        if(scope.teamId) {
                            search['team_id'] = scope.teamId;
                        }
                        $location.path('/evaluations/current/').search(search);
                        scope.$apply();
                    }
                });

                chart.draw(table, options);
            }
        }, true);
    };
}])

.directive('employeeTalentCategory', ['TalentCategoryColors', function(TalentCategoryColors) {
    return function(scope, element, attrs){
        var color = TalentCategoryColors.getColorByTalentCategory(attrs.employeeTalentCategory);
        var canvas=element[0];
        var ctx=canvas.getContext("2d");
        ctx.fillStyle=color;
        ctx.fillRect(0,0,element[0].height,element[0].width);
    };
}])

.directive('contenteditable', function() {
    return {
        priority: 2,
        link: function(scope, element, attrs, ctrl) {
            // view -> model
            element.bind('blur', function() {
                scope.$apply(function() {
                    scope.currentComment.content = element.html();
                });
            });

            // model -> view
            //ctrl.render = function(value) {
                //elm.text(value);
            //};

            // load init value from DOM
            //ctrl.$setViewValue(elm.text());

            element.bind('keydown', function(event) {
                console.log("keydown " + event.which);
                var esc = event.which == 27,
                    el = event.target;

                if (esc) {
                        console.log("esc");
                        //ctrl.$setViewValue(elm.html());
                        el.blur();
                        event.preventDefault();                        
                    }
            });
            
        }
    };
})

.directive('onFilter', function() {
    return function(scope, element, attrs){
        attrs.$observe('index', function(value) {
            var index = scope.$eval(attrs.index);
            var columns = scope.$eval(attrs.columns);
            var top = Math.floor(index/columns) * 240;
            var left = (index % columns) * 240;
            element.animate({"left":left,"top":top},'0.8s');
        });
    };
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
})

.directive('pvpChart', ['TalentCategoryColors', function(TalentCategoryColors) {
    return function(scope, element, attrs){
        var svg = element[0];
        var potential = parseInt(attrs.potential, 10);
        var performance = parseInt(attrs.performance, 10);
        var talentCategory = parseInt(attrs.talentCategory, 10);
        var squareColor = TalentCategoryColors.getColorByTalentCategory(talentCategory);
        angular.element(svg.querySelector('.pvp-square-' + performance + '-' + potential)).attr('fill', squareColor);
    };
}]);
