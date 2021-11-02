# Player Statistic Achievements
<p align="center">
	<a href="https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/actions">
        <img src="https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/workflows/CI/badge.svg" alt="CI status" />
    </a>
	<a href="http://makeapullrequest.com">
		<img src="https://img.shields.io/badge/PRs-welcome-blue.svg" alt="PRs Welcome" />
	</a>
	<a href="https://opensource.org/licenses/MIT">
		<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
	</a>
	<a href="https://discord.gg/QEz3v8y">
		<img src="https://img.shields.io/badge/discord-join-7289DA.svg?logo=discord&longCache=true&style=flat" alt="Discord server" />
	</a>
</p>

Player Statistic Achievements is a package for Roblox game developers. This package is tightly coupled with [Player Statistics](https://github.com/Bytebit-Org/roblox-PlayerStatistics) and [Reward Containers](https://github.com/Bytebit-Org/roblox-RewardContainers).
Define your game's statistics (for [Player Statistics](https://github.com/Bytebit-Org/roblox-PlayerStatistics)) and achievements just using three simple definition files and initialize the `PlayerStatisticAchievementsManager`. The manager will handle the rest! If you want to add specific logic when achievements are awarded, there are signals to listen to in order to do so.

## Installation
### roblox-ts
Simply install to your [roblox-ts](https://roblox-ts.com/) project as follows:
```
npm i @rbxts/player-statistic-achievements
```

### Wally
[Wally](https://github.com/UpliftGames/wally/) users can install this package by adding the following line to their `Wally.toml` under `[dependencies]`:
```
PlayerStatisticAchievements = "bytebit/player-statistic-achievements@1.0.2"
```

Then just run `wally install`.

### From model file
Model files are uploaded to every release as `.rbxmx` files. You can download the file from the [Releases page](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/releases) and load it into your project however you see fit.

### From model asset
New versions of the asset are uploaded with every release. The asset can be added to your Roblox Inventory and then inserted into your Place via Toolbox by getting it [here.](https://www.roblox.com/library/7876338306/Player-Statistic-Achievements-Package)

## Documentation
Documentation can be found [here](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/tree/master/docs), is included in the TypeScript files directly, and was generated using [TypeDoc](https://typedoc.org/).

## Example
Let's create a simple example where we will grant players a badge when they hit a high score of at least 1,000 points. We'll first need to write the player statistics definition and player statistic events definition (for [Player Statistics](https://github.com/Bytebit-Org/roblox-PlayerStatistics)), like so:

```ts
import { StatisticDefinition, StandardStatisticUpdateFunctions } from "@rbxts/player-statistics";

export const PlayerStatisticsDefinition = {
    highScore: identity<StatisticDescription>({
        defaultValue: 0,
        updateFunction: math.max,
    }),
};

export const PlayerStatisticEventsDefinition = {
    gameCompleted: identity<ReadonlyArray<typeof PlayerStatisticsDefinition>>([
        "highScore",
    ]),
};
```

With that, we can define our achievements definition. Each achievement is described by the list of player statistic names that can trigger it to be awarded, a function that computes the progress the player has made on a scale of [0, 1], where 0 is no progress and 1 is complete, and the rewards selector (from [Reward Containers](https://github.com/Bytebit-Org/roblox-RewardContainers)) for when the player completes the achievement. In this case, since players can't really make progress but only have a yes/no answer for whether they've achieved the high score, we'll keep the progress function as a binary 0 or 1 response. For things like "Defeat 100 zombies", it would be trivial to write a progress function of `math.min(1, numZombiesDefeated / 100)` instead. We also only care about the `highScore` statistic, and for now we'll just grant the user a badge for their accomplishment. Here's how we can write that definition:

```ts
import { BadgeReward, ConstantRewardsSelector } from "@rbxts/reward-containers";
import { AchievementDescription } from "@rbxts/player-statistic-achievements";

export const PlayerStatisticAchievementsDefinition = {
    highScoreOf100: identity<AchievementDescription>({
        getProgress: (statisticsSnapshot) => statisticsSnapshot.highScore >= 100 ? 1 : 0,
        relevantStatisticNames: ["highScore"],
        rewardsSelector: ConstantRewardsSelector.create([
            identity<BadgeReward>({
                type: "Badge",
                badgeId: 67997,
            }),
        ]),
    }),
};
```

Now all of our definitions are done! It is now as easy as just initializing a `PlayerStatisticAchievementsManager` in our game's server-side bootstrapping code. Here's an example:

```ts
import { DataStoreService } from "@rbxts/services";
import { DataStorePlayerStatisticsPersistenceLayer, PlayerStatisticsProvider } from "@rbxts/player-statistics";
import { PlayerStatisticAchievementsDefinition, PlayerStatisticEventsDefinition, PlayerStatisticsDefinition } from "./data/Definitions";

// PlayerStatisticAchievementsManager needs an instance of IPlayerStatisticsReader,
// so we'll create a PlayerStatisticsProvider from @rbxts/player-statistics for that
const playerStatisticsDataStore = DataStoreService.GetDataStore("PlayerStatistics");
const playerStatisticsPersistenceLayer = DataStorePlayerStatisticsPersistenceLayer.create(playerStatisticsDataStore);
const playerStatisticsProvider = PlayerStatisticsProvider.create(
    PlayerStatisticEventsDefinition,
    playerStatisticsPersistenceLayer,
    PlayerStatisticsDefinition
);

// We'll also need to create our reward granters by their reward type.
// In this example, that's just a granter for badge rewards.
const rewardGrantersByRewardType = new Map([["Badge", BadgeRewardGranter.create()]]);

// And now we actually create the PlayerStatisticAchievementsManager instance
const playerStatisticAchievementsManager = PlayerStatisticAchievementsManager.create(
    PlayerStatisticAchievementsDefinition,
    rewardGrantersByRewardType,
    playerStatisticsProvider,
);
```

There we go! It is all set up! Now, when we record a player statistics event and the player achieves a high score of 100 or more for the first time, they'll be given their reward! Here's an example of how to do that:

```ts
playerStatisticsProvider.recordEvent(player, "gameCompleted", playerScore);
```

And done! Make your players feel accomplished just like that!!
