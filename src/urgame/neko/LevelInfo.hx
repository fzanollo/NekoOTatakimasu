package urgame.neko;


class LevelInfo
{
	public var nekoMinSpawnTime:Float = 4; //seconds
	public var nekoMaxSpawnTime:Float = 4;
	public var nekoMinSpeed:Int = 1; //per frame
	public var nekoMaxSpeed:Int = 2;
	public var goal:Int = 100;
	public var kanas:Array<String> = new Array();
	
	public function new(levelInfo:Dynamic) {
		this.nekoMinSpawnTime = levelInfo.minSpawnTime;
		this.nekoMaxSpawnTime = levelInfo.maxSpawnTime;
		this.nekoMinSpeed = levelInfo.minSpeed;
		this.nekoMaxSpeed = levelInfo.maxSpeed;
		this.goal = levelInfo.goal;
		this.kanas = levelInfo.kanas;
	}
	
}