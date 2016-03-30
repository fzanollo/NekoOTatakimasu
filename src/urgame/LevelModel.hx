package urgame;

import flambe.Component;
import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;
import flambe.input.Key;
import flambe.script.CallFunction;
import flambe.script.Delay;
import flambe.script.Repeat;
import flambe.script.Script;
import flambe.script.Sequence;
import flambe.System;
import flambe.util.Value;
import urgame.neko.NekoComponent;
import urgame.NekoContext;

/* TODO:
 * borrar los nekos al pasarse de la pantalla
 * agregar textsprite en pantalla que vaya poniendo el input
 * agregar al kana manager las otras formas aceptadas de romaji
 */

class LevelModel extends Component
{	
    /** The current score. */
    public var score (default, null) :Value<Int>;
	
	//level dificulty fields
	public var nekoSpawnTime:Float = 4;
	public var nekoMaxSpeed:Int = 2; 

	//layers
	private var worldLayer:Entity;
    private var backgroundLayer :Entity;
    private var nekoLayer :Entity;
    private var kanaLayer :Entity;
	private var gameUILayer:Entity;

    private var nekoArray :Array<Entity>;
    private var ctx :NekoContext;
	
	private var currentInput:String = "";
	private var inputUITextSprite:TextSprite;

    public function new (ctx :NekoContext){
        this.ctx = ctx;
        nekoArray = [];
        score = new Value<Int>(0);
    }

    override public function onAdded () {
		owner.addChild(worldLayer = new Entity());
		
		//background
        backgroundLayer = new Entity().add(new ImageSprite(ctx.pack.getTexture("wood_background")));
        worldLayer.addChild(backgroundLayer);
		
		//layers
        backgroundLayer.addChild(nekoLayer = new Entity());
        backgroundLayer.addChild(kanaLayer = new Entity());
        backgroundLayer.addChild(gameUILayer = new Entity());
		
		//spawn script
		var spawnScript = new Script();
		worldLayer.add(spawnScript);
		spawnScript.run(new Repeat(new Sequence([
			new Delay(nekoSpawnTime),
			new CallFunction(nekoMaker)
		])));
		
		//connect to keyboard events
		System.keyboard.up.connect(function(keyboardEvent) {
			switch (keyboardEvent.key) {
				case Key.Enter:
					if (currentInput.length > 0) {
						checkForCoincidence(currentInput);
						currentInput = "";
						trace('ENTER PRESSED');
					}
				
				case Key.Backspace:
					if (currentInput.length > 0) {
						var deleted = currentInput.substring(currentInput.length - 1, currentInput.length); //for debug
						currentInput = currentInput.substring(0, currentInput.length - 1);
						trace('BACKSPACE PRESSED, DELETED: $deleted');
					}
				
				case Key.Unknown(keyCode):
					//unknown key, ignoring
				
				default:
					var key = keyboardEvent.key.getName();
					if (key.length == 1) {
						//por ahora ponele que es eso, es para evitar SHIFT, etc TODO hacer bien esta cosa
						currentInput += key;						
					}
					trace('KEY PRESSED:  ${keyboardEvent.key.getName()}');
			}
			//update UI input text sprite
			inputUITextSprite.text = currentInput; 
			//POSIBLE TODO hacer que currentInput sea un value, para conectarse a los cambios y lesto (o no vale la pena?)
		});
		
		createGameUI();
    }
	
	private function createGameUI() {
		// add ui input text sprite
		inputUITextSprite = new TextSprite(ctx.lightFont, currentInput);
		
		inputUITextSprite.setXY(System.stage.width / 2 - 40, System.stage.height - ctx.lightFont.size - 10);
		
		gameUILayer.addChild(new Entity().add(inputUITextSprite));
	}
	
	private function checkForCoincidence(input:String) {
		trace('CHECHING FOR COINCIDENCE');
		for (i in 0...nekoArray.length) {
			var neko = nekoArray[i];
			var nekoComponent = neko.get(NekoComponent);
			
			trace('COMPARING: ${nekoComponent.getRomaji()}  WITH:  $input');
			if (nekoComponent.getRomaji() == input) { //si coincide
				nekoArray.splice(i, 1);
				neko.dispose();
				
				score._ += 10;
				break;
			}
		}
	}

    override public function onUpdate (dt :Float)
    {
		
    }
	
	private function nekoMaker() {
		var nekoComponent = new NekoComponent(nekoMaxSpeed, ctx);
		var neko = new Entity().add(nekoComponent);
		
		//add to objects array
		nekoArray.push(neko);
		
		//add to layer
		nekoLayer.addChild(neko);
		
		//move
		nekoComponent.move();
	}
}
