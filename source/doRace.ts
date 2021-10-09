// gonna race once and update daily race count and all that shit
// if doTrx succeds and returns 1, else returns 0
import { execute_race_action, sleep } from "./services";
import { config } from "./cli";

const do_race = async (
	race_progress: boolean,
	daily_race_count: number,
	config: config
): Promise<number | undefined> => {
	if (!race_progress && daily_race_count < 10) {
		console.log("trying trx");
		try {
			await execute_race_action(config);
			await sleep(500);
			return 1;
		} catch (err) {
			return 0;
		}
	} else return undefined;
};

module.exports = do_race;
export default do_race;
