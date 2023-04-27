import { getFirestore } from "firebase-admin/firestore";
import { nanoid } from "nanoid";

import * as firebaseAuth from "@firebase/auth";
import * as firebaseApp from "firebase/app";
import settings from "../../settings.js";

const firebase = firebaseApp.initializeApp(settings.firebaseConfig);
const auth = firebaseAuth.getAuth(firebase);

const mainPageUrl = process.env.NODE_ENV === "production" ? "https://egonschiele.github.io/chisel-docs/" : "/login.html";

async function stringToHash(str) {
  const encoder = new TextEncoder();
  const salt = settings.tokenSalt;
  const data = encoder.encode(str + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const isTestEnv =
  process.env.NODE_ENV === "test" &&
  process.env.CHISEL_CONFIRM === "yes_i_am_sure" &&
  settings.testUser;

export const requireLogin = (req, res, next) => {
  const c = req.cookies;
  // console.log({ req });
  if (isTestEnv) {
    next();
  } else if (!req.cookies.userid) {
    console.log("no userid");
    res.redirect(mainPageUrl);
  } else {
    stringToHash(req.cookies.userid).then((hash) => {
      if (hash !== req.cookies.token) {
        res.redirect(mainPageUrl);
      } else {
        next();
      }
    });
  }
};

export const requireAdmin = (req, res, next) => {
  const c = req.cookies;
  /*   console.log({ req });
   */
  if (!req.cookies.userid) {
    console.log("no userid");
    res.redirect(mainPageUrl);
  } else {
    stringToHash(req.cookies.userid).then(async (hash) => {
      if (hash !== req.cookies.token) {
        res.redirect(mainPageUrl);
      } else {
        const user = await getUser(req);
        if (!user.admin) {
          res.redirect(mainPageUrl);
        } else {
          next();
        }
      }
    });
  }
};

export const getUserId = (req) => {
  if (isTestEnv) {
    return settings.testUser.userid;
  }
  if (!req.cookies.userid) {
    return null;
  }
  return req.cookies.userid;
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
    let user = await getUserWithEmail(email);
    if (!user) {
      user = await createUser(email);
      if (!user) {
        throw new Error("Failed to create user");
      }
    }
    if (!user.approved) {
      throw new Error("User not approved");
    }

    const token = await stringToHash(user.userid);
    res.cookie("userid", user.userid);
    res.cookie("token", token);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect(`/login.html?err=${err}`);
  }
};

export const submitRegister = async (req, res) => {
  const { email, password } = req.body;

  try {
    const credentials = await firebaseAuth.createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = credentials.user;

    const user = await createUser(email);
    if (!user) {
      throw new Error("Failed to create user");
    }

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect(`/register.html?err=${err}`);
  }
};

const _getUser = async (userid) => {
  let _userid = userid;
  if (isTestEnv) {
    _userid = settings.testUser.userid;
  }
  const db = getFirestore();
  const userRef = db.collection("users").doc(_userid);
  const user = await userRef.get();
  if (!user.exists) {
    return null;
  }
  return user.data();
};

export const getUser = async (req) => {
  const userid = getUserId(req);
  if (!userid) {
    console.log("no userid");
    return null;
  }

  const user = await _getUser(userid);
  if (!user) {
    console.log("no user");
    return null;
  }

  const defaultSettings = {
    model: "gpt-3.5-turbo",
    max_tokens: 100,
    num_suggestions: 1,
    theme: "default",
    version_control: false,
    prompts: [
      {
        label: "Expand",
        text: "Write another paragraph for this text: {{text}}",
      },
      {
        label: "Contract",
        text: "Make this text shorter without changing its meaning: {{text}}",
      },
      {
        label: "Rewrite",
        text: "Rewrite this text to make it flow better: {{text}}",
      },
      {
        label: "Fix speech-to-text",
        text: "This text was written using text to speech, and it contains some errors. Please fix them: {{text}}",
      },
      {
        label: "Fix passive voice",
        text: "Please change passive voice to active voice in this text: {{text}}",
      },
    ],
  };

  const settings = {
    ...defaultSettings,
    ...user.settings,
  };

  user.settings = settings;
  return user;
};

export const saveUser = async (user) => {
  console.log("saving user");
  console.log({ user });
  if (!user) {
    console.log("no user to save");
    return false;
  }

  user.created_at = Date.now();
  const db = getFirestore();
  const docRef = db.collection("users").doc(user.userid);
  try {
    await docRef.set(user);
    console.log("Successfully synced user to Firestore");
    return true;
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
    return false;
  }
};

const getUserWithEmail = async (email) => {
  let _email = email;
  if (isTestEnv) {
    _email = settings.testUser.email;
  }
  const db = getFirestore();
  const userRef = db.collection("users").where("email", "==", _email);
  const user = await userRef.get();
  console.log({ user });
  if (user.empty) {
    return null;
  }
  const users = [];
  user.forEach((doc) => {
    users.push(doc.data());
  });
  if (users.length > 1) {
    console.log("Multiple users with same email:", _email);
    return null;
  }
  return users[0];
};

const createUser = async (email, extraData = {}) => {
  console.log("creating user");
  console.log({ email });
  const userid = nanoid();
  const data = {
    userid,
    email,
    approved: true,
    admin: false,
    permissions: {
      openai_api: true,
    },
    usage: {
      openai_api: {
        tokens: {
          month: {
            prompt: 0,
            completion: 0,
          },
          total: {
            prompt: 0,
            completion: 0,
          },
        },
      },
    },
    settings: {},
    created_at: Date.now(),
    ...extraData,
  };

  const db = getFirestore();
  const userRef = db.collection("users").doc(userid);

  try {
    await userRef.set(data);
    console.log("Successfully synced user to Firestore");
    return data;
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
    return null;
  }
};

export const createGuestUser = async () => {
  const email = nanoid() + "@guest.com";
  const user = await createUser(email, {
    guest: true,
  });
  return user;
};

export const loginGuestUser = async (req, res) => {
  const user = await createGuestUser();
  if (!user) {
    console.log("Failed to create guest user");
    res.redirect("/");
    return;
  }
  const token = await stringToHash(user.userid);
  res.cookie("userid", user.userid);
  res.cookie("token", token);
  res.redirect("/");
};

export const getUsers = async () => {
  const db = getFirestore();
  const users = await db.collection("users").get();

  const userMap = {};

  const userData = [];
  const res = users.forEach(async (user) => {
    const data = user.data();
    userData.push(data);
  });
  const withBooks = await Promise.all(
    userData.map(async (user) => {
      const books = await getBooksForUser(user.userid);
      return {
        books,
        email: user.email,
        userid: user.userid,
        usage: user.usage,
      };
    })
  );
  /*   console.log(">>", userMap);
  console.log("2>>", userData);
 */ return withBooks;
};

export const getBooksForUser = async (userid) => {
  const db = getFirestore();
  const books = await db
    .collection("books")
    .where("userid", "==", userid)
    .get();
  const arr = [];
  books.forEach((book) => {
    const bookData = book.data();
    arr.push(bookData);
  });
  return arr;
};
