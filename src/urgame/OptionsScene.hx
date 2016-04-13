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
import flambe.display.TextSprite;
import ui.ButtonBehaviour;
import urgame.NekoContext;

class OptionsScene
{
    /** Creates the main menu scene. */
    public static function create (ctx :NekoContext) :Entity
    {
        var scene = new Entity();
		
		//Background
        var background = new ImageSprite(ctx.pack.getTexture("options_background"));
        scene.addChild(new Entity().add(background));
		
		//Title label
		var label = new TextSprite(ctx.lightFont, "Options");
        label.setWrapWidth(System.stage.width).setAlign(Center);
        label.y._ = System.stage.height / 3 - 100;
		
		scene.addChild(new Entity().add(label));
		
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
		scene.addChild(volume);
		
		
		//Home button
		var home = new Entity();
		var homeSprite = new ImageSprite(ctx.pack.getTexture("buttons/Home"));
		homeSprite.centerAnchor().setXY(System.stage.width-homeSprite.texture.width/2 - 15,System.stage.height-homeSprite.texture.height/2 - 5);
		var homeBehaviour = new ButtonBehaviour();
		homeBehaviour.setHandler(function (pointerEvent) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterHomeScene();
        });
		home.add(homeSprite).add(homeBehaviour);
        scene.addChild(home);
		
        return scene;
    }
}
