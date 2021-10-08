import axios from "axios";
import { ENDPOINT } from "./cli";

import { doTrx } from "./doTrx";
import { player_info } from "./types";

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

const get_days = (time_in_milli: number): number => {
	return Math.floor(time_in_milli / (1000 * 60 * 60 * 24));
};

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
	const data = { code: "novarallytok", account: "buttnuster24", symbol: null };
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
	account: string,
	vehicle_asset_id: string,
	driver1_asset_id: string,
	driver2_asset_id: string
) => {
	const actions = [
		{
			account: "novarallytok",
			name: "transfer",
			authorization: [
				{
					actor: account,
					permission: "owner",
				},
			],
			data: {
				from: account,
				to: "novarallyapp",
				quantity: "10000 SNAKOIL",
				memo: "",
			},
		},
		{
			account: "novarallyapp",
			name: "join",
			authorization: [
				{
					actor: account,
					permission: "owner",
				},
			],
			data: {
				player: account,
				vehicle_asset_id,
				driver1_asset_id,
				driver2_asset_id,
			},
		},
	];
	await doTrx(actions);
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
};
