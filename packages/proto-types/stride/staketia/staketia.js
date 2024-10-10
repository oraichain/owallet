"use strict";
// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.181.2
//   protoc               v3.21.3
// source: stride/staketia/staketia.proto
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashRecord = exports.RedemptionRecord = exports.UnbondingRecord = exports.DelegationRecord = exports.HostZone = exports.unbondingRecordStatusToJSON = exports.unbondingRecordStatusFromJSON = exports.UnbondingRecordStatus = exports.delegationRecordStatusToJSON = exports.delegationRecordStatusFromJSON = exports.DelegationRecordStatus = exports.protobufPackage = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
exports.protobufPackage = "stride.staketia";
/**
 * Status fields for a delegation record
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 * Additionally, the GetActiveDelegationRecords query filters for records that
 * are either TRANSFER_IN_PROGERSS or DELEGATION_QUEUE. If a new active status
 * is added, the keeper must be modified
 */
var DelegationRecordStatus;
(function (DelegationRecordStatus) {
    /**
     * TRANSFER_IN_PROGRESS - TRANSFER_IN_PROGRESS indicates the native tokens are being sent from the
     * deposit account to the delegation account
     */
    DelegationRecordStatus[DelegationRecordStatus["TRANSFER_IN_PROGRESS"] = 0] = "TRANSFER_IN_PROGRESS";
    /**
     * TRANSFER_FAILED - TRANSFER_FAILED indicates that the transfer either timed out or was an ack
     * failure
     */
    DelegationRecordStatus[DelegationRecordStatus["TRANSFER_FAILED"] = 1] = "TRANSFER_FAILED";
    /**
     * DELEGATION_QUEUE - DELEGATION_QUEUE indicates the tokens have landed on the host zone and are
     * ready to be delegated
     */
    DelegationRecordStatus[DelegationRecordStatus["DELEGATION_QUEUE"] = 2] = "DELEGATION_QUEUE";
    /** DELEGATION_COMPLETE - DELEGATION_COMPLETE indicates the delegation has been completed */
    DelegationRecordStatus[DelegationRecordStatus["DELEGATION_COMPLETE"] = 3] = "DELEGATION_COMPLETE";
    DelegationRecordStatus[DelegationRecordStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DelegationRecordStatus = exports.DelegationRecordStatus || (exports.DelegationRecordStatus = {}));
function delegationRecordStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "TRANSFER_IN_PROGRESS":
            return DelegationRecordStatus.TRANSFER_IN_PROGRESS;
        case 1:
        case "TRANSFER_FAILED":
            return DelegationRecordStatus.TRANSFER_FAILED;
        case 2:
        case "DELEGATION_QUEUE":
            return DelegationRecordStatus.DELEGATION_QUEUE;
        case 3:
        case "DELEGATION_COMPLETE":
            return DelegationRecordStatus.DELEGATION_COMPLETE;
        case -1:
        case "UNRECOGNIZED":
        default:
            return DelegationRecordStatus.UNRECOGNIZED;
    }
}
exports.delegationRecordStatusFromJSON = delegationRecordStatusFromJSON;
function delegationRecordStatusToJSON(object) {
    switch (object) {
        case DelegationRecordStatus.TRANSFER_IN_PROGRESS:
            return "TRANSFER_IN_PROGRESS";
        case DelegationRecordStatus.TRANSFER_FAILED:
            return "TRANSFER_FAILED";
        case DelegationRecordStatus.DELEGATION_QUEUE:
            return "DELEGATION_QUEUE";
        case DelegationRecordStatus.DELEGATION_COMPLETE:
            return "DELEGATION_COMPLETE";
        case DelegationRecordStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.delegationRecordStatusToJSON = delegationRecordStatusToJSON;
/** Status fields for an unbonding record */
var UnbondingRecordStatus;
(function (UnbondingRecordStatus) {
    /**
     * ACCUMULATING_REDEMPTIONS - ACCUMULATING_REDEMPTIONS indicates redemptions are still being accumulated
     * on this record
     */
    UnbondingRecordStatus[UnbondingRecordStatus["ACCUMULATING_REDEMPTIONS"] = 0] = "ACCUMULATING_REDEMPTIONS";
    /**
     * UNBONDING_QUEUE - UNBONDING_QUEUE indicates the unbond amount for this epoch has been froze
     * and the tokens are ready to be unbonded on the host zone
     */
    UnbondingRecordStatus[UnbondingRecordStatus["UNBONDING_QUEUE"] = 1] = "UNBONDING_QUEUE";
    /**
     * UNBONDING_IN_PROGRESS - UNBONDING_IN_PROGRESS indicates the unbonding is currently in progress on
     * the host zone
     */
    UnbondingRecordStatus[UnbondingRecordStatus["UNBONDING_IN_PROGRESS"] = 2] = "UNBONDING_IN_PROGRESS";
    /**
     * UNBONDED - UNBONDED indicates the unbonding is finished on the host zone and the
     * tokens are still in the delegation account
     */
    UnbondingRecordStatus[UnbondingRecordStatus["UNBONDED"] = 3] = "UNBONDED";
    /**
     * CLAIMABLE - CLAIMABLE indicates the unbonded tokens have been swept to stride and are
     * ready to be distributed to users
     */
    UnbondingRecordStatus[UnbondingRecordStatus["CLAIMABLE"] = 4] = "CLAIMABLE";
    /** CLAIMED - CLAIMED indicates the full unbonding cycle has been completed */
    UnbondingRecordStatus[UnbondingRecordStatus["CLAIMED"] = 5] = "CLAIMED";
    UnbondingRecordStatus[UnbondingRecordStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(UnbondingRecordStatus = exports.UnbondingRecordStatus || (exports.UnbondingRecordStatus = {}));
function unbondingRecordStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "ACCUMULATING_REDEMPTIONS":
            return UnbondingRecordStatus.ACCUMULATING_REDEMPTIONS;
        case 1:
        case "UNBONDING_QUEUE":
            return UnbondingRecordStatus.UNBONDING_QUEUE;
        case 2:
        case "UNBONDING_IN_PROGRESS":
            return UnbondingRecordStatus.UNBONDING_IN_PROGRESS;
        case 3:
        case "UNBONDED":
            return UnbondingRecordStatus.UNBONDED;
        case 4:
        case "CLAIMABLE":
            return UnbondingRecordStatus.CLAIMABLE;
        case 5:
        case "CLAIMED":
            return UnbondingRecordStatus.CLAIMED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return UnbondingRecordStatus.UNRECOGNIZED;
    }
}
exports.unbondingRecordStatusFromJSON = unbondingRecordStatusFromJSON;
function unbondingRecordStatusToJSON(object) {
    switch (object) {
        case UnbondingRecordStatus.ACCUMULATING_REDEMPTIONS:
            return "ACCUMULATING_REDEMPTIONS";
        case UnbondingRecordStatus.UNBONDING_QUEUE:
            return "UNBONDING_QUEUE";
        case UnbondingRecordStatus.UNBONDING_IN_PROGRESS:
            return "UNBONDING_IN_PROGRESS";
        case UnbondingRecordStatus.UNBONDED:
            return "UNBONDED";
        case UnbondingRecordStatus.CLAIMABLE:
            return "CLAIMABLE";
        case UnbondingRecordStatus.CLAIMED:
            return "CLAIMED";
        case UnbondingRecordStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.unbondingRecordStatusToJSON = unbondingRecordStatusToJSON;
function createBaseHostZone() {
    return {
        chainId: "",
        nativeTokenDenom: "",
        nativeTokenIbcDenom: "",
        transferChannelId: "",
        delegationAddress: "",
        rewardAddress: "",
        depositAddress: "",
        redemptionAddress: "",
        claimAddress: "",
        operatorAddressOnStride: "",
        safeAddressOnStride: "",
        lastRedemptionRate: "",
        redemptionRate: "",
        minRedemptionRate: "",
        maxRedemptionRate: "",
        minInnerRedemptionRate: "",
        maxInnerRedemptionRate: "",
        delegatedBalance: "",
        unbondingPeriodSeconds: "0",
        halted: false,
    };
}
exports.HostZone = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.chainId !== "") {
            writer.uint32(10).string(message.chainId);
        }
        if (message.nativeTokenDenom !== "") {
            writer.uint32(18).string(message.nativeTokenDenom);
        }
        if (message.nativeTokenIbcDenom !== "") {
            writer.uint32(26).string(message.nativeTokenIbcDenom);
        }
        if (message.transferChannelId !== "") {
            writer.uint32(34).string(message.transferChannelId);
        }
        if (message.delegationAddress !== "") {
            writer.uint32(42).string(message.delegationAddress);
        }
        if (message.rewardAddress !== "") {
            writer.uint32(50).string(message.rewardAddress);
        }
        if (message.depositAddress !== "") {
            writer.uint32(58).string(message.depositAddress);
        }
        if (message.redemptionAddress !== "") {
            writer.uint32(66).string(message.redemptionAddress);
        }
        if (message.claimAddress !== "") {
            writer.uint32(74).string(message.claimAddress);
        }
        if (message.operatorAddressOnStride !== "") {
            writer.uint32(82).string(message.operatorAddressOnStride);
        }
        if (message.safeAddressOnStride !== "") {
            writer.uint32(90).string(message.safeAddressOnStride);
        }
        if (message.lastRedemptionRate !== "") {
            writer.uint32(98).string(message.lastRedemptionRate);
        }
        if (message.redemptionRate !== "") {
            writer.uint32(106).string(message.redemptionRate);
        }
        if (message.minRedemptionRate !== "") {
            writer.uint32(114).string(message.minRedemptionRate);
        }
        if (message.maxRedemptionRate !== "") {
            writer.uint32(122).string(message.maxRedemptionRate);
        }
        if (message.minInnerRedemptionRate !== "") {
            writer.uint32(130).string(message.minInnerRedemptionRate);
        }
        if (message.maxInnerRedemptionRate !== "") {
            writer.uint32(138).string(message.maxInnerRedemptionRate);
        }
        if (message.delegatedBalance !== "") {
            writer.uint32(146).string(message.delegatedBalance);
        }
        if (message.unbondingPeriodSeconds !== "0") {
            writer.uint32(152).uint64(message.unbondingPeriodSeconds);
        }
        if (message.halted !== false) {
            writer.uint32(160).bool(message.halted);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHostZone();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break;
                    }
                    message.chainId = reader.string();
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }
                    message.nativeTokenDenom = reader.string();
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }
                    message.nativeTokenIbcDenom = reader.string();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }
                    message.transferChannelId = reader.string();
                    continue;
                case 5:
                    if (tag !== 42) {
                        break;
                    }
                    message.delegationAddress = reader.string();
                    continue;
                case 6:
                    if (tag !== 50) {
                        break;
                    }
                    message.rewardAddress = reader.string();
                    continue;
                case 7:
                    if (tag !== 58) {
                        break;
                    }
                    message.depositAddress = reader.string();
                    continue;
                case 8:
                    if (tag !== 66) {
                        break;
                    }
                    message.redemptionAddress = reader.string();
                    continue;
                case 9:
                    if (tag !== 74) {
                        break;
                    }
                    message.claimAddress = reader.string();
                    continue;
                case 10:
                    if (tag !== 82) {
                        break;
                    }
                    message.operatorAddressOnStride = reader.string();
                    continue;
                case 11:
                    if (tag !== 90) {
                        break;
                    }
                    message.safeAddressOnStride = reader.string();
                    continue;
                case 12:
                    if (tag !== 98) {
                        break;
                    }
                    message.lastRedemptionRate = reader.string();
                    continue;
                case 13:
                    if (tag !== 106) {
                        break;
                    }
                    message.redemptionRate = reader.string();
                    continue;
                case 14:
                    if (tag !== 114) {
                        break;
                    }
                    message.minRedemptionRate = reader.string();
                    continue;
                case 15:
                    if (tag !== 122) {
                        break;
                    }
                    message.maxRedemptionRate = reader.string();
                    continue;
                case 16:
                    if (tag !== 130) {
                        break;
                    }
                    message.minInnerRedemptionRate = reader.string();
                    continue;
                case 17:
                    if (tag !== 138) {
                        break;
                    }
                    message.maxInnerRedemptionRate = reader.string();
                    continue;
                case 18:
                    if (tag !== 146) {
                        break;
                    }
                    message.delegatedBalance = reader.string();
                    continue;
                case 19:
                    if (tag !== 152) {
                        break;
                    }
                    message.unbondingPeriodSeconds = longToString(reader.uint64());
                    continue;
                case 20:
                    if (tag !== 160) {
                        break;
                    }
                    message.halted = reader.bool();
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
            chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
            nativeTokenDenom: isSet(object.nativeTokenDenom) ? globalThis.String(object.nativeTokenDenom) : "",
            nativeTokenIbcDenom: isSet(object.nativeTokenIbcDenom) ? globalThis.String(object.nativeTokenIbcDenom) : "",
            transferChannelId: isSet(object.transferChannelId) ? globalThis.String(object.transferChannelId) : "",
            delegationAddress: isSet(object.delegationAddress) ? globalThis.String(object.delegationAddress) : "",
            rewardAddress: isSet(object.rewardAddress) ? globalThis.String(object.rewardAddress) : "",
            depositAddress: isSet(object.depositAddress) ? globalThis.String(object.depositAddress) : "",
            redemptionAddress: isSet(object.redemptionAddress) ? globalThis.String(object.redemptionAddress) : "",
            claimAddress: isSet(object.claimAddress) ? globalThis.String(object.claimAddress) : "",
            operatorAddressOnStride: isSet(object.operatorAddressOnStride)
                ? globalThis.String(object.operatorAddressOnStride)
                : "",
            safeAddressOnStride: isSet(object.safeAddressOnStride) ? globalThis.String(object.safeAddressOnStride) : "",
            lastRedemptionRate: isSet(object.lastRedemptionRate) ? globalThis.String(object.lastRedemptionRate) : "",
            redemptionRate: isSet(object.redemptionRate) ? globalThis.String(object.redemptionRate) : "",
            minRedemptionRate: isSet(object.minRedemptionRate) ? globalThis.String(object.minRedemptionRate) : "",
            maxRedemptionRate: isSet(object.maxRedemptionRate) ? globalThis.String(object.maxRedemptionRate) : "",
            minInnerRedemptionRate: isSet(object.minInnerRedemptionRate)
                ? globalThis.String(object.minInnerRedemptionRate)
                : "",
            maxInnerRedemptionRate: isSet(object.maxInnerRedemptionRate)
                ? globalThis.String(object.maxInnerRedemptionRate)
                : "",
            delegatedBalance: isSet(object.delegatedBalance) ? globalThis.String(object.delegatedBalance) : "",
            unbondingPeriodSeconds: isSet(object.unbondingPeriodSeconds)
                ? globalThis.String(object.unbondingPeriodSeconds)
                : "0",
            halted: isSet(object.halted) ? globalThis.Boolean(object.halted) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.chainId !== "") {
            obj.chainId = message.chainId;
        }
        if (message.nativeTokenDenom !== "") {
            obj.nativeTokenDenom = message.nativeTokenDenom;
        }
        if (message.nativeTokenIbcDenom !== "") {
            obj.nativeTokenIbcDenom = message.nativeTokenIbcDenom;
        }
        if (message.transferChannelId !== "") {
            obj.transferChannelId = message.transferChannelId;
        }
        if (message.delegationAddress !== "") {
            obj.delegationAddress = message.delegationAddress;
        }
        if (message.rewardAddress !== "") {
            obj.rewardAddress = message.rewardAddress;
        }
        if (message.depositAddress !== "") {
            obj.depositAddress = message.depositAddress;
        }
        if (message.redemptionAddress !== "") {
            obj.redemptionAddress = message.redemptionAddress;
        }
        if (message.claimAddress !== "") {
            obj.claimAddress = message.claimAddress;
        }
        if (message.operatorAddressOnStride !== "") {
            obj.operatorAddressOnStride = message.operatorAddressOnStride;
        }
        if (message.safeAddressOnStride !== "") {
            obj.safeAddressOnStride = message.safeAddressOnStride;
        }
        if (message.lastRedemptionRate !== "") {
            obj.lastRedemptionRate = message.lastRedemptionRate;
        }
        if (message.redemptionRate !== "") {
            obj.redemptionRate = message.redemptionRate;
        }
        if (message.minRedemptionRate !== "") {
            obj.minRedemptionRate = message.minRedemptionRate;
        }
        if (message.maxRedemptionRate !== "") {
            obj.maxRedemptionRate = message.maxRedemptionRate;
        }
        if (message.minInnerRedemptionRate !== "") {
            obj.minInnerRedemptionRate = message.minInnerRedemptionRate;
        }
        if (message.maxInnerRedemptionRate !== "") {
            obj.maxInnerRedemptionRate = message.maxInnerRedemptionRate;
        }
        if (message.delegatedBalance !== "") {
            obj.delegatedBalance = message.delegatedBalance;
        }
        if (message.unbondingPeriodSeconds !== "0") {
            obj.unbondingPeriodSeconds = message.unbondingPeriodSeconds;
        }
        if (message.halted !== false) {
            obj.halted = message.halted;
        }
        return obj;
    },
    create(base) {
        return exports.HostZone.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const message = createBaseHostZone();
        message.chainId = (_a = object.chainId) !== null && _a !== void 0 ? _a : "";
        message.nativeTokenDenom = (_b = object.nativeTokenDenom) !== null && _b !== void 0 ? _b : "";
        message.nativeTokenIbcDenom = (_c = object.nativeTokenIbcDenom) !== null && _c !== void 0 ? _c : "";
        message.transferChannelId = (_d = object.transferChannelId) !== null && _d !== void 0 ? _d : "";
        message.delegationAddress = (_e = object.delegationAddress) !== null && _e !== void 0 ? _e : "";
        message.rewardAddress = (_f = object.rewardAddress) !== null && _f !== void 0 ? _f : "";
        message.depositAddress = (_g = object.depositAddress) !== null && _g !== void 0 ? _g : "";
        message.redemptionAddress = (_h = object.redemptionAddress) !== null && _h !== void 0 ? _h : "";
        message.claimAddress = (_j = object.claimAddress) !== null && _j !== void 0 ? _j : "";
        message.operatorAddressOnStride = (_k = object.operatorAddressOnStride) !== null && _k !== void 0 ? _k : "";
        message.safeAddressOnStride = (_l = object.safeAddressOnStride) !== null && _l !== void 0 ? _l : "";
        message.lastRedemptionRate = (_m = object.lastRedemptionRate) !== null && _m !== void 0 ? _m : "";
        message.redemptionRate = (_o = object.redemptionRate) !== null && _o !== void 0 ? _o : "";
        message.minRedemptionRate = (_p = object.minRedemptionRate) !== null && _p !== void 0 ? _p : "";
        message.maxRedemptionRate = (_q = object.maxRedemptionRate) !== null && _q !== void 0 ? _q : "";
        message.minInnerRedemptionRate = (_r = object.minInnerRedemptionRate) !== null && _r !== void 0 ? _r : "";
        message.maxInnerRedemptionRate = (_s = object.maxInnerRedemptionRate) !== null && _s !== void 0 ? _s : "";
        message.delegatedBalance = (_t = object.delegatedBalance) !== null && _t !== void 0 ? _t : "";
        message.unbondingPeriodSeconds = (_u = object.unbondingPeriodSeconds) !== null && _u !== void 0 ? _u : "0";
        message.halted = (_v = object.halted) !== null && _v !== void 0 ? _v : false;
        return message;
    },
};
function createBaseDelegationRecord() {
    return { id: "0", nativeAmount: "", status: 0, txHash: "" };
}
exports.DelegationRecord = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.id !== "0") {
            writer.uint32(8).uint64(message.id);
        }
        if (message.nativeAmount !== "") {
            writer.uint32(18).string(message.nativeAmount);
        }
        if (message.status !== 0) {
            writer.uint32(24).int32(message.status);
        }
        if (message.txHash !== "") {
            writer.uint32(34).string(message.txHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegationRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }
                    message.id = longToString(reader.uint64());
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }
                    message.nativeAmount = reader.string();
                    continue;
                case 3:
                    if (tag !== 24) {
                        break;
                    }
                    message.status = reader.int32();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }
                    message.txHash = reader.string();
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
            id: isSet(object.id) ? globalThis.String(object.id) : "0",
            nativeAmount: isSet(object.nativeAmount) ? globalThis.String(object.nativeAmount) : "",
            status: isSet(object.status) ? delegationRecordStatusFromJSON(object.status) : 0,
            txHash: isSet(object.txHash) ? globalThis.String(object.txHash) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.id !== "0") {
            obj.id = message.id;
        }
        if (message.nativeAmount !== "") {
            obj.nativeAmount = message.nativeAmount;
        }
        if (message.status !== 0) {
            obj.status = delegationRecordStatusToJSON(message.status);
        }
        if (message.txHash !== "") {
            obj.txHash = message.txHash;
        }
        return obj;
    },
    create(base) {
        return exports.DelegationRecord.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseDelegationRecord();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : "0";
        message.nativeAmount = (_b = object.nativeAmount) !== null && _b !== void 0 ? _b : "";
        message.status = (_c = object.status) !== null && _c !== void 0 ? _c : 0;
        message.txHash = (_d = object.txHash) !== null && _d !== void 0 ? _d : "";
        return message;
    },
};
function createBaseUnbondingRecord() {
    return {
        id: "0",
        status: 0,
        stTokenAmount: "",
        nativeAmount: "",
        unbondingCompletionTimeSeconds: "0",
        undelegationTxHash: "",
        unbondedTokenSweepTxHash: "",
    };
}
exports.UnbondingRecord = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.id !== "0") {
            writer.uint32(8).uint64(message.id);
        }
        if (message.status !== 0) {
            writer.uint32(16).int32(message.status);
        }
        if (message.stTokenAmount !== "") {
            writer.uint32(26).string(message.stTokenAmount);
        }
        if (message.nativeAmount !== "") {
            writer.uint32(34).string(message.nativeAmount);
        }
        if (message.unbondingCompletionTimeSeconds !== "0") {
            writer.uint32(40).uint64(message.unbondingCompletionTimeSeconds);
        }
        if (message.undelegationTxHash !== "") {
            writer.uint32(50).string(message.undelegationTxHash);
        }
        if (message.unbondedTokenSweepTxHash !== "") {
            writer.uint32(58).string(message.unbondedTokenSweepTxHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUnbondingRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }
                    message.id = longToString(reader.uint64());
                    continue;
                case 2:
                    if (tag !== 16) {
                        break;
                    }
                    message.status = reader.int32();
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }
                    message.stTokenAmount = reader.string();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }
                    message.nativeAmount = reader.string();
                    continue;
                case 5:
                    if (tag !== 40) {
                        break;
                    }
                    message.unbondingCompletionTimeSeconds = longToString(reader.uint64());
                    continue;
                case 6:
                    if (tag !== 50) {
                        break;
                    }
                    message.undelegationTxHash = reader.string();
                    continue;
                case 7:
                    if (tag !== 58) {
                        break;
                    }
                    message.unbondedTokenSweepTxHash = reader.string();
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
            id: isSet(object.id) ? globalThis.String(object.id) : "0",
            status: isSet(object.status) ? unbondingRecordStatusFromJSON(object.status) : 0,
            stTokenAmount: isSet(object.stTokenAmount) ? globalThis.String(object.stTokenAmount) : "",
            nativeAmount: isSet(object.nativeAmount) ? globalThis.String(object.nativeAmount) : "",
            unbondingCompletionTimeSeconds: isSet(object.unbondingCompletionTimeSeconds)
                ? globalThis.String(object.unbondingCompletionTimeSeconds)
                : "0",
            undelegationTxHash: isSet(object.undelegationTxHash) ? globalThis.String(object.undelegationTxHash) : "",
            unbondedTokenSweepTxHash: isSet(object.unbondedTokenSweepTxHash)
                ? globalThis.String(object.unbondedTokenSweepTxHash)
                : "",
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.id !== "0") {
            obj.id = message.id;
        }
        if (message.status !== 0) {
            obj.status = unbondingRecordStatusToJSON(message.status);
        }
        if (message.stTokenAmount !== "") {
            obj.stTokenAmount = message.stTokenAmount;
        }
        if (message.nativeAmount !== "") {
            obj.nativeAmount = message.nativeAmount;
        }
        if (message.unbondingCompletionTimeSeconds !== "0") {
            obj.unbondingCompletionTimeSeconds = message.unbondingCompletionTimeSeconds;
        }
        if (message.undelegationTxHash !== "") {
            obj.undelegationTxHash = message.undelegationTxHash;
        }
        if (message.unbondedTokenSweepTxHash !== "") {
            obj.unbondedTokenSweepTxHash = message.unbondedTokenSweepTxHash;
        }
        return obj;
    },
    create(base) {
        return exports.UnbondingRecord.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f, _g;
        const message = createBaseUnbondingRecord();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : "0";
        message.status = (_b = object.status) !== null && _b !== void 0 ? _b : 0;
        message.stTokenAmount = (_c = object.stTokenAmount) !== null && _c !== void 0 ? _c : "";
        message.nativeAmount = (_d = object.nativeAmount) !== null && _d !== void 0 ? _d : "";
        message.unbondingCompletionTimeSeconds = (_e = object.unbondingCompletionTimeSeconds) !== null && _e !== void 0 ? _e : "0";
        message.undelegationTxHash = (_f = object.undelegationTxHash) !== null && _f !== void 0 ? _f : "";
        message.unbondedTokenSweepTxHash = (_g = object.unbondedTokenSweepTxHash) !== null && _g !== void 0 ? _g : "";
        return message;
    },
};
function createBaseRedemptionRecord() {
    return { unbondingRecordId: "0", redeemer: "", stTokenAmount: "", nativeAmount: "" };
}
exports.RedemptionRecord = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.unbondingRecordId !== "0") {
            writer.uint32(8).uint64(message.unbondingRecordId);
        }
        if (message.redeemer !== "") {
            writer.uint32(18).string(message.redeemer);
        }
        if (message.stTokenAmount !== "") {
            writer.uint32(26).string(message.stTokenAmount);
        }
        if (message.nativeAmount !== "") {
            writer.uint32(34).string(message.nativeAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRedemptionRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }
                    message.unbondingRecordId = longToString(reader.uint64());
                    continue;
                case 2:
                    if (tag !== 18) {
                        break;
                    }
                    message.redeemer = reader.string();
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }
                    message.stTokenAmount = reader.string();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }
                    message.nativeAmount = reader.string();
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
            unbondingRecordId: isSet(object.unbondingRecordId) ? globalThis.String(object.unbondingRecordId) : "0",
            redeemer: isSet(object.redeemer) ? globalThis.String(object.redeemer) : "",
            stTokenAmount: isSet(object.stTokenAmount) ? globalThis.String(object.stTokenAmount) : "",
            nativeAmount: isSet(object.nativeAmount) ? globalThis.String(object.nativeAmount) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.unbondingRecordId !== "0") {
            obj.unbondingRecordId = message.unbondingRecordId;
        }
        if (message.redeemer !== "") {
            obj.redeemer = message.redeemer;
        }
        if (message.stTokenAmount !== "") {
            obj.stTokenAmount = message.stTokenAmount;
        }
        if (message.nativeAmount !== "") {
            obj.nativeAmount = message.nativeAmount;
        }
        return obj;
    },
    create(base) {
        return exports.RedemptionRecord.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseRedemptionRecord();
        message.unbondingRecordId = (_a = object.unbondingRecordId) !== null && _a !== void 0 ? _a : "0";
        message.redeemer = (_b = object.redeemer) !== null && _b !== void 0 ? _b : "";
        message.stTokenAmount = (_c = object.stTokenAmount) !== null && _c !== void 0 ? _c : "";
        message.nativeAmount = (_d = object.nativeAmount) !== null && _d !== void 0 ? _d : "";
        return message;
    },
};
function createBaseSlashRecord() {
    return { id: "0", time: "0", nativeAmount: "", validatorAddress: "" };
}
exports.SlashRecord = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.id !== "0") {
            writer.uint32(8).uint64(message.id);
        }
        if (message.time !== "0") {
            writer.uint32(16).uint64(message.time);
        }
        if (message.nativeAmount !== "") {
            writer.uint32(26).string(message.nativeAmount);
        }
        if (message.validatorAddress !== "") {
            writer.uint32(34).string(message.validatorAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSlashRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 8) {
                        break;
                    }
                    message.id = longToString(reader.uint64());
                    continue;
                case 2:
                    if (tag !== 16) {
                        break;
                    }
                    message.time = longToString(reader.uint64());
                    continue;
                case 3:
                    if (tag !== 26) {
                        break;
                    }
                    message.nativeAmount = reader.string();
                    continue;
                case 4:
                    if (tag !== 34) {
                        break;
                    }
                    message.validatorAddress = reader.string();
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
            id: isSet(object.id) ? globalThis.String(object.id) : "0",
            time: isSet(object.time) ? globalThis.String(object.time) : "0",
            nativeAmount: isSet(object.nativeAmount) ? globalThis.String(object.nativeAmount) : "",
            validatorAddress: isSet(object.validatorAddress) ? globalThis.String(object.validatorAddress) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.id !== "0") {
            obj.id = message.id;
        }
        if (message.time !== "0") {
            obj.time = message.time;
        }
        if (message.nativeAmount !== "") {
            obj.nativeAmount = message.nativeAmount;
        }
        if (message.validatorAddress !== "") {
            obj.validatorAddress = message.validatorAddress;
        }
        return obj;
    },
    create(base) {
        return exports.SlashRecord.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseSlashRecord();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : "0";
        message.time = (_b = object.time) !== null && _b !== void 0 ? _b : "0";
        message.nativeAmount = (_c = object.nativeAmount) !== null && _c !== void 0 ? _c : "";
        message.validatorAddress = (_d = object.validatorAddress) !== null && _d !== void 0 ? _d : "";
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
//# sourceMappingURL=staketia.js.map