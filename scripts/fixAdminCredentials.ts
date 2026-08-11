import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Setting fixed Admin credentials: Email = 22cseahsanhabib@gmail.com, Password = 267993");

  await prisma.user.deleteMany({
    where: { role: "ADMIN" },
  });

  const admin = await prisma.user.create({
    data: {
      name: "habib",
      email: "22cseahsanhabib@gmail.com",
      password: "267993",
      role: "ADMIN",
    },
  });

  console.log(`Successfully created fixed Admin user!`);
  console.log(`ID: ${admin.id}`);
  console.log(`Name: ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${admin.password}`);
}

main()
  .catch((e) => {
    console.error("Error setting admin credentials:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
