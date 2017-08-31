# Casos de uso

El siguiente documento muestra los casos de uso pensados para nuestra aplicación. Los casos de uso fueron separados en las siguientes secciones para tenerlos más ordenados:
* Login
* Perfil
* Amistades y favoritos
* Deportes
* Mensajes
* Partidos
* Equipos

## Actores
* Jugador (Player). Usuario que asiste a partidos, etc.
* Dueño de Recintos (Compound Owner). Dueño de canchas y recintos para arrendar a jugadores.
* Vista (Usuario no registrado). No podrá hacer casi nada en la aplicación.

Observación: al decir “Usuario” significa cualquier usuario registrado (dueño o jugador).


## Casos de uso
### Login
1. Usuario hace login usando su mail y una contraseña
2. Usuario crea una cuenta ingresando sus datos (al menos nombre, mail, contraseña)  
3. Usuario edita sus datos personales
4. Usuario elimina su cuenta

### Perfil
5. Usuario ve perfil de algún usuario (puede ser él mismo)
6. Usuario ve partidos públicos en los que otro jugador está invitado
7. Usuario ve equipos en los que está otro jugador

### Amistades y Favoritos
8. Jugador agrega otro jugador como amigo
9. Jugador acepta o rechaza solicitud de amistad de otro jugador
10. Jugador deja de ser amigo de otro jugador
11. Jugador guarda un recinto en lista de favoritos

### Deportes
12. Jugador puede agregar y eliminar deportes que practica
13. Usuario puede ver deportes que un jugador amigo practica

### Mensajes
14. Jugador escribe/edita/elimina mensaje en muro de otro jugador
15. Jugador califica otro jugador (si es que han jugado un partido)

### Partidos
16. Usuario ve sus partidos
17. Usuario ve detalle de un partido (información básica, invitados)
18. Jugador crea un partido (puede ser público o privado)
19. Jugador elimina un partido (si es creador del partido)

#### Invitaciones
20. Jugador invita amigos a un partido
21. Jugador invita equipos a un partido
22. Jugador confirma o rechaza asistencia a un partido al que fue invitado (o partido que creó)
23. Jugador solicita poder asistir a un partido público
24. Jugador capitán acepta o rechaza solicitud de jugador de unirse a partido
25. Jugador capitán elimina a un invitado de un partido

#### Canchas
26. Jugador revisa horario disponible, precios, dirección y otra información básica de canchas
27. Jugador reserva una cancha para un partido
28. Dueño de recinto confirma o rechaza reserva de cancha hecha por un jugador para un partido

#### Publicaciones
29. Jugador capitán registra el resultado del partido
30. Jugador invitado al partido deja un mensaje sobre un partido que aún no se juega
31. Jugador deja un mensaje/foto/calificación sobre un partido que jugó
32. Dueño deja un mensaje/foto/calificación sobre un partido que se jugó en alguno de sus recintos
33. Usuario edita/elimina una publicación que dejó en el partido

### Equipos
34. Jugador ve sus equipos
35. Jugador crea un nuevo equipo
36. Jugador capitán edita la información de un equipo
37. Jugador capitán elimina su equipo
38. Jugador capitán elige dejar de ser capitán del equipo
39. Jugador capitán designa a otros jugadores como capitanes del equipo

#### Invitaciones
40. Jugador capitán invita a otros jugadores a su equipo

#### Publicaciones
41. Jugador escribe mensaje en muro público de equipo
42. Jugador que es parte de un equipo escribe mensaje en foro privado de equipo
43. Jugador edita/elimina mensaje que escribió en muro/foro del equipo

### Búsqueda
44. Usuario busca otros Usuarios
45. Usuario busca recintos/canchas
46. Usuario busca partidos públicos

### Recintos
47. Jugador crea/edita/elimina mensaje/calificación en muro de recinto
