// Importa PrismaClient desde la ruta donde fue generado
// La ruta ha sido ajustada a '../generated/prisma' porque seed.js está en la carpeta 'prisma'
// y 'generated' está en la raíz del proyecto.
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient(); // Inicializa el cliente de Prisma

// Función principal asíncrona para la siembra de datos
async function main() {
    /* Define un array de usuarios de demostración
    const demoUsers = [
        { name: 'Juan Pérez', email: 'juan.perez@example.com' },
        { name: 'María López', email: 'maria.lopez@example.com' },
        { name: 'Carlos García', email: 'carlos.garcia@example.com' }
    ];

    // Primero, elimina todos los usuarios existentes para evitar duplicados en cada ejecución
    // Esto es útil para tener un estado limpio cada vez que se ejecuta el seed
    await prisma.user.deleteMany();
    console.log('Usuarios existentes eliminados.');

    // Itera sobre el array de usuarios y los crea en la base de datos
    for (const user of demoUsers) {
        await prisma.user.create({
            data: user // Los datos del usuario a crear
        });
    }

    console.log('Usuarios de demostración creados con éxito');*/
    await prisma.user.deleteMany();
}

// Llama a la función principal y maneja posibles errores
main()
    .catch(e => {
        // Si ocurre un error, lo imprime en la consola
        console.error(e);
        // Sale del proceso con un código de error
        process.exit(1);
    })
    .finally(async () => {
        // Asegura que la conexión a la base de datos se cierre al finalizar,
        // independientemente de si hubo un error o no.
        await prisma.$disconnect();
    });
