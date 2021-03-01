class LandingPad extends Objeto3D{
    constructor(){
        super();
        this.box = new Box();
        this.box.setColor([1, 0.7, 0.7]);
        this.box.setScale(1,5,1);
        this.addChild(this.box);
    }

    loadTexture(src){
        this.box.loadTexture(src);
    }

    addTextureProgram(program){
        this.box.addTextureProgram(program);
    }
}
