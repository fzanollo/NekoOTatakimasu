//
// Flambe - Rapid game development
// https://github.com/aduros/flambe/blob/master/LICENSE.txt

package urgame;

import flambe.Entity;
import flambe.System;
import flambe.animation.Ease;
import flambe.display.FillSprite;
import flambe.display.ImageSprite;
import flambe.display.Sprite;
import flambe.util.Promise;
import urgame.NekoContext;

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
        var play = new ImageSprite(ctx.pack.getTexture("buttons/PlayBig"));
        play.centerAnchor().setXY(System.stage.width * 1 / 2, System.stage.height * 1 / 2);
		
        play.pointerDown.connect(function (_) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterLevelSelectionScene();
        });
		
		scene.addChild(new Entity().add(play));
		
		//Credits button
		var credits = new ImageSprite(ctx.pack.getTexture("buttons/Play"));
		credits.setScale(0.5);
		credits.centerAnchor().setXY(System.stage.width-credits.texture.width*3/2,System.stage.height-credits.texture.height/3 - 5);
		
		credits.pointerDown.connect(function (_) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterCreditsScene();
        });
		
        scene.addChild(new Entity().add(credits));
		
		//Options button
		var options = new ImageSprite(ctx.pack.getTexture("buttons/Play"));
		options.centerAnchor().setXY(System.stage.width-options.texture.width/2 - 15,System.stage.height-options.texture.height/2 - 5);
		
		options.pointerDown.connect(function (_) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterOptionsScene();
        });
		
        scene.addChild(new Entity().add(options));
		
        return scene;
    }
}