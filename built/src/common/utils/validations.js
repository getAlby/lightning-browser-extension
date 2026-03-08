"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueAccountName = exports.validate = void 0;
const validate = (formData) => {
    let password = "";
    let passwordConfirmation = "";
    if (!formData.password)
        password = "enter_password";
    if (!formData.passwordConfirmation) {
        passwordConfirmation = "confirm_password";
    }
    else if (formData.password !== formData.passwordConfirmation) {
        passwordConfirmation = "mismatched_password";
    }
    return {
        password,
        passwordConfirmation,
    };
};
exports.validate = validate;
function getUniqueAccountName(name, accounts) {
    const accountNames = Object.values(accounts).map((el) => el.name);
    let count = 1;
    let uniqueName = name;
    while (accountNames.includes(uniqueName)) {
        const match = uniqueName.match(/\((\d+)\)$/);
        if (match) {
            const currentCount = parseInt(match[1]);
            count = currentCount + 1;
            uniqueName = uniqueName.replace(/\(\d+\)$/, `(${count})`);
        }
        else {
            uniqueName = `${name} (${count})`;
        }
    }
    return uniqueName;
}
exports.getUniqueAccountName = getUniqueAccountName;
