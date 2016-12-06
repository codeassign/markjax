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
    breaks: true,
    sanitize: true
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
  }

  function ReEscapeTex(text) {
    var re = /([^\\\$]|^)(\${1,2})(?!\$)(\s*)([\s\S]*?[^$])(\s*)(\2)(?!\2)/g;
    var out = text.replace(re, function(m, p1, p2, p3, p4, p5, p6, offset, string) {
      return p1 + p2 + p3 + p4.replace(/\\(.)/g, '$1') + p5 + p6;
    });
  
    return out;
  }

  function markjax(text){
    var node = document.createElement('div');
    var src = text.replace(/&lt;/mg, '<').replace(/&gt;/mg, '>');

    var html = ReEscapeTex(marked(EscapeTex(src)));
    node.innerHTML = html;
    var code = node.getElementsByTagName("code");

    for (var i = 0; i < code.length; i++) {
      code[i].innerHTML = code[i].innerHTML.replace(/\\\$/g, '$');
    }

    var elements = node.getElementsByTagName("*");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].tagName !== "CODE") {
        elements[i].classList.add("mathjax");
      }
    }
    
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    return node.innerHTML;    
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
