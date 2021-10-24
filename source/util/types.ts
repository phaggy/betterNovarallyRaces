interface player_info_balances_fuel_usage {
	snakeoil: string;
	snakegas: string;
	snakepow: string;
	snakeven: string;
}

interface player_info {
	last_played_date: number;
	daily_race_count: number;
	boost_balance: number;
	pending_prizes: Array<string>;
	balances: player_info_balances_fuel_usage;
	fuel_usage: player_info_balances_fuel_usage;
}

interface balance {
	balance: string;
}

interface info_results_batch {
	snake__balance: balance[];
	race_results: any[];
	player_info: player_info;
	daily_race_count: number;
	realtime_race_count: number;
	previous_results: any[];
	pending_prizes: any[];
	last_played_date: number;
}

interface running_batch {
	our_race_count: number;
	race_progress: boolean;
	people_in_queue: number;
}

export { player_info, balance, info_results_batch, running_batch };
