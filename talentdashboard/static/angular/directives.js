'use strict'

google.load('visualization', '1', {packages: ['corechart','annotationchart']});

angular.module('tdb.directives', [])

.directive('ngChart', function () {
    return {
        link: function (scope, element, attrs) {
            var chart = null;

            scope.$watch(attrs.ngModel, function (options) {
                if (!chart) {
                    chart = jQuery(element).orgDiagram(scope[attrs.ngModel]);
                } else {
                    chart.orgDiagram(scope[attrs.ngModel]);
                    chart.orgDiagram("update", primitives.orgdiagram.UpdateMode.Refresh);
                }
            }, true);
        }
    };
})
.directive('happinessChart', ['$rootScope', 'AnnotationChart', function($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch("happys", function (newValue) {
                var data = new google.visualization.DataTable();
                data.addColumn('date', 'Date');
                data.addColumn('number', 'Engagement');
                data.addColumn({type:'string', role: 'annotation'});
                data.addColumn({type:'string', role: 'style'});
                data.addColumn('number', 'CommentIndex');
                angular.forEach(scope.happys, function(happy, index) {
                    var annotation;
                    var color;
                    switch (happy.assessment) {
                        case 1:
                            annotation = 'W';
                            color = 'red';
                            break;
                        case 2:
                            annotation = '(';
                            color = 'orange';
                            break;
                        case 3:
                            annotation = 'C';
                            color = 'yellow';
                            break;
                        case 4:
                            annotation = 'A';
                            color = 'limegreen';
                            break;
                        case 5:
                            annotation = 'D';
                            color = '#008000';
                            break;
                    }
                    var row = [$rootScope.parseDate(happy.assessed_date), happy.assessment, annotation, color, index];
                    data.addRow(row);
                });
                var options = {
                    vAxes: {0: {format: '#,###', textStyle:{color: '#fff'}, titleTextStyle:{color: '#fff'}}},
                    vAxis: { ticks: [0, 1,2,3,4,5] },
                    hAxis: { format: 'MMM d, y', textStyle:{color: '#fff'}, titleTextStyle:{color: '#fff'}},
                    series: {
                        0:{ type: "line", targetAxisIndex: 0, pointSize: 5 },
                        1:{ type: "line", targetAxisIndex: 0,color: '#2a2a2a',lineWidth:0, pointSize: 0}
                    },
                    annotations: {
                        textStyle: {
                            fontName: 'Emoticons',
                            fontSize: 28
                        }
                    },

                    legend: {position: 'none'},
                    backgroundColor: '#2a2a2a',
                    chartArea:{top:5, left: 48, height:'80%'}
                };

                var chart = new google.visualization.ComboChart(element[0]);
                google.visualization.events.addListener(chart, 'select', function(args) {
                   if (chart.getSelection().length>0) {
                     var selection = chart.getSelection()[0];
                     var index=data.getValue(selection.row, 4);
                     scope.clicked_happy = scope.happys[index];
                     if (scope.happys[index].comment) {
                         scope.showComment=true;
                     } else {
                         scope.showComment=false;
                     }

                     scope.$apply();
                   }
                });
                chart.draw(data, options);
            }, true);
        }
    }
}])
.directive('timelineChart', ['$routeParams', '$rootScope', 'AnnotationChart', function($routeParams, $rootScope, AnnotationChart) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            scope.employee_id = $routeParams.id;
            AnnotationChart.getData(scope.employee_id).$promise.then(function(response) {
                scope.chart_data = response;
                if (scope.chart_data) {
                    var data = new google.visualization.DataTable();

                    data.addColumn('date', 'Date');
                    data.addColumn('number', 'Performance');
                    data.addColumn('string', undefined);
                    data.addColumn('string', undefined);
                    data.addColumn('number', 'Potential');
                    data.addColumn('string', undefined);
                    data.addColumn('string', undefined);
                    data.addColumn('number', 'Comment');
                    data.addColumn('string', undefined);
                    data.addColumn('string', undefined);
                    data.addColumn('number', 'Happy');
                    data.addColumn('string', undefined);
                    data.addColumn('string', undefined);
                    var record;
                    angular.forEach(scope.chart_data, function(value, key) {
                        record = value;
                        var happy = parseInt(record[10]);
                        if (happy==0) {happy=undefined}
                        var row = [$rootScope.parseDate(record[0]), parseFloat(record[1]), undefined, undefined, parseFloat(record[4]), undefined, undefined, parseInt(record[7]), record[8], record[9], happy, undefined, undefined];
                        data.addRow(row);
                    });

                    var options = {
                        displayAnnotations: true,
                        displayZoomButtons: false,
                        displayRangeSelector: false,
                        thickness: 2,
                        max: 5,
                        min: 0
                    };

                    var chart = new google.visualization.AnnotationChart(element[0]);

                    chart.draw(data, options);
                }
            })
        }
    };
}])

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
                        legend:{textStyle:{color: 'white'}},
                        chartArea:{left:0,top:4,height: 205,width: 620},
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
                        if(scope.lead) {
                            $location.path('/evaluations/my-team/').search(search);
                        } else {
                            $location.path('/evaluations/current/').search(search);
                        }
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

.directive('ngScrollIntoView', function ($window) {
    return function (scope, element, attrs) {
        if (scope.offsetTop==0) {
            scope.offsetTop = element.offset().top
        }
        attrs.$observe("show", function(show) {
            if (show=='true') {
                if (element.offset().top + 73 > $("html").scrollTop()) {
                    $("html,body").animate({scrollTop:element.offset().top-73}, "fast");
                }
            }
        });
    };
})

.directive('ngScrollIntoViewPopUp', function ($window) {
    return function (scope, element, attrs) {
        scope.$watch("opened", function(opened) {
            if (opened) {
                if (element.offset().top + element.height() > $("body, html").scrollTop() + $window.innerHeight) {
                    $("body").animate({scrollTop:element.offset().top + element.height() -63}, "fast");
                }
            }
        });
    };
})

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
                var esc = event.which == 27,
                    el = event.target;

                if (esc) {
                        //ctrl.$setViewValue(elm.html());
                        el.blur();
                        event.preventDefault();                        
                    }
            });
            
        }
    };
})

.directive('setPopupPosition', function($parse) {
    return function(scope, element, attrs){
        element.bind("click", function (event) {
            scope.popup.top = element.offset().top;
            scope.$apply(function() {
                scope.popup.top = element.offset().top;
                scope.popup.left = element.offset().left;
                if (attrs.popupOffsetTop) {
                    scope.popup.top = scope.popup.top + parseInt(attrs.popupOffsetTop);
                };
            })
        });
    };
})

.directive('getPopupPosition', function() {
    return function(scope, element, attrs){
        scope.$watch("popup.top", function() {
            element.css({"top":(scope.popup.top-75)});
        });
    };
})

.directive('getPopupPositionAdd', function() {
    return function(scope, element, attrs){
        scope.$watch("popup.top", function() {
            element.css({"left":(scope.popup.left-127),"top":(scope.popup.top-75)});
        });
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

.directive('ngBlur', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}])

.directive('focusMe', function($timeout, $parse) {
  return {
    //scope: true,   // optionally create a child scope
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      element.bind('blur', function() {
         scope.$apply(model.assign(scope, false));
      });
    }
  };
})

.directive('ngChange', function() {
    return {
        restrict: 'A',
        scope:{'onChange':'=' },
        link: function(scope, elm, attrs) {
            scope.$watch('onChange', function(nVal) { elm.val(nVal); });
            elm.bind('blur', function() {
                var currentValue = elm.val();
                if( scope.onChange !== currentValue ) {
                    scope.$apply(function() {
                        scope.onChange = currentValue;
                    });
                }
            });
        }
    };
})

.directive('fxTransition', function($compile) {
  return {
    link: function(scope, elem, attrs) {
        if (attrs.index==0) {
            elem.addClass('current');//'current':  currentItemIndex==$index
        };
        elem.bind('oanimationend animationend webkitAnimationEnd', function() {
            if (attrs.index==scope.currentItemIndex) {
                elem.addClass('current');//'current':  currentItemIndex==$index
            } else {
               elem.removeClass('current');//'current':  currentItemIndex==$index
            }
            scope.$parent.isAnimating = false;
            scope.$apply();
        });
    }
  }
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
}])

.directive('handsOnTable', function() {
    return {
        restrict: 'E',
        template: "<div></div>",
        replace: true,
        link: function (scope, element, attrs) {
            scope.hot;
            var validManager = function(instance, td, row, col, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (!scope.autocomplete_values) {
                    td.style.background = '';
                } else if (scope.autocomplete_values.indexOf(value)>-1) {
                    td.style.background = '#cec';
                } else {
                    td.style.background = '#ff4c42';
                }
            }
            var columns = [
                {data: "First name", renderer: "html"},
                {data: "Last name", renderer: "html"},
                {data: "Email", renderer: "html"},
                {data: "Hire Date", renderer: "html"},
                {data: "Job Title", renderer: "html"},
                {data: "Department", renderer: "html"},
                {data: "Manager", renderer:validManager},
                {data: "Salary", renderer: "html"}
            ];
            var renderTable = function(){
                if (scope.data.length > 0) {
                    scope.importData = angular.copy(scope.data)
                    var colHeaders = ["First name", "Last name", "Email", "Hire Date", "Job Title", "Department", "Manager", "Salary"]

                    var el = element[0];
                    if (scope.hot) {
                        if (scope.hot.rootElement) {
                            console.log(scope.hot);
                            scope.hot.destroy();
                        }
                    }

                    scope.hot = new Handsontable(el, {
                        data: scope.importData,
                        colHeaders: colHeaders,
                        columns: columns
                    });
                }
            }
            scope.$watch("data", function (newValue) {
                if (newValue) {
                    renderTable();
                }
            })
            scope.$watch("autocomplete_values", function (newValue) {
                if (newValue) {
                    columns[6].type = "autocomplete";
                    columns[6].source = scope.autocomplete_values;
                    renderTable();
                }
            })

        }
    };
})

.directive('dragDropFile', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var CSVToArray = function( strData, strDelimiter ){
                strDelimiter = (strDelimiter || ",");
                var objPattern = new RegExp(
                    (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                    ),
                    "gi"
                    );
                var arrData = [[]];
                var arrMatches = null;
                while (arrMatches = objPattern.exec( strData )){

                    var strMatchedDelimiter = arrMatches[ 1 ];
                    if (
                        strMatchedDelimiter.length &&
                        strMatchedDelimiter !== strDelimiter
                        ){
                        arrData.push( [] );
                    }

                    var strMatchedValue;
                    if (arrMatches[ 2 ]){
                        strMatchedValue = arrMatches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                            );
                    } else {
                        strMatchedValue = arrMatches[ 3 ];
                    }
                    arrData[ arrData.length - 1 ].push( strMatchedValue );
                }

                return( arrData );
            };
            var CSVToJSON = function(csv) {
                var array = CSVToArray(csv);
                var objArray = [];
                for (var i = 1; i < array.length; i++) {
                    objArray[i - 1] = {};
                    for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                        var key = array[0][k];
                        objArray[i - 1][key] = array[i][k]
                    }
                }

                var json = JSON.stringify(objArray);
                json = json.replace(/},/g, "},\r\n");
                json = JSON.parse(json);


                return json;
            };


            var el = element[0];
            el.addEventListener(
                'dragover',
                function(e) {
                    e.dataTransfer.dropEffect = 'move';
                    // allows us to drop
                    if (e.preventDefault) e.preventDefault();
                    this.classList.add('over');
                    return false;
                },
                false
            );
            el.addEventListener(
                'dragenter',
                function(e) {
                    this.classList.add('over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function(e) {
                    this.classList.remove('over');
                    return false;
                },
                false
            );
            el.addEventListener(
                'drop',
                function(e) {
                    // Stops some browsers from redirecting.
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();

                    this.classList.remove('over');

                    var files = e.dataTransfer.files;
                    var i, f;
                    for (i = 0, f = files[i]; i != files.length; ++i) {
                        var reader = new FileReader();
                        var name = f.name;

                        reader.onload = function (e) {
                            var raw_data = e.target.result;
                            scope.data = CSVToJSON(raw_data);
                            scope.$apply();
                        };
                        reader.readAsBinaryString(f);
                    }
                },
                false
            );
        }
    };
})

.directive('pvpGraph', ['TalentCategories', 'TalentCategoryColors', function(TalentCategories, TalentCategoryColors) {
    return function(scope, element, attrs, controller) {
        var talentCategories = {
            "0": {
                "0": 0,
                "1": 6,
                "2": 6,
                "3": 4,
                "4": 4
            },
            "1": {
                "0": 6,
                "1": 6,
                "2": 6,
                "3": 4,
                "4": 4
            },
            "2": {
                "0": 6,
                "1": 6,
                "2": 6,
                "3": 4,
                "4": 4
            },
            "3": {
                "0": 5,
                "1": 5,
                "2": 5,
                "3": 3,
                "4": 2
            },
            "4": {
                "0": 5,
                "1": 5,
                "2": 5,
                "3": 2,
                "4": 1
            }
        };
        var canvas = element[0];
        var ctx = canvas.getContext("2d");
        var currentSquare = null;
        var height = canvas.height;
        var width = canvas.width;
        var squareWidth = Math.floor(width / 4);
        var squareHeight = Math.floor(height / 4);
        var lineColor = "#999999";
        var offSquareColor = "#343434";
        var squares = [];
        var squaresHash = {};
        var pvp = scope.pvps[attrs.index];

        for(var potential = 1; potential <= 4; potential++) {
            squaresHash[potential] = {};
            for(var performance = 1; performance <= 4; performance++) {
                var topLeft = {};
                var bottomRight = {};
                var talentCategory = talentCategories[potential][performance];
                var color = TalentCategoryColors.getColorByTalentCategory(talentCategory);
                topLeft.y = height - squareHeight - (((potential - 1) * squareHeight));
                topLeft.x = ((performance - 1) * squareWidth);
                bottomRight.y = topLeft.y + squareHeight;
                bottomRight.x = topLeft.x + squareWidth;
                var square = {
                    'potential': potential,
                    'performance': performance,
                    'topLeft': topLeft,
                    'bottomRight': bottomRight,
                    'color': color
                };
                squares.push(square);
                squaresHash[potential][performance] = square;
            }
        }

        function drawBlankGraph() {
            for(var index=0; index < squares.length; index++) {
                square = squares[index];
                ctx.fillStyle = offSquareColor;
                ctx.fillRect(square.topLeft.x, square.topLeft.y, squareWidth, squareHeight);
                ctx.strokeStyle = lineColor;
                ctx.strokeRect(square.topLeft.x, square.topLeft.y, squareWidth, squareHeight);
            }
        }

        var isOnSquare = function (point, square) {
            var inX = point.x > square.topLeft.x && point.x < square.bottomRight.x;
            var inY = point.y > square.topLeft.y && point.y < square.bottomRight.y;
            return inX && inY;
        };

        var getCursorPosition = function(event) {
            var totalOffsetX = 0;
            var totalOffsetY = 0;
            var currentElement = event.currentTarget;

            do {
                totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
                totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
            } while(currentElement = currentElement.offsetParent);

            var canvasX = event.pageX - totalOffsetX;
            var canvasY = event.pageY - totalOffsetY;

            return {x:canvasX, y:canvasY}
        };

        var findSquare = function() {
          return squaresHash[pvp.potential][pvp.performance];
        };

        var findDescription = function() {
            var descriptions = scope.pvp_descriptions.filter(function(description){
                return (description.performance==pvp.performance && description.potential==pvp.potential);
            });
            pvp.description = descriptions[0];
        };

        var drawSquare = function(square) {
            if(currentSquare) {
                ctx.fillStyle = offSquareColor;
                ctx.fillRect(currentSquare.topLeft.x, currentSquare.topLeft.y, squareWidth, squareHeight);
                ctx.strokeRect(currentSquare.topLeft.x, currentSquare.topLeft.y, squareWidth, squareHeight);
            }

            ctx.fillStyle = square.color;
            ctx.fillRect(square.topLeft.x, square.topLeft.y, squareWidth, squareHeight);
            ctx.strokeRect(square.topLeft.x, square.topLeft.y, squareWidth, squareHeight);
            currentSquare = square;
        };

        drawBlankGraph();
        if(pvp.potential > 0 && pvp.performance > 0){
            drawSquare(findSquare());
        }

        scope.click_canvas = function(e) {
            var point = getCursorPosition(e);
            for(var index = 0; index < squares.length; index++) {
                var square = squares[index];
                if(isOnSquare(point, square)) {
                    drawSquare(square);
                    pvp.potential = square.potential;
                    pvp.performance = square.performance;
                    findDescription();
                    scope.save();
                    break;
                }
            }
        };
    }
}])

.directive('modalEmployee',  ['Employee', 'EmployeeLeader', 'fileReader', 'PhotoUpload', 'Customers', function(Employee, EmployeeLeader, fileReader, PhotoUpload, Customers) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      employee: '=',
      leadership: '=',
      employees: '=',
      teams: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    controller: function ($scope, $rootScope, $location) {
        Customers.get(function (data) {
            $scope.customer = data;
        });
        $scope.$watch("editEmployee.departure_date",function(newValue,OldValue,scope) {
            if (newValue) {
                $scope.showDepartDatePicker = false;
            }
        });
        $scope.$watch("editEmployee.hire_date",function(newValue,OldValue,scope) {
            if (newValue) {
                $scope.showHireDatePicker = false;
            }
        });
        $scope.$watch("employee",function(newValue,OldValue,scope){
            if (newValue){
                $scope.editEmployee = angular.copy($scope.employee);
                $scope.preview=$scope.employee.avatar;
            }
        });
        $scope.$watch("leadership",function(newValue,OldValue,scope){
            if (newValue){
                $scope.edit_leadership = angular.copy($scope.leadership);
            }
        });
        $scope.scrub = function (){
            $scope.editEmployee = angular.copy($scope.employee);
            $scope.edit_leadership = angular.copy($scope.leadership);
        }
        var changeLocation = function(url, force) {
          //this will mark the URL change
          $location.path(url); //use $location.path(url).replace() if you want to replace the location instead
          $scope = $scope || angular.element(document).scope();
        };
        $scope.save = function (){
            var saveOtherInfo = function(employee, addNew) {
                $scope.employee = employee;
                if ($scope.preview != $scope.employee.avatar) {
                    var upload_data = {id: $scope.employee.id};
                    PhotoUpload($scope.model, $scope.files).update(upload_data, function (data) {
                        $scope.employee.avatar = data.avatar;
                    });
                }
                if ($scope.edit_leadership.leader.id != $scope.leadership.leader.id) {
                    var data = {id: $scope.employee.id, _leader_id: $scope.edit_leadership.leader.id};
                    EmployeeLeader.addNew(data, function (response) {
                        $scope.edit_leadership = response;
                        $scope.leadership = angular.copy($scope.edit_leadership);
                    });
                }
                if (addNew) {changeLocation('employees/' + $scope.employee.id, false);}
            };
            var saveEmployee = function(id) {
                var data = {id: id};
                if ($scope.employee.first_name != $scope.editEmployee.first_name) {
                    data._first_name = $scope.editEmployee.first_name;
                }
                if ($scope.employee.last_name != $scope.editEmployee.last_name) {
                    data._last_name = $scope.editEmployee.last_name;
                }
                if ($scope.employee.email != $scope.editEmployee.email) {
                    data._email = $scope.editEmployee.email;
                }
                if ($scope.employee.team.id != $scope.editEmployee.team.id) {
                    data._team_id = $scope.editEmployee.team.id;
                }
                if ($scope.employee.coach != $scope.editEmployee.coach) {
                    data._coach_id = $scope.editEmployee.coach.id;
                }
                if (+$scope.editEmployee.hire_date != +$scope.employee.hire_date) {
                    var hire_date = $rootScope.scrubDate($scope.editEmployee.hire_date, false);
                    data._hire_date = hire_date;
                }
                if ($scope.editEmployee.departure_date != $scope.employee.departure_date) {
                    var departure_date = $rootScope.scrubDate($scope.editEmployee.departure_date, false);
                    data._departure_date = departure_date;
                }
                if (id>0) {
                    Employee.update(data, function(response){saveOtherInfo(response, false)});
                } else {
                    Employee.addNew(data, function(response){saveOtherInfo(response, true)});
                }
            };

            saveEmployee($scope.employee.id);
        };

        $scope.uploadFile = function(files){
            $scope.files = files;
            fileReader.readAsDataUrl($scope.files[0], $scope)
                          .then(function(result) {
                              $scope.preview = result;
                          });
        };
        $scope.showHireDatePicker = false;
        $scope.showDepartDatePicker = false;
        $scope.toggleHireDatePicker = function(){
            $scope.showDepartDatePicker = false;
            $scope.showHireDatePicker = !$scope.showHireDatePicker;
        };
        $scope.toggleDepartDatePicker = function(){
            $scope.showHireDatePicker = false;
            $scope.showDepartDatePicker = !$scope.showDepartDatePicker;
        }
    },
    templateUrl: "/static/angular/partials/modal-employee.html"
  };
}])

.directive('modalHappy',  ['Engagement', function(Engagement) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      employee: '=',
      happys: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    controller: function ($scope, $rootScope, $location) {
        $scope.happy = {assessment:0, comment:{content:''}};
        $scope.scrub = function (){
            $scope.happy.assessment = 0;
            $scope.happy.comment.content = '';
        }
        $scope.save = function (){
            var data = {id: $scope.employee.id, _assessed_by_id: $rootScope.currentUser.employee.id, _assessment: $scope.happy.assessment, _content:$scope.happy.comment.content};
            Engagement.addNew(data, function(response) {
                var newHappy = response;
                $scope.happys.unshift(newHappy);
            });
        };

    },
    templateUrl: "/static/angular/partials/modal-happy.html"
  };
}])

.directive('modalSendSurvey',  ['Engagement', function(Engagement) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      from: '=',
      subject: '=',
      body: '=',
      employee: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
    scope.dialogStyle = {};
    if (attrs.width)
        scope.dialogStyle.width = attrs.width;
    if (attrs.height)
        scope.dialogStyle.height = attrs.height;
    scope.hideModal = function() {
    scope.show = false;
    };
    $('textarea').focus(
        function(){
            $(this).parent('div').css('border-color','#1abc9c');
        }).blur(
        function(){
            $(this).parent('div').css('border-color','#c1c1c1');
        });
    },
    controller: function ($scope, $rootScope, $routeParams, SendEngagementSurvey, Notification) {
        $scope.send = function (){
            $scope.isSurveySending=true;
            var data = {id: $routeParams.id, _sent_from_id: $rootScope.currentUser.employee.id, _subject: $scope.subject, _body: $scope.body, _override:true};

            SendEngagementSurvey.addNew(data, function() {
              $scope.isSurveySending=false;
              Notification.success("Your survey was sent.");
              $scope.hideModal();
            },function(){
              $scope.isSurveySending=false;
              Notification.error("There was an error sending your survey.");
            });
        };

    },
    templateUrl: "/static/angular/partials/modal-send-survey.html"
  };
}])


.directive('sliderFollowThru', function() {
  return {
    link: function(scope, elem, attrs) {
      elem.slider({
        range: true,
        min: scope.kolbe_values[0],
        max: scope.kolbe_values[scope.kolbe_values.length-1],
        step: 1,
        create: function( event, ui ) {
            var $slider =  $(event.target);
            var max =  $slider.slider("option", "max");
            var min =  $slider.slider("option", "min");
            var spacing =  100 / (max - min);
            var width = $slider.width() / (max - min);
            $slider.find('.ui-slider-tick-mark').remove();
            $('<div style="width:' + $slider.width() + 'px;text-align:center;color:white;margin: 15px 0px 0px 0px;display:inline-block">Follow Thru</div>').insertBefore($slider);
            for (var i = 0; i < max-min ; i++) {
                if (i<max) {
                    $('<div class="ui-slider-label">' + scope.kolbe_follow_thru_labels[i] + '</div>').css({'left':  (spacing * i) +  '%','width': + width + 'px','text-align': 'center'}).appendTo($slider);
                }
                if (i != 0)
                {
                    $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
                }
            }
        },
        values: [scope.kolbe_values[0], scope.kolbe_values[scope.kolbe_values.length-1]],
        slide: function( event, ui ) {
          if(ui.values[1] - ui.values[0] < 1){
              return false;
          }
          scope.follow_thru.length=0;
          for (var i = ui.values[0]; i < ui.values[1] ; i++) {
            scope.follow_thru.push(scope.kolbe_follow_thru_labels[i]);
            scope.$apply();
          }
        }
      });
    }
  }
})
    
.directive('sliderQuickStart', function() {
  return {
    link: function(scope, elem, attrs) {
      elem.slider({
        range: true,
        min: scope.kolbe_values[0],
        max: scope.kolbe_values[scope.kolbe_values.length-1],
        step: 1,
        create: function( event, ui ) {
            var $slider =  $(event.target);
            var max =  $slider.slider("option", "max");
            var min =  $slider.slider("option", "min");
            var spacing =  100 / (max - min);
            var width = $slider.width() / (max - min);
            $('<div style="width:' + $slider.width() + 'px;text-align:center;color:white;margin: 15px 0px 0px 0px;display:inline-block">Quick Start</div>').insertBefore($slider);
            $slider.find('.ui-slider-tick-mark').remove();
            for (var i = 0; i < max-min ; i++) {
                if (i<max) {
                    $('<div class="ui-slider-label">' + scope.kolbe_quick_start_labels[i] + '</div>').css({'left':  (spacing * i) +  '%','width': + width + 'px','text-align': 'center'}).appendTo($slider);
                }
                if (i != 0)
                {
                    $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
                }
            }
        },
        values: [scope.kolbe_values[0], scope.kolbe_values[scope.kolbe_values.length-1]],
        slide: function( event, ui ) {
          if(ui.values[1] - ui.values[0] < 1){
              return false;
          }
          scope.quick_start.length=0;
          for (var i = ui.values[0]; i < ui.values[1] ; i++) {
            scope.quick_start.push(scope.kolbe_quick_start_labels[i]);
            scope.$apply();
          }
        }
      });
    }
  }
})

.directive('sliderImplementor', function() {
  return {
    link: function(scope, elem, attrs) {
      elem.slider({
        range: true,
        min: scope.kolbe_values[0],
        max: scope.kolbe_values[scope.kolbe_values.length-1],
        step: 1,
        create: function( event, ui ) {
            var $slider =  $(event.target);
            var max =  $slider.slider("option", "max");
            var min =  $slider.slider("option", "min");
            var spacing =  100 / (max - min);
            var width = $slider.width() / (max - min);
            $slider.find('.ui-slider-tick-mark').remove();
            $('<div style="width:' + $slider.width() + 'px;text-align:center;color:white;margin: 15px 0px 0px 0px;display:inline-block">Implementor</div>').insertBefore($slider);
            for (var i = 0; i < max-min ; i++) {
                if (i<max) {
                    $('<div class="ui-slider-label">' + scope.kolbe_implementor_labels[i] + '</div>').css({'left':  (spacing * i) +  '%','width': + width + 'px','text-align': 'center'}).appendTo($slider);
                }
                if (i != 0)
                {
                    $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
                }
            }
        },
        values: [scope.kolbe_values[0], scope.kolbe_values[scope.kolbe_values.length-1]],
        slide: function( event, ui ) {
          if(ui.values[1] - ui.values[0] < 1){
              return false;
          }
          scope.implementor.length=0;;
          for (var i = ui.values[0]; i < ui.values[1] ; i++) {
            scope.implementor.push(scope.kolbe_implementor_labels[i]);
            scope.$apply();
          }
        }
      });
    }
  }
})

.directive('sliderFactFinder', function() {
  return {
    link: function(scope, elem, attrs) {
      elem.slider({
        range: true,
        min: scope.kolbe_values[0],
        max: scope.kolbe_values[scope.kolbe_values.length-1],
        step: 1,
        create: function( event, ui ) {
            var $slider =  $(event.target);
            var max =  $slider.slider("option", "max");
            var min =  $slider.slider("option", "min");
            var spacing =  100 / (max - min);
            var width = $slider.width() / (max - min);
            $('<div style="width:' + $slider.width() + 'px;text-align:center;color:white;margin: 15px 0px 0px 0px;display:inline-block">Fact Finder</div>').insertBefore($slider);
            $slider.find('.ui-slider-tick-mark').remove();
            for (var i = 0; i < max-min ; i++) {
                if (i<max) {
                    $('<div class="ui-slider-label">' + scope.kolbe_fact_finder_labels[i] + '</div>').css({'left':  (spacing * i) +  '%','width': + width + 'px','text-align': 'center'}).appendTo($slider);
                }
                if (i != 0)
                {
                    $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
                }
            }
        },
        values: [scope.kolbe_values[0], scope.kolbe_values[scope.kolbe_values.length-1]],
        slide: function( event, ui ) {
          if(ui.values[1] - ui.values[0] < 1){
              return false;
          }
          scope.fact_finder.length=0;
          for (var i = ui.values[0]; i < ui.values[1] ; i++) {
            scope.fact_finder.push(scope.kolbe_fact_finder_labels[i]);
            scope.$apply();
          }
        }
      });
    }
  }
})

.directive('sliderVops', function() {
  return {
    link: function(scope, elem, attrs) {
      elem.slider({
        range: true,
        min: scope.vops_values[0],
        max: scope.vops_values[scope.vops_values.length-1],
        step: 1,
        create: function( event, ui ) {
            var $slider =  $(event.target);
            var max =  $slider.slider("option", "max");
            var min =  $slider.slider("option", "min");
            var $sliderrange = $slider.find('.ui-slider-range');
            $sliderrange.css({'top': '50%', 'height': '50%'});
            $('<div style="width:' + $slider.width() + 'px;text-align:center;color:white;margin: 15px 0px 0px 0px;display:inline-block">' + attrs.label + '</div>').insertBefore($slider);
            $('<div class="ui-slider-label">' + min + '-' + max + '</div>').css({'width': + $slider.width() + 'px','text-align': 'center'}).appendTo($slider);
            $('<div class="ui-slider-grad">&#160;</div>').css({'width': + $slider.width() + 'px','text-align': 'center'}).appendTo($slider);
        },
        values: [scope.vops_values[0], scope.vops_values[scope.vops_values.length-1]],
        slide: function( event, ui ) {
          if(ui.values[1] - ui.values[0] < 1){
              return false;
          } else {
            var $slider =  $(event.target);
            $slider.find('.ui-slider-label').text(ui.values[0] + " - " + ui.values[1]);
          }
        },
        stop: function( event, ui ) {
            scope.vops[attrs.type]=ui.values;
            scope.$apply();
        }
      });
    }
  }
});

