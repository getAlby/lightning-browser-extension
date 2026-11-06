import fs from "fs";
import path from "path";
import browser from "webextension-polyfill";
import state, {
  EXTENSION_PAGE_TITLE,
} from "~/extension/background-script/state";

const viewsPath = path.join(__dirname, "../../../../static/views");

describe("state.lock", () => {
  test.each(fs.readdirSync(viewsPath).filter((f) => f.endsWith(".html")))(
    "%s uses the page title that lock() queries for",
    (file) => {
      const html = fs.readFileSync(path.join(viewsPath, file), "utf8");
      expect(html).toContain(`<title>${EXTENSION_PAGE_TITLE}</title>`);
    }
  );

  test("closes extension tabs by page title", async () => {
    const query = jest
      .spyOn(browser.tabs, "query")
      .mockResolvedValue([
        { id: 1, title: EXTENSION_PAGE_TITLE } as browser.Tabs.Tab,
      ]);
    const remove = jest
      .spyOn(browser.tabs, "remove")
      .mockResolvedValue(undefined);

    await state.getState().lock();

    expect(query).toHaveBeenCalledWith({ title: EXTENSION_PAGE_TITLE });
    expect(remove).toHaveBeenCalledWith([1]);
  });
});
