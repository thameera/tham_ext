$(function() {

  var getFormattedTitle = function() {
    var c = $('#content');
    var h2 = c.find('h2');
    if( !h2.length ) return '';

    var title = h2[0].innerText;

    var h3 = c.find('.subject h3');
    if( !h3.length ) return '';

    title += ': ' + h3[0].innerText;

    return title;
  };

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if( request.method === 'getFormattedRedmineTitle' ) {
      sendResponse( getFormattedTitle() );
    }
  });

  // Remove Feature/Defect/Support prefixes from title
  var title = $('title').text();
  $('title').text( title.replace( /^Feature |Defect |Support /, '' ) );

});

