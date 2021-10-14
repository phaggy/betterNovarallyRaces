import React, { FC } from "react";
import { Box, Text } from "ink";
import { balance } from "../util/types";

const Balances: FC<{
	snake__balance: balance[];
}> = ({ snake__balance }) => {
	const balances = snake__balance.map((balance, index) => {
		if (/SNAKOIL/gi.test(balance.balance))
			return (
				<Box marginRight={8} key={index}>
					<Text>Snakeoil: </Text>
					<Text color="yellowBright">{balance.balance}</Text>
				</Box>
			);
		else if (/BOOST/gi.test(balance.balance))
			return (
				<Box marginRight={8} key={index}>
					<Text>Boost: </Text>
					<Text color="yellowBright">{balance.balance}</Text>
				</Box>
			);
		else if (/SNAKGAS/gi.test(balance.balance))
			return (
				<Box marginRight={8} key={index}>
					<Text>Snakegas: </Text>
					<Text color="yellowBright">{balance.balance}</Text>
				</Box>
			);
		else if (/SNAKVENOM/gi.test(balance.balance))
			return (
				<Box marginRight={8} key={index}>
					<Text>Snakevenom: </Text>
					<Text color="yellowBright">{balance.balance}</Text>
				</Box>
			);
		else
			return (
				<Box marginRight={8} key={index}>
					<Text>sus: </Text>
					<Text color="yellowBright">{balance.balance}</Text>
				</Box>
			);
	});

	return (
		<Box flexDirection="row" flexGrow={1} justifyContent="flex-start">
			{balances}
		</Box>
	);
};

export default Balances;
