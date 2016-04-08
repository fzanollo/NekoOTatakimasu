package urgame;

import flambe.display.FillSprite;
import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;

class LevelSelectionScene
{
	/** Creates the scene where you choose levels. */
	public static function create(ctx :NekoContext):Entity 
	{
		var scene = new Entity();
		
		//add a button for each level
		var buttonTexture = ctx.pack.getTexture("buttons/ButtonBackground");
		
		for (i in 0...2) {
			for (j in 0...2) {
				var buttonEntity = new Entity();
				
				var buttonBackground = new ImageSprite(buttonTexture);
				var buttonBackgroundWidth = buttonBackground.getNaturalWidth();
				var buttonBackgroundHeight = buttonBackground.getNaturalHeight();
				
				buttonBackground.pointerDown.connect(function(_) {
					ctx.enterPlayingScene();
				});
				
				var levelNumber = (2 * j + 1 * i) + 1;
				var buttonText = new TextSprite(ctx.lightFont, Std.string(levelNumber));
				buttonText.centerAnchor().setXY(buttonBackgroundWidth / 2, buttonBackgroundHeight / 2);
				
				//buttonEntity.addChild(new Entity().add(buttonBackground));
				buttonEntity.add(buttonBackground);
				buttonEntity.addChild(new Entity().add(buttonText));
				
				buttonEntity.get(ImageSprite).setXY(buttonBackgroundWidth * i, buttonBackgroundHeight * j);
				scene.addChild(buttonEntity);
			}
		}
		
		return scene;
	}
}