var mat4=glMatrix.mat4;
var vec2=glMatrix.vec2;
var vec3=glMatrix.vec3;
var vec4=glMatrix.vec4;

var gl = null,
canvas = null,

glProgram = null,
glProgram2 = null,
glProgram3 = null,
glProgram4 = null,
glProgram5 = null,
glProgram6 = null,
fragmentShader = null,
vertexShader1 = null,
vertexShader2 = null;
    /*
var vertexPositionAttribute = null,
trianglesVerticeBuffer = null,
vertexNormalAttribute = null,
trianglesNormalBuffer = null,
trianglesIndexBuffer = null;
    */
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var projMatrix = mat4.create();
var normalMatrix = mat4.create();
var rotate_angle = -1.57078;
var cameraPosition = [1, 0, 0];

var xElement, yElement, zElement,
    speedElement;

var xNode, yNode, zNode, speedNode;

var isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

//var cabin = new Cabin();
//var bar = new Cylinder();
var skid1, cabin, helicopter, aux, camera, sphere, water, extra;
//var controller = new Controller();
var plotSize = 600;
var plotsAmmount = 8; // 8
var plotsShown = 5;
var time = 0;
var deltaTime = 1/60;
var date1, date2;
var date3 = 0;

function initWebGL(){

    canvas = document.getElementById("my-canvas");  

    try{
        gl = canvas.getContext("webgl");      
    }catch(e){
        alert(  "Error: Your browser does not appear to support WebGL.");
    }

    if(gl) {

        setupWebGL();
        initShaders();
        initScreenText();
        createObjects();
        setupVertexShaderMatrix();
        tick();   

    }else{    
        alert(  "Error: Your browser does not appear to support WebGL.");
    }

}

function initScreenText(){
    xElement = document.querySelector("#xPos");
    yElement = document.querySelector("#yPos");
    zElement = document.querySelector("#zPos");
    speedElement = document.querySelector("#speed");
 
    // Create text nodes to save some time for the browser.
    xNode = document.createTextNode("");
    yNode = document.createTextNode("");
    zNode = document.createTextNode("");
    speedNode = document.createTextNode("");
    
    // Add those text nodes where they need to go
    xElement.appendChild(xNode);
    yElement.appendChild(yNode);
    zElement.appendChild(zNode);
    speedElement.appendChild(speedNode);
}

function setupWebGL(){
    gl.enable(gl.DEPTH_TEST);
    //set the clear color
    gl.clearColor(0.1, 0.1, 0.2, 1.0);     
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Matrix de Proyeccion Perspectiva

    mat4.perspective(projMatrix, 45, canvas.width / canvas.height, 0.1, null); // 1200
    mat4.identity(modelMatrix);
    mat4.rotate(modelMatrix,modelMatrix, -1.57078, [1.0, 0.0, 0.0]);

    mat4.identity(viewMatrix);
    //mat4.translate(viewMatrix,viewMatrix, [0.0, 0.0, -5.0]);
    
}
        
function initShaders() {
    //get shader source
    var fs_source = document.getElementById('shader-fs').innerHTML,
        fs_source2 = document.getElementById('terrain-fs').innerHTML,
        fs_source3 = document.getElementById('shader-tex-fs').innerHTML,
        fs_source4 = document.getElementById('water-fs').innerHTML,
        fs_source5 = document.getElementById('shader-tex-2-fs').innerHTML,
        fs_source6 = document.getElementById('sky-fs').innerHTML,
        vs_source1 = document.getElementById('shader-vs').innerHTML,
        vs_source2 = document.getElementById('terrain-vs').innerHTML,
        vs_source3 = document.getElementById('water-vs').innerHTML;

    //compile shaders    
    vertexShader1 = makeShader(vs_source1, gl.VERTEX_SHADER);
    vertexShader2 = makeShader(vs_source2, gl.VERTEX_SHADER);
    vertexShader3 = makeShader(vs_source3, gl.VERTEX_SHADER);
    fragmentShader1 = makeShader(fs_source, gl.FRAGMENT_SHADER);
    fragmentShader2 = makeShader(fs_source2, gl.FRAGMENT_SHADER);
    fragmentShader3 = makeShader(fs_source3, gl.FRAGMENT_SHADER);
    fragmentShader4 = makeShader(fs_source4, gl.FRAGMENT_SHADER);
    fragmentShader5 = makeShader(fs_source5, gl.FRAGMENT_SHADER);
    fragmentShader6 = makeShader(fs_source6, gl.FRAGMENT_SHADER);
    
    //create programs
    glProgram = gl.createProgram();
    glProgram2 = gl.createProgram();
    glProgram3 = gl.createProgram();
    glProgram4 = gl.createProgram();
    glProgram5 = gl.createProgram();
    glProgram6 = gl.createProgram();
    
    //attach and link shaders to the program
    gl.attachShader(glProgram, vertexShader1);
    gl.attachShader(glProgram, fragmentShader1);
    gl.linkProgram(glProgram);

    gl.attachShader(glProgram2, vertexShader2);
    gl.attachShader(glProgram2, fragmentShader2);
    gl.linkProgram(glProgram2);

    gl.attachShader(glProgram3, vertexShader1);
    gl.attachShader(glProgram3, fragmentShader3);
    gl.linkProgram(glProgram3);
    
    gl.attachShader(glProgram4, vertexShader3);
    gl.attachShader(glProgram4, fragmentShader4);
    gl.linkProgram(glProgram4);

    gl.attachShader(glProgram5, vertexShader1);
    gl.attachShader(glProgram5, fragmentShader5);
    gl.linkProgram(glProgram5);

    gl.attachShader(glProgram6, vertexShader1);
    gl.attachShader(glProgram6, fragmentShader6);
    gl.linkProgram(glProgram6);

    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program 1.");
    }

    if (!gl.getProgramParameter(glProgram2, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(glProgram2))
        alert("Unable to initialize the shader program 2.");
    }

    if (!gl.getProgramParameter(glProgram3, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(glProgram3))
        alert("Unable to initialize the shader program 3.");
    }

    if (!gl.getProgramParameter(glProgram4, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(glProgram4))
        alert("Unable to initialize the shader program 4.");
    }

    if (!gl.getProgramParameter(glProgram5, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(glProgram5))
        alert("Unable to initialize the shader program 5.");
    }

    if (!gl.getProgramParameter(glProgram6, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(glProgram6))
        alert("Unable to initialize the shader program 6.");
    }
    
    //use program
    gl.useProgram(glProgram);
}

function makeShader(src, type){
    //compile the vertex shader
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("Error compiling shader: " + gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createObjects(){
    skid1 = new SkidLowerPart();
    aux = new Arm();
    cabin = new Cabin();
    helicopter = new Helicopter();
    helicopter.addTextureProgram(glProgram3);
    helicopter.addCabinTexture("textures/cabina_flip.png");
    helicopter.setPosition(-140,0,140);
    pad = new LandingPad();
    pad.addTextureProgram(glProgram5);
    pad.loadTexture("textures/helipad1.jpg");
    sphere = new Sphere();
    sphere.addTextureProgram(glProgram6);
    sphere.loadTexture("textures/cielo1.jpg");
    camera = new CameraController(helicopter);
    terrain = new Terrain(plotSize, plotsShown, plotsAmmount, 225, 225);
    water = new WaterTerrain(plotSize, plotsShown, plotsAmmount, 200, 200);
    water.loadTexture("textures/agua.jpg");
    water.loadReflectionTexture("textures/cielo_reflex2.jpg");
    water.initBuffers();
    terrain.initHeightTexture("img/heightmap4.png");
    terrain.initTexture("img/tierra.jpg");
    terrain.initTexture("img/roca.jpg");
    terrain.initTexture("img/pasto.jpg");
    terrain.initBuffers();
}

function setupVertexShaderMatrix(){
    gl.useProgram(glProgram);
    //var modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
    var viewMatrixUniform  = gl.getUniformLocation(glProgram, "viewMatrix");
    var projMatrixUniform  = gl.getUniformLocation(glProgram, "projMatrix");
    //var normalMatrixUniform  = gl.getUniformLocation(glProgram, "normalMatrix");

    //gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
    //gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

    gl.useProgram(glProgram2);

    //var modelMatrixUniform = gl.getUniformLocation(glProgram2, "modelMatrix");
    var viewMatrixUniform2  = gl.getUniformLocation(glProgram2, "viewMatrix");
    var projMatrixUniform2  = gl.getUniformLocation(glProgram2, "projMatrix");
    //var normalMatrixUniform2 = gl.getUniformLocation(glProgram2, "normalMatrix");

    //gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform2, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform2, false, projMatrix);
    //gl.uniformMatrix4fv(normalMatrixUniform2, false, normalMatrix);

    gl.useProgram(glProgram3);

    //var modelMatrixUniform = gl.getUniformLocation(glProgram2, "modelMatrix");
    var viewMatrixUniform2  = gl.getUniformLocation(glProgram3, "viewMatrix");
    var projMatrixUniform2  = gl.getUniformLocation(glProgram3, "projMatrix");
    //var normalMatrixUniform2 = gl.getUniformLocation(glProgram3, "normalMatrix");

    //gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform2, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform2, false, projMatrix);
    //gl.uniformMatrix4fv(normalMatrixUniform2, false, normalMatrix);

    gl.useProgram(glProgram4);

    //var modelMatrixUniform = gl.getUniformLocation(glProgram2, "modelMatrix");
    var viewMatrixUniform2  = gl.getUniformLocation(glProgram4, "viewMatrix");
    var projMatrixUniform2  = gl.getUniformLocation(glProgram4, "projMatrix");
    //var normalMatrixUniform2 = gl.getUniformLocation(glProgram4, "normalMatrix");

    //gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform2, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform2, false, projMatrix);
    //gl.uniformMatrix4fv(normalMatrixUniform2, false, normalMatrix);

    gl.useProgram(glProgram5);

    //var modelMatrixUniform = gl.getUniformLocation(glProgram2, "modelMatrix");
    var viewMatrixUniform2  = gl.getUniformLocation(glProgram5, "viewMatrix");
    var projMatrixUniform2  = gl.getUniformLocation(glProgram5, "projMatrix");
    //var normalMatrixUniform2 = gl.getUniformLocation(glProgram5, "normalMatrix");

    //gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform2, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform2, false, projMatrix);
    //gl.uniformMatrix4fv(normalMatrixUniform2, false, normalMatrix);

    gl.useProgram(glProgram6);

    //var modelMatrixUniform = gl.getUniformLocation(glProgram2, "modelMatrix");
    var viewMatrixUniform2  = gl.getUniformLocation(glProgram6, "viewMatrix");
    var projMatrixUniform2  = gl.getUniformLocation(glProgram6, "projMatrix");
    //var normalMatrixUniform2 = gl.getUniformLocation(glProgram6, "normalMatrix");

    //gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform2, false, viewMatrix);
    gl.uniformMatrix4fv(projMatrixUniform2, false, projMatrix);
    //gl.uniformMatrix4fv(normalMatrixUniform2, false, normalMatrix);

    gl.useProgram(glProgram);
}                  

function drawScene(time){
    helicopter.setScale(0.05);
    pad.setPosition(-140, 10, 138);
    pad.setScale(1, 1, 2);

    helicopter.draw();
    let helicopterPosition = helicopter.getPosition();
    let helicopterHeight = helicopter.getHeight();
    let helicopterSpeed = helicopter.getSpeed();

    sphere.setPosition(helicopterPosition[0], -500, helicopterPosition[2]);
    sphere.draw();

    xNode.nodeValue = helicopterPosition[0].toFixed(2);
    yNode.nodeValue = helicopterHeight.toFixed(0);
    zNode.nodeValue = helicopterPosition[2].toFixed(2);
    speedNode.nodeValue = ((helicopterSpeed * 1900).toFixed(0)).toString() + " km/h";

    terrain.draw(helicopterPosition);
    water.draw(helicopterPosition, time);
    pad.draw();
}

function animate(){
    cameraPosition = camera.getCameraPosition();
    let cameraTarget = camera.getTargetPosition();
    let normal = camera.getCameraNormal();
    
    mat4.lookAt(viewMatrix, cameraPosition, cameraTarget, normal);

    mat4.identity(modelMatrix);
    mat4.identity(normalMatrix);
    mat4.multiply(normalMatrix, viewMatrix, modelMatrix);
    mat4.invert(normalMatrix, normalMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
}

function tick(){
    requestAnimationFrame(tick);
    helicopter.tick(deltaTime);
    animate();
    setupVertexShaderMatrix();
    drawScene(time);
    time += deltaTime;
}

window.onload=initWebGL;