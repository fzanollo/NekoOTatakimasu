package urgame.neko;

class KanaManager
{
	private var syllabaryInUse:String = HIRAGANA;
	
	private var newKana:Array<String> = new Array(); //kanas of the current level
	private var oldKana:Array<String> = new Array(); //kanas of the already passed levels
	
	public function new() {
		
	}
	
	public function setNewKanas(syllabary:String, kanas:Array<String>) {
		this.syllabaryInUse = syllabary;
		if (newKana.length > 0) oldKana.concat(newKana); //the old 'newKana' is now old xD
		newKana = kanas;
	}
	
	public function getRandomNewKana():String {
		return newKana[Std.random(newKana.length)];
	}
	
	public function getRandomOldKana():String {
		return oldKana[Std.random(oldKana.length)];
	}
	
	public function getRandomKanaFromAll():String {
		if (syllabaryInUse == HIRAGANA) {
			return getRandomElement(romanjiToHiragana);
		} else {
			return getRandomElement(romanjiToKatakana);
		}
	}
	
	public function getRomanji(kana:String):String {
		var romaji:String;
		
		if (syllabaryInUse == HIRAGANA) {
			romaji = hiraganaToRomanji.get(kana);
		} else {
			romaji = katakanaToRomanji.get(kana);
		}
		
		if (romaji.charAt(romaji.length - 1) == '*') {
			return romaji.substring(0, romaji.length - 1);
		} else {
			return romaji;
		}
	}
	
	private function getRandomElement(map:Map<String, String>):String {
		var mapArray = Lambda.array(map); // Convert the map values into an array
		return mapArray[Std.random(mapArray.length)]; // Return a random element from the array
	}
	
	//{ KANA MAPS
	private static var romanjiToHiragana:Map<String, String> = [
	"A" => "あ", "I" => "い", "U" => "う", "E" => "え", "O" => "お", "KA" => "か", "KI" => "き", "KU" => "く", "KE" => "け", "KO" => "こ", "SA" => "さ", "SHI" => "し", "SU" => "す", "SE" => "せ", "SO" => "そ", "TA" => "た", "CHI" => "ち", "TSU" => "つ", "TE" => "て", "TO" => "と", "NA" => "な", "NI" => "に", "NU" => "ぬ", "NE" => "ね", "NO" => "の", "HA" => "は", "HI" => "ひ", "FU" => "ふ", "HE" => "へ", "HO" => "ほ", "MA" => "ま", "MI" => "み", "MU" => "む", "ME" => "め", "MO" => "も", "YA" => "や", "YU" => "ゆ", "YO" => "よ", "RA" => "ら", "RI" => "り", "RU" => "る", "RE" => "れ", "RO" => "ろ", "WA" => "わ", "WO" => "を", "N" => "ん", 
	"GA" => "が", "GI" => "ぎ", "GU" => "ぐ", "GE" => "げ", "GO" => "ご", "ZA" => "ざ", "JI" => "じ", "ZU" => "ず", "ZE" => "ぜ", "ZO" => "ぞ", "DA" => "だ", "JI*" => "ぢ", "ZU*" => "づ", "DE" => "で", "DO" => "ど", "BA" => "ば", "BI" => "び", "BU" => "ぶ", "BE" => "べ", "BO" => "ぼ", "PA" => "ぱ", "PI" => "ぴ", "PU" => "ぷ", "PE" => "ぺ", "PO" => "ぽ",
	"KYA" => "きゃ", "KYU" => "きゅ", "KYO" => "きょ", "SHA" => "しゃ", "SHU" => "しゅ", "SHO" => "しょ", "CHA" => "ちゃ", "CHU" => "ちゅ", "CHO" => "ちょ", "NYA" => "にゃ", "NYU" => "にゅ", "NYO" => "にょ", "HYA" => "ひゃ", "HYU" => "ひゅ", "HYO" => "ひょ", "MYA" => "みゃ", "MYU" => "みゅ", "MYO" => "みょ", "RYA" => "りゃ", "RYU" => "りゅ", "RYO" => "りょ",
	"GYA" => "ぎゃ", "GYU" => "ぎゅ", "GYO" => "ぎょ", "JA" => "じゃ", "JU" => "じゅ", "JO" => "じょ", "JA*" => "ぢゃ", "JU*" => "ぢゅ", "JO*" => "ぢょ", "BYA" => "びゃ", "BYU" => "びゅ", "BYO" => "びょ", "PYA" => "ぴゃ", "PYU" => "ぴゅ", "PYO" => "ぴょ"];
	
	private static var hiraganaToRomanji:Map<String, String> = ["あ" => "A", "い" => "I", "う" => "U", "え" => "E", "お" => "O", "か" => "KA", "き" => "KI", "く" => "KU", "け" => "KE", "こ" => "KO", "さ" => "SA", "し" => "SHI", "す" => "SU", "せ" => "SE", "そ" => "SO", "た" => "TA", "ち" => "CHI", "つ" => "TSU", "て" => "TE", "と" => "TO", "な" => "NA", "に" => "NI", "ぬ" => "NU", "ね" => "NE", "の" => "NO", "は" => "HA", "ひ" => "HI", "ふ" => "FU", "へ" => "HE", "ほ" => "HO", "ま" => "MA", "み" => "MI", "む" => "MU", "め" => "ME", "も" => "MO", "や" => "YA", "ゆ" => "YU", "よ" => "YO", "ら" => "RA", "り" => "RI", "る" => "RU", "れ" => "RE", "ろ" => "RO", "わ" => "WA", "を" => "O/WO", "ん" => "N",
	"が" => "GA", "ぎ" => "GI", "ぐ" => "GU", "げ" => "GE", "ご" => "GO", "ざ" => "ZA", "じ" => "JI", "ず" => "ZU", "ぜ" => "ZE", "ぞ" => "ZO", "だ" => "DA", "ぢ" => "JI*", "づ" => "ZU*", "で" => "DE", "ど" => "DO", "ば" => "BA", "び" => "BI", "ぶ" => "BU", "べ" => "BE", "ぼ" => "BO", "ぱ" => "PA", "ぴ" => "PI", "ぷ" => "PU", "ぺ" => "PE", "ぽ" => "PO",
	"きゃ" => "KYA", "きゅ" => "KYU", "きょ" => "KYO", "しゃ" => "SHA", "しゅ" => "SHU", "しょ" => "SHO", "ちゃ" => "CHA", "ちゅ" => "CHU", "ちょ" => "CHO", "にゃ" => "NYA", "にゅ" => "NYU", "にょ" => "NYO", "ひゃ" => "HYA", "ひゅ" => "HYU", "ひょ" => "HYO", "みゃ" => "MYA", "みゅ" => "MYU", "みょ" => "MYO", "りゃ" => "RYA", "りゅ" => "RYU", "りょ" => "RYO",
	"ぎゃ" => "GYA", "ぎゅ" => "GYU", "ぎょ" => "GYO", "じゃ" => "JA", "じゅ" => "JU", "じょ" => "JO", "ぢゃ" => "JA*", "ぢゅ" => "JU*", "ぢょ" => "JO*", "びゃ" => "BYA", "びゅ" => "BYU", "びょ" => "BYO", "ぴゃ" => "PYA", "ぴゅ" => "PYU", "ぴょ" => "PYO"];
	
	private static var romanjiToKatakana:Map<String, String> = ["A" => "ア", "I" => "イ", "U" => "ウ", "E" => "エ", "O" => "オ", "KA" => "カ", "KI" => "キ", "KU" => "ク", "KE" => "ケ", "KO" => "コ", "SA" => "サ", "SHI" => "シ", "SU" => "ス", "SE" => "セ", "SO" => "ソ", "TA" => "タ", "CHI" => "チ", "TSU" => "ツ", "TE" => "テ", "TO" => "ト", "NA" => "ナ", "NI" => "ニ", "NU" => "ヌ", "NE" => "ネ", "NO" => "ノ", "HA" => "ハ", "HI" => "ヒ", "FU" => "フ", "HE" => "ヘ", "HO" => "ホ", "MA" => "マ", "MI" => "ミ", "MU" => "ム", "ME" => "メ", "MO" => "モ", "YA" => "ヤ", "YU" => "ユ", "YO" => "ヨ", "RA" => "ラ", "RI" => "リ", "RU" => "ル", "RE" => "レ", "RO" => "ロ", "WA" => "ワ", "WO" => "ヲ", "N" => "ン",
	"GA" => "ガ", "GI" => "ギ", "GU" => "グ", "GE" => "ゲ", "GO" => "ゴ", "ZA" => "ザ", "JI" => "ジ", "ZU" => "ズ", "ZE" => "ゼ", "ZO" => "ゾ", "DA" => "ダ", "JI*" => "ヂ", "ZU*" => "ヅ", "DE" => "デ", "DO" => "ド", "BA" => "バ", "BI" => "ビ", "BU" => "ブ", "BE" => "ベ", "BO" => "ボ", "PA" => "パ", "PI" => "ピ", "PU" => "プ", "PE" => "ペ", "PO" => "ポ",
	"KYA" => "キャ", "KYU" => "キュ", "KYO" => "キョ", "SHA" => "シャ", "SHU" => "シュ", "SHO" => "ショ", "CHA" => "チャ", "CHU" => "チュ", "CHO" => "チョ", "NYA" => "ニャ", "NYU" => "ニュ", "NYO" => "ニョ", "HYA" => "ヒャ", "HYU" => "ヒュ", "HYO" => "ヒョ", "MYA" => "ミャ", "MYU" => "ミュ", "MYO" => "ミョ", "RYA" => "リャ", "RYU" => "リュ", "RYO" => "リョ",
	"GYA" => "ギャ", "GYU" => "ギュ", "GYO" => "ギョ", "JA" => "ジャ", "JU" => "ジュ", "JO" => "ジョ", "JA*" => "ヂャ", "JU*" => "ヂュ", "JO*" => "ヂョ", "BYA" => "ビャ", "BYU" => "ビュ", "BYO" => "ビョ", "PYA" => "ピャ", "PYU" => "ピュ", "PYO" => "ピョ"];	
	
	private static var katakanaToRomanji:Map<String, String> = ["ア" => "A", "イ" => "I", "ウ" => "U", "エ" => "E", "オ" => "O", "カ" => "KA", "キ" => "KI", "ク" => "KU", "ケ" => "KE", "コ" => "KO", "サ" => "SA", "シ" => "SHI", "ス" => "SU", "セ" => "SE", "ソ" => "SO", "タ" => "TA", "チ" => "CHI", "ツ" => "TSU", "テ" => "TE", "ト" => "TO", "ナ" => "NA", "ニ" => "NI", "ヌ" => "NU", "ネ" => "NE", "ノ" => "NO", "ハ" => "HA", "ヒ" => "HI", "フ" => "FU", "ヘ" => "HE", "ホ" => "HO", "マ" => "MA", "ミ" => "MI", "ム" => "MU", "メ" => "ME", "モ" => "MO", "ヤ" => "YA", "ユ" => "YU", "ヨ" => "YO", "ラ" => "RA", "リ" => "RI", "ル" => "RU", "レ" => "RE", "ロ" => "RO", "ワ" => "WA", "ヲ" => "O/WO", "ン" => "N",
	"ガ" => "GA", "ギ" => "GI", "グ" => "GU", "ゲ" => "GE", "ゴ" => "GO", "ザ" => "ZA", "ジ" => "JI", "ズ" => "ZU", "ゼ" => "ZE", "ゾ" => "ZO", "ダ" => "DA", "ヂ" => "JI*", "ヅ" => "ZU*", "デ" => "DE", "ド" => "DO", "バ" => "BA", "ビ" => "BI", "ブ" => "BU", "ベ" => "BE", "ボ" => "BO", "パ" => "PA", "ピ" => "PI", "プ" => "PU", "ペ" => "PE", "ポ" => "PO",
	"キャ" => "KYA", "キュ" => "KYU", "キョ" => "KYO", "シャ" => "SHA", "シュ" => "SHU", "ショ" => "SHO", "チャ" => "CHA", "チュ" => "CHU", "チョ" => "CHO", "ニャ" => "NYA", "ニュ" => "NYU", "ニョ" => "NYO", "ヒャ" => "HYA", "ヒュ" => "HYU", "ヒョ" => "HYO", "ミャ" => "MYA", "ミュ" => "MYU", "ミョ" => "MYO", "リャ" => "RYA", "リュ" => "RYU", "リョ" => "RYO",
	"ギャ" => "GYA", "ギュ" => "GYU", "ギョ" => "GYO", "ジャ" => "JA", "ジュ" => "JU", "ジョ" => "JO", "ヂャ" => "JA*", "ヂュ" => "JU*", "ヂョ" => "JO*", "ビャ" => "BYA", "ビュ" => "BYU", "ビョ" => "BYO", "ピャ" => "PYA", "ピュ" => "PYU", "ピョ" => "PYO"];
	
	public static inline var HIRAGANA = "HIRAGANA";
	public static inline var KATAKANA = "KATAKANA";
	//}
}