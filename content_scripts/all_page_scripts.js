window.onload = function() {

  /* Link hover copy */
  const attachLinkHoverEvent = el => {
    el.addEventListener('mouseenter', ev => {
      chrome.runtime.sendMessage({ type: 'link-hover', url: ev.target.href })
    })
    el.addEventListener('mouseleave', ev => {
      chrome.runtime.sendMessage({ type: 'link-unhover' })
    })
  }
  document.querySelectorAll('a').forEach(attachLinkHoverEvent)

  /* Allow paste */
  const allowPaste = e => {
    e.stopImmediatePropagation();
    return true;
  };
  document.addEventListener('paste', allowPaste, true);

}
