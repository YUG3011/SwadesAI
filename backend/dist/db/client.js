import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const dataBridge = new PrismaClient();
export { dataBridge };
