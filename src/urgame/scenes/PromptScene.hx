package urgame.scenes;

import flambe.Entity;
import flambe.System;
import flambe.animation.Ease;
import flambe.display.FillSprite;
import flambe.display.Font;
import flambe.display.ImageSprite;
import flambe.display.Sprite;
import flambe.display.TextSprite;
import flambe.scene.Scene;
import flambe.util.Promise;
import urgame.NekoContext;
import ui.ButtonBehaviour;

class PromptScene
{
    /** Creates a scene that shows a menu prompt. */
    public static function create (ctx :NekoContext, text :String, buttons :Array<Dynamic>, font:Font, ?scale:Float) :Entity
    {
        var scene = new Entity();
        scene.add(new Scene(false));
		
        var background = new FillSprite(0x000000, System.stage.width, System.stage.height);
        background.alpha.animate(0, 0.5, 0.5);
        scene.addChild(new Entity().add(background));
		
        var label = new TextSprite(font, text);
		if (scale != null) {
			label.setScale(scale);
		}
        label.setWrapWidth(System.stage.width).setAlign(Center);
        label.x.animate(-System.stage.width, 0, 0.5, Ease.backOut);
        label.y._ = System.stage.height/2 - 150;
		
        var labelBackground = new FillSprite(0x000000, System.stage.width, label.getNaturalHeight()+5);
        labelBackground.alpha.animate(0, 0.5, 0.5);
        labelBackground.y._ = label.y._;
		
        scene.addChild(new Entity().add(labelBackground));
        scene.addChild(new Entity().add(label));
		
        var row = new Entity();
		
        var x = 0.0;
        var ii = 0;
        while (ii < buttons.length) {
            var name = buttons[ii++];
            var handler = buttons[ii++];
			
			// button
			var button = new Entity();
            var buttonSprite = new ImageSprite(ctx.pack.getTexture("buttons/"+name));
            buttonSprite.setXY(x, 0);
			var buttonBehaviour = new ButtonBehaviour();
            buttonBehaviour.setHandler(function (pointerEvent) {
                //ctx.pack.getSound("sounds/Coin").play();
                handler();
            });
            x += buttonSprite.getNaturalWidth() + 20;
			button.add(buttonSprite).add(buttonBehaviour);
            row.addChild(button);
        }
		
        var bounds = Sprite.getBounds(row);
        var sprite = new Sprite();
        sprite.x.animate(System.stage.width, System.stage.width/2 - bounds.width/2, 0.5, Ease.backOut);
        sprite.y._ = label.y._ + label.getNaturalHeight() + 50;
		
        scene.addChild(row.add(sprite));
		
        return scene;
    }
}
