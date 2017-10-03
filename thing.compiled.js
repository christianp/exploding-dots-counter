'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BASE = 10;
var END_DATE = '2017-10-10';
var TIME_GAP = 1000;
var DOT_RADIUS = 0.1;

function element(name, attr, content) {
    var e = document.createElement(name);
    for (var key in attr) {
        e.setAttribute(key, attr[key]);
    }
    if (content !== undefined) {
        e.innerHTML = content;
    }
    return e;
}

var Machine = function () {
    function Machine(base) {
        _classCallCheck(this, Machine);

        this.base = base;
        this.boxes = [];
        this.element = element('ul', { class: 'machine' });
    }

    _createClass(Machine, [{
        key: 'add_box',
        value: function add_box() {
            var box = new Box(this);
            if (this.boxes.length) {
                this.boxes[this.boxes.length - 1].next = box;
                box.previous = this.boxes[this.boxes.length - 1];
            }
            this.boxes.push(box);
            this.element.appendChild(box.element);
            this.resize();
            return box;
        }
    }, {
        key: 'reset',
        value: function reset() {
            var m = this;
            this.boxes.forEach(function (box) {
                m.element.removeChild(box.element);
            });
            this.boxes = [];
        }
    }, {
        key: 'set_number',
        value: function set_number(n) {
            this.reset();
            var box = this.add_box();
            var i = 0;
            while (n > 0) {
                i += 1;
                while (this.boxes.length < i) {
                    this.add_box();
                }
                box = this.boxes[i - 1];
                var mod = n % this.base;
                for (var _i = 0; _i < mod; _i++) {
                    box.add_dot();
                }
                n = (n - mod) / this.base;
            }
        }
    }, {
        key: 'sum',
        value: function sum() {
            var t = 0;
            var p = 1;
            this.boxes.forEach(function (box) {
                t += p * box.count();
                p *= box.base;
            });
            return t;
        }
    }, {
        key: 'resize',
        value: function resize() {
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var fit_width = w / (11 * this.boxes.length + 2);
            var fit_height = h / 13;
            var font_size = Math.min(fit_width, fit_height);
            this.element.style['font-size'] = font_size + 'px';
        }
    }]);

    return Machine;
}();

var Box = function () {
    function Box(machine) {
        _classCallCheck(this, Box);

        this.machine = machine;
        this.base = this.machine.base;
        this.dots = [];
        this.element = element('li', { class: 'box' });
        this.update();
    }

    _createClass(Box, [{
        key: 'add_dot',
        value: function add_dot() {
            var _this = this;

            var box = this;
            if (!this.next) {
                this.machine.add_box();
            }
            var x = void 0,
                y = void 0,
                ok = false;
            var attempts = 0;
            function random_pos() {
                var margin = 1.5 * DOT_RADIUS;
                var x = Math.random() * (1 - 2 * margin) + margin;
                var y = Math.random() * (1 - 2 * margin) + margin;
                return { x: x, y: y };
            }
            if (this.dots.length == 0) {
                var _random_pos = random_pos();

                x = _random_pos.x;
                y = _random_pos.y;
            } else {
                var positions = [];

                var _loop = function _loop(i) {
                    var _random_pos2 = random_pos();

                    x = _random_pos2.x;
                    y = _random_pos2.y;

                    var mind = null;
                    _this.dots.forEach(function (dot) {
                        var dx = dot.x - x;
                        var dy = dot.y - y;
                        var d = dx * dx + dy * dy;
                        mind = mind == null ? d : Math.min(mind, d);
                    });
                    positions.push({ d: mind, x: x, y: y });
                };

                for (var i = 0; i < 10; i++) {
                    _loop(i);
                }
                var pos = positions.sort(function (a, b) {
                    a = a.d, b = b.d;return a > b ? -1 : a < b ? 1 : 0;
                })[0];
                x = pos.x;
                y = pos.y;
            }
            var dot = new Dot(x, y);
            this.dots.push(dot);
            this.element.appendChild(dot.element);
            if (this.dots.length >= this.base) {
                if (!this.explode_timer) {
                    this.explode_timer = setTimeout(function () {
                        box.dots.slice(0, box.base).forEach(function (dot) {
                            dot.fizz();
                        });
                        setTimeout(function () {
                            box.explode();
                        }, TIME_GAP / 3);
                    }, TIME_GAP / 3);
                }
            }
            this.update();
        }
    }, {
        key: 'explode',
        value: function explode() {
            this.explode_timer = null;
            if (this.dots.length < this.base) {
                return;
            }
            var remove = this.dots.slice(0, this.base);
            this.dots = this.dots.slice(this.base);
            remove.forEach(function (d) {
                d.pop();
            });
            this.update();
            this.next.add_dot();
        }
    }, {
        key: 'update',
        value: function update() {
            var n = this.count();
            this.element.setAttribute('title', n + ' ' + (n == 1 ? 'dot' : 'dots'));
        }
    }, {
        key: 'count',
        value: function count() {
            return this.dots.length;
        }
    }]);

    return Box;
}();

var Dot = function () {
    function Dot(x, y) {
        _classCallCheck(this, Dot);

        this.x = x;
        this.y = y;
        this.element = element('div', { class: 'dot', title: 'dot' });
        this.fizzer = element('div', { class: 'fizzer' });
        this.element.appendChild(this.fizzer);
        this.popper = element('div', { class: 'popper' });
        this.fizzer.appendChild(this.popper);
        this.popper.appendChild(element('div', { class: 'thing' }));
        this.element.style.top = this.x * 100 + '%';
        this.element.style.left = this.y * 100 + '%';
    }

    _createClass(Dot, [{
        key: 'fizz',
        value: function fizz() {
            this.fizzer.classList.add('fizz');
            var angle = Math.random() * 45 + 20;
            angle *= Math.random() > 0.5 ? 1 : -1;
        }
    }, {
        key: 'pop',
        value: function pop() {
            var dot = this;
            this.fizzer.classList.remove('fizz');
            this.popper.classList.add('pop');
            this.popper.addEventListener('animationend', function (e) {
                if (e.animationName != 'pop') {
                    return;
                }
                dot.element.parentElement.removeChild(dot.element);
            }, false);
        }
    }]);

    return Dot;
}();

var machine = new Machine(BASE);
function current_sum() {
    var t = Math.floor((Date.parse(END_DATE) - new Date()) / TIME_GAP);
    t = Math.max(0, 1e6 - t);
    return t;
}
machine.set_number(current_sum());
document.body.appendChild(machine.element);
setInterval(function () {
    var target = current_sum();
    var sum = machine.sum();
    var box = machine.boxes[0] || machine.add_box();
    var added = 0;
    while (sum < target && added < 100) {
        box.add_dot();
        sum += 1;
        added += 1;
    }
    machine.resize();
}, 100);
