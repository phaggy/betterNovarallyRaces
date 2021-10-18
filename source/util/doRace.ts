// gonna race once and update daily race count and all that shit
// if doTrx succeds and returns 1, else returns 0
import { execute_race_action, sleep, get_days } from "./services";
import { config } from "../cli";

const do_race = async (
	dryrun: boolean | undefined,
	race_progress: boolean,
	daily_race_count: number,
	last_played_date: number,
	config: config
): Promise<number | undefined> => {
	if (
		(!race_progress && daily_race_count < 10) ||
		(!race_progress &&
			get_days(Date.now() - last_played_date * 1000) >= 1 &&
			daily_race_count <= 10)
	) {
		try {
			await execute_race_action(config, dryrun);
			return 1;
		} catch (err) {
			return 0;
		}
	} else return undefined;
};

module.exports = do_race;
export default do_race;
