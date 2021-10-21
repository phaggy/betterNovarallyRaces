import React, { FC } from "react";
import { Box, Text } from "ink";

const DisplayPrizes: FC<{
	pending_prizes: Array<any>;
}> = ({ pending_prizes }) => {
	let prizes_template = [
		{ prize: "Common character shard", id: "255777", count: 0 },
		{ prize: "Uncommon character shard", id: "255782", count: 0 },
		{ prize: "Rare character shard", id: "255785", count: 0 },
		{ prize: "Common car shard", id: "255783", count: 0 },
		{ prize: "Uncommon car shard", id: "255786", count: 0 },
		{ prize: "Rare car shard", id: "255787", count: 0 },
	];
	pending_prizes.map((prize_id) => {
		prizes_template = prizes_template.map((prize_obj) => {
			if (String(prize_id) === prize_obj.id)
				return { ...prize_obj, count: prize_obj.count + 1 };
			else return prize_obj;
		});
	});
	console.log(prizes_template);
	return (
		<>
			<Box marginLeft={4} padding={1}>
				<Text>
					Pending prizes: [
					{prizes_template.map(({ prize, count }, index) => {
						if (count > 0)
							return (
								<Text color="greenBright" key={index}>
									{" "}
									|{prize} x{count}|{" "}
								</Text>
							);
						else return <></>;
					})}
					]
				</Text>
			</Box>
		</>
	);
};

export default DisplayPrizes;
