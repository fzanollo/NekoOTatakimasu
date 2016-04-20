package urgame.scenes;

import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;
import flambe.System;
import ui.ButtonBehaviour;
import urgame.NekoContext;
import urgame.scenes.FlowManager.SceneID;

class OptionsScene extends FlowScene
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
		var label = new TextSprite(ctx.lightFont, "Options");
        label.setWrapWidth(System.stage.width).setAlign(Center);
        label.y._ = System.stage.height / 3 - 100;
		
		baseEntity.addChild(new Entity().add(label));
		
		//Volume button
		var volume = new Entity();
        var volumeSprite = new ImageSprite(ctx.pack.getTexture("buttons/Volume"));
        volumeSprite.centerAnchor().setXY(System.stage.width * 1 / 2, System.stage.height * 1 / 2);
		var volumeBehaviour = new ButtonBehaviour();
        volumeBehaviour.setHandler(function (pointerEvent) {
			if (ctx.muted == false) {
				System.volume._ = 0;
				ctx.muted = true;
			} else {
				System.volume._ = 1;
				ctx.muted = false;
			};
        });
		volume.add(volumeSprite).add(volumeBehaviour);
		baseEntity.addChild(volume);
		
		
		//Home button
		var home = new Entity();
		var homeSprite = new ImageSprite(ctx.pack.getTexture("buttons/Home"));
		homeSprite.centerAnchor().setXY(System.stage.width-homeSprite.texture.width/2 - 15,System.stage.height-homeSprite.texture.height/2 - 5);
		var homeBehaviour = new ButtonBehaviour();
		homeBehaviour.setHandler(function (pointerEvent) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.flowManager.enterScene(SceneID.Home);
        });
		home.add(homeSprite).add(homeBehaviour);
        baseEntity.addChild(home);
	}
}
