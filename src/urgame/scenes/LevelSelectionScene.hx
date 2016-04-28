package urgame.scenes;

import flambe.display.ImageSprite;
import flambe.display.Sprite;
import flambe.display.TextSprite;
import flambe.Entity;
import flambe.System;
import haxe.Json;
import ui.ButtonBehaviour;
import urgame.neko.KanaManager;
import urgame.scenes.FlowManager.SceneID;

class LevelSelectionScene extends FlowScene
{
	private var hiraganaOrKatakanaOption:Entity;
	private var hiraganaGrid:Entity;
	private var katakanaGrid:Entity;
	
	public function new(ctx:NekoContext, opaque:Bool=true) {
		super(ctx, opaque);
		
	}
	
	override public function onAdded() {
		super.onAdded();
		
		//background
		baseEntity.add(new ImageSprite(ctx.pack.getTexture('options_background')));
		
		//make them choose hiragana or katakana
		hiraganaOrKatakanaOption = createHiraganaOrKatakanaOptionPrompt();
		baseEntity.addChild(hiraganaOrKatakanaOption);
		
		//add 'go back to home' button
		var homeSprite = new ImageSprite(ctx.pack.getTexture('buttons/Home'));
		homeSprite.setXY(System.stage.width - homeSprite.getNaturalWidth(), System.stage.height - homeSprite.getNaturalHeight());
		
		var homeBB = new ButtonBehaviour();
		homeBB.setHandler(function(_) {
			ctx.flowManager.enterScene(SceneID.Home);
		});
		
		var homeButton = new Entity().add(homeSprite).add(homeBB);
		
		baseEntity.addChild(homeButton);
	}
	
	private function createHiraganaOrKatakanaOptionPrompt():Entity {
		var promptEntity = new Entity();
		
		var promptBackground = new ImageSprite(ctx.pack.getTexture("HiraganaKatakanaPromptBackground"));
		promptBackground.centerAnchor().setXY(System.stage.width / 2, System.stage.height / 2);
		promptEntity.add(promptBackground);
		
		/*HIRAGANA BUTTON */
		var hiraganaButtonEntity = createHiraganaOrKatakanaButton(KanaManager.HIRAGANA);
		hiraganaButtonEntity.getFromChildren(ImageSprite).setXY(20, 20);
		
		/*KATAKANA BUTTON */
		var katakanaButtonEntity = createHiraganaOrKatakanaButton(KanaManager.KATAKANA);
		katakanaButtonEntity.getFromChildren(ImageSprite).setXY(270, 20); //hardcoded por ahora
		
		promptEntity.addChild(hiraganaButtonEntity).addChild(katakanaButtonEntity);
		
		return promptEntity;
	}
	
	private function createHiraganaOrKatakanaButton(syllabary:String):Entity {
		var buttonEntity = new Entity();
		
		var background = new ImageSprite(ctx.pack.getTexture("HiraganaKatakanaChoiceBackground"));
		
		var text = new TextSprite(ctx.darkFont, syllabary);
		text.centerAnchor().setXY(background.getNaturalWidth() / 2, 40);
		buttonEntity.addChild(new Entity().add(text));
		
		var kana = new TextSprite(ctx.japanFont, (syllabary == KanaManager.HIRAGANA ? 'あ' : 'ア'));
		kana.centerAnchor().setXY(background.getNaturalWidth() / 2, background.getNaturalHeight() / 2);
		buttonEntity.addChild(new Entity().add(kana));
		
		var buttonBehaviour = new ButtonBehaviour();
		buttonBehaviour.setHandler(function(_) {
			ctx.kanaManager.setSyllabary(syllabary);
			makeButtonsGrid(syllabary);
			erasePrompt();
		});
		
		buttonEntity.add(background).add(buttonBehaviour);
		return buttonEntity;
	}
	
	private function erasePrompt() {
		baseEntity.removeChild(hiraganaOrKatakanaOption);
	}
	
	private function makeButtonsGrid(syllabary:String) {
		//add a button for each level
		var gridEntity = new Entity();
		var buttonTexture = ctx.pack.getTexture("buttons/ButtonBackground");
		var maxLevel = (ctx.kanaManager.getSyllabary() == KanaManager.HIRAGANA) ? ctx.hiraganaMaxLevel : ctx.katakanaMaxLevel;
		
		var columnsQty = 7; //TODO calcular a partir de la cantidad de niveles
		
		for (i in 0...maxLevel) {
			var buttonEntity = new Entity();
			
			var buttonBackground = new ImageSprite(buttonTexture);
			var buttonBackgroundWidth = buttonBackground.getNaturalWidth(); //TODO calcular un resize a partir de la cantidad de niveles
			var buttonBackgroundHeight = buttonBackground.getNaturalHeight();
			
			var levelNumber = i + 1;
			
			buttonBackground.pointerDown.connect(function(_) {
				var args = Json.parse('{"levelNumber": $levelNumber}');
				ctx.flowManager.enterScene(SceneID.Playing, true, args);
			});
			
			var buttonText = new TextSprite(ctx.lightFont, Std.string(levelNumber));
			buttonText.centerAnchor().setXY(buttonBackgroundWidth / 2, buttonBackgroundHeight / 2);
			
			buttonEntity.add(buttonBackground);
			buttonEntity.addChild(new Entity().add(buttonText));
			
			var columnNumber = Math.floor(i % columnsQty);
			var rowNumber = Math.floor(i / columnsQty);
			
			buttonEntity.get(ImageSprite).setXY(buttonBackgroundWidth * columnNumber + 10 * columnNumber, buttonBackgroundHeight * rowNumber + 25 * rowNumber);
			gridEntity.addChild(buttonEntity);
		}
		
		//center the grid on the screen
		gridEntity.add(new Sprite().setXY(20, 60)); //TODO calcular a partir de la cantidad de niveles
		
		baseEntity.addChild(gridEntity);
	}
}