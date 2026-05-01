import * as admin from "firebase-admin";

const parseFirebasePrivateKey = (key?: string) => {
  if (!key) return "";

  let normalizedKey = key.trim();

  // Remove surrounding quotes if the env variable was wrapped in quotes
  if (
    normalizedKey.startsWith('"') &&
    normalizedKey.endsWith('"') &&
    normalizedKey.length > 1
  ) {
    normalizedKey = normalizedKey.slice(1, -1);
  }

  // Convert escaped newline sequences to actual newlines
  normalizedKey = normalizedKey.replace(/\\n/g, "\n");

  return normalizedKey;
};

// Firebase Admin SDK configuration
const serviceAccount = {
  type: "service_account",
  project_id: "ironclad-2b8a4",
  private_key_id: "d223dbdc2add3d81c12f981ca3b712a6d748ed4e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGDI2N1oi+n2kE\nulcgxr2Gt/4O3OdSEDncF0dmwDPh4fQuQOMtz3d4dpmWIvlSxcvCkmASUjvDDS4J\nL4UtliDig1uvC8o/wWT63NMTDRiH6MVuh9o1jqG/nvToumvtVxihlATLDpUVIed5\nZre+zW3OMJ9X3LbXutX3DiXfsR4rYq0yQypOTV5mQExP2ak2+eCpocNZF0Ja4Ld6\nFugN0NG3E+TV88TGrM0H98pa5zD07ATVVYIE9TWkHh3MOaOhq7gWB5xyvbHgp7Ka\nIeg9jOk6ka5/u2qlzCpdeYZogxDF0ynhGTcH9MLxPtJ6x0/P6B4j8dDy6SdEW4Hy\nasCAKxbjAgMBAAECggEAMdyvNuqweu2/jwUrMoFW7jgcqrlLNAoJxzPFMkVpypEM\n3ShRChOVzKpveLFNfF14M4CO144EpdMHqCBis1t85AqWZrfdL7gNKGu4aK9/YZhl\nPLLPaXSDnK70kjN9QMAQ331Yx5bgSfXDRXlrAYrO/n6XX5OeJSpQ/GZ/epYpNlqs\nC8md+uNaiGCASq+pMdTmbrjA9ea1nCTozjNEEbg6MVYWFlnZrNZVmpxsw4LdBqJS\nNcP9u+wD2aOlc6CcS/db2YtmSA+J5xXwA3yWhFyn75mPxvEDNqn5aJXu9CwTG6ja\nwsmOk3EJz789zCWuOPza9uaTIrakE2galI/yiEByoQKBgQDv/tHR9x7n9CddkaWi\n6o99MXSfxdL2mw0mjf6TrGYde5oAN2F6AN96FvCbhyxzlxHLlWpd73z38HXbr2Je\nh/FAUXKvi51+GQNhT/q0hGZoaRw94PpMXx1N0i/f0D3JbRHEhO48Sfylqww0dX5W\nJX6qNr/37MQOa7b3IwC4jwFHnQKBgQDTQaD67nbta4ixgHQikzG5HnMGLe1LZQ4D\nMIv5sde+8c5N7fKr+t0cj89GqMoPcxZY5jTwU6CVfeurkJ0usAtl0YCCmfTKm8R6\nmZTVAQeHw9ggPmyO687SU5FGnc8gYHOYsJC82iaUC8hIkprrqR96Ms2Gti7r4fL0\nvMG8mO3QfwKBgQCElBR9FTMxmCMXAZqrAUD7PBLdIH+GU+lT3yU/lwFiUCGm9PEY\nYNsTqxCIGohn4pCmEoiME/zJS0EQdza0WgzgJx5f85SxUEgZvgEVL/8Stt4vINWk\n0vZxQyfHUFaRq3shQP4KuCSlsHQxlqaQGG58wXoTD+zOupp8tA115yoh0QKBgHyR\nUk8kldPheLTRvak1ijhSEBkws5+lcuHGmoMdrs3U34VsLY/jWMYitmI/3QXHIwJA\nnC6p4SLFIVYE6+o/vDjJlDFufr2JpA12yh/ff4U6ohJBPNn5ifbTd/Jf02aP+Rmr\n42y4Zc8eM3c3m0oia4Euu6oXewt0LELLmqGOu4wZAoGATDgvA6L6zJI6lCbypQwr\nDAwi/vnC/2qpoiB6LVMKFxdwO57JU3MWGjh8ezllhyBNaWHkQOmHODCqbImVKhPV\ntwvqeuH7Ezp09FMV1GeR3reJF4hzxzYC/zFo1cdGRiSEBcxFD7qP9OZ+Kfnu3i7S\nyEX114oGJL/2la2aLR9nlCQ=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@ironclad-2b8a4.iam.gserviceaccount.com",
  client_id: "110416479318276960690",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ironclad-2b8a4.iam.gserviceaccount.com",
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "ironclad-2b8a4.firebasestorage.app",
  });
}

export const bucket = admin.storage().bucket();
export default admin;
