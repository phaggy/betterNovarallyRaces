import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import { atomicassetsApi } from "../util/services";
import { config } from "../cli";

const DisplayAssets: FC<{
	config: config;
	race_progress: boolean;
}> = ({ config, race_progress }) => {
	const [assets, SetAssets] = useState<undefined | any[]>(undefined);
	useEffect(() => {
		let mounted = true;
		let assets: string[] = [];
		if (config.league === "inter" && config.inter) {
			const { inter } = config;
			assets = [...inter.drivers, ...inter.vehicles];
		} else assets = [...config.drivers, ...config.vehicles];
		const get_assets = async () => {
			const assets_info = await Promise.all(
				assets.map(async (asset_id) => {
					const result = await atomicassetsApi.getAsset(asset_id);
					const { data } = result;
					const { name } = data;
					const league = data["Quality"];
					const rookie_wins = data["Rookie League Wins"];
					const inter_wins = data["Intermediate League Wins"];
					const veteran_wins = data["Veteran League Wins"];
					return { name, league, rookie_wins, inter_wins, veteran_wins };
				})
			);
			return assets_info;
		};
		get_assets()
			.then((assets_info) => {
				if (mounted) SetAssets(assets_info);
			})
			.catch(() => {
				console.error("coulndt get asset");
			});
		return function cleanup() {
			mounted = false;
		};
	}, [race_progress]);

	return (
		<Box
			flexDirection="column"
			justifyContent="center"
			alignItems="flex-start"
			borderStyle="classic"
			borderColor="gray"
			flexShrink={0}
		>
			<Box alignSelf="center">
				<Text>{config.league}</Text>
			</Box>
			<Box flexDirection="row">
				{assets && assets.length > 0 ? (
					assets.map((asset, index) => (
						<Box
							flexDirection="column"
							borderStyle="single"
							borderColor="cyan"
							flexShrink={0}
							key={index}
						>
							<Box paddingBottom={0.4}>
								<Text>{asset.name}</Text>
							</Box>
							<Box>
								<Text>
									wins:{" "}
									{config.league === "rookie"
										? asset.rookie_wins
										: config.league === "inter"
										? asset.inter_wins
										: config.league === "veteran"
										? asset.veteran_wins
										: 0}
								</Text>
							</Box>
						</Box>
					))
				) : (
					<></>
				)}
			</Box>
		</Box>
	);
};

export default DisplayAssets;
