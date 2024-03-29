class Terrain{
    constructor(size, plotsShown, plotsAmmount, latitudeBands, longitudeBands){
    
        this.latitudeBands = latitudeBands;
        this.longitudeBands = longitudeBands;
        this.size = size;
        this.plotsShown = plotsShown;
        this.plotsAmmount = plotsAmmount;
        
        this.position_buffer = null;
        this.normal_buffer = null;
        this.texture_coord_buffer = null;
        this.index_buffer = null;

        this.webgl_position_buffer = null;
        this.webgl_normal_buffer = null;
        this.webgl_texture_coord_buffer = null;
        this.webgl_index_buffer = null;
        
        this.heightTexture = null;
        this.positionX = 0;
        this.positionY = 0;

        this.textures = [];

        this.lightVector = [1, -1, 1];

        this.modelMatrix = mat4.create();
    }

    initTexture(file){ 
        let texture = gl.createTexture();
        texture.image = new Image();
        
        this.textures.push(texture);

        texture.image.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 					// invierto el ejeY					
            gl.bindTexture(gl.TEXTURE_2D, texture); 						// activo la textura
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);	// cargo el bitmap en la GPU
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);					// selecciono filtro de magnificacion
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);	// selecciono filtro de minificacion
            
            gl.generateMipmap(gl.TEXTURE_2D);		// genero los mipmaps
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        texture.image.src = file;
    }

    initHeightTexture(textureFile){
        let texture = gl.createTexture();
        texture.image = new Image();

        this.heightTexture = texture;

        texture.image.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        texture.image.src = textureFile;
    }
        
    initBuffers(){
        this.position_buffer = [];
        this.normal_buffer = [];
        this.texture_coord_buffer = [];

        var latNumber;
        var longNumber;

        for (latNumber=0; latNumber <= this.latitudeBands; latNumber++) {
            for (longNumber=0; longNumber <= this.longitudeBands; longNumber++) {
                var x = (-0.5+(latNumber/this.latitudeBands)) * this.size;
                var z = (-0.5+(longNumber/this.longitudeBands)) * this.size;
                var y = 0;

                var u = (longNumber / this.longitudeBands);
                var v = 1 - (latNumber / this.latitudeBands);

                this.normal_buffer.push(0);
                this.normal_buffer.push(1);
                this.normal_buffer.push(0);

                this.texture_coord_buffer.push(u);
                this.texture_coord_buffer.push(v);
                
                this.position_buffer.push(x);
                this.position_buffer.push(y);
                this.position_buffer.push(z);
            }
        }

        // Buffer de indices de los triangulos
        this.index_buffer = [];
        let columns = this.longitudeBands;
        let rows = this.longitudeBands;
        function getIndex(i,j){return i * (columns + 1) + j;}

        for (let i=0; i < rows; i++) {
            for (let j=0; j <= columns; j++) {
                this.index_buffer.push(getIndex(i, j));
                this.index_buffer.push(getIndex(i + 1, j));            
            }
            this.index_buffer.push(getIndex(i + 1, columns));
            this.index_buffer.push(getIndex(i + 1, 0));
        }

        gl.useProgram(glProgram2);
        this.webgl_normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal_buffer), gl.STATIC_DRAW);
        this.webgl_normal_buffer.itemSize = 3;
        this.webgl_normal_buffer.numItems = this.normal_buffer.length / 3;

        this.webgl_texture_coord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_coord_buffer), gl.STATIC_DRAW);
        this.webgl_texture_coord_buffer.itemSize = 2;
        this.webgl_texture_coord_buffer.numItems = this.texture_coord_buffer.length / 2;

        this.webgl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW);
        this.webgl_position_buffer.itemSize = 3;
        this.webgl_position_buffer.numItems = this.position_buffer.length / 3;

        this.webgl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
        this.webgl_index_buffer.itemSize = 1;
        this.webgl_index_buffer.numItems = this.index_buffer.length;
        gl.useProgram(glProgram);
    }

    updatePosition(helicopterPosition, xPlotOffset, zPlotOffset){
        let xShift = (Math.floor(helicopterPosition[0] / this.size + 0.5) + xPlotOffset) * this.size;
        let zShift = (Math.floor(helicopterPosition[2] / this.size + 0.5) + zPlotOffset) * this.size;

        this.modelMatrix = mat4.create();
        mat4.translate(this.modelMatrix, this.modelMatrix, [xShift, 0, zShift]);
    }

    getCoordinates(helicopterPosition, xPlotOffset, zPlotOffset){
        let totalSize = this.size * this.plotsAmmount;
        let xPos = helicopterPosition[0] % totalSize;
        if (xPos < 0)
            xPos = totalSize + xPos;
        let xCoord = (Math.floor(xPos / this.size + 0.5) + xPlotOffset) % this.plotsAmmount;

        let zPos = helicopterPosition[2] % totalSize;
        if (zPos < 0)
            zPos = totalSize + zPos;
        let zCoord = (Math.floor(zPos / this.size + 0.5) + zPlotOffset) % this.plotsAmmount;
        
        return [xCoord, zCoord];
    }

    draw(helicopterPosition){
        let topOffset = Math.floor(this.plotsShown / 2);
        gl.useProgram(glProgram2);
        for (let i = -topOffset; i <= topOffset; i++){
            for (let j = -topOffset; j <= topOffset; j++){
                this.updatePosition(helicopterPosition, i, j);
                let coords = this.getCoordinates(helicopterPosition, i, j);

                var modelMatrixUniform = gl.getUniformLocation(glProgram2, "modelMatrix");
                gl.uniformMatrix4fv(modelMatrixUniform, false, this.modelMatrix);

                var lightVectorUniform = gl.getUniformLocation(glProgram2, "lightVector");
                gl.uniform3fv(lightVectorUniform, this.lightVector);

                var heliPositionUniform = gl.getUniformLocation(glProgram2, "helicopterCoords");
                gl.uniform2fv(heliPositionUniform, coords);

                var vertexPositionAttribute = gl.getAttribLocation(glProgram2, "aPosition");
                gl.enableVertexAttribArray(vertexPositionAttribute);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
                gl.vertexAttribPointer(vertexPositionAttribute, this.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

                var textureCoordAttribute = gl.getAttribLocation(glProgram2, "aUv");
                gl.enableVertexAttribArray(textureCoordAttribute);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
                gl.vertexAttribPointer(textureCoordAttribute, this.webgl_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);

                /* NO USO LAS NORMALES, OPTIMIZACION
                var vertexNormalAttribute = gl.getAttribLocation(glProgram2, "aNormal");
                gl.enableVertexAttribArray(vertexNormalAttribute);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
                gl.vertexAttribPointer(vertexNormalAttribute, this.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
                */

                let samplerUniformH = gl.getUniformLocation(glProgram2, "uSamplerH");
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.heightTexture);
                gl.uniform1i(samplerUniformH, 0);

                let samplerUniform0 = gl.getUniformLocation(glProgram2, "uSampler0");
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
                gl.uniform1i(samplerUniform0, 1);

                let samplerUniform1 = gl.getUniformLocation(glProgram2, "uSampler1");
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
                gl.uniform1i(samplerUniform1, 2);

                let samplerUniform2 = gl.getUniformLocation(glProgram2, "uSampler2");
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
                gl.uniform1i(samplerUniform2, 3);
                
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
                
                //gl.uniform1i(glProgram.useLightingUniform,(lighting=="true"));                    
                gl.drawElements(gl.TRIANGLE_STRIP, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
                //gl.drawElements(gl.LINE_STRIP, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
                        
                
                /*
                if (modo!="smooth") {
                    gl.uniform1i(shaderProgram.useLightingUniform,false);
                    gl.drawElements(gl.LINE_STRIP, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
                }
                */
            }
        }
        gl.useProgram(glProgram);
    }
}
