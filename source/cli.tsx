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

	Examples
	  $ ./betterNovarallyRaces --autorace
	  $ ./betterNovarallyRaces [options] --dry-run

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
		},
	}
);

export interface config {
	private_key: string;
	permission?: string;
	account: string;
	drivers: Array<string>;
	vehicles: Array<string>;
	endpoint: string;
}

let config: config;
try {
	console.log(path.resolve("config.json"));
	const raw = fs.readFileSync(path.resolve("config.json"));
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

render(
	<App
		autorace={cli.flags.autorace}
		dryrun={cli.flags.dryrun}
		config={config}
	/>
);
