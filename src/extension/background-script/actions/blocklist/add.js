import db from "../../db";

const add = async (message, sender) => {
  const host = message.args.host;
  const name = message.args.name;
  const imageURL = message.args.imageURL;

  await db.blocklist.add({
    host: host,
    name: name,
    imageURL: imageURL,
    blocked: true,
  });

  await db.saveToStorage();

  return { data: true };
};

export default add;
