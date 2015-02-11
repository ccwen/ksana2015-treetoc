var lastChild=function(n,toc) {
	var d=toc[n].d;
	n++;
	while (n<toc.length) {
		if (toc[n].d<=d) return n;
		n++;
	}
	return toc.length-1;
}
var levelup =function(sels,toc) { //move select node and descendants one level up
	if (!canLevelup(sels,toc))return;
	var n=sels[0];
	var cur=toc[n];
	var next=toc[n+1];
	var nextsib=cur.n||lastChild(n,toc);
	if (next && next.d>cur.d) { //has child
		for (var i=n+1;i<nextsib;i++) {
			toc[i].d--;
		}
	}
	cur.d--;
	cur.o=true;//force open this node , so that sibling is visible
	return true;
}
var leveldown =function(sels,toc) {
	if (!canLeveldown(sels,toc))return; //move select node and descendants one level down
	var n=sels[0];
	var cur=toc[n];
	var next=toc[n+1];

	//force open previous node as it becomes parent of this node
	var p=prevSibling(n,toc);
	if (p) toc[p].o=true;

	if (next && next.d>cur.d) { //has child
		for (var i=n+1;i<cur.n;i++) {
			toc[i].d++;
		}
	}
	cur.d++;
	return true;
}
var moveup =function(sel,toc) {
	
}
var movedown =function(sel,toc) {
	
}
var add =function(sel,toc) {
	
}
var remove =function(sel,toc) {
	
}
var canAdd=function(sels,toc) {
}
var canRemove=function(sels,toc) {
}
var canMoveup=function(sels,toc) {
}
var canMovedown=function(sels,toc) {
}
var canLevelup=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && toc[n].d>1);
}
var prevSibling=function(n,toc) {
	var p=n-1;
	var d=toc[n].d;
	while (p>0) {
		if (toc[p].d<d) return 0;
		if (toc[p].d==d) return p;
		p--;
	}
}
var canLeveldown=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && prevSibling(n,toc));
}
var enabled=function(sels,toc) {
	var enabled=[];
	if (canLeveldown(sels,toc)) enabled.push("leveldown");
	if (canLevelup(sels,toc)) enabled.push("levelup");
	if (canMoveup(sels,toc)) enabled.push("moveup");
	if (canMovedown(sels,toc)) enabled.push("movedown");
	if (canAdd(sels,toc)) enabled.push("add");
	if (canRemove(sels,toc)) enabled.push("remove");
	return enabled;
}
module.exports={enabled:enabled,levelup:levelup,leveldown:leveldown,moveup:moveup,movedown:movedown,add:add,remove:remove};