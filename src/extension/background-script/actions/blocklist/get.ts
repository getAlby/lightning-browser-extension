import db from "../../db";

const get = async (message: { args: { host: string } }, sender: unknown) => {
  const host = message.args.host;
  const isBlocked = await db.blocklist
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (isBlocked) {
    return { data: { enabled: true } };
  } else {
    return { data: { enabled: false } };
  }
};

export default get;
