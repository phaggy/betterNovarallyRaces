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
import { balance, player_info } from "./util/types";

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
	const [race_progress, Setrace_progress] = useState<undefined | true | false>(
		undefined
	);
	const [snake__balance, Setsnake__balance] = useState<balance[] | undefined>(
		undefined
	);
	const [realtime_race_count, Setrealtime_race_count] = useState<
		number | undefined
	>(undefined); // this is displayed in the console
	const [race_results, SetRace_results] = useState<Array<any> | undefined>(
		undefined
	);

	const [player_info, SetPlayer_info] = useState<player_info | undefined>(
		undefined
	);
	const [daily_race_count, SetDaily_race_count] = useState<number | undefined>(
		undefined
	); // this is used to check if limit of 10 has been reached
	const [previous_results, SetPrevios_results] = useState<any[] | undefined>(
		undefined
	);
	const [pending_prizes, SetPending_prizes] = useState<any[] | []>([]);
	const [our_race_count, SetOur_race_count] = useState(0);
	const [last_played_date, SetLast_played_date] = useState<number | undefined>(
		undefined
	);

	// const changeOurRaceCountFromChild = (our_race_count: number) => {
	// 	SetOur_race_count(our_race_count);
	// };

	const { account } = config;
	const { exit } = useApp();

	useEffect(() => {
		let mounted = true;

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

			SetPlayer_info(player_info_temp);
			SetPrevios_results(previous_results_temp);
			SetDaily_race_count(player_info_temp.daily_race_count);
			SetLast_played_date(player_info_temp.last_played_date);
			Setsnake__balance(snake__balance_temp);
			Setrace_progress(race_progress_temp);
			SetRace_results(previous_results_temp);
			SetPending_prizes(player_info_temp.pending_prizes);

			Setrealtime_race_count(
				race_progress_temp
					? player_info_temp.daily_race_count - 1
					: player_info_temp.daily_race_count
			);
		}

		if (mounted) {
			fetchValues().then(() => {
				if (
					last_played_date &&
					daily_race_count &&
					daily_race_count >= 10 &&
					!race_progress &&
					get_days(Date.now() - last_played_date * 1000) < 1
				) {
					exit();
				}
			});
		}

		return function cleanup() {
			mounted = false;
		};
	}, []);

	return (
		<Box flexDirection="column">
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
				{snake__balance ? <Balances snake__balance={snake__balance} /> : <></>}
			</Box>

			<Box flexDirection="row">
				<Box flexGrow={1} flexDirection="column">
					<Box marginTop={1}>
						{pending_prizes.length > 0 ? (
							<DisplayPrizes pending_prizes={pending_prizes} />
						) : (
							<></>
						)}
					</Box>
					<Box marginLeft={5}>
						<Text>Daily Race count: </Text>
						<Text color="yellowBright">{realtime_race_count}</Text>
						{race_progress ? (
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
						<Text color="yellowBright">{our_race_count}</Text>
					</Box>
					<DisplayRaceResults
						race_results={race_results}
						realtime_race_count={realtime_race_count}
					/>

					{last_played_date &&
					daily_race_count &&
					daily_race_count >= 10 &&
					!race_progress &&
					get_days(Date.now() - last_played_date * 1000) < 1 ? (
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
					{daily_race_count &&
					last_played_date &&
					race_progress != undefined ? (
						<Race
							autorace={autorace}
							dryrun={dryrun}
							previous_results={previous_results}
							race_results={race_results}
							SetRace_results={SetRace_results}
							player_info={player_info}
							account={account}
							race_progress={race_progress}
							Setrace_progress={Setrace_progress}
							daily_race_count={daily_race_count}
							SetDaily_race_count={SetDaily_race_count}
							realtime_race_count={realtime_race_count}
							Setrealtime_race_count={Setrealtime_race_count}
							Setsnake__balance={Setsnake__balance}
							config={config}
							SetOur_race_count={SetOur_race_count}
							our_race_count={our_race_count}
							last_played_date={last_played_date}
							SetPending_prizes={SetPending_prizes}
							exit={exit}
						/>
					) : (
						<></>
					)}
				</Box>
				<Box flexGrow={1} flexDirection="column" justifyContent="flex-end">
					<DisplayAssets config={config} />
				</Box>
			</Box>
		</Box>
	);
};

module.exports = App;
export default App;
