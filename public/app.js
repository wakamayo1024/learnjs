'use strict';
var learnjs = {
    poolId: 'ap-northeast-1:637202ea-b1e7-48c2-a0c7-c62913ec7668'
};

learnjs.problems = [
    {
        description: "What is truth?",
        code: "function problem() {return __; }"
    },
    {
        description: "Simple Math",
        code: "function problem() {return 42 === 6 * __; "
    }
];

// 4200
learnjs.identity = new $.Deferred();

// 4103
learnjs.awsRefresh = function() {
    var deferred = new $.Deferred();
    AWS.config.credentials.refresh(function(err) {
        if(err) {
            deferred.reject(err);
        } else {
            deferred.resolve(AWS.config.credentials.identityId)
        }
    });
    // 4200
    return deferred.promise();
}

function googleSignIn(googleUser){
    var id_token = googleUser.getAuthResponse().id_token;
    AWS.config.update({
        region: 'ap-northeast-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: learnjs.poolId,
            Logins: {
                'accounts.google.com' :id_token
            }
        })
    });
    // 4200
    //  START: gapi-refresh
    function refresh() {
        return gapi.auth2.getAuthInstance().signIn({
            prompt: 'login'
        }).then(function(userUpdate) {
            var creds = AWS.config.credentials;
            var newToken = userUpdate.getAuthResponse().id_token;
            creds.params.Logins['accounts.google.com'] = newToken;
            return learnjs.awsRefresh();    
        })
    }
    //  END: gapi-refresh
    // START: google-signin-getid
    learnjs.awsRefresh().then(function(id) {
        learnjs.identity.resolve({
            id: id,
            email: googleUser.getBasicProfile().getEmail(),
            refresh: refresh
        });
    });
}

learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView,
        '#': learnjs.landingView,
        '': learnjs.landingView
    };
    var hashParts = hash.split('-');
    var viewFn = routes[hashParts[0]];
    if (viewFn) {
        learnjs.triggerEvent('removingView', []);
        $('.view-container').empty().append(viewFn(hashParts[1]))
    }
}

learnjs.template = function(name) {
    return $('.templates .' + name).clone();
}
learnjs.problemView = function(data) {
    var problemNumber = parseInt(data, 10);
    var view =$('.templates .problem-view').clone();
    var problemData = learnjs.problems[problemNumber - 1];
    var resultFlash = view.find('.result');
    
    function checkAnswer() {
        var answer = view.find('.answer').val();
        var test = problemData.code.replace('__', answer) + '; problem();';
        return eval(test);
    }

    function checkAnswerClick() {
        if (checkAnswer()) {
            var correctFlash = learnjs.buildCorrectFlash(problemNumber);
            learnjs.flashElement(resultFlash, correctFlash);
        } else {
            learnjs.flashElement(resultFlash, 'Incorrect!');
        }
        return false;       // サーバーにリクエストを投げない
    }
    if (problemNumber < learnjs.problems.length) {
        var buttonItem = learnjs.template('skip-btn');
        buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
        $('.nav-list').append(buttonItem);
        view.bind('removingView', function() {
            buttonItem.remove();
        })
    }
    view.find('.check-btn').click(checkAnswerClick);
    view.find('.title').text('Problem #' + problemNumber);
    learnjs.applyObject(problemData, view);
    return view;
}
// 3800
learnjs.landingView = function() {
    return learnjs.template('landing-view');
}
// 3700
learnjs.buildCorrectFlash = function(problemNum) {
    var correctFlash = learnjs.template('correct-flash');
    var link = correctFlash.find('a');
    if (problemNum < learnjs.problems.length) {
        link.attr('href','#problem-' + (problemNum + 1));
    } else {
        link.attr('href','');
        link.text("You're Finished!");
    }
    return correctFlash;
}

learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
}

learnjs.applyObject = function(obj, elem) {
    for (var key in obj) {
        elem.find('[data-name="' + key + '"]').text(obj[key]);
    }
}

learnjs.flashElement = function(elem, content) {
    elem.fadeOut('fast', function() {
        elem.html(content);
        elem.fadeIn();
    });
}

// 3912
learnjs.triggerEvent = function(name, arg) {
    $('.view-container>*').trigger(name, arg);
}