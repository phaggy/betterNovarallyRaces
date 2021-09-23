import {
  is_race_in_progress,
  get_race_results,
  get_player_info,
  get_snake_oil_balance,
} from "./services";
import { account } from "./config";
import race from "./race";

import { autoraceaction } from "./state";

(async () => {
  const console_args = process.argv;
  autoraceaction(
    "update",
    console_args.find((arg) => arg === "--autorace")
  );
  if (autoraceaction("get")) console.log("---auto race---");
  else console.log("---no-autorace---");

  let [player_info, race_progress, snake_oil_balance] = await Promise.all([
    get_player_info(account),
    is_race_in_progress(account),
    get_snake_oil_balance(account),
  ]);

  let daily_race_count = player_info.daily_race_count;
  let realtime_race_count = race_progress
    ? daily_race_count - 1
    : daily_race_count;

  console.log("Snake Oil: ", snake_oil_balance, "\n");
  console.log("daily race count: ", realtime_race_count);

  if (race_progress) console.log("one race in progress", "\n");

  const previous_results = await get_race_results(account);

  console.log(
    "today's race results:",
    previous_results.slice(0, realtime_race_count).map((race: any) => {
      if (race.position === 1) {
        return `${race.position}st`;
      } else if (race.position === 2) {
        return `${race.position}nd`;
      } else if (race.position === 3) {
        return `${race.position}rd`;
      } else return `${race.position}th`;
    }, "\n\n")
  );

  do {
    daily_race_count = await race(previous_results);
  } while (daily_race_count < 10 && autoraceaction("get"));
  {
  }

  if (daily_race_count === 10) {
    console.log("10 races limit reached, exiting");
  } else {
  }
})();
