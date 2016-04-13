//
// Flambe - Rapid game development
// https://github.com/aduros/flambe/blob/master/LICENSE.txt

package urgame;

import flambe.Entity;
import flambe.swf.Library;
import flambe.swf.MoviePlayer;
import flambe.System;
import flambe.animation.Ease;
import flambe.display.FillSprite;
import flambe.display.ImageSprite;
import flambe.display.Sprite;
import flambe.util.Promise;
import urgame.NekoContext;
import ui.ButtonBehaviour;

class HomeScene
{
    /** Creates the main menu scene. */
    public static function create (ctx :NekoContext) :Entity
    {
        var scene = new Entity();
		
		//Background
        var background = new ImageSprite(ctx.pack.getTexture("menu_background"));
        scene.addChild(new Entity().add(background));
		
		//Play button
		var play = new Entity();
		var playSprite = new ImageSprite(ctx.pack.getTexture("buttons/PlayBig"));
		playSprite.centerAnchor().setXY(System.stage.width * 1 / 2, System.stage.height * 1 / 2);
		var playBehaviour = new ButtonBehaviour();
		playBehaviour.setHandler(function(pointerEvent) {
			ctx.enterLevelSelectionScene();
		});
		play.add(playSprite).add(playBehaviour);
		scene.addChild(play);
		
		//Credits button
		var credits = new Entity();
		var creditsSprite = new ImageSprite(ctx.pack.getTexture("buttons/Play"));
		creditsSprite.setScale(0.5);
		creditsSprite.centerAnchor().setXY(System.stage.width-creditsSprite.texture.width*3/2,System.stage.height-creditsSprite.texture.height/3 - 5);
		var creditsBehaviour = new ButtonBehaviour();
		creditsBehaviour.setHandler(function(pointerEvent){
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterCreditsScene();
        });
		credits.add(creditsSprite).add(creditsBehaviour);
        scene.addChild(credits);
		
		//Options button
		var options = new Entity();
		var optionsSprite = new ImageSprite(ctx.pack.getTexture("buttons/Play"));
		optionsSprite.centerAnchor().setXY(System.stage.width-optionsSprite.texture.width/2 - 15,System.stage.height-optionsSprite.texture.height/2 - 5);
		
		var optionsBehaviour = new ButtonBehaviour(); 
		optionsBehaviour.setHandler(function (pointerEvent) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterOptionsScene();
        });
		options.add(optionsSprite).add(optionsBehaviour);
        scene.addChild(options);
		
        return scene;
    }
}