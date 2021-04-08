class Objeto3D{
    constructor(){
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        this.texture_coord_buffer = null;

        this.webGL_vertexBuffer = null;
        this.webGL_indexBuffer = null;
        this.webGL_normalBuffer = null;
        this.webGL_vertexAttribute = null;
        this.webgl_texture_coord_buffer = null;

        this.program = null;

        this.matrizModelado = mat4.create();

        this.posicion = vec3.create();
        this.rotations = [[0, [1, 0, 0]],
                          [0, [0, 1, 0]],
                          [0, [0, 0, 1]]];
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.escala = vec3.fromValues(1,1,1);

        this.hijos = [];
        this.color = [1, 1, 1];
        this.texture = null;
    }

    addTextureProgram(program){
        this.program = program;
    }

    initializeBuffers(){
        if(this.program)
            gl.useProgram(this.program);

        this.webGL_vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webGL_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexBuffer), gl.STATIC_DRAW);
        this.webGL_vertexBuffer.itemSize = 3;
        this.webGL_vertexBuffer.numItems = this.vertexBuffer.length / 3;

        this.webGL_indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webGL_indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexBuffer), gl.STATIC_DRAW);
        this.webGL_indexBuffer.itemSize = 1;
        this.webGL_indexBuffer.number_vertex_point = this.indexBuffer.length;

        if (this.normalBuffer){
            this.webGL_normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGL_normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalBuffer), gl.STATIC_DRAW);
        }

        if (this.texture_coord_buffer){
            for (let i = 0; i < this.texture_coord_buffer.length; i++){
                this.texture_coord_buffer[i] = 1;
            }
            this.webgl_texture_coord_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_coord_buffer), gl.STATIC_DRAW);
            this.webgl_texture_coord_buffer.itemSize = 2;
            this.webgl_texture_coord_buffer.numItems = this.texture_coord_buffer.length / 2;
        }

        gl.useProgram(glProgram);
    }

    actualizarMatrizModelado(matrizPadre){
        this.matrizModelado = mat4.create();
    
        mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);
        for (let i = 0; i < this.rotations.length; i++){
            mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotations[i][0], this.rotations[i][1]);
        }
        /*
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotationX, [1, 0, 0]);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotationY, [0, 1, 0]);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotationZ, [0, 0, 1]);
        */
        mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);
        if (matrizPadre)
            mat4.multiply(this.matrizModelado, matrizPadre, this.matrizModelado);
    }

    drawWithColor(matrizPadre){
        this.actualizarMatrizModelado();
        var matriz = mat4.create();
        if (!matrizPadre)
            var matrizPadre = mat4.create();
        mat4.multiply(this.matrizModelado, matrizPadre, this.matrizModelado);

        var modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrixUniform, false, this.matrizModelado);

        let normalMatrix = mat4.create();
        mat4.invert(normalMatrix, this.matrizModelado);
        mat4.transpose(normalMatrix, normalMatrix);
        var normalMatrixUniform = gl.getUniformLocation(glProgram, "normalMatrix");
        gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

        var objColor = gl.getUniformLocation(glProgram, "objColor");
        gl.uniform3fv(objColor, this.color);

        if (this.vertexBuffer && this.indexBuffer){
            let vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
            gl.enableVertexAttribArray(vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGL_vertexBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, this.webGL_vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

            let vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
            gl.enableVertexAttribArray(vertexNormalAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGL_normalBuffer);
            gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webGL_indexBuffer);
            gl.drawElements( gl.TRIANGLE_STRIP, this.webGL_indexBuffer.number_vertex_point, gl.UNSIGNED_SHORT, 0);
        }

        for (var i = 0; i < this.hijos.length; i++)
            this.hijos[i].draw(this.matrizModelado);
            
    }

    loadTexture(textureFile){
        let texture = gl.createTexture();
        texture.image = new Image();

        this.texture = texture;

        texture.image.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        texture.image.src = textureFile;
    }

    drawWithTexture(matrizPadre, cameraPosition){
        gl.useProgram(this.program);
        this.actualizarMatrizModelado();
        var matriz = mat4.create();
        if (!matrizPadre)
            var matrizPadre = mat4.create();
        mat4.multiply(this.matrizModelado, matrizPadre, this.matrizModelado);

        var modelMatrixUniform = gl.getUniformLocation(this.program, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrixUniform, false, this.matrizModelado);

        let normalMatrix = mat4.create();
        mat4.invert(normalMatrix, this.matrizModelado);
        mat4.transpose(normalMatrix, normalMatrix);
        var normalMatrixUniform = gl.getUniformLocation(this.program, "normalMatrix");
        gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

        let samplerUniform = gl.getUniformLocation(this.program, "uSampler");
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(samplerUniform, 0);

        if (this.vertexBuffer && this.indexBuffer){
            let vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
            gl.enableVertexAttribArray(vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGL_vertexBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, this.webGL_vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

            let vertexNormalAttribute = gl.getAttribLocation(this.program, "aVertexNormal");
            gl.enableVertexAttribArray(vertexNormalAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGL_normalBuffer);
            gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webGL_indexBuffer);
            gl.drawElements( gl.TRIANGLE_STRIP, this.webGL_indexBuffer.number_vertex_point, gl.UNSIGNED_SHORT, 0);
        }

        if (this.webgl_texture_coord_buffer){
            var textureCoordAttribute = gl.getAttribLocation(this.program, "aUv");
            gl.enableVertexAttribArray(textureCoordAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
            gl.vertexAttribPointer(textureCoordAttribute, this.webgl_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        if (cameraPosition){
            var cameraPos = gl.getUniformLocation(glProgram, "cameraPosition");
            gl.uniform3fv(cameraPos, cameraPosition);
        }

        gl.useProgram(glProgram);

        for (var i = 0; i < this.hijos.length; i++)
            this.hijos[i].draw(this.matrizModelado);
    }

    draw(matrizPadre, cameraPosition){
        if (this.texture)
            this.drawWithTexture(matrizPadre, cameraPosition);
        else
            this.drawWithColor(matrizPadre);
    }

    setGeometry(vertexBuffer, indexBuffer, normalBuffer, uvBuffer){
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
        this.normalBuffer = normalBuffer;
        this.texture_coord_buffer = uvBuffer;
        this.initializeBuffers();
    }

    addChild(objetoHijo){
        this.hijos.push(objetoHijo);
    }

    removeChild(index){
        if (index < this.hijos.length)
            this.hijos.splice(index, 1);
    }

    setPosition(x,y,z){
        this.posicion = vec3.fromValues(x,y,z);
    }

    setFirstRotation(angle, axis){
        this.rotations[0] = [angle, axis];
    }

    setSecondRotation(angle, axis){
        this.rotations[1] = [angle, axis];
    }

    setThirdRotation(angle, axis){
        this.rotations[2] = [angle, axis];
    }

    setRotation(x, y, z){
        this.rotationX = x;
        this.rotationY = y;
        this.rotationZ = z;
    }

    setScale(x,y,z){
        if (y == undefined)
            this.escala = vec3.fromValues(x,x,x);
        else
            this.escala = vec3.fromValues(x,y,z);
    }

    setColor(newColor){
        this.color = newColor;
    }

    getModelMatrix(){
        return this.matrizModelado;
    }

    getPosition(){
        let pos = [0, 0, 0, 1];
        vec4.transformMat4(pos, pos, this.getModelMatrix());
        return pos;
    }
}
