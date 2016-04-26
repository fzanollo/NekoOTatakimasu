package urgame.scenes;

import flambe.Entity;
import flambe.scene.Scene;
import urgame.NekoContext;

//TODO quizas es un nombre triste, es la scene 'base' para todas las demás
class FlowScene extends Scene
{
	private var baseEntity = new Entity(); //por ahora privado
	private var ctx:NekoContext;

	public function new(ctx:NekoContext, opaque:Bool=true) {
		super(opaque);
		this.ctx = ctx;
	}
	
	override public function onAdded() {
		super.onAdded();
		
		owner.addChild(baseEntity);
	}
	
}