var React=require("react");
var E=React.createElement;
var TreeNode=React.createClass({
	propTypes:{
		data:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
		,action:React.PropTypes.func.isRequired
		,selected:React.PropTypes.array
		,cur:React.PropTypes.number.isRequired
	}
	,getInitialState:function() {
		return {};
	}
	,getDefaultProps:function() {
		return {cur:0,opts:{}};
	}

	,click:function(e) {
		var n=parseInt(e.target.parentElement.attributes['data-n'].value);
		this.props.data[n].o=!this.props.data[n].o;
		this.forceUpdate();
		e.preventDefault();
        e.stopPropagation();
	}
	,select:function(e){
		var datan=e.target.parentElement.attributes['data-n'];
		if (!datan) return;
		var n=parseInt(datan.value);
		var selected=this.props.selected.indexOf(n)>-1;
		if (selected && this.props.opts.editable) {
			this.props.action("editcaption",n);
		} else {
			this.props.action("select",n,e.ctrlKey);
		}
		e.preventDefault();
        e.stopPropagation();
	}
	,componentDidUpdate:function() {
		if (this.refs.editcaption) {
			var dom=this.refs.editcaption.getDOMNode();
			dom.focus();
			dom.selectionStart=dom.value.length;
		}
	}
	,keypress:function(e) {
		if (e.key=="Enter") {
			this.props.action("changecaption",e.target.value);	
		}
	}
	,renderItem:function(e,idx){
		var t=this.props.data[e];
		return E(TreeNode,{key:"k"+idx,cur:e,
			editcaption:this.props.editcaption,selected:this.props.selected,
			action:this.props.action,data:this.props.data,opts:this.props.opts});
	}
	,render:function() {
		var n=this.props.cur;
		var cur=this.props.data[n];
		var next=this.props.data[n+1];
		var selected="",extra="",children=[];
		var folderbutton=null;
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) extra=" treetoc";
		if (this.props.selected.indexOf(n)>-1) selected=" selected";
		if (next && next.d>cur.d) { 
			if (cur.o) {
				children=enumChildren(this.props.data,n);
				folderbutton=E("a",{className:"folderbutton opened",onClick:this.click},"－");
			}
			else {
				folderbutton=E("a",{className:"folderbutton closed",onClick:this.click},"＋");
			}
		} else {
			folderbutton=E("a",{ className:"leaf", "style":{"visibility":"hidden"} },"　");
		}

		var extracomponent=this.props.opts.onNode&& this.props.opts.onNode(cur);
		var caption=E("span",{className:selected+" caption"},cur.t);
		if (this.props.editcaption===n) {
			caption=E("input",{onKeyPress:this.keypress,className:"",ref:"editcaption",defaultValue:cur.t});
			extracomponent=null;
		}

		return E("div",{onClick:this.select,"data-n":n,className:"childnode"+extra},
			   folderbutton,depthdeco,
			   caption,
			   extracomponent,
			   	children.map(this.renderItem));
	}
});

var ganzhi="　甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";

var renderDepth=function(depth,opts) {
  var out=[];
  if (opts&&opts.tocstyle=="ganzhi") {
    return E("span", null, ganzhi[depth].trim()+" ");
  } else {
    if (depth) return E("span", null, depth, ".")
    else return null;
  }
  return null;
};


var enumChildren=function(toc,cur) {
    var children=[];
    if (!toc || !toc.length || toc.length==1) return children;
    thisdepth=toc[cur].d||toc[cur].depth;
    if (cur==0) thisdepth=0;
    if (cur+1>=toc.length) return children;
    if ((toc[cur+1].d||toc[cur+1].depth)!= 1+thisdepth) {
    	return children;  // no children node
    }
    var n=cur+1;
    var child=toc[n];
    
    while (child) {
      children.push(n);
      var next=toc[n+1];
      if (!next) break;
      if ((next.d||next.depth)==(child.d||child.depth)) {
        n++;
      } else if ((next.d||next.depth)>(child.d||child.depth)) {
        n=child.n||child.next;
      } else break;
      if (n) child=toc[n];else break;
    }
    return children;
}
module.exports=TreeNode;