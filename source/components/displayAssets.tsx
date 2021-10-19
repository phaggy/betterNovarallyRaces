import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import { atomicassetsApi } from "../util/services";
import { config } from "../cli";

const DisplayAssets: FC<{ config: config; race_progress: boolean }> = ({
	config,
	race_progress,
}) => {
	const [assets, SetAssets] = useState<undefined | any[]>(undefined);
	useEffect(() => {
		let mounted = true;
		const assets = [...config.drivers, ...config.vehicles];
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
			console.log(assets_info);
			return assets_info;
		};
		if (mounted)
			get_assets().then((assets_info) => {
				SetAssets(assets_info);
			});
		return function cleanup() {
			mounted = false;
		};
	}, [race_progress]);

	return (
		<Box>
			{assets && assets.length > 0 ? (
				assets.map((asset, index) => (
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="blue"
						key={index}
					>
						<Box>
							<Text>{asset.name}</Text>
						</Box>
						<Box>
							<Text>League: {asset.league}</Text>
						</Box>
						<Box>
							<Text>
								wins:{" "}
								{asset.league === "Rookie"
									? asset.rookie_wins
									: asset.league === "Intermediate"
									? asset.inter_wins
									: asset.league === "Veteran"
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
	);
};

export default DisplayAssets;
