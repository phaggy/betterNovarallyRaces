// gonna race once and update daily race count and all that shit
// if doTrx succeds and returns 1, else returns 0
import { execute_race_action, sleep } from "./services";

const do_race = async (
	account: string,
	race_progress: boolean,
	daily_race_count: number,
	{ drivers, vehicles }: { drivers: string[]; vehicles: string[] }
): Promise<number | undefined> => {
	const [driver1_asset_id, driver2_asset_id] = drivers;
	const [vehicle_asset_id] = vehicles;

	if (!race_progress && daily_race_count < 10) {
		console.log("trying trx");
		try {
			await execute_race_action(
				account,
				vehicle_asset_id,
				driver1_asset_id,
				driver2_asset_id
			);
			await sleep(500);
			return 1;
		} catch (err) {
			return 0;
		}
	} else return undefined;
};

module.exports = do_race;
export default do_race;
