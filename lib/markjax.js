;(function() {
  MathJax.Hub.Config({
    showProcessingMessages: false,
    tex2jax: {
      inlineMath: [['$','$']],
      displayMath: [['$$', '$$']],
      ignoreClass: ".*",
      processClass: "mathjax"
    },
    TeX: {
      equationNumbers: {
        autoNumber: "AMS"
      }
    }
  });

  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    }
  });

  function EscapeTex(text) {
    var re = /(`+)(\s*)([\s\S]*?[^`])(\s*)(\1)(?!`)/g;
    var out = text.replace(re, function(m, p1, p2, p3, p4, p5, offset, string) {
      return p1 + p2 + p3.replace(/\$/g, '\\$') + p4 + p5;
    });
  
    re = /^( {4}[^\n]+\n*)+/g;
    out = out.replace(re, function(m, p1, offset, string) {
      return p1.replace(/\$/g, '\\$');
    });
  
    re = /([^\\\$]|^)(\${1,2})(?!\$)(\s*)([\s\S]*?[^$])(\s*)(\2)(?!\2)/g;
    out = out.replace(re, function(m, p1, p2, p3, p4, p5, p6, offset, string) {
      return p1 + p2 + p3 + p4.replace(/(.)/g, '\\$1') + p5 + p6;
    });

    return out;
  },

  function ReEscapeTex(text) {
    var re = /([^\\\$]|^)(\${1,2})(?!\$)(\s*)([\s\S]*?[^$])(\s*)(\2)(?!\2)/g;
    var out = text.replace(re, function(m, p1, p2, p3, p4, p5, p6, offset, string) {
      return p1 + p2 + p3 + p4.replace(/\\(.)/g, '$1') + p5 + p6;
    });
  
    return out;
  }

  function PreviewDone() {
    this.isRunning[index] = false;
    Preview.forceUpdate = false;
    this.preview[index].innerHTML = this.buffer[index].innerHTML;
  }

  function markjax(text, callback){
      var src = text.replace(/&lt;/mg, '<').replace(/&gt;/mg, '>');

      var html = this.ReEscapeTex(marked(this.EscapeTex(src)));
      var code = $(html).find("code");
      for (var i = 0; i < code.length; i++) {
        code[i].innerHTML = code[i].innerHTML.replace(/\\\$/g, '$');
      }
      $(html).find("*").not("code").addClass("mathjax");

      MathJax.Hub.Queue(
        ["Typeset", MathJax.Hub, html],
        [callback, html],
        ["resetEquationNumbers", MathJax.InputJax.TeX]
      );
  }  

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = markjax;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return markjax; });
  } else {
    this.markjax = markjax;
  }
}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
