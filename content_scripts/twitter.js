$(function() {
  var addLink = function($ol, text, url) {
    var $li, $a, $span;

    $li = $('<li>');
    $a = $('<a>', {
      href: url
    });
    $span = $('<span>', {
      class: 'text',
      text: text
    });
    $a.append($span);
    $li.append($a);
    $ol.append($li);
  };

  var $ol = $('#global-actions');

  // s/Notifications/Notif/
  $ol.find('li.notifications .text').text('Notif');

  // s/Messages/DM/
  $ol.find('li.dm-nav .text').text('DM');

  // Remove 'Discover' text
  $ol.find('li.topics .text').text('');

  // Add new links
  addLink($ol, 'close', '/thameera/lists/close-ones');
  addLink($ol, 'chomp', '/thameera/lists/chomp');
  addLink($ol, 'tech-sl', '/thameera/lists/tech-sl');
  addLink($ol, 'me', '/thameera');

  // Make the links a bit closer (original padding: 0 14px 0 4px)
  $('.nav>li>a').css('padding', '0 8px 0 4px');
});

