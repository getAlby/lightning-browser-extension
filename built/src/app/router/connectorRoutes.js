"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRoutes = exports.getConnectorRoutes = exports.normalizeKey = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ChooseConnector_1 = __importDefault(require("@screens/connectors/ChooseConnector"));
const ConnectBtcpay_1 = __importDefault(require("@screens/connectors/ConnectBtcpay"));
const ConnectCitadel_1 = __importDefault(require("@screens/connectors/ConnectCitadel"));
const ConnectEclair_1 = __importDefault(require("@screens/connectors/ConnectEclair"));
const ConnectGaloy_1 = __importDefault(require("@screens/connectors/ConnectGaloy"));
const ConnectLaWallet_1 = __importDefault(require("@screens/connectors/ConnectLaWallet"));
const ConnectLnbits_1 = __importDefault(require("@screens/connectors/ConnectLnbits"));
const ConnectLnc_1 = __importDefault(require("@screens/connectors/ConnectLnc"));
const ConnectLnd_1 = __importDefault(require("@screens/connectors/ConnectLnd"));
const ConnectLndHub_1 = __importDefault(require("@screens/connectors/ConnectLndHub"));
const ConnectMyNode_1 = __importDefault(require("@screens/connectors/ConnectMyNode"));
const ConnectRaspiBlitz_1 = __importDefault(require("@screens/connectors/ConnectRaspiBlitz"));
const ConnectStartOS_1 = __importDefault(require("@screens/connectors/ConnectStartOS"));
const ConnectUmbrel_1 = __importDefault(require("@screens/connectors/ConnectUmbrel"));
const react_router_dom_1 = require("react-router-dom");
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
const ConnectAlbyHub_1 = __importDefault(require("~/app/screens/connectors/ConnectAlbyHub"));
const ConnectNWC_1 = __importDefault(require("~/app/screens/connectors/ConnectNWC"));
const ConnectVoltage_1 = __importDefault(require("~/app/screens/connectors/ConnectVoltage"));
const ConnectCommando_1 = __importDefault(require("../screens/connectors/ConnectCommando"));
const albyhub_svg_1 = __importDefault(require("/static/assets/icons/albyhub.svg"));
const btcpay_svg_1 = __importDefault(require("/static/assets/icons/btcpay.svg"));
const citadel_svg_1 = __importDefault(require("/static/assets/icons/citadel.svg"));
const core_ln_svg_1 = __importDefault(require("/static/assets/icons/core_ln.svg"));
const eclair_jpg_1 = __importDefault(require("/static/assets/icons/eclair.jpg"));
const galoy_bitcoin_jungle_png_1 = __importDefault(require("/static/assets/icons/galoy_bitcoin_jungle.png"));
const galoy_blink_png_1 = __importDefault(require("/static/assets/icons/galoy_blink.png"));
const lawallet_png_1 = __importDefault(require("/static/assets/icons/lawallet.png"));
const lightning_node_png_1 = __importDefault(require("/static/assets/icons/lightning_node.png"));
const lightning_terminal_png_1 = __importDefault(require("/static/assets/icons/lightning_terminal.png"));
const lnbits_png_1 = __importDefault(require("/static/assets/icons/lnbits.png"));
const lnd_png_1 = __importDefault(require("/static/assets/icons/lnd.png"));
const lndhub_go_png_1 = __importDefault(require("/static/assets/icons/lndhub_go.png"));
const mynode_png_1 = __importDefault(require("/static/assets/icons/mynode.png"));
const nirvati_svg_1 = __importDefault(require("/static/assets/icons/nirvati.svg"));
const nwc_svg_1 = __importDefault(require("/static/assets/icons/nwc.svg"));
const raspiblitz_png_1 = __importDefault(require("/static/assets/icons/raspiblitz.png"));
const startos_png_1 = __importDefault(require("/static/assets/icons/startos.png"));
const umbrel_png_1 = __importDefault(require("/static/assets/icons/umbrel.png"));
const voltage_png_1 = __importDefault(require("/static/assets/icons/voltage.png"));
const normalizeKey = (key) => key;
exports.normalizeKey = normalizeKey;
const galoyPaths = {
    blink: "galoy-blink",
    bitcoinJungle: "galoy-bitcoin-jungle",
};
const connectorMap = {
    lnd: {
        path: "lnd",
        element: (0, jsx_runtime_1.jsx)(ConnectLnd_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lnd.title"),
        logo: lnd_png_1.default,
    },
    "umbrel-lnd": {
        path: "lnd",
        element: (0, jsx_runtime_1.jsx)(ConnectUmbrel_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.umbrel_lightning_node.title"),
        logo: lightning_node_png_1.default,
    },
    "raspiblitz-lnd": {
        path: "lnd",
        element: (0, jsx_runtime_1.jsx)(ConnectRaspiBlitz_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lnd.title"),
        logo: lnd_png_1.default,
    },
    btcpay: {
        path: "btcpay",
        element: (0, jsx_runtime_1.jsx)(ConnectBtcpay_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.btcpay.title"),
        logo: btcpay_svg_1.default,
    },
    "mynode-lnd": {
        path: "lnd",
        element: (0, jsx_runtime_1.jsx)(ConnectMyNode_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lnd.title"),
        logo: lnd_png_1.default,
    },
    "startos-lnd": {
        path: "lnd",
        element: (0, jsx_runtime_1.jsx)(ConnectStartOS_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lnd.title"),
        logo: lnd_png_1.default,
    },
    lnc: {
        path: "lnc",
        element: (0, jsx_runtime_1.jsx)(ConnectLnc_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lnc.title"),
        logo: lightning_terminal_png_1.default,
    },
    commando: {
        path: "commando",
        element: (0, jsx_runtime_1.jsx)(ConnectCommando_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.commando.title"),
        logo: core_ln_svg_1.default,
    },
    lnbits: {
        path: "lnbits",
        element: (0, jsx_runtime_1.jsx)(ConnectLnbits_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lnbits.title"),
        logo: lnbits_png_1.default,
    },
    citadel: {
        path: "citadel",
        element: (0, jsx_runtime_1.jsx)(ConnectCitadel_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.citadel.title"),
        logo: citadel_svg_1.default,
    },
    "lnd-hub-go": {
        path: "lnd-hub-go",
        element: (0, jsx_runtime_1.jsx)(ConnectLndHub_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lndhub_go.title"),
        logo: lndhub_go_png_1.default,
    },
    eclair: {
        path: "eclair",
        element: (0, jsx_runtime_1.jsx)(ConnectEclair_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.eclair.title"),
        logo: eclair_jpg_1.default,
    },
    [galoyPaths.blink]: {
        path: galoyPaths.blink,
        element: (0, jsx_runtime_1.jsx)(ConnectGaloy_1.default, { instance: galoyPaths.blink }),
        title: i18nConfig_1.default.t("translation:choose_connector.blink.title"),
        logo: galoy_blink_png_1.default,
    },
    [galoyPaths.bitcoinJungle]: {
        path: galoyPaths.bitcoinJungle,
        element: (0, jsx_runtime_1.jsx)(ConnectGaloy_1.default, { instance: galoyPaths.bitcoinJungle }),
        title: i18nConfig_1.default.t("translation:choose_connector.bitcoin_jungle.title"),
        logo: galoy_bitcoin_jungle_png_1.default,
    },
    voltage: {
        path: "voltage",
        element: (0, jsx_runtime_1.jsx)(ConnectVoltage_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.voltage.title"),
        logo: voltage_png_1.default,
    },
    nwc: {
        path: "nwc",
        element: (0, jsx_runtime_1.jsx)(ConnectNWC_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.nwc.title"),
        logo: nwc_svg_1.default,
    },
    albyhub: {
        path: "albyhub",
        element: (0, jsx_runtime_1.jsx)(ConnectAlbyHub_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.albyhub.title"),
        logo: albyhub_svg_1.default,
    },
    lawallet: {
        path: "lawallet",
        element: (0, jsx_runtime_1.jsx)(ConnectLaWallet_1.default, {}),
        title: i18nConfig_1.default.t("translation:choose_connector.lawallet.title"),
        logo: lawallet_png_1.default,
    },
};
function getDistribution(key) {
    const name = i18nConfig_1.default.t((0, exports.normalizeKey)(`translation:distributions.${key}.name`));
    const children = distributionMap[key]["children"];
    return {
        path: key,
        element: ((0, jsx_runtime_1.jsx)(ChooseConnector_1.default, { title: i18nConfig_1.default.t("translation:distributions.title", { name }), description: i18nConfig_1.default.t("translation:distributions.description", { name }), connectorRoutes: children })),
        title: i18nConfig_1.default.t((0, exports.normalizeKey)(`translation:choose_connector.${key}.title`)),
        logo: distributionMap[key]["logo"],
        children,
    };
}
const distributionMap = {
    nirvati: {
        logo: nirvati_svg_1.default,
        children: [
            //connectorMap["citadel"],
            connectorMap["lnc"],
            //connectorMap["commando"],
            connectorMap["lnbits"],
        ],
    },
    umbrel: {
        logo: umbrel_png_1.default,
        children: [
            connectorMap["umbrel-lnd"],
            connectorMap["lnc"],
            connectorMap["commando"],
            connectorMap["lnbits"],
            connectorMap["nwc"],
        ],
    },
    mynode: {
        logo: mynode_png_1.default,
        children: [
            connectorMap["mynode-lnd"],
            connectorMap["lnc"],
            connectorMap["commando"],
            connectorMap["lnbits"],
        ],
    },
    startos: {
        logo: startos_png_1.default,
        children: [
            connectorMap["startos-lnd"],
            connectorMap["lnc"],
            connectorMap["commando"],
            connectorMap["lnbits"],
        ],
    },
    raspiblitz: {
        logo: raspiblitz_png_1.default,
        children: [
            connectorMap["raspiblitz-lnd"],
            connectorMap["lnc"],
            connectorMap["commando"],
            connectorMap["lnbits"],
        ],
    },
};
function getConnectorRoutes() {
    return [
        connectorMap["albyhub"],
        connectorMap["lnd"],
        connectorMap["lnc"],
        connectorMap["commando"],
        connectorMap["lnbits"],
        connectorMap["nwc"],
        getDistribution("umbrel"),
        getDistribution("startos"),
        getDistribution("raspiblitz"),
        getDistribution("mynode"),
        getDistribution("nirvati"),
        connectorMap["btcpay"],
        connectorMap["voltage"],
        connectorMap[galoyPaths.blink],
        connectorMap[galoyPaths.bitcoinJungle],
        connectorMap["lawallet"],
        connectorMap["lnd-hub-go"],
        connectorMap["eclair"],
    ];
}
exports.getConnectorRoutes = getConnectorRoutes;
function renderRoutes(routes) {
    return routes.map((route, index) => {
        if ("children" in route && route.children) {
            if ("element" in route && route.element) {
                return ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: route.path, children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: route.element }), renderRoutes(route.children)] }, `${route.path}-${index}`));
            }
            else {
                let indexRoute;
                const indexRouteIndex = route.children.findIndex((childRoute) => childRoute.index === true);
                if (indexRouteIndex !== -1) {
                    indexRoute = route.children.splice(indexRouteIndex, 1)[0];
                    return ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: route.path, children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: indexRoute.element }), renderRoutes(route.children)] }, `${route.path}-${index}`));
                }
            }
        }
        else {
            return ((0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: route.path, element: route.element }, `${route.path}-${index}`));
        }
    });
}
exports.renderRoutes = renderRoutes;
