'use strict';
var learnjs = {
    poolId: 'ap-northeast-1:637202ea-b1e7-48c2-a0c7-c62913ec7668'
};
// 4103
learnjs.identity = new $.Deferred();

//START: dataModel
learnjs.problems = [
    {
        description: "What is truth?",
        code: "function problem() {return __; }"
    },
    {
        description: "Simple Math",
        code: "function problem() {return 42 === 6 * __; }"
    }
];
//END: dataModel

// 3912
learnjs.triggerEvent = function(name, args) {
    $('.view-container>*').trigger(name, args);
}

learnjs.template = function(name) {
    return $('.templates .' + name).clone();
}

learnjs.applyObject = function(obj, elem) {
    for (var key in obj) {
        elem.find('[data-name="' + key + '"]').text(obj[key]);
    }
}

// 4300
learnjs.addProfileLink = function(profile) {
    var link = learnjs.template('profile-link');
    link.find('a').text(profile.email);
    $('.signin-bar').prepend(link);
}

learnjs.flashElement = function(elem, content) {
    elem.fadeOut('fast', function() {
        elem.html(content);
        elem.fadeIn();
    });
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

learnjs.problemView = function(data) {
    var problemNumber = parseInt(data, 10);
    var view = learnjs.template('problem-view');
    var problemData = learnjs.problems[problemNumber - 1];
    var resultFlash = view.find('.result');
    var answer = view.find('.answer');
    
    function checkAnswer() {
        var test = problemData.code.replace('__', answer.val())  + '; problem();';
        return eval(test);
    }

    function checkAnswerClick() {
        if (checkAnswer()) {
            var correctFlash = learnjs.buildCorrectFlash(problemNumber);
            learnjs.flashElement(resultFlash, correctFlash);
            learnjs.saveAnswer(problemNumber, answer.val());
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
    // 5300
    // START: problemVewFetchAnswer
    learnjs.fetchAnswer(problemNumber).then(function(data) {
        if(data.Item) {
            answer.val(data.Item.answer);
        }
    });
    // END:problemViewFetchAnswer
    view.find('.check-btn').click(checkAnswerClick);
    view.find('.title').text('Problem #' + problemNumber);
    learnjs.applyObject(problemData, view);
    return view;
}

// START: landingView
// 3800
learnjs.landingView = function() {
    return learnjs.template('landing-view');
}
// END: landingView

// 4100
// START: profileView
learnjs.profileView = function() {
    var view = learnjs.template('profile-view');
    learnjs.identity.done(function(identity) {
        view.find('.email').text(identity.email);
    });
    return view;
}
// END: profileView

learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView,
        '#profile': learnjs.profileView,
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
//5200
// START:sendDbRequest
learnjs.sendDbRequest = function(req, retry ) {
    var promise = new $.Deferred();
    req.on('error', function(error) {
        if(error.code === "CredentialsError") { // <label id="code.sendDbRequest.error"/>
            learnjs.identity.then(function(identity) {
                return identity.refresh().then(function() {
                    return retry(); // <label id="code.sendDbRequest.retry"/>
                }, function() {
                    promise.reject(resp);
                });
            });
        } else { 
            promise.reject(error); //<label id="code.sendDbRequest.reject"/>
        }
    });
    req.on('success', function(resp) {
        promise.resolve(resp.data); //<label id="code.sendDbRequest.success"/>
    });
    req.send();
    return promise;
}
// END:sendDbRequest
// 5300
// START:fetchAnswer
learnjs.fetchAnswer = function(problemId) {
    return learnjs.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'learnjs',
            Key: {
                userId: identity.id,
                problemId: problemId
            }
        };
        return learnjs.sendDbRequest(db.get(item), function() {
            return learnjs.fetchAnswer(problemId);
        });
    });
};
// END:fetchAnswer
// 5500
// START:countAnswers
learnjs.countAnswers = function(problemId) {
    return learnjs.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var params = {
            TableName: 'learnjs',
            Select: 'COUNT',
            FilterExpression: 'problemId = :problemId',
            ExpressionAttributeValues: {':problemId': problemId}
        };
        return learnjs.sendDbRequest(db.scan(params), function() {
            return learnjs.countAnswers(problemId);
        });
    });
}
//5100
learnjs.saveAnswer = function(problemId, answer) {
    return learnjs.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'learnjs',
            Item: {
                userId: identity.id,
                problemId: problemId,
                answer: answer
            }
        };
        return learnjs.sendDbRequest(db.put(item), function() {
            return learnjs.saveAnswer(problemId, answer);
        })
    })
};

learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
    learnjs.identity.done(learnjs.addProfileLink);
}

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

