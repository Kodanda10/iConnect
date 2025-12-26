
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "iconnect-crm",
  });
}

const db = admin.firestore();

import * as fs from "fs";

async function checkData() {
  let output = "Checking database state for iconnect-crm...\n";

  const constituentsSnap = await db.collection("constituents").get();
  output += `Constituents Count: ${constituentsSnap.size}\n`;

  if (constituentsSnap.size > 0) {
    output += "First 3 Constituents:\n";
    constituentsSnap.docs.slice(0, 3).forEach((doc) => {
      output += `${doc.id} - ${doc.data().name}\n`;
    });
  }

  const tasksSnap = await db.collection("tasks").get();
  output += `Tasks Count: ${tasksSnap.size}\n`;

  fs.writeFileSync("count.txt", output);
  console.log("Written to count.txt");
}

checkData().catch(console.error);
