# Presentacion

### Introducción
* Buenos días, somos Tomas Borchers y Pablo Pino, y les vamos a presentar nuestra aplicación del proyecto semestral.
* Bueno, no sé si les ha ocurrido, pero a veces uno intenta juntar gente para un partido, por ejemplo de futbol, y se encuentra con muchas dificultades, hay gente que no puede, gente que se baja a ultima hora, etc. Nosotros quisimos hacer una aplicación que ayudara con el proceso, además de aportar más cosas entretenidas a esto.

* Como estructura general de la app, la aplicación está pensada para dos tipos de usuarios: jugadores y dueños de recintos; además hay un usuario extra que es administrador. Los jugadores organizarán sus partidos, y los dueños ofrecerán sus canchas para arrendar. Además, otras entidades que iremos viendo en la aplicación son equipos, partidos, recintos y canchas.

* Ahora pasaremos a la demo, les vamos a mostrar la historia de un usuario jugador que quiere utilizar nuestra aplicación.

```
Partir en perfil del usuario de Pablo, con login
```
### Historia
* Una persona que quiere usar la aplicación como jugador se crea un usuario. En este caso ya creamos la cuenta, y ya estamos loggeados. Aquí estamos en el perfil del usuario, donde hay hartas cosas que iremos viendo durante la demo.

```
Mostrar que está loggeado en barra
```

#### Agregar deporte
* Bueno, ‎yo juego fútbol, asi que vamos a agregar que juego este deporte
```
Seleccionar agregar deporte a jugar, futbol + delantero
```
... se puede indicar la posición, para que otras personas tengan una idea.
* Los deportes que aparecen aquí son creados y manejados por el usuario administrador
```
Volver a perfil
```

* Se pueden agregar todos los deportes que uno quiera

#### Agregar amigo
* Ahora, los usuarios necesitan interactuar con sus amigos para los partidos. Para esto, vamos a jugadores a buscar a nuestros amigos
```
Ir a jugadores, buscar amigo Pedro e ir a su perfil
```
* Aquí lo podemos agregar como amigo, y necesitamos de su confirmación.
```
Agregar amigo
```
* Tenemos su cuenta abierta en otra parte
```
Cambiar a usuario Pedro
```
* Estamos en el home de usuario. Arriba a la izquierda vemos sus notificaciones. Estas están mostradas con una aplicación react. Puede poner recargar, y aparece la nueva notificación de que lo agregaron como amigo.
```
Poner recargar notificaciones
```
* Puede responder la solicitud aquí mismo o ir a su perfil y responderla.
```
Aceptar solicitud
```
* ‎Volvemos al usuario anterior, recargamos la página y aparece su muro y le podemos escribir
```
Señalar muro y escribir un mensaje: Hola Pedro!
```
* Los comentarios en el muro están hechos con una aplicación en react, que se encarga de dejar un nuevo comentario, y cargarlos

* Los amigos van a apareciendo al costado

#### Crear un equipo
* Digamos que ahora quiero crear un equipo. Podemos ir a equipos y crear equipo
```
Ir a equipos y seleccionar crear
```
* Aquí indicamos un nombre, podemos subir un logo y debemos indicar el deporte
```
Rellenar formulario:
  kame-house
  sin logo,
  futbol
```
* Ahora, este es el perfil de equipo. Cada equipo va a tener uno o más capitanes, que son los que pueden editar la información del equipo. Al crear un equipo yo quedo automáticamente agregado como capitán.
* Podemos invitar a algún amigo, seleccionarlo como capitán si queremos
```
Invitar a un amigo AAA y volver al muro
```
* Como es amigo nuestro, queda automáticamente agregado al equipo sin tener que aceptar una invitación

* Además, un equipo cuenta con dos tipos de muro, público y privado
```
Mostrar sección de muro, indicar switch entre ambos
```
* Por ser un miembro puedo escribir en ambos, otros usuarios sólo pueden ver y escribir en el público
```
Escribir en muro privado: 'cuándo jugamos un partido?'
Escribir en muro público: 'qué gran equipo!!'
```
* Este muro de comentarios también está hecho en react, reutilizando el componente que ya vieron en el muro de usuarios

##### Jugador crea un partido
* Bueno, ya tenemos un jugador, amigos y un equipo, podemos pasar a crear un partido.
```
Ir a partidos, crear
```
* Por defecto tiene ese nombre, aunque lo podríamos cambiar. Podemos elegir si es publico o privado, le podemos poner fecha, lo dejaremos en blanco por ahora. Tenemos que seleccionar el deporte
```
Crear partido: 'Partido de Pablo', publico, futbol
```
* Este es el perfil de partido. Al crear el partido quedo automáticamente confirmado a este

* Aquí puedo invitar a mis amigos al partido, invitaremos a _Lucas_
```
Invitar a jugador Lucas a partido
```
* A _Lucas_ le llegará una notificación que tiene que aceptar, por eso aparece como "no confirmado"

* También podemos invitar a equipos completos al partido. Eso le envía una notificación al capitán para que acepte. Cuando acepta, se invita automáticamente a todos sus miembros
  - vamos a invitar al equipo 'joga bonito', que es del amigo Pedro que ya invitamos
```
Invitar a equipo 'joga bonito'
```
* Vamos al usuario Pedro, a su equipo, y aceptamos la invitación al partido.
```
Ir a pantalla con usuario Pedro (abajo), su equipo y aceptar invitación
```
* Volvemos al partido de Pablo, y vemos que los jugadores Pedro y Antonio también fueron invitados pq están en el equipo 'joga bonito'.

* Además, el partido tiene un muro. Sólo la gente invitada al partido puede ver los comentarios y comentar, incluso para los partidos públicos. Estos comentarios también están hechos en react reusando la misma aplicación que ya hemos visto.
```
Hacer un comentario: 'se viene el partido!!' o 'yo llevo la pelota!'
```
* Por último, podemos pedir una cancha. Para eso, vamos a mostrarles cómo un dueño pone a disposición sus canchas

#### Crear recinto
```
Ir a pantalla de Tomas (derecha)
```
* Tomas es un dueño de recinto, lo tenemos loggineado acá, y va a crear un recinto
```
Ir a recintos, seleccionar crear con Foursquare
```
* Puede crearlo manualmente o usar Foursquare. Digamos que Tomás es dueño de un recinto R1 que está ingresado en foursquare.
```
Seleccionar recinto R1 con foursquare
```
* ‎Luego de esto debe crear una cancha y asignarle un horario a esta
* ‎Tomas ya tiene otra recinto con una cancha ya creada, que se muestra acá
```
Ir a recinto El Sausalito de tomas
```

#### Volviendo al partido...
* Ahora, volvemos al partido para pedir la cancha
```
Hacer click en pedir cancha,
seleccionar recinto El Sausalito de Tomas,
seleccionar cancha Cancha 1,
seleccionar horario
```
* Seleccionamos uno de los horarios disponibles y la pedimos. Esto también le manda una notificación al dueño
* Vamos a la pantalla de Tomás y la aceptamos
```
Ir a pantalla tomas (derecha) y aceptar cancha (definir dia!!)
```
* Volviendo a partido, vemos que la cancha queda pedida y también se puede anular la reserva
```
Volver a partido
```

#### Jugador termina partido
* Bueno, ¿qué pasa cuando termina el partido? Vamos a ir a este otro partido que tengo creado, con varios amigos y dos equipos invitados
```
Ir a partido 'Partido del domingo'
```
* Ya paso la fecha de este partido, por lo que puedo darlo por terminado
```
Dar por terminado partido
```
* Esto activará las reviews, lo que significa que todos los jugadores podrán dar reviews a todos los otros participantes del partido, y en el caso de que haya una cancha pedida tmb doy review al recinto.
```
Mostrar que aparecen reviews
```
* Por su parte, ‎el dueño también puede dar reviews a los jugadores
* Luego en el perfil de un jugador se ve su promedio de reviews y las últimas
```
Volver a mostrar perfil de jugador
```

#### Home de usuario
* Por último mostrarles el home del usuario de manera completa.
```
Ir al home de Pablo
```
* Ya vimos las notificaciones, pero ahora también les muestro que están organizados los partidos del usuario en confirmados, por confirmar y los pasados.

#### Cierre
* Bueno con todo lo anterior esperamos los jugadores disfruten armando sus partidos y se les facilite la organización de estos.

Muchas gracias.
