$(function() {

  var shortenerInput = $('#shortener-key');

  $('#save-btn').click(function() {
    localStorage.setItem( 'shortener-key', shortenerInput.val() );
  });

  var currentKey = localStorage.getItem( 'shortener-key' ) || '';
  shortenerInput.val( currentKey );

});
