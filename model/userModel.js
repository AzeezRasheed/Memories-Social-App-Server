import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstname must be provided"],
    },
    lastName: {
      type: String,
      required: [true, "lastname must be provided"],
    },
    username: {
        type: String,
        required: [true, "username must be provided"],
      },
    password: {
      type: String,
      required: [true, "password must be provided"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "email address must be provided"],
      match: [
        /^(?:(?!.*?[.]{2})[a-zA-Z0-9](?:[a-zA-Z0-9.+!%-]{1,64}|)|\"[a-zA-Z0-9.+!% -]{1,64}\")@[a-zA-Z0-9][a-zA-Z0-9.-]+(.[a-z]{2,}|.[0-9]{1,})$/,
        "please fill in a valid email address",
      ],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    coverPhoto: {
        type: String,
        default: "https://theoheartist.com/wp-content/uploads/sites/2/2015/01/fbdefault.png",
    },
    bio: {
      type: String,
      default: "bio",
      maxLength: [250, "bio must not be more than 250 characters"],
    },
    followers: [],
    following: [],
   
    livesIn: String,
    worksAt: String,
    relationship: String,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
