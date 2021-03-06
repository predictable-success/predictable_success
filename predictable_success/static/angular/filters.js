var app = angular.module('tdb.filters', []);

app.filter('slice', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  };
});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

app.filter('fromNow', function() {
    return function(date, withoutSuffix) {

        if (date) {
            return moment(date).fromNow(withoutSuffix);
        } else {
            return '';
        }  
    }
});

app.filter('titleCase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
});

app.filter('unique', ['$parse', function ($parse) {
  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [],
        get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

      var extractValueToCompare = function (item) {
        return angular.isObject(item) ? get(item) : item;
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
}]);

app.filter('titlecase', function() {
    return function(s) {
        s = ( s === undefined || s === null ) ? '' : s;
        return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
            return ch.toUpperCase();
        });
    };
});

app.filter('noCents', function() {
  return function(value) {
    if (value) {
        return value.replace(/\.\d+/, '');
    };
  };
});

app.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

app.filter('new_line', function () {
    return function (value) {
        if (!value) return '';
        var new_value = value.replace(/[\n\r]/g,"<br/>");
        new_value = new_value.replace(/[\n]/g,"<br/>");
        new_value = new_value.replace(/[\r]/g,"<br/>");

        new_value = new_value.replace(/<br\/><br\/>/g,"<br/>");
        new_value = new_value.replace(/<br\/><br\/>/g,"<br/>");
        new_value = new_value.replace(/<br\/>/g,"<br/><br/>");
        return new_value;
    };
});

app.filter('greaterThan', function() {
  return function (items, number) {
    var filtered = [];
    if (items) {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.score > number) {
            filtered.push(item);
          }
        }
    }
    return filtered;
  };
});

app.filter('filterEmployees', function () {
  return function( items, talentCategory, teamId, happy, days_since_happy, fact_finder, follow_thru, quick_start, implementor, visionary, operator, processor, synergist) {

    parseDate = function (input) {
      if (input) {
          var parts = input.match(/(\d+)/g);
          return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
      }
      return input;
    };

    var filtered = [];
    angular.forEach(items, function(item) {
      push=true;
      if (talentCategory && push) {
          if (talentCategory!=item.current_talent_category) {push=false}
      }
      if (teamId && push) {
          if (!item.team){push=false}
          else{if(teamId!=item.team.id){push=false}}
      }
      if (happy && push) {
          if(happy!=item.happiness) {push=false}
      }
      if (teamId && push) {
          if(teamId!=item.team.id) {push=false}
      }
      if (fact_finder && push) {
          if (fact_finder.length <3) {
            if(fact_finder.indexOf(item.kolbe_fact_finder)==-1) {push=false}
          }
      }
      if (follow_thru && push) {
          if (follow_thru.length <3) {
            if(follow_thru.indexOf(item.kolbe_follow_thru)==-1) {push=false}
          }
      }
      if (quick_start && push) {
          if (quick_start.length <3) {
            if(quick_start.indexOf(item.kolbe_quick_start)==-1) {push=false}
          }
      }
      if (implementor && push) {
          if (implementor.length <3) {
            if(implementor.indexOf(item.kolbe_implementor)==-1) {push=false}
          }
      }
      if (visionary && push) {
          console.log('visionary');
          if (!item.vops_visionary) {
            push=false;
          } else if (item.vops_visionary<260) {
             push=false;
          }
      }
      if (operator && push) {
         if (!item.vops_operator) {
            push=false;
         } else if (item.vops_operator<260) {
            push=false;
         }
      }
      if (processor && push) {
         if (!item.vops_processor) {
            push=false;
         } else if (item.vops_processor<260) {
              push=false;
         }
      }
      if (synergist && push) {
         if (!item.vops_synergist) {
            push=false;
         } else if (item.vops_synergist<260) {
            push=false;
         }
      }
      if (days_since_happy && push) {
          if (item.happiness_date)
          {
              var d = new Date();
              d.setDate(d.getDate() - days_since_happy);
              if (d>parseDate(item.happiness_date))
              {push=false}
          } else {
              push=false
          }
      }
      if (push) {filtered.push(item)}
    });
    return filtered;
  };
});