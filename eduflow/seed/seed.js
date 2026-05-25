import fs from "fs/promises";
import path from "path";
import { ObjectId } from "mongodb";

const dataDir = path.join(process.cwd(), "data");

const instructorNames = [
  "Ana Gómez", "Carlos Ruiz", "Marta Soto", "Juan Pérez", "Luis Silva", "Kamila Torres", "Paula Rueda",
  "Nicolás Muñoz", "Valentina Ortiz", "Diego Rojas", "Camila Castro", "Mateo Vargas", "Julia Méndez",
  "Sofía Jiménez", "Andrés León", "Laura Herrera", "Alejandro Díaz", "Isabella Morales", "Sebastián Cruz", "Mariana Blanco"
];

const studentNames = [
  "Daniela Vega", "Santiago Pérez", "Luciana Gómez", "Emiliano Sánchez", "Isabela Quiroga", "Mateo Flores",
  "María Camacho", "Joaquín Herrera", "Daniel Ortega", "Sara Arias", "Tomás Ramírez", "Paloma Navarro",
  "Federico Castillo", "Camila León", "Agustín Salazar", "Alejandra Bravo", "Bruno Mendoza", "Carolina Silva",
  "Marcos Andrade", "Valeria Rivas"
];

const categories = ["Programación", "Data Science", "DevOps", "Diseño", "Marketing", "Negocios", "Finanzas", "Idiomas"];
const tags = ["node", "react", "mongo", "express", "typescript", "graphql", "aws", "docker", "ux", "productividad"];
const courseTitles = [
  "Node.js desde cero",
  "MongoDB Avanzado",
  "React con TypeScript",
  "Desarrollo Fullstack con MERN",
  "APIs REST seguras",
  "Automatización con DevOps",
  "Análisis de datos con Python",
  "Diseño de experiencia de usuario",
  "Marketing digital para cursos",
  "Finanzas personales para emprendedores",
  "Cloud Computing con AWS",
  "Integración continua y despliegue",
  "Migración de datos a MongoDB",
  "Optimización de aplicaciones web",
  "Web scraping y ETL",
  "Narrativa visual para cursos",
  "Metodologías ágiles en proyectos",
  "Gestión de proyectos educativos",
  "Estrategias pedagógicas digitales",
  "Seguridad y buenas prácticas web"
];

const sampleDescriptions = [
  "Aprende los fundamentos y prácticas reales para construir aplicaciones modernas.",
  "Domina MongoDB y el modelado NoSQL para proyectos de educación y negocio.",
  "Construye interfaces interactivas con React y componentes reutilizables.",
  "Lleva tus APIs al siguiente nivel con validación, seguridad y escalabilidad.",
  "Automatiza el ciclo de vida de tus deployments con herramientas de DevOps.",
  "Organiza tu contenido educativo con un modelo de datos híbrido y flexible.",
  "Optimiza la experiencia de tus estudiantes usando métricas reales de progreso.",
  "Crea cursos atractivos con lecciones multimedia y recursos prácticos."
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (array) => array[randomInt(0, array.length - 1)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const makeOid = () => new ObjectId();

const toExtendedJson = (value) => {
  if (value instanceof ObjectId) {
    return { $oid: value.toHexString() };
  }
  if (value instanceof Date) {
    return { $date: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return value.map(toExtendedJson);
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = toExtendedJson(value[key]);
    }
    return result;
  }
  return value;
};

const buildUsers = () => {
  const users = [];
  const instructors = [];

  for (let i = 0; i < 1000; i += 1) {
    const isInstructor = i < 80;
    const name = isInstructor ? instructorNames[i % instructorNames.length] : `${randomItem(studentNames)} ${randomInt(1, 99)}`;
    const userId = makeOid();
    const user = {
      _id: userId,
      nombre: name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, "")}${randomInt(1, 99)}@eduflow.com`,
      rol: isInstructor ? "instructor" : "estudiante",
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D6EFD&color=ffffff`,
      fechaRegistro: randomDate(new Date(2023, 0, 1), new Date(2024, 3, 30)),
      preferencias: {
        idioma: randomItem(["es", "en"]),
        modoOscuro: Math.random() < 0.35,
      },
      cursosCreados: isInstructor ? [] : undefined,
    };

    users.push(user);
    if (isInstructor) instructors.push(user);
  }

  return { users, instructors };
};

const buildCourses = (instructors) => {
  const courses = [];
  const allLessons = [];

  for (let index = 0; index < courseTitles.length; index += 1) {
    const courseId = makeOid();
    const instructor = instructors[index % instructors.length];
    const lecciones = Array.from({ length: randomInt(4, 7) }, (_, lessonIndex) => {
      const lessonId = makeOid();
      const lesson = {
        _id: lessonId,
        titulo: `Lección ${lessonIndex + 1}: ${randomItem(["Introducción", "Estructura", "Práctica", "Proyecto", "Herramientas", "Tips avanzados", "Resumen"])}`,
        videoUrl: `https://videos.eduflow.com/${courseId.toHexString()}/leccion-${lessonIndex + 1}.mp4`,
        duracion: randomInt(7, 18),
        orden: lessonIndex + 1,
        recursos: [`https://docs.eduflow.com/cursos/${courseId.toHexString()}/leccion-${lessonIndex + 1}`],
      };
      allLessons.push({ courseId, ...lesson });
      return lesson;
    });

    const course = {
      _id: courseId,
      titulo: courseTitles[index],
      descripcion: randomItem(sampleDescriptions),
      instructorId: instructor._id,
      categoria: randomItem(categories),
      precio: parseFloat((randomInt(0, 1) === 0 ? 0 : randomInt(15, 99)).toFixed(2)),
      etiquetas: [randomItem(tags), randomItem(tags), randomItem(tags)].filter((v, idx, arr) => arr.indexOf(v) === idx),
      duracionTotal: lecciones.reduce((sum, l) => sum + l.duracion, 0),
      fechaCreacion: randomDate(new Date(2023, 0, 1), new Date(2024, 3, 30)),
      lecciones,
      nivel: randomItem(["Básico", "Intermedio", "Avanzado"]),
      publicado: true,
    };

    courses.push(course);
    instructor.cursosCreados.push(courseId);
  }

  return { courses, allLessons };
};

const buildEnrollments = (students, courses, allLessons) => {
  const enrollments = [];
  const usedPairs = new Set();

  while (enrollments.length < 1200) {
    const student = students[randomInt(0, students.length - 1)];
    const course = courses[randomInt(0, courses.length - 1)];
    const pairKey = `${student._id.toHexString()}_${course._id.toHexString()}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const courseLessons = course.lecciones;
    const completedCount = randomInt(0, courseLessons.length);
    const completed = courseLessons
      .slice(0, completedCount)
      .map((lesson) => lesson._id);

    enrollments.push({
      _id: makeOid(),
      usuarioId: student._id,
      cursoId: course._id,
      leccionesCompletadas: completed,
      porcentajeProgreso: courseLessons.length === 0 ? 0 : Math.round((completedCount / courseLessons.length) * 100),
      fechaInscripcion: randomDate(new Date(2024, 0, 1), new Date(2024, 3, 20)),
      ultimaActividad: randomDate(new Date(2024, 3, 21), new Date(2024, 4, 30)),
    });
  }

  return enrollments;
};

const buildComments = (users, courses) => {
  const comments = [];

  for (let i = 0; i < 1100; i += 1) {
    const course = courses[randomInt(0, courses.length - 1)];
    const user = users[randomInt(0, users.length - 1)];
    const lesson = randomItem(course.lecciones);
    const responseCount = randomInt(0, 3);

    const comment = {
      _id: makeOid(),
      cursoId: course._id,
      usuarioId: user._id,
      leccionId: lesson._id,
      contenido: randomItem([
        "¿Hay guía de instalación para este módulo?",
        "¿Puedo descargar los recursos?",
        "Excelente explicación, gracias.",
        "¿Es posible profundizar más en esta parte?",
        "¿Este curso está actualizado con la última versión?",
        "Me gustó mucho la sección de práctica.",
        "¿Qué herramientas necesito para el proyecto?",
      ]),
      calificacion: randomInt(3, 5),
      fecha: randomDate(new Date(2024, 0, 15), new Date(2024, 4, 15)),
      respuestas: Array.from({ length: responseCount }, () => ({
        usuarioId: users[randomInt(0, users.length - 1)]._id,
        contenido: randomItem([
          "Sí, está disponible en el módulo de recursos.",
          "Revisa el video número 3, ahí lo explico.",
          "Puedes usar la versión recomendada en la nota.",
          "Buen punto, lo agregaré al curso.",
        ]),
        fecha: randomDate(new Date(2024, 0, 15), new Date(2024, 4, 15)),
      })),
    };

    comments.push(comment);
  }

  return comments;
};

const writeJsonFile = async (filename, data) => {
  const output = JSON.stringify(data.map(toExtendedJson), null, 2);
  await fs.writeFile(path.join(dataDir, filename), output, "utf8");
  console.log(`Created ${filename} (${data.length} documents)`);
};

const main = async () => {
  await fs.mkdir(dataDir, { recursive: true });

  const { users, instructors } = buildUsers();
  const students = users.filter((user) => user.rol === "estudiante");
  const { courses, allLessons } = buildCourses(instructors);
  const enrollments = buildEnrollments(students, courses, allLessons);
  const comments = buildComments(users, courses);

  await writeJsonFile("usuarios.json", users);
  await writeJsonFile("cursos.json", courses);
  await writeJsonFile("inscripciones.json", enrollments);
  await writeJsonFile("comentarios.json", comments);

  const readme = `Seed generation completed.

Collections generated:
- usuarios.json: ${users.length} users (80 instructors, ${students.length} students)
- cursos.json: ${courses.length} courses with embedded lessons
- inscripciones.json: ${enrollments.length} enrollments
- comentarios.json: ${comments.length} comments with embedded replies

Import with mongoimport:

mongoimport --uri \"mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow\" --collection usuarios --file data/usuarios.json --jsonArray
mongoimport --uri \"mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow\" --collection cursos --file data/cursos.json --jsonArray
mongoimport --uri \"mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow\" --collection inscripciones --file data/inscripciones.json --jsonArray
mongoimport --uri \"mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/eduflow\" --collection comentarios --file data/comentarios.json --jsonArray
`;

  await fs.writeFile(path.join(dataDir, "README_seed.md"), readme, "utf8");
  console.log("Created README_seed.md");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
