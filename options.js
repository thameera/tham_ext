$(function() {

  const shortenerInput = $('#shortener-key');
  const savedText = $('#options-saved');

  $('#save-btn').click(function() {
    chrome.storage.sync.set({
      shortenerKey: shortenerInput.val()
    }, () => {
      savedText.show();
      setTimeout(() => {
        savedText.hide();
      }, 1500);
    })
  });

  chrome.storage.sync.get({
    shortenerKey: ''
  }, opts => {
    shortenerInput.val( opts['shortenerKey'] );
  });

});
