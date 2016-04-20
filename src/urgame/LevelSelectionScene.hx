package urgame;

import flambe.display.FillSprite;
import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;
import ui.ButtonBehaviour;
import urgame.neko.KanaManager;

class LevelSelectionScene
{
	private var ctx:NekoContext;
	
	/** Creates the scene where you choose levels. */
	public static function create(ctx :NekoContext):Entity 
	{
		this.ctx = ctx;
		
		var scene = new Entity();
		
		scene.add(new ImageSprite(ctx.pack.getTexture('options_background')));
		
		//make them choose hiragana or katakana
		var hiraganaOrKatakanaOption = createHiraganaOrKatakanaOptionPrompt();
		scene.addChild(hiraganaOrKatakanaOption);
		
		return scene;
	}
	
	private function createHiraganaOrKatakanaOptionPrompt():Entity {
		var entity = new Entity();
		entity.add(new ImageSprite(ctx.pack.getTexture("HiraganaKatakanaPromptBackground")));
		
		/*HIRAGANA BUTTON */
		var hiraganaButton = new Entity();
		var hiraganaBackground = new ImageSprite(ctx.pack.getTexture("HiraganaKatakanaChoiceBackground"));
		var hiraganaBB = new ButtonBehaviour();
		
		hiraganaBB.setHandler(function(_) {
			ctx.kanaManager.setSyllabary(KanaManager.HIRAGANA);
			erasePrompt();
		});
		
		hiraganaButton.add(hiraganaBackground).add(hiraganaBB);
		
		/*KATAKANA BUTTON */
		var katakanaButton = new Entity();
		var katakanaBackground = new ImageSprite(ctx.pack.getTexture("HiraganaKatakanaChoiceBackground"));
		var katakanaBB = new ButtonBehaviour();
		
		katakanaBB.setHandler(function(_) {
			ctx.kanaManager.setSyllabary(KanaManager.KATAKANA);
		});
		
		katakanaButton.add(katakanaBackground).add(katakanaBB);
		
		return entity;
	}
	
	private function erasePrompt() {
		scene.
	}
	
	private function makeButtonsGrid() {
		//add a button for each level
		var buttonTexture = ctx.pack.getTexture("buttons/ButtonBackground");
		var halfLevels = Math.floor(ctx.levelMax/2);
		
		for (i in 0...halfLevels+1) {
			for (j in 0...halfLevels+1) {
				var buttonEntity = new Entity();
				
				var buttonBackground = new ImageSprite(buttonTexture);
				var buttonBackgroundWidth = buttonBackground.getNaturalWidth();
				var buttonBackgroundHeight = buttonBackground.getNaturalHeight();
				
				var levelNumber = (2 * j + 1 * i) + 1;
				
				buttonBackground.pointerDown.connect(function(_) {
					ctx.enterPlayingScene(levelNumber);
				});
				
				var buttonText = new TextSprite(ctx.lightFont, Std.string(levelNumber));
				buttonText.centerAnchor().setXY(buttonBackgroundWidth / 2, buttonBackgroundHeight / 2);
				
				//buttonEntity.addChild(new Entity().add(buttonBackground));
				buttonEntity.add(buttonBackground);
				buttonEntity.addChild(new Entity().add(buttonText));
				
				buttonEntity.get(ImageSprite).setXY(buttonBackgroundWidth * i, buttonBackgroundHeight * j);
				scene.addChild(buttonEntity);
			}
		}
	}
}