package urgame.scenes;

import flambe.animation.Ease;
import flambe.Entity;
import flambe.scene.Director;
import flambe.scene.SlideTransition;
import urgame.NekoContext;
import urgame.scenes.FlowManager.SceneID;

class FlowManager
{
	/* SCENES */
	//por ahora hay una variable para cada scene
	private var homeScene:HomeScene;
	private var creditsScene:CreditsScene;
	private var levelSelectionScene:LevelSelectionScene;
	private var optionsScene:OptionsScene;
	private var playingScene:PlayingScene;
	//private var promptScene:PromptScene; //por ahora se hace como antes
	
	private var director:Director;
	private var ctx:NekoContext;
	
	public function new(director:Director, ctx:NekoContext) {
		this.director = director;
		this.ctx = ctx;
	}
	
	public function enterScene(sceneID:SceneID, animate:Bool = true, args:Dynamic = null) {
		trace('llega a enterScene con id $sceneID, animate $animate, args $args');
		director.unwindToScene(getScene(sceneID, args),
			animate ? new SlideTransition(0.5, Ease.quadOut) : null);
	}

    public function showPrompt (text :String, buttons :Array<Dynamic>)
    {
        director.pushScene(PromptScene.create(ctx, text, buttons));
    }
	
	//director has to have a previous scene to pop to, be aware of that!
	public function backToPreviousScene (){
		director.popScene();
	}
	
	public function unwindToScene(scene:Entity) {
		director.unwindToScene(scene);
	}
	
	private function getScene(sceneID:SceneID, args:Dynamic):Entity {
		switch (sceneID) {
			case Home:
				if (homeScene == null) homeScene = new HomeScene(ctx);
				return new Entity().add(homeScene);
				
			case Credits:
				if (creditsScene == null) creditsScene = new CreditsScene(ctx);
				return new Entity().add(creditsScene);
				
			case LevelSelection:
				if (levelSelectionScene == null) levelSelectionScene = new LevelSelectionScene(ctx);
				return new Entity().add(levelSelectionScene);
				
			case Options:
				if (optionsScene == null) optionsScene = new OptionsScene(ctx);
				return new Entity().add(optionsScene);
				
			case Playing:
				playingScene = new PlayingScene(ctx, args.levelNumber); //siempre es un scene nuevo, args debe contener levelNumber
				return new Entity().add(playingScene);
				
			default:
				trace('ERROR @FLOWMANAGER id $sceneID doesn\'t have any scene asigned');
				return null;
		}
	}
}

enum SceneID 
{
	Home;
	Credits;
	LevelSelection;
	Options;
	Playing;
	Prompt; //TODO
}