import fs from "fs";

interface config {
  private_key: string;
  account: string;
  drivers: Array<string>;
  vehicles: Array<string>;
  endpoint: string;
}

let config: config;
try {
  const raw = fs.readFileSync("./config.json");
  config = JSON.parse(raw.toString());
} catch (err) {
  console.log(err);
  console.error("error reading file, check if config.json is proper");
  process.exit();
}

const ENDPOINT = config.endpoint || "https://wax.pink.gg";

const account = config.account;
const private_key = config.private_key;

const drivers = config.drivers;
const vehicles = config.vehicles;

const driver1_asset_id = drivers[0];
const driver2_asset_id = drivers[1];
const vehicle_asset_id = vehicles[0];

if (!account) {
  console.log("wer account name");
  process.exit();
}

if (!vehicle_asset_id || !driver1_asset_id || !driver2_asset_id) {
  console.log("not enough drivers or vehicles");
  process.exit();
}

export {
  account,
  driver2_asset_id,
  driver1_asset_id,
  vehicle_asset_id,
  ENDPOINT,
  private_key,
};
