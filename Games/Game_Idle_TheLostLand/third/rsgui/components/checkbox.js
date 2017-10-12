
CheckBox = function (game, x, y, text) {
	GUIObject.call(this, game, x, y);

	this._seprate=2;
	this._text=text;
	this._check=false;
	this._onFrame = "rsgui-checkbox-on";
	this._offFrame = "rsgui-checkbox-off";
	this._frame='on';
};
CheckBox.prototype = Object.create(GUIObject.prototype);
CheckBox.prototype.constructor = CheckBox;
CheckBox.prototype.draw=function(){
	var b=this._border;
	var r=this._radius;
	var w=this.width/this.scale.x;
	var h=this.height/this.scale.y;
	var c=h+this._seprate;
	var fontcolor=this._font.color;
	var font=this.getFont();
	this._bmd.cls();
	this._bmd.ctx.strokeStyle = this._borderColor;
	if(!this._hasTexture){
		//draw checkbox background
		this._bmd.ctx.fillStyle= this._color;
		this._bmd.ctx.roundRect(b+r, b+r, h-2*r-2*b, h-2*r-2*b, r, true);
		this._bmd.ctx.fill();
		//draw check on mark
		if(this._check){
			this._bmd.ctx.fillStyle= this._checkColor;
			this._bmd.ctx.beginPath();
			this._bmd.ctx.arc(h/2,h/2,h/4,0,2*Math.PI);
			this._bmd.ctx.closePath();
			this._bmd.ctx.fill();
		}
	}else{
		var texture=this._texture[this._frame];
		this._bmd.copy(texture.key,0,0,texture.width,texture.height,0,0,h,h);
	}
	//draw text
	this._bmd.ctx.font=font;
	this._bmd.ctx.fillStyle=fontcolor;
	this._bmd.ctx.textBaseline="middle"
	this._bmd.ctx.fillText(this._text, c, h/2);
}
CheckBox.prototype.onInputDownHandler = function (sprite, pointer) {
	if(this._check) this.uncheck();
	else this.check();
	GUIObject.prototype.onInputDownHandler.call(this,sprite,pointer);
};
CheckBox.prototype.getType=function(){
	return 'checkbox';
}
CheckBox.prototype.check=function(){
	this._check=true;
	this._frame='on';
}
CheckBox.prototype.uncheck=function(){
	this._check=false;
	this._frame='off';
}
CheckBox.prototype.setTheme=function(theme){
	this._checkColor=theme.check;
	this._extendWidth=this._font.size+this._seprate;
	GUIObject.prototype.setTheme.call(this,theme);
}
CheckBox.prototype.getValue=function(){
	return this._check;
}
CheckBox.prototype.setText=function(text){
	this._text=text;
	this.fit();
}
