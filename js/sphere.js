class Sphere extends Objeto3D{
    constructor(){
        super();

        let positionBuffer = [];
        let normalBuffer = [];
        let uvBuffer = [];
        let indexBuffer = [];

        let filas = 80;
        let columnas = 80;

        this.radio = 2100; // 2100

        for (var i=0; i <= filas; i++) {
            for (var j=0; j <= columnas; j++) {

                var u=j/columnas;
                var v=i/filas;

                var pos=this.getPosicion(u,v);

                positionBuffer.push(pos[0]);
                positionBuffer.push(pos[1]);
                positionBuffer.push(pos[2]);

                var nrm=this.getNormal(u,v);

                normalBuffer.push(nrm[0]);
                normalBuffer.push(nrm[1]);
                normalBuffer.push(nrm[2]);

                var uvs=this.getUV(u,v);

                uvBuffer.push(uvs[0]);
                uvBuffer.push(uvs[1]);

            }
        }

        let points = (columnas + 1);
        function getIndex(n, p){return n * points + p;}

        for (var n = 0; n < (positionBuffer.length / (points * 3)) - 1; n++) {
            for (var p = 0; p <= points; p++) {
                indexBuffer.push(getIndex(n, p));
                indexBuffer.push(getIndex(n+1, p));            
            }
            indexBuffer.push(getIndex(n + 1, points - 1, points));
            indexBuffer.push(getIndex(n + 1, 0, points));
        }
        for (let i = 0; i < 3; i++)
            indexBuffer.pop();
        
        this.setGeometry(positionBuffer, indexBuffer, normalBuffer, uvBuffer);
    }

    getPosicion(u,v){
        var y=(v-0.5) * this.radio * 2;
        var radioActual = (this.radio**2 - y**2)**(1/2);
        var x=radioActual * Math.sin(u * 2 * Math.PI);
        var z=radioActual * Math.cos(u * 2 * Math.PI);
        return [x,y,z];
    }

    getUV(u,v){
        let pos=this.getPosicion(u,v);
        vec3.normalize(pos, pos);
        let newU = 0.5 + Math.atan2(pos[0], pos[2]);
        let newV = 0.5 - Math.asin(pos[1]) / Math.PI;
        let UV = [newU, newV];
        vec2.normalize(UV, UV);
        return UV;
    }

    getNormal(u,v){
        return [0,1,0];
    }

}
