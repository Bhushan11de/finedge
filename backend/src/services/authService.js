const bcrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  return user;
};

module.exports = { registerUser, loginUser };
