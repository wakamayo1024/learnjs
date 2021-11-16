describe('LearnJS', function() {
    // 4101
    beforeEach(function() {
        learnjs.identity = new $.Deferred();
    });
    it('can show a problem view', function(){
        learnjs.showView('#problem-1');
        expect($('.view-container .problem-view').length).toEqual(1);
    });
    it('shows the landing page view when there is no hash', function() {
        learnjs.showView('');
        expect($('.view-container .landing-view').length).toEqual(1);
    });
    it('passes the hash view parameter to the view function', function() {
        spyOn(learnjs,'problemView');
        learnjs.showView('#problem-42');
        expect(learnjs.problemView).toHaveBeenCalledWith('42');
    });
    // 3911
    it('triggers removing View event when removing the view', function() {
        spyOn(learnjs, 'triggerEvent');
        learnjs.showView('#problem-1');
        expect(learnjs.triggerEvent).toHaveBeenCalledWith('removingView', []);
    })
    it('invokes the router when loaded', function(){
        spyOn(learnjs, 'showView');     // showViewの呼び出しを監視
        learnjs.appOnReady();
        expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);    // ハッシュと一緒に呼び出されていることを確認
    });

    it('subscribes to the hash change event', function(){
        learnjs.appOnReady();
        spyOn(learnjs, 'showView');
        $(window).trigger('hashchange');
        expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
    });
    // START: flashElement
    // 3400
    it('can flash an element while setting the text', function() {
        var elem = $('<p>');
        spyOn(elem, 'fadeOut').and.callThrough();
        spyOn(elem, 'fadeIn');
        learnjs.flashElement(elem, "new text");
        expect(elem.text()).toEqual("new text");
        expect(elem.fadeOut).toHaveBeenCalled();
        expect(elem.fadeIn).toHaveBeenCalled();
    });
    // END: flashElement

    // START: redirectEnd
    it('can redirect to the main view after the last problem in anserd', function(){
        var view = learnjs.buildCorrectFlash(2);
        expect(view.find('a').text()).toEqual("You're Finished!");
        expect(view.find('a').attr('href')).toEqual("");
    });
    // END: redirectEnd

    it('can trigger events on the view', function() {
        callback = jasmine.createSpy('callback');
        var div = $('<div>').bind('fooEvent',callback);
        $('.view-container').append(div);
        learnjs.triggerEvent('fooEvent', ['bar']);
        expect(callback).toHaveBeenCalled();
        expect(callback.calls.argsFor(0)[1]).toEqual('bar');
    });
    // 4300
    it('adds the profile link when the user logs in', function() {
        var profile = {email: 'foo@bar.com'};
        spyOn(learnjs, 'addProfileLink');
        learnjs.appOnReady();
        learnjs.identity.resolve(profile);
        expect(learnjs.addProfileLink).toHaveBeenCalledWith(profile);
    });

    it('can append a profile view link to navbar', function() {
        learnjs.addProfileLink({email: 'foo@bar.com'});
        expect($('.signin-bar a').attr('href')).toEqual('#profile');
    });
    // 5200
    describe('saveAnswer', function() {
        var dbspy, req, identityObj;
        beforeEach(function() {
            dbspy = jasmine.createSpyObj('db', ['put']);
            dbspy.put.and.returnValue('request');
            spyOn(AWS.DynamoDB, 'DocumentClient').and.returnValue(dbspy);
            spyOn(learnjs, 'sendDbRequest');
            identityObj = {id: 'COGNITO_ID'};
            learnjs.identity.resolve(identityObj);
        });

        it('writes the item to the database', function() {
            learnjs.saveAnswer(1, {});
            expect(learnjs.sendDbRequest).toHaveBeenCalledWith('request', jasmine.any(Function));
            expect(dbspy.put).toHaveBeenCalledWith({
                TableName: 'learnjs',
                Item: {
                    userId: 'COGNITO_ID',
                    problemId: 1,
                    answer: {}
                }
            });
        });

        it('resubmits the request on retry', function() {
            learnjs.saveAnswer(1, {answer: 'false'});
            spyOn(learnjs, 'saveAnswer').and.returnValue('promise');
            expect(learnjs.sendDbRequest.calls.first().args[1]()).toEqual('promise');
            expect(learnjs.saveAnswer).toHaveBeenCalledWith(1, {answer:'false'});
        });
    });
    

    // 4103
    describe('awsRefresh', function() {
        var callbackArg, fakeCreds;

        beforeEach(function() {
            fakeCreds = jasmine.createSpyObj('creds', ['refresh']);
            fakeCreds.identityId = 'COGNITO_ID';
            AWS.config.credentials = fakeCreds;
            fakeCreds.refresh.and.callFake(function(cb) { cb(callbackArg); });
        });

        it('returns a promise that resolves on success', function(done) {
            learnjs.awsRefresh().then(function(id) {
                expect(fakeCreds.identityId).toEqual('COGNITO_ID');
            }).then(done, fail);
        })

        it('rejects the promise on a failure', function(done) {
            callbackArg = 'error';
            learnjs.awsRefresh().fail(function(err) {
                expect(err).toEqual("error");
                done();
            });
        });
    });

    // START: profileView
    describe('profile view', function() {
        var view;
        beforeEach(function() {
            view = learnjs.profileView();
        });
        it('shows the users email address when they log in', function() {
            learnjs.identity.resolve({
                email: 'foo@bar.com'
            });
            expect(view.find('.email').text()).toEqual("foo@bar.com");
        });
        it('shows no email when the user is not logged in yet', function() {
            expect(view.find('.email').text()).toEqual("");
        });
    });

    // 4102 googleSignIn
    describe('googleSignIn callback', function() {
        var user, profile;

        beforeEach(function() {
            profile = jasmine.createSpyObj('profile', ['getEmail']);
            var refreshPromise = new $.Deferred().resolve("COGNITO_ID").promise();
            spyOn(learnjs, 'awsRefresh').and.returnValue(refreshPromise);
            spyOn(AWS, 'CognitoIdentityCredentials');
            user = jasmine.createSpyObj('user',
                ['getAuthResponse', 'getBasicProfile']);
            user.getAuthResponse.and.returnValue({id_token: 'GOOGLE_ID'});
            user.getBasicProfile.and.returnValue(profile);
            profile.getEmail.and.returnValue('foo@bar.com');
            googleSignIn(user);
        });

        it('sets the AWS region', function() {
            expect(AWS.config.region).toEqual('ap-northeast-1');
        });

        it('sets the identity pool ID and Google ID token', function() {
            expect(AWS.CognitoIdentityCredentials).toHaveBeenCalledWith({
                IdentityPoolId: learnjs.poolId,
                Logins: {
                    'accounts.google.com': 'GOOGLE_ID'
                }
            });
        });
        it('fetched the AWS credentials and resolved ther deferred', function(done) {
            learnjs.identity.done(function(identity) {
                expect(identity.email).toEqual('foo@bar.com');
                expect(identity.id).toEqual('COGNITO_ID');
                done();
            });
        });
        // 4200
        describe('refresh', function() {
            var instanceSpy;
            beforeEach(function() {
                AWS.config.credentials = {params: {Logins: {}}};
                var updateSpy = jasmine.createSpyObj('userUpdate', ['getAuthResponse']);
                updateSpy.getAuthResponse.and.returnValue({id_token: "GOOGLE_ID"});
                instanceSpy = jasmine.createSpyObj('instance', ['signIn']);
                instanceSpy.signIn.and.returnValue(Promise.resolve(updateSpy));
                var auth2Spy = jasmine.createSpyObj('auth2', ['getAuthInstance']);
                auth2Spy.getAuthInstance.and.returnValue(instanceSpy);
                window.gapi = { auth2: auth2Spy };
            });

            it('returns a promise when token is refreshed', function(done) {
                learnjs.identity.done(function(identity) {
                    identity.refresh().then(function() {
                        expect(AWS.config.credentials.params.Logins).toEqual({
                            'accounts.google.com': "GOOGLE_ID"
                        });
                        done();
                    });
                });
            });
            it('does not re-prompt for consent when refreshing the token in', function(done) {
                learnjs.identity.done(function(identity) {
                    identity.refresh().then(function() {
                        expect(instanceSpy.signIn).toHaveBeenCalledWith({prompt: 'login'});
                        done();
                    });
                });
            });
        });
    });

    describe('problem view', function(){
        var view;
        beforeEach(function() {
            view = learnjs.problemView('1');
        });

        it('has a title that includes the problem number',function() {
            expect(view.find('.title').text()).toEqual('Problem #1');
        });
        it('show the description', function() {
            expect(view.find('[data-name="description"]').text()).toEqual('What is truth?');
        });
        it('show the problem code',function() {
            expect(view.find('[data-name="code"]').text()).toEqual('function problem() {return __; }');
        });
        // 3912
        describe('skip button', function() {
            it('is added to the navbar when the view is added', function() {
                expect($('.nav-list .skip-btn').length).toEqual(1);
            });

            it('is remove from the navbar when the view is removed', function() {
                view.trigger('removingView');
                expect($('.nav-list .skip-btn').length).toEqual(0);
            });

            it('contains a link to the next problem', function() {
                expect($('.nav-list .skip-btn a').attr('href')).toEqual('#problem-2');
            });

            it('does not added when at the last problem', function() {
                view.trigger('removingView');
                view = learnjs.problemView('2');
                expect($('.nav-list .skip-btn').length).toEqual(0);
            });
        })
        describe('answer section', function() {
            // 3400
            var resultFlash;

            beforeEach(function() {
                spyOn(learnjs,'flashElement');
                resultFlash = view.find('.result');
            })
            // 3500
            describe('when the answer is correct', function() {
                beforeEach(function() {
                    spyOn(learnjs, 'saveAnswer');
                    view.find('.answer').val('true');
                    view.find('.check-btn').click();
                });
                // 3100
                it('saves the result', function(){
                    expect(learnjs.saveAnswer).toHaveBeenCalledWith(1, 'true');
                });
                // 3500
                it('flash the result', function() {
                    var flashArgs = learnjs.flashElement.calls.argsFor(0);
                    expect(flashArgs[0]).toEqual(resultFlash);
                    expect(flashArgs[1].find('span').text()).toEqual('Correct!')
                });
                // 3500
                it('shows a link to the next problem', function() {
                    var link = learnjs.flashElement.calls.argsFor(0)[1].find('a');
                    expect(link.text()).toEqual('Next Problem');
                    expect(link.attr('href')).toEqual('#problem-2')
                });
            });
            // 3300
            it('rejects an incorrect answer', function() {
                view.find('.answer').val('false');
                view.find('.check-btn').click();
                // 3400
                expect(learnjs.flashElement).toHaveBeenCalledWith(resultFlash, 'Incorrect!');
            });
        });
        // END: problemViewAnswers
    });
    // END: problemView
});