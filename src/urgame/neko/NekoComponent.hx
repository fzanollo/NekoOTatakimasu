package urgame.neko;

import flambe.Component;
import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;
import flambe.System;

class NekoComponent extends Component
{
	public var speed:Int;
	public var hit = false;
	
	private var moving:Bool = false;
	private var romaji:String;
	private var maxY:Int;
	
	private var entity:Entity;
	public var imageSprite:ImageSprite;
	private var textSprite:TextSprite;
	
	private var ctx :NekoContext;
	
	public function new(maxSpeed:Int, ctx :NekoContext) {
		this.ctx = ctx;
		entity = new Entity();
		
		//image at random y
		imageSprite = new ImageSprite(ctx.pack.getTexture("neko"));
		maxY = System.stage.height - Math.floor(imageSprite.getNaturalHeight() / 2);
		imageSprite.setScale(0.6).setXY(System.stage.width, Std.random(maxY));
		
		//text random kana
		textSprite = new TextSprite(ctx.japanFont, KanaManager.getRandomKana());
		textSprite.centerAnchor().setXY(imageSprite.getNaturalWidth() / 2, imageSprite.getNaturalHeight() / 2);
		romaji = KanaManager.getRomanji(textSprite.text);
		
		speed = Std.random(maxSpeed) + 1;
	}
	
	public function move() { moving = true; }
	public function stop() { moving = false; }
	
	public function getRomaji():String {
		return romaji;
	}
	
	override public function onAdded() {
		super.onAdded();
		
		owner.addChild(entity);
		//add neko image
		entity.add(imageSprite);
		//add kana text
		entity.addChild(new Entity().add(textSprite));
	}
	
	override public function onUpdate(dt:Float) {
		super.onUpdate(dt);
		
		if (moving) {
			imageSprite.x._ -= speed;
		}
	}
}