// START:namespace
'use strict';

var learnjs = {};
// END:namespace

learnjs.showView = function(hash) {
  var problemView = $('<div class="problem-view">').text('Coming soon!');
  $('.view-container').empty().append(problemView);
}
