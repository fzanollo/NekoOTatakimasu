package urgame;

import flambe.asset.AssetPack;
import flambe.display.Font;
import flambe.scene.Director;
import flambe.util.MessageBundle;
import haxe.Json;
import urgame.neko.KanaManager;
import urgame.neko.LevelModel;
import urgame.scenes.FlowManager;

/** Contains all the game state that needs to get passed around. */
class NekoContext
{
    /** The main asset pack. */
    public var pack (default, null) :AssetPack;

	/** FlowManager */
    public var flowManager:FlowManager;

    // Some constructed assets
    public var messages (default, null) :MessageBundle;
	
    public var lightFont (default, null) :Font;
    public var lightSmallFont (default, null) :Font;
    public var darkFont (default, null) :Font;
	public var japanFont (default, null) :Font;

    /** The currently active level. */
    public var level :LevelModel;
	
	/** Global configs. */
	public var muted :Bool = false;
	
	/** Levels info */
	public var hiraganaLevelsInfo:Dynamic;
	public var hiraganaMaxLevel:Int = 1;
	
	public var katakanaLevelsInfo:Dynamic;
	public var katakanaMaxLevel:Int = 1;
	
	/** KanaManager */
	public var kanaManager:KanaManager = new KanaManager();

    public function new (mainPack :AssetPack, localePack :AssetPack, director :Director){
        this.pack = mainPack;
        this.flowManager = new FlowManager(director, this);
		
        this.messages = MessageBundle.parse(localePack.getFile("messages.ini").toString());
        this.lightFont = new Font(pack, "fonts/Light");
        this.lightSmallFont = new Font(pack, "fonts/LightSmall");
        this.darkFont = new Font(pack, "fonts/Dark");
        this.japanFont = new Font(pack, "fonts/japanFont");
		
		this.hiraganaLevelsInfo = Json.parse(pack.getFile("HiraganaLevels.json").toString());
		this.hiraganaMaxLevel = getLevelMax(hiraganaLevelsInfo);
		
		this.katakanaLevelsInfo = Json.parse(pack.getFile("KatakanaLevels.json").toString());
		this.katakanaMaxLevel = getLevelMax(katakanaLevelsInfo);
    }
	
	private function getLevelMax(levelsInfo:Dynamic):Int {
		var i = 1;
		
		while (Reflect.hasField(levelsInfo, Std.string(i))) i++;
		return i-1;
	}
}
