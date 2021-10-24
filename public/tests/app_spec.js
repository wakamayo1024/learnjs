describe('LearnJS', function() {
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
    it('can redirect to the main view after the last problem in anserd', function(){
        var view = learnjs.buildCorrectFlash(2);
        expect(view.find('a').text()).toEqual("You're Finished!");
        expect(view.find('a').attr('href')).toEqual("");
    });

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

    describe('problem view', function(){
        var view;
        beforeEach(function() {
            view = learnjs.problemView('1');
        });
        // it('has a title that includes the problem number',function(){
            // var view = learnjs.problemView('1');
            // expect(view.text()).toEqual('Problem #1 Coming soon!')
        // });

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
                    view.find('.answer').val('true');
                    view.find('.check-btn').click();
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
            })
            // 3300
            it('rejects an incorrect answer', function() {
                view.find('.answer').val('false');
                view.find('.check-btn').click();
                // 3400
                expect(learnjs.flashElement).toHaveBeenCalledWith(resultFlash, 'Incorrect!');
            });
        });
    });

});