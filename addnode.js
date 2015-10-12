var React=require("react");
var E=React.createElement;
var styles={
	textarea:{fontSize:"100%"}
}
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
		if (e.key=="Enter" && t.charCodeAt(t.length-1)===10) {
			this.props.action("addnode",t.split("\n"),this.props.insertBefore);
		}
		var lc=linecount(t);
		e.target.rows=lc;
	}
	,componentDidMount:function() {
		this.refs.adding.focus();
	}
	,render:function(){
		return E("div", {}, 
			E("textarea",
				{style:styles.textarea,onKeyDown:this.addingkeydown,ref:"adding"
				 ,placeholder:"leading space to create child node",defaultValue:""}
		));
	}

})

module.exports=AddNode;