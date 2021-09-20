import {
  do_race,
  is_race_in_progress,
  get_race_results,
  get_player_info,
} from "./services";
import {
  account,
  driver1_asset_id,
  driver2_asset_id,
  vehicle_asset_id,
} from "./config";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const player_info = await get_player_info(account);
  let daily_race_count = player_info[0].daily_race_count;

  console.log("daily race count: ", daily_race_count);

  const previous_results = await get_race_results(account);
  console.log(
    "today's race results:",
    previous_results.slice(0, daily_race_count).map((race: any) => {
      if (race.position === 1) {
        return `${race.position}st`;
      } else if (race.position === 2) {
        return `${race.position}nd`;
      } else if (race.position === 3) {
        return `${race.position}rd`;
      } else return `${race.position}th`;
    })
  );

  if (daily_race_count === 10) {
    console.log("10 races limit reached, exiting");
  } else {
    while (daily_race_count < 10) {
      let race_progress = await is_race_in_progress(account);

      if (!race_progress) {
        console.log("trying to race");
        try {
          await do_race(
            account,
            vehicle_asset_id,
            driver1_asset_id,
            driver2_asset_id
          );
        } catch (err) {
          console.error("error trying do trx");
          process.exit();
        }
      } else console.log("race is in progress");

      await sleep(2000);

      race_progress = await is_race_in_progress(account);

      console.log("");
      while (race_progress) {
        process.stdout.write("Race is in progress, pls wait" + "\r");
        await sleep(1000);
        process.stdout.write("Race is in progress, pls wait." + "\r");
        await sleep(1000);
        process.stdout.write("Race is in progress, pls wait.." + "\r");
        await sleep(1000);
        process.stdout.write("Race is in progress, pls wait..." + "\r");
        race_progress = await is_race_in_progress(account);
        process.stdout.write("                                " + "\r");
      }

      const new_results = await get_race_results(account);
      // daily race count updated here
      daily_race_count = player_info[0].daily_race_count;
      const new_race_results = new_results[0];

      if (previous_results.length !== new_results.length) {
        console.log("Race Result:", new_race_results.position);
        console.log("daily race count:", daily_race_count);
        if (new_race_results.prize_template_id > 0)
          console.log("You won a prize, claim it");
      } else console.log("no new race");
    }
  }
})();
