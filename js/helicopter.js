class Helicopter extends Objeto3D{
    constructor(){
        super();
        this.topArmPitch = 0.5;

        this.cabin = new Cabin();
        let skidLeft = new Skid();
        let skidRight = new Skid();
        this.arm1 = new Arm();
        this.arm2 = new Arm();
        this.arm3 = new Arm();
        this.arm4 = new Arm();
        this.tail = new Tail();

        this.cabin.setScale(1.8, 2.2, 1.4);
        skidLeft.setPosition(0, -2.5, 3);
        skidRight.setPosition(0, -2.5, -3);
        skidRight.setFirstRotation(Math.PI, [0, 1, 0]);
        this.arm1.setScale(0.5);
        this.arm1.setPosition(-6.75, 3, -6);
        this.arm2.setScale(0.5);
        this.arm2.setFirstRotation(Math.PI, [0, 1, 0]);
        this.arm2.setPosition(-6.75, 3, 6);
        this.arm3.setScale(0.5);
        this.arm3.setPosition(3.25, 3, -6);
        this.arm4.setScale(0.5);
        this.arm4.setFirstRotation(Math.PI, [0, 1, 0]);
        this.arm4.setPosition(3.25, 3, 6);
        this.tail.setPosition(-15, 3.5, 0);
        this.addChild(this.arm1);
        this.addChild(this.arm2);
        this.addChild(this.arm3);
        this.addChild(this.arm4);
        this.addChild(this.cabin);
        this.addChild(skidLeft);
        this.addChild(skidRight);
        this.addChild(this.tail);

        this.controller = new HelicopterController();
    }

    setRotationAngles(roll, angle, pitch){
        this.setFirstRotation(roll, [1, 0, 0]);
        this.setSecondRotation(angle, [0, 1, 0]);
        this.setThirdRotation(pitch, [0, 0, 1]);
    }

    setArmsSpeed(acceleration, speed, time){
        let rotorSpeed = speed / 2 + acceleration * 5;
        this.arm1.setRotorSpeed(rotorSpeed, time);
        this.arm2.setRotorSpeed(rotorSpeed, time);
        this.arm3.setRotorSpeed(rotorSpeed, time);
        this.arm4.setRotorSpeed(rotorSpeed, time);
        let armPitch = acceleration * 3;
        if (armPitch > this.topArmPitch)
            armPitch = this.topArmPitch;
        if (armPitch < -this.topArmPitch)
            armPitch = -this.topArmPitch;
        this.arm1.setFirstRotation(-armPitch, [0, 0, 1]);
        this.arm2.setSecondRotation(armPitch, [0, 0, 1]);
        this.arm3.setFirstRotation(-armPitch, [0, 0, 1]);
        this.arm4.setSecondRotation(armPitch, [0, 0, 1]);
    }

    setTailAngle(angle){
        this.tail.setFlapsAngle(angle);
    }

    setArmsAngle(angle){
        angle = angle * 0.4;
        this.arm1.setThirdRotation(Math.PI * angle, [1, 0, 0]);
        this.arm2.setThirdRotation(Math.PI * angle, [1, 0, 0]);
        this.arm3.setThirdRotation(Math.PI * angle, [1, 0, 0]);
        this.arm4.setThirdRotation(Math.PI * angle, [1, 0, 0]);
    }

    getSpeed(){
        return this.controller.getSpeed();
    }

    getHeight(){
        return this.controller.getHeight();
    }

    actualizarMatricesModeladoHijos(){
        for (let i = 0; i < this.hijos.length; i++){
            this.hijos[i].actualizarMatrizModelado(this.matrizModelado);
        }
    }

    addTextureProgram(program){
        this.program = program;
        this.cabin.addTextureProgram(program);
    }

    addCabinTexture(src){
        this.cabin.loadTexture(src);
    }
    
    tick(time){
        this.controller.tick();
        this.setPosition(...this.controller.getPosition());
        this.setRotationAngles(...this.controller.getRotation());
        this.actualizarMatrizModelado();
        this.actualizarMatricesModeladoHijos();
        this.setArmsSpeed(this.controller.getAcceleration(), this.controller.getSpeed(), time);
        this.setTailAngle(-this.controller.getAngularAcceleration());
        this.setArmsAngle(this.controller.getArmsAngle());
    }

}
