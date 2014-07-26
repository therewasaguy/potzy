// Generated by CoffeeScript 1.7.1
(function() {
  var $, bufferSize, context, formatValue, node, potzy, premade, sampleDuration, sampleRate, t, updateValueStatusBar, volume, ws,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (window.potzy == null) {
    context = null;
    node = null;
    sampleRate = null;
    sampleDuration = null;
    t = 0;
    volume = 0.1;
    bufferSize = 4096;
    premade = ["afternoon walk", "early morning", "got some 303", "icecream", "late morning", "mind swift", "morning", "need more 303", "on the verge", "on the verge tech mix", "polytropon", "polytropon astral mix", "simple sine", "subwah", "unexpected token", "yay"];
    $ = function(id) {
      return document.getElementById(id);
    };
    window.potzy = potzy = new ((function() {
      function _Class() {
        this.pause = __bind(this.pause, this);
        this.play = __bind(this.play, this);
        this["import"] = __bind(this["import"], this);
        this.init = __bind(this.init, this);
        this.readyCallbacks = [];
        this._state = {};
      }

      _Class.prototype.setState = function(state) {
        var k, v, _ref;
        this.state = state;
        _ref = this.state;
        for (k in _ref) {
          v = _ref[k];
          this._state[k] = v;
        }
        if (this._state.VOL != null) {
          volume = Math.min(1, Math.max(0, parseFloat(this._state.VOL)));
        }
      };

      _Class.prototype.init = function() {
        var cb, e, file, fp, list, _fn, _i, _j, _len, _len1, _ref;
        fp = $("file-picker");
        list = document.createElement('ul');
        _fn = (function(_this) {
          return function(file) {
            var li;
            li = document.createElement('li');
            li.textContent = file;
            li.onclick = function() {
              return _this.load(file);
            };
            li.ondblclick = function() {
              return _this.load(file, true);
            };
            return list.appendChild(li);
          };
        })(this);
        for (_i = 0, _len = premade.length; _i < _len; _i++) {
          file = premade[_i];
          _fn(file);
        }
        fp.appendChild(list);
        $("play").addEventListener('click', this.play, false);
        $("pause").addEventListener('click', this.pause, false);
        this.editor = CodeMirror(document.getElementById("editor"), {
          mode: "javascript",
          value: "function dsp(t) {\n  return Math.sin(2 * Math.PI * t * 440);\n}"
        });
        this.editor.setSize("100%", "100%");
        this.editor.on("change", this["import"]);
        this["import"]();
        if (localStorage.getItem('_current') != null) {
          this.load(localStorage.getItem('_current'));
        } else {
          this.load("basic");
        }
        this.editor.focus();
        try {
          if (window.AudioContext == null) {
            window.AudioContext = window.webkitAudioContext;
          }
          context = new AudioContext();
          sampleRate = context.sampleRate;
          sampleDuration = 1 / sampleRate;
          node = context.createScriptProcessor(bufferSize, 1, 1);
          node.loop = false;
          node.onaudioprocess = (function(_this) {
            return function(e) {
              var i, output, _j, _ref, _results;
              output = e.outputBuffer.getChannelData(0);
              _results = [];
              for (i = _j = 0, _ref = output.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
                t += sampleDuration;
                _results.push(output[i] = volume * _this.fn(t));
              }
              return _results;
            };
          })(this);
          this.ready = true;
          _ref = this.readyCallbacks;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            cb = _ref[_j];
            cb();
          }
          return delete this.readyCallbacks;
        } catch (_error) {
          e = _error;
          this.ready = false;
          return alert('Web Audio API is not supported in this browser');
        }
      };

      _Class.prototype.load = function(file, force) {
        var xhr, _ref;
        this.currentFile = file;
        localStorage.setItem('_current', file);
        if (force && confirm("Delete local modifications to '" + file + "'?")) {
          localStorage.removeItem(file);
        }
        if ((localStorage.getItem(file) == null) && __indexOf.call(premade, file) >= 0) {
          xhr = new XMLHttpRequest;
          xhr.onreadystatechange = (function(_this) {
            return function() {
              if (xhr.readyState === 4) {
                _this.editor.setValue(xhr.responseText);
                return _this["import"]();
              }
            };
          })(this);
          xhr.open('GET', "premade/" + file, true);
          return xhr.send(null);
        } else {
          this.editor.setValue((_ref = localStorage.getItem(file)) != null ? _ref : "function dsp(t) {\n  return Math.sin(2 * Math.PI * t * 440);\n}");
          return this["import"]();
        }
      };

      _Class.prototype["import"] = function() {
        var e, fn, js, messagesContainer, str;
        js = this.editor.getValue().replace(/@([A-Za-z0-9]+)/gm, 'this.$1', 'gm');
        messagesContainer = document.getElementById('messages');
        try {
          str = "(function() {\n  function everything() {\n    var sampleRate = " + sampleRate + ";\n    var P0 = this.P0;\n    var P1 = this.P1;\n    var P2 = this.P2;\n    var P3 = this.P3;\n    var P4 = this.P4;\n    var L0 = this.L0;\n    " + js + "\n    return dsp;\n  }\n  return everything;\n})()";
          fn = eval(str);
          fn(0);
          fn(1);
          fn(100.499);
          messagesContainer.classList.remove('error');
          messagesContainer.innerHTML = 'OK!';
          localStorage.setItem(this.currentFile, js);
          return this._fn = fn;
        } catch (_error) {
          e = _error;
          console.error(e);
          messagesContainer.classList.add('error');
          return messagesContainer.innerHTML = 'Error: ' + e.message;
        }
      };

      _Class.prototype.play = function() {
        return node.connect(context.destination);
      };

      _Class.prototype.pause = function() {
        return node.disconnect();
      };

      _Class.prototype._fn = function() {
        return 0;
      };

      _Class.prototype.fn = function(t) {
        var e;
        try {
          return this._fn.call(this._state).call(this._state, t);
        } catch (_error) {
          e = _error;
          return 0;
        }
      };

      _Class.prototype.onReady = function(fn) {
        if (this.ready) {
          return setTimeout(fn, 0);
        } else {
          return this.readyCallbacks.push(fn);
        }
      };

      return _Class;

    })());
    formatValue = function(input) {
      var roundedStr;
      roundedStr = (Math.round(input * 100) / 100) + '';
      return roundedStr + "0.00".substr(roundedStr.length);
    };
    updateValueStatusBar = function(state) {
      var headings, headingsContainer, key, value, values, valuesContainer;
      headings = [];
      values = [];
      headingsContainer = document.getElementById('vars-names');
      valuesContainer = document.getElementById('vars-values');
      for (key in state) {
        value = state[key];
        headings.push("<th>@" + key + "</th>");
        values.push("<td>" + (formatValue(value)) + "</td>");
      }
      headingsContainer.innerHTML = headings.join('');
      return valuesContainer.innerHTML = values.join('');
    };
    window.addEventListener('load', window.potzy.init, false);
    ws = new WebSocket('ws://' + window.location.host);
    ws.onmessage = function(e) {
      var state;
      try {
        state = JSON.parse(e.data);
        window.requestAnimationFrame(function() {
          return updateValueStatusBar(state);
        });
        return potzy.setState(state);
      } catch (_error) {}
    };
  }

}).call(this);

//# sourceMappingURL=index.map
