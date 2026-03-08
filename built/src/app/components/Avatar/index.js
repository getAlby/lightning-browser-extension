"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const generator_1 = require("~/app/components/Avatar/generator");
const utils_1 = require("~/app/utils");
const Avatar = (props) => {
    if (props.url) {
        return (0, jsx_runtime_1.jsx)(AvatarImage, Object.assign({}, props));
    }
    else {
        return (0, jsx_runtime_1.jsx)(AvatarSVG, Object.assign({}, props));
    }
};
// Use object-cover to support non-square avatars that might be loaded by
// different connectors
const AvatarImage = (props) => {
    var _a;
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.classNames)("shrink-0", (_a = props.className) !== null && _a !== void 0 ? _a : ""), style: {
            width: `${props.size}px`,
            height: `${props.size}px`,
        }, children: (0, jsx_runtime_1.jsx)("img", { className: "rounded-full object-cover w-full h-full", src: props.url }) }));
};
const AvatarSVG = (props) => {
    var _a;
    const svgRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (svgRef.current) {
            const svgElement = svgRef.current;
            svgElement.appendChild((0, generator_1.generateSvgGAvatar)(props.name, {
                size: props.size,
            }));
        }
    }, [props.name, props.size]);
    return ((0, jsx_runtime_1.jsx)("svg", { className: (0, utils_1.classNames)("rounded-full overflow-hidden shrink-0", (_a = props.className) !== null && _a !== void 0 ? _a : ""), ref: svgRef, width: props.size, height: props.size, viewBox: `0 0 ${props.size} ${props.size}`, xmlns: "http://www.w3.org/2000/svg" }));
};
exports.default = Avatar;
