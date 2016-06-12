var container, camera, scene, renderer, heart;

var isDragging = false;


var mouse = {
    X: 0,
    Y: 0
};

var prevMouse = {
    x: 0,
    y: 0
};

function toRadians(x) {
    return x * Math.PI / 180;
}

$(function () {
    initialize();
    animate();
});


function sceneInit() {
    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

}

function initialize() {
    container = document.getElementById("container");

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 5;

    sceneInit();

    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {

        console.log(item, loaded, total);

    };

    var texture = new THREE.Texture();
    var loader = new THREE.ImageLoader(manager);
    loader.load("Content/wood.png", function (image) {

        texture.image = image;
        texture.needsUpdate = true;

    });

    var modelLoader = new THREE.OBJLoader(manager);
    modelLoader.load('Scripts/heart-texture.json',
        function (object) {
            heart = object;


            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    console.log('child');
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });


            //object.position.x = -100;
            //object.position.y = -55;
            //object.position.z = 100;

            object.scale.x = object.scale.y = object.scale.z = 0.05;

            scene.add(object);

        });


    renderer = new THREE.WebGLRenderer({ alpha: true });
    //renderer.setPixelRatio(window.pixels);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x5E82A6, 1);
    container.appendChild(renderer.domElement);

    $(renderer.domElement)
                   .on('mousedown',
                       function (e) {
                           isDragging = true;
                       })
                   .on('mousemove',
                       function (e) {
                           //console.log(e);
                           var deltaMove = {
                               x: e.offsetX - prevMouse.x,
                               y: e.offsetY - prevMouse.y
                           };

                           if (isDragging) {

                               var deltaRotationQuaternion = new THREE.Quaternion()
                                   .setFromEuler(new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ'));

                               heart.quaternion.multiplyQuaternions(deltaRotationQuaternion, heart.quaternion);
                           }

                           prevMouse = {
                               x: e.offsetX,
                               y: e.offsetY
                           };
                       });

    $(document).on('mouseup', function (e) {
        isDragging = false;
    });

    window.addEventListener("resize", onWindowResize, false);


    $(window).bind('mousewheel', function (event) {
        console.log(camera.position.z);

        if (event.originalEvent.wheelDelta >= 0) {
            if (camera.position.z > 3) {
                camera.position.z -= .1;
            }
        }
        else {
            if (camera.position.z < 10) {
                camera.position.z += .1;
            }
        }
    });

}


function onWindowResize() {


    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {

    camera.position.x += (mouse.X - camera.position.x) * .05;
    camera.position.y += (-mouse.Y - camera.position.y) * .05;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);

}


