package urgame.scenes;

import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;
import flambe.System;
import ui.ButtonBehaviour;
import urgame.NekoContext;
import urgame.scenes.FlowManager.SceneID;

class CreditsScene extends FlowScene
{
	
	public function new(ctx:NekoContext, opaque:Bool=true) {
		super(ctx, opaque);
		
	}
	
	override public function onAdded() {
		super.onAdded();
		
		//Background
        var background = new ImageSprite(ctx.pack.getTexture("options_background"));
        baseEntity.addChild(new Entity().add(background));
		
		//Title label
		var label = new TextSprite(ctx.lightFont, "Credits");
        label.setWrapWidth(System.stage.width).setAlign(Center);
        label.y._ = System.stage.height / 3 - 100;
		
		baseEntity.addChild(new Entity().add(label));
		
		//Home button
		var home = new Entity();
		var homeSprite = new ImageSprite(ctx.pack.getTexture("buttons/Home"));
		homeSprite.centerAnchor().setXY(System.stage.width-homeSprite.texture.width/2 - 15,System.stage.height-homeSprite.texture.height/2 - 5);
		var homeBehaviour = new ButtonBehaviour();
		homeBehaviour.setHandler(function (pointerEvent) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.flowManager.enterScene(SceneID.Home);
        });
		
        baseEntity.addChild(home);
	}
}
