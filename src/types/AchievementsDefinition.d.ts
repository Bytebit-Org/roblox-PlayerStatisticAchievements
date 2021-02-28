import { StatisticsDefinition } from "@rbxts/player-statistics";
import { AchievementDescription } from "./AchievementDescription";

export type AchievementsDefinition<StatsDef extends StatisticsDefinition> = {
    readonly [key: string]: AchievementDescription<StatsDef>;
}