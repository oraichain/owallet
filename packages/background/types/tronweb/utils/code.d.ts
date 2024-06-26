export function bin2String(array: any): string;
export function arrayEquals(array1: any, array2: any, strict: any): boolean;
export function stringToBytes(str: any): any[];
export function hexChar2byte(c: any): number;
export function isHexChar(c: any): 0 | 1;
export function hexStr2byteArray(str: any, strict?: boolean): any[];
export function strToDate(str: any): Date;
export function isNumber(c: any): 0 | 1;
export function getStringType(str: any): 1 | 2 | 3 | -1;
import { byte2hexStr } from "./bytes";
import { bytesToString } from "./bytes";
import { hextoString } from "./bytes";
import { byteArray2hexStr } from "./bytes";
import { base64DecodeFromString } from "./bytes";
import { base64EncodeToString } from "./bytes";
export {
  byte2hexStr,
  bytesToString,
  hextoString,
  byteArray2hexStr,
  base64DecodeFromString,
  base64EncodeToString,
};
