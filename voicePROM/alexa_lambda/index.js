/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */


const Alexa = require('ask-sdk');
const awsSDK = require('aws-sdk');
//const {promisify} = require("es6-promisify");
var https = require('https');
//var uuid = require('uuid');
const docClient = new awsSDK.DynamoDB.DocumentClient();

// convert callback style functions to promises
//const dbScan = promisify(docClient.scan, docClient);
//const dbGet = promisify(docClient.get, docClient);
//const dbPut = promisify(docClient.put, docClient);
//const dbDelete = promisify(docClient.delete, docClient);



const SKILL_NAME = "voice <say-as interpret-as='spell-out'>pro</say-as>";
const FALLBACK_MESSAGE = `The ${SKILL_NAME} skill can't help you with that. Ask for help if you need it`;
const WELCOME_MESSAGE = `Welcome to ${SKILL_NAME}.`;
const WRONG_TIME_MESSAGE = 'Im confused. Try again.';
const ABOUT_TEXT = `${SKILL_NAME} is the voice first interface for the open source project, open <say-as interpret-as='spell-out'>pro</say-as>. Find us on git hub.`;
const HELP_TEXT = 'Help text';
const REPROMPT_TO_CONTINUE = 'anything else?';

const USER_TABLE = 'voicePRO_users';  //hash:'user_id', 'reports', 'email', 'alerts', 'questionnaires'
//const REPORTS_TABLE = 'voicePRO_reports';  //hash:'uuid', 'date', 'user_id', 'content'


/////////////////////////////
////  Initialization: checking authentication, grabbing email id from authentication server, and attribute management.
/////////////////////////////

// pass in a function that takes the userinfo object as argument
function applyUserInfoFromToken(token, callback){
  var options = {
      //url: 'https://voice-pro.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
      host: 'voice-pro.auth.us-east-1.amazoncognito.com',
      path: '/oauth2/userInfo',
      headers: { 'Authorization': 'Bearer ' + token},
      json: true,
  };
  console.log('sending user info request to ' + options.host + options.path);
  
  var req = https.get(options, (res) => {
    if (res.statusCode != 200){
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      var userinfo = {};
      callback(userinfo);
    }
    else{
      res.setEncoding('utf8');
      var returnData = "";
      res.on('data', chunk => {
        returnData = returnData + chunk;
      });
      res.on('end', () => {
        // we have now received the raw return data in the returnData variable.
        // We can see it in the log output via:
        console.log(JSON.stringify(returnData));
        // we may need to parse through it to extract the needed data
        var userinfo = JSON.parse(returnData);
        callback(userinfo);
      });
    }
  });
  req.end();
}

function getDefaultAttributes(){
  const attributes = {};
  attributes.state = {};
  attributes.data = {};
  attributes.user = {};
  
  attributes.user.linked = false;
  attributes.user.token = '';
  attributes.user.email = '';
  attributes.user.username = ''; 
  attributes.user.systemuserid = '';
  attributes.user.newToDB = false;
  
  attributes.state.exitType = 'hard';
  attributes.state.cancelAction = 'exit';
  attributes.state.lastMeds = [];
  attributes.state.confirmUndo = false;
  attributes.state.saved = false;

  attributes.data.allmedstaken = false;
  attributes.data.medstaken = [];
  attributes.data.sleepduration = 0;
  attributes.data.questionnaires = [];
  return attributes; 
}

// returns a promise that returns an updated attributes structure, even if there is no entry in the table
function attributesFromDB(attributes){
  const getUserTableParams = {
    TableName: USER_TABLE,
    Key: {
      'user_id': attributes.user.username
    }
  };
  console.log(getUserTableParams);
  
  const p2 = docClient.get(getUserTableParams).promise()
    .then((data) => {
      if (data) console.log(data);
        if (data && data.Item && 'user_id' in data.Item){
        const item = data.Item;
        console.log('Get item succeeded:');
        const quests = item.questionnaires;
        if (quests){
          attributes.data.questionnaires = quests.slice();
        }
        else{
          console.log('no questionnaires');
        }
      }
      else{
        console.log('no data');
        attributes.user.newToDB = true;  // new user. no biggie.
      }
      return attributes;
    })
    .catch( error =>{
      console.log('p2 catch error: ' + error);
      return attributes;
    });
  return p2;
}


// All functions that use data are passed through this function.
// processFunction takes attributes as its only argument.
// If the session is new, we confirm the user is linked, we set up their session
// attributes, grab their data if it exists (or create a new entry), and pass back
// back the function as a resolve to a promise.
// If the user is not linked, create a link request response.
// If the session is old, simply return processFunction(attributes);
function applyAttributes(handlerInput, processFunction, forceReinitialization = false){
  const attributesManager = handlerInput.attributesManager;
  if(handlerInput.requestEnvelope.session.new || forceReinitialization){
    // session is new, check for an access token
    var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    
    var speechText = 'You must authenticate and link to use this skill';
    const noaccountreply = handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    
    if (accessToken === undefined){
      // no access token, send them packing!
      console.log('no token');
      return noaccountreply;
    }
    else{
      // they have a good access token. now initialize the session.
      // 1. set up attributes
      const attributes = getDefaultAttributes();
      attributes.user.token = accessToken;
      attributes.user.systemuserid = handlerInput.requestEnvelope.context.System.user.userId;
      console.log('token: ' + accessToken);
      console.log('user: ' + attributes.user.systemuserid);
      
      
      // 2. get the userid and email from authentication server
      var promise = new Promise((resolve, reject) => {
        applyUserInfoFromToken(accessToken, (userinfo) =>{
          var email = userinfo.email;
          var username = userinfo.username;
          if (!email || email.length==0){
            attributes.user.linked = false;
            console.log('no email found, unlinked');
            reject('no email');
            //resolve(noaccountreply);
          }
          else {
            console.log(email);
            attributes.user.linked = true;
            attributes.user.email = email; 
            attributes.user.username = username;
            console.log('email found, linked');
            attributesManager.setSessionAttributes(attributes);
            resolve(attributes);
            //resolve(processFunction(attributes));
          }
        });
      });
      // 3. get additional data from database and chain to promise
      
       
      //return promise.catch(noaccountreply);
      return promise
      .then( (result1_attributes) => attributesFromDB(result1_attributes))
      .then( (result_attributes) => processFunction(result_attributes))
      .catch( (reason) => {
        console.log(reason);
        return noaccountreply;
      });
    }
  }
  else{
    var attributes = attributesManager.getSessionAttributes();
    return processFunction(attributes);
  }
}

const LaunchRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    console.log('launching');
    var processFunc = () => {
      const responseBuilder = handlerInput.responseBuilder;
      const speechOutput = WELCOME_MESSAGE;
      const reprompt = 'Say help if you would like assistance';
      return responseBuilder
        .speak(speechOutput)
        .withSimpleCard('Welcome!', 'To send your data, just say thank you or all done')
        .reprompt(reprompt)
        .reprompt(REPROMPT_TO_CONTINUE)
        .withShouldEndSession(false)
        .getResponse();
    };
    return applyAttributes(handlerInput, processFunc);
  },
};




/////////////////////////////
//// Main Intent Handlers ////
/////////////////////////////

const AllMedicationsTaken = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'all_medications_taken';
  },
  handle(handlerInput){
    var processFunc = (attributes) => {
      attributes.data.allmedstaken = true;
      attributes.state.cancelAction = 'allmeds';
      attributes.state.confirmUndo = false;
  
      const attributesManager = handlerInput.attributesManager;
      attributesManager.setSessionAttributes(attributes);
      const speechText = 'Okay!';
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(REPROMPT_TO_CONTINUE)
        .withSimpleCard('Medication taken', 'Ive recorded that you took all your medication. Good work!')
        .withShouldEndSession(false)
        .getResponse();
    };
    return applyAttributes(handlerInput, processFunc);
  }
};

const SleepReport = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'sleep_report';
  },
  handle(handlerInput){
    var processFunc = (attributes) =>{
      const request = handlerInput.requestEnvelope.request;
    
      const duration_hours = request.intent.slots.sleep_duration_hours.value;
      if (!duration_hours){
        attributes.state.cancelAction = 'abort';
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setSessionAttributes(attributes);
        
        return handlerInput.responseBuilder.addDelegateDirective().getResponse();
      }
      else{
        var sleep_hours = parseInt(duration_hours,10);
        const duration_minutes = request.intent.slots.sleep_duration_minutes.value;
        if (duration_minutes) sleep_hours += parseInt(duration_minutes,10)/60.0;
        const fraction_resolutions = request.intent.slots.sleep_duration_fraction.resolutions;
        if (fraction_resolutions){
          const res = fraction_resolutions.resolutionsPerAuthority[0];
          console.log(res);
  
          const valueid = parseFloat(res.values[0].value.id);
          sleep_hours += valueid;
          console.log(sleep_hours);
        }
        attributes.data.sleepduration = sleep_hours;
        attributes.state.cancelAction = 'sleep';
        attributes.state.confirmUndo = false;
  
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setSessionAttributes(attributes);
        const speechText = 'Got your sleep';
        
        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Sleep Report', 'You slept '+ sleep_hours + ' hours')
          .reprompt(REPROMPT_TO_CONTINUE)
          .withShouldEndSession(false)
          .getResponse();
      }
    };
    
    return applyAttributes(handlerInput, processFunc);
  }
};

const SomeMedicationsTaken = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'some_medications_taken';
  },
  handle(handlerInput){
    var processFunc = (attributes) =>{
    
      const request = handlerInput.requestEnvelope.request;
      // note that no matter what, the first message from Alexa as 'started'.
      // Then we delegate back. If it is complete, we get an immediate response from Alexa with 'complete'.
      // This 'complete' comm never shows up in the simmulator!!!!
      if (request.dialogState === 'STARTED' || request.dialogState === 'IN_PROGRESS'){
        attributes.state.cancelAction = 'abort';
        attributes.state.confirmUndo = false;
        
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setSessionAttributes(attributes);
        console.log('delegating for clarity');
        return handlerInput.responseBuilder.addDelegateDirective().getResponse();
      }
      else{
        const medA = request.intent.slots.medication.value;
        const medB = request.intent.slots.medicationB.value;
        const medC = request.intent.slots.medicationC.value;
  
        var speechText = 'Got ' + medA;
        var cardtext = "I've recorded that you took " + medA;
        attributes.state.lastMeds = [medA];
        attributes.data.medstaken.push(medA);
        if (medB){
          if (medC){
            speechText += ', ' + medB;
            cardtext += ', ' + medB;
          }
          else{
            speechText += ' and ' + medB;
            cardtext += ' and ' + medB;
          }
          attributes.data.medstaken.push(medB);
          attributes.state.lastMeds.push(medB);
        
        }
        if (medC){
          speechText += ', and ' + medC;
          cardtext += ', and ' + medC;
          attributes.data.medstaken.push(medC);
          attributes.state.lastMeds.push(medC);
        }
  
        attributes.state.cancelAction = 'last meds';
        attributes.state.confirmUndo = false;
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setSessionAttributes(attributes);
        cardtext = cardtext + '.';
        console.log('taking medications');
        
        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Medications', cardtext)
          .reprompt(REPROMPT_TO_CONTINUE)
          .withShouldEndSession(false)
          .getResponse();
      }
    
    };
    return applyAttributes(handlerInput, processFunc);

  }
};

  
  
//ReviewAll,
const ReviewAll = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'review_all_data');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
        .speak("Review all data isn't implemneted yet")
        .withSimpleCard('PENDING')
        .withShouldEndSession(false)
        .getResponse();
  }
};


/////////////////////////////
////// Built in intent handlers
/////////////////////////////
    
//RestartHandler,
const RestartHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    var processFunc = (attributes) =>{
      return handlerInput.responseBuilder
          .speak('The slate is cleared')
          .withSimpleCard('Restarting','data is cleared')
          .withShouldEndSession(false)
          .getResponse();
    };
    let forceReinitialization = true;
    return applyAttributes(handlerInput, processFunc, forceReinitialization);
  }
};

/// Cancelling current and last intents ///
//CancelHandler, //for stopping mid capture or redoing the last one
const CancelHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    console.log('handling cancel');
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes();
    if (attributes.state.cancelAction == 'abort'){
      attributes.state.cancelAction == 'none';
      attributesManager.setSessionAttributes(attributes);
        return handlerInput.responseBuilder
        .speak("okay, lets forget that. what else?")
        .withSimpleCard('PENDING')
        .withShouldEndSession(false)
        .getResponse();
    }
    else{
      attributes.state.confirmUndo = true;
      attributesManager.setSessionAttributes(attributes);
        return handlerInput.responseBuilder
        .speak("Would you like to undo that?")
        .withSimpleCard('PENDING')
        .withShouldEndSession(false)
        .getResponse();
    }
  }
};

const YesHandler = {
  canHandle(handlerInput){
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.YesIntent'
      && attributes.state.confirmUndo;
  },
  handle(handlerInput) {
    console.log("undoing last action");
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes();
    attributes.state.confirmUndo = false;
    
    // PEND perform the undo!!!!!
    switch(attributes.state.cancelAction){
    case 'allmeds':
      attributes.data.allmedstaken = false;
      break;
    case 'last meds':
      var filtered = attributes.data.medstaken.filter(function(value, index, arr){
        return attributes.state.lastMeds.includes(value);
      });
      attributes.data.medstaken = filtered.slice();
      break;
    case 'sleep':
      attributes.data.sleepduration = 0;
      break;
    }
    attributesManager.setSessionAttributes(attributes);
        
    
    return handlerInput.responseBuilder
        .speak("Undone")
        .withSimpleCard('Undone')
        .withShouldEndSession(false)
        .reprompt('Anything else?')
        .getResponse();
  }
};

const NoHandler = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.NoIntent'
      && attributes.state.confirmUndo === true;
  },
  handle(handlerInput) {
    console.log("NOT undoing last action");
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes();
    attributes.state.confirmUndo = false;
    attributesManager.setSessionAttributes(attributes);
        
    return handlerInput.responseBuilder
        .speak("Okay. Well keep it")
        .withShouldEndSession(false)
        .reprompt('Anything else?')
        .getResponse();
  }
};

const HelpIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechOutput = HELP_TEXT;
    const reprompt = 'Say help for me to repeat that.';

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .withShouldEndSession(false)
      .getResponse();
  }
};

const AboutHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && request.intent.name === 'about';
  },
  handle(handlerInput) {
    const speechOutput = ABOUT_TEXT;
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(REPROMPT_TO_CONTINUE )
      .withShouldEndSession(false)
      .getResponse();
  }
};

/////////////////////////////
///  Exiting and Saving Data ////    
/////////////////////////////

function newDataCheck(data){
  return (
    data.allmedstaken || data.sleepduration > 0 || data.medstaken.length>0
  );
}

function SendDataAndExit(handlerInput, status){
  console.log('sending data');
  
  const attributesManager = handlerInput.attributesManager;
  const attributes = attributesManager.getSessionAttributes();
  attributes.state.exitType = status;
  // only take unique drugs
  let uniqueDrugs = [...new Set(attributes.data.medstaken)]; 
  attributes.data.medstaken = uniqueDrugs.slice();
        
  const errorMessage = handlerInput.responseBuilder
      .speak('There was a problem delivering your data')
      .withSimpleCard('Uh oh!', 'There was a problem delivering your data')
      .withShouldEndSession(true)
      .getResponse();
  
  const successMessage = handlerInput.responseBuilder
      .speak('Data Delivered. Goodbye!')
      .withSimpleCard('Goodbye!', 'Your data was delivered successfully.')
      .withShouldEndSession(true)
      .getResponse();
  
  if (newDataCheck(attributes.data)){
    console.log('new data confirmed');
    // Generate a v1 (time-based) id
    //const recordid = uuid.v1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a'

    // for updating the user database
    const makeUpdatePromise = () =>{
      console.log('making user db update promise');
      const content = {
        'all medication taken': attributes.data.allmedstaken,
        'medications': attributes.data.medstaken,
        'sleep hours': attributes.data.sleepduration
      };
      var now = new Date();
      var timestamp = Date.now();
      var date = now.toString();
      const sessionData = {
        'exit type': attributes.state.exitType
      };
      const report = {
        'timestamp': timestamp,
        'date': date,
        'content': content,
        'session': sessionData
      };
      
    
      const updateTable = {
        TableName: USER_TABLE,
        Key:{
          'user_id': attributes.user.username
        },
        UpdateExpression: "SET questionnaires = :q, reports = list_append(reports, :r)",
        ExpressionAttributeValues:{
            ":q": attributes.data.questionnaires,
            ":r": [report]
        },
        ReturnValues:"NONE"
      };
      return docClient.update(updateTable).promise();
    };
    
    if (attributes.user.newToDB){
      console.log('adding entry to DB');
      // add new user entry to database, before doing the update
      const newUserTable = {
        TableName: USER_TABLE,
        Item:{
          'user_id': attributes.user.username,
          'email': attributes.user.email,
          'reports': [],
          'questionnaires': [],
          'alerts': []
        }
      };
      return docClient.put(newUserTable).promise()
      .then(makeUpdatePromise())
      .then( (resp)=> {
        console.log('add and update successful');
        attributes.state.saved = true;
        attributesManager.setSessionAttributes(attributes);
        return successMessage;} )
      .catch(
        error =>{console.log('add and update user entry catch error: ' + error);
        return errorMessage;
      });
    }
    else{
      return makeUpdatePromise()
      .then( (resp)=> {
        console.log('update successful');
        attributes.state.saved = true;
        attributesManager.setSessionAttributes(attributes);
        return successMessage;} )
      .catch(
        error =>{console.log('update user error: ' + error);
          return errorMessage;
        }
      );
    }
    
  }
  else{
    return handlerInput.responseBuilder
        .speak('Goodbye')
        .withSimpleCard('Bye Bye!', 'No new data to deliver')
        .getResponse();
  }
}

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    console.log('exit handler called');

    // Mail results here!!!
    return SendDataAndExit(handlerInput, 'graceful');
  },
};

// for abrupt exits, such as "close or quit" 
const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('session ended handler called');
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes();
    console.log(attributes);
    if (!attributes.state.saved){
      console.log('hard exit. saving in emergency!');
      return SendDataAndExit(handlerInput, 'hard');
    }
  },
};

// when nothing else works
const FallbackHandler = {
  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    // handle fallback intent, yes and no when playing a game
    // for yes and no, will only get here if and not caught by the normal intent handler
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.FallbackIntent' ||
       request.intent.name === 'AMAZON.YesIntent' ||
       request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_MESSAGE)
      .getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const outputSpeech = FALLBACK_MESSAGE;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};

// when it's not even clear it's an intent!
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

////////////////
////// Construct the Skill
//////////////////////
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    AllMedicationsTaken,
    SleepReport,
    SomeMedicationsTaken,
    ReviewAll,
    CancelHandler, //for stopping mid capture or redoing the last one
    YesHandler,
    NoHandler,
    RestartHandler,
    ExitHandler, // for graceful exit requests
    SessionEndedRequest, //for abrupt exits
    HelpIntent,
    AboutHandler,
    FallbackHandler,
    UnhandledIntent,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
