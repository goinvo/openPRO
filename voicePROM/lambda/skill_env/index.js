/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */


const Alexa = require('ask-sdk');

const SKILL_NAME = 'voice-PRO';
const FALLBACK_MESSAGE = `The ${SKILL_NAME} skill can't help you with that. Ask for help if you need it`;
const WELCOME_MESSAGE = 'Welcome to ${SKILL_NAME}. Please say help if you need assistance';
const WRONG_TIME_MESSAGE = 'Im confused. Try again.'
const HELP_TEXT = 'Help text'


function initializeSession(attributes){
  const attributesManager = handlerInput.attributesManager;
  const attributes = attributesManager.getSessionAttributes();
  
  attributes.newsession = true;
  attributes.allmedstaken = false;
  attributes.medstaken = new Set();
  attributes.sleepduration = '0';
  
  attributesManager.setSessionAttributes(attributes);
  return attributes;
};


function getAttributes(handlerInput){
  const attributesManager = handlerInput.attributesManager;
  const attributes = attributesManager.getSessionAttributes();
  if (Object.keys(attributes).length === 0) {
    initializeSession(attributes);
  }
  else{
    attributes.newsession = false;
  } 
  return attributes;
}

const LaunchRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    attributes = initializeSession();
    
    const speechOutput = WELCOME_MESSAGE;
    const reprompt = 'Say help if you would like assistance';
    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};



const AllMedicationsTaken = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'all_medications_taken';
  },
  handle(handlerInput){
    attributes = getAttributes(handlerInput);
    const responseBuilder = handlerInput.responseBuilder;
    
    attributes.allmedstaken = true;
    const attributesManager = handlerInput.attributesManager;
    attributesManager.setSessionAttributes(attributes);
    const speechText = 'Okay!';
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Medication taken', 'Ive recorded that you took all your medication. Good work!')
      .getResponse();
  }
}

const SleepReport = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'sleep_report';
  },
  handle(handlerInput){
    attributes = getAttributes(handlerInput);
    const request = handlerInput.requestEnvelope.request;
    
    duration = request.intent.slots.sleep_duration.value;
    if (!duration){
      return handlerInmput.responseBuilder.addDelegateDirective().getResponse();
    }
    else{
      attributes.sleep_duration = duration;
      const attributesManager = handlerInput.attributesManager;
      attributesManager.setSessionAttributes(attributes);
      const responseBuilder = handlerInput.responseBuilder;
      const speechText = 'Got your sleep';
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Sleep Report', 'You slept'+duration)
        .getResponse();
    }
  }
}

const SomeMedicationsTaken = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'some_medications_taken';
  },
  handle(handlerInput){
    attributes = getAttributes(handlerInput);
    const request = handlerInput.requestEnvelope.request;
    const medA = request.slots.medication.value;
    const medB = request.slots.medicationB.value;
    const medC = request.slots.medicationC.value;
    if (!medA){
      return handlerInmput.responseBuilder.addDelegateDirective().getResponse();
    }
    else{
      medstaken = [];
      medstaken.add(medA);
      if (medB) medstaken.add(medB);
      if (medC) medstaken.add(medC);

      attributes.medstaken = medstaken;
      const attributesManager = handlerInput.attributesManager;
      attributesManager.setSessionAttributes(attributes);
      const responseBuilder = handlerInput.responseBuilder;
      const speechText = 'Got your meds';
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Medications', 'you took some')
        .getResponse();
    }

  }
}

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    
    // Mail results here!!!

    return handlerInput.responseBuilder
      .speak('Your new data has been delivered')
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
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
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    return false;
  },
  handle(handlerInput) {
    
    return responseBuilder
      .speak(WRONG_TIME_MESSAGE)
      .reprompt(WRONG_TIME_MESSAGE)
      .getResponse();
  },
};

const NoIntent = {
   canHandle(handlerInput) {
    return false;
  },
  handle(handlerInput) {
    
    return responseBuilder
      .speak(WRONG_TIME_MESSAGE)
      .reprompt(WRONG_TIME_MESSAGE)
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

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    AllMedicationsTaken,
    SleepReport,
    SomeMedicationsTaken,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
    FallbackHandler,
    UnhandledIntent,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
