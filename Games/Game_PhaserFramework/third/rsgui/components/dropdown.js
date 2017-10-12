DropDown = function (game, x, y, text) {

  GUIObject.call(this, game, x, y);
  this._extendWidth=48;
  this._text=text;
  this._dropdown=false;
  this._options=['option1','option2','option3','option4'];
  this._selected=this._options[0];
  this._over=0;
  this._outbounds=true;
  this._bgFrame='rsgui-dropdown-bg';
  this._arrow={width:16,height:8};
};
DropDown.prototype = Object.create(GUIObject.prototype);
DropDown.prototype.constructor = DropDown;
DropDown.prototype.update = function() {
  var textheight=this._font.size;
  var py=this.game.input.worldY-this.parent.y-this.y-2*this._radius-2*this._border-textheight;
  this._over=Math.floor(py/textheight);
  if(this._over<0 || this._over> this._options.length)
  this._outbounds=true;
  else this._outbounds=false;
  this._over=Math.min(Math.max(this._over,0), this._options.length-1);
  GUIObject.prototype.update.call(this);
};
DropDown.prototype.draw=function(){
	var b=this._border;
	var r=this._radius;
	var w=this._originWidth;
	var h=this._originHeight;
	var fontcolor=this._font.color;
	var font=this.getFont();
	var textheight=this._font.size;
	this._bmd.cls();
	this._bmd.ctx.lineWidth=b;
	this._bmd.ctx.strokeStyle = this._borderColor;
	//draw background
	if(!this._hasTexture){
		this._bmd.ctx.fillStyle= this._color;
		this._bmd.ctx.roundRect(b, b, w-2*b, 2*r+textheight, r);
		this._bmd.ctx.fill();
		this._bmd.ctx.strokeBorder(b);
	}else{
    var texture=this._texture['bg'];
		this._bmd.generateNinePatchTexture(texture.key,0,0,w,h,r,texture.width,texture.height);
	}
	//draw drop down arrow
	this._bmd.ctx.beginPath();
	this._bmd.ctx.moveTo(w-r-b-16,r+b+4);
	this._bmd.ctx.lineTo(w-r-b, r+b+4);
	this._bmd.ctx.lineTo(w-r-b-8, r+b+textheight-4);
	this._bmd.ctx.closePath();
	this._bmd.ctx.fillStyle="#000";
	this._bmd.ctx.fill();
	//draw options background
	if(this._dropdown){
		if(!this._hasTexture){
			this._bmd.ctx.fillStyle=this._color;
			this._bmd.ctx.roundRect(b,2*r+2*b+textheight,w-2*b, textheight*this._options.length+ 2*r+2*b, r);
			this._bmd.ctx.fill();
			this._bmd.ctx.strokeBorder(b);
		}else{
      var texture=this._texture['bg'];
			this._bmd.generateNinePatchTexture(texture.key,0,2*r+textheight,w,
						textheight*this._options.length+2*r,r,texture.width,texture.height);
		}
		this._bmd.ctx.fillStyle=this._selectColor;
		this._bmd.ctx.fillRect(b,r+b+this._over*textheight+2*r+2*b+textheight,w-2*b,textheight);
		//draw options text
		this._bmd.ctx.save();
		this._bmd.ctx.font=font;
		this._bmd.ctx.fillStyle=fontcolor;
		this._bmd.ctx.textBaseline="top";
		this._bmd.ctx.beginPath();
		this._bmd.ctx.rect(r+b,2*r+2*b+textheight,w-2*r-2*b, textheight*this._options.length+2*r+2*b);
		this._bmd.ctx.closePath();
		this._bmd.ctx.clip();
		for(i=0;i<this._options.length;i++)
			this._bmd.ctx.fillText(this._options[i], r+b, (r+b)+i*textheight+2*r+2*b+textheight);
		this._bmd.ctx.restore();
	}
	//draw selected text;
	this._bmd.ctx.save();
	this._bmd.ctx.font=font;
	this._bmd.ctx.fillStyle=fontcolor;
	this._bmd.ctx.textBaseline="top";
	this._bmd.ctx.beginPath();
	this._bmd.ctx.rect(r+b,r+b,w-2*r-2*b-16,h-2*r-2*b);
	this._bmd.ctx.closePath();
	this._bmd.ctx.clip();
	this._bmd.ctx.fillText(this._selected, r+b,r+b);
	this._bmd.ctx.restore();
}
DropDown.prototype.onInputDownHandler = function (sprite, pointer) {
  var b=this._border;
  var r=this._radius;
  if(this._dropdown){
    if(!this._outbounds)
    this._selected=this._options[this._over];
    this._dropdown=false;
    this._bmd.resize(Math.floor(this.width), 2*r+2*b+this._font.size);
  }else{
    this._dropdown=true;
    this._bmd.resize(Math.floor(this.width),
			this.height+this._font.size*(this._options.length)+4*r+4*b);
  }
  if (this.onInputDown)
  this.onInputDown.dispatch(this, pointer);
  GUIObject.prototype.onInputDownHandler.call(this,sprite,pointer);
};
DropDown.prototype.getType=function(){
	return 'dropdown';
}
DropDown.prototype.setTheme=function(theme){
	GUIObject.prototype.setTheme.call(this,theme);
	this._selectColor=theme.select;
}
DropDown.prototype.blur=function(){
	GUIObject.prototype.blur.call(this);
	this._dropdown=false;
	this._bmd.resize(Math.floor(this.width),2*this._border+2*this._radius+this._font.size);
}
DropDown.prototype.getValue=function(){
	return this._selected;
}
DropDown.prototype.setValue=function(array){
	this._options=array;
}
DropDown.prototype.appendValue=function(data){
	this._options.push(data);
}
DropDown.prototype.removeValue=function(data){
	// Find and remove item from an array
	var i = this._options.indexOf(data);
	if(i != -1) this._options.splice(i, 1);
}
