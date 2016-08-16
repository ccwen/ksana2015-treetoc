var React=require("react");
var E=React.createElement;

var manipulate=require("./manipulate");
var Controls=require("./controls");
var AddNode=require("./addnode");
var treenodehits=null;

try {
	treenodehits=require("ksana-simple-api").treenodehits;
} catch(e) {
	//don't have ksana libray
	treenodehits=function(){return 0};
}

var defaultstyles={
	selectedcaption:{borderBottom:"1px solid blue",cursor:"pointer",borderRadius:"5px"}
	,caption:{cursor:"pointer"}
	,childnode:{left:"0.7em",position:"relative"}
	,rootnode:{position:"relative"}
	,folderbutton: {cursor:"pointer",borderRadius:"50%"}
	,closed:{cursor:"pointer",fontSize:"75%"}
	,opened:{cursor:"pointer",fontSize:"75%"}	
	,leaf:{fontSize:"75%"}	
	,hiddenleaf:{visibility:"hidden"}	
	,deletebutton:{background:"red",color:"yellow"}
	,nodelink:{fontSize:"65%",cursor:"pointer"}
	,hit:{color:"red",fontSize:"65%",cursor:"pointer"}
	,input:{fontSize:"100%"}	
};
var styles={};

var TreeNode=React.createClass({
	propTypes:{
		toc:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
		,action:React.PropTypes.func.isRequired 
		,selected:React.PropTypes.array         //selected treenode (multiple)
		,cur:React.PropTypes.number.isRequired //current active treenode
		,styles:React.PropTypes.object  //custom style
		,nodeicons:React.PropTypes.node
	}
	,getDefaultProps:function() {
		return {cur:0,opts:{},toc:[]};
	}
	,componentWillMount:function(){
		this.cloneStyle();
	}
	,click:function(e) {
		ele=e.target;
		while (ele && !ele.attributes['data-n']) {
			ele=ele.parentElement;
		}
		var n=parseInt(ele.attributes['data-n'].value);
		this.props.toc[n].o=!this.props.toc[n].o;
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
		if (selected) {
			if (this.props.opts.editable)  {
				this.props.action("editcaption",n);	
			} else {
				//toggle folder button
				this.click(e);
			}
		} else {
			this.props.action("select",n,e.ctrlKey);
		}
		e.preventDefault();
    e.stopPropagation();
	}
	,cloneStyle:function(newstyles) {
		styles={};
		for (var i in defaultstyles) styles[i]=defaultstyles[i];
		if (newstyles) for (var i in newstyles) styles[i]=newstyles[i];
	}

	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.styles && nextProps.styles!==this.props.styles) this.cloneStyle(nextProps.styles)
	}
	,componentDidUpdate:function() {
		if (this.refs.editcaption) {
			var dom=this.refs.editcaption;
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
		var children=manipulate.descendantOf(n,this.props.toc);
		if (children>n+1) childnode=E("span",{}," "+(children-n)+" nodes");
		var out=E("button",{onClick:this.deleteNodes,style:styles.deletebutton},"Delete",childnode);
		return out;
	}
	,mouseenter:function(e) {
		//e.target.style.background="highlight";
		e.target.style.oldcolor=e.target.style.color;
		//e.target.style.color="HighlightText";
		e.target.style.borderRadius="5px";
		this.lasttarget=e.target;
	}
	,mouseleave:function(e) {
		if (!this.lasttarget)return;
		//this.lasttarget.style.background="none";
		this.lasttarget.style.color=this.lasttarget.style.oldcolor;
	}
	,renderFolderButton:function(n) {
		var next=this.props.toc[n+1];
		var cur=this.props.toc[n];
		var folderbutton=null;
		var props={style:styles.closed, onClick:this.click, onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave};
		if (cur.o) props.style=styles.opened;
		if (next && next.d>cur.d && cur.d) { 
			if (cur.o) folderbutton=E("a",props,this.props.opened||"－");//"▼"
			else       folderbutton=E("a",props,this.props.closed||"＋");//"▷"
		} else {
			folderbutton=E("a",{ style:styles.hiddenleaf},"＊");
		}
		return folderbutton;
	}
	,renderCaption:function(n,depth) {
		var cur=this.props.toc[n];
		var stylename="caption";
		var defaultCaption="";
		var t=cur.t;
		if (this.props.conv) t=this.props.conv(t)||t;
		if (n==0) defaultCaption=this.props.treename;

		if (this.props.selected.indexOf(n)>-1) stylename="selectedcaption";
		var caption=null;
		if (this.props.deleting===n) {
			caption=this.renderDeleteButton(n);
		} else if (this.props.editcaption===n) {
			var size=cur.t.length+2;
			if (size<5) size=5;
			caption=E("input",{onKeyDown:this.editingkeydown,style:styles.input,
				               size:size,ref:"editcaption",defaultValue:t});
		} else {
			if (t.length<5) t=t+"  ";
			var style=JSON.parse(JSON.stringify(styles[stylename]));

			if (this.props.nodeicons) {
				var nodeicon=getNodeIcon(depth,this.props.nodeicons);
				if (typeof nodeicon=="string") style.backgroundImage="url("+nodeicon+")";
				style.backgroundRepeat="no-repeat";
			}

			caption=E("span",{onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave,
				className:this.props.captionClass,style:style,title:n},(defaultCaption||t)+(cur.o?" ":""));
			//force caption to repaint by appending extra space at the end
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
		if (this.props.editcaption===n && n>0) {	
			var enabled=manipulate.enabled([n],this.props.toc);
			return E(Controls,{action:this.props.action,enabled:enabled});
		} 
	}
	,renderItem:function(e,idx){
		var t=this.props.toc[e];
		var props={};
		for (var i in this.props) {
			props[i]=this.props[i];
		}
		var opened=t.o?"o":"";
		props.key="k"+e;
		props.cur=e;
		return E(TreeNode,props);
	}
	,clickhit:function(e) {
		var n=parseInt(e.target.dataset.n);
		this.props.action("hitclick",n);
		e.preventDefault();
		e.stopPropagation();
	}
	,renderHit:function(hit,n) {
		if (!hit) return;
		return E("span",{onClick:this.clickhit,style:styles.hit,"data-n":n,className:"treenode_hit",
			onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave},hit);
	}
	,render:function() {
		if (this.props.toc.length===0) return E("span",{},"");
		var n=this.props.cur;
		var cur=this.props.toc[n];
		var stylename="childnode",children=[];
		var selected=this.props.selected.indexOf(n)>-1;
		var nodeicon="";
		if (this.props.nodeicons&&typeof this.props.nodeicons[0]!=="string"){
			var nodeicon=getNodeIcon(cur.d,this.props.nodeicons);	
		}
		
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) stylename="rootnode";
		var adding_before_controls=this.renderAddingNode(-n,true);
		var adding_after_controls=this.renderAddingNode(n);
		var editcontrols=this.renderEditControls(n);
		var folderbutton=this.renderFolderButton(n);
		var caption=this.renderCaption(n,cur.d);

		if (cur.o) children=enumChildren(this.props.toc,n);

		var extracomponent=this.props.opts.onNode&& this.props.opts.onNode(cur,selected,n,this.props.editcaption);
		if (this.props.deleting>-1) extracomponent=null;
		if (this.props.deleting>-1) editcontrols=null;
		var hitcount=treenodehits(this.props.toc,this.props.hits,n);
		var s=styles[stylename];
		if (this.props.opts.rainbow&& stylename=="childnode") {
			s=JSON.parse(JSON.stringify(styles[stylename]));
			s.left="";//no ident
			var angle=(cur.d+1)*30;
			if (cur.f) {
				s.fontFamily=cur.f;
			} else {
				s.fontFamily=this.props.opts.font||"system";
			}
			s.background="hsl("+angle+",40%,50%)";
		}

		return E("div",{onClick:this.select,"data-n":n,style:s,className:"treenode_lv"+cur.d},

			   adding_before_controls,
			   folderbutton,nodeicon,depthdeco,
			   editcontrols,
			   caption,
			   this.renderHit(hitcount,n),
			   extracomponent,
			   adding_after_controls,
			   children.map(this.renderItem));
	}
});

var getNodeIcon=function(depth,nodeicons) {
	if (!nodeicons) return;
	if (!nodeicons[depth]) return nodeicons[nodeicons.length-1];//return last icon
	return nodeicons[depth];
}
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