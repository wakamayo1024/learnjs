describe('LearnJS', function() {
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
        var view = learnjs.problemView(formattedProblem.length);
        view.find('.answer').val('true');
        view.find('.check-btn').click();
        expect(view.find('.correct-flash .a').text()).toEqual('Next Problem');
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
        describe('answer section', function() {
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
                it('flash the result', function() {
                    var flashArgs = learnjs.flashElement.calls.argsFor(0);
                    expect(flashArgs[0]).toEqual(resultFlash);
                    expect(flashArgs[1].find('span').text()).toEqual('Correct!')
                });
                it('shows a link to the next problem', function() {
                    var link = learnjs.flashElement.calls.argsFor(0)[1].find('a');
                    expect(link.text()).toEqual(resultFlash);
                    expect(link.attr('href')).toEqual('#problem-2')
                });
            })
            it('rejects an incorrect answer', function() {
                view.find('.answer').val('false');
                view.find('.check-btn').click();
                expect(view.find('.result').text()).toEqual('Incorrect!');
            });
            it('check a next page',function (){
                view.find('.answer').val('true');
                view.find('.check-btn').click();
                expect(view.find('.correct-flash .a').text()).toEqual('Next Problem');
            });
        });
    });

});