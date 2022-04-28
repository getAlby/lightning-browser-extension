import db from "../../db";

const deleteBlocklist = async (
  message: { args: { id: number } },
  sender: unknown
) => {
  const id = message.args.id;
  await db.blocklist.delete(id);
  await db.saveToStorage();
  return { data: true };
};

export default deleteBlocklist;
