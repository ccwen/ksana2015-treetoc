var jsdom = require("jsdom").jsdom;
var assert=require("assert");
global.document=jsdom("<html><head></head><body></body></html>");
global.window=document.parentWindow;
global.navigator = { userAgent: "node-js" }; 
navigator.appVersion = '';
var React=require("react/addons");
var enumChildren=require("..").enumChildren;
var enumAncestors=require("..").enumAncestors;
var buildToc=require("..").buildToc;
var TreeToc=require("..").component;
var TestUtils=React.addons.TestUtils;
var toc1=[{d:0,t:"root"},{d:1,t:"a"},{d:1,t:"b"},{d:1,t:"c"}];
var toc2=[{d:0,t:"root"},{d:1,t:"1"},{d:2,t:"1.1"},{d:2,t:"1.2"},
	          {d:1,t:"2"},{d:2,t:"2.1"},{d:2,t:"2.2"},{d:3,t:"2.2.1"},{d:3,t:"2.2.2"}];

buildToc(toc1);
buildToc(toc2);
it("enumChildren",function() {
	var children=enumChildren(toc1,0);
	assert.equal(children.length,3);

	var children=enumChildren(toc2,0);
	assert.equal(children.length,2);
});

it("one level toc",function() {
	var treetoc=React.createElement(TreeToc,{data:toc1});
	var doc=TestUtils.renderIntoDocument(treetoc);
	var li=TestUtils.scryRenderedDOMComponentsWithClass(doc,"childnode");
	//console.log(doc.getDOMNode().innerHTML)
	assert.equal(li.length,4);
});	

it("multilevel",function() {
	var treetoc=React.createElement(TreeToc,{data:toc2});
	var doc=TestUtils.renderIntoDocument(treetoc);
	var li=TestUtils.scryRenderedDOMComponentsWithClass(doc,"childnode");
	assert.equal(li.length,3);

	var folderbutton=li[1].getDOMNode().children[0];
	TestUtils.Simulate.click(folderbutton);

	/*after open , two more node is added*/
	var li=TestUtils.scryRenderedDOMComponentsWithClass(doc,"childnode");
	assert.equal(li.length,5);

	/* click again to close */
	TestUtils.Simulate.click(folderbutton);
	var li=TestUtils.scryRenderedDOMComponentsWithClass(doc,"childnode");
	assert.equal(li.length,3);

});	
