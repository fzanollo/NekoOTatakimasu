package urgame.neko;

import flambe.Component;
import flambe.display.TextSprite;
import flambe.input.Key;
import flambe.input.KeyboardEvent;
import flambe.System;
import flambe.util.Signal1;
import flambe.util.Value;

class InputManager extends Component
{
	public var enterPressed:Signal1<String>;
	public var currentInput (default, null):Value<String>;

	public function new() {
		enterPressed = new Signal1();
		currentInput = new Value<String>("");
		
		//connect to keyboard events
		System.keyboard.up.connect(checkKeyboardEvent);
	}
	
	private function checkKeyboardEvent(keyboardEvent:KeyboardEvent) {
		switch (keyboardEvent.key) {
			case Key.Enter:
				if (currentInput._.length > 0) {
					enterPressed.emit(currentInput._);
					currentInput._ = "";
					trace('ENTER PRESSED');
				}
			
			case Key.Backspace:
				if (currentInput._.length > 0) {
					var deleted = currentInput._.substring(currentInput._.length - 1, currentInput._.length); //for debug
					currentInput._ = currentInput._.substring(0, currentInput._.length - 1);
					trace('BACKSPACE PRESSED, DELETED: $deleted');
				}
			
			case Key.Unknown(keyCode):
				//unknown key, ignoring
			
			default:
				var key = keyboardEvent.key.getName();
				if (key.length == 1) {
					//por ahora ponele que es eso, es para evitar SHIFT, etc TODO hacer bien esta cosa
					currentInput._ += key;						
				}
				trace('KEY PRESSED:  ${keyboardEvent.key.getName()}');
		}
	}
	
}