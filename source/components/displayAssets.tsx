import React, { FC, useEffect, useState } from "react";
import { Box, Text } from "ink";
import { atomicassetsApi } from "../util/services";
import { config } from "../cli";

const DisplayAssets: FC<{ config: config }> = ({ config }) => {
	const [assets, SetAssets] = useState<undefined | any[]>(undefined);
	useEffect(() => {
		let mounted = true;
		const assets = [...config.drivers, ...config.vehicles];
		const get_assets = async () => {
			const assets_info = await Promise.all(
				assets.map(async (asset_id) => {
					const result = await atomicassetsApi.getAsset(asset_id);
					const { name, data } = result;
					return { name, data };
				})
			);
			console.log(assets_info);
			SetAssets(assets_info);
		};
		if (mounted) get_assets();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<Box>
			{assets && assets.length > 0 ? (
				assets.map((asset, index) => (
					<Box borderStyle="round" borderColor="green" key={index}>
						<Text>{asset.name}</Text>
					</Box>
				))
			) : (
				<></>
			)}
		</Box>
	);
};

export default DisplayAssets;
