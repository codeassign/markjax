(function () {
  var head = document.getElementsByTagName("head")[0];

  var mathjaxConfig = document.createElement("script");
  mathjaxConfig.type = "text/x-mathjax-config";
  mathjaxConfig[(window.opera ? "innerHTML" : "text")] =
    "MathJax.Hub.Config({" +
    "  showProcessingMessages: false," +
    "  messageStyle: \"none\"," +
    "  skipStartupTypeset: false," +
    "  tex2jax: {" +
    "    inlineMath: [['$','$']]," +
    "    displayMath: [['$$', '$$']]," +
    "    ignoreClass: \".*\"," +
    "    processClass: \"mathjax\"" +
    "  }," +
    "  TeX: {" +
    "    equationNumbers: {" +
    "      autoNumber: \"AMS\"" +
    "    }" +
    "  }" +
    "});";
  head.appendChild(mathjaxConfig);
  
  var mathjax = document.createElement("script");
  mathjax.type = "text/javascript";
  mathjax.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
  head.appendChild(mathjax);

  var katex = document.createElement("link");
  katex.rel = "stylesheet";
  katex.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.6.0/katex.min.css";
  head.appendChild(katex);

  var highlight = document.createElement("link");
  highlight.rel = "stylesheet";
  highlight.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.8.0/styles/default.min.css";
  head.appendChild(highlight);
})();

var marked = require("marked");
var katex = require("katex");
var highlight = require("highlight.js");
var memoMath = {};

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

function findEndOfMath(delimiter, text, startIndex) {
  var index = startIndex;
  var braceLevel = 0;

  var delimLength = delimiter.length;

  while (index < text.length) {
    var character = text[index];
    if (braceLevel <= 0 &&
      text.slice(index, index + delimLength) === delimiter) {
        return index;
      } else if (character === "\\") {
        index++;
      } else if (character === "{") {
        braceLevel++;
      } else if (character === "}") {
        braceLevel--;
      }

    index++;
  }

  return -1;
}

function splitAtDelimiters(startData, leftDelim, rightDelim, display) {
  var finalData = [];

  for (var i = 0; i < startData.length; i++) {
    if (startData[i].type === "text") {
      var text = startData[i].data;

      var lookingForLeft = true;
      var currIndex = 0;
      var nextIndex;

      nextIndex = text.indexOf(leftDelim);
      if (nextIndex !== -1) {
        currIndex = nextIndex;
        finalData.push({
          type: "text",
          data: text.slice(0, currIndex),
        });
        lookingForLeft = false;
      }

      while (true) {
        if (lookingForLeft) {
          nextIndex = text.indexOf(leftDelim, currIndex);
          if (nextIndex === -1) {
            break;
          }

          finalData.push({
            type: "text",
            data: text.slice(currIndex, nextIndex),
          });

          currIndex = nextIndex;
        } else {
          nextIndex = findEndOfMath(
            rightDelim,
            text,
            currIndex + leftDelim.length);
          if (nextIndex === -1) {
            break;
          }

          finalData.push({
            type: "math",
            data: text.slice(
              currIndex + leftDelim.length,
              nextIndex),
            rawData: text.slice(
              currIndex,
              nextIndex + rightDelim.length),
            display: display,
          });

          currIndex = nextIndex + rightDelim.length;
        }

        lookingForLeft = !lookingForLeft;
      }

      finalData.push({
        type: "text",
        data: text.slice(currIndex),
      });
    } else {
      finalData.push(startData[i]);
    }
  }

  return finalData;
}

function splitWithDelimiters(text, delimiters) {
  var data = [{type: "text", data: text}];
  for (var i = 0; i < delimiters.length; i++) {
    var delimiter = delimiters[i];
    data = splitAtDelimiters(
      data, delimiter.left, delimiter.right,
      delimiter.display || false);
  }
  return data;
}

function remember(key, element) {
  memoMath[key] = element.innerHTML;
}

function renderMathInText(text, delimiters) {
  var data = splitWithDelimiters(text, delimiters);

  var fragment = document.createDocumentFragment();

  for (var i = 0; i < data.length; i++) {
    if (data[i].type === "text") {
      fragment.appendChild(document.createTextNode(data[i].data));
    } else {
      var span = document.createElement("span");
      var math = data[i].data;
      try {
        katex.render(math, span, {
          displayMode: data[i].display,
        });
      } catch (e) {
        if (!(e instanceof katex.ParseError)) {
          throw e;
        }

        span.innerHTML = data[i].rawData;
        span.classList.add("mathjax");
        
        var style = data[i].display ? "$$" : "$";
        var trimmedData = data[i].data.trim();
        if (trimmedData[trimmedData.length - 1] === '\\') {
          trimmedData += " ";
        }
        var rawData = style + trimmedData + style;

        if (memoMath[rawData] === undefined) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, span]);
          MathJax.Hub.Queue([remember, rawData, span]);
        } else {
          span.innerHTML = memoMath[rawData];
        }
      } finally {
        fragment.appendChild(span);
      }
    }
  }

  return fragment;
}

function renderElem(elem, delimiters, ignoredTags) {
  for (var i = 0; i < elem.childNodes.length; i++) {
    var childNode = elem.childNodes[i];
    if (childNode.nodeType === 3) {
      // Text node
      var frag = renderMathInText(childNode.textContent, delimiters);
      i += frag.childNodes.length - 1;
      elem.replaceChild(frag, childNode);
    } else if (childNode.nodeType === 1) {
      // Element node
      var shouldRender = ignoredTags.indexOf(
        childNode.nodeName.toLowerCase()) === -1;

      if (shouldRender) {
        renderElem(childNode, delimiters, ignoredTags);
      }
    }
  }
}

function renderMathInElement(elem) {
  var defaultOptions = {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "$", right: "$", display: false},
    ],

    ignoredTags: [
      "script", "noscript", "style", "textarea", "pre", "code",
    ],
  };
  renderElem(elem, defaultOptions.delimiters, defaultOptions.ignoredTags);
}

function markjax(text, element, markedOptions = {}) {
  if (text !== null) {
    if (markedOptions["breaks"] === undefined) {
      markedOptions["breaks"] = true;
    }
    if (markedOptions["sanitize"] === undefined) {
      markedOptions["sanitize"] = true;
    }
    if (markedOptions["highlight"] === undefined) {
      markedOptions["highlight"] = function (code) {
        return highlight.highlightAuto(code).value;
      }
    }

    marked.setOptions(markedOptions);

    var node = document.createElement('div');
    var src = text.replace(/&lt;/mg, '<').replace(/&gt;/mg, '>');
    
    var html = ReEscapeTex(marked(EscapeTex(src)));
    node.innerHTML = html;
    var code = node.getElementsByTagName("code");

    for (var i = 0; i < code.length; i++) {
      code[i].innerHTML = code[i].innerHTML.replace(/\\\$/g, '$');
    }

    element.innerHTML = node.innerHTML; 
  }
  
  var elements = element.getElementsByTagName("*");
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].tagName !== "CODE") {
      elements[i].classList.add("mathjax");
    }
  }
  renderMathInElement(element);
}

module.exports = markjax;
