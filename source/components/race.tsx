import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";

import {
	balance,
	info_results_batch,
	player_info,
	running_batch,
} from "../util/types";
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
	account: string;
	// previous_results: Array<any> | undefined;
	// race_results: Array<any> | undefined;
	// SetRace_results: React.Dispatch<React.SetStateAction<any[] | undefined>>;
	// player_info: player_info | undefined;
	// race_progress: boolean;
	// Setrace_progress: React.Dispatch<React.SetStateAction<boolean | undefined>>;
	// realtime_race_count: number | undefined;
	// Setrealtime_race_count: React.Dispatch<number>;
	// daily_race_count: number | undefined;
	// SetDaily_race_count: React.Dispatch<React.SetStateAction<number | undefined>>;
	// Setsnake__balance: React.Dispatch<
	// 	React.SetStateAction<balance[] | undefined>
	// >;
	config: config;
	// our_race_count: number;
	// last_played_date: number | undefined;
	// SetOur_race_count: React.Dispatch<React.SetStateAction<number>>;
	// SetPending_prizes: React.Dispatch<React.SetStateAction<any[] | []>>;
	info_results_batch: info_results_batch;
	SetInfo_results_batch: React.Dispatch<
		React.SetStateAction<info_results_batch | undefined>
	>;
	running_batch: running_batch;
	SetRunning_batch: React.Dispatch<React.SetStateAction<any | undefined>>;
	exit: any;
	mounted: boolean;
	SetMounted: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
	autorace,
	dryrun,
	config,
	account,
	exit,
	info_results_batch,
	SetInfo_results_batch,
	running_batch,
	SetRunning_batch,
	SetMounted,
}) => {
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

			return {
				raceprog_temp,
				plinfo_temp,
				snake__balance_temp,
				people_in_queue_temp,
				race_results_temp,
			};
		}
		if (mounted)
			update().then(
				({
					raceprog_temp,
					plinfo_temp,
					snake__balance_temp,
					people_in_queue_temp,
					race_results_temp,
				}) => {
					console.log("update", { raceprog_temp });
					interval_id = race_progress_updater(raceprog_temp);
					SetRunning_batch((prevBatch: running_batch) => {
						return {
							...prevBatch,
							race_progress: raceprog_temp,
							people_in_queue: people_in_queue_temp,
						};
					});
					SetInfo_results_batch((prevBatch) => {
						if (prevBatch)
							return {
								...prevBatch,
								snake__balance: snake__balance_temp,
								daily_race_count: plinfo_temp.daily_race_count,
								realtime_race_count: raceprog_temp
									? plinfo_temp.daily_race_count - 1
									: plinfo_temp.daily_race_count,
								race_results: race_results_temp,
								pending_prizes: plinfo_temp.pending_prizes,
								player_info: plinfo_temp,
							};
						else return prevBatch;
					});
				}
			);

		return function cleanup() {
			mounted = false;
			if (interval_id) clearInterval(interval_id); // stops fetching shit when told to
		};
	}, [running_batch.race_progress]); // updates data everytime race progress changes

	const race_progress_updater = (race_progress_from_update: boolean) => {
		const { our_race_count } = running_batch;
		const { daily_race_count, last_played_date } = info_results_batch;
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
				SetRunning_batch((prevBatch: running_batch) => {
					return {
						...prevBatch,
						people_in_queue: people_in_queue_temp,
						race_progress: race_progress_temp,
					};
				});
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
						const people_in_queue_temp = await get_people_in_queue();
						SetRunning_batch((prevBatch: running_batch) => {
							return {
								...prevBatch,
								our_race_count: prevBatch.our_race_count + 1,
								people_in_queue: people_in_queue_temp,
								race_progress: true,
							};
						});
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
			{console.log("race.tsx", { running_batch })}
			{running_batch.race_progress ? (
				<Box marginLeft={5} marginTop={1}>
					<Text>
						<Text color="green">
							<Spinner type="dots" />
						</Text>
						{" Race in progress, people in queue: "}
						{running_batch.people_in_queue}
					</Text>
				</Box>
			) : !autorace &&
			  running_batch.our_race_count >= 1 &&
			  !running_batch.race_progress ? (
				<>
					<Box
						flexGrow={1}
						justifyContent="center"
						flexDirection="row"
						marginTop={3}
						marginBottom={3}
						marginLeft={9}
						marginRight={9}
						borderColor="red"
						borderStyle="classic"
					>
						<Text color="red" bold>
							1 race done, exiting...
						</Text>
					</Box>
				</>
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
