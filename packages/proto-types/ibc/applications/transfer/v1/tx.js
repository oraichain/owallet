"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgTransferResponse = exports.MsgTransfer = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const coin_1 = require("../../../../cosmos/base/v1beta1/coin");
const client_1 = require("../../../core/client/v1/client");
exports.protobufPackage = "ibc.applications.transfer.v1";
function createBaseMsgTransfer() {
    return {
        sourcePort: "",
        sourceChannel: "",
        token: undefined,
        sender: "",
        receiver: "",
        timeoutHeight: undefined,
        timeoutTimestamp: "0",
        memo: "",
    };
}
exports.MsgTransfer = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sourcePort !== "") {
            writer.uint32(10).string(message.sourcePort);
        }
        if (message.sourceChannel !== "") {
            writer.uint32(18).string(message.sourceChannel);
        }
        if (message.token !== undefined) {
            coin_1.Coin.encode(message.token, writer.uint32(26).fork()).ldelim();
        }
        if (message.sender !== "") {
            writer.uint32(34).string(message.sender);
        }
        if (message.receiver !== "") {
            writer.uint32(42).string(message.receiver);
        }
        if (message.timeoutHeight !== undefined) {
            client_1.Height.encode(message.timeoutHeight, writer.uint32(50).fork()).ldelim();
        }
        if (message.timeoutTimestamp !== "0") {
            writer.uint32(56).uint64(message.timeoutTimestamp);
        }
        if (message.memo !== "") {
            writer.uint32(66).string(message.memo);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTransfer();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }
                    message.sourcePort = reader.string();
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }
                    message.sourceChannel = reader.string();
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }
                    message.token = coin_1.Coin.decode(reader, reader.uint32());
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }
                    message.sender = reader.string();
                    continue;
                case 5:
                    if (tag !== 42) {
                        break;
                    }
                    message.receiver = reader.string();
                    continue;
                case 6:
                    if (tag !== 50) {
                        break;
                    }
                    message.timeoutHeight = client_1.Height.decode(reader, reader.uint32());
                    continue;
                case 7:
                    if (tag !== 56) {
                        break;
                    }
                    message.timeoutTimestamp = longToString(reader.uint64());
                    continue;
                case 8:
                    if (tag !== 66) {
                        break;
                    }
                    message.memo = reader.string();
                    continue;
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(object) {
        return {
            sourcePort: isSet(object.sourcePort) ? globalThis.String(object.sourcePort) : "",
            sourceChannel: isSet(object.sourceChannel) ? globalThis.String(object.sourceChannel) : "",
            token: isSet(object.token) ? coin_1.Coin.fromJSON(object.token) : undefined,
            sender: isSet(object.sender) ? globalThis.String(object.sender) : "",
            receiver: isSet(object.receiver) ? globalThis.String(object.receiver) : "",
            timeoutHeight: isSet(object.timeoutHeight) ? client_1.Height.fromJSON(object.timeoutHeight) : undefined,
            timeoutTimestamp: isSet(object.timeoutTimestamp) ? globalThis.String(object.timeoutTimestamp) : "0",
            memo: isSet(object.memo) ? globalThis.String(object.memo) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.sourcePort !== "") {
            obj.sourcePort = message.sourcePort;
        }
        if (message.sourceChannel !== "") {
            obj.sourceChannel = message.sourceChannel;
        }
        if (message.token !== undefined) {
            obj.token = coin_1.Coin.toJSON(message.token);
        }
        if (message.sender !== "") {
            obj.sender = message.sender;
        }
        if (message.receiver !== "") {
            obj.receiver = message.receiver;
        }
        if (message.timeoutHeight !== undefined) {
            obj.timeoutHeight = client_1.Height.toJSON(message.timeoutHeight);
        }
        if (message.timeoutTimestamp !== "0") {
            obj.timeoutTimestamp = message.timeoutTimestamp;
        }
        if (message.memo !== "") {
            obj.memo = message.memo;
        }
        return obj;
    },
    create(base) {
        return exports.MsgTransfer.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f;
        const message = createBaseMsgTransfer();
        message.sourcePort = (_a = object.sourcePort) !== null && _a !== void 0 ? _a : "";
        message.sourceChannel = (_b = object.sourceChannel) !== null && _b !== void 0 ? _b : "";
        message.token = (object.token !== undefined && object.token !== null) ? coin_1.Coin.fromPartial(object.token) : undefined;
        message.sender = (_c = object.sender) !== null && _c !== void 0 ? _c : "";
        message.receiver = (_d = object.receiver) !== null && _d !== void 0 ? _d : "";
        message.timeoutHeight = (object.timeoutHeight !== undefined && object.timeoutHeight !== null)
            ? client_1.Height.fromPartial(object.timeoutHeight)
            : undefined;
        message.timeoutTimestamp = (_e = object.timeoutTimestamp) !== null && _e !== void 0 ? _e : "0";
        message.memo = (_f = object.memo) !== null && _f !== void 0 ? _f : "";
        return message;
    },
};
function createBaseMsgTransferResponse() {
    return {};
}
exports.MsgTransferResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTransferResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    create(base) {
        return exports.MsgTransferResponse.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(_) {
        const message = createBaseMsgTransferResponse();
        return message;
    },
};
function longToString(long) {
    return long.toString();
}
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=tx.js.map