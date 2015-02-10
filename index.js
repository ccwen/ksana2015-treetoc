/*
   toc data format
   array of { d:depth, o:opened, t:text, n:next_same_level ]

   only first level can be 0
*/
var React=require("react");
var E=React.createElement;
var TreeToc=React.createClass({
	propTypes:{
		data:React.PropTypes.array.isRequired
		,cur:React.PropTypes.number.isRequired
	}
	,getDefaultProps:function() {
		return {cur:0};
	}
	,renderItem:function(e,idx){
		var t=this.props.data[e];
		return E(TreeToc,{key:"k"+idx,cur:e,data:this.props.data,opts:this.props.opts});
	}
	,click:function(e) {
		var n=parseInt(e.target.parentElement.attributes['data-n'].value);
		this.props.data[n].o=!this.props.data[n].o;
		this.forceUpdate();
		e.preventDefault();
        e.stopPropagation();
	}
	,clearSelected:function() {
		for (var i=0;i<this.props.data.length;i++) {
			if (this.props.data[i].s) (this.props.data[i].s)=false;
		}
	}
	,findRoot:function() { //this is not good
		var root=this;
		while (root._owner && typeof root._owner.props.cur!="undefined") {
			if (root._owner.props.cur!==0) root=root._owner;
			else break;
		}
		return root;
	}
	,select:function(e){
		var n=parseInt(e.target.parentElement.attributes['data-n'].value);
		var s=!this.props.data[n].s;
		if (!e.ctrlKey) this.clearSelected();
		this.props.data[n].s=s;
		var root=this.findRoot();
		root.forceUpdate();
		e.preventDefault();
        e.stopPropagation();
	}
	,render:function() {
		var cur=this.props.data[this.props.cur];
		var opened="",selected="",extra="",children=[];
		var folderbutton=null;
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) extra=" treetoc";
		if (cur.s) selected=" selected";
		if (cur.c) { 
			if (cur.o) {
				opened=" opened";
				children=enumChildren(this.props.data,this.props.cur);
				folderbutton=E("button",{onClick:this.click},"－");
			}
			else {
				folderbutton=E("button",{onClick:this.click},"＋");
				opened=" closed";
			}
		} else {
			folderbutton=E("span",{},"　　");
		}

		return E("div",{onClick:this.select,"data-n":this.props.cur,className:"childnode"+opened+extra},
			   folderbutton,depthdeco,
			   E("span",{className:selected},cur.t),
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
var buildToc = function(toc) {
	if (!toc || !toc.length) return;  
	var depths=[];
 	var prev=0;
 	if (toc.length>1) {
 		toc[0].c=true;
 		toc[0].o=true;//opened
 	}
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
	    if (i<toc.length-1 && (toc[i+1].d||toc[i+1].depth)>depth) {
	      toc[i].c=true;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
}
var enumAncestors=function(toc,cur) {
    if (!toc || !toc.length) return;
    if (cur==0) return [];
    var n=cur-1;
    var depth=toc[cur].d||toc[cur].depth - 1;
    var parents=[];
    while (n>=0 && depth>0) {
      if (toc[n].d||toc[n].depth==depth) {
        parents.unshift(n);
        depth--;
      }
      n--;
    }
    parents.unshift(0); //first ancestor is root node
    return parents;
}

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
var genToc=function(toc,title) {
    var out=[{depth:0,text:title||ksana.js.title}];
    if (toc.texts) for (var i=0;i<toc.texts.length;i++) {
      out.push({t:toc.texts[i],d:toc.depths[i], voff:toc.vpos[i]});
    }
    return out; 
}
module.exports={component:TreeToc,genToc:genToc,enumChildren:enumChildren,enumAncestors:enumAncestors,buildToc:buildToc};