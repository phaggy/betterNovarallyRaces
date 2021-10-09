import React, { FC } from "react";
import { Box, Text } from "ink";

const DisplayRaceResults: FC<{
	race_results: Array<any> | undefined;
	realtime_race_count: number | undefined;
}> = ({ race_results, realtime_race_count }) => {
	if (race_results && realtime_race_count) {
		return (
			<>
				<Box marginLeft={5} marginTop={1}>
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
				<Box marginLeft={5} marginTop={1}>
					<Text>Previous Race result: </Text>
					<Text color="yellowBright">{race_results[0].position}</Text>
				</Box>
			</>
		);
	} else {
		return <Box></Box>;
	}
};

export default DisplayRaceResults;
module.exports = DisplayRaceResults;
