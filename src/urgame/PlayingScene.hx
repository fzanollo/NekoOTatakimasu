//
// Flambe - Rapid game development
// https://github.com/aduros/flambe/blob/master/LICENSE.txt

package urgame;

import flambe.Entity;
import flambe.System;
import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import ui.ButtonBehaviour;
import urgame.LevelModel;
import urgame.NekoContext;

class PlayingScene
{
    /** Creates the scene where the gameplay happens. */
    public static function create (ctx :NekoContext, levelNumber:Int)
    {
        var scene = new Entity();
		
        var level = new LevelModel(ctx, levelNumber);
        ctx.level = level;
        scene.add(level);
		
        // Show a score label on the top left
        var scoreLabel = new TextSprite(ctx.lightFont);
        scoreLabel.setXY(5, 5);
        level.score.watch(function (score,_) {
            scoreLabel.text = ""+score;
        });
        scene.addChild(new Entity().add(scoreLabel));
		
		// Show a lives label on the top right
        var livesLabel = new TextSprite(ctx.lightFont);
        level.lives.watch(function (lives,_) {
            livesLabel.text = "lives: "+lives;
        });
        livesLabel.setXY(System.stage.width - livesLabel.getNaturalWidth() - 60, 5);
        scene.addChild(new Entity().add(livesLabel));
		
        // Show a pause button
		var pause = new Entity();
        var pauseSprite = new ImageSprite(ctx.pack.getTexture("buttons/Pause"));
        pauseSprite.setXY(System.stage.width-pauseSprite.texture.width-5, 5);
        var pauseBehaviour = new ButtonBehaviour();
		pauseBehaviour.setHandler(function (pointerEvent) {
			level.pause();
            ctx.showPrompt(ctx.messages.get("paused"), [
                "Play", function () {
                    // Unpause by unwinding to the original scene
                    ctx.director.unwindToScene(scene);
					level.unpause();
                },
                "Home", function () {
                    // Go back to the main menu, unwinding first so the transition looks right
                    ctx.director.unwindToScene(scene);
                    ctx.enterHomeScene();
                },
            ]);
        });
		pause.add(pauseSprite).add(pauseBehaviour);
        scene.addChild(pause);
		
		// Show the "You lose" prompt
		level.lives.watch(function (lives, _) {
			if (lives == 0) {
				ctx.showPrompt(ctx.messages.get("you lose! and scored: "+level.score._), [
					
					"Replay", function () {
						ctx.director.unwindToScene(scene);
						ctx.enterPlayingScene(levelNumber);
					},
					"Home", function () {
						// Go back to the main menu, unwinding first so the transition looks right
						ctx.director.unwindToScene(scene);
						ctx.enterHomeScene();
					},
            ]);
			}
		});
		
		// Show the "you win" prompt
		level.score.watch(function (score, _) {
			if (score == 100) {
				ctx.showPrompt(ctx.messages.get("you win!"), [
					
					"Play", function () {
						ctx.director.unwindToScene(scene);
						ctx.enterPlayingScene(levelNumber + 1); //TODO esto es por ahora, de hecho puede generar problemas (no se sabe el lvl max)
					},
					"Home", function () {
						// Go back to the main menu, unwinding first so the transition looks right
						ctx.director.unwindToScene(scene);
						ctx.enterHomeScene();
					},
				]);
			}
		});
		
        return scene;
    }
}
