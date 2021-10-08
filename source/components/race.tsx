import React, { FC, useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";

import { player_info } from "../types";
import {
	get_people_in_queue,
	get_player_info,
	get_snake_oil_balance,
	is_race_in_progress,
	get_race_results,
} from "../services";

import { config } from "../cli";
import do_race from "../doRace";

const Race: FC<{
	autorace: boolean | undefined;
	previous_results: Array<any>;
	race_results: Array<any>;
	SetRace_results: React.Dispatch<React.SetStateAction<any[] | undefined>>;
	player_info: player_info;
	account: string;
	race_progress: boolean;
	Setrace_progress: React.Dispatch<any>;
	realtime_race_count: number;
	Setrealtime_race_count: React.Dispatch<number>;
	daily_race_count: number;
	SetDaily_race_count: React.Dispatch<number>;
	Setsnake_oil_balance: React.Dispatch<React.SetStateAction<string>>;
	config: config;
	changeOurRaceCountFromChild: any;
}> = ({
	autorace,
	race_progress,
	Setrace_progress,
	account,
	Setsnake_oil_balance,
	daily_race_count,
	SetDaily_race_count,
	Setrealtime_race_count,
	SetRace_results,
	config,
	changeOurRaceCountFromChild,
}) => {
	const [people_in_queue, SetPeople_in_queue] = useState<undefined | number>(
		undefined
	);
	const [our_race_count, SetOur_race_count] = useState(0);

	const { exit } = useApp();

	useEffect(() => {
		async function update() {
			const [
				raceprog_temp,
				plinfo_temp,
				snake_oil_balance,
				people_in_queue_temp,
				race_results_temp,
			] = await Promise.all([
				is_race_in_progress(account),
				get_player_info(account),
				get_snake_oil_balance(account),
				get_people_in_queue(),
				get_race_results(account),
			]);

			Setrace_progress(raceprog_temp);
			Setsnake_oil_balance(snake_oil_balance);
			SetPeople_in_queue(people_in_queue_temp);
			SetDaily_race_count(plinfo_temp.daily_race_count);
			Setrealtime_race_count(
				raceprog_temp
					? plinfo_temp.daily_race_count - 1
					: plinfo_temp.daily_race_count
			);
			SetRace_results(race_results_temp);
		}
		update().then(() => {
			race_progress_updater();
		});
	}, [race_progress]); // updates data everytime race progress changes

	const race_progress_updater = () => {
		if (!autorace && our_race_count >= 1) {
			exit();
		} else if (race_progress != undefined && race_progress)
			setInterval(async () => {
				Setrace_progress(await is_race_in_progress(account));
				SetPeople_in_queue(await get_people_in_queue());
			}, 5000);
		else {
			do_race(account, race_progress, daily_race_count, config).then(
				async (result) => {
					if (result) {
						SetOur_race_count(
							(current_our_race_count) => current_our_race_count + result
						);
						changeOurRaceCountFromChild(our_race_count);
						Setrace_progress(await is_race_in_progress(account));
						SetPeople_in_queue(await get_people_in_queue());
					}
				}
			);
		}
	};

	return (
		<>
			{race_progress ? (
				<Box marginLeft={5} marginTop={1}>
					<Text>
						<Text color="green">
							<Spinner type="dots" />
						</Text>
						{" Race in progress, people in queue: "}
						{people_in_queue}
					</Text>
				</Box>
			) : (
				<></>
			)}
		</>
	);
};

module.exports = Race;
export default Race;
