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
	//TODO por ahora hay una variable para cada scene
	private var homeScene:HomeScene;
	private var creditsScene:CreditsScene;
	private var levelSelectionScene:LevelSelectionScene;
	private var optionsScene:OptionsScene;
	private var playingScene:PlayingScene;
	//private var promptScene:PromptScene; //TODO por ahora se hace como antes
	
	private var director:Director;
	private var ctx:NekoContext;
	
	public function new(director:Director, ctx:NekoContext) {
		this.director = director;
		this.ctx = ctx;
	}
	
	public function enterScene(sceneID:SceneID, animate:Bool = true, args:Dynamic = null) {
		trace('llega a enterScene con id $sceneID, animate $animate, args $args');
		var scene = getScene(sceneID, args);
		
		/* si hay una scene anterior y era reutilizable no llamarle al dispose! (i.e. dejarla en el stack de director) 
		 * esto queda bien así? o es mejor si se crean todo el tiempo? */
		if (director.topScene!= null && director.topScene.has(FlowScene) && director.topScene.get(FlowScene).isReusable()) {
			director.pushScene(scene,
				animate ? new SlideTransition(0.5, Ease.quadOut) : null);
		} else {
			director.unwindToScene(scene,
				animate ? new SlideTransition(0.5, Ease.quadOut) : null);			
		}
	}

    public function showPrompt (text :String, buttons :Array<Dynamic>)
    {
        director.pushScene(PromptScene.create(ctx, text, buttons));
    }
	
	//director has to have a previous scene to pop to, be aware of that!
	public function backToPreviousScene (){
		director.popScene();
	}
	
	private function getScene(sceneID:SceneID, args:Dynamic):Entity {
		switch (sceneID) {
			case Home:
				if (homeScene == null) {
					homeScene = new HomeScene(ctx);
					return new Entity().add(homeScene);
				} else {
					return homeScene.owner;
				}
				
			case Credits:
				if (creditsScene == null) {
					creditsScene = new CreditsScene(ctx);
					return new Entity().add(creditsScene);
				} else {
					return creditsScene.owner;
				}
				
			case LevelSelection:
				if (levelSelectionScene == null) {
					levelSelectionScene = new LevelSelectionScene(ctx);
					return new Entity().add(levelSelectionScene);
				} else {
					return levelSelectionScene.owner;
				}
				
			case Options:
				if (optionsScene == null) {
					optionsScene = new OptionsScene(ctx);
					return new Entity().add(optionsScene);
				} else {
					return optionsScene.owner;
				}
				
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