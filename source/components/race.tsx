import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";

import { balance, player_info } from "../util/types";
import {
	get_people_in_queue,
	get_player_info,
	is_race_in_progress,
	get_race_results,
	sleep,
	get_snake__balance,
} from "../util/services";

import { config } from "../cli";
import do_race from "../util/doRace";

const Race: FC<{
	autorace: boolean | undefined;
	dryrun: boolean | undefined;
	previous_results: Array<any> | undefined;
	race_results: Array<any> | undefined;
	SetRace_results: React.Dispatch<React.SetStateAction<any[] | undefined>>;
	player_info: player_info | undefined;
	account: string;
	race_progress: boolean;
	Setrace_progress: React.Dispatch<React.SetStateAction<boolean | undefined>>;
	realtime_race_count: number | undefined;
	Setrealtime_race_count: React.Dispatch<number>;
	daily_race_count: number | undefined;
	SetDaily_race_count: React.Dispatch<React.SetStateAction<number | undefined>>;
	Setsnake__balance: React.Dispatch<
		React.SetStateAction<balance[] | undefined>
	>;
	config: config;
	our_race_count: number;
	last_played_date: number | undefined;
	SetOur_race_count: React.Dispatch<React.SetStateAction<number>>;
	SetPending_prizes: React.Dispatch<React.SetStateAction<any[] | []>>;
	exit: any;
}> = ({
	autorace,
	dryrun,
	race_progress,
	Setrace_progress,
	account,
	Setsnake__balance,
	daily_race_count,
	SetDaily_race_count,
	Setrealtime_race_count,
	SetRace_results,
	config,
	our_race_count,
	last_played_date,
	SetOur_race_count,
	SetPending_prizes,
	exit,
}) => {
	const [people_in_queue, SetPeople_in_queue] = useState<undefined | number>(
		undefined
	);
	useEffect(() => {
		let mounted = true;
		let interval_id: NodeJS.Timer | undefined = undefined;
		async function update() {
			await sleep(500);
			const [
				raceprog_temp,
				plinfo_temp,
				snake__balance_temp,
				people_in_queue_temp,
				race_results_temp,
			] = await Promise.all([
				is_race_in_progress(account),
				get_player_info(account),
				get_snake__balance(account),
				get_people_in_queue(),
				get_race_results(account),
			]);

			Setrace_progress(raceprog_temp);
			Setsnake__balance(snake__balance_temp);
			SetPeople_in_queue(people_in_queue_temp);
			SetDaily_race_count(plinfo_temp.daily_race_count);
			Setrealtime_race_count(
				raceprog_temp
					? plinfo_temp.daily_race_count - 1
					: plinfo_temp.daily_race_count
			);
			SetRace_results(race_results_temp);
			SetPending_prizes(plinfo_temp.pending_prizes);
		}

		if (mounted)
			update().then(() => {
				interval_id = race_progress_updater();
			});

		return function cleanup() {
			mounted = false;
			if (interval_id) clearInterval(interval_id); // stops fetching shit when told to
		};
	}, [race_progress]); // updates data everytime race progress changes

	const race_progress_updater = () => {
		if (!autorace && our_race_count >= 1 && !race_progress) {
			exit();
			return undefined;
		} else if (race_progress != undefined && race_progress) {
			const interval = setInterval(async () => {
				const people_in_queue_temp = await get_people_in_queue();
				SetPeople_in_queue(people_in_queue_temp);
				if (people_in_queue_temp >= 31) {
					const race_progress_temp = await is_race_in_progress(account);
					Setrace_progress(race_progress_temp);
				}
			}, 5000);
			return interval;
		} else if (race_progress === false) {
			if (daily_race_count && last_played_date) {
				do_race(
					dryrun,
					race_progress,
					daily_race_count,
					last_played_date,
					config
				).then(async (result) => {
					if (result != undefined && result != 0) {
						console.log("trx successful");
						SetOur_race_count(
							(current_our_race_count) => current_our_race_count + result
						);
						const people_in_queue_temp = await get_people_in_queue();
						SetPeople_in_queue(people_in_queue_temp);
						Setrace_progress(true);
					} else {
						console.log("trx unsuccesful, exiting");
						exit();
					}
				});
			}
			return undefined;
		} else return undefined;
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
				<Box marginLeft={5} marginTop={1}>
					<Text>
						<Text color="green">
							<Spinner type="dots" />
						</Text>
						{" Trying to race"}
					</Text>
				</Box>
			)}
		</>
	);
};

module.exports = Race;
export default Race;
