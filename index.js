/*
   toc data format
   array of { d:depth, o:opened, t:text, n:next_same_level ]

   only first level can be 0
*/
var React=require("react");
var TreeNode=require("./treenode");
var Controls=require("./controls");
var E=React.createElement;
var manipulate=require("./manipulate");

var buildToc = function(toc) {
	if (!toc || !toc.length) return;  
	var depths=[];
 	var prev=0;
 	if (toc.length>1) {
 		toc[0].o=true;//opened
 	}
 	for (var i=0;i<toc.length;i++) delete toc[i].n;
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
}
var genToc=function(toc,title) {
    var out=[{depth:0,text:title||ksana.js.title}];
    if (toc.texts) for (var i=0;i<toc.texts.length;i++) {
      out.push({t:toc.texts[i],d:toc.depths[i], voff:toc.vpos[i]});
    }
    return out; 
}
var TreeToc=React.createClass({
	propTypes:{
		data:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
	}
	,getInitialState:function(){
		return {editcaption:-1,selected:[],enabled:[]};
	}
	,action:function() {
		var args=Array.prototype.slice.apply(arguments);
		var act=args.shift();
		var p1=args[0];
		var p2=args[1];
		var sels=this.state.selected;
		var toc=this.props.data;
		var r=false;
		if (act==="updateall") {
			this.setState({editcaption:-1,deleting:-1});
		} else if (act==="editcaption") {
			this.setState({editcaption:parseInt(p1),enabled:[]});
		} else if (act==="deleting") {
			this.setState({deleting:this.state.editcaption});
		} else if (act==="changecaption") {
			if (!this.state.editcaption===-1) return;
			if (!p1) {
				this.action("deleting");
			} else {
				this.props.data[this.state.editcaption].t=p1;
				var enabled=manipulate.enabled(this.state.selected,this.props.data);
				this.setState({editcaption:-1,enabled:enabled});
			}
		} else if (act==="select") {
			var selected=this.state.selected;
			if (!(this.props.opts.multiselect && p2)) {
				selected=[];
			}
			var n=parseInt(p1);
			if (n>0) selected.push(n);
			var enabled=manipulate.enabled(selected,toc);
			this.setState({selected:selected,editcaption:-1,enabled:enabled,deleting:-1});
		} else if (act==="levelup") r=manipulate.levelup(sels,toc);
		else if (act==="leveldown") r=manipulate.leveldown(sels,toc);
		else if (act==="add") r=manipulate.addnode(sels,toc);
		else if (act==="remove") r=manipulate.removenode(sels,toc);
		if (r) {
			buildToc(toc);
			var enabled=manipulate.enabled(this.state.selected,this.props.data);
			this.setState({enabled:enabled});
		}
	}
	,render:function() {
		var controls=null;
		if (this.props.opts.editable) controls=E(Controls,{action:this.action,enabled:this.state.enabled});
		return E("div",{},controls,
			E(TreeNode,{data:this.props.data,
				editcaption:this.state.editcaption,
				deleting:this.state.deleting,
				selected:this.state.selected,
				action:this.action,opts:this.props.opts,cur:0}));
	}
})
module.exports={component:TreeToc,genToc:genToc,buildToc:buildToc};