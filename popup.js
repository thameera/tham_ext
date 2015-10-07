$(function() {

  /*
   * Redmine-related functions
   */
  var redmine = {

    convertUrl: function( url ) {

      var lk_url = 'https://222.229.226.165';
      var jp_url =  'http://svn';

      if ( url.startsWith( lk_url ) ) {

        return url.replace( lk_url, jp_url );

      } else if ( url.startsWith( jp_url ) ) {

        return url.replace( jp_url, lk_url );

      } else {

        return url;

      }

    },

    onTab: function( tab ) {

      if( ! tab.url.startsWith( 'https://222.229.226.165/redmine' ) )
        return;

      chrome.tabs.sendMessage( tab.id, {method: 'getFormattedRedmineTitle'}, function( response ) {
        $('#redmine-bottom').val( response );
      });

      $('#redmine-top').val( tab.url );
      $('#redmine-middle').val( redmine.convertUrl( tab.url ) );

    },

    registerButtonActions: function() {

      // Copy buttons
      $('#redmine .copy-btn').click(function(e) {
        $(e.target).parent().parent().find('input').select();
        document.execCommand('copy');
      });

      // Clipboard button
      $('#redmine #clipboard-btn').click(function() {
        $('#redmine-top').select();
        document.execCommand('paste');
        $('#redmine-middle').val( redmine.convertUrl( $('#redmine-top').val() ) );
        $('#redmine-bottom').val('');
        $('#redmine-middle').select();
        document.execCommand('copy');
      });

    }

  }; // redmine


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
        var url = 'https://twitter.com/intent/tweet?text='
          + encodeURIComponent( text );
        chrome.tabs.create({ url: url });
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

    redmine.onTab( tab );
    twitter.onTab( tab );
  });


  redmine.registerButtonActions();

});

