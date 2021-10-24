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
	mounted: boolean;
	SetMounted: React.Dispatch<React.SetStateAction<boolean>>;
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
	SetMounted,
}) => {
	const [people_in_queue, SetPeople_in_queue] = useState<undefined | number>(
		undefined
	);
	useEffect(() => {
		let mounted = true;
		console.log({ mounted });
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

			return [
				raceprog_temp,
				plinfo_temp,
				snake__balance_temp,
				people_in_queue_temp,
				race_results_temp,
			];
		}
		if (mounted)
			update().then(
				([
					raceprog_temp,
					plinfo_temp,
					snake__balance_temp,
					people_in_queue_temp,
					race_results_temp,
				]) => {
					console.log("update", { raceprog_temp });
					interval_id = race_progress_updater(raceprog_temp);
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
			);

		return function cleanup() {
			mounted = false;
			if (interval_id) clearInterval(interval_id); // stops fetching shit when told to
		};
	}, [race_progress]); // updates data everytime race progress changes

	const race_progress_updater = (race_progress_from_update: boolean) => {
		if (!autorace && our_race_count >= 1 && !race_progress_from_update) {
			SetMounted(false);
			return undefined;
		} else if (
			race_progress_from_update != undefined &&
			race_progress_from_update
		) {
			const interval = setInterval(async () => {
				const [people_in_queue_temp, race_progress_temp] = await Promise.all([
					get_people_in_queue(),
					is_race_in_progress(account),
				]);
				SetPeople_in_queue(people_in_queue_temp);
				Setrace_progress(race_progress_temp);
			}, 7500);
			return interval;
		} else if (race_progress_from_update === false) {
			if (daily_race_count && last_played_date) {
				do_race(
					dryrun,
					race_progress_from_update,
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
						await sleep(750);
						console.log("slept for 750ms");
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
