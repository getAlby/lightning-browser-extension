import db from "../../db";

const get = async (message: { args: { host: string } }, sender: unknown) => {
  const host = message.args.host;
  const isBlocked = await db.blocklist
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (isBlocked) {
    return { data: { blocked: true } };
  } else {
    return { data: { blocked: false } };
  }
};

export default get;
