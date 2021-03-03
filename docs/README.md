@rbxts/player-statistic-achievements

# @rbxts/player-statistic-achievements

## Table of contents

### Classes

- [PlayerStatisticAchievementsManager](classes/playerstatisticachievementsmanager.md)

### Interfaces

- [IPlayerStatisticAchievementsManager](interfaces/iplayerstatisticachievementsmanager.md)

### Type aliases

- [AchievementDescription](README.md#achievementdescription)
- [AchievementsDefinition](README.md#achievementsdefinition)

## Type aliases

### AchievementDescription

Ƭ **AchievementDescription**<StatsDef\>: *object*

Describes a single statistics-based achievement

#### Type parameters:

Name | Type |
:------ | :------ |
`StatsDef` | StatisticsDefinition |

#### Type declaration:

Name | Type | Description |
:------ | :------ | :------ |
`getProgress` | (`statisticsSnapshot`: *StatisticsSnapshot*<StatsDef\>) => *number* | Given a snapshot of a player's statistics, should return a number in the range [0, 1] where 0 is no progress and 1 is complete, with floating-point numbers representing values in between.   |
`relevantStatisticNames` | *ReadonlyArray*<keyof StatsDef\> | The list of statistic names that will cause this AchievementDescription to be checked for completion when they are updated for any given player.   |
`rewardsSelector` | IRewardsSelector | A rewards selector for giving out a specific reward to a player upon completing the achievement.   |

Defined in: [src/types/AchievementDescription.d.ts:7](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/aa801df/src/types/AchievementDescription.d.ts#L7)

___

### AchievementsDefinition

Ƭ **AchievementsDefinition**<StatsDef\>: *object*

Defines a set of statistics-based achievements keyed by their string name

#### Type parameters:

Name | Type |
:------ | :------ |
`StatsDef` | StatisticsDefinition |

#### Type declaration:

Defined in: [src/types/AchievementsDefinition.d.ts:7](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/aa801df/src/types/AchievementsDefinition.d.ts#L7)
