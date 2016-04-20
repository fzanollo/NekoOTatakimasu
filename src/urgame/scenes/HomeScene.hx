package urgame.scenes;

import flambe.display.ImageSprite;
import flambe.Entity;
import flambe.System;
import ui.ButtonBehaviour;
import urgame.scenes.FlowManager.SceneID;

class HomeScene extends FlowScene
{

	public function new(ctx:NekoContext, opaque:Bool=true) {
		super(ctx, opaque);
	}
	
	override public function onAdded() {
		super.onAdded();
		
		//Background
        var background = new ImageSprite(ctx.pack.getTexture("menu_background"));
        baseEntity.addChild(new Entity().add(background));
		
		//Play button
		var play = new Entity();
		var playSprite = new ImageSprite(ctx.pack.getTexture("buttons/PlayBig"));
		playSprite.centerAnchor().setXY(System.stage.width * 1 / 2, System.stage.height * 1 / 2);
		var playBehaviour = new ButtonBehaviour();
		playBehaviour.setHandler(function(pointerEvent) {
			ctx.flowManager.enterScene(SceneID.LevelSelection);
		});
		play.add(playSprite).add(playBehaviour);
		baseEntity.addChild(play);
		
		//Credits button
		var credits = new Entity();
		var creditsSprite = new ImageSprite(ctx.pack.getTexture("buttons/Play"));
		creditsSprite.setScale(0.5);
		creditsSprite.centerAnchor().setXY(System.stage.width-creditsSprite.texture.width*3/2,System.stage.height-creditsSprite.texture.height/3 - 5);
		var creditsBehaviour = new ButtonBehaviour();
		creditsBehaviour.setHandler(function(pointerEvent){
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.flowManager.enterScene(SceneID.Credits);
        });
		credits.add(creditsSprite).add(creditsBehaviour);
        baseEntity.addChild(credits);
		
		//Options button
		var options = new Entity();
		var optionsSprite = new ImageSprite(ctx.pack.getTexture("buttons/Play"));
		optionsSprite.centerAnchor().setXY(System.stage.width-optionsSprite.texture.width/2 - 15,System.stage.height-optionsSprite.texture.height/2 - 5);
		
		var optionsBehaviour = new ButtonBehaviour(); 
		optionsBehaviour.setHandler(function (pointerEvent) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.flowManager.enterScene(SceneID.Options);
        });
		options.add(optionsSprite).add(optionsBehaviour);
        baseEntity.addChild(options);
	}
}