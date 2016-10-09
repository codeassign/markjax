var Download = {
  latex: null,

  Latex: function() {
    var markdown = $(".markjax-editor.markjax-input").val().replace(/</gm, "&lt;");
    var site = "http://pandoc.org/cgi-bin/trypandoc?from=markdown&to=latex&text=" + encodeURIComponent(markdown);
    var yql = "http://query.yahooapis.com/v1/public/yql?q=" +
              encodeURIComponent('select * from html where url="' + site + '"') + '&format=xml&callback=';

    var latex;
    $.ajax({
      url: yql,
      method: "GET",
      async: false,
      success: function (response) {
        latex = JSON.parse($(response).find('body').html()).result;
      }
    });

    latex = latex.replace(/\\\(|\\\)/gm, "$");
    this.latex = latexBegin + latex.replace(/&lt;/gm, "<").replace(/&gt;/gm, ">") + latexEnd;
  }
}

$(document).ready(function() {
  $("#download-latex").on("click", function() {
    Download.Latex();
    window.open("data:text/plain;charset=utf-8," + encodeURIComponent(Download.latex), "_blank").focus();
  });

  $("#download-pdf").on("click", function() {
    if ($(this).hasClass("disabled")) {
      return;
    }
    Download.Latex();
    var pdfURL = "http://latex.aslushnikov.com/compile?text=" +
                 encodeURIComponent(Download.latex.replace(/\\/gm, "\\\\").replace(/\$/gm, "\\$")) +
                 "&download=CodeAssignEditor.pdf";
    window.open(pdfURL, "_self");
  });

  $("#download-markdown").on("click", function() {
    var markdown = $(".markjax-editor.markjax-input").val();
    window.open("data:text/plain;charset=utf-8," + encodeURIComponent(markdown), "_blank").focus();
  });
});

var latexBegin =
"\\documentclass[]{article}" + "\n" +
"\\usepackage[T1]{fontenc}" + "\n" +
"\\usepackage{lmodern}" + "\n" +
"\\usepackage{amssymb,amsmath}" + "\n" +
"\\usepackage{ifxetex,ifluatex}" + "\n" +
"\\usepackage{fixltx2e} % provides \\textsubscript" + "\n" +
"% use microtype if available" + "\n" +
"\\IfFileExists{microtype.sty}{\\usepackage{microtype}}{}" + "\n" +
"\\ifnum 0\\ifxetex 1\\fi\\ifluatex 1\\fi=0 % if pdftex" + "\n" +
"  \\usepackage[utf8]{inputenc}" + "\n" +
"\\else % if luatex or xelatex" + "\n" +
"  \\usepackage{fontspec}" + "\n" +
"  \\ifxetex" + "\n" +
"    \\usepackage{xltxtra,xunicode}" + "\n" +
"  \\fi" + "\n" +
"  \\defaultfontfeatures{Mapping=tex-text,Scale=MatchLowercase}" + "\n" +
"  \\newcommand{\\euro}{€}" + "\n" +
"\\fi" + "\n" +
"\\usepackage[a4paper]{geometry}" + "\n" +
"\\ifxetex" + "\n" +
"  \\usepackage[setpagesize=false, % page size defined by xetex" + "\n" +
"              unicode=false, % unicode breaks when used with xetex" + "\n" +
"              xetex]{hyperref}" + "\n" +
"\\else" + "\n" +
"  \\usepackage[unicode=true]{hyperref}" + "\n" +
"\\fi" + "\n" +
"\\hypersetup{breaklinks=true," + "\n" +
"            bookmarks=true," + "\n" +
"            pdfauthor={}," + "\n" +
"            pdftitle={}," + "\n" +
"            colorlinks=true," + "\n" +
"            urlcolor=blue," + "\n" +
"            linkcolor=magenta," + "\n" +
"            pdfborder={0 0 0}}" + "\n" +
"\\setlength{\\parindent}{0pt}" + "\n" +
"\\setlength{\\parskip}{6pt plus 2pt minus 1pt}" + "\n" +
"\\setlength{\\emergencystretch}{3em}  % prevent overfull lines" + "\n" +
"\\setcounter{secnumdepth}{0}" + "\n" +
"" + "\n" +
"\\author{}" + "\n" +
"\\date{}" + "\n" +
"" + "\n" +
"\\begin{document}" + "\n";

var latexEnd = "\n\\end{document}";
