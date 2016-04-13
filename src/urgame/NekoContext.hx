package urgame;

import flambe.animation.Ease;
import flambe.asset.AssetPack;
import flambe.display.Font;
import flambe.scene.Director;
import flambe.scene.SlideTransition;
import flambe.util.MessageBundle;

/** Contains all the game state that needs to get passed around. */
class NekoContext
{
    /** The main asset pack. */
    public var pack (default, null) :AssetPack;

    public var director (default, null) :Director;

    // Some constructed assets
    public var messages (default, null) :MessageBundle;
	
    public var lightFont (default, null) :Font;
    public var darkFont (default, null) :Font;
	public var japanFont (default, null) :Font;

    /** The currently active level. */
    public var level :LevelModel;
	
	/** Global configs. */
	public var muted :Bool = false;

    public function new (mainPack :AssetPack, localePack :AssetPack, director :Director){
        this.pack = mainPack;
        this.director = director;
		
        this.messages = MessageBundle.parse(localePack.getFile("messages.ini").toString());
        this.lightFont = new Font(pack, "fonts/Light");
        this.darkFont = new Font(pack, "fonts/Dark");
        this.japanFont = new Font(pack, "fonts/japanFont");
    }

    public function enterHomeScene (animate :Bool = true)
    {
        director.unwindToScene(HomeScene.create(this),
            animate ? new SlideTransition(0.5, Ease.quadOut) : null);
    }

    public function enterPlayingScene (animate :Bool = true, levelNumber:Int)
    {
        director.unwindToScene(PlayingScene.create(this, levelNumber),
            animate ? new SlideTransition(0.5, Ease.quadOut) : null);
    }


	public function enterOptionsScene (animate :Bool = true)
    {
        director.unwindToScene(OptionsScene.create(this),
            animate ? new SlideTransition(0.5, Ease.quadOut) : null);
    }
	
	public function enterCreditsScene (animate :Bool = true)
    {
        director.unwindToScene(CreditsScene.create(this),
            animate ? new SlideTransition(0.5, Ease.quadOut) : null);
    }

    public function enterLevelSelectionScene (animate :Bool = true)
    {
        director.unwindToScene(LevelSelectionScene.create(this),
            animate ? new SlideTransition(0.5, Ease.quadOut) : null);
    }


    public function showPrompt (text :String, buttons :Array<Dynamic>)
    {
        director.pushScene(PromptScene.create(this, text, buttons));
    }
}
