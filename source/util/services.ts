import axios from "axios";
import { ENDPOINT } from "../cli";
import { ExplorerApi } from "atomicassets";
import fetch from "node-fetch";

import { doTrx } from "./doTrx";
import { balance, player_info } from "./types";
import { config } from "../cli";

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

const get_days = (time_in_milli: number): number => {
	return Math.floor(time_in_milli / (1000 * 60 * 60 * 24));
};

const get_asset_id_from_name = async (account: string, asset_name: string) => {
	const [name, rarity] = asset_name.split(" ");
	if (name && rarity) {
		const result = await atomicassetsApi.getAssets(
			{ owner: account, match: name, collection_name: "novarallywax" },
			1,
			100,
			[
				{
					key: "Rarity",
					value: rarity.charAt(0).toUpperCase() + rarity.slice(1),
				},
			]
		);
		if (result.length > 0) return result[0].asset_id;
		throw new Error(`asset ${name} not found`);
	} else if (name) {
		const result = await atomicassetsApi.getAssets(
			{ owner: account, match: name, collection_name: "novarallywax" },
			1,
			100
		);
		if (result.length > 0) return result[0].asset_id;
		throw new Error(`asset ${name} not found`);
	}
	throw new Error("Wer name?");
};

const atomicassetsApi = new ExplorerApi(
	"https://wax.api.atomicassets.io",
	"atomicassets",
	{
		// @ts-ignore
		fetch,
	}
);

const is_race_in_progress = async (account: string): Promise<boolean> => {
	const data = {
		json: true,
		code: "novarallyapp",
		scope: "novarallyapp",
		table: "queue",
		lower_bound: account,
		upper_bound: account,
		index_position: 2,
		key_type: "name",
		limit: 10,
		reverse: false,
		show_payer: false,
	};
	try {
		const result = await axios.post<any>(
			`${ENDPOINT}/v1/chain/get_table_rows`,
			data
		);
		if (result.data.rows.length > 0) return true;
		else return false;
	} catch (err: any) {
		console.error("couldnt fetch race progress", err.message);
		await sleep(2000);
		return is_race_in_progress(account);
	}
};

const get_people_in_queue = async (): Promise<number> => {
	const data = {
		json: true,
		code: "novarallyapp",
		scope: "novarallyapp",
		table: "queue",
		lower_bound: "",
		upper_bound: "",
		index_position: 1,
		key_type: "",
		limit: 1000,
		reverse: true,
		show_payer: false,
	};
	try {
		const result = await axios.post<any>(
			`${ENDPOINT}/v1/chain/get_table_rows`,
			data
		);
		return result.data.rows.length;
	} catch (err: any) {
		console.error("couldnt get people in queue", err.message);
		await sleep(3000);
		return get_people_in_queue();
	}
};

const get_snake_oil_balance = async (account: string): Promise<string> => {
	const data = { code: "novarallytok", account: account, symbol: null };
	try {
		const result = await axios.post<any>(
			`${ENDPOINT}/v1/chain/get_currency_balance`,
			data
		);
		return result.data[0];
	} catch (err) {
		await sleep(3000);
		return get_snake_oil_balance(account);
	}
};

const get_snake__balance = async (account: string): Promise<Array<balance>> => {
	const data = {
		json: true,
		code: "novarallytok",
		scope: account,
		table: "accounts",
		index_position: 1,
		key_type: "",
		limit: 10,
		reverse: false,
		show_payer: false,
	};
	try {
		const result = await axios.post<any>(
			`${ENDPOINT}/v1/chain/get_table_rows`,
			data
		);
		return result.data.rows;
	} catch (err) {
		await sleep(3000);
		return get_snake__balance(account);
	}
};

const get_race_results = async (account: string) => {
	const data = {
		json: true,
		code: "novarallyapp",
		scope: account,
		table: "playerraces",
		lower_bound: "",
		upper_bound: "",
		index_position: 1,
		key_type: "",
		limit: 1000,
		reverse: true,
		show_payer: false,
	};
	try {
		const result = await axios.post<any>(
			`${ENDPOINT}/v1/chain/get_table_rows`,
			data
		);
		return result.data.rows;
	} catch (err) {
		// console.error(err);
	}
};

const get_player_info = async (account: string): Promise<player_info> => {
	const data = {
		json: true,
		code: "novarallyapp",
		scope: account,
		table: "playersinfo",
		lower_bound: "",
		upper_bound: "",
		index_position: 1,
		limit: 10,
		reverse: false,
		show_payer: false,
	};
	try {
		const result = await axios.post<any>(
			`${ENDPOINT}/v1/chain/get_table_rows`,
			data
		);
		return result.data.rows[0];
	} catch (err: any) {
		console.log(err.message);
		await sleep(2000);
		// console.log("trying to fetch player info again");
		return get_player_info(account);
	}
};

const execute_race_action = async (
	config: config,
	dryrun: boolean | undefined
): Promise<void> => {
	const { account, drivers, vehicles, permission, inter, league } = config;
	let [driver1_asset_id, driver2_asset_id] = ["", ""];
	let vehicle_asset_id = "";
	if (league === "inter" && inter) {
		const { vehicles, drivers } = inter;
		[driver1_asset_id, driver2_asset_id] = drivers;
		[vehicle_asset_id] = vehicles;
	} else {
		[driver1_asset_id, driver2_asset_id] = drivers;
		[vehicle_asset_id] = vehicles;
	}

	const rookie = ["2500 SNAKOIL"];
	const intermediate = ["625 SNAKOIL", "1250 SNAKGAS"];
	const veteran = ["250 SNAKOIL", "625 SNAKGAS", "1250 SNAKPOW"];
	const master = ["125 SNAKOIL", "250 SNAKGAS", "625 SNAKPOW", "1250 SNAKVEN"];

	const join_action = {
		account: "novarallyapp",
		name: "join",
		authorization: [
			{
				actor: account,
				permission: permission || "race",
			},
		],
		data: {
			player: account,
			vehicle_asset_id,
			driver1_asset_id,
			driver2_asset_id,
		},
	};
	const get_transfer_actions = (quantity: string) => {
		return {
			account: "novarallytok",
			name: "transfer",
			authorization: [
				{
					actor: account,
					permission: permission || "race",
				},
			],
			data: {
				from: account,
				to: "novarallyapp",
				quantity,
				memo: "",
			},
		};
	};

	switch (league) {
		case "rookie":
			await doTrx(
				[
					...rookie.map((quantity) => get_transfer_actions(quantity)),
					join_action,
				],
				config,
				dryrun
			);
			break;
		case "inter":
			await doTrx(
				[
					...intermediate.map((quantity) => get_transfer_actions(quantity)),
					join_action,
				],
				config,
				dryrun
			);
			break;
		default:
			await doTrx(
				[
					...rookie.map((quantity) => get_transfer_actions(quantity)),
					join_action,
				],
				config,
				dryrun
			);
	}
};

export {
	execute_race_action,
	sleep,
	is_race_in_progress,
	get_race_results,
	get_days,
	get_player_info,
	get_snake_oil_balance,
	get_people_in_queue,
	get_snake__balance,
	atomicassetsApi,
	get_asset_id_from_name,
};
