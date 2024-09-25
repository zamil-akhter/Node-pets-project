const checkEmailExists = async (emailId) => {
  const existingUser = await userSchema.findOne({ email: emailId });
  return existingUser;
};

module.exports = {
    checkEmailExists
}