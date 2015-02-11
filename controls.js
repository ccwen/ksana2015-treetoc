var React=require("react");
var E=React.createElement;

var Controls=React.createClass({
	propTypes:{
		enabled:React.PropTypes.array.isRequired
		,action:React.PropTypes.func.isRequired
	}
	,getDefaultProps:function(){
		return {enabled:[]};
	}
	,enb:function(name) {
		return this.props.enabled.indexOf(name)===-1;		
	}
	,act:function(name) {
		var that=this;
		return function(){
			that.props.action(name);
		}
	}
	,render:function() {
		return E("div",{},
			E("button" ,{onClick:this.act("add"),title:"New Node",disabled:this.enb("add")},"＋"),
			E("button"　,{onClick:this.act("remove"),title:"remove Node",disabled:this.enb("remove")},"－"),
			E("button" ,{onClick:this.act("moveup"),title:"Move up",disabled:this.enb("moveup")},"⇧"),
			E("button" ,{onClick:this.act("movedown"),title:"Move down",disabled:this.enb("movedown")},"⇩"),
			E("button" ,{onClick:this.act("levelup"),title:"level -1",disabled:this.enb("levelup")},"⇠"),
			E("button" ,{onClick:this.act("leveldown"),title:"level +1",disabled:this.enb("leveldown")},"⇢")
		);
	}
})

module.exports=Controls;