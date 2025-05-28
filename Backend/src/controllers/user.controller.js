import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
// Login

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: `Please provide data` });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password is correct, generate a random token for the session
    if (isPasswordValid) {
      const token = crypto.randomBytes(20).toString("hex"); // Creates a random string of 20 bytes

      // Assign the token to the user and save the updated user record
      user.token = token;
      await user.save();

      // Respond with a 200 status and the token
      return res.status(httpStatus.OK).json({ token: token });
    } else {
      // If the password is incorrect, respond with a 401 Unauthorized status
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Incorrect password" });
    }
  } catch (e) {
    // If an error occurs, respond with a 500 status and the error message
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" }); // coming from http-status
    }
    // the password needs to be hashed before it is stored in the database.
    // hashing is a one-way process (i.e., it cannot be reversed).
    // it takes the password as an argument and returns a hashed version of it.
    // We use 10 as the salt round (i.e., the number of times the password is hashed).
    // A higher number makes the hash more secure, but it also makes it slower.
    // The hashed password is then stored in the newUser object.
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};

// WHAT ARE TOKENS
// In login authentication, a token is a secure and concise way to verify a user's identity and grant them access to a system or application without repeatedly requiring them to enter credentials. This token acts like an "e-key" or a "stamped ticket" that allows the user to enter and navigate within the application as long as the token remains valid.



export { login, register };
