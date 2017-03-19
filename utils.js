;(function() {
  const uniq = ( arr ) => {
    return arr.filter(( val, id) => arr.indexOf(val) === id );
  };

  window.uniq = uniq;
})();