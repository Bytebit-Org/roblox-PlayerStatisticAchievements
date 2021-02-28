import { IDestroyable } from "@rbxts/dumpster";
import { StatisticsDefinition } from "@rbxts/player-statistics";
import { Reward } from "@rbxts/reward-containers";
import { IReadOnlySignal } from "@rbxts/signals-tooling";
import { AchievementsDefinition } from "types/AchievementsDefinition";

export interface IPlayerStatisticAchievementsManager<
	StatsDef extends StatisticsDefinition,
	AchvmtsDef extends AchievementsDefinition<StatsDef>
> extends IDestroyable {
	/**
	 * Fired when an achievement is completed by a player
	 * @argument player The player that completed the achievement
	 * @argument achievementName The name of the achievement that the player completed
	 */
	readonly achievementCompleted: IReadOnlySignal<(player: Player, achievementName: keyof AchvmtsDef) => void>;

	/**
	 * Fired when an achievement is completed by a player and their reward has finished granting
	 * @argument player The player that completed the achievement
	 * @argument achievementName The name of the achievement that the player completed
	 * @argument rewards The rewards that were granted to the player
	 */
	readonly achievementRewardGranted: IReadOnlySignal<
		(player: Player, achievementName: keyof AchvmtsDef, rewards: ReadonlyArray<Reward>) => void
	>;

	/**
	 * Gets the progress a specific player has made for a given achievement.
	 * Progress will be returned as a number between 0 and 1, where 0 is no progress and 1 is complete.
	 * @param achievementName The name of the achievement to check
	 * @param player The player
	 */
	getProgressOnAchievementForPlayer(achievementName: keyof AchvmtsDef, player: Player): number;
}
