import React, { FC } from "react";
import { Box, Text } from "ink";

const DisplayPrizes: FC<{
	pending_prizes: Array<any>;
}> = ({ pending_prizes }) => {
	return (
		<>
			<Box marginLeft={4} padding={1}>
				<Text>
					Pending prizes: [
					{pending_prizes.map((prize_id, index) => {
						switch (String(prize_id)) {
							case "255777":
								return (
									<Text color="greenBright" key={index}>
										{" "}
										|Common character shard|{" "}
									</Text>
								);
							case "255782":
								return (
									<Text color="greenBright" key={index}>
										{" "}
										|Uncommon character shard|{" "}
									</Text>
								);
							case "255785":
								return (
									<Text color="greenBright" key={index}>
										{" "}
										|Rare character shard|{" "}
									</Text>
								);
							case "255783":
								return (
									<Text color="greenBright" key={index}>
										{" "}
										|Common car shard|{" "}
									</Text>
								);
							case "255787":
								return (
									<Text color="greenBright" key={index}>
										{" "}
										|Rare car shard|{" "}
									</Text>
								);
							default:
								return (
									<Text color="greenBright" key={index}>
										{" "}
										|{prize_id}|{" "}
									</Text>
								);
						}
					})}
					]
				</Text>
			</Box>
		</>
	);
};

export default DisplayPrizes;
