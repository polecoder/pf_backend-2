import { connect } from "mongoose";

const MONGO_URI =
  "mongodb+srv://maurop4502:MP.M0ng04tl4s_2024!@cluster0.wt9qz.mongodb.net/pf_backend?retryWrites=true&w=majority&appName=Cluster0";

/**
 * Connects to the MongoDB database.
 */
async function connectToDB() {
  try {
    await connect(MONGO_URI);
  } catch (err) {
    console.error("Error connecting to MongoDB");
  }
}

export default connectToDB;
