"use strict";

// START: namespace
var learnjs = {
  poolId: 'us-east-1:aa0e6d15-02da-4304-a819-f316506257e0'
};
// END: namespace

//START: dataModel
learnjs.problems = [
  {
    description: "What is truth?",
    code: "function problem() { return __; }"
  },
  {
    description: "Simple Math",
    code: "function problem() { return 42 === 6 * __; }"
  }
];
// END: dataModel

//START: triggerEvent
learnjs.triggerEvent = function(name, args) {
  $('.view-container>*').trigger(name, args);
}
//END: triggerEvent

//START: template
learnjs.template = function(name) {
  return $('.templates .' + name).clone();
}
//END: template

// START: applyObject
learnjs.applyObject = function(obj, elem) {
  for (var key in obj) {
    elem.find('[data-name="' + key + '"]').text(obj[key]);
  }
};
// END: applyObject

// START: flashElement
learnjs.flashElement = function(elem, content) {
  elem.fadeOut('fast', function() {
    elem.html(content);
    elem.fadeIn();
  });
}
// END: flashElement

// START: buildCorrectFlash
learnjs.buildCorrectFlash = function (problemNum) {
  var correctFlash = learnjs.template('correct-flash');
  var link = correctFlash.find('a');
  if (problemNum < learnjs.problems.length) {
    link.attr('href', '#problem-' + (problemNum + 1));
  } else {
    link.attr('href', '');
    link.text("You're Finished!");
  }
  return correctFlash;
}
// END: buildCorrectFlash

learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = learnjs.template('problem-view');
  var problemData = learnjs.problems[problemNumber - 1];
  var resultFlash = view.find('.result');

  function checkAnswer() {
    var answer = view.find('.answer').val();
    var test = problemData.code.replace('__', answer) + '; problem();';
    return eval(test);
  }

  // START: problemViewClickHandler
  function checkAnswerClick() {
    if (checkAnswer()) {
      var flashContent = learnjs.buildCorrectFlash(problemNumber);
      learnjs.flashElement(resultFlash, flashContent);
    } else {
      learnjs.flashElement(resultFlash, 'Incorrect!');
    }
    return false;
  }
  // END: problemViewClickHandler

  // START: problemViewNavbarButton
  if (problemNumber < learnjs.problems.length) {
    var buttonItem = learnjs.template('skip-btn');
    buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
    $('.nav-list').append(buttonItem);
    view.bind('removingView', function() {
      buttonItem.remove();
    });
  }
  // END: problemViewNavbarButton

  view.find('.check-btn').click(checkAnswerClick);
  view.find('.title').text('Problem #' + problemNumber);
  learnjs.applyObject(problemData, view);
  return view;
}
// END: problemView

// START: landingView
learnjs.landingView = function() {
  return learnjs.template('landing-view');
}
// END: landingView

// START: profileView
learnjs.profileView = function() {
  var view = learnjs.template('profile-view');
  learnjs.identity.done(function(identity) {
    view.find('.email').text(identity.email);
  });
  return view;
}
// END: profileView

// START: showView
learnjs.showView = function(hash) {
  // START: routes
  var routes = {
    '#problem': learnjs.problemView,
    '#profile': learnjs.profileView,
    '#': learnjs.landingView,
    '': learnjs.landingView
  };
  // END: routes
  var hashParts = hash.split('-');
  var viewFn = routes[hashParts[0]];
  if (viewFn) {
    // START: triggerRemove
    learnjs.triggerEvent('removingView', []);
    $('.view-container').empty().append(viewFn(hashParts[1]));
    // END: triggerRemove
  }
}
// END: showView

// START: appOnReady
learnjs.appOnReady = function() {
  window.onhashchange = function() {
    learnjs.showView(window.location.hash);
  };
  learnjs.showView(window.location.hash);
}
// END: appOnReady

// START: googleSignIn
function googleSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: learnjs.poolId,
      Logins: {
        'accounts.google.com': id_token
      }
    })
  })
}
// END: googleSignIn
