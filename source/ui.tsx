import React, { FC, useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import {
	is_race_in_progress,
	get_player_info,
	get_race_results,
	get_days,
	get_snake__balance,
} from "./util/services";

import { config } from "./cli";
import {
	balance,
	info_results_batch,
	player_info,
	running_batch,
} from "./util/types";

import Race from "./components/race";
import DisplayRaceResults from "./components/displayResults";
import DisplayPrizes from "./components/displayPrizes";
import Balances from "./components/displayBalance";
import DisplayAssets from "./components/displayAssets";

const App: FC<{
	autorace?: boolean;
	dryrun?: boolean;
	config: config;
}> = ({ autorace, dryrun, config }) => {
	// const [race_progress, Setrace_progress] = useState<undefined | true | false>(
	// 	undefined
	// );
	// const [snake__balance, Setsnake__balance] = useState<balance[] | undefined>(
	// 	undefined
	// );
	// const [realtime_race_count, Setrealtime_race_count] = useState<
	// 	number | undefined
	// >(undefined); // this is displayed in the console
	// const [race_results, SetRace_results] = useState<Array<any> | undefined>(
	// 	undefined
	// );

	// const [player_info, SetPlayer_info] = useState<player_info | undefined>(
	// 	undefined
	// );
	// const [daily_race_count, SetDaily_race_count] = useState<number | undefined>(
	// 	undefined
	// ); // this is used to check if limit of 10 has been reached
	// const [previous_results, SetPrevios_results] = useState<any[] | undefined>(
	// 	undefined
	// );
	// const [pending_prizes, SetPending_prizes] = useState<any[] | []>([]);
	// const [our_race_count, SetOur_race_count] = useState(0);
	// const [last_played_date, SetLast_played_date] = useState<number | undefined>(
	// 	undefined
	// );

	const [mounted, SetMounted] = useState(true);

	const [info_results_batch, SetInfo_results_batch] = useState<
		info_results_batch | undefined
	>(undefined);
	const [running_batch, SetRunning_batch] = useState<running_batch | undefined>(
		undefined
	);

	// const changeOurRaceCountFromChild = (our_race_count: number) => {
	// 	SetOur_race_count(our_race_count);
	// };

	const { account } = config;
	const { exit } = useApp();

	useEffect(() => {
		async function fetchValues() {
			const [
				player_info_temp,
				race_progress_temp,
				snake__balance_temp,
				previous_results_temp,
			] = await Promise.all([
				get_player_info(account),
				is_race_in_progress(account),
				get_snake__balance(account),
				get_race_results(account),
			]);

			SetInfo_results_batch({
				snake__balance: snake__balance_temp,
				race_results: previous_results_temp,
				player_info: player_info_temp,
				daily_race_count: player_info_temp.daily_race_count,
				realtime_race_count: race_progress_temp
					? player_info_temp.daily_race_count - 1
					: player_info_temp.daily_race_count,
				previous_results: previous_results_temp,
				pending_prizes: player_info_temp.pending_prizes,
				last_played_date: player_info_temp.last_played_date,
			});

			SetRunning_batch({
				our_race_count: 0,
				race_progress: race_progress_temp,
				people_in_queue: 0,
			});

			// SetPlayer_info(player_info_temp);
			// SetPrevios_results(previous_results_temp);
			// SetDaily_race_count(player_info_temp.daily_race_count);
			// SetLast_played_date(player_info_temp.last_played_date);
			// Setsnake__balance(snake__balance_temp);
			// Setrace_progress(race_progress_temp);
			// SetRace_results(previous_results_temp);
			// SetPending_prizes(player_info_temp.pending_prizes);

			// Setrealtime_race_count(
			// 	race_progress_temp
			// 		? player_info_temp.daily_race_count - 1
			// 		: player_info_temp.daily_race_count
			// );
			if (
				player_info_temp.last_played_date &&
				player_info_temp.daily_race_count &&
				player_info_temp.daily_race_count >= 10 &&
				!race_progress_temp &&
				get_days(Date.now() - player_info_temp.last_played_date * 1000) < 1
			) {
				console.log("exiting");
				SetMounted(false);
				// exit();
			}
		}

		if (mounted) {
			fetchValues();
			// .then(() => {});
		}

		return function cleanup() {
			SetMounted(false);
		};
	}, []);

	return (
		<Box flexDirection="column">
			{console.log("ui.tsx", { running_batch })}
			{info_results_batch && running_batch ? (
				<>
					<Box
						flexGrow={1}
						justifyContent="center"
						flexDirection="row"
						margin={1}
						borderColor="green"
						borderStyle="round"
					>
						{autorace ? (
							<Text color="greenBright">---autorace---</Text>
						) : (
							<Text color="greenBright">---no-autorace---</Text>
						)}
					</Box>
					<Box marginLeft={5}>
						{info_results_batch && info_results_batch.snake__balance ? (
							<Balances snake__balance={info_results_batch.snake__balance} />
						) : (
							<></>
						)}
					</Box>

					<Box flexDirection="row" flexGrow={1}>
						<Box flexGrow={1} flexDirection="column">
							<Box marginTop={1}>
								{info_results_batch &&
								info_results_batch.pending_prizes.length > 0 ? (
									<DisplayPrizes
										pending_prizes={info_results_batch.pending_prizes}
									/>
								) : (
									<></>
								)}
							</Box>
							<Box marginLeft={5}>
								<Text>Daily Race count: </Text>
								<Text color="yellowBright">
									{info_results_batch && info_results_batch.realtime_race_count}
								</Text>
								{running_batch && running_batch.race_progress ? (
									<>
										<Text color="yellowBright"> +1 </Text>
										<Text color="grey">(in progress)</Text>
									</>
								) : (
									<></>
								)}
							</Box>
							<Box marginLeft={5}>
								<Text>Our race count: </Text>
								<Text color="yellowBright">{running_batch.our_race_count}</Text>
							</Box>
							<DisplayRaceResults
								race_results={info_results_batch.race_results}
								realtime_race_count={info_results_batch.realtime_race_count}
							/>
							<Race
								autorace={autorace}
								dryrun={dryrun}
								account={account}
								info_results_batch={info_results_batch}
								SetInfo_results_batch={SetInfo_results_batch}
								running_batch={running_batch}
								SetRunning_batch={SetRunning_batch}
								config={config}
								exit={exit}
								mounted={mounted}
								SetMounted={SetMounted}
							/>
						</Box>
						<Box
							marginRight={5}
							marginLeft={3}
							flexDirection="column"
							flexShrink={0}
						>
							<Box>
								<Text>Racing with:</Text>
							</Box>
							{running_batch.race_progress !== undefined ? (
								<>
									<DisplayAssets
										config={config}
										race_progress={running_batch.race_progress}
										mounted={mounted}
									/>
								</>
							) : (
								<></>
							)}
						</Box>
					</Box>
					{info_results_batch.last_played_date &&
					info_results_batch.daily_race_count &&
					info_results_batch.daily_race_count >= 10 &&
					!running_batch.race_progress &&
					get_days(Date.now() - info_results_batch.last_played_date * 1000) <
						1 ? (
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
									Daily race limit of 10 races reached, exiting...
								</Text>
							</Box>
						</>
					) : (
						<></>
					)}
				</>
			) : (
				<Box>
					<Text>Loading</Text>
				</Box>
			)}
		</Box>
	);
};

module.exports = App;
export default App;
