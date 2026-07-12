import bcrypt from "bcrypt";

async function generate() {
  try {
    const hash = await bcrypt.hash("1234", 10);

    console.log("");
    console.log("======================================");
    console.log("PASSWORD: 1234");
    console.log("HASH:");
    console.log(hash);
    console.log("======================================");
    console.log("");
  } catch (err) {
    console.error(err);
  }
}

generate();