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
import flambe.util.SignalConnection;
import flambe.util.Value;
import urgame.neko.InputManager;
import urgame.neko.KanaManager;
import urgame.neko.NekoComponent;
import urgame.NekoContext;

class LevelModel extends Component
{
    /** The current score. */
    public var score (default, null) :Value<Int>;
	
	/** The current lives. */
	public var lives (default, null) :Value<Int>;
	
	//level dificulty fields
	public var nekoMinSpawnTime:Float = 4; //seconds
	public var nekoMaxSpawnTime:Float = 4;
	public var nekoMinSpeed:Int = 1; //per frame
	public var nekoMaxSpeed:Int = 2;
	public var goal:Int = 100;

	//layers
	private var worldLayer:Entity;
    private var backgroundLayer :Entity;
    private var nekoLayer :Entity;
    private var kanaLayer :Entity;
	private var gameUILayer:Entity;

    private var nekoArray :Array<Entity>;
    private var ctx :NekoContext;
	
	private var inputUITextSprite:TextSprite;
	private var inputManager:InputManager;
	
	private var levelNumber:Int;
	private var kanaManager:KanaManager = new KanaManager();
	private var enterPressedSignalConnection:SignalConnection;
	private var currentInputSignalConnection:SignalConnection;

    public function new (ctx :NekoContext, levelNumber:Int){
        this.ctx = ctx;
        nekoArray = [];
        score = new Value<Int>(0);
		lives = new Value<Int>(3);
		
		this.levelNumber = levelNumber;
		
		//get level info
		var levelInfo = Reflect.field(ctx.levelsInfo, Std.string(levelNumber));
		
		nekoMinSpeed = levelInfo.minSpeed;
		nekoMaxSpeed = levelInfo.maxSpeed;
		nekoMinSpawnTime = levelInfo.minSpawnTime;
		nekoMaxSpawnTime = levelInfo.maxSpawnTime;
		
		goal = levelInfo.goal;
		
		kanaManager.setKanasToUse(KanaManager.HIRAGANA, levelInfo.kanas); //it's called kanas but it actually is romanji... change that (maybe)
		//TODO every new lvl shows only new kana
		
		trace('level: $levelNumber, level info: $levelInfo');
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
		
		////show hiragana meaning at the beginning of level
		//var levelScript = new Script();
		
		//spawn script
		var spawnScript = new Script();
		worldLayer.add(spawnScript);
		spawnScript.run(new Repeat(new Sequence([
			new Delay(nekoMinSpawnTime), //TODO cambiar la forma de spawnear para poder tener spawnTimes random
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
		inputManager = new InputManager();
		enterPressedSignalConnection = inputManager.enterPressed.connect(checkForCoincidence);
		currentInputSignalConnection = inputManager.currentInput.changed.connect(function(currentInput, _) {
			//update UI input text sprite
			inputUITextSprite.text = currentInput; 
		});
		owner.addChild(new Entity().add(inputManager));
	}
	
	public function pause() {
		inputManager.pause();		
	}
	
	public function unpause() {
		inputManager.unpause();
	}
	
	override public function onRemoved() {
		super.onRemoved();
		inputManager.owner.dispose();
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
		checkForLifeLost();
		nekoRemover();
    }
	
	private function checkForLifeLost() {
		//check for nekos out of screen
		for (i in 0...nekoArray.length) {
			var neko = nekoArray[i];
			var nekoComponent = neko.get(NekoComponent);
			
			if (nekoComponent.imageSprite.x._ < -nekoComponent.imageSprite.getNaturalWidth() / 2) {
				if (nekoComponent.hit == false && lives._ != 0) {
					lives._ -= 1;
					nekoComponent.hit = true;
				}
			}
		}
	}
	
	private function nekoRemover() {
		var nekoRemove = [];
		
		//check for nekos out of screen
		for (i in 0...nekoArray.length) {
			var neko = nekoArray[i];
			var nekoComponent = neko.get(NekoComponent);
			
			if (nekoComponent.imageSprite.x._ < -nekoComponent.imageSprite.getNaturalWidth()) {
				nekoRemove.push(i);
			} 
		}
		
		//removes nekos in array and take out lives
		for (i in 0...nekoRemove.length) {
			nekoArray[nekoRemove[i]].dispose();
			nekoArray.remove(nekoArray[nekoRemove[i]]);
		}
	}
	
	private function nekoMaker() {
		var nekoComponent = new NekoComponent(nekoMaxSpeed, kanaManager, ctx);
		var neko = new Entity().add(nekoComponent);
		
		//add to objects array
		nekoArray.push(neko);
		
		//add to layer
		nekoLayer.addChild(neko);
		
		//move
		nekoComponent.move();
	}
	
	override public function dispose() {
		super.dispose();
		
		//disconnect signals
		enterPressedSignalConnection.dispose();
		currentInputSignalConnection.dispose();
		inputManager.dispose();
	}
}
