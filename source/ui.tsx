import React, { FC, useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import {
	is_race_in_progress,
	get_player_info,
	get_snake_oil_balance,
	get_race_results,
} from "./services";

import { config } from "./cli";
import { player_info } from "./types";

import Race from "./components/race";
import DisplayRaceResults from "./components/displayResults";

const App: FC<{
	autorace?: boolean;
	config: config;
	drivers: Array<string>;
	vehicles: Array<string>;
	endpoint: string;
}> = ({ autorace, config, drivers, vehicles, endpoint }) => {
	const [race_progress, Setrace_progress] = useState(false);
	const [snake_oil_balance, Setsnake_oil_balance] = useState("");
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
	const [our_race_count, SetOur_race_count] = useState(0);

	const changeOurRaceCountFromChild = (our_race_count: number) => {
		SetOur_race_count(our_race_count);
	};

	const { account } = config;
	const { exit } = useApp();

	useEffect(() => {
		async function fetchValues() {
			const [
				player_info_temp,
				race_progress_temp,
				snake_oil_balance_temp,
				previous_results_temp,
			] = await Promise.all([
				get_player_info(account),
				is_race_in_progress(account),
				get_snake_oil_balance(account),
				get_race_results(account),
			]);

			// prolly not gonna be updated
			SetPlayer_info(player_info_temp);
			SetPrevios_results(previous_results_temp);
			SetDaily_race_count(player_info_temp.daily_race_count);

			// reactive variables
			Setsnake_oil_balance(snake_oil_balance_temp);
			Setrace_progress(race_progress_temp);
			SetRace_results(previous_results_temp);

			Setrealtime_race_count(
				race_progress_temp
					? player_info_temp.daily_race_count - 1
					: player_info_temp.daily_race_count
			);
			// SetRace_results(race_results_temp); // this is gonna be updated later in the Race component
		}
		fetchValues().then(() => {
			if (daily_race_count && daily_race_count >= 10) {
				exit();
			}
		});
	}, []);

	return (
		<Box flexGrow={1} flexDirection="column">
			<Box
				flexGrow={1}
				justifyContent="center"
				flexDirection="row"
				margin={1}
				borderColor="green"
				borderStyle="classic"
			>
				{autorace ? (
					<Text color="greenBright">---autorace---</Text>
				) : (
					<Text>---no-autorace---</Text>
				)}
			</Box>
			<Box marginLeft={5} marginBottom={1}>
				<Text>
					Snakeoil: <Text color="yellowBright">{snake_oil_balance}</Text>
				</Text>
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

			{daily_race_count && daily_race_count >= 10 ? (
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
			previous_results &&
			race_results &&
			player_info &&
			realtime_race_count &&
			daily_race_count < 10 ? (
				<Race
					autorace={autorace}
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
					Setsnake_oil_balance={Setsnake_oil_balance}
					config={config}
					changeOurRaceCountFromChild={changeOurRaceCountFromChild}
				/>
			) : (
				<></>
			)}
		</Box>
	);
};

module.exports = App;
export default App;
