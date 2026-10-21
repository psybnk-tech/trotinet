import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createInterface } from "node:readline";

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error("Run this command in an interactive terminal so passwords are not echoed or piped.");
  process.exit(1);
}

function readSecret(prompt) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    const readline = createInterface({ input, output, terminal: false });
    let value = "";
    output.write(prompt);
    readline.close();
    input.setRawMode(true);
    input.resume();
    const onData = (chunk) => {
      const character = chunk.toString("utf8");
      if (character === "\u0003") {
        input.setRawMode(false);
        input.off("data", onData);
        reject(new Error("Cancelled"));
      } else if (character === "\r" || character === "\n") {
        input.setRawMode(false);
        input.off("data", onData);
        output.write("\n");
        resolve(value);
      } else if (character === "\u007f") {
        value = value.slice(0, -1);
      } else if (character >= " ") {
        value += character;
      }
    };
    input.on("data", onData);
  });
}

try {
  const password = await readSecret("New admin password (min. 14 characters): ");
  const confirmation = await readSecret("Confirm password: ");
  const passwordBytes = Buffer.from(password);
  const confirmationBytes = Buffer.from(confirmation);
  if (password.length < 14 || passwordBytes.length !== confirmationBytes.length || !timingSafeEqual(passwordBytes, confirmationBytes)) {
    throw new Error("Passwords must match and contain at least 14 characters.");
  }
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Could not create password hash.");
  process.exitCode = 1;
}