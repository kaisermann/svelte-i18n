var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        const invalidators = [];
        const store = readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                run_all(invalidators);
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
        return {
            subscribe(run, invalidate = noop) {
                invalidators.push(invalidate);
                const unsubscribe = store.subscribe(run, invalidate);
                return () => {
                    const index = invalidators.indexOf(invalidate);
                    if (index !== -1) {
                        invalidators.splice(index, 1);
                    }
                    unsubscribe();
                };
            }
        };
    }

    // gutted from https://github.com/Polymer/observe-js/blob/master/src/observe.js
    function noop$1 () {}
    function detectEval () {
      // Don't test for eval if we're running in a Chrome App environment.
      // We check for APIs set that only exist in a Chrome App context.
      if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
        return false
      }

      // Firefox OS Apps do not allow eval. This feature detection is very hacky
      // but even if some other platform adds support for this function this code
      // will continue to work.
      if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
        return false
      }

      try {
        var f = new Function('', 'return true;');
        return f()
      } catch (ex) {
        return false
      }
    }

    var hasEval = detectEval();

    function isIndex (s) {
      return +s === s >>> 0 && s !== ''
    }

    function isObject (obj) {
      return obj === Object(obj)
    }

    var createObject = ('__proto__' in {}) ?
      function (obj) {
        return obj
      } :
      function (obj) {
        var proto = obj.__proto__;
        if (!proto)
          return obj
        var newObject = Object.create(proto);
        Object.getOwnPropertyNames(obj).forEach(function (name) {
          Object.defineProperty(newObject, name,
            Object.getOwnPropertyDescriptor(obj, name));
        });
        return newObject
      };

    function parsePath (path) {
      var keys = [];
      var index = -1;
      var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

      var actions = {
        push: function () {
          if (key === undefined)
            return

          keys.push(key);
          key = undefined;
        },

        append: function () {
          if (key === undefined)
            key = newChar;
          else
            key += newChar;
        }
      };

      function maybeUnescapeQuote () {
        if (index >= path.length)
          return

        var nextChar = path[index + 1];
        if ((mode == 'inSingleQuote' && nextChar == "'") ||
          (mode == 'inDoubleQuote' && nextChar == '"')) {
          index++;
          newChar = nextChar;
          actions.append();
          return true
        }
      }

      while (mode) {
        index++;
        c = path[index];

        if (c == '\\' && maybeUnescapeQuote())
          continue

        type = getPathCharType(c);
        typeMap = pathStateMachine[mode];
        transition = typeMap[type] || typeMap['else'] || 'error';

        if (transition == 'error')
          return // parse error

        mode = transition[0];
        action = actions[transition[1]] || noop$1;
        newChar = transition[2] === undefined ? c : transition[2];
        action();

        if (mode === 'afterPath') {
          return keys
        }
      }

      return // parse error
    }

    var identStart = '[\$_a-zA-Z]';
    var identPart = '[\$_a-zA-Z0-9]';
    var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

    function isIdent (s) {
      return identRegExp.test(s)
    }

    var constructorIsPrivate = {};

    function Path (parts, privateToken) {
      if (privateToken !== constructorIsPrivate)
        throw Error('Use Path.get to retrieve path objects')

      for (var i = 0; i < parts.length; i++) {
        this.push(String(parts[i]));
      }

      if (hasEval && this.length) {
        this.getValueFrom = this.compiledGetValueFromFn();
      }
    }

    var pathCache = {};

    function getPath (pathString) {
      if (pathString instanceof Path)
        return pathString

      if (pathString == null || pathString.length == 0)
        pathString = '';

      if (typeof pathString != 'string') {
        if (isIndex(pathString.length)) {
          // Constructed with array-like (pre-parsed) keys
          return new Path(pathString, constructorIsPrivate)
        }

        pathString = String(pathString);
      }

      var path = pathCache[pathString];
      if (path)
        return path

      var parts = parsePath(pathString);
      if (!parts)
        return invalidPath

      var path = new Path(parts, constructorIsPrivate);
      pathCache[pathString] = path;
      return path
    }

    Path.get = getPath;

    function formatAccessor (key) {
      if (isIndex(key)) {
        return '[' + key + ']'
      } else {
        return '["' + key.replace(/"/g, '\\"') + '"]'
      }
    }

    Path.prototype = createObject({
      __proto__: [],
      valid: true,

      toString: function () {
        var pathString = '';
        for (var i = 0; i < this.length; i++) {
          var key = this[i];
          if (isIdent(key)) {
            pathString += i ? '.' + key : key;
          } else {
            pathString += formatAccessor(key);
          }
        }

        return pathString
      },

      getValueFrom: function (obj, directObserver) {
        for (var i = 0; i < this.length; i++) {
          if (obj == null)
            return
          obj = obj[this[i]];
        }
        return obj
      },

      iterateObjects: function (obj, observe) {
        for (var i = 0; i < this.length; i++) {
          if (i)
            obj = obj[this[i - 1]];
          if (!isObject(obj))
            return
          observe(obj, this[i]);
        }
      },

      compiledGetValueFromFn: function () {
        var str = '';
        var pathString = 'obj';
        str += 'if (obj != null';
        var i = 0;
        var key;
        for (; i < (this.length - 1); i++) {
          key = this[i];
          pathString += isIdent(key) ? '.' + key : formatAccessor(key);
          str += ' &&\n     ' + pathString + ' != null';
        }
        str += ')\n';

        var key = this[i];
        pathString += isIdent(key) ? '.' + key : formatAccessor(key);

        str += '  return ' + pathString + ';\nelse\n  return undefined;';
        return new Function('obj', str)
      },

      setValueFrom: function (obj, value) {
        if (!this.length)
          return false

        for (var i = 0; i < this.length - 1; i++) {
          if (!isObject(obj))
            return false
          obj = obj[this[i]];
        }

        if (!isObject(obj))
          return false

        obj[this[i]] = value;
        return true
      }
    });

    function getPathCharType (char) {
      if (char === undefined)
        return 'eof'

      var code = char.charCodeAt(0);

      switch (code) {
        case 0x5B: // [
        case 0x5D: // ]
        case 0x2E: // .
        case 0x22: // "
        case 0x27: // '
        case 0x30: // 0
          return char

        case 0x5F: // _
        case 0x24: // $
          return 'ident'

        case 0x20: // Space
        case 0x09: // Tab
        case 0x0A: // Newline
        case 0x0D: // Return
        case 0xA0: // No-break space
        case 0xFEFF: // Byte Order Mark
        case 0x2028: // Line Separator
        case 0x2029: // Paragraph Separator
          return 'ws'
      }

      // a-z, A-Z
      if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
        return 'ident'

      // 1-9
      if (0x31 <= code && code <= 0x39)
        return 'number'

      return 'else'
    }

    var pathStateMachine = {
      'beforePath': {
        'ws': ['beforePath'],
        'ident': ['inIdent', 'append'],
        '[': ['beforeElement'],
        'eof': ['afterPath']
      },

      'inPath': {
        'ws': ['inPath'],
        '.': ['beforeIdent'],
        '[': ['beforeElement'],
        'eof': ['afterPath']
      },

      'beforeIdent': {
        'ws': ['beforeIdent'],
        'ident': ['inIdent', 'append']
      },

      'inIdent': {
        'ident': ['inIdent', 'append'],
        '0': ['inIdent', 'append'],
        'number': ['inIdent', 'append'],
        'ws': ['inPath', 'push'],
        '.': ['beforeIdent', 'push'],
        '[': ['beforeElement', 'push'],
        'eof': ['afterPath', 'push']
      },

      'beforeElement': {
        'ws': ['beforeElement'],
        '0': ['afterZero', 'append'],
        'number': ['inIndex', 'append'],
        "'": ['inSingleQuote', 'append', ''],
        '"': ['inDoubleQuote', 'append', '']
      },

      'afterZero': {
        'ws': ['afterElement', 'push'],
        ']': ['inPath', 'push']
      },

      'inIndex': {
        '0': ['inIndex', 'append'],
        'number': ['inIndex', 'append'],
        'ws': ['afterElement'],
        ']': ['inPath', 'push']
      },

      'inSingleQuote': {
        "'": ['afterElement'],
        'eof': ['error'],
        'else': ['inSingleQuote', 'append']
      },

      'inDoubleQuote': {
        '"': ['afterElement'],
        'eof': ['error'],
        'else': ['inDoubleQuote', 'append']
      },

      'afterElement': {
        'ws': ['afterElement'],
        ']': ['inPath', 'push']
      }
    };

    var invalidPath = new Path('', constructorIsPrivate);
    invalidPath.valid = false;
    invalidPath.getValueFrom = invalidPath.setValueFrom = function () {};

    var path = Path;

    /**
     *
     * @param {Object} o
     * @param {String} path
     * @returns {*}
     */
    var objectResolvePath = function (o, path$1) {
      if (typeof path$1 !== 'string') {
        throw new TypeError('path must be a string')
      }
      if (typeof o !== 'object') {
        throw new TypeError('object must be passed')
      }
      var pathObj = path.get(path$1);
      if (!pathObj.valid) {
        throw new Error('path is not a valid object path')
      }
      return pathObj.getValueFrom(o)
    };

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    var __extends = (undefined && undefined.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Compiler = /** @class */ (function () {
        function Compiler(locales, formats) {
            this.locales = [];
            this.formats = {
                number: {},
                date: {},
                time: {}
            };
            this.pluralNumberFormat = null;
            this.currentPlural = null;
            this.pluralStack = [];
            this.locales = locales;
            this.formats = formats;
        }
        Compiler.prototype.compile = function (ast) {
            this.pluralStack = [];
            this.currentPlural = null;
            this.pluralNumberFormat = null;
            return this.compileMessage(ast);
        };
        Compiler.prototype.compileMessage = function (ast) {
            var _this = this;
            if (!(ast && ast.type === 'messageFormatPattern')) {
                throw new Error('Message AST is not of type: "messageFormatPattern"');
            }
            var elements = ast.elements;
            var pattern = elements
                .filter(function (el) {
                return el.type === 'messageTextElement' || el.type === 'argumentElement';
            })
                .map(function (el) {
                return el.type === 'messageTextElement'
                    ? _this.compileMessageText(el)
                    : _this.compileArgument(el);
            });
            if (pattern.length !== elements.length) {
                throw new Error('Message element does not have a valid type');
            }
            return pattern;
        };
        Compiler.prototype.compileMessageText = function (element) {
            // When this `element` is part of plural sub-pattern and its value contains
            // an unescaped '#', use a `PluralOffsetString` helper to properly output
            // the number with the correct offset in the string.
            if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
                // Create a cache a NumberFormat instance that can be reused for any
                // PluralOffsetString instance in this message.
                if (!this.pluralNumberFormat) {
                    this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
                }
                return new PluralOffsetString(this.currentPlural.id, this.currentPlural.format.offset, this.pluralNumberFormat, element.value);
            }
            // Unescape the escaped '#'s in the message text.
            return element.value.replace(/\\#/g, '#');
        };
        Compiler.prototype.compileArgument = function (element) {
            var format = element.format, id = element.id;
            if (!format) {
                return new StringFormat(id);
            }
            var _a = this, formats = _a.formats, locales = _a.locales;
            switch (format.type) {
                case 'numberFormat':
                    return {
                        id: id,
                        format: new Intl.NumberFormat(locales, formats.number[format.style])
                            .format
                    };
                case 'dateFormat':
                    return {
                        id: id,
                        format: new Intl.DateTimeFormat(locales, formats.date[format.style])
                            .format
                    };
                case 'timeFormat':
                    return {
                        id: id,
                        format: new Intl.DateTimeFormat(locales, formats.time[format.style])
                            .format
                    };
                case 'pluralFormat':
                    return new PluralFormat(id, format.ordinal, format.offset, this.compileOptions(element), locales);
                case 'selectFormat':
                    return new SelectFormat(id, this.compileOptions(element));
                default:
                    throw new Error('Message element does not have a valid format type');
            }
        };
        Compiler.prototype.compileOptions = function (element) {
            var _this = this;
            var format = element.format;
            var options = format.options;
            // Save the current plural element, if any, then set it to a new value when
            // compiling the options sub-patterns. This conforms the spec's algorithm
            // for handling `"#"` syntax in message text.
            this.pluralStack.push(this.currentPlural);
            this.currentPlural = format.type === 'pluralFormat' ? element : null;
            var optionsHash = options.reduce(function (all, option) {
                // Compile the sub-pattern and save it under the options's selector.
                all[option.selector] = _this.compileMessage(option.value);
                return all;
            }, {});
            // Pop the plural stack to put back the original current plural value.
            this.currentPlural = this.pluralStack.pop();
            return optionsHash;
        };
        return Compiler;
    }());
    // -- Compiler Helper Classes --------------------------------------------------
    var Formatter = /** @class */ (function () {
        function Formatter(id) {
            this.id = id;
        }
        return Formatter;
    }());
    var StringFormat = /** @class */ (function (_super) {
        __extends(StringFormat, _super);
        function StringFormat() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StringFormat.prototype.format = function (value) {
            if (!value && typeof value !== 'number') {
                return '';
            }
            return typeof value === 'string' ? value : String(value);
        };
        return StringFormat;
    }(Formatter));
    var PluralFormat = /** @class */ (function () {
        function PluralFormat(id, useOrdinal, offset, options, locales) {
            this.id = id;
            this.offset = offset;
            this.options = options;
            this.pluralRules = new Intl.PluralRules(locales, {
                type: useOrdinal ? 'ordinal' : 'cardinal'
            });
        }
        PluralFormat.prototype.getOption = function (value) {
            var options = this.options;
            var option = options['=' + value] ||
                options[this.pluralRules.select(value - this.offset)];
            return option || options.other;
        };
        return PluralFormat;
    }());
    var PluralOffsetString = /** @class */ (function (_super) {
        __extends(PluralOffsetString, _super);
        function PluralOffsetString(id, offset, numberFormat, string) {
            var _this = _super.call(this, id) || this;
            _this.offset = offset;
            _this.numberFormat = numberFormat;
            _this.string = string;
            return _this;
        }
        PluralOffsetString.prototype.format = function (value) {
            var number = this.numberFormat.format(value - this.offset);
            return this.string
                .replace(/(^|[^\\])#/g, '$1' + number)
                .replace(/\\#/g, '#');
        };
        return PluralOffsetString;
    }(Formatter));
    var SelectFormat = /** @class */ (function () {
        function SelectFormat(id, options) {
            this.id = id;
            this.options = options;
        }
        SelectFormat.prototype.getOption = function (value) {
            var options = this.options;
            return options[value] || options.other;
        };
        return SelectFormat;
    }());
    function isSelectOrPluralFormat(f) {
        return !!f.options;
    }
    //# sourceMappingURL=compiler.js.map

    var parser = /*
     * Generated by PEG.js 0.10.0.
     *
     * http://pegjs.org/
     */
    (function() {

      function peg$subclass(child, parent) {
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
      }

      function peg$SyntaxError(message, expected, found, location) {
        this.message  = message;
        this.expected = expected;
        this.found    = found;
        this.location = location;
        this.name     = "SyntaxError";

        if (typeof Error.captureStackTrace === "function") {
          Error.captureStackTrace(this, peg$SyntaxError);
        }
      }

      peg$subclass(peg$SyntaxError, Error);

      peg$SyntaxError.buildMessage = function(expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
              literal: function(expectation) {
                return "\"" + literalEscape(expectation.text) + "\"";
              },

              "class": function(expectation) {
                var escapedParts = "",
                    i;

                for (i = 0; i < expectation.parts.length; i++) {
                  escapedParts += expectation.parts[i] instanceof Array
                    ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                    : classEscape(expectation.parts[i]);
                }

                return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
              },

              any: function(expectation) {
                return "any character";
              },

              end: function(expectation) {
                return "end of input";
              },

              other: function(expectation) {
                return expectation.description;
              }
            };

        function hex(ch) {
          return ch.charCodeAt(0).toString(16).toUpperCase();
        }

        function literalEscape(s) {
          return s
            .replace(/\\/g, '\\\\')
            .replace(/"/g,  '\\"')
            .replace(/\0/g, '\\0')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }

        function classEscape(s) {
          return s
            .replace(/\\/g, '\\\\')
            .replace(/\]/g, '\\]')
            .replace(/\^/g, '\\^')
            .replace(/-/g,  '\\-')
            .replace(/\0/g, '\\0')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }

        function describeExpectation(expectation) {
          return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }

        function describeExpected(expected) {
          var descriptions = new Array(expected.length),
              i, j;

          for (i = 0; i < expected.length; i++) {
            descriptions[i] = describeExpectation(expected[i]);
          }

          descriptions.sort();

          if (descriptions.length > 0) {
            for (i = 1, j = 1; i < descriptions.length; i++) {
              if (descriptions[i - 1] !== descriptions[i]) {
                descriptions[j] = descriptions[i];
                j++;
              }
            }
            descriptions.length = j;
          }

          switch (descriptions.length) {
            case 1:
              return descriptions[0];

            case 2:
              return descriptions[0] + " or " + descriptions[1];

            default:
              return descriptions.slice(0, -1).join(", ")
                + ", or "
                + descriptions[descriptions.length - 1];
          }
        }

        function describeFound(found) {
          return found ? "\"" + literalEscape(found) + "\"" : "end of input";
        }

        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
      };

      function peg$parse(input, options) {
        options = options !== void 0 ? options : {};

        var peg$FAILED = {},

            peg$startRuleFunctions = { start: peg$parsestart },
            peg$startRuleFunction  = peg$parsestart,

            peg$c0 = function(elements) {
                    return {
                        type    : 'messageFormatPattern',
                        elements: elements,
                        location: location()
                    };
                },
            peg$c1 = function(chunks) {
                    return chunks.reduce(function (all, chunk) {
                        return all.concat(chunk)
                    }, []).join('')
                },
            peg$c2 = function(messageText) {
                    return {
                        type : 'messageTextElement',
                        value: messageText,
                        location: location()
                    };
                },
            peg$c3 = /^[^ \t\n\r,.+={}#]/,
            peg$c4 = peg$classExpectation([" ", "\t", "\n", "\r", ",", ".", "+", "=", "{", "}", "#"], true, false),
            peg$c5 = "{",
            peg$c6 = peg$literalExpectation("{", false),
            peg$c7 = ",",
            peg$c8 = peg$literalExpectation(",", false),
            peg$c9 = "}",
            peg$c10 = peg$literalExpectation("}", false),
            peg$c11 = function(id, format) {
                    return {
                        type  : 'argumentElement',
                        id    : id,
                        format: format && format[2],
                        location: location()
                    };
                },
            peg$c12 = "number",
            peg$c13 = peg$literalExpectation("number", false),
            peg$c14 = "date",
            peg$c15 = peg$literalExpectation("date", false),
            peg$c16 = "time",
            peg$c17 = peg$literalExpectation("time", false),
            peg$c18 = function(type, style) {
                    return {
                        type : type + 'Format',
                        style: style && style[2],
                        location: location()
                    };
                },
            peg$c19 = "plural",
            peg$c20 = peg$literalExpectation("plural", false),
            peg$c21 = function(pluralStyle) {
                    return {
                        type   : pluralStyle.type,
                        ordinal: false,
                        offset : pluralStyle.offset || 0,
                        options: pluralStyle.options,
                        location: location()
                    };
                },
            peg$c22 = "selectordinal",
            peg$c23 = peg$literalExpectation("selectordinal", false),
            peg$c24 = function(pluralStyle) {
                    return {
                        type   : pluralStyle.type,
                        ordinal: true,
                        offset : pluralStyle.offset || 0,
                        options: pluralStyle.options,
                        location: location()
                    }
                },
            peg$c25 = "select",
            peg$c26 = peg$literalExpectation("select", false),
            peg$c27 = function(options) {
                    return {
                        type   : 'selectFormat',
                        options: options,
                        location: location()
                    };
                },
            peg$c28 = "=",
            peg$c29 = peg$literalExpectation("=", false),
            peg$c30 = function(selector, pattern) {
                    return {
                        type    : 'optionalFormatPattern',
                        selector: selector,
                        value   : pattern,
                        location: location()
                    };
                },
            peg$c31 = "offset:",
            peg$c32 = peg$literalExpectation("offset:", false),
            peg$c33 = function(number) {
                    return number;
                },
            peg$c34 = function(offset, options) {
                    return {
                        type   : 'pluralFormat',
                        offset : offset,
                        options: options,
                        location: location()
                    };
                },
            peg$c35 = peg$otherExpectation("whitespace"),
            peg$c36 = /^[ \t\n\r]/,
            peg$c37 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),
            peg$c38 = peg$otherExpectation("optionalWhitespace"),
            peg$c39 = /^[0-9]/,
            peg$c40 = peg$classExpectation([["0", "9"]], false, false),
            peg$c41 = /^[0-9a-f]/i,
            peg$c42 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true),
            peg$c43 = "0",
            peg$c44 = peg$literalExpectation("0", false),
            peg$c45 = /^[1-9]/,
            peg$c46 = peg$classExpectation([["1", "9"]], false, false),
            peg$c47 = function(digits) {
                return parseInt(digits, 10);
            },
            peg$c48 = /^[^{}\\\0-\x1F\x7F \t\n\r]/,
            peg$c49 = peg$classExpectation(["{", "}", "\\", ["\0", "\x1F"], "\x7F", " ", "\t", "\n", "\r"], true, false),
            peg$c50 = "\\\\",
            peg$c51 = peg$literalExpectation("\\\\", false),
            peg$c52 = function() { return '\\'; },
            peg$c53 = "\\#",
            peg$c54 = peg$literalExpectation("\\#", false),
            peg$c55 = function() { return '\\#'; },
            peg$c56 = "\\{",
            peg$c57 = peg$literalExpectation("\\{", false),
            peg$c58 = function() { return '\u007B'; },
            peg$c59 = "\\}",
            peg$c60 = peg$literalExpectation("\\}", false),
            peg$c61 = function() { return '\u007D'; },
            peg$c62 = "\\u",
            peg$c63 = peg$literalExpectation("\\u", false),
            peg$c64 = function(digits) {
                    return String.fromCharCode(parseInt(digits, 16));
                },
            peg$c65 = function(chars) { return chars.join(''); },

            peg$currPos          = 0,
            peg$savedPos         = 0,
            peg$posDetailsCache  = [{ line: 1, column: 1 }],
            peg$maxFailPos       = 0,
            peg$maxFailExpected  = [],
            peg$silentFails      = 0,

            peg$result;

        if ("startRule" in options) {
          if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
          }

          peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }

        function location() {
          return peg$computeLocation(peg$savedPos, peg$currPos);
        }

        function peg$literalExpectation(text, ignoreCase) {
          return { type: "literal", text: text, ignoreCase: ignoreCase };
        }

        function peg$classExpectation(parts, inverted, ignoreCase) {
          return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }

        function peg$endExpectation() {
          return { type: "end" };
        }

        function peg$otherExpectation(description) {
          return { type: "other", description: description };
        }

        function peg$computePosDetails(pos) {
          var details = peg$posDetailsCache[pos], p;

          if (details) {
            return details;
          } else {
            p = pos - 1;
            while (!peg$posDetailsCache[p]) {
              p--;
            }

            details = peg$posDetailsCache[p];
            details = {
              line:   details.line,
              column: details.column
            };

            while (p < pos) {
              if (input.charCodeAt(p) === 10) {
                details.line++;
                details.column = 1;
              } else {
                details.column++;
              }

              p++;
            }

            peg$posDetailsCache[pos] = details;
            return details;
          }
        }

        function peg$computeLocation(startPos, endPos) {
          var startPosDetails = peg$computePosDetails(startPos),
              endPosDetails   = peg$computePosDetails(endPos);

          return {
            start: {
              offset: startPos,
              line:   startPosDetails.line,
              column: startPosDetails.column
            },
            end: {
              offset: endPos,
              line:   endPosDetails.line,
              column: endPosDetails.column
            }
          };
        }

        function peg$fail(expected) {
          if (peg$currPos < peg$maxFailPos) { return; }

          if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
          }

          peg$maxFailExpected.push(expected);
        }

        function peg$buildStructuredError(expected, found, location) {
          return new peg$SyntaxError(
            peg$SyntaxError.buildMessage(expected, found),
            expected,
            found,
            location
          );
        }

        function peg$parsestart() {
          var s0;

          s0 = peg$parsemessageFormatPattern();

          return s0;
        }

        function peg$parsemessageFormatPattern() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsemessageFormatElement();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsemessageFormatElement();
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c0(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsemessageFormatElement() {
          var s0;

          s0 = peg$parsemessageTextElement();
          if (s0 === peg$FAILED) {
            s0 = peg$parseargumentElement();
          }

          return s0;
        }

        function peg$parsemessageText() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          s1 = [];
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$currPos;
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsechars();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse_();
                  if (s5 !== peg$FAILED) {
                    s3 = [s3, s4, s5];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c1(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsews();
            if (s1 !== peg$FAILED) {
              s0 = input.substring(s0, peg$currPos);
            } else {
              s0 = s1;
            }
          }

          return s0;
        }

        function peg$parsemessageTextElement() {
          var s0, s1;

          s0 = peg$currPos;
          s1 = peg$parsemessageText();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c2(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parseargument() {
          var s0, s1, s2;

          s0 = peg$parsenumber();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = [];
            if (peg$c3.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (peg$c3.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c4); }
                }
              }
            } else {
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              s0 = input.substring(s0, peg$currPos);
            } else {
              s0 = s1;
            }
          }

          return s0;
        }

        function peg$parseargumentElement() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c5;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseargument();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s6 = peg$c7;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c8); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parseelementFormat();
                      if (s8 !== peg$FAILED) {
                        s6 = [s6, s7, s8];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 125) {
                        s7 = peg$c9;
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c10); }
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c11(s3, s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseelementFormat() {
          var s0;

          s0 = peg$parsesimpleFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parsepluralFormat();
            if (s0 === peg$FAILED) {
              s0 = peg$parseselectOrdinalFormat();
              if (s0 === peg$FAILED) {
                s0 = peg$parseselectFormat();
              }
            }
          }

          return s0;
        }

        function peg$parsesimpleFormat() {
          var s0, s1, s2, s3, s4, s5, s6;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c12) {
            s1 = peg$c12;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c14) {
              s1 = peg$c14;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c15); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c16) {
                s1 = peg$c16;
                peg$currPos += 4;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c17); }
              }
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s4 = peg$c7;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsechars();
                  if (s6 !== peg$FAILED) {
                    s4 = [s4, s5, s6];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c18(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsepluralFormat() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c19) {
            s1 = peg$c19;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s3 = peg$c7;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepluralStyle();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c21(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseselectOrdinalFormat() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 13) === peg$c22) {
            s1 = peg$c22;
            peg$currPos += 13;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c23); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s3 = peg$c7;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepluralStyle();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c24(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseselectFormat() {
          var s0, s1, s2, s3, s4, s5, s6;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c25) {
            s1 = peg$c25;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c26); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s3 = peg$c7;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = [];
                  s6 = peg$parseoptionalFormatPattern();
                  if (s6 !== peg$FAILED) {
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parseoptionalFormatPattern();
                    }
                  } else {
                    s5 = peg$FAILED;
                  }
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c27(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseselector() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          s1 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c28;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c29); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenumber();
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
          } else {
            s0 = s1;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parsechars();
          }

          return s0;
        }

        function peg$parseoptionalFormatPattern() {
          var s0, s1, s2, s3, s4, s5, s6;

          s0 = peg$currPos;
          s1 = peg$parse_();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseselector();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 123) {
                  s4 = peg$c5;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c6); }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsemessageFormatPattern();
                  if (s5 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s6 = peg$c9;
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c10); }
                    }
                    if (s6 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c30(s2, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseoffset() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 7) === peg$c31) {
            s1 = peg$c31;
            peg$currPos += 7;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsenumber();
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c33(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsepluralStyle() {
          var s0, s1, s2, s3, s4;

          s0 = peg$currPos;
          s1 = peg$parseoffset();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parseoptionalFormatPattern();
              if (s4 !== peg$FAILED) {
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseoptionalFormatPattern();
                }
              } else {
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c34(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsews() {
          var s0, s1;

          peg$silentFails++;
          s0 = [];
          if (peg$c36.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }
          if (s1 !== peg$FAILED) {
            while (s1 !== peg$FAILED) {
              s0.push(s1);
              if (peg$c36.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c37); }
              }
            }
          } else {
            s0 = peg$FAILED;
          }
          peg$silentFails--;
          if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c35); }
          }

          return s0;
        }

        function peg$parse_() {
          var s0, s1, s2;

          peg$silentFails++;
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsews();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsews();
          }
          if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
          } else {
            s0 = s1;
          }
          peg$silentFails--;
          if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c38); }
          }

          return s0;
        }

        function peg$parsedigit() {
          var s0;

          if (peg$c39.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }

          return s0;
        }

        function peg$parsehexDigit() {
          var s0;

          if (peg$c41.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c42); }
          }

          return s0;
        }

        function peg$parsenumber() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c43;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c44); }
          }
          if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            s2 = peg$currPos;
            if (peg$c45.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c46); }
            }
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parsedigit();
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsedigit();
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              s1 = input.substring(s1, peg$currPos);
            } else {
              s1 = s2;
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c47(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsechar() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          if (peg$c48.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c50) {
              s1 = peg$c50;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c51); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c52();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c53) {
                s1 = peg$c53;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c54); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c55();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c56) {
                  s1 = peg$c56;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c57); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c58();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c59) {
                    s1 = peg$c59;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c60); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c61();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c62) {
                      s1 = peg$c62;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c63); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$currPos;
                      s3 = peg$currPos;
                      s4 = peg$parsehexDigit();
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parsehexDigit();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsehexDigit();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parsehexDigit();
                            if (s7 !== peg$FAILED) {
                              s4 = [s4, s5, s6, s7];
                              s3 = s4;
                            } else {
                              peg$currPos = s3;
                              s3 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                      if (s3 !== peg$FAILED) {
                        s2 = input.substring(s2, peg$currPos);
                      } else {
                        s2 = s3;
                      }
                      if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c64(s2);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  }
                }
              }
            }
          }

          return s0;
        }

        function peg$parsechars() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsechar();
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsechar();
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c65(s1);
          }
          s0 = s1;

          return s0;
        }

        peg$result = peg$startRuleFunction();

        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
          return peg$result;
        } else {
          if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
          }

          throw peg$buildStructuredError(
            peg$maxFailExpected,
            peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
            peg$maxFailPos < input.length
              ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
              : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
          );
        }
      }

      return {
        SyntaxError: peg$SyntaxError,
        parse:       peg$parse
      };
    })();

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    var __extends$1 = (undefined && undefined.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    // -- MessageFormat --------------------------------------------------------
    function resolveLocale(locales) {
        if (typeof locales === 'string') {
            locales = [locales];
        }
        try {
            return Intl.NumberFormat.supportedLocalesOf(locales, {
                // IE11 localeMatcher `lookup` seems to convert `en` -> `en-US`
                // but not other browsers,
                localeMatcher: 'best fit'
            })[0];
        }
        catch (e) {
            return MessageFormat.defaultLocale;
        }
    }
    function formatPatterns(pattern, values) {
        var result = '';
        for (var _i = 0, pattern_1 = pattern; _i < pattern_1.length; _i++) {
            var part = pattern_1[_i];
            // Exist early for string parts.
            if (typeof part === 'string') {
                result += part;
                continue;
            }
            var id = part.id;
            // Enforce that all required values are provided by the caller.
            if (!(values && id in values)) {
                throw new FormatError("A value must be provided for: " + id, id);
            }
            var value = values[id];
            // Recursively format plural and select parts' option — which can be a
            // nested pattern structure. The choosing of the option to use is
            // abstracted-by and delegated-to the part helper object.
            if (isSelectOrPluralFormat(part)) {
                result += formatPatterns(part.getOption(value), values);
            }
            else {
                result += part.format(value);
            }
        }
        return result;
    }
    function mergeConfig(c1, c2) {
        if (!c2) {
            return c1;
        }
        return __assign({}, (c1 || {}), (c2 || {}), Object.keys(c1).reduce(function (all, k) {
            all[k] = __assign({}, c1[k], (c2[k] || {}));
            return all;
        }, {}));
    }
    function mergeConfigs(defaultConfig, configs) {
        if (!configs) {
            return defaultConfig;
        }
        return Object.keys(defaultConfig).reduce(function (all, k) {
            all[k] = mergeConfig(defaultConfig[k], configs[k]);
            return all;
        }, __assign({}, defaultConfig));
    }
    var FormatError = /** @class */ (function (_super) {
        __extends$1(FormatError, _super);
        function FormatError(msg, variableId) {
            var _this = _super.call(this, msg) || this;
            _this.variableId = variableId;
            return _this;
        }
        return FormatError;
    }(Error));
    var MessageFormat = (function (message, locales, overrideFormats) {
        if (locales === void 0) { locales = MessageFormat.defaultLocale; }
        // Parse string messages into an AST.
        var ast = typeof message === 'string' ? MessageFormat.__parse(message) : message;
        if (!(ast && ast.type === 'messageFormatPattern')) {
            throw new TypeError('A message must be provided as a String or AST.');
        }
        // Creates a new object with the specified `formats` merged with the default
        // formats.
        var formats = mergeConfigs(MessageFormat.formats, overrideFormats);
        // Defined first because it's used to build the format pattern.
        var locale = resolveLocale(locales || []);
        // Compile the `ast` to a pattern that is highly optimized for repeated
        // `format()` invocations. **Note:** This passes the `locales` set provided
        // to the constructor instead of just the resolved locale.
        var pattern = new Compiler(locales, formats).compile(ast);
        // "Bind" `format()` method to `this` so it can be passed by reference like
        // the other `Intl` APIs.
        return {
            format: function (values) {
                try {
                    return formatPatterns(pattern, values);
                }
                catch (e) {
                    if (e.variableId) {
                        throw new Error("The intl string context variable '" + e.variableId + "' was not provided to the string '" + message + "'");
                    }
                    else {
                        throw e;
                    }
                }
            },
            resolvedOptions: function () {
                return { locale: locale };
            },
            getAst: function () {
                return ast;
            }
        };
    });
    MessageFormat.defaultLocale = 'en';
    // Default format options used as the prototype of the `formats` provided to the
    // constructor. These are used when constructing the internal Intl.NumberFormat
    // and Intl.DateTimeFormat instances.
    MessageFormat.formats = {
        number: {
            currency: {
                style: 'currency'
            },
            percent: {
                style: 'percent'
            }
        },
        date: {
            short: {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit'
            },
            medium: {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            },
            long: {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            },
            full: {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }
        },
        time: {
            short: {
                hour: 'numeric',
                minute: 'numeric'
            },
            medium: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },
            long: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short'
            },
            full: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short'
            }
        }
    };
    MessageFormat.__parse = parser.parse;
    //# sourceMappingURL=index.js.map

    /**
     * @constant DEFAULT_OPTIONS_KEYS the default options keys
     */
    var DEFAULT_OPTIONS_KEYS = {
        isEqual: true,
        isMatchingKey: true,
        isPromise: true,
        maxSize: true,
        onCacheAdd: true,
        onCacheChange: true,
        onCacheHit: true,
        transformKey: true,
    };
    /**
     * @function slice
     *
     * @description
     * slice.call() pre-bound
     */
    var slice = Array.prototype.slice;
    /**
     * @function cloneArray
     *
     * @description
     * clone the array-like object and return the new array
     *
     * @param arrayLike the array-like object to clone
     * @returns the clone as an array
     */
    function cloneArray(arrayLike) {
        var length = arrayLike.length;
        if (!length) {
            return [];
        }
        if (length === 1) {
            return [arrayLike[0]];
        }
        if (length === 2) {
            return [arrayLike[0], arrayLike[1]];
        }
        if (length === 3) {
            return [arrayLike[0], arrayLike[1], arrayLike[2]];
        }
        return slice.call(arrayLike, 0);
    }
    /**
     * @function getCustomOptions
     *
     * @description
     * get the custom options on the object passed
     *
     * @param options the memoization options passed
     * @returns the custom options passed
     */
    function getCustomOptions(options) {
        var customOptions = {};
        /* eslint-disable no-restricted-syntax */
        for (var key in options) {
            if (!DEFAULT_OPTIONS_KEYS[key]) {
                customOptions[key] = options[key];
            }
        }
        /* eslint-enable */
        return customOptions;
    }
    /**
     * @function isMemoized
     *
     * @description
     * is the function passed already memoized
     *
     * @param fn the function to test
     * @returns is the function already memoized
     */
    function isMemoized(fn) {
        return (typeof fn === 'function' &&
            fn.isMemoized);
    }
    /**
     * @function isSameValueZero
     *
     * @description
     * are the objects equal based on SameValueZero equality
     *
     * @param object1 the first object to compare
     * @param object2 the second object to compare
     * @returns are the two objects equal
     */
    function isSameValueZero(object1, object2) {
        // eslint-disable-next-line no-self-compare
        return object1 === object2 || (object1 !== object1 && object2 !== object2);
    }
    /**
     * @function mergeOptions
     *
     * @description
     * merge the options into the target
     *
     * @param existingOptions the options provided
     * @param newOptions the options to include
     * @returns the merged options
     */
    function mergeOptions(existingOptions, newOptions) {
        // @ts-ignore
        var target = {};
        /* eslint-disable no-restricted-syntax */
        for (var key in existingOptions) {
            target[key] = existingOptions[key];
        }
        for (var key in newOptions) {
            target[key] = newOptions[key];
        }
        /* eslint-enable */
        return target;
    }

    // utils
    var Cache = /** @class */ (function () {
        function Cache(options) {
            this.keys = [];
            this.values = [];
            this.options = options;
            var isMatchingKeyFunction = typeof options.isMatchingKey === 'function';
            if (isMatchingKeyFunction) {
                this.getKeyIndex = this._getKeyIndexFromMatchingKey;
            }
            else if (options.maxSize > 1) {
                this.getKeyIndex = this._getKeyIndexForMany;
            }
            else {
                this.getKeyIndex = this._getKeyIndexForSingle;
            }
            this.canTransformKey = typeof options.transformKey === 'function';
            this.shouldCloneArguments = this.canTransformKey || isMatchingKeyFunction;
            this.shouldUpdateOnAdd = typeof options.onCacheAdd === 'function';
            this.shouldUpdateOnChange = typeof options.onCacheChange === 'function';
            this.shouldUpdateOnHit = typeof options.onCacheHit === 'function';
        }
        Object.defineProperty(Cache.prototype, "size", {
            get: function () {
                return this.keys.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cache.prototype, "snapshot", {
            get: function () {
                return {
                    keys: cloneArray(this.keys),
                    size: this.size,
                    values: cloneArray(this.values),
                };
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @function _getKeyIndexFromMatchingKey
         *
         * @description
         * gets the matching key index when a custom key matcher is used
         *
         * @param keyToMatch the key to match
         * @returns the index of the matching key, or -1
         */
        Cache.prototype._getKeyIndexFromMatchingKey = function (keyToMatch) {
            var _a = this.options, isMatchingKey = _a.isMatchingKey, maxSize = _a.maxSize;
            var keys = this.keys;
            var keysLength = keys.length;
            if (!keysLength) {
                return -1;
            }
            if (isMatchingKey(keys[0], keyToMatch)) {
                return 0;
            }
            if (maxSize > 1) {
                for (var index = 1; index < keysLength; index++) {
                    if (isMatchingKey(keys[index], keyToMatch)) {
                        return index;
                    }
                }
            }
            return -1;
        };
        /**
         * @function _getKeyIndexForMany
         *
         * @description
         * gets the matching key index when multiple keys are used
         *
         * @param keyToMatch the key to match
         * @returns the index of the matching key, or -1
         */
        Cache.prototype._getKeyIndexForMany = function (keyToMatch) {
            var isEqual = this.options.isEqual;
            var keys = this.keys;
            var keysLength = keys.length;
            if (!keysLength) {
                return -1;
            }
            if (keysLength === 1) {
                return this._getKeyIndexForSingle(keyToMatch);
            }
            var keyLength = keyToMatch.length;
            var existingKey;
            var argIndex;
            if (keyLength > 1) {
                for (var index = 0; index < keysLength; index++) {
                    existingKey = keys[index];
                    if (existingKey.length === keyLength) {
                        argIndex = 0;
                        for (; argIndex < keyLength; argIndex++) {
                            if (!isEqual(existingKey[argIndex], keyToMatch[argIndex])) {
                                break;
                            }
                        }
                        if (argIndex === keyLength) {
                            return index;
                        }
                    }
                }
            }
            else {
                for (var index = 0; index < keysLength; index++) {
                    existingKey = keys[index];
                    if (existingKey.length === keyLength &&
                        isEqual(existingKey[0], keyToMatch[0])) {
                        return index;
                    }
                }
            }
            return -1;
        };
        /**
         * @function _getKeyIndexForSingle
         *
         * @description
         * gets the matching key index when a single key is used
         *
         * @param keyToMatch the key to match
         * @returns the index of the matching key, or -1
         */
        Cache.prototype._getKeyIndexForSingle = function (keyToMatch) {
            var keys = this.keys;
            if (!keys.length) {
                return -1;
            }
            var existingKey = keys[0];
            var length = existingKey.length;
            if (keyToMatch.length !== length) {
                return -1;
            }
            var isEqual = this.options.isEqual;
            if (length > 1) {
                for (var index = 0; index < length; index++) {
                    if (!isEqual(existingKey[index], keyToMatch[index])) {
                        return -1;
                    }
                }
                return 0;
            }
            return isEqual(existingKey[0], keyToMatch[0]) ? 0 : -1;
        };
        /**
         * @function orderByLru
         *
         * @description
         * order the array based on a Least-Recently-Used basis
         *
         * @param key the new key to move to the front
         * @param value the new value to move to the front
         * @param startingIndex the index of the item to move to the front
         */
        Cache.prototype.orderByLru = function (key, value, startingIndex) {
            var keys = this.keys;
            var values = this.values;
            var currentLength = keys.length;
            var index = startingIndex;
            while (index--) {
                keys[index + 1] = keys[index];
                values[index + 1] = values[index];
            }
            keys[0] = key;
            values[0] = value;
            var maxSize = this.options.maxSize;
            if (currentLength === maxSize && startingIndex === currentLength) {
                keys.pop();
                values.pop();
            }
            else if (startingIndex >= maxSize) {
                // eslint-disable-next-line no-multi-assign
                keys.length = values.length = maxSize;
            }
        };
        /**
         * @function updateAsyncCache
         *
         * @description
         * update the promise method to auto-remove from cache if rejected, and
         * if resolved then fire cache hit / changed
         *
         * @param memoized the memoized function
         */
        Cache.prototype.updateAsyncCache = function (memoized) {
            var _this = this;
            var _a = this.options, onCacheChange = _a.onCacheChange, onCacheHit = _a.onCacheHit;
            var firstKey = this.keys[0];
            var firstValue = this.values[0];
            this.values[0] = firstValue.then(function (value) {
                if (_this.shouldUpdateOnHit) {
                    onCacheHit(_this, _this.options, memoized);
                }
                if (_this.shouldUpdateOnChange) {
                    onCacheChange(_this, _this.options, memoized);
                }
                return value;
            }, function (error) {
                var keyIndex = _this.getKeyIndex(firstKey);
                if (keyIndex !== -1) {
                    _this.keys.splice(keyIndex, 1);
                    _this.values.splice(keyIndex, 1);
                }
                throw error;
            });
        };
        return Cache;
    }());

    // cache
    function createMemoizedFunction(fn, options) {
        if (options === void 0) { options = {}; }
        if (isMemoized(fn)) {
            return createMemoizedFunction(fn.fn, mergeOptions(fn.options, options));
        }
        if (typeof fn !== 'function') {
            throw new TypeError('You must pass a function to `memoize`.');
        }
        var _a = options.isEqual, isEqual = _a === void 0 ? isSameValueZero : _a, isMatchingKey = options.isMatchingKey, _b = options.isPromise, isPromise = _b === void 0 ? false : _b, _c = options.maxSize, maxSize = _c === void 0 ? 1 : _c, onCacheAdd = options.onCacheAdd, onCacheChange = options.onCacheChange, onCacheHit = options.onCacheHit, transformKey = options.transformKey;
        var normalizedOptions = mergeOptions({
            isEqual: isEqual,
            isMatchingKey: isMatchingKey,
            isPromise: isPromise,
            maxSize: maxSize,
            onCacheAdd: onCacheAdd,
            onCacheChange: onCacheChange,
            onCacheHit: onCacheHit,
            transformKey: transformKey,
        }, getCustomOptions(options));
        var cache = new Cache(normalizedOptions);
        var keys = cache.keys, values = cache.values, canTransformKey = cache.canTransformKey, shouldCloneArguments = cache.shouldCloneArguments, shouldUpdateOnAdd = cache.shouldUpdateOnAdd, shouldUpdateOnChange = cache.shouldUpdateOnChange, shouldUpdateOnHit = cache.shouldUpdateOnHit;
        // @ts-ignore
        var memoized = function memoized() {
            // @ts-ignore
            var key = shouldCloneArguments
                ? cloneArray(arguments)
                : arguments;
            if (canTransformKey) {
                key = transformKey(key);
            }
            var keyIndex = keys.length ? cache.getKeyIndex(key) : -1;
            if (keyIndex !== -1) {
                if (shouldUpdateOnHit) {
                    onCacheHit(cache, normalizedOptions, memoized);
                }
                if (keyIndex) {
                    cache.orderByLru(keys[keyIndex], values[keyIndex], keyIndex);
                    if (shouldUpdateOnChange) {
                        onCacheChange(cache, normalizedOptions, memoized);
                    }
                }
            }
            else {
                var newValue = fn.apply(this, arguments);
                var newKey = shouldCloneArguments
                    ? key
                    : cloneArray(arguments);
                cache.orderByLru(newKey, newValue, keys.length);
                if (isPromise) {
                    cache.updateAsyncCache(memoized);
                }
                if (shouldUpdateOnAdd) {
                    onCacheAdd(cache, normalizedOptions, memoized);
                }
                if (shouldUpdateOnChange) {
                    onCacheChange(cache, normalizedOptions, memoized);
                }
            }
            return values[0];
        };
        memoized.cache = cache;
        memoized.fn = fn;
        memoized.isMemoized = true;
        memoized.options = normalizedOptions;
        return memoized;
    }
    //# sourceMappingURL=micro-memoize.esm.js.map

    const s=({navigator:t,hash:e,search:o,fallback:r}={})=>{let n;const s=(t,e)=>{const o=t.substr(1).split("&").find(t=>0===t.indexOf(e));if(o)return o.split("=").pop()};return "undefined"!=typeof window&&(t&&(n=window.navigator.language||window.navigator.languages[0]),o&&(n=s(window.location.search,o)),e&&(n=s(window.location.hash,e))),n||r};let a,i;const c=createMemoizedFunction((t,e,o)=>new MessageFormat(t,e,o)),l=createMemoizedFunction((t,e)=>i[e][t]||objectResolvePath(i[e],t)),p=(t,e,o=a)=>c(t,o).format(e),f=(t,e,o=a)=>{"string"==typeof e&&(o=e,e=void 0);const r=l(t,o);return r?e?c(r,o).format(e):r:t};f.time=(t,e="short",o)=>p(`{t,time,${e}}`,{t:t},o),f.date=(t,e="short",o)=>p(`{d,date,${e}}`,{d:t},o),f.number=(t,e)=>p("{n,number}",{n:t},e),f.capital=(t,e,o)=>(t=>t.replace(/(^|\s)\S/,t=>t.toUpperCase()))(f(t,e,o)),f.title=(t,e,o)=>(t=>t.replace(/(^|\s)\S/g,t=>t.toUpperCase()))(f(t,e,o)),f.upper=(t,e,o)=>(t=>t.toLocaleUpperCase())(f(t,e,o)),f.lower=(t,e,o)=>(t=>t.toLocaleLowerCase())(f(t,e,o));const m=writable({});m.subscribe(t=>{i=t;});const u=writable({}),d=u.set;u.set=t=>{const e=(t=>{if(i[t])return t;if("string"==typeof t){const e=t.split("-").shift();if(i[e])return e}return null})(t);return e?d(e):(console.warn(`[svelte-i18n] Locale "${t}" not found.`),d(t))},u.update=t=>d(t(a)),u.subscribe(t=>{a=t;});const w=derived([u,m],()=>f);

    // defining a locale dictionary
    m.set({
      pt: {
        'switch.lang': 'Trocar idioma',
        greeting: {
          ask: 'Por favor, digite seu nome',
          message: 'Olá {name}, como vai?',
        },
        photos:
          'Você {n, plural, =0 {não tem fotos.} =1 {tem uma foto.} other {tem # fotos.}}',
        cats: 'Tenho {n, number} {n,plural,=0{gatos}one{gato}other{gatos}}',
      },
      en: {
        'switch.lang': 'Switch language',
        greeting: {
          ask: 'Please type your name',
          message: 'Hello {name}, how are you?',
        },
        photos:
          'You have {n, plural, =0 {no photos.} =1 {one photo.} other {# photos.}}',
        cats: 'I have {n, number} {n,plural,one{cat}other{cats}}',
      },
    });

    u.set(
      s({
        navigator: true,
        hash: 'lang',
        fallback: 'pt',
      }),
    );

    u.subscribe(l => {
      console.log('locale change', l);
    });

    /* src/App.svelte generated by Svelte v3.5.1 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	var t0_value = JSON.stringify(Object.keys(ctx.$dictionary), null, ' '), t0, t1, input0, input0_placeholder_value, t2, br0, t3, h1, t4_value = ctx.$_.title('greeting.message', { name: ctx.name }), t4, t5, br1, t6, input1, t7, h20, t8, t9_value = ctx.$_('photos', { n: ctx.pluralN }), t9, t10, br2, t11, input2, t12, h21, t13, t14_value = ctx.$_('cats', { n: ctx.catsN }), t14, t15, br3, t16, h22, t17, t18_value = ctx.$_.number(ctx.catsN), t18, t19, br4, t20, h23, t21, t22_value = ctx.$_.date(ctx.date, 'short'), t22, t23, br5, t24, h24, t25, t26_value = ctx.$_.time(ctx.date, 'medium'), t26, t27, br6, t28, button, t29_value = ctx.$_('switch.lang', null, ctx.oppositeLocale), t29, dispose;

    	return {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			h1 = element("h1");
    			t4 = text(t4_value);
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			h20 = element("h2");
    			t8 = text("Plural: ");
    			t9 = text(t9_value);
    			t10 = space();
    			br2 = element("br");
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			h21 = element("h2");
    			t13 = text("Number: ");
    			t14 = text(t14_value);
    			t15 = space();
    			br3 = element("br");
    			t16 = space();
    			h22 = element("h2");
    			t17 = text("Number util: ");
    			t18 = text(t18_value);
    			t19 = space();
    			br4 = element("br");
    			t20 = space();
    			h23 = element("h2");
    			t21 = text("Date util: ");
    			t22 = text(t22_value);
    			t23 = space();
    			br5 = element("br");
    			t24 = space();
    			h24 = element("h2");
    			t25 = text("Time util: ");
    			t26 = text(t26_value);
    			t27 = space();
    			br6 = element("br");
    			t28 = space();
    			button = element("button");
    			t29 = text(t29_value);
    			input0.className = "w-100";
    			attr(input0, "type", "text");
    			input0.placeholder = input0_placeholder_value = ctx.$_('greeting.ask');
    			add_location(input0, file, 17, 0, 318);
    			add_location(br0, file, 22, 0, 413);
    			add_location(h1, file, 24, 0, 421);
    			add_location(br1, file, 26, 0, 472);
    			attr(input1, "type", "range");
    			input1.min = "0";
    			input1.max = "5";
    			input1.step = "1";
    			add_location(input1, file, 27, 0, 479);
    			add_location(h20, file, 28, 0, 548);
    			add_location(br2, file, 30, 0, 597);
    			attr(input2, "type", "range");
    			input2.min = "100";
    			input2.max = "100000000";
    			input2.step = "10000";
    			add_location(input2, file, 31, 0, 604);
    			add_location(h21, file, 32, 0, 685);
    			add_location(br3, file, 34, 0, 730);
    			add_location(h22, file, 35, 0, 737);
    			add_location(br4, file, 37, 0, 779);
    			add_location(h23, file, 38, 0, 786);
    			add_location(br5, file, 40, 0, 832);
    			add_location(h24, file, 41, 0, 839);
    			add_location(br6, file, 43, 0, 886);
    			add_location(button, file, 44, 0, 893);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "change", ctx.input1_change_input_handler),
    				listen(input1, "input", ctx.input1_change_input_handler),
    				listen(input2, "change", ctx.input2_change_input_handler),
    				listen(input2, "input", ctx.input2_change_input_handler),
    				listen(button, "click", ctx.click_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, input0, anchor);

    			input0.value = ctx.name;

    			insert(target, t2, anchor);
    			insert(target, br0, anchor);
    			insert(target, t3, anchor);
    			insert(target, h1, anchor);
    			append(h1, t4);
    			insert(target, t5, anchor);
    			insert(target, br1, anchor);
    			insert(target, t6, anchor);
    			insert(target, input1, anchor);

    			input1.value = ctx.pluralN;

    			insert(target, t7, anchor);
    			insert(target, h20, anchor);
    			append(h20, t8);
    			append(h20, t9);
    			insert(target, t10, anchor);
    			insert(target, br2, anchor);
    			insert(target, t11, anchor);
    			insert(target, input2, anchor);

    			input2.value = ctx.catsN;

    			insert(target, t12, anchor);
    			insert(target, h21, anchor);
    			append(h21, t13);
    			append(h21, t14);
    			insert(target, t15, anchor);
    			insert(target, br3, anchor);
    			insert(target, t16, anchor);
    			insert(target, h22, anchor);
    			append(h22, t17);
    			append(h22, t18);
    			insert(target, t19, anchor);
    			insert(target, br4, anchor);
    			insert(target, t20, anchor);
    			insert(target, h23, anchor);
    			append(h23, t21);
    			append(h23, t22);
    			insert(target, t23, anchor);
    			insert(target, br5, anchor);
    			insert(target, t24, anchor);
    			insert(target, h24, anchor);
    			append(h24, t25);
    			append(h24, t26);
    			insert(target, t27, anchor);
    			insert(target, br6, anchor);
    			insert(target, t28, anchor);
    			insert(target, button, anchor);
    			append(button, t29);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$dictionary) && t0_value !== (t0_value = JSON.stringify(Object.keys(ctx.$dictionary), null, ' '))) {
    				set_data(t0, t0_value);
    			}

    			if (changed.name && (input0.value !== ctx.name)) input0.value = ctx.name;

    			if ((changed.$_) && input0_placeholder_value !== (input0_placeholder_value = ctx.$_('greeting.ask'))) {
    				input0.placeholder = input0_placeholder_value;
    			}

    			if ((changed.$_ || changed.name) && t4_value !== (t4_value = ctx.$_.title('greeting.message', { name: ctx.name }))) {
    				set_data(t4, t4_value);
    			}

    			if (changed.pluralN) input1.value = ctx.pluralN;

    			if ((changed.$_ || changed.pluralN) && t9_value !== (t9_value = ctx.$_('photos', { n: ctx.pluralN }))) {
    				set_data(t9, t9_value);
    			}

    			if (changed.catsN) input2.value = ctx.catsN;

    			if ((changed.$_ || changed.catsN) && t14_value !== (t14_value = ctx.$_('cats', { n: ctx.catsN }))) {
    				set_data(t14, t14_value);
    			}

    			if ((changed.$_ || changed.catsN) && t18_value !== (t18_value = ctx.$_.number(ctx.catsN))) {
    				set_data(t18, t18_value);
    			}

    			if ((changed.$_ || changed.date) && t22_value !== (t22_value = ctx.$_.date(ctx.date, 'short'))) {
    				set_data(t22, t22_value);
    			}

    			if ((changed.$_ || changed.date) && t26_value !== (t26_value = ctx.$_.time(ctx.date, 'medium'))) {
    				set_data(t26, t26_value);
    			}

    			if ((changed.$_ || changed.oppositeLocale) && t29_value !== (t29_value = ctx.$_('switch.lang', null, ctx.oppositeLocale))) {
    				set_data(t29, t29_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(t1);
    				detach(input0);
    				detach(t2);
    				detach(br0);
    				detach(t3);
    				detach(h1);
    				detach(t5);
    				detach(br1);
    				detach(t6);
    				detach(input1);
    				detach(t7);
    				detach(h20);
    				detach(t10);
    				detach(br2);
    				detach(t11);
    				detach(input2);
    				detach(t12);
    				detach(h21);
    				detach(t15);
    				detach(br3);
    				detach(t16);
    				detach(h22);
    				detach(t19);
    				detach(br4);
    				detach(t20);
    				detach(h23);
    				detach(t23);
    				detach(br5);
    				detach(t24);
    				detach(h24);
    				detach(t27);
    				detach(br6);
    				detach(t28);
    				detach(button);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $locale, $dictionary, $_;

    	validate_store(u, 'locale');
    	subscribe($$self, u, $$value => { $locale = $$value; $$invalidate('$locale', $locale); });
    	validate_store(m, 'dictionary');
    	subscribe($$self, m, $$value => { $dictionary = $$value; $$invalidate('$dictionary', $dictionary); });
    	validate_store(w, '_');
    	subscribe($$self, w, $$value => { $_ = $$value; $$invalidate('$_', $_); });

    	let name = '';
      let pluralN = 2;
      let catsN = 992301;
      let date = new Date();

      setInterval(() => {
        $$invalidate('date', date = new Date());
      }, 1000);

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate('name', name);
    	}

    	function input1_change_input_handler() {
    		pluralN = to_number(this.value);
    		$$invalidate('pluralN', pluralN);
    	}

    	function input2_change_input_handler() {
    		catsN = to_number(this.value);
    		$$invalidate('catsN', catsN);
    	}

    	function click_handler() {
    		return u.set(oppositeLocale);
    	}

    	let oppositeLocale;

    	$$self.$$.update = ($$dirty = { $locale: 1 }) => {
    		if ($$dirty.$locale) { $$invalidate('oppositeLocale', oppositeLocale = $locale === 'pt' ? 'en' : 'pt'); }
    	};

    	return {
    		name,
    		pluralN,
    		catsN,
    		date,
    		oppositeLocale,
    		$dictionary,
    		$_,
    		input0_input_handler,
    		input1_change_input_handler,
    		input2_change_input_handler,
    		click_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body,
      props: { name: 'world' },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
