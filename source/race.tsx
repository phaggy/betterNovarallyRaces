import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";

import { player_info } from "./types";
import {
	get_people_in_queue,
	get_player_info,
	is_race_in_progress,
	sleep,
} from "./services";

import { do_race } from "./services";

const Race: FC<{
	previous_results: Array<any>;
	SetPrevious_results: React.Dispatch<React.SetStateAction<any[] | undefined>>;
	race_results: Array<any>;
	SetRace_results: React.Dispatch<React.SetStateAction<any[] | undefined>>;
	player_info: player_info;
	Setplayer_info: React.Dispatch<React.SetStateAction<player_info | undefined>>;
	race_progress: boolean;
	Setrace_progress: React.Dispatch<any>;
	account: string;
	daily_race_count: number;
}> = ({
	previous_results,
	SetPrevious_results,
	race_results,
	SetRace_results,
	player_info,
	Setplayer_info,
	race_progress,
	Setrace_progress,
	account,
	daily_race_count,
}) => {
	useEffect(() => {
		async function update() {
			const [raceprog_temp, plinfo_temp] = await Promise.all([
				is_race_in_progress(account),
				get_player_info(account),
			]);
			Setrace_progress(raceprog_temp);
			Setplayer_info(plinfo_temp);
		}
		update();
	}, []);

	const [people_in_queue, SetPeope_in_queue] = useState<undefined | number>(
		undefined
	);

	{
		(async () => {
			if (!race_progress && daily_race_count < 10) {
				<Text>Tyring to race</Text>;
				try {
					// await do_race(
					// 	account,
					// 	vehicle_asset_id,
					// 	driver1_asset_id,
					// 	driver2_asset_id
					// );
				} catch (err) {
					<Text>error trying to trx</Text>;
				}
			}
			await sleep(2000);
			Setrace_progress(await is_race_in_progress(account));
			let i = 10;
			while (i > 0) {
				await sleep(2000);
				Setrace_progress(await is_race_in_progress(account));
				SetPeope_in_queue(await get_people_in_queue());
				i -= 1;
			}
			Setplayer_info(await get_player_info(account));
		})();
	}

	return (
		<Box>
			<Text>{people_in_queue}</Text>
			{/* <ProgressBar percent={0.5} /> */}
		</Box>
	);
};

module.exports = Race;
export default Race;
