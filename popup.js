$(function() {

  /*
   * Twitter-related functions
   */
  var twitter = {

    onTab: function( tab ) {

      // Prepare tweet-able text
      var text = tab.title + ' ' + tab.url;
      $('#tweet').val( text );

      // Copy button
      $('#twitter #copy-btn').click(function() {
        $('#tweet').select();
        document.execCommand('copy');
      });

      // Tweet button
      $('#twitter #tweet-btn').click(function() {
        text = $('#tweet').val();
        var url = 'https://twitter.com/intent/tweet?text='
          + encodeURIComponent( text );
        chrome.tabs.create({ url: url });
      });

    }

  };


  /*
   * Timer-related functions
   */
  var timer = {

    init: function() {

      var $elem = $('#timer');
      var $msg = $elem.find('#timer-msg');
      var $minutes = $elem.find('#timer-minutes');

      var timer = chrome.extension.getBackgroundPage().timer;

      var updateLabels = function() {
        $elem.find('#start-button').text( timer.getNextActionStr() );
        $elem.find('#timer-remaining').text( timer.getRemainingTimeStr() );
      };

      $msg.val( localStorage.getItem( 'timer-msg' ) || '' );
      $minutes.val( localStorage.getItem( 'timer-minutes' ) || 5 );

      $msg.change(function() {
        localStorage.setItem( 'timer-msg', $msg.val() );
      });

      $minutes.change(function() {
        localStorage.setItem( 'timer-minutes', $minutes.val() );
      });

      $elem.find('#start-button').click(function() {
        var time = Number( $minutes.val() );
        var msg = $msg.val();
        timer.startOrPause( time, msg );
      });

      $elem.find('#stop-button').click(function() {
        timer.stop();
      });

      setInterval( updateLabels, 50 );

    }

  };

  /*
   * goo.gl shortener related functions
   */
  var shortener = {

    showError: function( msg ) {
      var $error = $('#shortener #error-text');
      $error.css('display', 'block');
      $error.find('.error-label:first').html( msg );
    },

    hideError: function() {
      var $error = $('#shortener #error-text');
      $error.css('display', 'none');
    },

    onTab: function( tab ) {
      var $input = $('#shortener-text');
      var $btn = $('#shorten-btn');
      $input.val( tab.url );

      chrome.storage.sync.get({
        shortenerKey: ''
      }, (items) => {
        if( items.shortenerKey === '' ) {
          $input.prop('disabled', true);
          $btn.prop('disabled', true);
          this.showError('Please provide goo.gl API key in options');
          return;
        }

        $input.prop('disabled', false);
        $btn.prop('disabled', false);
        this.hideError();

        $btn.click(function() {
          $.ajax({
            url: 'https://www.googleapis.com/urlshortener/v1/url?key=' + items.shortenerKey,
            method: 'POST',
            data: JSON.stringify({'longUrl': $input.val()}),
            contentType: 'application/json',
            success: function(obj) {
              $input.val( obj.id );
              $input.select();
              document.execCommand('copy');
            }
          });
        });
      });

    }

  };


  /*
   * Get the current tab and trigger relevant methods
   */
  chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    if( !tabs || !tabs.length )
      return;

    var tab = tabs[0];

    twitter.onTab( tab );
    shortener.onTab( tab );
  });


  timer.init();

});

