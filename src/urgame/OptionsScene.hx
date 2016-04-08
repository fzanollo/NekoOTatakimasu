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
        var volume = new ImageSprite(ctx.pack.getTexture("buttons/Volume"));
        volume.centerAnchor().setXY(System.stage.width * 1 / 2, System.stage.height * 1 / 2);
		
        //volume.pointerDown.connect(function (_) {
            ////ctx.pack.getSound("sounds/Coin").play();
        //});
		
		scene.addChild(new Entity().add(volume));
		
		
		//Home button
		var home = new ImageSprite(ctx.pack.getTexture("buttons/Home"));
		home.centerAnchor().setXY(System.stage.width-home.texture.width/2 - 15,System.stage.height-home.texture.height/2 - 5);
		
		home.pointerDown.connect(function (_) {
            //ctx.pack.getSound("sounds/Coin").play();
            ctx.enterHomeScene();
        });
		
        scene.addChild(new Entity().add(home));
		
        return scene;
    }
}
