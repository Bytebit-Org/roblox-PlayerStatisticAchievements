import { StatisticsDefinition } from "@rbxts/player-statistics";
import { AchievementDescription } from "./AchievementDescription";

/**
 * Defines a set of statistics-based achievements keyed by their string name
 */
export type AchievementsDefinition<StatsDef extends StatisticsDefinition> = {
	readonly [key: string]: AchievementDescription<StatsDef>;
};
