const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const license = await prisma.post.upsert({
    where: { slug: "license" },
    update: {},
    create: {
      uid: "dqwdqwd",
      slug: "license",
      title: "License",
      text: "This is the license",
      published: true,
      price: 100,
    },
  });
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
