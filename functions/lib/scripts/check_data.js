"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: "iconnect-crm",
    });
}
const db = admin.firestore();
const fs = __importStar(require("fs"));
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
//# sourceMappingURL=check_data.js.map