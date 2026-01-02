export default async function handler(req, res) {
  const out = {
    ok: false,
    step: "start",
    env: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
    },
    hints: [],
  };

  try {
    out.step = "import firebase-admin";
    // Dit faalt als firebase-admin niet in dependencies staat / build faalt
    const { default: admin } = await import("firebase-admin");
    out.ok = true;
    out.firebaseAdminImported = true;

    out.step = "init app if needed";
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        out.ok = false;
        out.error = "Missing one or more FIREBASE_* env vars";
      } else {
        privateKey = privateKey.replace(/\\n/g, "\n");

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });

        out.adminInitialized = true;
      }
    } else {
      out.adminInitialized = true;
      out.alreadyInitialized = true;
    }

    out.step = "firestore ping";
    if (out.adminInitialized) {
      await admin.firestore().collection("_health").doc("ping").set(
        { at: new Date().toISOString() },
        { merge: true }
      );
      out.firestoreWriteOk = true;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(out));
  } catch (e) {
    out.ok = false;
    out.error = e?.message || String(e);

    // Extra hints
    if (String(out.error).includes("Cannot find package") || String(out.error).includes("Cannot find module")) {
      out.hints.push("firebase-admin ontbreekt in package.json dependencies");
    }
    if (String(out.error).toLowerCase().includes("private key") || String(out.error).toLowerCase().includes("pem")) {
      out.hints.push("FIREBASE_PRIVATE_KEY is verkeerd geplakt (moet \\n bevatten)");
    }

    res.statusCode = 200; // bewust 200 zodat je altijd JSON ziet
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(out));
  }
}
