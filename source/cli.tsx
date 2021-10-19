#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./ui";

import fs from "fs";
import path from "path";

const cli = meow(
	`
	Usage
	  $ ./betterNovarallyRaces

	Options
		--autorace
		--dry-run (Wont do the trx but the whole program runs)
		--inter (to race in intermediate league)

	Examples
	  $ ./betterNovarallyRaces [options(--inter)] --autorace
	  $ ./betterNovarallyRaces [options(--inter,--autorace)] --dry-run

	Options
`,
	{
		flags: {
			autorace: {
				type: "boolean",
			},
			dryrun: {
				type: "boolean",
			},
			inter: {
				type: "boolean",
			},
		},
	}
);

export interface config {
	private_key: string;
	permission?: string;
	account: string;
	drivers: Array<string>;
	vehicles: Array<string>;
	inter?: {
		drivers: Array<string>;
		vehicles: Array<string>;
	};
	endpoint?: string;
	to_inter: boolean;
}

let config: config;
try {
	let path_to_config = path.resolve(__dirname, "config.json");
	if (!fs.existsSync(path_to_config)) {
		path_to_config = path.resolve("../", __dirname, "config.json");
	}
	if (!fs.existsSync(path_to_config)) {
		path_to_config = path.resolve("config.json");
	}
	console.log(path_to_config);
	const raw = fs.readFileSync(path_to_config);
	config = JSON.parse(raw.toString());
} catch (err: any) {
	console.error(err.message);
	console.error("error reading file, check if config.json is proper");
	process.exit();
}

export const ENDPOINT = config.endpoint || "https://wax.pink.gg";

const { drivers, vehicles, account, private_key } = config;
const [driver1_asset_id, driver2_asset_id] = drivers;
const [vehicle_asset_id] = vehicles;

const { inter } = config;

if (!account) {
	console.log("wer account name");
	process.exit();
}

if (!vehicle_asset_id || !driver1_asset_id || !driver2_asset_id) {
	console.log("not enough drivers or vehicles");
	process.exit();
}

if (!private_key || !/[A-Za-z0-9]{51}/gi.test(private_key)) {
	console.log("missing private_key, or invalid");
	process.exit();
}

if (cli.flags.inter && inter) {
	const { drivers: inter_drivers, vehicles: inter_vehicles } = inter;
	const [driver1_asset_id, driver2_asset_id] = inter_drivers;
	const [vehicle_asset_id] = inter_vehicles;
	if (!vehicle_asset_id || !driver1_asset_id || !driver2_asset_id) {
		console.log("not enough drivers or vehicles for intermediate racing");
		process.exit();
	}
	console.log("Intermediate league");
	config = { ...config, to_inter: true };
} else {
	console.log("Rookie league");
	config = { ...config, to_inter: false };
}

render(
	<App
		autorace={cli.flags.autorace}
		dryrun={cli.flags.dryrun}
		config={config}
	/>
);
