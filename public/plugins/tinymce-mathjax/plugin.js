tinymce.PluginManager.add('mathjax', function (editor, url) {
  // plugin configuration options
  let settings = editor.getParam('mathjax');
  let mathjaxClassName = settings.className || 'math-tex';
  let mathjaxTempClassName = mathjaxClassName + '-original';
  let mathjaxSymbols = settings.symbols || { start: '\\(', end: '\\)' };
  let mathjaxUrl = settings.lib || null;
  let mathjaxConfigUrl =
    (settings.configUrl || url + '/config.js') +
    '?class=' +
    mathjaxTempClassName;
  let mathjaxScripts = [mathjaxConfigUrl];
  if (mathjaxUrl) {
    mathjaxScripts.push(mathjaxUrl);
  }

  // load mathjax and its config on editor init
  editor.on('init', function () {
    console.log('GetContent');
    let scripts = editor.getDoc().getElementsByTagName('script');
    for (let i = 0; i < mathjaxScripts.length; i++) {
      // check if script have already loaded
      let id = editor.dom.uniqueId();
      let script = editor.dom.create('script', {
        id: id,
        type: 'text/javascript',
        src: mathjaxScripts[i],
      });
      let found = false;
      for (let j = 0; j < scripts.length; j++) {
        if (scripts[j].src == script.src) {
          found = true;
          break;
        }
      }
      // load script
      if (!found) {
        editor.getDoc().getElementsByTagName('head')[0].appendChild(script);
      }
    }
  });

  // remove extra tags on get content
  editor.on('GetContent', function (e) {
    console.log('GetContent');
    let div = editor.dom.create('div');
    div.innerHTML = e.content;
    let elements = div.querySelectorAll('.' + mathjaxClassName);
    for (let i = 0; i < elements.length; i++) {
      let children = elements[i].querySelectorAll('span');
      for (let j = 0; j < children.length; j++) {
        children[j].remove();
      }
      let latex = elements[i].getAttribute('data-latex');
      elements[i].removeAttribute('contenteditable');
      elements[i].removeAttribute('style');
      elements[i].removeAttribute('data-latex');
      elements[i].innerHTML = latex;
    }
    e.content = div.innerHTML;
  });

  let checkElement = function (element) {
    if (element.childNodes.length != 2) {
      element.setAttribute('contenteditable', false);
      element.style.cursor = 'pointer';
      let latex = element.getAttribute('data-latex') || element.innerHTML;
      element.setAttribute('data-latex', latex);
      element.innerHTML = '';

      let math = editor.dom.create('span');
      math.innerHTML = latex;
      math.classList.add(mathjaxTempClassName);
      element.appendChild(math);

      let dummy = editor.dom.create('span');
      dummy.classList.add('dummy');
      dummy.innerHTML = 'dummy';
      dummy.setAttribute('hidden', 'hidden');
      element.appendChild(dummy);
    }
  };

  // add dummy tag on set content
  editor.on('BeforeSetContent', function (e) {
    console.log('BeforeSetContent');
    let div = editor.dom.create('div');
    div.innerHTML = e.content;
    let elements = div.querySelectorAll('.' + mathjaxClassName);
    for (let i = 0; i < elements.length; i++) {
      checkElement(elements[i]);
    }
    e.content = div.innerHTML;
  });

  // refresh mathjax on set content
  editor.on('SetContent', function (e) {
    console.log('SetContent');
    if (editor.getDoc().defaultView.MathJax) {
      if (editor.getDoc().defaultView.MathJax.options.M) {
        editor.getDoc().defaultView.MathJax.options.M.typesetPromise();
      }
    }
  });

  // refresh mathjax on any content change
  editor.on('Change', function (data) {
    console.log('Change');
    elements = editor.dom.getRoot().querySelectorAll('.' + mathjaxClassName);
    if (elements.length) {
      for (let i = 0; i < elements.length; i++) {
        checkElement(elements[i]);
      }

      try {
        if (editor.getDoc().defaultView.MathJax) {
          editor.getDoc().defaultView.MathJax.startup.getComponents();
          editor.getDoc().defaultView.MathJax.typeset();
        }
      } catch (e) {
        console.log(e);
      }

      // try {
      //   if (editor.getDoc().defaultView.MathJax) {
      //     editor.getDoc().defaultView.MathJax.options.M.typesetPromise();
      //   }
      // } catch (e) {
      //   console.log(e);
      // }
    }
  });

  // add button to tinimce
  editor.ui.registry.addToggleButton('mathjax', {
    text: 'Math',
    tooltip: 'Mathjax',
    onAction: function () {
      let selected = editor.selection.getNode();
      let target = undefined;
      if (selected.classList.contains(mathjaxClassName)) {
        target = selected;
      }
      openMathjaxEditor(target);
    },
    onSetup: function (buttonApi) {
      return editor.selection.selectorChangedWithUnbind(
        '.' + mathjaxClassName,
        buttonApi.setActive,
      ).unbind;
    },
  });

  // handle click on existing
  editor.on('click', function (e) {
    let closest = e.target.closest('.' + mathjaxClassName);
    if (closest) {
      openMathjaxEditor(closest);
    }
  });

  // open window with editor
  let openMathjaxEditor = function (target) {
    console.log(target);
    let mathjaxId = editor.id + '_' + editor.dom.uniqueId();

    let latex = '';
    if (target) {
      latex_attribute = target.getAttribute('data-latex');

      //  console.log("latex_attribute is" + latex_attribute);

      if (
        latex_attribute.length >=
        (mathjaxSymbols.start + mathjaxSymbols.end).length
      ) {
        latex = latex_attribute.substr(
          mathjaxSymbols.start.length,
          latex_attribute.length -
            1 -
            (mathjaxSymbols.start + mathjaxSymbols.end).length,
        );
      }
    }

    // show new window
    editor.windowManager.open({
      title: 'Mathjax',
      width: 600,
      height: 330,
      body: {
        type: 'panel',
        items: [
          {
            type: 'htmlpanel',
            html: '<div style="font-size:12px"> <input onclick=changesybol() type=checkbox id=cb_br name=cb_br>Center    --------    <a href="https://editor.codecogs.com" target="blank" >   Type   </a>  -------- OR --------          <a href="https://webdemo.myscript.com/views/math/index.html#" target="blank" >  Handwrite  </a>  </div>',
          },
          {
            type: 'textarea',
            name: 'title',
          },
          {
            type: 'htmlpanel',
            html:
              '<iframe id="' +
              mathjaxId +
              '" style="width: 100%; min-height: 50px;"></iframe>',
          },
        ],
      },
      buttons: [{ type: 'submit', text: 'OK' }],
      onSubmit: function onsubmit(api) {
        let value = api.getData().title.trim();
        if (target) {
          target.innerHTML = '';
          target.setAttribute('data-latex', getMathText(value));
          checkElement(target);
        } else {
          let newElement = editor.getDoc().createElement('span');
          newElement.innerHTML = getMathText(value);
          newElement.classList.add(mathjaxClassName);
          checkElement(newElement);
          editor.insertContent(newElement.outerHTML);
        }

        //fix
        //  editor.getDoc().defaultView.MathJax.startup.getComponents();
        // editor.getDoc().defaultView.MathJax.typeset();

        if (editor.getDoc().defaultView.MathJax) {
          editor.getDoc().defaultView.MathJax.options.M.typesetPromise();
        }

        api.close();
      },
      onChange: function (api) {
        var value = api.getData().title.trim();
        if (value != latex) {
          refreshDialogMathjax(value, document.getElementById(mathjaxId));
          latex = value;
        }
      },
      initialData: { title: latex },
    });

    if (mathjaxSymbols.start == '\\(') {
      document.getElementById('cb_br').checked = false;
    } else {
      document.getElementById('cb_br').checked = true;
    }

    // console.log(mathjaxSymbols);

    // add scripts to iframe
    let iframe = document.getElementById(mathjaxId);

    let iframeWindow =
      iframe.contentWindow ||
      iframe.contentDocument.document ||
      iframe.contentDocument;
    let iframeDocument = iframeWindow.document;
    let iframeHead = iframeDocument.getElementsByTagName('head')[0];
    let iframeBody = iframeDocument.getElementsByTagName('body')[0];

    // get latex for mathjax from simple text
    let getMathText = function (value, symbols) {
      if (!symbols) {
        symbols = mathjaxSymbols;
      }

      if (document.getElementById('cb_br').checked) {
        symbols = { start: '\\[', end: '\\] ' };
      } else {
        symbols = { start: '\\(', end: '\\) ' };
      }

      return symbols.start + ' ' + value + ' ' + symbols.end;
    };

    // refresh latex in mathjax iframe
    let refreshDialogMathjax = function (latex) {
      let MathJax = iframeWindow.MathJax;
      let div = iframeBody.querySelector('div');
      if (!div) {
        div = iframeDocument.createElement('div');
        div.classList.add(mathjaxTempClassName);
        iframeBody.appendChild(div);
      }
      div.innerHTML = getMathText(latex, { start: '$$', end: '$$' });

      if (MathJax && MathJax.startup) {
        console.log(MathJax);
        //MathJax.startup.getComponents();
        MathJax.typesetPromise();
      }
    };
    refreshDialogMathjax(latex);

    // add scripts for dialog iframe
    for (let i = 0; i < mathjaxScripts.length; i++) {
      let node = iframeWindow.document.createElement('script');
      node.src = mathjaxScripts[i];
      node.type = 'text/javascript';
      node.async = false;
      node.charset = 'utf-8';
      iframeHead.appendChild(node);
    }
  };
});

function changesybol() {
  if (document.getElementById('cb_br').checked) {
    mathjaxSymbols = { start: '[', end: '] ' };
  } else {
    mathjaxSymbols = { start: '(', end: ') ' };
  }
}
