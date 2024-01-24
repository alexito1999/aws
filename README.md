<h1>Automatizacion con jenkins y despliege en AWS</h1>
<h2>Dockerizamos nuestro jenkins</h2>
En primer lugar montamos nuestro dockerfile, con ciertas caracteristicas:

### Dockerfile

1.Imagen de jenkins mas actual hasta la fecha

2.El plugin de AWS para usarla en el despliege

3.Añadir al grupo docker el usuario jenkins 

En segundo lugar, construimos un docker compose para:

### Docker-compose

1. Usamos la imagen ya construida para levantarlo
2. Sentenciamos los puertos
3. y creamos una carpeta permanente para no perder los datos de nuestro jenkins

<h2>Inicio del jenkins </h2>

Para ello crearemos nuestro primer job usando un "pipeline" en mi caso lo llamare proyecto-aws.

Para ello vamos a sentenciar 6 etapas para llegar al despliege que iremos explicando paso a paso.

pipeline {
    agent any

    stages {
        stage('Clear') {
            steps {
                sh 'rm -rf *'
            }
        }
        stage('Clonar repositorio') {
            steps {
                sh 'git clone https://github.com/alexito1999/Maria-proyecto.git'
            }
        }
        stage('Build') {
            steps {
                sh "cd Maria-proyecto && docker build -t zanaorio88/proyecto-web:1.0-${BUILD_ID} ."
            }
        }
        stage('Login') {
            steps {
                sh "docker login --username zanaorio88 --password-stdin < ~/password.txt"
            }
        }
        stage('Push') {
            steps {
                sh "docker push zanaorio88/proyecto-web:1.0-${BUILD_ID}"
            }
        }
        stage('Deploy') {
            steps {
                sh 'ssh -i "secret.pem" ubuntu@ec2-34-244-107-191.eu-west-1.compute.amazonaws.com'
                sh 'cd Maria-proyecto && docker build -t proyecto-web:1.0-${BUILD_ID} . '
                sh 'cd Maria-proyecto && docker run -d -p 8080:8080 proyecto-web:1.0-${BUILD_ID} '
            }
        }
    }
}

En la primera etapa, borramos todo lo que tengamos dentro cada vez que construyamos cada stage para evitar tneer codigo repetido por si tocamos algo nuevo.

En la segunda etapa, clonamos el repositorio en nuestro lugar de trabajo. Jenkins tiene una zona de trabajo llamada workspace donde crea los jobs y hay es donde clonara nuestro repositorio.

En la tercera etapa, vamos hacer el build para ello tendremos que entrar en nuestra carpeta q se crea por defecto con el git clone y construiremos la imagen con nuestro proyecto. En este paso hay varios pasos previos o post si os ha fallado como a mi.

1. Para poder realizar cualquier conexion necesitaremos darle permisos a nuestro usuario jenkins para q se pueda comunicar con el docker para ello haremos esto:
2. docker exec -it -u root <nombre del contenedor> bash      --- con esto nos meteremos en nuestro contenedor como usuario root
3. chown root:jenkins /var/run/docker.sock                   --- con esto daremos permiso al usuario jenkins para que se comunique con el docker, y si todo falla siempre podemos hacer un chmod 666 /var/run/docker.sock para dar permisos a todos y hacer cambios rapidos por si queremos ir rapidos. 
4. Para facilitar la disitincion entre las imagenes creadas usamos un parametro propio de jenkins que es un valor autoincremental que se genera con cada construccion del pipeline y hací poner un tag diferente a cada imagen.

En la cuarta etapa, procederemos a logearnos en el docker hub para ello tendremos que tener unos requisitos previos:
1. Registrarse en docker hub
2. Crear un repositiorio para albergar la futura imagen
3. Crear un token que lo usaremos para linkear nuestra cuenta dockear y hacer el login. Guardaremos la contraseña del token para usarla
4. Crearemos en el archivo raiz de jenkins q en este caso es "jenkins_home" y crearemos con el nano un archivo de texto donde almacenaremos la contraseña del token.
5. Nuestro codigo leera el archivo que creamos previamente para poner la contraseña de nuestro token ya que el docker login necesita la contraseña de nuestro docker y el token sirve como ella.

En la quinta etapa, procederemos con el push de la imagen al registry de docker con el comando que nos facilita docker hub y la etiqueta es la misma que pusimos en el build.

En la sexta etapa, iremos al job donde tenemos nuestro trabajo y vamos a ejecutar un chmod 400 para mi calve en este caso se llama secret.pem de paso con un nano en la ubicacion de mi job creo ese archivo y le meto el contenido del archivo pem que aws me dio y luego el pipeline se puede ejecutar sin problemas. 

