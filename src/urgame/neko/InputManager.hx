package urgame.neko;

import flambe.Component;
import flambe.display.TextSprite;
import flambe.input.Key;
import flambe.input.KeyboardEvent;
import flambe.script.Script;
import flambe.System;
import flambe.util.Signal1;
import flambe.util.Value;
import haxe.Timer;

class InputManager extends Component
{
	public var enterPressed:Signal1<String>;
	public var currentInput (default, null):Value<String>;
	
	private var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	public function new() {
		enterPressed = new Signal1();
		currentInput = new Value<String>("");
		
		//connect to keyboard events
		System.keyboard.up.connect(keyboardEventUpHandler);
	}
	
	private function keyboardEventUpHandler(keyboardEvent:KeyboardEvent) {
		switch (keyboardEvent.key) {
			case Key.Enter:
				if (currentInput._.length > 0) {
					enterPressed.emit(currentInput._);
					currentInput._ = "";
				}
			
			case Key.Backspace:
				deleteCharacter();
			
			case Key.Unknown(keyCode):
				//unknown key, ignoring
			
			default:
				var key = keyboardEvent.key.getName();
				if (currentInput._.length < 4 && isCharacter(key)) currentInput._ += key;
		}
	}
	
	private function deleteCharacter() {
		if (currentInput._.length > 0) {
			var deleted = currentInput._.substring(currentInput._.length - 1, currentInput._.length); //for debug
			currentInput._ = currentInput._.substring(0, currentInput._.length - 1);
		}
	}
	
	private function isCharacter(key:String):Bool {
		return alphabet.indexOf(key) > -1;
	}
}