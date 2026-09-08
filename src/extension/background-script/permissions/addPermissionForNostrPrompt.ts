import { DONT_ASK_ANY, DONT_ASK_CURRENT } from "~/common/constants";
import { PermissionMethodNostr } from "~/types";

import { addPermissionFor } from "./addPermissionFor";

export async function addPermissionForNostrPrompt(
  host: string,
  method: string,
  permissionOption: string,
  blocked: boolean
) {
  if (permissionOption == DONT_ASK_CURRENT) {
    await addPermissionFor(method, host, blocked);
  }

  if (permissionOption == DONT_ASK_ANY) {
    await Promise.all(
      Object.values(PermissionMethodNostr).map((permission) =>
        addPermissionFor(permission, host, blocked)
      )
    );
  }
}
