var React=require("react/addons");
var E=React.createElement;
var manipulate=require("./manipulate");
var Controls=require("./controls");
var AddNode=require("./addnode");

var styles={
	selectedcaption:{cursor:"pointer",background:"highlight",borderRadius:"5px"}
	,caption:{cursor:"pointer"}
	,childnode:{left:"15px",position:"relative"}
	,rootnode:{position:"relative"}
	,folderbutton: {cursor:"pointer",borderRadius:"50%"}
	,closed:{cursor:"pointer",fontSize:"75%"}
	,opened:{cursor:"pointer",fontSize:"75%"}	
	,leaf:{fontSize:"75%"}	
	,hiddenleaf:{visibility:"hidden"}	
	,deletebutton:{background:"red",color:"yellow"}
	,nodelink:{fontSize:"65%",cursor:"pointer"}
};

var TreeNode=React.createClass({
	mixins:[React.addons.pureRenderMixin]
	,propTypes:{
		data:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
		,action:React.PropTypes.func.isRequired
		,selected:React.PropTypes.array
		,cur:React.PropTypes.number.isRequired
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
		if (e.target.nodeName!=="SPAN") return;
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
	,oninput:function(e) {
		var size=e.target.value.length+2;;
		if (size<5) size=5;
		e.target.size=size;
	}

	,editingkeydown:function(e) {
		if (e.key=="Enter") {
			this.props.action("changecaption",e.target.value);	
			e.stopPropagation();
		} else this.oninput(e);
	}
	,deleteNodes:function() {
		this.props.action("deletenode");
	}
	,renderDeleteButton:function(n) {
		var childnode=null;
		var children=manipulate.descendantOf(n,this.props.data);
		if (children>n+1) childnode=E("span",{}," "+(children-n)+" nodes");
		var out=E("button",{onClick:this.deleteNodes,style:styles.deletebutton},"Delete",childnode);
		return out;
	}
	,mouseenter:function(e) {
		e.target.style.background="highlight";
		var t=e.target.innerHTML;
		if (t==="＋"||t==="－") e.target.style.borderRadius="50%";
		else e.target.style.borderRadius="5px";
	}
	,mouseleave:function(e) {
		e.target.style.background="none";
	}
	,renderFolderButton:function(n) {
		var next=this.props.data[n+1];
		var cur=this.props.data[n];
		var folderbutton=null;
		var props={style:styles.closed, onClick:this.click, onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave};
		if (cur.o) props.style=styles.opened;
		if (next && next.d>cur.d) { 
			if (cur.o) folderbutton=E("a",props,"－");//"▼"
			else       folderbutton=E("a",props,"＋");//"▷"
		} else {
			folderbutton=E("a",{ style:styles.hiddenleaf},"　");
		}
		return folderbutton;
	}
	,renderCaption:function(n) {
		var cur=this.props.data[n];
		var stylename="caption";
		if (this.props.selected.indexOf(n)>-1) stylename="selectedcaption";
		var caption=null;
		if (this.props.deleting===n) {
			caption=this.renderDeleteButton(n);
		} else if (this.props.editcaption===n) {
			var size=cur.t.length+2;
			if (size<5) size=5;
			caption=E("input",{onKeyDown:this.editingkeydown,
				               size:size,ref:"editcaption",defaultValue:cur.t});
		} else {
			caption=E("span",{onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave,
				style:styles[stylename],title:n},cur.t);
		}
		return caption;
	}
	,renderAddingNode:function(n,above) {
		if (this.props.adding===n && n) { 
			return E(AddNode,{insertBefore:above,action:this.props.action});
		}
	}
	,renderEditControls:function(n) {
		if (!this.props.opts.editable) return;
		if (this.props.editcaption===n) {	
			var enabled=manipulate.enabled([n],this.props.data);
			return E(Controls,{action:this.props.action,enabled:enabled});
		} 
	}
	,renderItem:function(e,idx){
		var t=this.props.data[e];
		return E(TreeNode,{key:"k"+idx,cur:e,
			editcaption:this.props.editcaption,selected:this.props.selected,
			deleting:this.props.deleting,adding:this.props.adding,
			action:this.props.action,data:this.props.data,opts:this.props.opts});
	}
	,render:function() {
		if (this.props.data.length===0) return E("span",{},"");
		var n=this.props.cur;
		var cur=this.props.data[n];
		var stylename="childnode",children=[];
		var selected=this.props.selected.indexOf(n)>-1;
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) stylename="rootnode";
		var adding_before_controls=this.renderAddingNode(-n,true);
		var adding_after_controls=this.renderAddingNode(n);
		var editcontrols=this.renderEditControls(n);
		var folderbutton=this.renderFolderButton(n);
		if (cur.o) children=enumChildren(this.props.data,n);

		var extracomponent=this.props.opts.onNode&& this.props.opts.onNode(cur,selected,n);
		caption=this.renderCaption(n);
		if (this.props.editcaption>-1 || this.props.deleting>-1) extracomponent=null;
		if (this.props.deleting>-1) editcontrols=null;

		return E("div",{onClick:this.select,"data-n":n,style:styles[stylename]},
			   adding_before_controls,
			   folderbutton,depthdeco,
			   editcontrols,
			   caption,
			   extracomponent,
			   adding_after_controls,
			   children.map(this.renderItem));
	}
});

var ganzhi="　甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";

var renderDepth=function(depth,opts) {
  var out=[];
  if (opts&&opts.tocstyle=="ganzhi") {
    return E("span", null, ganzhi[depth].trim()+" ");
  } else {
    if (opts&&opts.numberDepth && depth) return E("span", null, depth, ".")
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