const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dns = require("dns");
require("dotenv").config();
const Admin = require("../models/Admin");

dns.setServers((process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8").split(","));

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const hashedPassword = await bcrypt.hash(password, 12);

  await Admin.findOneAndUpdate(
    { email },
    { email, password: hashedPassword },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin password reset for ${email}`);
}

createAdmin()
  .catch((err) => {
    console.error("Admin reset failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
