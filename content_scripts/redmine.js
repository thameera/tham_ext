$(function() {

  var getFormattedTitle = function() {
    var project = $('#project_quick_jump_box').find(":selected").text().substring(4);
    var title = project;

    var c = $('#content');
    var h2 = c.find('h2');
    if( !h2.length ) return '';

    title += ': ' + h2[0].innerText;

    var h3 = c.find('.subject h3');
    if( !h3.length ) return '';

    title += ': ' + h3[0].innerText;

    return title;
  };

  const getRevisions = () => {
     // [^\/] is used to drop false positives like http://svn/dav/test/r10223/testdata/
    const regex = /[^\/]r\d\d\d\d\d/gi;
    const commentText = $('.has-notes .wiki').text();
    const revisions = [];
    let result;

    while( result = regex.exec(commentText) ) {
      let revStr = '';
      let id = result.index + 2;

      while( commentText[id] >= '0' && commentText[id] <= '9' ) {
        revStr += commentText[id++];
      }
      revisions.push(revStr);
    }

    return revisions;
  }

  const extractRevsFromNote = ($note) => {
    const revisions = [];
    let result;

    $note.find('.changeset').each(function() {
      const reg = /\d+/;
      const text = $(this).text();
      const rev = reg.exec(text)[0];
      const link = $(this).attr('href');
      revisions.push({ rev, link });
    });

    return revisions;
  };

  const getRevs = () => {
    const revisions = [];
    const notes = $('.has-notes .wiki');

    notes.each(function() {
      const $this = $(this);
      const noteRevs = extractRevsFromNote($this);
      const $noteLink = $($this.parent().find('.journal-link')[0]);
      const noteId = $noteLink.text();
      const noteLink = $noteLink.attr('href');

      noteRevs.forEach(nr => {
        const previouslyFound = revisions.find(r => r.rev === nr.rev);
        if( previouslyFound ) return;
        revisions.push({
          rev: nr.rev,
          link: nr.link,
          noteId,
          noteLink
        });
      });
    });

    console.log(revisions);
    return revisions;
  };

  const showRevsInSidebar = () => {
    const revs = getRevs();
    const $ul = $('<ul>');
    revs.forEach(r => {
      const $li = $(`<li><a href="${r.link}">${r.rev}</a> (<a href="${r.noteLink}">${r.noteId}</a>)</li>`);
      $ul.append($li);
    });

    const $title = $('<h3>Revisions</h3>');
    const $div = $('<div id="revisions">');
    $div.append($title);
    $div.append($ul);
    $('#sidebar').append($div);
  };

  // Left-pad two digits
  const pad = (n) => ('0' + n).substr(-2);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const date = `${d.getYear()+1900}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${date} ${time}`;
  };

  const showAbsoluteDates = () => {
    const relativeDates = $('h4 a:nth-child(3)');
    relativeDates.each(function() {
      const absDate = $(this).attr('title');
      $(this).parent().append($(`<span style="font-weight: normal">(${formatDate(absDate)})</span>`));
    });
  };

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if( request.method === 'getFormattedRedmineTitle' ) {
      sendResponse( getFormattedTitle() );
    } else if( request.method === 'getRedmineRevisions' ) {
      sendResponse( getRevisions() );
    }
  });

  // Remove Feature/Defect/Support prefixes from title
  var title = $('title').text();
  $('title').text( title.replace( /^Feature |Defect |Support |Question /, '' ) );

  showAbsoluteDates();
  showRevsInSidebar();

});

