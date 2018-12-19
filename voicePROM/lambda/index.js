/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */


const Alexa = require('ask-sdk');
var https = require('https');


const SKILL_NAME = 'voice-PRO';
const FALLBACK_MESSAGE = `The ${SKILL_NAME} skill can't help you with that. Ask for help if you need it`;
const WELCOME_MESSAGE = `Welcome to ${SKILL_NAME}.`;
const WRONG_TIME_MESSAGE = 'Im confused. Try again.';
const HELP_TEXT = 'Help text';
const REPROMPT_TO_CONTINUE = 'anything else?';


/////////////////////////////
////  Initialization: checking authentication, grabbing email id from authentication server, and attribute management.
/////////////////////////////

// pass in a function that takes the userinfo object as argument
function getUserInfoFromToken(token, callback){
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

function initializeSession(handlerInput){
  const attributesManager = handlerInput.attributesManager;
  const attributes = attributesManager.getSessionAttributes();
  
  /// first make an empty set of attributes
  attributes.state = {};
  attributes.data = {};
  attributes.user = {};
  
  attributes.user.name = '';
  attributes.user.linked = false;
  attributes.user.token = '';
  attributes.user.email = '';
  
  attributes.state.newsession = true;
  attributes.state.exitType = 'hard';
  attributes.state.cancelAction = 'exit';
  attributes.state.lastMeds = [];
  attributes.state.confirmUndo = 'false';

  attributes.data.allmedstaken = false;
  attributes.data.medstaken = [];
  attributes.data.sleepduration = 0;
  
  /// now populate attributes from server if available
  var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
  if (accessToken === undefined){
    console.log('no token');
    attributes.user.linked = false;
    
    attributesManager.setSessionAttributes(attributes);
    return attributes;
  }
  else{
    attributes.user.token = accessToken;
    attributes.user.name = handlerInput.requestEnvelope.context.System.user.userId;
    console.log('token: ' + accessToken);
    console.log('user: ' + attributes.user.name);
    
    //getUserInfoFromToken(accessToken);
    
    return new Promise((resolve) => {
      getUserInfoFromToken(accessToken, (userinfo) =>{
        var email = userinfo.email;
        console.log(email);
        if (!email || email.length==0){
          attributes.user.linked = false;
          console.log('no email found, unlinked');
        }
        else {
          attributes.user.linked = true;
          attributes.user.email = email; 
          console.log('email found, linked');
        }
        attributesManager.setSessionAttributes(attributes);
        console.log('resolving');
        resolve(attributes);
      });
    });
    
  }
}

function getAttributes(handlerInput){
  const attributesManager = handlerInput.attributesManager;
  var attributes = attributesManager.getSessionAttributes();
  if (Object.keys(attributes).length === 0) {
    attributes = initializeSession(handlerInput);
  }
  else{
    attributes.state.newsession = false;
  } 
  console.log('returning from get attributes');
  return attributes;
}

const LaunchRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    const attributes = getAttributes(handlerInput);
    
    const speechOutput = WELCOME_MESSAGE;
    const reprompt = 'Say help if you would like assistance';
    return responseBuilder
      .speak(speechOutput)
      .withSimpleCard('Welcome!', 'To send your data, just say thank you or all done')
      .reprompt(reprompt)
      .reprompt(REPROMPT_TO_CONTINUE)
      .withShouldEndSession(false)
      .getResponse();
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
    const attributes = getAttributes(handlerInput);
    
    attributes.data.allmedstaken = true;
    attributes.state.cancelAction = 'allmeds';
    attributes.state.confirmUndo = 'false';

    const attributesManager = handlerInput.attributesManager;
    attributesManager.setSessionAttributes(attributes);
    const speechText = 'Okay!';
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(REPROMPT_TO_CONTINUE)
      .withSimpleCard('Medication taken', 'Ive recorded that you took all your medication. Good work!')
      .withShouldEndSession(false)
      .getResponse();
  }
};

const SleepReport = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'sleep_report';
  },
  handle(handlerInput){
    const attributes = getAttributes(handlerInput);
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
      attributes.state.confirmUndo = 'false';

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
  }
};

const SomeMedicationsTaken = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'some_medications_taken';
  },
  handle(handlerInput){
    console.log('handling some meds');
    const attributes = getAttributes(handlerInput);
    const request = handlerInput.requestEnvelope.request;
    
    if (request.dialogState === 'STARTED' || request.dialogState === 'IN_PROGRESS'){
      attributes.state.cancelAction = 'abort';
      attributes.state.confirmUndo = 'false';
      
      const attributesManager = handlerInput.attributesManager;
      attributesManager.setSessionAttributes(attributes);
      
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
      attributes.state.confirmUndo = 'false';
      const attributesManager = handlerInput.attributesManager;
      attributesManager.setSessionAttributes(attributes);
      cardtext = cardtext + '.';
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Medications', cardtext)
        .reprompt(REPROMPT_TO_CONTINUE)
        .withShouldEndSession(false)
        .getResponse();
    }

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
    initializeSession(handlerInput);
    return handlerInput.responseBuilder
        .speak('The slate is cleared')
        .withSimpleCard('Restarting','data is cleared')
        .withShouldEndSession(false)
        .getResponse();
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
    const request = handlerInput.requestEnvelope.request;
    const attributes = getAttributes(handlerInput);
    if (attributes.state.cancelAction == 'abort'){
      attributes.state.cancelAction == 'none';
      return handlerInput.responseBuilder
        .speak("okay, lets forget that. what else?")
        .withSimpleCard('PENDING')
        .withShouldEndSession(false)
        .getResponse();
    }
    else{
      attributes.state.confirmUndo = 'true';
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
    const request = handlerInput.requestEnvelope.request;
    const attributes = getAttributes(handlerInput);
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.YesIntent'
      && attributes.state.confirmUndo;
  },
  handle(handlerInput) {
    console.log("undoing last action");
    const attributes = getAttributes(handlerInput);
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
      attributes.data.allmedstaken = filtered.slice();
      break;
    case 'sleep':
      attributes.data.sleepduration = 0;
      break;
    }
    
    
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
    const attributes = getAttributes(handlerInput);
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.NoIntent'
      && attributes.state.confirmUndo === true;
  },
  handle(handlerInput) {
    console.log("NOT undoing last action");
    const attributes = getAttributes(handlerInput);
    attributes.state.confirmUndo = false;
    
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
  },
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
  const attributes = getAttributes(handlerInput);
  attributes.state.exitType = status;
  // only take unique drugs
  let uniqueDrugs = [...new Set(attributes.data.medstaken)]; 
  attributes.data.medstaken = uniqueDrugs.slice();
  
  if (newDataCheck(attributes.data)){
    /////////////
    // SEND data here
    //////////
    
    return handlerInput.responseBuilder
        .speak('Your new data has been delivered')
        .withSimpleCard('Bye Bye!', 'Your new data has been delivered')
        .getResponse();
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
    SendDataAndExit(handlerInput, 'hard');
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder
      .getResponse();
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
    FallbackHandler,
    UnhandledIntent,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
