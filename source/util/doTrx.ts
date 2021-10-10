import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import fetch from "node-fetch"; //node only
import { config } from "../cli";

const ENDPOINT = "https://wax.pink.gg";

const rpc = new JsonRpc(ENDPOINT, { fetch }); //required to read blockchain state

export const doTrx = async (newActions: Array<any>, config: config) => {
	const { private_key } = config;
	const privateKeys = [private_key];
	const signatureProvider = new JsSignatureProvider(privateKeys);
	const api = new Api({
		rpc,
		signatureProvider,
		textDecoder: new TextDecoder(),
		textEncoder: new TextEncoder(),
	});
	try {
		// console.dir({ newActions }, { depth: null });
		await api.transact(
			{
				actions: newActions,
			},
			{
				blocksBehind: 3,
				expireSeconds: 30,
			}
		);
	} catch (err: any) {
		console.log("sus", err.message, "\n---");
		throw err;
	}
};
