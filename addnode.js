var React=require("react");
var E=React.createElement;
var linecount=function(t) {
	var lcount=0;
	t.replace(/\n/g,function(){
		lcount++;
	})
	return lcount+2;
}
var AddNode=React.createClass({
	propTypes:{
		action: React.PropTypes.func.isRequired
	}
	,addingkeydown:function(e) {
		var t=e.target.value;
		if (e.key=="Enter" && t.charCodeAt(t.length-1)==10) {
			this.props.action("addnode",t.trim().split("\n"),this.props.insertBefore);
		}
		var lc=linecount(t);
		e.target.rows=lc;
	}
	,componentDidMount:function() {
		this.refs.adding.getDOMNode().focus();
	}
	,render:function(){
		return E("div", {}, 
			E("textarea",
				{onKeyDown:this.addingkeydown,ref:"adding"
				 ,placeholder:"Enter twice to finish adding",defaultValue:""}
		));
	}

})

module.exports=AddNode;