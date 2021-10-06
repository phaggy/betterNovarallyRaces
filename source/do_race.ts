import {
  do_race,
  is_race_in_progress,
  get_player_info,
  get_race_results,
  sleep,
  get_people_in_queue,
} from "./services";

import {
  account,
  driver1_asset_id,
  driver2_asset_id,
  vehicle_asset_id,
} from "./config";

import ora from "ora";

const race = async (previous_results: Array<any>): Promise<number> => {
  let race_progress = await is_race_in_progress(account);
  let player_info = await get_player_info(account);
  let daily_race_count = player_info.daily_race_count;
  let people_in_queue;

  if (!race_progress && daily_race_count < 10) {
    console.log("trying to race");
    try {
      await do_race(
        account,
        vehicle_asset_id,
        driver1_asset_id,
        driver2_asset_id
      );
    } catch (err) {
      console.error("error trying to trx");
      process.exit();
    }
  }

  await sleep(2000);

  race_progress = await is_race_in_progress(account);
  const spinner = ora("Race in Progress").start();

  // console.log("");
  while (race_progress) {
    // spinner.color = "white";
    await sleep(2500);
    // spinner.color = "yellow";
    [race_progress, people_in_queue] = await Promise.all([
      is_race_in_progress(account),
      get_people_in_queue(),
    ]);
    spinner.text = `people in queue ${String(people_in_queue)}`;
    // process.stdout.write(people_in_queue + "\r");
  }
  spinner.stop();
  await sleep(500);

  // player_info updated here
  player_info = await get_player_info(account);
  // daily race count updated here
  daily_race_count = player_info.daily_race_count;

  const new_results = await get_race_results(account);
  const new_race_results = new_results[0];

  if (previous_results.length !== new_results.length) {
    console.log("\nRace Result:", new_race_results.position, "\n");
    console.log("daily race count:", daily_race_count);
    if (new_race_results.prize_template_id > 0)
      console.log("You won a prize, claim it");
  } else console.log("no new race");
  if (player_info.pending_prizes.length > 0)
    console.log("you have pending prizes: ", player_info.pending_prizes);

  return daily_race_count;
};

export default race;
