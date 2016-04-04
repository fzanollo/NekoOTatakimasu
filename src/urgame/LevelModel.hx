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
import urgame.neko.InputManager;
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
		
		createInputTextAndManager(); //nombre de mierda, cambiar
    }
	
	private function createInputTextAndManager() {
		// add ui input text sprite
		inputUITextSprite = new TextSprite(ctx.lightFont, "");
		inputUITextSprite.setXY(System.stage.width / 2 - 40, System.stage.height - ctx.lightFont.size - 10);
		gameUILayer.addChild(new Entity().add(inputUITextSprite));
		
		//input management
		var inputManager = new InputManager();
		inputManager.enterPressed.connect(checkForCoincidence);
		inputManager.currentInput.changed.connect(function(currentInput, _) {
			//update UI input text sprite
			inputUITextSprite.text = currentInput; 
		});
		owner.add(inputManager);
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
		nekoRemover();
    }
	
	private function nekoRemover() {
		var nekoRemove = [];
		
		//check for nekos out of screen
		for (i in 0...nekoArray.length) {
			var neko = nekoArray[i];
			var nekoComponent = neko.get(NekoComponent);
			
			if (nekoComponent.imageSprite.x._ < -nekoComponent.imageSprite.getNaturalWidth()) {
				nekoRemove.push(i);
				trace(nekoArray.length);
			} 
		}
		
		//removes nekos in array
		for (i in 0...nekoRemove.length) {
			nekoArray[nekoRemove[i]].dispose();
			nekoArray.remove(nekoArray[nekoRemove[i]]);
		}
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
