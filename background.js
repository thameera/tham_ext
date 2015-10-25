// UTM token stripper
// Source: https://github.com/jparise/chrome-utm-stripper
chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab ) {
  var queryStringIndex = tab.url.indexOf( '?' );
  if( tab.url.indexOf('utm_') > queryStringIndex ) {
    var stripped = tab.url.replace(
      /([\?\&]utm_(source|medium|term|campaign|content|cid|reader)=[^&#]+)/ig,
      '');
    if( stripped.charAt( queryStringIndex ) === '&' ) {
      stripped = stripped.substr( 0, queryStringIndex ) + '?' +
        stripped.substr( queryStringIndex + 1 )
    }
    if( stripped != tab.url ) {
      chrome.tabs.update( tab.id, {url: stripped} );
    }
  }
});


var timer = (function() {

  var alarmTime = 0;
  var timeAfterResume = 0;
  var state = 'INIT';
  var message = '';
  var intervalID = null;

  var showNotif = function() {
    message = message || 'Times up!';
    new Notification( message );
  };

  var checkTime = function() {
    if( alarmTime > 0 && Date.now() > alarmTime ) {
      stopAlarm();
      showNotif();
    }
  };

  var startAlarm = function( time ) {
    alarmTime = Date.now() + time;
    intervalID = setInterval( checkTime, 100 );
    state = 'RUNNING';
  };

  var stopAlarm = function() {
    clearInterval( intervalID );
    alarmTime = 0;
    state = 'INIT';
  };

  var doStartOrPause = function( mins, msg ) {

    if( state === 'INIT' ) {
      startAlarm( mins * 60 * 1000, msg );
    }
    else if( state === 'RUNNING' ) {
      clearInterval( intervalID );
      timeAfterResume = alarmTime - Date.now();
      state = 'PAUSED';
    }
    else if( state === 'PAUSED' ) {
      startAlarm( timeAfterResume );
    }

    if( msg ) message = msg;

  };

  return {
    startOrPause: function( mins, msg ) {
      doStartOrPause( mins, msg );
    },

    stop: function() {
      stopAlarm();
    },

    getRemainingTimeStr: function() {
      var time;
      if( state === 'INIT' ) return '';

      if( state === 'RUNNING' ) time = alarmTime - Date.now();
      else if( state === 'PAUSED' ) time = timeAfterResume;

      if( time < 0 ) time = 0;

      time /= 1000;
      var mins = Math.floor( time / 60 );
      var secs = Math.floor( time - mins * 60 );

      return '' + mins + ':' + secs;
    },

    getNextActionStr: function() {
      if( state === 'INIT' ) return 'Start';
      else if( state === 'RUNNING' ) return 'Pause';
      else if( state === 'PAUSED' ) return 'Resume';
    }

  };

})();

