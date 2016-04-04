//
// Flambe - Rapid game development
// https://github.com/aduros/flambe/blob/master/LICENSE.txt

package urgame;

import flambe.Entity;
import flambe.System;
import flambe.display.ImageSprite;
import flambe.display.TextSprite;
import urgame.LevelModel;
import urgame.NekoContext;

class PlayingScene
{
    /** Creates the scene where the gameplay happens. */
    public static function create (ctx :NekoContext)
    {
        var scene = new Entity();
		
        var level = new LevelModel(ctx);
        ctx.level = level;
        scene.add(level);
		
        // Show a score label on the top left
        var scoreLabel = new TextSprite(ctx.lightFont);
        scoreLabel.setXY(5, 5);
        level.score.watch(function (score,_) {
            scoreLabel.text = ""+score;
        });
        scene.addChild(new Entity().add(scoreLabel));
		
		// Show the "You lose" label
		var loseLabel = new TextSprite(ctx.lightFont);
		level.lives.watch(function (lives, _) {
			if (lives == 0) {
				loseLabel.text = "You Lose!";
			}
		});
		loseLabel.setXY(System.stage.width/3,System.stage.height/2.1);
		scene.addChild(new Entity().add(loseLabel));
	
		
		// Show a lives label on the top right
        var livesLabel = new TextSprite(ctx.lightFont);
        level.lives.watch(function (lives,_) {
            livesLabel.text = "lives: "+lives;
        });
        livesLabel.setXY(System.stage.width - livesLabel.getNaturalWidth() - 60, 5);
        scene.addChild(new Entity().add(livesLabel));
		
        // Show a pause button
        var pause = new ImageSprite(ctx.pack.getTexture("buttons/Pause"));
        pause.setXY(System.stage.width-pause.texture.width-5, 5);
        pause.pointerDown.connect(function (_) {
            ctx.showPrompt(ctx.messages.get("paused"), [
                "Play", function () {
                    // Unpause by unwinding to the original scene
                    ctx.director.unwindToScene(scene);
                },
                "Home", function () {
                    // Go back to the main menu, unwinding first so the transition looks right
                    ctx.director.unwindToScene(scene);
                    ctx.enterHomeScene();
                },
            ]);
        });
        scene.addChild(new Entity().add(pause));
		
        return scene;
    }
}
