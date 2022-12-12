

	var map = L.map('map').setView([-12.04943045, -75.21671], 13);

	var tiles = L.tileLayer('https://tiles.geodir.co/osm_tiles/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '&copy; <a href="https://maps.geodir.co/" target="_blank">Inkamaps</a> Contribuciones',
	}).addTo(map);

    /*Desabilitar drag*/
    map.dragging.disable();

    /*Modificar marcador por casa*/
    var casaIcon = L.icon({
                        iconUrl: 'assets/house-circle-check-solid.svg',
                        iconSize:     [28, 85], // size of the icon
                        iconAnchor:   [18, 88], // point of the icon which will correspond to marker's location
                        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });
    

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition,
            function(error) {
                if (error.code == error.PERMISSION_DENIED) {
                    console.log("Es necesario activar el GPS");
                    Swal.fire({
                        customClass : {
                            title: 'swal2-title2'
                        },
                        title: 'Es necesario el acceso a GPS del dispositivo',
                        text: "No será capaz de revertir esto!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Dar acceso',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigator.geolocation.getCurrentPosition(showPosition);
                        }
                    })
                }
                
            });
        } else { 
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    var latitud;
    var longitud;
    var address;
    var marker;

    function showPosition(position) {
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;

        marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: casaIcon}).addTo(map);
        map.flyTo([position.coords.latitude, position.coords.longitude], 16);
    
        // agregar api reverso
        // pintar en un input el valor de la direccion obtenido

        //var address = document.getElementById('address');

        axios.get('https://apis.geodir.co/geocoding/v1/json?latlon='+position.coords.latitude+','+position.coords.longitude+'&key=e386035b-c553-4f9e-9354-c6a3e45ef426')
        .then(function (response) {
            // handle success
            console.log(response);
            console.log(response.data.results[0].standard_address);

            //address.value = response.data.results[0].standard_address;
            address = response.data.results[0].standard_address;

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
    }

       
    $('#buttonEnviar').on('click',function(){
               
        var dni = $('#dni').val();
        var nombre = $('#nombre').val();
        var errors = [];
        if (dni.length != 8) {
            errors.push("El DNI debe de tener ocho dígitos.");
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                background: '#151515',
                title: errors,
                customClass : {
                    title: 'swal2-title'
                    },
                showConfirmButton: false,
                timer: 1500
            });
            return
        }
        if (nombre.length < 1) {
            errors.push("El nombre no debe estar vacío.");
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                background: '#151515',
                title: errors,
                customClass : {
                    title: 'swal2-title'
                    },
                showConfirmButton: false,
                timer: 1500
            });
            return
        }

        var fecha = new Date();
        fecha =fecha.getTime();
        let canvas = document.getElementById('canvas');
        let data = canvas.toDataURL('image/png');
        
        var json = {
            "dni": dni,
            "nombre": nombre,
            "fecha": fecha,
            "longitud": longitud,
            "latitud": latitud,
            "foto": data
        };
        console.log(json);

        //var urlLocal = 'http://localhost:8080/usuarios/save';
        //var urlProduccion = 'https://addressverificator.herokuapp.com/usuarios/save';
    // var urlServer = 'https://apihomeverificator.geodir.co/usuarios/save';
        var urlServer= 'http://localhost:8080/v1/usuario';
        axios.post(urlServer, json)
        .then(function (response) {
            console.log(response);
            if(response.data.status == 'OK'){
                Swal.fire({
                position: 'top-end',
                icon: 'success',
                background: '#151515',
                title: 'Domicilio Verificado',
                customClass : {
                    title: 'swal2-title'
                    },
                showConfirmButton: false,
                timer: 1500
            });
            // generatePdf(json.foto)
            document.getElementById('dni').value = '';
            document.getElementById('nombre').value = '';
            }


        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                background: '#151515',
                title: 'No se pudo guardar la información',
                customClass : {
                    title: 'swal2-title'
                    },
                showConfirmButton: false,
                timer: 1500
            });
        });
    
    });

    $('#refreshGps').on('click',function(){
        map.removeLayer(marker);
        getLocation();
    });
    function generatePdf(imagen){
    //   var doc = new jsPDF('p','pt', 'letter');
    //   var imgData = imagen;
    //   doc.addImage(imgData, 'PNG', 25, 25,150 , 'Logo')
    //   doc.output('dataurlnewwindow',{filename:'new.pdf'})
//     const doc = new jsPDF('p','pt', 'letter');
//     doc.addImage(imagen, 'PNG', 25, 25,150 , 'Logo')
// doc.text("Hello world!", 10, 10);
// doc.save("a4.pdf");
var pdf = new jsPDF();
pdf.text(20,20,"Agregar imagenes a un PDF!");
/// Codigo para agregar una imagen
var image1 = new Image();
image1.src = "http://localhost:8080/recursos/images/frank-20221202-8059.png"; /// URL de la imagen
pdf.addImage(image1, 'PNG', 25, 30, 170, 180); // Agregar la imagen al PDF (X, Y, Width, Height)
/////
image1.onload = function(){
pdf.save("mipdf.pdf");
}
    }

    // {/* /* JS comes here */ */}
    (function() {

        var width = 320; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream

        var streaming = false;

        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;


        getLocation();

        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            photo = document.getElementById('photo');
            startbutton = document.getElementById('startbutton');

            navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                })
                .then(function(stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err) {
                    console.log("An error occurred: " + err);
                    Swal.fire({
                        customClass : {
                            title: 'swal2-title2'
                        },
                        title: 'Es necesario el acceso a Cámara del dispositivo',
                        text: "No será capaz de revertir esto!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Dar acceso',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigator.mediaDevices.getUserMedia({
                                video: true,
                                audio: false
                            })
                            .then(function(stream) {
                                video.srcObject = stream;
                                video.play();
                            })
                            .catch(function(err) {
                                console.log("An error occurred: " + err);
                            });
                        }
                    })
                });

            video.addEventListener('canplay', function(ev) {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);

            startbutton.addEventListener('click', function(ev) {
                takepicture();
                ev.preventDefault();
            }, false);

            clearphoto();
        }


        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);

            
        }

        function takepicture() {
               
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);

                var data = canvas.toDataURL('image/png');
                photo.setAttribute('src', data);
                // console.log(data);
            } else {
                clearphoto();
            }

            //setear zindex de elemento imagen
            document.getElementById("photo").style.zIndex = "200";

        }

        $('#buttonQuitarFoto').on('click',function(){
            clearphoto();
            //setear zindex de elemento imagen
            document.getElementById("photo").style.zIndex = "-1";
        });

        window.addEventListener('load', startup, false);
    })();