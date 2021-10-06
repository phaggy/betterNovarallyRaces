import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import {
	is_race_in_progress,
	get_player_info,
	get_snake_oil_balance,
	get_race_results,
} from "./services";

import { config } from "./cli";
import { player_info } from "./types";
import Race from "./race";

const DisplayRaceResults: FC<{
	race_results: Array<any> | undefined;
	realtime_race_count: number | undefined;
}> = ({ race_results, realtime_race_count }) => {
	if (race_results && realtime_race_count) {
		return (
			<Box marginLeft={1} marginTop={1}>
				<Text>
					Today's Race results: [{" "}
					{race_results
						.slice(0, realtime_race_count)
						.map((race: any, index) => {
							if (race.position === 1) {
								return (
									<Text color="greenBright" key={index}>
										{race.position}st,{" "}
									</Text>
								);
							} else if (race.position === 2) {
								return (
									<Text color="greenBright" key={index}>
										{race.position}nd,{" "}
									</Text>
								);
							} else if (race.position === 3) {
								return (
									<Text color="greenBright" key={index}>
										{race.position}rd,{" "}
									</Text>
								);
							} else {
								return (
									<Text color="greenBright" key={index}>
										{race.position}th,{" "}
									</Text>
								);
							}
						})}
					]
				</Text>
			</Box>
		);
	} else {
		return <Box></Box>;
	}
};

const App: FC<{
	autorace?: boolean;
	config: config;
	drivers: Array<string>;
	vehicles: Array<string>;
	endpoint: string;
}> = ({ autorace, config, drivers, vehicles, endpoint }) => {
	const [race_progress, Setrace_progress] = useState(false);
	const [snake_oil_balance, Setsnake_oil_balance] = useState("");
	const [player_info, Setplayer_info] = useState<player_info | undefined>(
		undefined
	);
	const [realtime_race_count, Setrealtime_race_count] = useState<
		number | undefined
	>(undefined);
	const [race_results, SetRace_results] = useState<Array<any> | undefined>(
		undefined
	);
	const [previous_results, SetPrevious_results] = useState<any[] | undefined>(
		undefined
	);
	const { account } = config;

	useEffect(() => {
		async function fetchValues() {
			const [
				player_info_temp,
				race_progress_temp,
				snake_oil_balance_temp,
				race_results_temp,
			] = await Promise.all([
				get_player_info(account),
				is_race_in_progress(account),
				get_snake_oil_balance(account),
				get_race_results(account),
			]);
			Setplayer_info(player_info_temp);
			Setsnake_oil_balance(snake_oil_balance_temp);
			Setrace_progress(race_progress_temp);
			Setrealtime_race_count(
				race_progress_temp
					? player_info_temp.daily_race_count - 1
					: player_info_temp.daily_race_count
			);
			SetRace_results(race_results_temp); // this is gonna be updated later in the Race component
			SetPrevious_results(race_results_temp); // this is not gonna be updated outside this file
		}
		fetchValues();
	}, []);

	return (
		<Box flexGrow={1} flexDirection="column">
			<Box
				flexGrow={1}
				// alignItems="center"
				justifyContent="center"
				flexDirection="row"
				margin={1}
			>
				{autorace ? (
					<Text>---autorace---</Text>
				) : (
					<Text>---no-autorace---</Text>
				)}
			</Box>
			<Box marginLeft={1} marginBottom={1}>
				<Text>
					Snakeoil: <Text color="yellowBright">{snake_oil_balance}</Text>
				</Text>
			</Box>
			<Box marginLeft={1}>
				<Text>
					Daily Race count:{" "}
					<Text color="yellowBright">{realtime_race_count}</Text>
				</Text>
			</Box>
			{race_progress ? (
				<Box marginLeft={1}>
					<Text>+1 Race is in progress</Text>
				</Box>
			) : (
				<></>
			)}
			<DisplayRaceResults
				race_results={race_results}
				realtime_race_count={realtime_race_count}
			/>
			{previous_results &&
			race_results &&
			player_info &&
			realtime_race_count ? (
				<Race
					previous_results={previous_results}
					SetPrevious_results={SetPrevious_results}
					race_results={race_results}
					SetRace_results={SetRace_results}
					player_info={player_info}
					Setplayer_info={Setplayer_info}
					account={account}
					race_progress={race_progress}
					Setrace_progress={Setrace_progress}
					daily_race_count={realtime_race_count}
				/>
			) : (
				<Box></Box>
			)}
		</Box>
	);
};

module.exports = App;
export default App;
