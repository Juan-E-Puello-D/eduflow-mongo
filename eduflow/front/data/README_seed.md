Seed generation completed.

Collections generated:
- usuarios.json: 1000 users (80 instructors, 920 students)
- cursos.json: 20 courses with embedded lessons
- inscripciones.json: 1200 enrollments
- comentarios.json: 1100 comments with embedded replies

Import with mongoimport:

mongoimport --uri "mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow" --collection usuarios --file data/usuarios.json --jsonArray
mongoimport --uri "mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow" --collection cursos --file data/cursos.json --jsonArray
mongoimport --uri "mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow" --collection inscripciones --file data/inscripciones.json --jsonArray
mongoimport --uri "mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow" --collection comentarios --file data/comentarios.json --jsonArray

Alternativamente, si no tienes mongoimport instalado, puedes ejecutar:

npm run import-seed
