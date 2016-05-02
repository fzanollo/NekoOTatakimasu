package urgame.scenes;

import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import flambe.Entity;
import flambe.System;
import haxe.Json;
import ui.ButtonBehaviour;
import urgame.neko.LevelModel;
import urgame.NekoContext;
import urgame.scenes.FlowManager.SceneID;

class PlayingScene extends FlowScene
{
	private var levelNumber:Int;
	
	public function new(ctx:NekoContext, levelNumber:Int, opaque:Bool=true) {
		super(ctx, opaque);
		this.levelNumber = levelNumber;
	}
	
	override public function onAdded() {
		super.onAdded();
		
		var level = new LevelModel(ctx, levelNumber); 
        ctx.level = level;
        baseEntity.add(level);
		
        // Show a score label on the top left
        var scoreLabel = new TextSprite(ctx.lightSmallFont);
        scoreLabel.setXY(5, 5);
        level.score.watch(function (score,_) {
            scoreLabel.text = score + ' of ${level.levelInfo.goal}';
        });
        baseEntity.addChild(new Entity().add(scoreLabel));
		
		// Show a lives label on the top right
        var livesLabel = new TextSprite(ctx.lightSmallFont);
        level.lives.watch(function (lives,_) {
            livesLabel.text = "lives: "+lives;
        });
        livesLabel.setXY(System.stage.width - livesLabel.getNaturalWidth() - 60, 5);
        baseEntity.addChild(new Entity().add(livesLabel));
		
        // Show a pause button
		var pause = new Entity();
        var pauseSprite = new ImageSprite(ctx.pack.getTexture("buttons/Pause"));
        pauseSprite.setXY(System.stage.width-pauseSprite.texture.width-5, 5);
        var pauseBehaviour = new ButtonBehaviour();
		pauseBehaviour.setHandler(function (pointerEvent) {
			level.pause();
            ctx.flowManager.showPrompt(ctx.messages.get("paused"), [
                "Play", function () {
                    // Unpause by unwinding to the original scene
					ctx.flowManager.backToPreviousScene();
					level.unpause();
                },
                "Home", function () {
                    // Go back to the main menu, unwinding first so the transition looks right
					ctx.flowManager.backToPreviousScene();
                    ctx.flowManager.enterScene(SceneID.Home);
                },
            ]);
        });
		pause.add(pauseSprite).add(pauseBehaviour);
        baseEntity.addChild(pause);
		
		// Show the "You lose" prompt
		level.lives.watch(function (lives, _) {
			if (lives == 0) {
				ctx.flowManager.showPrompt(ctx.messages.get("you lose! and scored: "+level.score._), [
					
					"Replay", function () {
						ctx.flowManager.backToPreviousScene();
						var args = Json.parse('{"levelNumber": $levelNumber}');
						ctx.flowManager.enterScene(SceneID.Playing, true, args);
					},
					"Home", function () {
						// Go back to the main menu, unwinding first so the transition looks right
						ctx.flowManager.backToPreviousScene();
						ctx.flowManager.enterScene(SceneID.Home);
					},
            ]);
			}
		});
		
		// Show the "you win" prompt
		level.score.watch(function (score, _) {
			if (score == level.levelInfo.goal) {
				ctx.flowManager.showPrompt(ctx.messages.get("you win!"), [
					
					"Play", function () {
						ctx.flowManager.backToPreviousScene();
						var args = Json.parse('{"levelNumber": ${levelNumber+1}}'); //TODO esto es por ahora, de hecho puede generar problemas (no se sabe el lvl max)
						ctx.flowManager.enterScene(SceneID.Playing, true, args);
					},
					"Home", function () {
						// Go back to the main menu, unwinding first so the transition looks right
						ctx.flowManager.backToPreviousScene();
						ctx.flowManager.enterScene(SceneID.Home);
					},
				]);
			}
		});
	}
}
