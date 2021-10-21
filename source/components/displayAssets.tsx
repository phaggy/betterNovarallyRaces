import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import { atomicassetsApi } from "../util/services";
import { config } from "../cli";

const DisplayAssets: FC<{
	config: config;
	race_progress: boolean;
	mounted: boolean;
}> = ({ config, race_progress, mounted }) => {
	console.log({ mounted });

	const [assets, SetAssets] = useState<undefined | any[]>(undefined);
	useEffect(() => {
		let assets: string[] = [];
		if (config.to_inter && config.inter) {
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
			console.log(assets_info);
			return assets_info;
		};
		get_assets()
			.then((assets_info) => {
				if (mounted) SetAssets(assets_info);
			})
			.catch(() => {
				console.error("coulndt get asset");
			});
		// return function cleanup() {
		// 	mounted = false;
		// };
	}, [race_progress]);

	return (
		<Box
			flexDirection="row"
			justifyContent="center"
			alignItems="flex-start"
			borderStyle="single"
			borderColor="gray"
		>
			{assets && assets.length > 0 ? (
				assets.map((asset, index) => (
					<Box
						flexDirection="column"
						borderStyle="classic"
						borderColor="cyan"
						key={index}
					>
						<Box>
							<Text>{asset.league}</Text>
						</Box>
						<Box>
							<Text>-------</Text>
						</Box>

						<Box>
							<Text>{asset.name}</Text>
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
