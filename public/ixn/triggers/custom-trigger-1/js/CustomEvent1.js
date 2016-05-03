define([
    'js/postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;

    $(window).ready(onRender);

    connection.on('initEvent', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function initialize (data) {

    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onClickedNext () {
        if ((currentStep.key === 'enterLastName' && steps[3].active === false) || currentStep.key === 'enterFavoriteFood') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {

        connection.trigger('ready');
    }

    function onRender() {
        connection.trigger('ready'); // JB will respond the first time 'ready' is called with 'initEvent'

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');


    }

    function showStep(step, stepIndex) {

    }

    function save() {


        connection.trigger('updateEvent', payload);
    }
});
