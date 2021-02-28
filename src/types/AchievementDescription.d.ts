import { StatisticsDefinition, StatisticsSnapshot } from "@rbxts/player-statistics";
import { IRewardsSelector } from "@rbxts/reward-containers";

/**
 * Describes a single statistics-based achievement
 */
export type AchievementDescription<StatsDef extends StatisticsDefinition> = {
	/**
	 * Given a snapshot of a player's statistics, should return a number in the range [0, 1]
	 * where 0 is no progress and 1 is complete, with floating-point numbers representing values in between.
	 */
	readonly getProgress: (statisticsSnapshot: StatisticsSnapshot<StatsDef>) => number;

	/**
	 * The list of statistic names that will cause this AchievementDescription
	 * to be checked for completion when they are updated for any given player.
	 */
	readonly relevantStatisticNames: ReadonlyArray<keyof StatsDef>;

	/**
	 * A rewards selector for giving out a specific reward to a player upon completing the achievement.
	 */
	readonly rewardsSelector: IRewardsSelector;
};
