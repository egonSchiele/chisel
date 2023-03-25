import { getFirestore } from "firebase-admin/firestore";

import admin from "firebase-admin";
import settings from "../../settings.js";
import serviceAccountKey from "../../serviceAccountKey.json" assert { type: "json" };

import * as firebaseAuth from "@firebase/auth";
import * as firebaseApp from "firebase/app";
const firebase = firebaseApp.initializeApp(settings.firebaseConfig);
const auth = firebaseAuth.getAuth(firebase);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
} catch (e) {
  console.log(e);
}
const db2 = getFirestore();

async function stringToHash(str) {
  const encoder = new TextEncoder();
  const salt = process.env.SALT;
  const data = encoder.encode(str + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const requireLogin = (req, res, next) => {
  const c = req.cookies;
  //console.log({ req });

  if (!req.cookies.userid) {
    console.log("no userid");
    res.redirect("/login.html");
  } else {
    stringToHash(req.cookies.userid).then((hash) => {
      if (hash !== req.cookies.token) {
        res.redirect("/login.html");
      } else {
        next();
      }
    });
  }
};

export const submitLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const credentials = await firebaseAuth.signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = credentials.user;
    /* console.log(firebaseUser);
     */
    let user = await getUser(email);
    if (!user) {
      user = await createUser(email);
      if (!user) {
        throw new Error("Failed to create user");
      }
      if (!user.approved) {
        throw new Error("User not approved");
      }
    }

    const token = await stringToHash(user.id);
    res.cookie("userid", user.id);
    res.cookie("token", token);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/login.html?err=" + err);
  }
};

const getUser = async (email) => {
  console.log("getting user");
  console.log({ email });
  const userRef = db2.collection("users").doc(email);
  const user = await userRef.get();
  if (!user.exists) {
    return null;
  }
  return user.data();
};

const createUser = async (email) => {
  console.log("creating user");
  console.log({ email });
  const data = {
    id: 1,
    email,
    approved: false,
    settings: {},
    created_at: Date.now(),
  };

  const userRef = db2.collection("users").doc(email);

  try {
    await userRef.set(data);
    console.log("Successfully synced user to Firestore");
    return data;
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
    return null;
  }
};
