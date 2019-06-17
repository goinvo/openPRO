// Alert module
// Alert module

const AlertActionType = {
    ALLMEDS: 'allMeds',
    MED: 'med',
    SLEEP: 'sleep',
    QUESTION: 'question'
};

const AlertState = {
    RESET: 'reset',
    PENDING: 'pending',
    ALERT: 'alert',
    COMPLETE: 'complete',
    INACTIVE: 'inactive'
};

function makeAlert(actiontype, notificationTime, text, title='', argument = '', leadTime = 120, resetTime = 120 ){
  if (!AlertActionType.actiontype){
      throw new Error("Action type not defined");
  }
  var alertObj = {
      action: actiontype,
      argument: argument,
      text: text,
      title: title,
      timing:{
          notificationTime: notificationTime, //time in minutes since midnight
          leadTime: leadTime, // minutes before notificaiton time that the user can satisfy the alert
          resetTime: resetTime // minutes after notificaiton time that the alert automatically resets (gives us)
      },
      state: AlertState.RESET
  };
  
  return alertObj;  
}

function validateAlert(alertObj){
    /// FILL THIS OUT
    if (!alertObj.state){
        throw new Error("This doesn't appear to be a valid alert object");
    }
    if (!AlertState[alertObj.state]){
        throw new Error("invalid state");
    }

    return true;
}

function getState(alertObj){
    var valid = validateAlert(alertObj);
    if (valid) return alertObj.state;
    return 0;
}


function updateState(alertObj, time){
    var valid = validateAlert(alertObj);
    if (!valid) return 0;
    let timing = alertObj.timing;
    let state = alertObj.state;
    // case 1: too early, don't do anything
    if (time < timing.notificationTime + timing.leadTime) return alertObj;
    // case 2: 
    
}


module.exports = {
    AlertActionType: AlertActionType,
    AlertState: AlertState,
    makeAlert: makeAlert,
    getState: getState
};
