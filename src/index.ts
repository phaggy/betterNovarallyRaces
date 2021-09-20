import {
  do_race,
  is_race_in_progress,
  get_race_results,
  get_player_info,
  get_snake_oil_balance,
} from "./services";
import {
  account,
  driver1_asset_id,
  driver2_asset_id,
  vehicle_asset_id,
} from "./config";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  let [player_info, race_progress, snake_oil_balance] = await Promise.all([
    get_player_info(account),
    is_race_in_progress(account),
    get_snake_oil_balance(account),
  ]);

  let daily_race_count = player_info.daily_race_count;
  let realtime_race_count = race_progress
    ? daily_race_count - 1
    : daily_race_count;

  console.log("Snake Oil: ", snake_oil_balance);
  console.log("daily race count: ", realtime_race_count);

  if (race_progress) console.log("one race in progress");

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
    })
  );

  if (daily_race_count === 10) {
    console.log("10 races limit reached, exiting");
  } else {
    while (daily_race_count < 10) {
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
      }

      await sleep(2000);

      race_progress = await is_race_in_progress(account);

      console.log("");
      while (race_progress) {
        process.stdout.write("Race is in progress, pls wait" + "\r");
        await sleep(2000);
        process.stdout.write("Race is in progress, pls wait." + "\r");
        await sleep(2000);
        process.stdout.write("Race is in progress, pls wait.." + "\r");
        await sleep(2000);
        process.stdout.write("Race is in progress, pls wait..." + "\r");
        race_progress = await is_race_in_progress(account);
        process.stdout.write("                                " + "\r");
      }

      await sleep(1000);

      // player_info updated here
      const [player_info, new_results] = await Promise.all([
        get_player_info(account),
        get_race_results(account),
      ]);
      // daily race count updated here
      daily_race_count = player_info.daily_race_count;
      const new_race_results = new_results[0];

      console.log({ prev: previous_results[0] });
      console.log({ new: new_results[0] });

      console.log(
        { prev: previous_results.length },
        { new: new_results.length }
      );

      if (previous_results.length !== new_results.length) {
        console.log("Race Result:", new_race_results.position);
        console.log("daily race count:", daily_race_count);
        if (new_race_results.prize_template_id > 0)
          console.log("You won a prize, claim it");
      } else console.log("no new race");
      if (player_info.pending_prizes.length > 0)
        console.log(
          "you have pending pending_prizes: ",
          player_info.pending_prizes
        );
    }
  }
})();
