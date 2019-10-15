

//编译
var Compiler = class Compiler {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm
    let fragment = this.node2fragment(this.el);

    //用数据进行编译
    this.compile(fragment)

    this.el.appendChild(fragment)
  }
  isElementNode(node) {
    return node.nodeType === 1;
  }
  node2fragment(node) {
    let fragment = document.createDocumentFragment();//创建文档碎片
    
    let firstChild;
    while (firstChild = node.firstChild) {
      fragment.appendChild(firstChild)
      // console.log(fragment, node.firstChild)
    }
    return fragment
  }
  //判断是否是v-开头
  isDirectactive(value) {
    return value.startsWith('v-')
  }

  //编译元素
  compileElement(node) {
    let attributes = node.attributes;
    [...attributes].forEach(item => {
      let { value, name } = item;
      if (this.isDirectactive(name)) {
        //指令元素
        let directactive = name.split('-')[1]

        CompileUnit[directactive](node,value,this.vm)
      }
    });
  }

  //编译文本

  compileText(node,q) {
    let curNode = node;
    let content = curNode.textContent;
    if (/\{\{(.+?)\}\}/.test(content)) {
      CompileUnit['text'](node, content, this.vm)
    }
  }
  
  //拿到节点后进行编译 核心编译
  compile(node) {
    let childNode = node.childNodes;
    [...childNode].forEach(item => {
      if (this.isElementNode(item)) {
        this.compileElement(item)
        this.compile(item)
      } else {
        this.compileText(item,item) 
      }
    })
  }
  
}

//数据劫持
var Observer = class Observer {
  constructor(data) {
    this.data = data;
    //得到每一个数据
    this.observer(this.data);
  }
  observer(data) {
    console.log(data, 88)
    //如果是对象才进行观察
    if (data && typeof (data) == 'object') {
      for (let key in data) {
        console.log(key, 88)
        this.defineProperty(data, key, data[key])
      }
    }
   
  }
  defineProperty(obj,key,val){
    console.log(obj, key, val, 77)
    this.observer(val)
    Object.defineProperty(obj, key, {
      get() {
        return val
      },
      set:(newVal)=> {
        if (newVal != val) {
          
          this.observer(newVal)
          val = newVal
        }
      }
    })
  }
}

CompileUnit = {
  //根据表达式取到对应数据
  getValue(vm,expr) {
    return expr.split('.').reduce((data, current) => {
      return data[current]
    },vm.$data)
  },
  model(node,expr,vm) {
    var fn = this.updater['updaterModel'];
    let value = this.getValue(vm, expr)
    fn(node, value)
  },
  text(node, expr, vm) {
    var fn = this.updater['updaterText'];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(vm,args[1])
    })
   fn(node, content)
  },
  updater: {
    updaterModel(node, value) {
      node.value = value
    },
    updaterText(node, value) {
      node.textContent = value
    }
  }
}


//基类
var Vue = class Vue {
  constructor(options){
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) {
      new Observer(this.$data);
      new Compiler(this.$el, this);
      console.log(this.$data)
    }
  }
}

