const last_played_date = new Date(1633322000 * 1000);
const date_now = new Date();

const milliseconds_since_last_played =
	date_now.getTime() - last_played_date.getTime();

console.log(milliseconds_since_last_played);

const total_seconds = parseInt(
	Math.floor(milliseconds_since_last_played / 1000)
);
const total_minutes = parseInt(Math.floor(total_seconds / 60));
const total_hours = parseInt(Math.floor(total_minutes / 60));
const days = parseInt(Math.floor(total_hours / 24));
