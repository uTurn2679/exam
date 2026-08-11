import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Updating Admin users to name 'habib'...");
  
  // Update all existing admin users to name = "habib"
  const updated = await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { name: "habib" },
  });

  console.log(`Updated ${updated.count} admin user(s) to name 'habib'.`);

  // Check if admin user habib exists
  const existingHabib = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!existingHabib) {
    const newAdmin = await prisma.user.create({
      data: {
        name: "habib",
        email: "habib@gmail.com",
        password: "123",
        role: "ADMIN",
      },
    });
    console.log(`Created default Admin user: Name = habib, Email = habib@gmail.com, Password = 123`);
  } else {
    console.log(`Verified Admin account: Name = ${existingHabib.name}, Email = ${existingHabib.email}`);
  }
}

main()
  .catch((e) => {
    console.error("Error in fixAdmin script:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
