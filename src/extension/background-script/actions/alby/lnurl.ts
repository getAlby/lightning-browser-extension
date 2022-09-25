import lnurlLib from "~/common/lib/lnurl";
import type { MessageAlbyLnurl } from "~/types";

export default async function lnurl(message: MessageAlbyLnurl) {
    let result;
    try {
        result = await lnurlLib.getInvoice(message.args.lnurl, message.args.amount, message.args.comment);
        return { data: result };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
    }
}