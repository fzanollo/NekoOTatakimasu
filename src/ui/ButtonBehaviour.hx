package ui;

import flambe.Component;
import flambe.display.Sprite;
import flambe.input.PointerEvent;
import flambe.System;

/* owner must have a sprite component */
class ButtonBehaviour extends Component
{
	private var ownerSprite:Sprite;
	private var onButtonPressed:PointerEvent->Void;
	
	private var pointerDown:Bool = false;

	public function new() {
		
	}
	
	override public function onAdded() {
		super.onAdded();
		
		//get Sprite from owner
		ownerSprite = owner.get(Sprite);
		
		//connect handlers to pointer events
		ownerSprite.pointerDown.connect(pointerDownHandler);
		ownerSprite.pointerUp.connect(pointerUpHandler);
		
		//connect to global pointerUp to get when pointer released outside of button
		System.pointer.up.connect(fixPointerReleasedOutOfButton);
	}
	
	public function setHandler(onButtonPressed:PointerEvent->Void) {
		this.onButtonPressed = onButtonPressed;
	}
	
	function fixPointerReleasedOutOfButton(pointerEvent:PointerEvent) {
		pointerDown = false;
	}
	
	function pointerDownHandler(pointerEvent:PointerEvent) {
		pointerDown = true;
	}
	
	function pointerUpHandler(pointerEvent:PointerEvent) {
		if (pointerDown && onButtonPressed != null) {
			pointerDown = false;
			onButtonPressed(pointerEvent);
		}
	}
	
}