const BASE = 10;
const END_DATE = '2017-10-10';
const TIME_GAP = 1000;
const DOT_RADIUS = 0.1;

function element(name,attr,content) {
    const e = document.createElement(name);
    for(let key in attr) {
        e.setAttribute(key,attr[key]);
    }
    if(content!==undefined) {
        e.innerHTML = content;
    }
    return e;
}

class Machine {
    constructor(base) {
        this.base = base;
        this.boxes = [];
        this.element = element('ul',{class:'machine'});
    }
    
    add_box() {
        const box = new Box(this);
        if(this.boxes.length) {
            this.boxes[this.boxes.length-1].next = box;
            box.previous = this.boxes[this.boxes.length-1];
        }
        this.boxes.push(box);
        this.element.appendChild(box.element);
        this.resize();
        return box;
    }
    
    reset() {
        const m = this;
        this.boxes.forEach(function(box) {
            m.element.removeChild(box.element);
        })
        this.boxes = [];
    }
    
    set_number(n) {
        this.reset();
        let box = this.add_box();
        let i = 0;
        while(n>0) {
            i += 1;
            while(this.boxes.length<i) {
                this.add_box();
            }
            box = this.boxes[i-1];
            let mod = n%this.base;
            for(let i=0;i<mod;i++) {
                box.add_dot();
            }
            n = (n-mod)/this.base;
        }
    }
    
    sum() {
        let t = 0;
        let p = 1;
        this.boxes.forEach(function(box) {
            t += p*box.count();
            p *= box.base;
        })
        return t;
    }
    
    resize() {
        const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const fit_width = w/(11*this.boxes.length+2);
        const fit_height = h/13;
        const font_size = Math.min(fit_width,fit_height);
        this.element.style['font-size'] = font_size+'px';
        
    }
}

class Box {
    constructor(machine) {
        this.machine = machine;
        this.base = this.machine.base;
        this.dots = [];
        this.element = element('li',{class:'box'});
        this.update();
    }
    
    add_dot() {
        const box = this;
        if(!this.next) {
            this.machine.add_box();
        }
        let x,y,ok = false;
        let attempts = 0;
        function random_pos() {
            const margin = 1.5*DOT_RADIUS;
            const x = Math.random()*(1-2*margin)+margin;
            const y = Math.random()*(1-2*margin)+margin;
            return {x:x,y:y};
        }
        if(this.dots.length == 0) {
            ({x,y} = random_pos());
        } else {
            const positions = [];
            for(let i=0;i<10;i++) {
                ({x,y} = random_pos());
                let mind = null;
                this.dots.forEach(function(dot) {
                    const dx = dot.x-x;
                    const dy = dot.y-y;
                    const d = dx*dx+dy*dy;
                    mind = mind==null ? d : Math.min(mind,d);
                });
                positions.push({d:mind,x:x,y:y});
            }
            const pos = positions.sort(function(a,b){a=a.d,b=b.d;return a>b ? -1 : a<b ? 1 : 0})[0];
            x = pos.x;
            y = pos.y;
        }
        const dot = new Dot(x,y);
        this.dots.push(dot);
        this.element.appendChild(dot.element);
        if(this.dots.length>=this.base) {
            if(!this.explode_timer) {
                this.explode_timer = setTimeout(function() {
                    box.dots.slice(0,box.base).forEach(function(dot) {
                        dot.fizz();
                    });
                    setTimeout(function() {
                        box.explode();
                    },TIME_GAP/3);
                },TIME_GAP/3);
            }
        }
        this.update();
    }
    
    explode() {
        this.explode_timer = null;
        if(this.dots.length<this.base) {
            return;
        }
        let remove = this.dots.slice(0,this.base);
        this.dots = this.dots.slice(this.base);
        remove.forEach(function(d) {
            d.pop();
        })
        this.update();
        this.next.add_dot();
    }

    update() {
        const n = this.count();
        this.element.setAttribute('title',`${n} ${n==1 ? 'dot' : 'dots'}`);
    }
    
    count() {
        return this.dots.length;
    }
}

class Dot {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.element = element('div',{class:'dot',title:'dot'});
        this.fizzer = element('div',{class:'fizzer'});
        this.element.appendChild(this.fizzer);
        this.popper = element('div',{class:'popper'});
        this.fizzer.appendChild(this.popper);
        this.popper.appendChild(element('div',{class:'thing'}));
        this.element.style.top = `${this.x*100}%`;
        this.element.style.left = `${this.y*100}%`;
    }
    fizz() {
        this.fizzer.classList.add('fizz');
        let angle = Math.random()*45 + 20;
        angle *= Math.random()>0.5 ? 1 : -1;
    }
    pop() {
        const dot = this;
        this.fizzer.classList.remove('fizz');
        this.popper.classList.add('pop');
        this.popper.addEventListener('animationend',function(e) {
            if(e.animationName!='pop') {
                return;
            }
            dot.element.parentElement.removeChild(dot.element);
        },false);
    }
}

const machine = new Machine(BASE);
function current_sum() {
    let t = Math.floor((Date.parse(END_DATE)-new Date())/TIME_GAP);
    t = Math.max(0, 1e6 - t);
    return t;
}
machine.set_number(current_sum());
document.body.appendChild(machine.element);
setInterval(function() {
    const target = current_sum();
    let sum = machine.sum();
    const box = machine.boxes[0] || machine.add_box();
    let added = 0;
    while(sum<target && added<100) {
        box.add_dot();
        sum += 1;
        added += 1;
    }
    machine.resize();
},100);
