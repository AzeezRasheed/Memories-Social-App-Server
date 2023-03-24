import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import AsyncHandler from "express-async-handler";
import UserModel from "../model/userModel.js";
import { Token } from "../model/tokenModel.js";
import { sendEmail } from "../utils/sendMail.js";
import { fileSizeFormatter } from "../utils/fileUploads.js";
import cloudinary from "cloudinary";

//this would automatically generate a jwt token when we call the function and pass the id as its props
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

//To Register a User
export const RegisterUser = AsyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  // we must first fill in all the required fields
  if (!username || !password || !firstName || !lastName || !email) {
    res.status(400);
    throw new Error("please fill in all the required fields");
  }

  //we check if the user password is up to 6 characters
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }

  //we check if the user exists in the database
  const userExists = await UserModel.findOne({ email: email });

  if (userExists) {
    res.status(400);
    throw new Error("user already exists");
  }

  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Memories-Social-App",
        resource_type: "image",
      });
    } catch (e) {
      res.status(500);
      throw new Error("Could not upload file");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  //if the user does not exist in the database, we create a new user
  const newUser = await UserModel.create({
    email: email,
    firstName: firstName,
    lastName: lastName,
    password: password,
    username: username,
    profilePhoto: fileData.filePath && fileData.filePath,
    coverPhoto: fileData.filePath && fileData.filePath,
  });

  //then we generate a token for the user
  const token = generateToken(newUser._id);

  //if the new user is created, we send all the required fields in json
  if (newUser) {
    const {
      _id,
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      profilePhoto,
      coverPhoto,
      bio,
      following,
      followers,
    } = newUser;
    res.status(201).json({
      _id,
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      profilePhoto,
      coverPhoto,
      bio,
      following,
      followers,
      token,
    });
  } else {
    res.status(400);
    throw new Error("something went wrong or invalid user data");
  }
});

//To Login a User
export const LoginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //we check if the user password is up to 6 characters
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }
  //we check if user exists in the database
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    res.status(400);
    throw new Error("user not found, please signup ");
  }

  //we check if the user password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("invalid email or password");
  }
  //we create a token for the user
  const token = generateToken(user._id);

  //if the user is created, we send all the required fields in json
  if (user && passwordIsCorrect) {
    const {
      _id,
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      profilePhoto,
      coverPhoto,
      bio,
      following,
      followers,
    } = user;

    res.status(200).json({
      _id,
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      profilePhoto,
      coverPhoto,
      bio,
      following,
      followers,
      token,
    });
  } else {
    res.status(400);
    throw new Error("invalid email or password");
  }
});

export const GetAllUsers = AsyncHandler(async (req, res) => {
  const allUsers = await UserModel.find({});

  res.status(200).json(allUsers);
});

export const GetUser = AsyncHandler(async (req, res) => {
  // we get the user id from req.user
  const { _id } = req.user;
  // we find the user by the id we get in the params
  const user = await UserModel.findById(_id);

  if (user) {
    const {
      _id,
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      profilePhoto,
      coverPhoto,
      bio,
      following,
      followers,
    } = user;

    res.status(200).json({
      _id,
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      profilePhoto,
      coverPhoto,
      bio,
      following,
      followers,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

// Logged in Boolean, we use it to know if a user is logged in or not
export const IsUserLoggedIn = AsyncHandler(async (req, res) => {
  // we check if there is a bearer token from the header
  const authHeader = req.headers.authorization;

  // we check if there is a bearer token from the header or if it starts with Bearer, else we send a 401 status code
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(200).json(false);
  }

  // we get the token from the header and split it
  const token = authHeader.split(" ")[1];

  // we decode the token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  // we check if the user exists in the database, because if it is verified, the jwt has the user id in it
  const user = await UserModel.findById(decodedToken.id);
  if (user) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

//Update User
export const UpdateUser = AsyncHandler(async (req, res) => {
  // we get the user id from req.user
  const { _id } = req.user;

  // we check if the user exists in the database
  const userExists = await UserModel.findById(_id);
  if (userExists) {
    let fileData = {};
    if (req.file) {
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "Memories-Social-App",
          resource_type: "image",
        });
      } catch (e) {
        res.status(500);
        throw new Error("Could not upload file");
      }
      fileData = {
        fileName: req.file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    }

    const {
      firstName,
      lastName,
      username,
      email,
      coverPhoto,
      profilePhoto,
      bio,
    } = userExists;

    userExists.firstName = req.body.firstName || firstName;
    userExists.lastName = req.body.lastName || lastName;
    userExists.username = req.body.username || username;
    userExists.email = req.body.email || email;
    userExists.profilePhoto = fileData.filePath || profilePhoto;
    userExists.coverPhoto = fileData.filePath || coverPhoto;
    userExists.bio = req.body.bio || bio;

    const updatedUser = await userExists.save();
    res.status(200).json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      coverPhoto: updatedUser.coverPhoto,
      profilePhoto: updatedUser.profilePhoto,
      bio: updatedUser.bio,
    });
  }

  if (!userExists) {
    res.status(404);
    throw new Error("user not found");
  }
});

// Change user password

export const ChangeUserPassword = AsyncHandler(async (req, res) => {
  // we get the user id from params
  const { id } = req.params;

  // we check if the user exists in the database
  const userExists = await UserModel.findById(id);
  if (userExists) {
    const { password, oldPassword } = req.body;

    if (!password && !oldPassword) {
      res.status(400);
      throw new Error("please fill in all the required fields");
    }
    // we check if the user password is up to 6 characters
    if (password.length < 6) {
      res.status(400);
      throw new Error("password must be at least 6 characters");
    }
    // we check if the user password is correct
    const passwordIsCorrect = await bcrypt.compare(
      oldPassword,
      userExists.password
    );
    if (!passwordIsCorrect) {
      res.status(400);
      throw new Error("invalid email or password");
    }

    userExists.password = password;
    const updatedUser = await userExists.save();

    res.status(200).send("Password successfully changed");
  } else {
    res.status(404);
    throw new Error("Old password is incorrect");
  }
});

// Delete User
export const DeleteUser = AsyncHandler(async (req, res) => {
  // we get the user id from params

  const { _id } = req.user;
  // we check if the user exists in the database
  const userExists = await UserModel.findById(_id);
  if (userExists) {
    await userExists.remove();
    res.status(200).send("user deleted successfully");
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

//Forget Password
export const ForgetPassword = AsyncHandler(async (req, res) => {
  // we first get our email from body
  const { email } = req.body;

  // we check if the user exists in the database
  const userExists = await UserModel.findOne({ email });
  if (!userExists) {
    res.status(404);
    throw new Error("user not found");
  }

  //we first delete the token from the database if it already exists
  const token = await Token.findOne({ userId: userExists._id });

  if (token) {
    await token.deleteOne();
  }

  //we make a reset token using crypto with the user ID
  const resetToken = crypto.randomBytes(32).toString("hex") + userExists._id;

  //This is where gets confusing, we only send the hashed password to the Token model,
  //and we still need to hash the reset token again to compare it with the one in the DB
  const hashedToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //we save to the database
  await new Token({
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000),
    userId: userExists._id,
  }).save();

  const resetUrlLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  //this message would be sent to the email address of the user

  const message = `
  <h2>Hello ${userExists.firstName} ${userExists.lastName} </h2>
  <p>Please use the url below to reset your password </p>
  <p>The reset link is valid for only 30 minutes </p>
  <a href=${resetUrlLink} clicktracking=off>${resetUrlLink}</a>
  <p> Regards </p>
  <p>The Humble Rashie Team</p>

  `;

  const subject = "Password Reset Request";
  const send_to = userExists.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).send("Reset Email sent");
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, plese try again later");
  }
});

//Reset Password
export const ResetPassword = AsyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // We check if there is password in the body
  if (!password) {
    res.status(400);
    throw new Error("please fill in all the required fields");
  }

  //we check if the user password is up to 6 characters
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }

  //we need to hash the reset token so as to compare it with the one in the database
  const hashedToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //we check if the reset token exists in the database
  const token = await Token.findOne({ token: hashedToken });

  if (!token) {
    res.status(400);
    throw new Error("invalid reset token");
  }

  //we get the user id from the token
  const { userId } = token;

  //we check if the user exists in the database
  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(400);
    throw new Error("invalid reset token");
  }

  //now we save the new password to the user database
  user.password = password;
  await user.save();

  res.status(200).send("Password successfully changed");
});

//Follow a user
export const FollowUser = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  //the userId is the ID of the user that wants to follow another user
  //a good example is let's assume i am the user that wants to follow another person
  //the the userid is my id
  const { userId } = req.body;

  if (id === userId) {
    res.status(400);
    throw new Error("you cannot follow yourself");
  }

  //we check if the user that the current user wants to follow exists in the database
  const userExists = await UserModel.findById(id);
  if (!userExists) {
    res.status(404);
    throw new Error("user not found");
  }

  //we check if the current user that wants to follow exists in the database
  const followedUserExists = await UserModel.findById(userId);
  if (!followedUserExists) {
    res.status(404);
    throw new Error("user not found");
  }

  //we check if the user is already following the other user
  if (!userExists.followers.includes(followedUserExists._id)) {
    //we add the user to the followers array
    await userExists.updateOne({
      $push: { followers: followedUserExists._id },
    });
    //we add the user to the following array
    await followedUserExists.updateOne({
      $push: { following: userExists._id },
    });
    res.status(200).send("user followed successfully");
  }

  //we check if the user is already following the other user
  if (userExists.followers.includes(followedUserExists._id)) {
    //we remove the user from the followers array
    await userExists.updateOne({
      $pull: { followers: followedUserExists._id },
    });
    //we remove the user from the following array
    await followedUserExists.updateOne({
      $pull: { following: userExists._id },
    });
    res.status(200).send("user unfollowed successfully");
  }
});
