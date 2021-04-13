import dataStore from "../../extension/storage";

class PasswordManager {
  async init(password, confirmedPassword) {
    if (password !== confirmedPassword) {
      throw new Error("Cannot initialzie. Passwords do not match!");
    }
    const storage = dataStore(password);
    await storage.set("isPasswordSet", true);
  }

  async checkPassword(password) {
    try {
      const storage = dataStore(password);
      const isPasswordSet = await storage.get("isPasswordSet");
      return isPasswordSet === true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default PasswordManager;
