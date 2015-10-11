(function() {

  var hideNag = function() {
    var el = document.querySelector( '.subscribe-nag' );
    el.parentNode.removeChild( el );
  };

  if( document.readyState !== 'loading' ) {
    hideNag();
  } else {
    document.addEventListener( 'DOMContentLoaded', hideNag );
  }

})();

