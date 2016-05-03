'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var http        = require('http');
var JWT         = require('./lib/jwtDecoder');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var activityCreate   = require('./routes/activityCreate');
var eventCustom   = require('./routes/eventCustom');
var activityUtils    = require('./routes/activityUtils');
var pkgjson = require( './package.json' );

var app = express();

// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config


var APIKeys = {
    appId           : '0142de1f-6492-4ad3-96ec-d68fd72d7dde',
    clientId        : 'qo3h3hdz87pj8tm3q6n7m6r0',
    clientSecret    : 'Hn40q6NFIc9kboS2u9YW6zHk',
    appSignature    : '0sw3jxgpwxw2nstx34fk3h3mz4pnmadwg2gm00vyazyw4ery41q3rpi14kkwn0zorxhqlyf43mtgcmxilfhdsvgo2y52dvkfp4ib4iuugpy22o0rrqkkaf3isku31kr1achnuse2rooxqq4yycnaz3wnfr3dt1pn4vaysfk5d554g5vwjwoazxko33fkh43ynhl1gx5fiu14nlg1wfsarpj0thbn1jud4vdjonpzlol0axr0gks25ldlxljn5xh',
    authUrl         : 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1'
};


// Simple custom middleware
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});

    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );

    // Bolt the data we need to make this call onto the session.
    // Since the UI for this app is only used as a management console,
    // we can get away with this. Otherwise, you should use a
    // persistent storage system and manage tokens properly with
    // node-fuel
    req.session.token = jwtData.token;
    next();
}

// Use the cookie-based session  middleware
app.use(express.cookieParser());

// TODO: MaxAge for cookie based on token exp?
app.use(express.cookieSession({secret: "DeskAPI-CookieSecret0980q8w0r8we09r8"}));

// Configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', tokenFromJWT, routes.login );
app.post('/logout', routes.logout );

// Custom Activity Routes for interacting with Desk.com API
app.post('/ixn/activities/create-case/save/', activityCreate.save );
app.post('/ixn/activities/create-case/validate/', activityCreate.validate );
app.post('/ixn/activities/create-case/publish/', activityCreate.publish );
app.post('/ixn/activities/create-case/execute/', activityCreate.execute );
// Custom Event Routes for interacting with Desk.com API
app.post('/ixn/triggers/custom-trigger-1/save/', eventCustom.save );
app.post('/ixn/triggers/custom-trigger-1/validate/', eventCustom.validate );
app.post('/ixn/triggers/custom-trigger-1/publish/', eventCustom.publish );
app.post('/ixn/triggers/custom-trigger-1/execute/', eventCustom.execute );



app.get('/clearList', function( req, res ) {
	// The client makes this request to get the data
	activityUtils.logExecuteData = [];
	res.send( 200 );
});


// Used to populate events which have reached the activity in the interaction we created
app.get('/getActivityData', function( req, res ) {
	// The client makes this request to get the data
	if( !activityUtils.logExecuteData.length ) {
		res.send( 200, {data: null} );
	} else {
		res.send( 200, {data: activityUtils.logExecuteData} );
	}
});

app.get( '/version', function( req, res ) {
	res.setHeader( 'content-type', 'application/json' );
	res.send(200, JSON.stringify( {
		version: pkgjson.version
	} ) );
} );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
