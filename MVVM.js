

//编译
var Compiler = class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el :document.querySelector(el);
        console.log(this.el);
    }
    isElementNode(node){
       
        return node.nodeType === 1;
    }
}

//基类
var Vue = class Vue {
    constructor(options){
      this.$el = options.el;
      this.$data = options.data;

      if(this.$el){
        new Compiler(this.$el,this);
      }
    }

}

