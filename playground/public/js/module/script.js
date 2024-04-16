export * from "./imported/imported";

(globalThis['tests:scripts'] ||= {})['script2'] = 'loaded';

// default export is required for modules (href starts with ".")
export default function noOp() {

}