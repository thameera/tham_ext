$(function() {

  var getFormattedTitle = function() {
    var c = $('#content');

    // Ticket number
    var h2 = c.find('h2');
    if( !h2.length ) return '';

    var headerText = h2[0].innerText; // eg: "Defect #9917"
    var title = headerText.split(' ')[1]; // eg: #9917

    // Title
    var h3 = c.find('.subject h3');
    if( !h3.length ) return '';

    title += ': ' + h3[0].innerText;

    // Project
    var project = $('#project_quick_jump_box').find(":selected").text().substring(4);
    title += ' [H: ' + project + ']';

    return title;
  };

  /*
   * Extracts revisions from comment text using a regex
   */
  const getRevsFromRegex = (commentText) => {
     // [^\/] is used to drop false positives like http://svn/dav/test/r10223/testdata/
    const regex = /[^\/]r\d\d\d\d\d/gi;
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
  };

  /*
   * Given a redmine note, extracts all revisions from it
   */
  const extractRevsFromNote = ($note) => {
    const revisions = [];
    let result;

    // Get revisions using changeset URLs
    $note.find('.changeset').each(function() {
      const reg = /\d+/;
      const text = $(this).text();
      const rev = reg.exec(text)[0];
      const link = $(this).attr('href');
      revisions.push({ rev, link });
    });

    // Get revisions using regex
    const regexRevs = getRevsFromRegex($note.text());
    regexRevs.forEach(regRev => {
      // If there are any revisions that were not linked, add them to array
      if( ! revisions.find( r => r.rev === regRev )) {
        revisions.push({ rev: regRev, link: '' });
      }
    });

    return revisions;
  };

  /*
   * Get all revisions mentioned in ticket
   */
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


  const showDiff = ()=> {
    $( '#view-diff' ).remove();

    const $fieldset = $( `<fieldset class='tabular'><legend>Diff</legend>` );
    const $div = $( `<div>` );

    const compare = ( label, orig, latest, compFn ) => {
      orig = orig.trim();
      latest = latest.trim();
      if( !compFn ) {
        if( orig !== latest ) {
          $div.append( $( `<p><label>${ label }</label> : ${ latest } ( ${ orig })</p>` ) );
        }
      } else {
        if ( !compFn( orig, latest ) ) {
          $div.append( $( `<p><label>${ label }</label> : ${ latest } ( ${ orig } )</p>` ) );
        }
      }
    };

    const getText = q => $(q).text();
    const getVal = q => $(q).val();
    const getSelect = q => $(q).find( ':selected' ).text();
    const fmtDate = date => {
      if (!date) return '';

      const dateSplit = date.split( '/' );
      return `${dateSplit[2]}-${dateSplit[0]}-${dateSplit[1]}`;
    };
    
    compare( 'Project', getText( 'h1' ), getSelect( '#issue_project_id' ), ( o, l ) => o.endsWith( l ) );
    compare( 'Tracker', getText( 'h2' ), getSelect( '#issue_tracker_id' ), ( o, l ) => o.startsWith( l ) );
    compare( 'Subject', getText( '.subject h3' ), getVal( 'input#issue_subject' ) );
    compare( 'Priority', getText( 'td.priority' ), getSelect( 'select#issue_priority_id' ) );
    compare( 'Assignee', getText( 'td.assigned-to a' ), getSelect( 'select#issue_assigned_to_id' ) );
    compare( 'Category', getText( 'td.category' ).replace( '-', '' ),getSelect( 'select#issue_category_id' ) );
    compare( 'Target version', getText( 'td.fixed-version' ), getSelect( 'select#issue_fixed_version_id' ), ( o, l ) => o.endsWith( l ));
    compare( 'Reviewer', getText( 'td.cf_11 a.user.active' ), getSelect( 'select#issue_custom_field_values_11.user_cf' ) );
    compare( 'Start date', fmtDate( getText( 'td.start-date' ) ), getVal( 'input#issue_start_date' ) );
    compare( 'Due date', fmtDate( getText( 'td.due-date' ) ), getVal( 'input#issue_due_date' ) );
    compare( 'Estimated time', getText( 'td.estimated-hours' ).split(' ')[0], getVal( 'input#issue_estimated_hours' ), ( o, l ) => Number( o ) === Number( l ) );
    compare( '% Done', getText( 'p.percent' ), getSelect( 'select#issue_done_ratio' ).replace( ' ', '' ) );
    
    if ( $( 'select#issue_status_id' ).is( ":visible" ) ) {
      compare( 'Status', getText( 'table.attributes td.status' ), getSelect( 'select#issue_status_id' ) );
    };

    if( $div.children().length === 0 ){
      $div.append( `<p><em>No diff</em></p>` );
    }

    $fieldset.append( $div );
    $( '#issue-form' ).append( $fieldset );
  };


  const addDiffBtn = () => {
    const $btnDiff = $( `<input id="btn-diff" type = "button" value="Diff">` );
    $('#issue-form').append( $btnDiff );
    $btnDiff.click( showDiff );
  };

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if( request.method === 'getFormattedRedmineTitle' ) {
      sendResponse( getFormattedTitle() );
    }
  });

  // Remove Feature/Defect/Support prefixes from title
  var title = $('title').text();
  $('title').text( title.replace( /^Feature |Defect |Support |Question /, '' ) );

  showAbsoluteDates();
  showRevsInSidebar();
  addDiffBtn(); 

});

